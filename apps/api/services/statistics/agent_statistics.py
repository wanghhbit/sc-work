from datetime import datetime, timedelta
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from models.token_usage import TokenUsage
from models.agent import AgentConfig
from models.task import TaskRecord
from schemas.stats import (
    OverviewResponse,
    TrendItem,
    TrendResponse,
    RankingItem,
    RankingResponse,
    AnomalyItem,
    AnomalyResponse,
)
from .base import BaseStatisticsService, TimeRange, Granularity
from .time_utils import get_time_range_start, get_granularity_format
from .trend_analyzer import trend_analyzer
from .anomaly_detector import anomaly_detector
from typing import Literal
import statistics


class AgentStatisticsService(BaseStatisticsService):
    async def get_overview(self, db: AsyncSession, time_range: TimeRange) -> dict:
        start_time = get_time_range_start(time_range)

        total_agents_query = select(func.count(func.distinct(TokenUsage.agent_id)))
        if start_time:
            total_agents_query = total_agents_query.where(TokenUsage.create_time >= start_time)
        total_agents = (await db.execute(total_agents_query)).scalar() or 0

        total_tokens_query = select(func.sum(TokenUsage.total_tokens))
        if start_time:
            total_tokens_query = total_tokens_query.where(TokenUsage.create_time >= start_time)
        total_tokens = (await db.execute(total_tokens_query)).scalar() or 0

        total_calls_query = select(func.count(TokenUsage.usage_id))
        if start_time:
            total_calls_query = total_calls_query.where(TokenUsage.create_time >= start_time)
        total_calls = (await db.execute(total_calls_query)).scalar() or 0

        avg_tokens = total_tokens / total_calls if total_calls > 0 else 0

        top_agent_query = (
            select(
                TokenUsage.agent_id,
                func.sum(TokenUsage.total_tokens).label("total_tokens"),
            )
            .group_by(TokenUsage.agent_id)
            .order_by(func.sum(TokenUsage.total_tokens).desc())
            .limit(1)
        )
        if start_time:
            top_agent_query = top_agent_query.where(TokenUsage.create_time >= start_time)

        top_agent_result = await db.execute(top_agent_query)
        top_agent_row = top_agent_result.first()

        top_agent = None
        if top_agent_row:
            agent_result = await db.execute(
                select(AgentConfig).where(AgentConfig.agent_id == top_agent_row.agent_id)
            )
            agent = agent_result.scalar_one_or_none()
            top_agent = {
                "agent_id": top_agent_row.agent_id,
                "agent_name": agent.agent_name if agent else "Unknown",
                "total_tokens": top_agent_row.total_tokens or 0,
            }

        return {
            "total_agents": total_agents,
            "total_tokens": total_tokens,
            "total_calls": total_calls,
            "avg_tokens_per_call": round(avg_tokens, 2),
            "top_agent": top_agent,
        }

    async def get_trend(
        self,
        db: AsyncSession,
        time_range: TimeRange,
        granularity: Granularity,
        agent_id: int | None = None,
    ) -> TrendResponse:
        start_time = get_time_range_start(time_range)
        time_format = get_granularity_format(granularity)

        query = select(
            func.strftime(time_format, TokenUsage.create_time).label("time_bucket"),
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
            func.count(TokenUsage.usage_id).label("call_count"),
        ).where(TokenUsage.create_time >= start_time)

        if agent_id:
            query = query.where(TokenUsage.agent_id == agent_id)

        query = query.group_by("time_bucket").order_by("time_bucket")

        result = await db.execute(query)
        rows = result.all()

        trend = [
            TrendItem(
                time=row.time_bucket,
                total_tokens=row.total_tokens or 0,
                call_count=row.call_count or 0,
            )
            for row in rows
        ]

        if len(trend) >= 3:
            historical_data = [t.total_tokens for t in trend]
            predictions, confidence = trend_analyzer.linear_regression_predict(
                historical_data, predict_days=7
            )

            prediction_trend = []
            for i, pred_value in enumerate(predictions):
                future_time = datetime.utcnow() + timedelta(days=i + 1)
                prediction_trend.append(
                    TrendItem(
                        time=future_time.strftime(time_format),
                        total_tokens=int(pred_value),
                        call_count=0,
                    )
                )

            growth_trend = trend_analyzer.detect_trend_direction(historical_data)
        else:
            prediction_trend = None
            confidence = None
            growth_trend = "stable"

        return TrendResponse(
            trend=trend,
            prediction=prediction_trend,
            confidence=round(confidence, 2) if confidence else None,
            growth_trend=growth_trend,
        )

    async def get_ranking(
        self,
        db: AsyncSession,
        time_range: TimeRange,
        sort_by: Literal["total_tokens", "call_count", "avg_tokens"] = "total_tokens",
        limit: int = 10,
    ) -> RankingResponse:
        start_time = get_time_range_start(time_range)

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

        ranking_data = []
        for row in rows:
            agent = agents.get(row.agent_id)
            avg_tokens = row.total_tokens / row.call_count if row.call_count > 0 else 0

            ranking_data.append({
                "agent_id": row.agent_id,
                "agent_name": agent.agent_name if agent else "Unknown",
                "total_tokens": row.total_tokens or 0,
                "call_count": row.call_count or 0,
                "avg_tokens": round(avg_tokens, 2),
            })

        if sort_by == "avg_tokens":
            ranking_data.sort(key=lambda x: x["avg_tokens"], reverse=True)
        else:
            ranking_data.sort(key=lambda x: x[sort_by], reverse=True)

        ranking_data = ranking_data[:limit]

        ranking_items = []
        for i, item in enumerate(ranking_data, 1):
            ranking_items.append(
                RankingItem(
                    rank=i,
                    id=item["agent_id"],
                    name=item["agent_name"],
                    total_tokens=item["total_tokens"],
                    call_count=item["call_count"],
                    avg_tokens=item["avg_tokens"],
                    growth_rate=None,
                )
            )

        return RankingResponse(
            ranking=ranking_items,
            time_range=time_range,
            sort_by=sort_by,
        )

    async def detect_anomalies(
        self,
        db: AsyncSession,
        time_range: TimeRange,
        severity: Literal["all", "low", "medium", "high"] = "all",
    ) -> AnomalyResponse:
        start_time = get_time_range_start(time_range)

        anomalies = []

        high_single_call_anomalies = await self._detect_high_single_call(db, start_time)
        anomalies.extend(high_single_call_anomalies)

        frequency_anomalies = await self._detect_high_frequency(db, start_time)
        anomalies.extend(frequency_anomalies)

        spike_anomalies = await self._detect_sudden_changes(db, time_range)
        anomalies.extend(spike_anomalies)

        if severity != "all":
            anomalies = [a for a in anomalies if a.severity == severity]

        anomalies.sort(key=lambda x: x.detected_time, reverse=True)

        high_severity_count = sum(1 for a in anomalies if a.severity == "high")

        return AnomalyResponse(
            anomalies=anomalies,
            total_count=len(anomalies),
            high_severity_count=high_severity_count,
        )

    async def _detect_high_single_call(self, db: AsyncSession, start_time: datetime) -> list[AnomalyItem]:
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

                ratio = usage.total_tokens / threshold
                severity = anomaly_detector.classify_severity(usage.total_tokens, threshold, ratio)

                anomalies.append(
                    AnomalyItem(
                        anomaly_id=f"high_single_{usage.usage_id}",
                        anomaly_type="high_single_call",
                        entity_id=usage.agent_id,
                        entity_name=agent.agent_name if agent else "Unknown",
                        task_id=usage.task_id,
                        detected_time=usage.create_time,
                        severity=severity,
                        details={
                            "token_count": usage.total_tokens,
                            "threshold": round(threshold, 2),
                            "ratio": round(ratio, 2),
                        },
                    )
                )

        return anomalies

    async def _detect_high_frequency(self, db: AsyncSession, start_time: datetime) -> list[AnomalyItem]:
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
            if anomaly_detector.detect_frequency_anomaly(row.call_count, frequency_threshold):
                agent_result = await db.execute(
                    select(AgentConfig).where(AgentConfig.agent_id == row.agent_id)
                )
                agent = agent_result.scalar_one_or_none()

                ratio = row.call_count / frequency_threshold
                severity = anomaly_detector.classify_severity(row.call_count, frequency_threshold, ratio)

                anomalies.append(
                    AnomalyItem(
                        anomaly_id=f"high_freq_{row.agent_id}_{int(datetime.utcnow().timestamp())}",
                        anomaly_type="high_frequency",
                        entity_id=row.agent_id,
                        entity_name=agent.agent_name if agent else "Unknown",
                        task_id=None,
                        detected_time=datetime.utcnow(),
                        severity=severity,
                        details={
                            "call_count_last_hour": row.call_count,
                            "threshold": frequency_threshold,
                            "time_window": "1 hour",
                        },
                    )
                )

        return anomalies

    async def _detect_sudden_changes(self, db: AsyncSession, time_range: TimeRange) -> list[AnomalyItem]:
        now = datetime.utcnow()
        days_map = {"1h": 1, "24h": 1, "7d": 7, "30d": 30}
        days = days_map.get(time_range, 7)

        daily_stats = []
        for i in range(days):
            date = now - timedelta(days=i)
            start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end = start + timedelta(days=1)

            query = select(
                TokenUsage.agent_id,
                func.sum(TokenUsage.total_tokens).label("total_tokens"),
            ).where(and_(TokenUsage.create_time >= start, TokenUsage.create_time < end)).group_by(
                TokenUsage.agent_id
            )

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

                is_anomaly, change_rate = anomaly_detector.detect_sudden_change(
                    current["tokens"], previous["tokens"]
                )

                if is_anomaly:
                    agent_result = await db.execute(
                        select(AgentConfig).where(AgentConfig.agent_id == agent_id)
                    )
                    agent = agent_result.scalar_one_or_none()

                    anomaly_type = "sudden_spike" if current["tokens"] > previous["tokens"] else "sudden_drop"
                    severity = anomaly_detector.classify_severity(
                        current["tokens"], previous["tokens"], change_rate
                    )

                    anomalies.append(
                        AnomalyItem(
                            anomaly_id=f"{anomaly_type}_{agent_id}_{current['date']}",
                            anomaly_type=anomaly_type,
                            entity_id=agent_id,
                            entity_name=agent.agent_name if agent else "Unknown",
                            task_id=None,
                            detected_time=datetime.combine(current["date"], datetime.min.time()),
                            severity=severity,
                            details={
                                "current_tokens": current["tokens"],
                                "previous_tokens": previous["tokens"],
                                "change_rate": round(change_rate * 100, 2),
                            },
                        )
                    )

        return anomalies


agent_statistics_service = AgentStatisticsService()
