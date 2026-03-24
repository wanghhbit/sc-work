from datetime import datetime, timedelta
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from models.token_usage import TokenUsage
from models.agent import AgentConfig
from models.task import TaskRecord
from schemas.stats import (
    DistributionItem,
    DistributionResponse,
    ComparisonItem,
    ComparisonResponse,
    TopTaskItem,
    TopTaskResponse,
)
from .base import BaseStatisticsService, TimeRange, Granularity
from .time_utils import get_time_range_start, get_granularity_format


class TaskStatisticsService(BaseStatisticsService):
    async def get_overview(self, db: AsyncSession, time_range: TimeRange) -> dict:
        start_time = get_time_range_start(time_range)

        total_tasks_query = select(func.count(func.distinct(TokenUsage.task_id)))
        if start_time:
            total_tasks_query = total_tasks_query.where(TokenUsage.create_time >= start_time)
        total_tasks = (await db.execute(total_tasks_query)).scalar() or 0

        total_tokens_query = select(func.sum(TokenUsage.total_tokens))
        if start_time:
            total_tokens_query = total_tokens_query.where(TokenUsage.create_time >= start_time)
        total_tokens = (await db.execute(total_tokens_query)).scalar() or 0

        avg_tokens = total_tokens / total_tasks if total_tasks > 0 else 0

        return {
            "total_tasks": total_tasks,
            "total_tokens": total_tokens,
            "avg_tokens_per_task": round(avg_tokens, 2),
        }

    async def get_trend(
        self, db: AsyncSession, time_range: TimeRange, granularity: Granularity
    ) -> list[dict]:
        start_time = get_time_range_start(time_range)
        time_format = get_granularity_format(granularity)

        query = select(
            func.strftime(time_format, TokenUsage.create_time).label("time_bucket"),
            func.count(func.distinct(TokenUsage.task_id)).label("task_count"),
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
        ).where(TokenUsage.create_time >= start_time)

        query = query.group_by("time_bucket").order_by("time_bucket")

        result = await db.execute(query)
        rows = result.all()

        return [
            {
                "time": row.time_bucket,
                "task_count": row.task_count or 0,
                "total_tokens": row.total_tokens or 0,
            }
            for row in rows
        ]

    async def get_ranking(self, db: AsyncSession, time_range: TimeRange, limit: int = 10) -> list[dict]:
        start_time = get_time_range_start(time_range)

        query = select(
            TokenUsage.task_id,
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
        ).group_by(TokenUsage.task_id)

        if start_time:
            query = query.where(TokenUsage.create_time >= start_time)

        query = query.order_by(func.sum(TokenUsage.total_tokens).desc()).limit(limit)

        result = await db.execute(query)
        rows = result.all()

        return [
            {
                "task_id": row.task_id,
                "total_tokens": row.total_tokens or 0,
            }
            for row in rows
        ]

    async def get_distribution(self, db: AsyncSession, time_range: TimeRange) -> DistributionResponse:
        start_time = get_time_range_start(time_range)

        query = select(
            TokenUsage.agent_id,
            func.count(func.distinct(TokenUsage.task_id)).label("task_count"),
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
        ).group_by(TokenUsage.agent_id)

        if start_time:
            query = query.where(TokenUsage.create_time >= start_time)

        result = await db.execute(query)
        rows = result.all()

        agent_ids = [row.agent_id for row in rows]
        agents_result = await db.execute(select(AgentConfig).where(AgentConfig.agent_id.in_(agent_ids)))
        agents = {a.agent_id: a for a in agents_result.scalars().all()}

        total_tasks = sum(row.task_count for row in rows)

        distribution = []
        for row in rows:
            agent = agents.get(row.agent_id)
            percentage = (row.task_count / total_tasks * 100) if total_tasks > 0 else 0

            distribution.append(
                DistributionItem(
                    id=row.agent_id,
                    name=agent.agent_name if agent else "Unknown",
                    count=row.task_count or 0,
                    total_tokens=row.total_tokens or 0,
                    percentage=round(percentage, 2),
                )
            )

        distribution.sort(key=lambda x: x.total_tokens, reverse=True)

        return DistributionResponse(
            distribution=distribution,
            time_range=time_range,
        )

    async def get_comparison(self, db: AsyncSession, time_range: TimeRange) -> ComparisonResponse:
        start_time = get_time_range_start(time_range)

        task_stats_query = select(
            TaskRecord.agent_id,
            func.count(TaskRecord.task_id).label("task_count"),
            func.avg(TaskRecord.execute_time).label("avg_execution_time"),
            func.sum(func.case((TaskRecord.status == "completed", 1), else_=0)).label("completed_count"),
        ).group_by(TaskRecord.agent_id)

        if start_time:
            task_stats_query = task_stats_query.where(TaskRecord.create_time >= start_time)

        task_stats_result = await db.execute(task_stats_query)
        task_stats = {row.agent_id: row for row in task_stats_result.all()}

        token_stats_query = select(
            TokenUsage.agent_id,
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
            func.count(func.distinct(TokenUsage.task_id)).label("task_count"),
        ).group_by(TokenUsage.agent_id)

        if start_time:
            token_stats_query = token_stats_query.where(TokenUsage.create_time >= start_time)

        token_stats_result = await db.execute(token_stats_query)
        token_stats = {row.agent_id: row for row in token_stats_result.all()}

        all_agent_ids = set(task_stats.keys()) | set(token_stats.keys())
        agents_result = await db.execute(select(AgentConfig).where(AgentConfig.agent_id.in_(all_agent_ids)))
        agents = {a.agent_id: a for a in agents_result.scalars().all()}

        comparison = []
        for agent_id in all_agent_ids:
            agent = agents.get(agent_id)
            task_stat = task_stats.get(agent_id)
            token_stat = token_stats.get(agent_id)

            avg_tokens = (
                token_stat.total_tokens / token_stat.task_count
                if token_stat and token_stat.task_count > 0
                else 0
            )

            success_rate = None
            if task_stat:
                success_rate = (task_stat.completed_count / task_stat.task_count * 100) if task_stat.task_count > 0 else 0

            comparison.append(
                ComparisonItem(
                    id=agent_id,
                    name=agent.agent_name if agent else "Unknown",
                    avg_tokens=round(avg_tokens, 2),
                    avg_execution_time=round(task_stat.avg_execution_time, 2) if task_stat and task_stat.avg_execution_time else None,
                    success_rate=round(success_rate, 2) if success_rate is not None else None,
                )
            )

        comparison.sort(key=lambda x: x.avg_tokens, reverse=True)

        return ComparisonResponse(
            comparison=comparison,
            time_range=time_range,
        )

    async def get_top_consumers(
        self, db: AsyncSession, time_range: TimeRange, limit: int = 10
    ) -> TopTaskResponse:
        start_time = get_time_range_start(time_range)

        query = select(
            TokenUsage.task_id,
            TokenUsage.agent_id,
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
        ).group_by(TokenUsage.task_id, TokenUsage.agent_id)

        if start_time:
            query = query.where(TokenUsage.create_time >= start_time)

        query = query.order_by(func.sum(TokenUsage.total_tokens).desc()).limit(limit)

        result = await db.execute(query)
        rows = result.all()

        task_ids = [row.task_id for row in rows]
        tasks_result = await db.execute(select(TaskRecord).where(TaskRecord.task_id.in_(task_ids)))
        tasks = {t.task_id: t for t in tasks_result.scalars().all()}

        agent_ids = [row.agent_id for row in rows]
        agents_result = await db.execute(select(AgentConfig).where(AgentConfig.agent_id.in_(agent_ids)))
        agents = {a.agent_id: a for a in agents_result.scalars().all()}

        top_tasks = []
        for row in rows:
            task = tasks.get(row.task_id)
            agent = agents.get(row.agent_id)

            top_tasks.append(
                TopTaskItem(
                    task_id=row.task_id,
                    agent_name=agent.agent_name if agent else "Unknown",
                    total_tokens=row.total_tokens or 0,
                    status=task.status if task else "unknown",
                    create_time=task.create_time if task else datetime.utcnow(),
                )
            )

        return TopTaskResponse(
            top_tasks=top_tasks,
            time_range=time_range,
        )


task_statistics_service = TaskStatisticsService()
