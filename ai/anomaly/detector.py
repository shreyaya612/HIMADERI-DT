import os
import joblib
import pandas as pd


MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "model.pkl"
)

model = joblib.load(MODEL_PATH)


FEATURES = [
    "temperature",
    "vibration",
    "load",
    "rpm",
    "fuel_rate",
]


def detect_anomaly(telemetry):

    values = pd.DataFrame([{
        "temperature": telemetry["temperature"],
        "vibration": telemetry["vibration"],
        "load": telemetry["load"],
        "rpm": telemetry["rpm"],
        "fuel_rate": telemetry["fuel_rate"],
    }])

    prediction = model.predict(values)[0]

    decision_score = model.decision_function(values)[0]

    is_anomaly = prediction == -1

    if is_anomaly:
        risk = "HIGH"
    elif decision_score < 0.1:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    health = max(
        0,
        min(
            100,
            round(50 + decision_score * 500)
        )
    )

    return {
        "is_anomaly": bool(is_anomaly),
        "risk": risk,
        "anomaly_score": round(
            float(decision_score), 4
        ),
        "health": health,
    }