from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from models.database import get_db
from models.user import User
from schemas.common import Response
from schemas.stats import (
    TrendResponse,
    RankingResponse,
    AnomalyResponse,
    DistributionResponse,
    ComparisonResponse,
    TopTaskResponse,
)
from utils.deps import get_current_user
from services.statistics import (
    agent_statistics_service,
    task_statistics_service,
    user_statistics_service,
    TimeRange,
    Granularity,
)
from typing import Literal

router = APIRouter(prefix="/stats", tags=["统计分析"])


@router.get("/agent/overview", response_model=Response[dict])
async def get_agent_overview(
    time_range: TimeRange = Query("7d", description="时间范围: 1h, 24h, 7d, 30d"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    overview = await agent_statistics_service.get_overview(db, time_range)
    return Response(data=overview)


@router.get("/agent/trend", response_model=Response[TrendResponse])
async def get_agent_trend(
    time_range: TimeRange = Query("7d", description="时间范围: 1h, 24h, 7d, 30d"),
    granularity: Granularity = Query("day", description="粒度: hour, day, week, month"),
    agent_id: int | None = Query(None, description="Agent ID，不传则统计全部"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    trend = await agent_statistics_service.get_trend(db, time_range, granularity, agent_id)
    return Response(data=trend)


@router.get("/agent/ranking", response_model=Response[RankingResponse])
async def get_agent_ranking(
    time_range: TimeRange = Query("7d", description="时间范围: 1h, 24h, 7d, 30d"),
    sort_by: Literal["total_tokens", "call_count", "avg_tokens"] = Query(
        "total_tokens", description="排序字段"
    ),
    limit: int = Query(10, ge=1, le=100, description="返回数量限制"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ranking = await agent_statistics_service.get_ranking(db, time_range, sort_by, limit)
    return Response(data=ranking)


@router.get("/agent/anomaly", response_model=Response[AnomalyResponse])
async def get_agent_anomaly(
    time_range: TimeRange = Query("7d", description="时间范围: 1h, 24h, 7d, 30d"),
    severity: Literal["all", "low", "medium", "high"] = Query(
        "all", description="异常严重级别"
    ),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    anomalies = await agent_statistics_service.detect_anomalies(db, time_range, severity)
    return Response(data=anomalies)


@router.get("/task/distribution", response_model=Response[DistributionResponse])
async def get_task_distribution(
    time_range: TimeRange = Query("7d", description="时间范围: 1h, 24h, 7d, 30d"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    distribution = await task_statistics_service.get_distribution(db, time_range)
    return Response(data=distribution)


@router.get("/task/comparison", response_model=Response[ComparisonResponse])
async def get_task_comparison(
    time_range: TimeRange = Query("7d", description="时间范围: 1h, 24h, 7d, 30d"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    comparison = await task_statistics_service.get_comparison(db, time_range)
    return Response(data=comparison)


@router.get("/task/top", response_model=Response[TopTaskResponse])
async def get_task_top(
    time_range: TimeRange = Query("7d", description="时间范围: 1h, 24h, 7d, 30d"),
    limit: int = Query(10, ge=1, le=100, description="返回数量限制"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    top_tasks = await task_statistics_service.get_top_consumers(db, time_range, limit)
    return Response(data=top_tasks)


@router.get("/user/overview", response_model=Response[dict])
async def get_user_overview(
    time_range: TimeRange = Query("7d", description="时间范围: 1h, 24h, 7d, 30d"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    overview = await user_statistics_service.get_overview(db, time_range)
    return Response(data=overview)


@router.get("/user/ranking", response_model=Response[RankingResponse])
async def get_user_ranking(
    time_range: TimeRange = Query("7d", description="时间范围: 1h, 24h, 7d, 30d"),
    sort_by: Literal["total_tokens", "task_count", "call_count"] = Query(
        "total_tokens", description="排序字段"
    ),
    limit: int = Query(10, ge=1, le=100, description="返回数量限制"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ranking = await user_statistics_service.get_ranking(db, time_range, sort_by, limit)
    return Response(data=ranking)


@router.get("/user/{user_id}/trend", response_model=Response[TrendResponse])
async def get_user_trend(
    user_id: int,
    time_range: TimeRange = Query("7d", description="时间范围: 1h, 24h, 7d, 30d"),
    granularity: Granularity = Query("day", description="粒度: hour, day, week, month"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    trend = await user_statistics_service.get_user_trend(db, user_id, time_range, granularity)
    return Response(data=trend)
