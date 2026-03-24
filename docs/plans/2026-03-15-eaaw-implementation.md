# EAAW 企业AI Agent智能工作台 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 搭建企业AI Agent智能工作台（EAAW）V1.0，实现全栈演示功能，包括前端UI、后端API、数据库、AI Agent引擎。

**Architecture:** 采用 Monorepo 结构，前后端分离。后端使用 FastAPI + SQLAlchemy + SQLite，前端使用 React + Vite + Tailwind + Shadcn/UI，AI Agent 使用 LangGraph 实现模拟执行。

**Tech Stack:** 
- Backend: Python 3.11+, FastAPI, SQLAlchemy 2.0, SQLite, Pydantic V2, python-jose (JWT)
- Frontend: React 18, Vite, TypeScript, Tailwind CSS, Shadcn/UI, Zustand, TanStack Query, Lucide React
- Agent: LangGraph, LangChain (模拟执行，不调用真实AI)

---

## Phase 1: 项目基础设施搭建

### Task 1: 创建项目目录结构

**Files:**
- Create: `apps/api/` 目录结构
- Create: `apps/web/` 目录结构
- Create: `src/core/` 目录结构
- Create: `src/agents/` 目录结构

**Step 1: 创建后端目录结构**

```bash
mkdir -p apps/api/routes apps/api/models apps/api/schemas apps/api/services apps/api/utils
mkdir -p apps/api/tests
touch apps/api/__init__.py apps/api/routes/__init__.py apps/api/models/__init__.py
touch apps/api/schemas/__init__.py apps/api/services/__init__.py apps/api/utils/__init__.py
touch apps/api/tests/__init__.py
```

**Step 2: 创建前端目录结构**

```bash
mkdir -p apps/web/src/components apps/web/src/pages apps/web/src/hooks
mkdir -p apps/web/src/stores apps/web/src/services apps/web/src/types
mkdir -p apps/web/src/lib apps/web/src/assets
```

**Step 3: 创建核心库目录结构**

```bash
mkdir -p src/core src/agents
touch src/__init__.py src/core/__init__.py src/agents/__init__.py
```

**Step 4: 验证目录结构**

Run: `ls -la apps/ src/`
Expected: 看到完整的目录结构

---

### Task 2: 配置后端 Python 项目

**Files:**
- Create: `apps/api/pyproject.toml`
- Create: `apps/api/requirements.txt`
- Create: `apps/api/.env.example`

**Step 1: 创建 pyproject.toml**

```toml
[project]
name = "eaaw-api"
version = "1.0.0"
description = "Enterprise AI Agent Workbench API"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "sqlalchemy>=2.0.25",
    "aiosqlite>=0.19.0",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "python-multipart>=0.0.6",
    "httpx>=0.26.0",
    "langchain>=0.1.0",
    "langgraph>=0.0.20",
    "langchain-community>=0.0.10",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.23.0",
    "pytest-cov>=4.1.0",
    "httpx>=0.26.0",
    "ruff>=0.1.0",
    "mypy>=1.8.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
line-length = 120
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP"]
ignore = ["E501"]

[tool.mypy]
python_version = "3.11"
strict = true
ignore_missing_imports = true

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

**Step 2: 创建 requirements.txt**

```txt
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sqlalchemy>=2.0.25
aiosqlite>=0.19.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6
httpx>=0.26.0
langchain>=0.1.0
langgraph>=0.0.20
langchain-community>=0.0.10
```

**Step 3: 创建 .env.example**

```env
DATABASE_URL=sqlite+aiosqlite:///./eaaw.db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**Step 4: 创建虚拟环境并安装依赖**

```bash
cd apps/api && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
```

---

### Task 3: 配置前端 React 项目

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tailwind.config.js`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`

**Step 1: 创建 package.json**

```json
{
  "name": "eaaw-web",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "lucide-react": "^0.303.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "echarts": "^5.4.3",
    "echarts-for-react": "^3.0.2",
    "date-fns": "^3.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.18.0",
    "@typescript-eslint/parser": "^6.18.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

**Step 2: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

**Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 4: 创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 5: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
```

