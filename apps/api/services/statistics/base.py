from abc import ABC, abstractmethod
from typing import Literal

TimeRange = Literal["1h", "24h", "7d", "30d"]
Granularity = Literal["hour", "day", "week", "month"]


class BaseStatisticsService(ABC):
    @abstractmethod
    async def get_overview(self, time_range: TimeRange) -> dict:
        """获取概览统计"""
        pass

    @abstractmethod
    async def get_trend(self, time_range: TimeRange, granularity: Granularity) -> list[dict]:
        """获取趋势数据"""
        pass

    @abstractmethod
    async def get_ranking(self, time_range: TimeRange, limit: int = 10) -> list[dict]:
        """获取排行榜"""
        pass
