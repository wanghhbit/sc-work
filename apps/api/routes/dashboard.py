from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from models.database import get_db
from models.task import TaskRecord
from models.agent import AgentConfig
from models.user import User
from schemas.common import Response
from utils.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["数据看板"])

@router.get("/stats", response_model=Response)
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    agent_count = (await db.execute(select(func.count()).select_from(AgentConfig))).scalar()
    task_count = (await db.execute(select(func.count()).select_from(TaskRecord))).scalar()
    completed_count = (await db.execute(select(func.count()).select_from(TaskRecord).where(TaskRecord.status == "completed"))).scalar()
    success_rate = round(completed_count / task_count * 100, 1) if task_count > 0 else 0
    return Response(data={
        "agent_count": agent_count,
        "task_count": task_count,
        "completed_count": completed_count,
        "success_rate": success_rate
    })

@router.get("/trend", response_model=Response)
async def get_trend(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = datetime.utcnow().date()
    trend_data = []
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        start = datetime.combine(date, datetime.min.time())
        end = datetime.combine(date, datetime.max.time())
        count = (await db.execute(
            select(func.count()).select_from(TaskRecord).where(TaskRecord.create_time >= start, TaskRecord.create_time <= end)
        )).scalar()
        completed = (await db.execute(
            select(func.count()).select_from(TaskRecord).where(TaskRecord.create_time >= start, TaskRecord.create_time <= end, TaskRecord.status == "completed")
        )).scalar()
        trend_data.append({
            "date": date.strftime("%m-%d"),
            "count": count,
            "success_rate": round(completed / count * 100, 1) if count > 0 else 0
        })
    return Response(data=trend_data)

@router.get("/agent-efficiency", response_model=Response)
async def get_agent_efficiency(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    agents = (await db.execute(select(AgentConfig))).scalars().all()
    efficiency_data = []
    for agent in agents:
        task_count = (await db.execute(select(func.count()).select_from(TaskRecord).where(TaskRecord.agent_id == agent.agent_id))).scalar()
        completed = (await db.execute(select(func.count()).select_from(TaskRecord).where(TaskRecord.agent_id == agent.agent_id, TaskRecord.status == "completed"))).scalar()
        avg_time = (await db.execute(
            select(func.avg(TaskRecord.execute_time)).select_from(TaskRecord).where(TaskRecord.agent_id == agent.agent_id, TaskRecord.status == "completed")
        )).scalar() or 0
        efficiency_data.append({
            "agent_name": agent.agent_name,
            "agent_type": agent.agent_type,
            "task_count": task_count,
            "completion_rate": round(completed / task_count * 100, 1) if task_count > 0 else 0,
            "avg_time": round(avg_time, 2)
        })
    return Response(data=efficiency_data)
