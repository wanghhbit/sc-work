# Token用量统计系统完整设计方案

## 一、需求分析

### 1.1 业务背景

实现对每个agent、任务、用户维度的LLM token用量统计功能，支持实时查询、多粒度聚合、趋势预测和异常检测。

### 1.2 核心需求

#### 1.2.1 Agent维度统计指标

**基础指标**：
- 总token消耗（prompt + completion + total）
- 平均token/任务
- 任务数量统计
- 调用次数统计

**趋势指标**：
- token使用趋势（按时间粒度：小时/天/周/月）
- 环比增长率
- 同比增长率

**异常指标**：
- 单次调用异常（超过平均值3倍标准差）
- 高频调用异常（1小时内调用次数超过阈值）
- 突增突降异常（日用量环比变化超过50%）

#### 1.2.2 任务维度统计指标

**基础指标**：
- 任务类型分布（按agent_id分组）
- 各类型任务token消耗对比
- 任务完成率与token关系
- 高消耗任务TOP N

**趋势指标**：
- 任务执行时间趋势
- 任务token消耗趋势
- 任务成功率趋势

**异常指标**：
- 超时任务检测
- 高消耗任务检测
- 失败任务分析

#### 1.2.3 用户维度统计指标

**基础指标**：
- 用户token使用总量
- 活跃用户token消耗排行
- 用户任务频率统计
- 用户调用次数统计

**趋势指标**：
- 用户使用趋势（按时间粒度）
- 用户活跃度趋势
- 用户token消耗增长趋势

**异常指标**：
- 异常高频用户检测
- 用户用量突增检测

### 1.3 非功能需求

#### 1.3.1 性能要求

- 实时查询响应时间 < 500ms
- 支持百万级数据量
- 支持并发查询

#### 1.3.2 可扩展性要求

- 支持新增统计维度
- 支持新增统计指标
- 支持自定义时间范围

#### 1.3.3 可维护性要求

- 代码结构清晰
- 易于测试
- 易于监控

## 二、技术方案设计

### 2.1 架构设计

采用分层架构，分为四层：

```
┌─────────────────────────────────────────┐
│           API Layer (FastAPI)           │
│  /api/stats/agent/*                     │
│  /api/stats/task/*                      │
│  /api/stats/user/*                      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Statistics Service Layer           │
│  - AgentStatisticsService               │
│  - TaskStatisticsService                │
│  - UserStatisticsService                │
│  - TrendAnalyzer                        │
│  - AnomalyDetector                      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Data Access Layer               │
│  - TokenUsageRepository                 │
│  - TaskRecordRepository                 │
│  - UserRepository                       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Database Layer                  │
│  - TokenUsage (ai_token_usage)          │
│  - TaskRecord (ai_task_record)          │
│  - User (sys_user)                      │
│  - AgentConfig (ai_agent_config)        │
└─────────────────────────────────────────┘
```

### 2.2 数据模型设计

#### 2.2.1 现有表优化

**TokenUsage表索引优化**：

```python
# 新增复合索引
Index('idx_create_time', 'create_time')
Index('idx_agent_time', 'agent_id', 'create_time')
Index('idx_user_time', 'user_id', 'create_time')
Index('idx_task_time', 'task_id', 'create_time')
Index('idx_model_time', 'model_name', 'create_time')
```

#### 2.2.2 新增统计缓存表（可选）

```python
class StatsCache(Base):
    __tablename__ = "ai_stats_cache"
    
    cache_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cache_key: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    cache_data: Mapped[str] = mapped_column(Text)  # JSON格式
    granularity: Mapped[str] = mapped_column(String(20))  # hour/day/week/month
    time_range: Mapped[str] = mapped_column(String(50))
    create_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expire_time: Mapped[datetime] = mapped_column(DateTime)
```

### 2.3 核心组件设计

#### 2.3.1 统计服务基类