**Step 6: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 7: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EAAW - 企业AI Agent智能工作台</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 8: 安装前端依赖**

```bash
cd apps/web && npm install
```

---

## Phase 2: 后端核心模块开发

### Task 4: 创建数据库模型

**Files:**
- Create: `apps/api/models/database.py`
- Create: `apps/api/models/user.py`
- Create: `apps/api/models/agent.py`
- Create: `apps/api/models/task.py`
- Create: `apps/api/models/business.py`

**Step 1: 创建数据库连接配置**

```python
# apps/api/models/database.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./eaaw.db"
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    class Config:
        env_file = ".env"

settings = Settings()

engine = create_async_engine(settings.database_url, echo=True)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

**Step 2: 创建用户模型**

```python
# apps/api/models/user.py
from sqlalchemy import String, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "sys_user"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="employee")
    dept: Mapped[str] = mapped_column(String(100), nullable=True)
    post: Mapped[str] = mapped_column(String(100), nullable=True)
    status: Mapped[int] = mapped_column(Integer, default=1)
    create_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    update_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**Step 3: 创建 Agent 模型**

```python
# apps/api/models/agent.py
from sqlalchemy import String, Integer, DateTime, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from .database import Base

class AgentConfig(Base):
    __tablename__ = "ai_agent_config"

    agent_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    agent_name: Mapped[str] = mapped_column(String(100))
    agent_type: Mapped[str] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(Text, nullable=True)
    params: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[int] = mapped_column(Integer, default=1)
    create_user: Mapped[int] = mapped_column(Integer)
    create_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    update_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**Step 4: 创建任务模型**

```python
# apps/api/models/task.py
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
    execute_time: Mapped[float] = mapped_column(Float, nullable=True)
    result: Mapped[str] = mapped_column(Text, nullable=True)
    create_user: Mapped[int] = mapped_column(Integer)
    create_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_time: Mapped[datetime] = mapped_column(DateTime, nullable=True)

class TaskLog(Base):
    __tablename__ = "ai_task_log"

    log_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    task_id: Mapped[int] = mapped_column(Integer, index=True)
    step: Mapped[int] = mapped_column(Integer)
    thinking: Mapped[str] = mapped_column(Text, nullable=True)
    action: Mapped[str] = mapped_column(Text, nullable=True)
    log_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

**Step 5: 创建业务数据模型**

```python
# apps/api/models/business.py
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
    ip: Mapped[str] = mapped_column(String(50), nullable=True)
```

---

### Task 5: 创建 Pydantic Schemas

**Files:**
- Create: `apps/api/schemas/user.py`
- Create: `apps/api/schemas/agent.py`
- Create: `apps/api/schemas/task.py`
- Create: `apps/api/schemas/common.py`

**Step 1: 创建通用响应 Schema**

```python
# apps/api/schemas/common.py
from pydantic import BaseModel
from typing import Generic, TypeVar, Optional

T = TypeVar("T")

class Response(BaseModel, Generic[T]):
    code: int = 200
    message: str = "success"
    data: Optional[T] = None

class PaginatedResponse(BaseModel, Generic[T]):
    code: int = 200
    message: str = "success"
    data: Optional[list[T]] = None
    total: int = 0
    page: int = 1
    page_size: int = 10
```

**Step 2: 创建用户 Schema**

```python
# apps/api/schemas/user.py
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
```

**Step 3: 创建 Agent Schema**

```python
# apps/api/schemas/agent.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AgentCreate(BaseModel):
    agent_name: str
    agent_type: str
    description: Optional[str] = None
    params: Optional[str] = None

class AgentUpdate(BaseModel):
    agent_name: Optional[str] = None
    description: Optional[str] = None
    params: Optional[str] = None
    status: Optional[int] = None

class AgentResponse(BaseModel):
    agent_id: int
    agent_name: str
    agent_type: str
    description: Optional[str] = None
    params: Optional[str] = None
    status: int
    create_user: int
    create_time: datetime

    class Config:
        from_attributes = True
```

