from sqlalchemy import String, Integer, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from .database import Base

class BusinessData(Base):
    __tablename__ = "biz_data"

    biz_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    biz_type: Mapped[str] = mapped_column(String(50))
    biz_content: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="active")
    create_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SystemLog(Base):
    __tablename__ = "sys_log"

    log_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    operate_user: Mapped[int] = mapped_column(Integer)
    operate_content: Mapped[str] = mapped_column(Text)
    operate_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    ip: Mapped[str | None] = mapped_column(String(50), nullable=True)