```python
from abc import ABC, abstractmethod
from typing import Literal

TimeRange = Literal["1h", "24h", "7d", "30d"]
Granularity = Literal["hour", "day", "week", "month"]

class BaseStatisticsService(ABC):
    @abstractmethod
    async def get_overview(self, time_range: TimeRange) -> dict:
        """获取概览统计"""
        pass
    
    @abstractmethod
    async def get_trend(
        self, 
        time_range: TimeRange, 
        granularity: Granularity
    ) -> list[dict]:
        """获取趋势数据"""
        pass
    
    @abstractmethod
    async def get_ranking(
        self, 
        time_range: TimeRange, 
        limit: int = 10
    ) -> list[dict]:
        """获取排行榜"""
        pass
```

#### 2.3.2 Agent统计服务

```python
class AgentStatisticsService(BaseStatisticsService):
    async def get_overview(self, time_range: TimeRange) -> dict:
        """Agent维度概览"""
        return {
            "total_agents": int,
            "total_tokens": int,
            "total_calls": int,
            "avg_tokens_per_call": float,
            "top_agent": dict,
        }
    
    async def get_trend(
        self, 
        time_range: TimeRange, 
        granularity: Granularity,
        agent_id: int | None = None
    ) -> list[dict]:
        """Agent趋势数据"""
        pass
    
    async def get_ranking(
        self, 
        time_range: TimeRange,
        sort_by: Literal["total_tokens", "call_count", "avg_tokens"],
        limit: int = 10
    ) -> list[dict]:
        """Agent排行榜"""
        pass
    
    async def detect_anomalies(
        self, 
        time_range: TimeRange
    ) -> list[dict]:
        """Agent异常检测"""
        pass
```

#### 2.3.3 Task统计服务

```python
class TaskStatisticsService(BaseStatisticsService):
    async def get_distribution(
        self, 
        time_range: TimeRange
    ) -> dict:
        """任务类型分布"""
        pass
    
    async def get_comparison(
        self, 
        time_range: TimeRange
    ) -> list[dict]:
        """任务类型对比"""
        pass
    
    async def get_top_consumers(
        self, 
        time_range: TimeRange,
        limit: int = 10
    ) -> list[dict]:
        """高消耗任务TOP N"""
        pass
    
    async def get_completion_rate_analysis(
        self, 
        time_range: TimeRange
    ) -> dict:
        """任务完成率与token关系分析"""
        pass
```

#### 2.3.4 User统计服务

```python
class UserStatisticsService(BaseStatisticsService):
    async def get_overview(self, time_range: TimeRange) -> dict:
        """用户维度概览"""
        return {
            "total_users": int,
            "active_users": int,
            "total_tokens": int,
            "avg_tokens_per_user": float,
        }
    
    async def get_ranking(
        self, 
        time_range: TimeRange,
        sort_by: Literal["total_tokens", "task_count", "call_count"],
        limit: int = 10
    ) -> list[dict]:
        """用户排行榜"""
        pass
    
    async def get_user_trend(
        self,
        user_id: int,
        time_range: TimeRange,
        granularity: Granularity
    ) -> list[dict]:
        """单个用户趋势"""
        pass
```

#### 2.3.5 趋势分析器

```python
class TrendAnalyzer:
    def linear_regression_predict(
        self, 
        historical_data: list[float],
        predict_days: int
    ) -> tuple[list[float], float]:
        """线性回归预测"""
        pass
    
    def calculate_growth_rate(
        self,
        current_value: float,
        previous_value: float
    ) -> float:
        """计算增长率"""
        pass
    
    def detect_trend_direction(
        self,
        data: list[float]
    ) -> Literal["increasing", "decreasing", "stable"]:
        """检测趋势方向"""
        pass
```

#### 2.3.6 异常检测器

```python
class AnomalyDetector:
    def detect_statistical_anomaly(
        self,
        values: list[float],
        threshold: float = 3.0
    ) -> list[tuple[int, float]]:
        """统计学异常检测（3σ原则）"""
        pass
    
    def detect_frequency_anomaly(
        self,
        frequency: int,
        threshold: int = 50
    ) -> bool:
        """频率异常检测"""
        pass
    
    def detect_sudden_change(
        self,
        current: float,
        previous: float,
        threshold: float = 0.5
    ) -> tuple[bool, float]:
        """突增突降检测"""
        pass
```

### 2.4 API接口设计

#### 2.4.1 Agent维度API

