import pytest
from datetime import datetime, timedelta
from sqlalchemy import select
from models.database import async_session_maker
from models.token_usage import TokenUsage
from models.agent import AgentConfig
from services.statistics_service import statistics_service


@pytest.mark.asyncio
async def test_get_agent_ranking(db_session):
    async with async_session_maker() as db:
        ranking = await statistics_service.get_agent_ranking(
            db, sort_by="total_tokens", time_range="all", limit=10
        )

        assert ranking.time_range == "all"
        assert ranking.sort_by == "total_tokens"
        assert isinstance(ranking.ranking, list)


@pytest.mark.asyncio
async def test_get_trend_prediction(db_session):
    async with async_session_maker() as db:
        prediction = await statistics_service.get_trend_prediction(db, days=30, agent_id=None)

        assert len(prediction.trend) == 30
        assert 0 <= prediction.prediction_confidence <= 1
        assert prediction.growth_trend in ["increasing", "stable", "decreasing"]


@pytest.mark.asyncio
async def test_detect_anomalies(db_session):
    async with async_session_maker() as db:
        anomalies = await statistics_service.detect_anomalies(db, days=7, severity="all")

        assert isinstance(anomalies.anomalies, list)
        assert anomalies.total_count >= 0
        assert anomalies.high_severity_count >= 0
