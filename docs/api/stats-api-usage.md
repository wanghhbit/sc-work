# Token用量统计API使用文档

## 概述

本系统提供了三个维度的Token用量统计API：
- **Agent维度**：统计每个Agent的token使用情况
- **Task维度**：统计任务相关的token使用情况
- **User维度**：统计用户的token使用情况

## 通用参数

### 时间范围 (time_range)
- `1h`: 最近1小时
- `24h`: 最近24小时
- `7d`: 最近7天
- `30d`: 最近30天

### 时间粒度 (granularity)
- `hour`: 按小时聚合
- `day`: 按天聚合
- `week`: 按周聚合
- `month`: 按月聚合

## Agent维度API

### 1. 获取Agent概览统计

```http
GET /api/stats/agent/overview?time_range=7d
```

**响应示例**：
```json
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
```

### 2. 获取Agent趋势数据

```http
GET /api/stats/agent/trend?time_range=7d&granularity=day&agent_id=1
```

**响应示例**：
```json
{
  "code": 200,
  "data": {
    "trend": [
      {
        "time": "2026-03-22",
        "total_tokens": 15000,
        "call_count": 45
      }
    ],
    "prediction": [...],
    "confidence": 0.85,
    "growth_trend": "increasing"
  }
}
```

### 3. 获取Agent排行榜

```http
GET /api/stats/agent/ranking?time_range=7d&sort_by=total_tokens&limit=10
```

**排序字段**：
- `total_tokens`: 按总token数排序
- `call_count`: 按调用次数排序
- `avg_tokens`: 按平均token数排序

**响应示例**：
```json
{
  "code": 200,
  "data": {
    "ranking": [
      {
        "rank": 1,
        "id": 1,
        "name": "CodeAssistant",
        "total_tokens": 450000,
        "call_count": 1200,
        "avg_tokens": 375.0,
        "growth_rate": 15.5
      }
    ],
    "time_range": "7d",
    "sort_by": "total_tokens"
  }
}
```

### 4. 获取Agent异常检测

```http
GET /api/stats/agent/anomaly?time_range=7d&severity=all
```

**严重级别**：
- `all`: 所有异常
- `low`: 低严重级别
- `medium`: 中等严重级别
- `high`: 高严重级别

**响应示例**：
```json
{
  "code": 200,
  "data": {
    "anomalies": [
      {
        "anomaly_id": "high_single_123",
        "anomaly_type": "high_single_call",
        "entity_id": 1,
        "entity_name": "CodeAssistant",
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

## Task维度API

### 1. 获取任务分布统计

```http
GET /api/stats/task/distribution?time_range=7d
```

**响应示例**：
```json
{
  "code": 200,
  "data": {
    "distribution": [
      {
        "id": 1,
        "name": "CodeAssistant",
        "count": 150,
        "total_tokens": 45000,
        "percentage": 35.5
      }
    ],
    "time_range": "7d"
  }
}
```

### 2. 获取任务对比分析

```http
GET /api/stats/task/comparison?time_range=7d
```

**响应示例**：
```json
{
  "code": 200,
  "data": {
    "comparison": [
      {
        "id": 1,
        "name": "CodeAssistant",
        "avg_tokens": 300.0,
        "avg_execution_time": 2.5,
        "success_rate": 95.5
      }
    ],
    "time_range": "7d"
  }
}
```

### 3. 获取高消耗任务TOP N

```http
GET /api/stats/task/top?time_range=7d&limit=10
```

**响应示例**：
```json
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
    ],
    "time_range": "7d"
  }
}
```

## User维度API

### 1. 获取用户概览统计

```http
GET /api/stats/user/overview?time_range=7d
```

**响应示例**：
```json
{
  "code": 200,
  "data": {
    "total_users": 50,
    "active_users": 35,
    "total_tokens": 1250000,
    "avg_tokens_per_user": 35714.29
  }
}
```

### 2. 获取用户排行榜

```http
GET /api/stats/user/ranking?time_range=7d&sort_by=total_tokens&limit=10
```

**排序字段**：
- `total_tokens`: 按总token数排序
- `task_count`: 按任务数排序
- `call_count`: 按调用次数排序

**响应示例**：
```json
{
  "code": 200,
  "data": {
    "ranking": [
      {
        "rank": 1,
        "id": 1,
        "name": "zhang_san",
        "total_tokens": 150000,
        "call_count": 350,
        "avg_tokens": 428.57,
        "growth_rate": null
      }
    ],
    "time_range": "7d",
    "sort_by": "total_tokens"
  }
}
```

### 3. 获取单个用户趋势

```http
GET /api/stats/user/1/trend?time_range=7d&granularity=day
```

**响应示例**：
```json
{
  "code": 200,
  "data": {
    "trend": [
      {
        "time": "2026-03-22",
        "total_tokens": 5000,
        "call_count": 45,
        "task_count": 15
      }
    ],
    "prediction": null,
    "confidence": null,
    "growth_trend": null
  }
}
```

## 异常类型说明

### Agent异常类型

1. **high_single_call**: 单次调用token数异常高
   - 触发条件：单次调用token数超过平均值+3倍标准差
   - 严重级别：根据超出倍数判断

2. **high_frequency**: 高频调用异常
   - 触发条件：1小时内调用次数超过50次
   - 严重级别：根据超出倍数判断

3. **sudden_spike**: 突增异常
   - 触发条件：日token使用量环比增长超过50%
   - 严重级别：根据增长率判断

4. **sudden_drop**: 突降异常
   - 触发条件：日token使用量环比下降超过50%
   - 严重级别：根据下降率判断

## 使用建议

### 1. 监控仪表板

建议使用以下API组合构建监控仪表板：
- `/api/stats/agent/overview` - 总体概览
- `/api/stats/agent/ranking` - Top Agent排行
- `/api/stats/agent/anomaly` - 异常告警
- `/api/stats/agent/trend` - 趋势图表

### 2. 性能优化

- 对于频繁查询，建议使用缓存
- 大时间范围查询建议使用较大的粒度（day或week）
- 异常检测API计算量较大，建议设置合理的调用频率

### 3. 数据分析

- 使用趋势预测API进行容量规划
- 使用异常检测API进行问题排查
- 使用排行榜API识别高消耗Agent/用户

## 错误处理

所有API返回统一的错误格式：

```json
{
  "code": 400,
  "message": "错误描述",
  "data": null
}
```

常见错误码：
- `400`: 参数错误
- `401`: 未授权
- `404`: 资源不存在
- `500`: 服务器内部错误
