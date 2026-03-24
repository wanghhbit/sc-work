from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models.database import get_db
from models.task import TaskRecord, TaskLog
from models.agent import AgentConfig
from models.user import User
from schemas.task import TaskCreate, TaskResponse, TaskLogResponse
from schemas.common import Response, PaginatedResponse
from utils.deps import get_current_user
from services.agent_executor import execute_agent_task

router = APIRouter(prefix="/tasks", tags=["任务管理"])

@router.post("", response_model=Response[TaskResponse])
async def create_task(
    data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    agent_result = await db.execute(select(AgentConfig).where(AgentConfig.agent_id == data.agent_id))
    agent = agent_result.scalar_one_or_none()
    if not agent or agent.status != 1:
        raise HTTPException(status_code=400, detail="Agent不存在或已禁用")
    task = TaskRecord(
        agent_id=data.agent_id,
        task_content=data.task_content,
        status="pending",
        create_user=current_user.user_id
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    await execute_agent_task(task.task_id, agent.agent_type, data.task_content)
    return Response(data=TaskResponse.model_validate(task))

@router.get("", response_model=PaginatedResponse[TaskResponse])
async def list_tasks(
    page: int = 1,
    page_size: int = 10,
    status: str = "",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(TaskRecord).where(TaskRecord.create_user == current_user.user_id)
    if status:
        query = query.where(TaskRecord.status == status)
    total_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(total_query)).scalar()
    query = query.order_by(TaskRecord.create_time.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    tasks = result.scalars().all()
    return PaginatedResponse(data=[TaskResponse.model_validate(t) for t in tasks], total=total, page=page, page_size=page_size)

@router.get("/{task_id}", response_model=Response[TaskResponse])
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(TaskRecord).where(TaskRecord.task_id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return Response(data=TaskResponse.model_validate(task))

@router.get("/{task_id}/logs", response_model=Response[list[TaskLogResponse]])
async def get_task_logs(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(TaskLog).where(TaskLog.task_id == task_id).order_by(TaskLog.step))
    logs = result.scalars().all()
    return Response(data=[TaskLogResponse.model_validate(l) for l in logs])

@router.post("/{task_id}/cancel", response_model=Response)
async def cancel_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(TaskRecord).where(TaskRecord.task_id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    if task.status not in ["pending", "running"]:
        raise HTTPException(status_code=400, detail="任务无法取消")
    task.status = "cancelled"
    await db.commit()
    return Response(message="任务已取消")
