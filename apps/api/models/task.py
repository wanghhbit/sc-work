from sqlalchemy import String, Integer, DateTime, Text, Float
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from .database import Base

class TaskRecord(Base):
    __tablename__ = "ai_task_record"

    task_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    agent_id: Mapped[int] = mapped_column(Integer, index=True)
    task_content: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    execute_time: Mapped[float | None] = mapped_column(Float, nullable=True)
    result: Mapped[str | None] = mapped_column(Text, nullable=True)
    create_user: Mapped[int] = mapped_column(Integer)
    create_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

class TaskLog(Base):
    __tablename__ = "ai_task_log"

    log_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    task_id: Mapped[int] = mapped_column(Integer, index=True)
    step: Mapped[int] = mapped_column(Integer)
    thinking: Mapped[str | None] = mapped_column(Text, nullable=True)
    action: Mapped[str | None] = mapped_column(Text, nullable=True)
    log_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
