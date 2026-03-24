---
description: Frontend state management, data fetching rules, and project structure.
globs: apps/web/**/*.{ts,tsx}
---
# Frontend Data & Structure (前端数据与结构)

## State & Data Fetching (状态与数据)
-   **TanStack Query**: 所有服务端数据获取 **必须** 使用 `useQuery` 或 `useMutation`。
    -   ❌ 禁止在 `useEffect` 中直接调用 `fetch`。
-   **Zod**: 所有 I/O 数据必须经过 Zod 验证。

## Project Structure (项目结构)
-   **Colocation**: 功能相关的组件、Hooks、Types 放在同一 Feature 目录。
-   `apps/web/src/components/ui/`: Shadcn/UI 基础组件。
-   `apps/web/src/features/`: 业务功能模块。
