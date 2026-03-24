from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "sys_user"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="employee")
    dept: Mapped[str | None] = mapped_column(String(100), nullable=True)
    post: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[int] = mapped_column(Integer, default=1)
    create_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    update_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
