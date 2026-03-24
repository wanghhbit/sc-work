from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AgentRankingItem(BaseModel):
    agent_id: int
    agent_name: str
    agent_type: str
    total_tokens: int
    call_count: int
    avg_tokens_per_call: float
    growth_rate: float | None
    rank: int


class AgentRankingResponse(BaseModel):
    ranking: list[AgentRankingItem]
    time_range: str
    sort_by: str


class TrendPrediction(BaseModel):
    date: str
    actual_tokens: int | None
    predicted_tokens: int | None
    is_prediction: bool


class TrendPredictionResponse(BaseModel):
    trend: list[TrendPrediction]
    prediction_confidence: float
    growth_trend: str


class AnomalyRecord(BaseModel):
    anomaly_id: str
    anomaly_type: str
    agent_id: int
    agent_name: str
    task_id: int | None
    detected_time: datetime
    details: dict
    severity: str


class AnomalyListResponse(BaseModel):
    anomalies: list[AnomalyRecord]
    total_count: int
    high_severity_count: int
