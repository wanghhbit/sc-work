from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.database import get_db
from models.user import User
from schemas.user import UserLogin, UserResponse, Token, PasswordChange
from schemas.common import Response
from utils.auth import verify_password, get_password_hash, create_access_token
from utils.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["认证"])

@router.post("/login", response_model=Response[Token])
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误")
    if user.status != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="账号已被禁用")
    access_token = create_access_token(data={"sub": str(user.user_id), "role": user.role})
    return Response(data=Token(access_token=access_token))

@router.get("/me", response_model=Response[UserResponse])
async def get_me(current_user: User = Depends(get_current_user)):
    return Response(data=UserResponse.model_validate(current_user))

@router.post("/change-password", response_model=Response)
async def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(data.old_password, current_user.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="原密码错误")
    current_user.password = get_password_hash(data.new_password)
    await db.commit()
    return Response(message="密码修改成功")
