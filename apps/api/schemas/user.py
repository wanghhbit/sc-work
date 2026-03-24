from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "employee"
    dept: Optional[str] = None
    post: Optional[str] = None

class UserUpdate(BaseModel):
    dept: Optional[str] = None
    post: Optional[str] = None
    status: Optional[int] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class UserResponse(BaseModel):
    user_id: int
    username: str
    role: str
    dept: Optional[str] = None
    post: Optional[str] = None
    status: int
    create_time: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None
    role: Optional[str] = None
