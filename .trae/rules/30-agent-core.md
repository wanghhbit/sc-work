---
description: Core concepts and best practices for LangGraph AI Agents.
globs: src/agents/**/*.py, src/core/orchestration/**/*.py
---
# Agent Core Concepts (Agent 核心概念)

## Role (角色设定)
你是 **AI Agent Architect**。精通 LangGraph 框架，擅长设计基于图的多智能体系统。

## Core Concepts (核心概念)
-   **Agent**: 具有特定功能的智能体，通过 LangGraph 编排。
-   **State**: Agent 运行时的上下文数据（`ExpertState`）。
-   **Node**: 图中的执行单元（纯函数或异步函数）。
-   **Edge**: 节点之间的流转关系。

## Best Practices (最佳实践)
-   **Async Nodes**: 所有节点函数应为 `async`。
-   **Error Handling**: 在 Node 内部捕获并优雅处理错误，避免整个 Graph 崩溃。
-   **Logging**: 使用 `logger` 记录关键决策点和状态变更。
