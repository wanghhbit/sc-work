---
description: Code examples for basic Agent structure.
globs: src/agents/**/*.py
---

# Agent 示例

## 基本 Agent 结构

```python
from langgraph.graph import StateGraph, START, END
from core.orchestration.state.state import ExpertState
from core.foundation.registry.agent_registry import register_agent

@register_agent(id="simple_agent")
async def create_simple_agent(rm, settings, aid, config) -> StateGraph:
    # 1. Define Nodes
    async def process_node(state: ExpertState) -> ExpertState:
        # logic here
        return {"messages": ["Processed"]}

    # 2. Build Graph
    graph = StateGraph(ExpertState)
    graph.add_node("process", process_node)

    # 3. Connect Edges
    graph.add_edge(START, "process")
    graph.add_edge("process", END)

    return graph
```
