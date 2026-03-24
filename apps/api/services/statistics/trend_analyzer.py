from typing import Literal
import statistics


class TrendAnalyzer:
    def linear_regression_predict(
        self, historical_data: list[float], predict_days: int
    ) -> tuple[list[float], float]:
        if len(historical_data) < 3:
            last_value = historical_data[-1] if historical_data else 0
            predictions = [last_value] * predict_days
            confidence = 0.3
            return predictions, confidence

        x = list(range(len(historical_data)))
        y = historical_data

        n = len(x)
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(xi * yi for xi, yi in zip(x, y))
        sum_x2 = sum(xi ** 2 for xi in x)

        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
        intercept = (sum_y - slope * sum_x) / n

        predictions = []
        for i in range(predict_days):
            future_x = len(historical_data) + i
            predicted_value = max(0, slope * future_x + intercept)
            predictions.append(predicted_value)

        predicted_values = [slope * i + intercept for i in range(len(historical_data))]
        residuals = [abs(actual - predicted) for actual, predicted in zip(historical_data, predicted_values)]
        mean_residual = statistics.mean(residuals)
        mean_tokens = statistics.mean(historical_data)
        confidence = max(0, min(1, 1 - (mean_residual / mean_tokens if mean_tokens > 0 else 0)))

        return predictions, confidence

    def calculate_growth_rate(self, current_value: float, previous_value: float) -> float | None:
        if previous_value == 0:
            return None
        return round((current_value - previous_value) / previous_value * 100, 2)

    def detect_trend_direction(
        self, data: list[float]
    ) -> Literal["increasing", "decreasing", "stable"]:
        if len(data) < 2:
            return "stable"

        recent_avg = statistics.mean(data[-7:]) if len(data) >= 7 else statistics.mean(data)
        earlier_avg = statistics.mean(data[:7]) if len(data) >= 7 else data[0]

        if recent_avg > earlier_avg * 1.1:
            return "increasing"
        elif recent_avg < earlier_avg * 0.9:
            return "decreasing"
        else:
            return "stable"


trend_analyzer = TrendAnalyzer()
