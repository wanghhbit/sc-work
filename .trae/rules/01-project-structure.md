---
alwaysApply: false
description: 
---
## 项目结构

本项目是一个 **Monorepo**，结构如下：

- **`apps/`**: 具体的应用程序。
  - `api/`: FastAPI 后端服务。
  - `web/`: React/Vite 前端应用。
- **`src/`**: 共享的业务逻辑、Agent 定义、核心库。
  - `agents/`: LangGraph Agent 定义。
  - `core/`: 核心基础组件 (Config, Auth, Database)。
- **`.agent/`**: AI IDE 配置的 SSOT (Single Source of Truth)。
  - `rules/`: Cursor/Trae 的规则文件源。
  - `skills/`: Agent 技能定义。
  - *注意*: `.trae`, `.cursor` 等目录中的规则和技能应通过软链指向此目录，不直接存储源文件。

## 实现指南

- **Plan First**: 在编写大量代码前，先用伪代码或简述确认方案（如果是复杂任务）。
- **Atomic Changes**: 保持修改的原子性，每次只解决一个具体问题。
- **Verification**: 在提供代码后，思考如何验证其正确性（测试用例或手动验证步骤）。
