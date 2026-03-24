from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AgentCreate(BaseModel):
    agent_name: str
    agent_type: str
    description: Optional[str] = None
    params: Optional[str] = None

class AgentUpdate(BaseModel):
    agent_name: Optional[str] = None
    description: Optional[str] = None
    params: Optional[str] = None
    status: Optional[int] = None

class AgentResponse(BaseModel):
    agent_id: int
    agent_name: str
    agent_type: str
    description: Optional[str] = None
    params: Optional[str] = None
    status: int
    create_user: int
    create_time: datetime

    class Config:
        from_attributes = True