```
GET /api/stats/agent/overview
Query参数:
  - time_range: "1h" | "24h" | "7d" | "30d"

响应:
{
  "code": 200,
  "data": {
    "total_agents": 15,
    "total_tokens": 1250000,
    "total_calls": 3500,
    "avg_tokens_per_call": 357.14,
    "top_agent": {
      "agent_id": 1,
      "agent_name": "CodeAssistant",
      "total_tokens": 450000
    }
  }
}

GET /api/stats/agent/trend
Query参数:
  - time_range: "1h" | "24h" | "7d" | "30d"
  - granularity: "hour" | "day" | "week" | "month"
  - agent_id: int (可选)

响应:
{
  "code": 200,
  "data": {
    "trend": [
      {
        "time": "2026-03-22 10:00",
        "total_tokens": 15000,
        "call_count": 45
      }
    ],
    "prediction": [...],
    "confidence": 0.85,
    "growth_trend": "increasing"
  }
}

GET /api/stats/agent/ranking
Query参数:
  - time_range: "1h" | "24h" | "7d" | "30d"
  - sort_by: "total_tokens" | "call_count" | "avg_tokens"
  - limit: int (default: 10)

响应:
{
  "code": 200,
  "data": {
    "ranking": [
      {
        "rank": 1,
        "agent_id": 1,
        "agent_name": "CodeAssistant",
        "total_tokens": 450000,
        "call_count": 1200,
        "avg_tokens_per_call": 375.0,
        "growth_rate": 15.5
      }
    ]
  }
}

GET /api/stats/agent/anomaly
Query参数:
  - time_range: "1h" | "24h" | "7d" | "30d"
  - severity: "all" | "low" | "medium" | "high"

响应:
{
  "code": 200,
  "data": {
    "anomalies": [
      {
        "anomaly_id": "high_single_123",
        "anomaly_type": "high_single_call",
        "agent_id": 1,
        "agent_name": "CodeAssistant",
        "task_id": 456,
        "detected_time": "2026-03-22T10:30:00",
        "severity": "high",
        "details": {
          "token_count": 5000,
          "threshold": 1500,
          "ratio": 3.33
        }
      }
    ],
    "total_count": 5,
    "high_severity_count": 2
  }
}
```

#### 2.4.2 Task维度API

```
GET /api/stats/task/distribution
Query参数:
  - time_range: "1h" | "24h" | "7d" | "30d"

响应:
{
  "code": 200,
  "data": {
    "distribution": [
      {
        "agent_id": 1,
        "agent_name": "CodeAssistant",
        "task_count": 150,
        "total_tokens": 45000,
        "percentage": 35.5
      }
    ]
  }
}

GET /api/stats/task/comparison
Query参数:
  - time_range: "1h" | "24h" | "7d" | "30d"

响应:
{
  "code": 200,
  "data": {
    "comparison": [
      {
        "agent_id": 1,
        "agent_name": "CodeAssistant",
        "avg_tokens_per_task": 300,
        "avg_execution_time": 2.5,
        "success_rate": 95.5
      }
    ]
  }
}

GET /api/stats/task/top
Query参数:
  - time_range: "1h" | "24h" | "7d" | "30d"
  - limit: int (default: 10)

响应:
{
  "code": 200,
  "data": {
    "top_tasks": [
      {
        "task_id": 123,
        "agent_name": "CodeAssistant",
        "total_tokens": 5000,
        "status": "completed",
        "create_time": "2026-03-22T10:00:00"
      }
    ]
  }
}
```

#### 2.4.3 User维度API

```
GET /api/stats/user/overview
Query参数:
  - time_range: "1h" | "24h" | "7d" | "30d"

响应:
{
  "code": 200,
  "data": {
    "total_users": 50,
    "active_users": 35,
    "total_tokens": 1250000,
    "avg_tokens_per_user": 35714.29
  }
}

GET /api/stats/user/ranking
Query参数:
  - time_range: "1h" | "24h" | "7d" | "30d"
  - sort_by: "total_tokens" | "task_count" | "call_count"
  - limit: int (default: 10)

响应:
{
  "code": 200,
  "data": {
    "ranking": [
      {
        "rank": 1,
        "user_id": 1,
        "username": "zhang_san",
        "total_tokens": 150000,
        "task_count": 45,
        "call_count": 350
      }
    ]
  }
}

GET /api/stats/user/{user_id}/trend
Query参数:
  - time_range: "1h" | "24h" | "7d" | "30d"
  - granularity: "hour" | "day" | "week" | "month"

响应:
{
  "code": 200,
  "data": {
    "trend": [
      {
        "time": "2026-03-22",
        "total_tokens": 5000,
        "task_count": 15,
        "call_count": 45
      }
    ]
  }
}
```

