from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TokenUsageResponse(BaseModel):
    usage_id: int
    task_id: int
    agent_id: int
    user_id: int
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    model_name: Optional[str] = None
    create_time: datetime

    class Config:
        from_attributes = True


class TokenStatsResponse(BaseModel):
    total_tokens: int
    total_prompt_tokens: int
    total_completion_tokens: int
    total_calls: int
    today_tokens: int


class AgentTokenStats(BaseModel):
    agent_id: int
    total_tokens: int
    prompt_tokens: int
    completion_tokens: int
    call_count: int


class UserTokenStats(BaseModel):
    user_id: int
    total_tokens: int
    prompt_tokens: int
    completion_tokens: int
    call_count: int


class TokenTrendItem(BaseModel):
    date: str
    total_tokens: int
    total_calls: int
