from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.database import init_db
from routes import auth, users, agents, tasks, dashboard, token_usage
from routes import statistics as stats_router
from routes import stats as new_stats_router

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
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(token_usage.router, prefix="/api")
app.include_router(stats_router.router, prefix="/api")
app.include_router(new_stats_router.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