**Step 4: 创建任务 Schema**

```python
# apps/api/schemas/task.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    agent_id: int
    task_content: str

class TaskResponse(BaseModel):
    task_id: int
    agent_id: int
    task_content: str
    status: str
    execute_time: Optional[float] = None
    result: Optional[str] = None
    create_user: int
    create_time: datetime
    end_time: Optional[datetime] = None

    class Config:
        from_attributes = True

class TaskLogResponse(BaseModel):
    log_id: int
    task_id: int
    step: int
    thinking: Optional[str] = None
    action: Optional[str] = None
    log_time: datetime

    class Config:
        from_attributes = True
```

---

### Task 6: 创建认证服务

**Files:**
- Create: `apps/api/utils/auth.py`
- Create: `apps/api/utils/deps.py`

**Step 1: 创建 JWT 认证工具**

```python
# apps/api/utils/auth.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from ..models.database import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def decode_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None
```

**Step 2: 创建依赖注入**

```python
# apps/api/utils/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.database import get_db
from ..models.user import User
from .auth import decode_token

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证"
        )
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证"
        )
    result = await db.execute(select(User).where(User.user_id == int(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在"
        )
    return user

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["admin", "tech"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足"
        )
    return current_user
```

---

### Task 7: 创建 API 路由

**Files:**
- Create: `apps/api/routes/auth.py`
- Create: `apps/api/routes/users.py`
- Create: `apps/api/routes/agents.py`
- Create: `apps/api/routes/tasks.py`
- Create: `apps/api/routes/dashboard.py`

**Step 1: 创建认证路由**

```python
# apps/api/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.database import get_db
from ..models.user import User
from ..schemas.user import UserLogin, UserResponse, Token, PasswordChange
from ..schemas.common import Response
from ..utils.auth import verify_password, get_password_hash, create_access_token
from ..utils.deps import get_current_user

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
```

**Step 2: 创建用户管理路由**

```python
# apps/api/routes/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ..models.database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate, UserResponse
from ..schemas.common import Response, PaginatedResponse
from ..utils.auth import get_password_hash
from ..utils.deps import get_current_admin, get_current_user

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
```

**Step 3: 创建 Agent 路由**

```python
# apps/api/routes/agents.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ..models.database import get_db
from ..models.agent import AgentConfig
from ..models.user import User
from ..schemas.agent import AgentCreate, AgentUpdate, AgentResponse
from ..schemas.common import Response, PaginatedResponse
from ..utils.deps import get_current_user

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
```

**Step 4: 创建任务路由**

```python
# apps/api/routes/tasks.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ..models.database import get_db
from ..models.task import TaskRecord, TaskLog
from ..models.agent import AgentConfig
from ..models.user import User
from ..schemas.task import TaskCreate, TaskResponse, TaskLogResponse
from ..schemas.common import Response, PaginatedResponse
from ..utils.deps import get_current_user
from ..services.agent_executor import execute_agent_task

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
    execute_agent_task.delay(task.task_id, agent.agent_type, data.task_content)
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
```

**Step 5: 创建数据看板路由**

```python
# apps/api/routes/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from ..models.database import get_db
from ..models.task import TaskRecord
from ..models.agent import AgentConfig
from ..models.user import User
from ..schemas.common import Response
from ..utils.deps import get_current_user

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
```

---

### Task 8: 创建 Agent 执行服务

**Files:**
- Create: `apps/api/services/agent_executor.py`

**Step 1: 创建 Agent 执行器**

