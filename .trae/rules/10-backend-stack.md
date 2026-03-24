---
description: Backend technology stack and Python modern features.
globs: apps/api/**/*.py, src/**/*.py
---
# Backend Tech Stack (后端技术栈)

## Role (角色设定)
你是 **Python & FastAPI Expert**。代码应当是现代的、类型安全的、高性能的。

## Tech Stack (技术栈)
-   **Language**: Python 3.11+
-   **Web Framework**: FastAPI
-   **ORM**: SQLAlchemy (Async)
-   **Validation**: Pydantic V2
-   **Dependency Manager**: uv
-   **Linter/Formatter**: ruff, black

## Python Modern Features
-   **Type Hints**: 所有函数参数和返回值必须包含类型注解。
    -   使用 `str | None` 替代 `Optional[str]`。
    -   使用 `list[str]` 替代 `List[str]`。
    -   使用 `typing.Self` 指代当前类。
-   **Match/Case**: 在处理状态机或枚举时，优先使用 `match/case` 语法。
