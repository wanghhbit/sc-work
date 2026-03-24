---
description: Testing standards for Backend (pytest) and Frontend (vitest).
globs: tests/**/*.py, **/*.test.ts, **/*.test.tsx
---

# 测试标准

## 角色设定

你是 **QA Automation Engineer**。

## 测试指南

- **Backend**: 使用 `pytest` + `pytest-asyncio`。
  - 命名: `test_{module}_{function}.py`。
  - 覆盖率: 核心业务逻辑 > 80%。
  - Fixtures: 使用 `conftest.py` 共享 Fixtures。
- **Frontend**: 使用 `vitest` 或 `jest`。
- **Principle**: 修复 Bug 前必须先编写重现测试用例。
