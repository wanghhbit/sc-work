from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models.database import get_db
from models.user import User
from schemas.user import UserCreate, UserUpdate, UserResponse
from schemas.common import Response, PaginatedResponse
from utils.auth import get_password_hash
from utils.deps import get_current_admin, get_current_user

router = APIRouter(prefix="/users", tags=["用户管理"])

@router.get("", response_model=PaginatedResponse[UserResponse])
async def list_users(
    page: int = 1,
    page_size: int = 10,
    keyword: str = "",
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    query = select(User)
    if keyword:
        query = query.where(User.username.contains(keyword))
    total_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(total_query)).scalar()
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    users = result.scalars().all()
    return PaginatedResponse(data=[UserResponse.model_validate(u) for u in users], total=total, page=page, page_size=page_size)

@router.post("", response_model=Response[UserResponse])
async def create_user(
    data: UserCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(User).where(User.username == data.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="用户名已存在")
    user = User(username=data.username, password=get_password_hash(data.password), role=data.role, dept=data.dept, post=data.post)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return Response(data=UserResponse.model_validate(user))

@router.put("/{user_id}", response_model=Response[UserResponse])
async def update_user(
    user_id: int,
    data: UserUpdate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    if data.dept is not None:
        user.dept = data.dept
    if data.post is not None:
        user.post = data.post
    if data.status is not None:
        user.status = data.status
    await db.commit()
    await db.refresh(user)
    return Response(data=UserResponse.model_validate(user))

@router.delete("/{user_id}", response_model=Response)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    await db.delete(user)
    await db.commit()
    return Response(message="删除成功")
