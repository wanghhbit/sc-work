---
description: Development guidelines for defining and building Agents.
globs: src/agents/**/*.py
---
# Agent Development Guidelines (Agent 开发指南)

## Agent Definition (定义)
-   **Registry**: 必须使用 `@register_agent` 装饰器注册 Agent。
-   **Signature**: 创建函数必须遵循以下签名：
    ```python
    @register_agent(id="agent_id")
    async def create_agent(
        resource_manager: FoundationCoordinator,
        settings: Settings,
        assistant_id: str,
        config: dict
    ) -> StateGraph:
    ```

## State Management (状态管理)
-   **Type Safety**: 使用 `ExpertState` (TypedDict) 或 Pydantic 模型作为图的状态。
-   **Immutability**: 尽量保持状态更新逻辑清晰，避免隐式副作用。

## Graph Construction (图构建)
-   **Explicit Edges**: 显式定义所有边，包括条件边 (`add_conditional_edges`)。
-   **START & END**: 必须正确连接 `START` 节点到入口，以及最终节点到 `END`。
-   **Modularity**: 将复杂的 Node 逻辑抽取为独立的函数或文件 (`nodes/` 目录)。
