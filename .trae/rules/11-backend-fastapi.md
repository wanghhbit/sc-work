---
description: FastAPI best practices, async/await rules, and import standards.
---

# 后端最佳实践

## FastAPI 最佳实践

- **Dependency Injection**: 利用 `Depends` 注入数据库会话、用户、配置。
- **Pydantic V2**:
  - 使用 `model_validate` 替代 `from_orm`。
  - 使用 `model_dump` 替代 `dict`。
  - 定义清晰的 Request (DTO) 和 Response (VO) 模型。
- **Routers**: 路由逻辑应分散在 `apps/api/routes/`。

## 异步编程

- **Mandatory Async**: 所有 I/O (DB, HTTP, File) **必须**使用 `async/await`。
- **No Blocking**: 禁止在异步函数中调用阻塞 I/O (如 `requests`, `time.sleep`)。

## 导入规范

- **Absolute Imports**: 必须使用绝对路径导入。
  - ✅ `from core.models import User`
  - ❌ `from ..models import User`
- **Grouping**: 标准库 -> 第三方库 -> 本地库。