### 2.5 性能优化方案

#### 2.5.1 数据库优化

1. **索引优化**：创建复合索引支持时间范围查询
2. **分区表**：按时间分区，提升历史数据查询性能
3. **查询优化**：使用SQL聚合函数，避免内存计算

#### 2.5.2 缓存策略

1. **内存缓存**：使用`functools.lru_cache`缓存热点查询
2. **Redis缓存**：缓存统计结果，设置合理过期时间
3. **缓存键设计**：`stats:{dimension}:{time_range}:{granularity}:{params}`

#### 2.5.3 异步处理

1. **并发查询**：使用`asyncio.gather`并发执行多个查询
2. **流式响应**：大数据量使用流式响应

## 三、开发计划

### 3.1 功能模块拆解

#### Phase 1: 基础设施搭建（2天）

**任务1.1：数据模型优化**
- 为TokenUsage表添加索引
- 创建StatsCache表（可选）
- 编写数据库迁移脚本

**任务1.2：基础组件开发**
- 创建BaseStatisticsService抽象类
- 创建TimeRange和Granularity枚举
- 创建通用Pydantic响应模型

**交付物**：
- 数据库迁移脚本
- 基础组件代码
- 单元测试

#### Phase 2: Agent维度统计（3天）

**任务2.1：Agent概览统计**
- 实现get_overview方法
- 创建API接口
- 编写单元测试

**任务2.2：Agent趋势分析**
- 实现get_trend方法
- 实现线性回归预测
- 创建API接口
- 编写单元测试

**任务2.3：Agent排行榜**
- 实现get_ranking方法
- 支持多维度排序
- 创建API接口
- 编写单元测试

**任务2.4：Agent异常检测**
- 实现detect_anomalies方法
- 支持多种异常类型
- 创建API接口
- 编写单元测试

**交付物**：
- AgentStatisticsService完整实现
- API接口文档
- 单元测试覆盖率>80%

#### Phase 3: Task维度统计（2天）

**任务3.1：任务分布统计**
- 实现get_distribution方法
- 创建API接口
- 编写单元测试

**任务3.2：任务对比分析**
- 实现get_comparison方法
- 创建API接口
- 编写单元测试

**任务3.3：高消耗任务分析**
- 实现get_top_consumers方法
- 创建API接口
- 编写单元测试

**交付物**：
- TaskStatisticsService完整实现
- API接口文档
- 单元测试覆盖率>80%

#### Phase 4: User维度统计（2天）

**任务4.1：用户概览统计**
- 实现get_overview方法
- 创建API接口
- 编写单元测试

**任务4.2：用户排行榜**
- 实现get_ranking方法
- 支持多维度排序
- 创建API接口
- 编写单元测试

**任务4.3：用户趋势分析**
- 实现get_user_trend方法
- 创建API接口
- 编写单元测试

**交付物**：
- UserStatisticsService完整实现
- API接口文档
- 单元测试覆盖率>80%

#### Phase 5: 高级功能（2天）

**任务5.1：缓存优化**
- 实现Redis缓存
- 设计缓存失效策略
- 性能测试

**任务5.2：异常检测优化**
- 优化异常检测算法
- 添加更多异常类型
- 准确率测试

**任务5.3：API文档完善**
- 编写Swagger文档
- 编写使用示例
- 编写最佳实践

**交付物**：
- 缓存实现代码
- 性能测试报告
- 完整API文档

### 3.2 开发时间表

| 阶段 | 任务 | 预计时间 | 里程碑 |
|------|------|----------|--------|
| Phase 1 | 基础设施搭建 | 2天 | 数据模型就绪 |
| Phase 2 | Agent维度统计 | 3天 | Agent API可用 |
| Phase 3 | Task维度统计 | 2天 | Task API可用 |
| Phase 4 | User维度统计 | 2天 | User API可用 |
| Phase 5 | 高级功能 | 2天 | 系统优化完成 |

