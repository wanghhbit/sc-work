from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    agent_id: int
    task_content: str

class TaskResponse(BaseModel):
    task_id: int
    agent_id: int
    task_content: str
    status: str
    execute_time: Optional[float] = None
    result: Optional[str] = None
    create_user: int
    create_time: datetime
    end_time: Optional[datetime] = None

    class Config:
        from_attributes = True

class TaskLogResponse(BaseModel):
    log_id: int
    task_id: int
    step: int
    thinking: Optional[str] = None
    action: Optional[str] = None
    log_time: datetime

    class Config:
        from_attributes = True
