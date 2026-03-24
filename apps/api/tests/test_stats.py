import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.database import Base
from models.token_usage import TokenUsage
from models.agent import AgentConfig
from models.task import TaskRecord
from models.user import User
from services.statistics import (
    agent_statistics_service,
    task_statistics_service,
    user_statistics_service,
    trend_analyzer,
    anomaly_detector,
)


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def sample_data(db_session):
    user = User(user_id=1, username="test_user", password="hashed", role="employee")
    db_session.add(user)

    agent = AgentConfig(
        agent_id=1,
        agent_name="TestAgent",
        agent_type="assistant",
        create_user=1,
    )
    db_session.add(agent)

    task = TaskRecord(
        task_id=1,
        agent_id=1,
        task_content="Test task",
        create_user=1,
        status="completed",
    )
    db_session.add(task)

    now = datetime.utcnow()
    for i in range(10):
        usage = TokenUsage(
            task_id=1,
            agent_id=1,
            user_id=1,
            prompt_tokens=100 + i * 10,
            completion_tokens=50 + i * 5,
            total_tokens=150 + i * 15,
            create_time=now - timedelta(days=i),
        )
        db_session.add(usage)

    db_session.commit()


@pytest.mark.asyncio
async def test_agent_overview(db_session, sample_data):
    result = await agent_statistics_service.get_overview(db_session, "7d")

    assert "total_agents" in result
    assert "total_tokens" in result
    assert "total_calls" in result
    assert "avg_tokens_per_call" in result
    assert result["total_agents"] >= 1
    assert result["total_tokens"] > 0


@pytest.mark.asyncio
async def test_agent_trend(db_session, sample_data):
    result = await agent_statistics_service.get_trend(db_session, "7d", "day")

    assert hasattr(result, "trend")
    assert len(result.trend) > 0
    assert all(hasattr(t, "time") for t in result.trend)
    assert all(hasattr(t, "total_tokens") for t in result.trend)


@pytest.mark.asyncio
async def test_agent_ranking(db_session, sample_data):
    result = await agent_statistics_service.get_ranking(db_session, "7d", "total_tokens", 10)

    assert hasattr(result, "ranking")
    assert len(result.ranking) > 0
    assert all(hasattr(r, "rank") for r in result.ranking)
    assert all(hasattr(r, "name") for r in result.ranking)


@pytest.mark.asyncio
async def test_task_distribution(db_session, sample_data):
    result = await task_statistics_service.get_distribution(db_session, "7d")

    assert hasattr(result, "distribution")
    assert len(result.distribution) > 0
    assert all(hasattr(d, "percentage") for d in result.distribution)


@pytest.mark.asyncio
async def test_user_overview(db_session, sample_data):
    result = await user_statistics_service.get_overview(db_session, "7d")

    assert "total_users" in result
    assert "active_users" in result
    assert "total_tokens" in result


@pytest.mark.asyncio
async def test_user_ranking(db_session, sample_data):
    result = await user_statistics_service.get_ranking(db_session, "7d", "total_tokens", 10)

    assert hasattr(result, "ranking")
    assert len(result.ranking) > 0


def test_trend_analyzer():
    historical_data = [100, 150, 200, 250, 300]
    predictions, confidence = trend_analyzer.linear_regression_predict(historical_data, 7)

    assert len(predictions) == 7
    assert all(p >= 0 for p in predictions)
    assert 0 <= confidence <= 1

    growth_rate = trend_analyzer.calculate_growth_rate(150, 100)
    assert growth_rate == 50.0

    direction = trend_analyzer.detect_trend_direction(historical_data)
    assert direction == "increasing"


def test_anomaly_detector():
    values = [100, 150, 200, 250, 300, 1000]
    anomalies = anomaly_detector.detect_statistical_anomaly(values, threshold=3.0)

    assert len(anomalies) > 0
    assert all(isinstance(a, tuple) and len(a) == 2 for a in anomalies)

    is_anomaly = anomaly_detector.detect_frequency_anomaly(100, threshold=50)
    assert is_anomaly is True

    is_change, rate = anomaly_detector.detect_sudden_change(150, 100, threshold=0.5)
    assert is_change is True
    assert rate == 0.5

    severity = anomaly_detector.classify_severity(1000, 100, 10.0)
    assert severity == "high"