```python
# apps/api/services/agent_executor.py
import asyncio
import random
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.database import async_session_maker
from ..models.task import TaskRecord, TaskLog

AGENT_TEMPLATES = {
    "business_query": {
        "steps": [
            {"thinking": "分析任务指令，识别查询意图...", "action": "解析关键词: 查询、统计"},
            {"thinking": "确定查询时间范围和数据类型...", "action": "时间范围: 本月, 数据类型: 工单"},
            {"thinking": "调用业务数据接口获取数据...", "action": "SELECT * FROM biz_data WHERE type='工单'"},
            {"thinking": "整理数据并生成报告...", "action": "生成统计报告"}
        ],
        "result_template": "查询完成。共找到 {count} 条相关记录，其中已完成 {completed} 条，处理中 {processing} 条，平均处理时长 {avg_time} 小时。"
    },
    "process_handler": {
        "steps": [
            {"thinking": "识别流程类型，确定处理步骤...", "action": "流程类型: 审批流程"},
            {"thinking": "检查流程前置条件...", "action": "验证: 权限检查通过"},
            {"thinking": "执行流程处理逻辑...", "action": "更新流程状态"},
            {"thinking": "发送通知并记录日志...", "action": "通知已发送"}
        ],
        "result_template": "流程处理完成。已成功处理 {count} 个流程节点，当前状态: {status}，下一步: {next_step}。"
    },
    "doc_summarizer": {
        "steps": [
            {"thinking": "读取文档内容，分析文档结构...", "action": "文档长度: 5000字"},
            {"thinking": "提取关键信息和核心观点...", "action": "提取关键词: 项目、计划、目标"},
            {"thinking": "生成结构化摘要...", "action": "生成摘要大纲"},
            {"thinking": "优化摘要表达...", "action": "润色完成"}
        ],
        "result_template": "文档摘要生成完成。文档主题: {topic}，核心要点: {key_points}，建议阅读时长: {read_time} 分钟。"
    }
}

async def execute_agent_task(task_id: int, agent_type: str, task_content: str):
    async with async_session_maker() as db:
        result = await db.execute(select(TaskRecord).where(TaskRecord.task_id == task_id))
        task = result.scalar_one_or_none()
        if not task:
            return
        task.status = "running"
        await db.commit()
        template = AGENT_TEMPLATES.get(agent_type, AGENT_TEMPLATES["business_query"])
        start_time = datetime.utcnow()
        for i, step in enumerate(template["steps"], 1):
            await asyncio.sleep(random.uniform(0.5, 1.5))
            log = TaskLog(
                task_id=task_id,
                step=i,
                thinking=step["thinking"],
                action=step["action"],
                log_time=datetime.utcnow()
            )
            db.add(log)
            await db.commit()
        await asyncio.sleep(random.uniform(0.5, 1.0))
        end_time = datetime.utcnow()
        execute_time = (end_time - start_time).total_seconds()
        result_data = {
            "count": random.randint(10, 100),
            "completed": random.randint(5, 50),
            "processing": random.randint(1, 10),
            "avg_time": round(random.uniform(1.5, 8.0), 1),
            "status": "已完成",
            "next_step": "等待下一步指令",
            "topic": "工作汇报",
            "key_points": "1. 项目进展顺利 2. 里程碑已达成 3. 下阶段计划明确",
            "read_time": random.randint(3, 10)
        }
        task.result = template["result_template"].format(**result_data)
        task.status = "completed"
        task.execute_time = execute_time
        task.end_time = end_time
        await db.commit()
```

---

### Task 9: 创建主应用入口

**Files:**
- Create: `apps/api/main.py`

**Step 1: 创建 FastAPI 主应用**

```python
# apps/api/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models.database import init_db
from .routes import auth, users, agents, tasks, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="EAAW API",
    description="企业AI Agent智能工作台 API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
```

---

## Phase 3: 前端开发

### Task 10: 创建前端基础组件

**Files:**
- Create: `apps/web/src/lib/utils.ts`
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/stores/auth.ts`
- Create: `apps/web/src/types/index.ts`

**Step 1: 创建工具函数**

```typescript
// apps/web/src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
```

**Step 2: 创建 API 客户端**

```typescript
// apps/web/src/lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

**Step 3: 创建类型定义**

