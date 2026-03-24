# 项目 Code Wiki

本文档旨在提供当前项目仓库的结构化代码分析，涵盖项目整体架构、主要模块职责、关键类与函数说明、依赖关系以及项目运行方式等关键信息，以帮助开发者快速理解和上手该项目。

## 1. 项目整体架构

本项目采用前后端分离的现代 Web 架构，包含 FastAPI 后端和 React 前端：

### 后端 (apps/api)
- **核心框架**: 基于 [FastAPI](https://fastapi.tiangolo.com/) 框架构建，使用 Python 3.11+。
- **数据库与 ORM**: 使用 **SQLite** 作为底层数据库 (存储在 `eaaw.db` 中)。通过 `SQLAlchemy` 配合 `aiosqlite` 驱动实现异步的数据库连接池管理和数据操作。
- **数据校验**: 采用 `Pydantic V2` 进行 HTTP 请求和响应的模型定义与自动校验。
- **认证授权**: 基于 JWT (JSON Web Tokens) 和 bcrypt 密码哈希算法。

### 前端 (apps/web)
- **核心框架**: 基于 **React 18** 和 **Vite** 构建的单页应用 (SPA)。
- **开发语言**: 采用 **TypeScript** 进行强类型开发。
- **样式方案**: 使用 **Tailwind CSS** 提供原子化、响应式的样式管理。
- **状态管理**: 采用轻量级状态管理库 **Zustand**。
- **数据可视化**: 集成 **ECharts** 进行 Token 消耗和趋势的数据展示。
- **数据请求**: 结合 Axios 与 `@tanstack/react-query` 处理异步 API 请求与缓存。

---

## 2. 主要模块职责

### 后端 (apps/api)
后端代码按职责分层，保持了良好的解耦：
- **`models/`**: 数据访问层。定义了数据库实体的结构，如 `User`, `Agent`, `Task`, `TokenUsage` 等。
- **`schemas/`**: 数据传输对象层 (DTO)。定义 Pydantic 数据模型，作为 API 接口的输入输出契约。
- **`routes/`**: API 路由层。负责接收 HTTP 请求、校验参数并调用相应的 Service 逻辑。
  - `auth.py`: 处理用户注册、登录及 JWT 鉴权。
  - `statistics.py` & `stats.py`: 提供 Token 使用量统计、趋势预测和异常检测的 API 接口。
  - `agents.py` & `tasks.py`: 负责管理 Agent 配置及异步任务的执行路由。
- **`services/`**: 业务逻辑核心层。
  - `statistics/`: 包含细分的统计分析逻辑，例如趋势分析器 (`trend_analyzer.py`) 和异常检测器 (`anomaly_detector.py`)。
  - `agent_executor.py`: Agent 任务调度与执行服务。
  - `token_tracker.py`: Token 消耗追踪与持久化服务。

### 前端 (apps/web)
前端代码结构清晰，按功能模块组织：
- **`src/pages/`**: 视图页面组件。包含如 `Dashboard` (概览)、`Monitor` (监控)、`Agents` (Agent 管理) 等核心业务页面。
- **`src/stores/`**: 全局状态管理。例如 `auth.ts` 结合 Zustand 的持久化中间件管理用户登录状态和 Token。
- **`src/lib/`**: 基础设施和通用工具。例如 `api.ts` 中封装了 Axios 实例，配置了全局的请求和响应拦截器。
- **`src/types/`**: 共享的 TypeScript 类型定义，用于约束前后端交互的数据结构。

---

## 3. 核心类与函数说明

### 后端核心实现
- **`agent_executor.py` 中的 `execute_agent_task`**
  - **职责**: 核心调度函数，用于模拟或执行 Agent 的工作流（如分析、查询、处理）。
  - **机制**: 在任务执行完成后，会自动调用 `token_tracker` 记录该次任务的 Token 消耗量。
- **`statistics_service.py` 中的 `StatisticsService`**
  - **`get_agent_ranking`**: 计算并返回各 Agent 的 Token 消耗排名。
  - **`get_trend_prediction`**: 基于线性回归算法进行 Token 消耗的未来趋势预测。
  - **`detect_anomalies`**: 通过计算标准差等统计学方法，检测异常的 Token 调用行为。
- **`token_tracker.py` 中的 `TokenTracker`**
  - **职责**: 负责持久化记录 LLM 调用产生的 `prompt_tokens` 和 `completion_tokens`，并提供多维度的聚合统计查询能力。

### 前端核心实现
- **`src/lib/api.ts`**
  - **职责**: 创建和配置全局 Axios 实例。
  - **机制**: 包含请求拦截器（自动在请求头注入 Bearer Token）和响应拦截器（统一处理 401 状态码并自动跳转至登录页）。
- **`src/stores/auth.ts` 中的 `useAuthStore`**
  - **职责**: 管理用户登录状态。
  - **机制**: 使用 Zustand 并在内部结合 `persist` 中间件，实现状态在 localStorage 中的持久化。

---

## 4. 依赖关系清单

### 后端依赖 (`apps/api/requirements.txt`)
- **Web 框架**: `fastapi`, `uvicorn`
- **数据库**: `sqlalchemy`, `aiosqlite`
- **配置与校验**: `pydantic`, `pydantic-settings`
- **安全认证**: `python-jose[cryptography]`, `passlib[bcrypt]`, `bcrypt`
- **AI 与 Agent**: `langchain`, `langgraph` (用于集成和扩展 Agent 能力)

### 前端依赖 (`apps/web/package.json`)
- **核心库**: `react`, `react-router-dom`
- **数据请求**: `@tanstack/react-query`, `axios`
- **状态管理**: `zustand`
- **UI 与可视化**: `tailwindcss`, `echarts`, `echarts-for-react`, `lucide-react` (图标库)

---

## 5. 项目运行方式

### 后端启动
1. 进入后端目录:
   ```bash
   cd apps/api
   ```
2. (可选) 创建并激活虚拟环境:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   ```
3. 安装依赖:
   ```bash
   pip install -r requirements.txt
   ```
4. 运行服务:
   ```bash
   python run.py
   ```
   > **说明**: `run.py` 脚本会自动调用 `init_data.py` 初始化数据库表结构和种子数据，然后启动 `uvicorn` 服务器。
   > 默认运行在 `http://localhost:8000`。
   > Swagger API 文档可通过 `http://localhost:8000/docs` 访问。

### 前端启动
1. 进入前端目录:
   ```bash
   cd apps/web
   ```
2. 安装依赖:
   ```bash
   npm install
   ```
3. 启动开发服务器:
   ```bash
   npm run dev
   ```
   > **说明**: 前端默认运行在 `http://localhost:5173`。
   > Vite 已配置代理，所有以 `/api` 开头的请求会自动转发至后端的 `8000` 端口，解决跨域问题。
