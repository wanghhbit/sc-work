# Agent Token用量统计增强方案设计

## 需求概述

实现对每个agent、任务维度的LLM token用量统计，增强数据可视化支持，包括：
1. Agent用量排行榜（多维度）
2. 用量趋势预测
3. 异常用量检测

## 技术方案

### 架构设计

采用方案2：创建独立的统计服务模块

```
services/
├── token_tracker.py      # 保持不变，负责token记录
└── statistics_service.py  # 新增，负责统计分析
```

### 数据模型设计

#### 排行榜数据结构

```python
class AgentRankingItem(BaseModel):
    agent_id: int
    agent_name: str
    agent_type: str
    total_tokens: int
    call_count: int
    avg_tokens_per_call: float
    growth_rate: float | None  # 本周vs上周增长率
    rank: int
```

#### 趋势预测数据结构

```python
class TrendPrediction(BaseModel):
    date: str
    actual_tokens: int | None  # 历史数据有实际值
    predicted_tokens: int | None  # 未来数据有预测值
    is_prediction: bool
```

#### 异常检测数据结构

```python
class AnomalyRecord(BaseModel):
    anomaly_id: str
    anomaly_type: str  # "high_single_call", "high_frequency", "sudden_spike", "sudden_drop"
    agent_id: int
    agent_name: str
    task_id: int | None
    detected_time: datetime
    details: dict
    severity: str  # "low", "medium", "high"
```

### API设计

#### 1. Agent排行榜

```
GET /api/statistics/ranking/agents
Query参数:
  - sort_by: "total_tokens" | "call_count" | "avg_tokens" | "growth_rate"
  - time_range: "today" | "week" | "month" | "all"
  - limit: int (default: 10)

响应:
{
  "code": 200,
  "data": {
    "ranking": [AgentRankingItem],
    "time_range": str,
    "sort_by": str
  }
}
```

#### 2. 趋势预测

```
GET /api/statistics/trend/prediction
Query参数:
  - days: int (default: 30, 历史+预测总天数)
  - agent_id: int | None (可选，指定agent)

响应:
{
  "code": 200,
  "data": {
    "trend": [TrendPrediction],
    "prediction_confidence": float,
    "growth_trend": str  # "increasing" | "stable" | "decreasing"
  }
}
```

#### 3. 异常检测

```
GET /api/statistics/anomalies
Query参数:
  - days: int (default: 7, 检测最近N天的异常)
  - severity: "all" | "low" | "medium" | "high"

响应:
{
  "code": 200,
  "data": {
    "anomalies": [AnomalyRecord],
    "total_count": int,
    "high_severity_count": int
  }
}
```

### 核心算法

#### 1. 排行榜计算

```python
async def get_agent_ranking(
    db: AsyncSession,
    sort_by: str = "total_tokens",
    time_range: str = "all",
    limit: int = 10
) -> list[AgentRankingItem]:
    # 1. 根据time_range确定时间范围
    # 2. 查询TokenUsage按agent_id分组统计
    # 3. 计算avg_tokens_per_call
    # 4. 如果需要growth_rate，查询上周数据对比
    # 5. 按sort_by排序
    # 6. 添加排名
```

#### 2. 趋势预测算法

采用简单线性回归：
```python
def predict_trend(historical_data: list[dict]) -> list[TrendPrediction]:
    # 1. 提取历史数据的token值序列
    # 2. 使用线性回归拟合趋势线
    # 3. 基于趋势线预测未来值
    # 4. 计算预测置信度（基于历史数据波动）
```

#### 3. 异常检测算法

```python
async def detect_anomalies(db: AsyncSession, days: int = 7) -> list[AnomalyRecord]:
    anomalies = []
    
    # 1. 单次调用异常：超过平均值3倍标准差
    # 2. 频率异常：1小时内调用次数超过阈值
    # 3. 突增突降：日用量环比变化超过50%
    
    return anomalies
```

### 实现步骤

1. 创建 `schemas/statistics.py` - 定义Pydantic模型
2. 创建 `services/statistics_service.py` - 实现统计服务
3. 创建 `routes/statistics.py` - 实现API路由
4. 更新 `main.py` - 注册新路由
5. 编写单元测试

### 性能优化

1. 排行榜查询：使用SQL聚合函数，避免内存计算
2. 趋势预测：缓存历史数据查询结果
3. 异常检测：使用异步并发查询

### 监控指标

1. API响应时间
2. 数据库查询性能
3. 异常检测准确率
