from sqlalchemy import String, Integer, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from .database import Base

class AgentConfig(Base):
    __tablename__ = "ai_agent_config"

    agent_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    agent_name: Mapped[str] = mapped_column(String(100))
    agent_type: Mapped[str] = mapped_column(String(50))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    params: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[int] = mapped_column(Integer, default=1)
    create_user: Mapped[int] = mapped_column(Integer)
    create_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    update_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