```typescript
// apps/web/src/types/index.ts
export interface User {
  user_id: number
  username: string
  role: string
  dept: string | null
  post: string | null
  status: number
  create_time: string
}

export interface Agent {
  agent_id: number
  agent_name: string
  agent_type: string
  description: string | null
  params: string | null
  status: number
  create_user: number
  create_time: string
}

export interface Task {
  task_id: number
  agent_id: number
  task_content: string
  status: string
  execute_time: number | null
  result: string | null
  create_user: number
  create_time: string
  end_time: string | null
}

export interface TaskLog {
  log_id: number
  task_id: number
  step: number
  thinking: string | null
  action: string | null
  log_time: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  code: number
  message: string
  data: T[]
  total: number
  page: number
  page_size: number
}
```

**Step 4: 创建认证 Store**

```typescript
// apps/web/src/stores/auth.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  setToken: (token: string) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => {
        set({ token: null, user: null })
        localStorage.removeItem('token')
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
```

---

### Task 11: 创建前端页面组件

**Files:**
- Create: `apps/web/src/pages/Login.tsx`
- Create: `apps/web/src/pages/Layout.tsx`
- Create: `apps/web/src/pages/Dashboard.tsx`
- Create: `apps/web/src/pages/Agents.tsx`
- Create: `apps/web/src/pages/Tasks.tsx`

**Step 1: 创建登录页面**

```tsx
// apps/web/src/pages/Login.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import api from '@/lib/api'

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { username, password })
      setToken(res.data.access_token)
      localStorage.setItem('token', res.data.access_token)
      const userRes = await api.get('/auth/me')
      setUser(userRes.data)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">EAAW 智能工作台</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          内部测试环境 v1.0.0 | 非生产环境
        </p>
      </div>
    </div>
  )
}
```

**Step 2: 创建布局组件**

```tsx
// apps/web/src/pages/Layout.tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { 
  Bot, 
  ListTodo, 
  BarChart3, 
  User, 
  Settings, 
  Activity,
  LogOut 
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'AI Agent控制台', icon: Bot },
  { to: '/tasks', label: '任务中心', icon: ListTodo },
  { to: '/dashboard', label: '数据看板', icon: BarChart3 },
  { to: '/profile', label: '个人中心', icon: User },
]

const adminNavItems = [
  { to: '/settings', label: '系统设置', icon: Settings, roles: ['admin'] },
  { to: '/monitor', label: '系统监控', icon: Activity, roles: ['admin', 'tech'] },
]

export function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredAdminNav = adminNavItems.filter(
    (item) => user && item.roles.includes(user.role)
  )

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">EAAW</h1>
          <p className="text-xs text-gray-400">企业AI Agent智能工作台</p>
        </div>
        <nav className="p-4">
          {[...navItems, ...filteredAdminNav].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md mb-1 ${
                  isActive ? 'bg-primary-600' : 'hover:bg-gray-800'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            内部测试环境 v1.0.0 | 非生产环境
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.username} ({user?.dept})</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <LogOut size={18} />
              退出
            </button>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
```

**Step 3: 创建 Agent 列表页面**

