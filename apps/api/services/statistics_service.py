from datetime import datetime, timedelta
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from models.token_usage import TokenUsage
from models.agent import AgentConfig
from models.task import TaskRecord
from schemas.statistics import (
    AgentRankingItem,
    AgentRankingResponse,
    TrendPrediction,
    TrendPredictionResponse,
    AnomalyRecord,
    AnomalyListResponse,
)
from typing import Literal
import statistics


class StatisticsService:
    async def get_agent_ranking(
        self,
        db: AsyncSession,
        sort_by: Literal["total_tokens", "call_count", "avg_tokens", "growth_rate"] = "total_tokens",
        time_range: Literal["today", "week", "month", "all"] = "all",
        limit: int = 10,
    ) -> AgentRankingResponse:
        now = datetime.utcnow()
        time_filters = {
            "today": now.replace(hour=0, minute=0, second=0, microsecond=0),
            "week": now - timedelta(days=7),
            "month": now - timedelta(days=30),
            "all": None,
        }
        start_time = time_filters[time_range]

        query = select(
            TokenUsage.agent_id,
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
            func.sum(TokenUsage.prompt_tokens).label("prompt_tokens"),
            func.sum(TokenUsage.completion_tokens).label("completion_tokens"),
            func.count(TokenUsage.usage_id).label("call_count"),
        ).group_by(TokenUsage.agent_id)

        if start_time:
            query = query.where(TokenUsage.create_time >= start_time)

        result = await db.execute(query)
        rows = result.all()

        agent_ids = [row.agent_id for row in rows]
        agents_result = await db.execute(select(AgentConfig).where(AgentConfig.agent_id.in_(agent_ids)))
        agents = {a.agent_id: a for a in agents_result.scalars().all()}

        growth_rates = {}
        if sort_by == "growth_rate" and time_range in ["week", "month"]:
            growth_rates = await self._calculate_growth_rates(db, time_range)

        ranking_data = []
        for row in rows:
            agent = agents.get(row.agent_id)
            avg_tokens = row.total_tokens / row.call_count if row.call_count > 0 else 0

            ranking_data.append({
                "agent_id": row.agent_id,
                "agent_name": agent.agent_name if agent else "Unknown",
                "agent_type": agent.agent_type if agent else "Unknown",
                "total_tokens": row.total_tokens or 0,
                "call_count": row.call_count or 0,
                "avg_tokens_per_call": round(avg_tokens, 2),
                "growth_rate": growth_rates.get(row.agent_id),
            })

        if sort_by == "avg_tokens":
            ranking_data.sort(key=lambda x: x["avg_tokens_per_call"], reverse=True)
        elif sort_by == "growth_rate":
            ranking_data.sort(key=lambda x: x["growth_rate"] or 0, reverse=True)
        else:
            ranking_data.sort(key=lambda x: x[sort_by], reverse=True)

        ranking_data = ranking_data[:limit]

        for i, item in enumerate(ranking_data, 1):
            item["rank"] = i

        ranking_items = [AgentRankingItem(**item) for item in ranking_data]

        return AgentRankingResponse(
            ranking=ranking_items,
            time_range=time_range,
            sort_by=sort_by,
        )

    async def _calculate_growth_rates(self, db: AsyncSession, time_range: str) -> dict[int, float]:
        now = datetime.utcnow()

        if time_range == "week":
            current_start = now - timedelta(days=7)
            previous_start = now - timedelta(days=14)
            previous_end = current_start
        else:
            current_start = now - timedelta(days=30)
            previous_start = now - timedelta(days=60)
            previous_end = current_start

        current_query = select(
            TokenUsage.agent_id,
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
        ).where(TokenUsage.create_time >= current_start).group_by(TokenUsage.agent_id)
        current_result = await db.execute(current_query)
        current_data = {row.agent_id: row.total_tokens for row in current_result.all()}

        previous_query = select(
            TokenUsage.agent_id,
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
        ).where(
            and_(TokenUsage.create_time >= previous_start, TokenUsage.create_time < previous_end)
        ).group_by(TokenUsage.agent_id)
        previous_result = await db.execute(previous_query)
        previous_data = {row.agent_id: row.total_tokens for row in previous_result.all()}

        growth_rates = {}
        for agent_id, current_tokens in current_data.items():
            previous_tokens = previous_data.get(agent_id, 0)
            if previous_tokens > 0:
                growth_rates[agent_id] = round((current_tokens - previous_tokens) / previous_tokens * 100, 2)
            else:
                growth_rates[agent_id] = None

        return growth_rates

    async def get_trend_prediction(
        self,
        db: AsyncSession,
        days: int = 30,
        agent_id: int | None = None,
    ) -> TrendPredictionResponse:
        now = datetime.utcnow()
        historical_days = min(days, 30)
        start_date = now - timedelta(days=historical_days - 1)

        query = select(
            func.date(TokenUsage.create_time).label("date"),
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
        ).where(TokenUsage.create_time >= start_date.replace(hour=0, minute=0, second=0, microsecond=0))

        if agent_id:
            query = query.where(TokenUsage.agent_id == agent_id)

        query = query.group_by(func.date(TokenUsage.create_time)).order_by(func.date(TokenUsage.create_time))

        result = await db.execute(query)
        rows = result.all()

        historical_data = {}
        for row in rows:
            date_str = str(row.date)
            historical_data[date_str] = row.total_tokens or 0

        trend = []
        for i in range(historical_days):
            date = (start_date + timedelta(days=i)).date()
            date_str = date.strftime("%Y-%m-%d")
            trend.append(TrendPrediction(
                date=date.strftime("%m-%d"),
                actual_tokens=historical_data.get(date_str, 0),
                predicted_tokens=None,
                is_prediction=False,
            ))

        token_values = [t.actual_tokens for t in trend if t.actual_tokens is not None]

        if len(token_values) >= 3:
            x = list(range(len(token_values)))
            y = token_values

            n = len(x)
            sum_x = sum(x)
            sum_y = sum(y)
            sum_xy = sum(xi * yi for xi, yi in zip(x, y))
            sum_x2 = sum(xi ** 2 for xi in x)

            slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
            intercept = (sum_y - slope * sum_x) / n

            prediction_days = days - historical_days
            for i in range(prediction_days):
                future_x = len(token_values) + i
                predicted_value = max(0, int(slope * future_x + intercept))
                future_date = (now + timedelta(days=i + 1)).date()
                trend.append(TrendPrediction(
                    date=future_date.strftime("%m-%d"),
                    actual_tokens=None,
                    predicted_tokens=predicted_value,
                    is_prediction=True,
                ))

            if len(token_values) > 1:
                predicted_values = [slope * i + intercept for i in range(len(token_values))]
                residuals = [abs(actual - predicted) for actual, predicted in zip(token_values, predicted_values)]
                mean_residual = statistics.mean(residuals)
                mean_tokens = statistics.mean(token_values)
                confidence = max(0, min(1, 1 - (mean_residual / mean_tokens if mean_tokens > 0 else 0)))
            else:
                confidence = 0.5
        else:
            confidence = 0.3
            last_value = token_values[-1] if token_values else 0
            prediction_days = days - historical_days
            for i in range(prediction_days):
                future_date = (now + timedelta(days=i + 1)).date()
                trend.append(TrendPrediction(
                    date=future_date.strftime("%m-%d"),
                    actual_tokens=None,
                    predicted_tokens=last_value,
                    is_prediction=True,
                ))

        if len(token_values) >= 2:
            recent_avg = statistics.mean(token_values[-7:]) if len(token_values) >= 7 else statistics.mean(token_values)
            earlier_avg = statistics.mean(token_values[:7]) if len(token_values) >= 7 else token_values[0]

            if recent_avg > earlier_avg * 1.1:
                growth_trend = "increasing"
            elif recent_avg < earlier_avg * 0.9:
                growth_trend = "decreasing"
            else:
                growth_trend = "stable"
        else:
            growth_trend = "stable"

        return TrendPredictionResponse(
            trend=trend,
            prediction_confidence=round(confidence, 2),
            growth_trend=growth_trend,
        )

    async def detect_anomalies(
        self,
        db: AsyncSession,
        days: int = 7,
        severity: Literal["all", "low", "medium", "high"] = "all",
    ) -> AnomalyListResponse:
        now = datetime.utcnow()
        start_time = now - timedelta(days=days)

        anomalies = []

        high_single_call_anomalies = await self._detect_high_single_call(db, start_time)
        anomalies.extend(high_single_call_anomalies)

        frequency_anomalies = await self._detect_high_frequency(db, start_time)
        anomalies.extend(frequency_anomalies)

        spike_anomalies = await self._detect_sudden_changes(db, days)
        anomalies.extend(spike_anomalies)

        if severity != "all":
            anomalies = [a for a in anomalies if a.severity == severity]

        anomalies.sort(key=lambda x: x.detected_time, reverse=True)

        high_severity_count = sum(1 for a in anomalies if a.severity == "high")

        return AnomalyListResponse(
            anomalies=anomalies,
            total_count=len(anomalies),
            high_severity_count=high_severity_count,
        )

    async def _detect_high_single_call(self, db: AsyncSession, start_time: datetime) -> list[AnomalyRecord]:
        query = select(TokenUsage).where(TokenUsage.create_time >= start_time)
        result = await db.execute(query)
        usages = result.scalars().all()

        if not usages:
            return []

        token_values = [u.total_tokens for u in usages]
        mean_tokens = statistics.mean(token_values)
        stdev_tokens = statistics.stdev(token_values) if len(token_values) > 1 else 0

        threshold = mean_tokens + 3 * stdev_tokens if stdev_tokens > 0 else mean_tokens * 3

        anomalies = []
        for usage in usages:
            if usage.total_tokens > threshold:
                agent_result = await db.execute(
                    select(AgentConfig).where(AgentConfig.agent_id == usage.agent_id)
                )
                agent = agent_result.scalar_one_or_none()

                severity = "high" if usage.total_tokens > threshold * 2 else "medium"

                anomalies.append(AnomalyRecord(
                    anomaly_id=f"high_single_{usage.usage_id}",
                    anomaly_type="high_single_call",
                    agent_id=usage.agent_id,
                    agent_name=agent.agent_name if agent else "Unknown",
                    task_id=usage.task_id,
                    detected_time=usage.create_time,
                    details={
                        "token_count": usage.total_tokens,
                        "threshold": round(threshold, 2),
                        "ratio": round(usage.total_tokens / threshold, 2),
                    },
                    severity=severity,
                ))

        return anomalies

    async def _detect_high_frequency(self, db: AsyncSession, start_time: datetime) -> list[AnomalyRecord]:
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)

        query = select(
            TokenUsage.agent_id,
            func.count(TokenUsage.usage_id).label("call_count"),
        ).where(TokenUsage.create_time >= one_hour_ago).group_by(TokenUsage.agent_id)

        result = await db.execute(query)
        rows = result.all()

        anomalies = []
        frequency_threshold = 50

        for row in rows:
            if row.call_count > frequency_threshold:
                agent_result = await db.execute(
                    select(AgentConfig).where(AgentConfig.agent_id == row.agent_id)
                )
                agent = agent_result.scalar_one_or_none()

                severity = "high" if row.call_count > frequency_threshold * 2 else "medium"

                anomalies.append(AnomalyRecord(
                    anomaly_id=f"high_freq_{row.agent_id}_{int(datetime.utcnow().timestamp())}",
                    anomaly_type="high_frequency",
                    agent_id=row.agent_id,
                    agent_name=agent.agent_name if agent else "Unknown",
                    task_id=None,
                    detected_time=datetime.utcnow(),
                    details={
                        "call_count_last_hour": row.call_count,
                        "threshold": frequency_threshold,
                        "time_window": "1 hour",
                    },
                    severity=severity,
                ))

        return anomalies

    async def _detect_sudden_changes(self, db: AsyncSession, days: int) -> list[AnomalyRecord]:
        now = datetime.utcnow()

        daily_stats = []
        for i in range(days):
            date = now - timedelta(days=i)
            start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end = start + timedelta(days=1)

            query = select(
                TokenUsage.agent_id,
                func.sum(TokenUsage.total_tokens).label("total_tokens"),
            ).where(
                and_(TokenUsage.create_time >= start, TokenUsage.create_time < end)
            ).group_by(TokenUsage.agent_id)

            result = await db.execute(query)
            rows = result.all()

            for row in rows:
                daily_stats.append({
                    "agent_id": row.agent_id,
                    "date": date.date(),
                    "tokens": row.total_tokens or 0,
                })

        agent_daily = {}
        for stat in daily_stats:
            agent_id = stat["agent_id"]
            if agent_id not in agent_daily:
                agent_daily[agent_id] = []
            agent_daily[agent_id].append(stat)

        anomalies = []
        for agent_id, stats in agent_daily.items():
            if len(stats) < 2:
                continue

            stats.sort(key=lambda x: x["date"], reverse=True)

            for i in range(len(stats) - 1):
                current = stats[i]
                previous = stats[i + 1]

                if previous["tokens"] == 0:
                    continue

                change_rate = (current["tokens"] - previous["tokens"]) / previous["tokens"]

                if abs(change_rate) > 0.5:
                    agent_result = await db.execute(
                        select(AgentConfig).where(AgentConfig.agent_id == agent_id)
                    )
                    agent = agent_result.scalar_one_or_none()

                    anomaly_type = "sudden_spike" if change_rate > 0 else "sudden_drop"
                    severity = "high" if abs(change_rate) > 1.0 else "medium" if abs(change_rate) > 0.7 else "low"

                    anomalies.append(AnomalyRecord(
                        anomaly_id=f"{anomaly_type}_{agent_id}_{current['date']}",
                        anomaly_type=anomaly_type,
                        agent_id=agent_id,
                        agent_name=agent.agent_name if agent else "Unknown",
                        task_id=None,
                        detected_time=datetime.combine(current["date"], datetime.min.time()),
                        details={
                            "current_tokens": current["tokens"],
                            "previous_tokens": previous["tokens"],
                            "change_rate": round(change_rate * 100, 2),
                        },
                        severity=severity,
                    ))

        return anomalies


statistics_service = StatisticsService()
