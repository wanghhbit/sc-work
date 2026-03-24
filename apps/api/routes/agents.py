from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models.database import get_db
from models.agent import AgentConfig
from models.user import User
from schemas.agent import AgentCreate, AgentUpdate, AgentResponse
from schemas.common import Response, PaginatedResponse
from utils.deps import get_current_user

router = APIRouter(prefix="/agents", tags=["Agent管理"])

@router.get("", response_model=PaginatedResponse[AgentResponse])
async def list_agents(
    page: int = 1,
    page_size: int = 10,
    keyword: str = "",
    agent_type: str = "",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(AgentConfig)
    if keyword:
        query = query.where(AgentConfig.agent_name.contains(keyword))
    if agent_type:
        query = query.where(AgentConfig.agent_type == agent_type)
    total_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(total_query)).scalar()
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    agents = result.scalars().all()
    return PaginatedResponse(data=[AgentResponse.model_validate(a) for a in agents], total=total, page=page, page_size=page_size)

@router.post("", response_model=Response[AgentResponse])
async def create_agent(
    data: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    agent = AgentConfig(
        agent_name=data.agent_name,
        agent_type=data.agent_type,
        description=data.description,
        params=data.params,
        create_user=current_user.user_id
    )
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return Response(data=AgentResponse.model_validate(agent))

@router.get("/{agent_id}", response_model=Response[AgentResponse])
async def get_agent(
    agent_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AgentConfig).where(AgentConfig.agent_id == agent_id))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent不存在")
    return Response(data=AgentResponse.model_validate(agent))

@router.put("/{agent_id}", response_model=Response[AgentResponse])
async def update_agent(
    agent_id: int,
    data: AgentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AgentConfig).where(AgentConfig.agent_id == agent_id))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent不存在")
    if data.agent_name is not None:
        agent.agent_name = data.agent_name
    if data.description is not None:
        agent.description = data.description
    if data.params is not None:
        agent.params = data.params
    if data.status is not None:
        agent.status = data.status
    await db.commit()
    await db.refresh(agent)
    return Response(data=AgentResponse.model_validate(agent))

@router.delete("/{agent_id}", response_model=Response)
async def delete_agent(
    agent_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AgentConfig).where(AgentConfig.agent_id == agent_id))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent不存在")
    await db.delete(agent)
    await db.commit()
    return Response(message="删除成功")
