from datetime import datetime, timedelta
from typing import Literal


TimeRange = Literal["1h", "24h", "7d", "30d"]
Granularity = Literal["hour", "day", "week", "month"]


def get_time_range_start(time_range: TimeRange) -> datetime:
    now = datetime.utcnow()
    time_map = {
        "1h": now - timedelta(hours=1),
        "24h": now - timedelta(hours=24),
        "7d": now - timedelta(days=7),
        "30d": now - timedelta(days=30),
    }
    return time_map[time_range]


def get_granularity_format(granularity: Granularity) -> str:
    format_map = {
        "hour": "%Y-%m-%d %H:00",
        "day": "%Y-%m-%d",
        "week": "%Y-%W",
        "month": "%Y-%m",
    }
    return format_map[granularity]


def get_granularity_delta(granularity: Granularity) -> timedelta:
    delta_map = {
        "hour": timedelta(hours=1),
        "day": timedelta(days=1),
        "week": timedelta(weeks=1),
        "month": timedelta(days=30),
    }
    return delta_map[granularity]
