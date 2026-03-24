from datetime import datetime, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from models.token_usage import TokenUsage
from models.database import async_session_maker


class TokenTracker:
    async def record_usage(
        self,
        task_id: int,
        agent_id: int,
        user_id: int,
        prompt_tokens: int,
        completion_tokens: int,
        model_name: str | None = None,
    ) -> TokenUsage:
        async with async_session_maker() as db:
            usage = TokenUsage(
                task_id=task_id,
                agent_id=agent_id,
                user_id=user_id,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=prompt_tokens + completion_tokens,
                model_name=model_name,
            )
            db.add(usage)
            await db.commit()
            await db.refresh(usage)
            return usage

    async def get_overall_stats(self, db: AsyncSession) -> dict:
        total_tokens = (await db.execute(select(func.sum(TokenUsage.total_tokens)))).scalar() or 0
        total_prompt = (await db.execute(select(func.sum(TokenUsage.prompt_tokens)))).scalar() or 0
        total_completion = (await db.execute(select(func.sum(TokenUsage.completion_tokens)))).scalar() or 0
        total_calls = (await db.execute(select(func.count()).select_from(TokenUsage))).scalar() or 0

        today = datetime.utcnow().date()
        today_start = datetime.combine(today, datetime.min.time())
        today_tokens = (
            await db.execute(
                select(func.sum(TokenUsage.total_tokens)).where(TokenUsage.create_time >= today_start)
            )
        ).scalar() or 0

        return {
            "total_tokens": total_tokens,
            "total_prompt_tokens": total_prompt,
            "total_completion_tokens": total_completion,
            "total_calls": total_calls,
            "today_tokens": today_tokens,
        }

    async def get_agent_stats(self, db: AsyncSession, agent_id: int | None = None) -> list[dict]:
        query = select(
            TokenUsage.agent_id,
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
            func.sum(TokenUsage.prompt_tokens).label("prompt_tokens"),
            func.sum(TokenUsage.completion_tokens).label("completion_tokens"),
            func.count(TokenUsage.usage_id).label("call_count"),
        ).group_by(TokenUsage.agent_id)

        if agent_id:
            query = query.where(TokenUsage.agent_id == agent_id)

        result = await db.execute(query)
        rows = result.all()

        stats = []
        for row in rows:
            stats.append({
                "agent_id": row.agent_id,
                "total_tokens": row.total_tokens or 0,
                "prompt_tokens": row.prompt_tokens or 0,
                "completion_tokens": row.completion_tokens or 0,
                "call_count": row.call_count or 0,
            })
        return stats

    async def get_user_stats(self, db: AsyncSession, user_id: int | None = None) -> list[dict]:
        query = select(
            TokenUsage.user_id,
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
            func.sum(TokenUsage.prompt_tokens).label("prompt_tokens"),
            func.sum(TokenUsage.completion_tokens).label("completion_tokens"),
            func.count(TokenUsage.usage_id).label("call_count"),
        ).group_by(TokenUsage.user_id)

        if user_id:
            query = query.where(TokenUsage.user_id == user_id)

        result = await db.execute(query)
        rows = result.all()

        stats = []
        for row in rows:
            stats.append({
                "user_id": row.user_id,
                "total_tokens": row.total_tokens or 0,
                "prompt_tokens": row.prompt_tokens or 0,
                "completion_tokens": row.completion_tokens or 0,
                "call_count": row.call_count or 0,
            })
        return stats

    async def get_time_range_stats(
        self, db: AsyncSession, start: datetime, end: datetime
    ) -> dict:
        total_tokens = (
            await db.execute(
                select(func.sum(TokenUsage.total_tokens)).where(
                    TokenUsage.create_time >= start, TokenUsage.create_time <= end
                )
            )
        ).scalar() or 0
        total_calls = (
            await db.execute(
                select(func.count()).select_from(TokenUsage).where(
                    TokenUsage.create_time >= start, TokenUsage.create_time <= end
                )
            )
        ).scalar() or 0

        return {
            "start_time": start.isoformat(),
            "end_time": end.isoformat(),
            "total_tokens": total_tokens,
            "total_calls": total_calls,
        }

    async def get_trend(self, db: AsyncSession, days: int = 7) -> list[dict]:
        today = datetime.utcnow().date()
        trend_data = []

        for i in range(days - 1, -1, -1):
            date = today - timedelta(days=i)
            start = datetime.combine(date, datetime.min.time())
            end = datetime.combine(date, datetime.max.time())

            total_tokens = (
                await db.execute(
                    select(func.sum(TokenUsage.total_tokens)).where(
                        TokenUsage.create_time >= start, TokenUsage.create_time <= end
                    )
                )
            ).scalar() or 0

            total_calls = (
                await db.execute(
                    select(func.count()).select_from(TokenUsage).where(
                        TokenUsage.create_time >= start, TokenUsage.create_time <= end
                    )
                )
            ).scalar() or 0

            trend_data.append({
                "date": date.strftime("%m-%d"),
                "total_tokens": total_tokens,
                "total_calls": total_calls,
            })

        return trend_data

    async def get_task_usage(self, db: AsyncSession, task_id: int) -> list[dict]:
        result = await db.execute(
            select(TokenUsage).where(TokenUsage.task_id == task_id).order_by(TokenUsage.create_time)
        )
        usages = result.scalars().all()

        return [
            {
                "usage_id": u.usage_id,
                "prompt_tokens": u.prompt_tokens,
                "completion_tokens": u.completion_tokens,
                "total_tokens": u.total_tokens,
                "model_name": u.model_name,
                "create_time": u.create_time.isoformat(),
            }
            for u in usages
        ]


token_tracker = TokenTracker()
