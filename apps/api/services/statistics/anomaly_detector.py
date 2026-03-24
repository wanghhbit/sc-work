from typing import Literal
import statistics


class AnomalyDetector:
    def detect_statistical_anomaly(
        self, values: list[float], threshold: float = 3.0
    ) -> list[tuple[int, float]]:
        if len(values) < 2:
            return []

        mean_val = statistics.mean(values)
        stdev_val = statistics.stdev(values)

        if stdev_val == 0:
            return []

        anomaly_threshold = mean_val + threshold * stdev_val
        anomalies = []

        for i, value in enumerate(values):
            if value > anomaly_threshold:
                anomalies.append((i, value))

        return anomalies

    def detect_frequency_anomaly(
        self, frequency: int, threshold: int = 50
    ) -> bool:
        return frequency > threshold

    def detect_sudden_change(
        self, current: float, previous: float, threshold: float = 0.5
    ) -> tuple[bool, float]:
        if previous == 0:
            return False, 0.0

        change_rate = abs((current - previous) / previous)
        return change_rate > threshold, change_rate

    def classify_severity(
        self, value: float, threshold: float, ratio: float
    ) -> Literal["low", "medium", "high"]:
        if ratio > 2.0:
            return "high"
        elif ratio > 1.5:
            return "medium"
        else:
            return "low"


anomaly_detector = AnomalyDetector()
