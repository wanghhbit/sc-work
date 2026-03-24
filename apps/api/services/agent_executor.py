import asyncio
import random
from datetime import datetime
from sqlalchemy import select
from models.database import async_session_maker
from models.task import TaskRecord, TaskLog
from services.token_tracker import token_tracker

AGENT_TEMPLATES = {
    "business_query": {
        "steps": [
            {"thinking": "分析任务指令，识别查询意图...", "action": "解析关键词: 查询、统计"},
            {"thinking": "确定查询时间范围和数据类型...", "action": "时间范围: 本月, 数据类型: 工单"},
            {"thinking": "调用业务数据接口获取数据...", "action": "SELECT * FROM biz_data WHERE type='工单'"},
            {"thinking": "整理数据并生成报告...", "action": "生成统计报告"}
        ],
        "result_template": "查询完成。共找到 {count} 条相关记录，其中已完成 {completed} 条，处理中 {processing} 条，平均处理时长 {avg_time} 小时。"
    },
    "process_handler": {
        "steps": [
            {"thinking": "识别流程类型，确定处理步骤...", "action": "流程类型: 审批流程"},
            {"thinking": "检查流程前置条件...", "action": "验证: 权限检查通过"},
            {"thinking": "执行流程处理逻辑...", "action": "更新流程状态"},
            {"thinking": "发送通知并记录日志...", "action": "通知已发送"}
        ],
        "result_template": "流程处理完成。已成功处理 {count} 个流程节点，当前状态: {status}，下一步: {next_step}。"
    },
    "doc_summarizer": {
        "steps": [
            {"thinking": "读取文档内容，分析文档结构...", "action": "文档长度: 5000字"},
            {"thinking": "提取关键信息和核心观点...", "action": "提取关键词: 项目、计划、目标"},
            {"thinking": "生成结构化摘要...", "action": "生成摘要大纲"},
            {"thinking": "优化摘要表达...", "action": "润色完成"}
        ],
        "result_template": "文档摘要生成完成。文档主题: {topic}，核心要点: {key_points}，建议阅读时长: {read_time} 分钟。"
    }
}


def simulate_token_count(text: str) -> int:
    return max(1, len(text) // 4)


async def execute_agent_task(task_id: int, agent_type: str, task_content: str):
    async with async_session_maker() as db:
        result = await db.execute(select(TaskRecord).where(TaskRecord.task_id == task_id))
        task = result.scalar_one_or_none()
        if not task:
            return

        task.status = "running"
        await db.commit()

        template = AGENT_TEMPLATES.get(agent_type, AGENT_TEMPLATES["business_query"])
        start_time = datetime.utcnow()

        total_prompt_tokens = simulate_token_count(task_content)
        total_completion_tokens = 0

        for i, step in enumerate(template["steps"], 1):
            await asyncio.sleep(random.uniform(0.5, 1.5))
            log = TaskLog(
                task_id=task_id,
                step=i,
                thinking=step["thinking"],
                action=step["action"],
                log_time=datetime.utcnow()
            )
            db.add(log)
            await db.commit()

            total_prompt_tokens += simulate_token_count(step["thinking"])
            total_completion_tokens += simulate_token_count(step["action"])

        await asyncio.sleep(random.uniform(0.5, 1.0))
        end_time = datetime.utcnow()
        execute_time = (end_time - start_time).total_seconds()

        result_data = {
            "count": random.randint(10, 100),
            "completed": random.randint(5, 50),
            "processing": random.randint(1, 10),
            "avg_time": round(random.uniform(1.5, 8.0), 1),
            "status": "已完成",
            "next_step": "等待下一步指令",
            "topic": "工作汇报",
            "key_points": "1. 项目进展顺利 2. 里程碑已达成 3. 下阶段计划明确",
            "read_time": random.randint(3, 10)
        }

        task.result = template["result_template"].format(**result_data)
        total_completion_tokens += simulate_token_count(task.result)
        task.status = "completed"
        task.execute_time = execute_time
        task.end_time = end_time
        await db.commit()

        await token_tracker.record_usage(
            task_id=task_id,
            agent_id=task.agent_id,
            user_id=task.create_user,
            prompt_tokens=total_prompt_tokens,
            completion_tokens=total_completion_tokens,
            model_name="simulated-llm",
        )
