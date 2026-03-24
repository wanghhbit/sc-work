from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from models.database import get_db
from models.user import User
from schemas.common import Response
from schemas.statistics import (
    AgentRankingResponse,
    TrendPredictionResponse,
    AnomalyListResponse,
)
from utils.deps import get_current_user
from services.statistics_service import statistics_service
from typing import Literal

router = APIRouter(prefix="/statistics", tags=["统计分析"])


@router.get("/ranking/agents", response_model=Response[AgentRankingResponse])
async def get_agent_ranking(
    sort_by: Literal["total_tokens", "call_count", "avg_tokens", "growth_rate"] = Query(
        "total_tokens", description="排序字段: total_tokens, call_count, avg_tokens, growth_rate"
    ),
    time_range: Literal["today", "week", "month", "all"] = Query(
        "all", description="时间范围: today, week, month, all"
    ),
    limit: int = Query(10, ge=1, le=100, description="返回数量限制"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ranking = await statistics_service.get_agent_ranking(db, sort_by, time_range, limit)
    return Response(data=ranking)


@router.get("/trend/prediction", response_model=Response[TrendPredictionResponse])
async def get_trend_prediction(
    days: int = Query(30, ge=7, le=90, description="总天数（历史+预测）"),
    agent_id: int | None = Query(None, description="Agent ID，不传则统计全部"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prediction = await statistics_service.get_trend_prediction(db, days, agent_id)
    return Response(data=prediction)


@router.get("/anomalies", response_model=Response[AnomalyListResponse])
async def get_anomalies(
    days: int = Query(7, ge=1, le=30, description="检测最近N天的异常"),
    severity: Literal["all", "low", "medium", "high"] = Query(
        "all", description="异常严重级别: all, low, medium, high"
    ),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    anomalies = await statistics_service.detect_anomalies(db, days, severity)
    return Response(data=anomalies)
