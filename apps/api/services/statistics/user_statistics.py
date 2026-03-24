from datetime import datetime, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from models.token_usage import TokenUsage
from models.task import TaskRecord
from models.user import User
from schemas.stats import (
    OverviewResponse,
    TrendItem,
    TrendResponse,
    RankingItem,
    RankingResponse,
)
from .base import BaseStatisticsService, TimeRange, Granularity
from .time_utils import get_time_range_start, get_granularity_format
from typing import Literal


class UserStatisticsService(BaseStatisticsService):
    async def get_overview(self, db: AsyncSession, time_range: TimeRange) -> dict:
        start_time = get_time_range_start(time_range)

        total_users_query = select(func.count(func.distinct(TokenUsage.user_id)))
        if start_time:
            total_users_query = total_users_query.where(TokenUsage.create_time >= start_time)
        total_users = (await db.execute(total_users_query)).scalar() or 0

        active_users_query = select(func.count(func.distinct(TokenUsage.user_id)))
        active_time = datetime.utcnow() - timedelta(days=7)
        active_users_query = active_users_query.where(TokenUsage.create_time >= active_time)
        active_users = (await db.execute(active_users_query)).scalar() or 0

        total_tokens_query = select(func.sum(TokenUsage.total_tokens))
        if start_time:
            total_tokens_query = total_tokens_query.where(TokenUsage.create_time >= start_time)
        total_tokens = (await db.execute(total_tokens_query)).scalar() or 0

        avg_tokens = total_tokens / total_users if total_users > 0 else 0

        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_tokens": total_tokens,
            "avg_tokens_per_user": round(avg_tokens, 2),
        }

    async def get_trend(
        self, db: AsyncSession, time_range: TimeRange, granularity: Granularity
    ) -> list[dict]:
        start_time = get_time_range_start(time_range)
        time_format = get_granularity_format(granularity)

        query = select(
            func.strftime(time_format, TokenUsage.create_time).label("time_bucket"),
            func.count(func.distinct(TokenUsage.user_id)).label("active_users"),
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
        ).where(TokenUsage.create_time >= start_time)

        query = query.group_by("time_bucket").order_by("time_bucket")

        result = await db.execute(query)
        rows = result.all()

        return [
            {
                "time": row.time_bucket,
                "active_users": row.active_users or 0,
                "total_tokens": row.total_tokens or 0,
            }
            for row in rows
        ]

    async def get_ranking(
        self,
        db: AsyncSession,
        time_range: TimeRange,
        sort_by: Literal["total_tokens", "task_count", "call_count"] = "total_tokens",
        limit: int = 10,
    ) -> RankingResponse:
        start_time = get_time_range_start(time_range)

        query = select(
            TokenUsage.user_id,
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
            func.count(TokenUsage.usage_id).label("call_count"),
        ).group_by(TokenUsage.user_id)

        if start_time:
            query = query.where(TokenUsage.create_time >= start_time)

        result = await db.execute(query)
        rows = result.all()

        user_ids = [row.user_id for row in rows]
        users_result = await db.execute(select(User).where(User.user_id.in_(user_ids)))
        users = {u.user_id: u for u in users_result.scalars().all()}

        task_count_query = select(
            TaskRecord.create_user,
            func.count(TaskRecord.task_id).label("task_count"),
        ).group_by(TaskRecord.create_user)

        if start_time:
            task_count_query = task_count_query.where(TaskRecord.create_time >= start_time)

        task_count_result = await db.execute(task_count_query)
        task_counts = {row.create_user: row.task_count for row in task_count_result.all()}

        ranking_data = []
        for row in rows:
            user = users.get(row.user_id)
            task_count = task_counts.get(row.user_id, 0)

            ranking_data.append({
                "user_id": row.user_id,
                "username": user.username if user else "Unknown",
                "total_tokens": row.total_tokens or 0,
                "call_count": row.call_count or 0,
                "task_count": task_count,
            })

        if sort_by == "task_count":
            ranking_data.sort(key=lambda x: x["task_count"], reverse=True)
        elif sort_by == "call_count":
            ranking_data.sort(key=lambda x: x["call_count"], reverse=True)
        else:
            ranking_data.sort(key=lambda x: x["total_tokens"], reverse=True)

        ranking_data = ranking_data[:limit]

        ranking_items = []
        for i, item in enumerate(ranking_data, 1):
            ranking_items.append(
                RankingItem(
                    rank=i,
                    id=item["user_id"],
                    name=item["username"],
                    total_tokens=item["total_tokens"],
                    call_count=item["call_count"],
                    avg_tokens=round(item["total_tokens"] / item["call_count"], 2) if item["call_count"] > 0 else 0,
                    growth_rate=None,
                )
            )

        return RankingResponse(
            ranking=ranking_items,
            time_range=time_range,
            sort_by=sort_by,
        )

    async def get_user_trend(
        self,
        db: AsyncSession,
        user_id: int,
        time_range: TimeRange,
        granularity: Granularity,
    ) -> TrendResponse:
        start_time = get_time_range_start(time_range)
        time_format = get_granularity_format(granularity)

        query = select(
            func.strftime(time_format, TokenUsage.create_time).label("time_bucket"),
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
            func.count(TokenUsage.usage_id).label("call_count"),
        ).where(TokenUsage.create_time >= start_time, TokenUsage.user_id == user_id)

        query = query.group_by("time_bucket").order_by("time_bucket")

        result = await db.execute(query)
        rows = result.all()

        task_query = select(
            func.strftime(time_format, TaskRecord.create_time).label("time_bucket"),
            func.count(TaskRecord.task_id).label("task_count"),
        ).where(TaskRecord.create_time >= start_time, TaskRecord.create_user == user_id)

        task_query = task_query.group_by("time_bucket").order_by("time_bucket")

        task_result = await db.execute(task_query)
        task_rows = task_result.all()

        task_counts = {row.time_bucket: row.task_count for row in task_rows}

        trend = [
            TrendItem(
                time=row.time_bucket,
                total_tokens=row.total_tokens or 0,
                call_count=row.call_count or 0,
                task_count=task_counts.get(row.time_bucket, 0),
            )
            for row in rows
        ]

        return TrendResponse(
            trend=trend,
            prediction=None,
            confidence=None,
            growth_trend=None,
        )


user_statistics_service = UserStatisticsService()
