from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from models.database import get_db
from models.token_usage import TokenUsage
from models.agent import AgentConfig
from models.user import User
from schemas.common import Response
from schemas.token_usage import (
    TokenStatsResponse,
    AgentTokenStats,
    UserTokenStats,
    TokenTrendItem,
)
from utils.deps import get_current_user
from services.token_tracker import token_tracker

router = APIRouter(prefix="/token-usage", tags=["Token用量统计"])


@router.get("/stats", response_model=Response[TokenStatsResponse])
async def get_token_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stats = await token_tracker.get_overall_stats(db)
    return Response(data=stats)


@router.get("/by-agent", response_model=Response[list[dict]])
async def get_token_by_agent(
    agent_id: int | None = Query(None, description="Agent ID，不传则返回所有"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stats = await token_tracker.get_agent_stats(db, agent_id)

    agent_ids = [s["agent_id"] for s in stats]
    agents_result = await db.execute(select(AgentConfig).where(AgentConfig.agent_id.in_(agent_ids)))
    agents = {a.agent_id: a for a in agents_result.scalars().all()}

    result = []
    for s in stats:
        agent = agents.get(s["agent_id"])
        result.append({
            **s,
            "agent_name": agent.agent_name if agent else "Unknown",
            "agent_type": agent.agent_type if agent else "Unknown",
        })

    return Response(data=result)


@router.get("/by-user", response_model=Response[list[dict]])
async def get_token_by_user(
    user_id: int | None = Query(None, description="用户ID，不传则返回所有"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stats = await token_tracker.get_user_stats(db, user_id)

    user_ids = [s["user_id"] for s in stats]
    users_result = await db.execute(select(User).where(User.user_id.in_(user_ids)))
    users = {u.user_id: u for u in users_result.scalars().all()}

    result = []
    for s in stats:
        user = users.get(s["user_id"])
        result.append({
            **s,
            "username": user.username if user else "Unknown",
            "dept": user.dept if user else None,
        })

    return Response(data=result)


@router.get("/trend", response_model=Response[list[TokenTrendItem]])
async def get_token_trend(
    days: int = Query(7, ge=1, le=30, description="统计天数"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    trend = await token_tracker.get_trend(db, days)
    return Response(data=trend)


@router.get("/tasks/{task_id}", response_model=Response[list[dict]])
async def get_task_token_usage(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    usage = await token_tracker.get_task_usage(db, task_id)
    return Response(data=usage)
