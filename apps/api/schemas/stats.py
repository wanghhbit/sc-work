from pydantic import BaseModel
from datetime import datetime
from typing import Any


class OverviewResponse(BaseModel):
    total_count: int
    total_tokens: int
    avg_tokens: float


class TrendItem(BaseModel):
    time: str
    total_tokens: int
    call_count: int
    task_count: int | None = None


class TrendResponse(BaseModel):
    trend: list[TrendItem]
    prediction: list[TrendItem] | None = None
    confidence: float | None = None
    growth_trend: str | None = None


class RankingItem(BaseModel):
    rank: int
    id: int
    name: str
    total_tokens: int
    call_count: int
    avg_tokens: float
    growth_rate: float | None = None


class RankingResponse(BaseModel):
    ranking: list[RankingItem]
    time_range: str
    sort_by: str


class AnomalyItem(BaseModel):
    anomaly_id: str
    anomaly_type: str
    entity_id: int
    entity_name: str
    task_id: int | None
    detected_time: datetime
    severity: str
    details: dict[str, Any]


class AnomalyResponse(BaseModel):
    anomalies: list[AnomalyItem]
    total_count: int
    high_severity_count: int


class DistributionItem(BaseModel):
    id: int
    name: str
    count: int
    total_tokens: int
    percentage: float


class DistributionResponse(BaseModel):
    distribution: list[DistributionItem]
    time_range: str


class ComparisonItem(BaseModel):
    id: int
    name: str
    avg_tokens: float
    avg_execution_time: float | None
    success_rate: float | None


class ComparisonResponse(BaseModel):
    comparison: list[ComparisonItem]
    time_range: str


class TopTaskItem(BaseModel):
    task_id: int
    agent_name: str
    total_tokens: int
    status: str
    create_time: datetime


class TopTaskResponse(BaseModel):
    top_tasks: list[TopTaskItem]
    time_range: str
