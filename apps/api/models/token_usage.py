from sqlalchemy import String, Integer, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from .database import Base


class TokenUsage(Base):
    __tablename__ = "ai_token_usage"

    usage_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    task_id: Mapped[int] = mapped_column(Integer, index=True)
    agent_id: Mapped[int] = mapped_column(Integer, index=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0)
    model_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    create_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('idx_create_time', 'create_time'),
        Index('idx_agent_time', 'agent_id', 'create_time'),
        Index('idx_user_time', 'user_id', 'create_time'),
        Index('idx_task_time', 'task_id', 'create_time'),
        Index('idx_model_time', 'model_name', 'create_time'),
    )