```tsx
// apps/web/src/pages/Agents.tsx
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import type { Agent, PaginatedResponse } from '@/types'

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const res = await api.get<any, PaginatedResponse<Agent>>('/agents')
      setAgents(res.data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>加载中...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">AI Agent 控制台</h2>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md">
          创建 Agent
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">名称</th>
              <th className="px-4 py-3 text-left">类型</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">创建时间</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.agent_id} className="border-t">
                <td className="px-4 py-3">{agent.agent_name}</td>
                <td className="px-4 py-3">{agent.agent_type}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      agent.status === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {agent.status === 1 ? '启用' : '禁用'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(agent.create_time).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button className="text-primary-600 hover:underline mr-2">
                    编辑
                  </button>
                  <button className="text-red-600 hover:underline">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**Step 4: 创建任务中心页面**

```tsx
// apps/web/src/pages/Tasks.tsx
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import type { Task, TaskLog, PaginatedResponse, ApiResponse } from '@/types'

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [logs, setLogs] = useState<TaskLog[]>([])

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await api.get<any, PaginatedResponse<Task>>('/tasks')
      setTasks(res.data)
    } finally {
      setLoading(false)
    }
  }

  const viewTaskDetail = async (task: Task) => {
    setSelectedTask(task)
    const res = await api.get<any, ApiResponse<TaskLog[]>>(`/tasks/${task.task_id}/logs`)
    setLogs(res.data)
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }

  const statusLabels: Record<string, string> = {
    pending: '待执行',
    running: '执行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  }

  if (loading) return <div>加载中...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">任务中心</h2>
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">任务ID</th>
              <th className="px-4 py-3 text-left">任务指令</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">耗时</th>
              <th className="px-4 py-3 text-left">提交时间</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.task_id} className="border-t">
                <td className="px-4 py-3">#{task.task_id}</td>
                <td className="px-4 py-3 max-w-xs truncate">
                  {task.task_content}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      statusColors[task.status]
                    }`}
                  >
                    {statusLabels[task.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {task.execute_time ? `${task.execute_time}s` : '-'}
                </td>
                <td className="px-4 py-3">
                  {new Date(task.create_time).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => viewTaskDetail(task)}
                    className="text-primary-600 hover:underline"
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-bold mb-4">任务详情 #{selectedTask.task_id}</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500">任务指令</p>
              <p>{selectedTask.task_content}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">执行结果</p>
              <p>{selectedTask.result || '暂无结果'}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">执行日志</p>
              <div className="bg-gray-50 rounded p-4 space-y-2">
                {logs.map((log) => (
                  <div key={log.log_id} className="text-sm">
                    <p className="font-medium">步骤 {log.step}</p>
                    <p className="text-gray-600">思考: {log.thinking}</p>
                    <p className="text-gray-500">动作: {log.action}</p>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setSelectedTask(null)}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 5: 创建数据看板页面**

```tsx
// apps/web/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import api from '@/lib/api'

interface Stats {
  agent_count: number
  task_count: number
  completed_count: number
  success_rate: number
}

interface TrendItem {
  date: string
  count: number
  success_rate: number
}

interface AgentEfficiency {
  agent_name: string
  agent_type: string
  task_count: number
  completion_rate: number
  avg_time: number
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [trend, setTrend] = useState<TrendItem[]>([])
  const [efficiency, setEfficiency] = useState<AgentEfficiency[]>([])

  useEffect(() => {
    fetchStats()
    fetchTrend()
    fetchEfficiency()
  }, [])

  const fetchStats = async () => {
    const res = await api.get('/dashboard/stats')
    setStats(res.data)
  }

  const fetchTrend = async () => {
    const res = await api.get('/dashboard/trend')
    setTrend(res.data)
  }

  const fetchEfficiency = async () => {
    const res = await api.get('/dashboard/agent-efficiency')
    setEfficiency(res.data)
  }