**总开发周期**：11个工作日

### 3.3 质量标准

#### 3.3.1 代码质量

- 代码覆盖率 > 80%
- 所有函数包含类型注解
- 所有函数包含文档字符串
- 通过ruff和black检查

#### 3.3.2 性能标准

- API响应时间 < 500ms
- 支持100并发查询
- 内存使用 < 500MB

#### 3.3.3 可维护性标准

- 代码结构清晰
- 易于扩展新维度
- 易于添加新指标

### 3.4 测试方案

#### 3.4.1 单元测试

```python
# tests/services/test_agent_statistics.py
import pytest
from services.statistics.agent_statistics import AgentStatisticsService

@pytest.mark.asyncio
async def test_get_agent_overview():
    service = AgentStatisticsService()
    result = await service.get_overview("7d")
    
    assert "total_agents" in result
    assert "total_tokens" in result
    assert result["total_tokens"] >= 0

@pytest.mark.asyncio
async def test_get_agent_trend():
    service = AgentStatisticsService()
    result = await service.get_trend("7d", "day")
    
    assert isinstance(result, list)
    assert len(result) > 0
    assert "time" in result[0]
    assert "total_tokens" in result[0]
```

#### 3.4.2 集成测试

```python
# tests/api/test_stats_api.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_agent_overview_api():
    response = client.get("/api/stats/agent/overview?time_range=7d")
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert "total_agents" in data["data"]
```

#### 3.4.3 性能测试

```python
# tests/performance/test_stats_performance.py
import asyncio
import time
from services.statistics.agent_statistics import AgentStatisticsService

async def test_concurrent_queries():
    service = AgentStatisticsService()
    
    start_time = time.time()
    tasks = [service.get_overview("7d") for _ in range(100)]
    results = await asyncio.gather(*tasks)
    end_time = time.time()
    
    assert end_time - start_time < 5.0  # 100个并发查询在5秒内完成
    assert len(results) == 100
```

## 四、部署方案

### 4.1 数据库迁移

```bash
# 创建迁移脚本
alembic revision --autogenerate -m "add_token_usage_indexes"

# 执行迁移
alembic upgrade head
```

### 4.2 配置管理

```python
# config.py
class Settings(BaseSettings):
    # 统计服务配置
    STATS_CACHE_ENABLED: bool = True
    STATS_CACHE_TTL: int = 300  # 5分钟
    STATS_QUERY_TIMEOUT: int = 30  # 30秒
    
    # 异常检测配置
    ANOMALY_DETECTION_ENABLED: bool = True
    HIGH_FREQUENCY_THRESHOLD: int = 50  # 1小时内调用次数阈值
    SUDDEN_CHANGE_THRESHOLD: float = 0.5  # 突增突降阈值
```

### 4.3 监控指标

```python
# 添加Prometheus指标
from prometheus_client import Counter, Histogram

stats_query_count = Counter(
    'stats_query_total',
    'Statistics query count',
    ['dimension', 'time_range']
)

stats_query_duration = Histogram(
    'stats_query_duration_seconds',
    'Statistics query duration',
    ['dimension', 'time_range']
)
```

## 五、风险评估

### 5.1 技术风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 数据量过大导致查询慢 | 高 | 中 | 添加索引、分区表、缓存 |
| 异常检测误报 | 中 | 中 | 调整阈值、添加白名单 |
| 缓存一致性问题 | 中 | 低 | 合理设置过期时间 |

### 5.2 业务风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 需求变更 | 高 | 中 | 采用可扩展架构 |
| 性能不达标 | 高 | 低 | 性能测试、优化 |

## 六、总结

本方案采用纯SQL聚合方式，基于现有SQLAlchemy基础设施，实现了agent、task、user三个维度的token用量统计功能。方案具备以下特点：

1. **实时性强**：支持实时查询，响应时间<500ms
2. **扩展性好**：基于抽象类设计，易于添加新维度
3. **可维护性高**：代码结构清晰，测试覆盖率高
4. **性能优化**：索引优化、缓存策略、异步处理

后续可根据实际使用情况，平滑迁移到时序数据库方案，进一步提升性能。
