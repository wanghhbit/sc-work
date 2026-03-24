import asyncio
from sqlalchemy import select
from models.database import async_session_maker, init_db
from models.user import User
from models.agent import AgentConfig
from models.business import BusinessData
from models.token_usage import TokenUsage
from utils.auth import get_password_hash

async def init_data():
    await init_db()
    async with async_session_maker() as db:
        users = [
            User(username="admin", password=get_password_hash("admin123"), role="admin", dept="数字化部", post="系统管理员"),
            User(username="tech", password=get_password_hash("tech123"), role="tech", dept="技术部", post="技术支持"),
            User(username="zhangsan", password=get_password_hash("123456"), role="employee", dept="市场部", post="市场专员"),
            User(username="lisi", password=get_password_hash("123456"), role="employee", dept="销售部", post="销售经理"),
            User(username="wangwu", password=get_password_hash("123456"), role="employee", dept="人事部", post="HR专员"),
        ]
        for user in users:
            existing = await db.execute(select(User).where(User.username == user.username))
            if not existing.scalar_one_or_none():
                db.add(user)
        
        agents = [
            AgentConfig(agent_name="工单查询助手", agent_type="business_query", description="查询和分析工单数据", create_user=1),
            AgentConfig(agent_name="流程审批助手", agent_type="process_handler", description="处理审批流程", create_user=1),
            AgentConfig(agent_name="文档摘要助手", agent_type="doc_summarizer", description="生成文档摘要", create_user=1),
        ]
        for agent in agents:
            existing = await db.execute(select(AgentConfig).where(AgentConfig.agent_name == agent.agent_name))
            if not existing.scalar_one_or_none():
                db.add(agent)
        
        biz_data = [
            BusinessData(biz_type="工单", biz_content='{"title": "系统故障报告", "status": "已完成", "priority": "高"}'),
            BusinessData(biz_type="工单", biz_content='{"title": "网络连接问题", "status": "处理中", "priority": "中"}'),
            BusinessData(biz_type="合同", biz_content='{"title": "销售合同A", "status": "待审批", "amount": 50000}'),
        ]
        for data in biz_data:
            db.add(data)
        
        await db.commit()
    print("数据初始化完成!")

if __name__ == "__main__":
    asyncio.run(init_data())