  const trendOption = {
    title: { text: '近7天任务趋势' },
    xAxis: { type: 'category', data: trend.map((t) => t.date) },
    yAxis: { type: 'value' },
    series: [
      { name: '任务数', type: 'bar', data: trend.map((t) => t.count) },
      {
        name: '成功率(%)',
        type: 'line',
        data: trend.map((t) => t.success_rate),
      },
    ],
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">数据看板</h2>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Agent数量</p>
          <p className="text-3xl font-bold">{stats?.agent_count || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">任务总数</p>
          <p className="text-3xl font-bold">{stats?.task_count || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">已完成</p>
          <p className="text-3xl font-bold">{stats?.completed_count || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">成功率</p>
          <p className="text-3xl font-bold">{stats?.success_rate || 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <ReactECharts option={trendOption} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-4">Agent效率统计</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pb-2">名称</th>
                <th className="pb-2">类型</th>
                <th className="pb-2">任务数</th>
                <th className="pb-2">完成率</th>
              </tr>
            </thead>
            <tbody>
              {efficiency.map((e, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">{e.agent_name}</td>
                  <td className="py-2">{e.agent_type}</td>
                  <td className="py-2">{e.task_count}</td>
                  <td className="py-2">{e.completion_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

---

### Task 12: 配置前端路由

**Files:**
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`

**Step 1: 创建主入口**

```tsx
// apps/web/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
```

**Step 2: 创建 App 组件**

```tsx
// apps/web/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Login } from '@/pages/Login'
import { Layout } from '@/pages/Layout'
import { Agents } from '@/pages/Agents'
import { Tasks } from '@/pages/Tasks'
import { Dashboard } from '@/pages/Dashboard'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  if (!token) {
    return <Navigate to="/login" />
  }
  return <>{children}</>
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Agents />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

**Step 3: 创建 CSS 文件**

```css
/* apps/web/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
```

---

## Phase 4: 数据初始化与测试

### Task 13: 创建数据初始化脚本

**Files:**
- Create: `apps/api/init_data.py`

**Step 1: 创建初始化脚本**

```python
# apps/api/init_data.py
import asyncio
from sqlalchemy import select
from models.database import async_session_maker, init_db
from models.user import User
from models.agent import AgentConfig
from models.business import BusinessData
from utils.auth import get_password_hash

async def init_data():
    await init_db()
    async with async_session_maker() as db:
        users = [
            User(username="admin", password=get_password_hash("admin123"), role="admin", dept="数字化部", post="系统管理员"),
            User(username="tech", password=get_password_hash("tech123"), role="tech", dept="技术部", post="技术支持"),
            User(username="zhangsan", password=get_password_hash("123456"), role="employee", dept="市场部", post="市场专员"),
            User(username="lisi", password=get_password_hash("123456"), role="employee", dept="销售部", post="销售经理"),
            User(username="wangwu", password=get_password_hash("123456"), role="employee", dept="人事部", post="HR专员"),
        ]
        for user in users:
            existing = await db.execute(select(User).where(User.username == user.username))
            if not existing.scalar_one_or_none():
                db.add(user)
        
        agents = [
            AgentConfig(agent_name="工单查询助手", agent_type="business_query", description="查询和分析工单数据", create_user=1),
            AgentConfig(agent_name="流程审批助手", agent_type="process_handler", description="处理审批流程", create_user=1),
            AgentConfig(agent_name="文档摘要助手", agent_type="doc_summarizer", description="生成文档摘要", create_user=1),
        ]
        for agent in agents:
            existing = await db.execute(select(AgentConfig).where(AgentConfig.agent_name == agent.agent_name))
            if not existing.scalar_one_or_none():
                db.add(agent)
        
        biz_data = [
            BusinessData(biz_type="工单", biz_content='{"title": "系统故障报告", "status": "已完成", "priority": "高"}'),
            BusinessData(biz_type="工单", biz_content='{"title": "网络连接问题", "status": "处理中", "priority": "中"}'),
            BusinessData(biz_type="合同", biz_content='{"title": "销售合同A", "status": "待审批", "amount": 50000}'),
        ]
        for data in biz_data:
            db.add(data)
        
        await db.commit()
    print("数据初始化完成!")

if __name__ == "__main__":
    asyncio.run(init_data())
```

---

### Task 14: 创建启动脚本

**Files:**
- Create: `apps/api/run.py`

**Step 1: 创建启动脚本**

```python
# apps/api/run.py
import uvicorn
from init_data import init_data
import asyncio

if __name__ == "__main__":
    asyncio.run(init_data())
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

---

## 执行顺序总结

1. **Phase 1**: 项目基础设施搭建 (Task 1-3)
2. **Phase 2**: 后端核心模块开发 (Task 4-9)
3. **Phase 3**: 前端开发 (Task 10-12)
4. **Phase 4**: 数据初始化与测试 (Task 13-14)

每个 Task 应按顺序执行，确保每一步都验证通过后再继续。
