import os
import sys
import pandas as pd
import joblib

from sklearn.ensemble import IsolationForest

# Allow imports from backend
sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../backend")
    )
)

from database.db import SessionLocal
from models.telemetry import Telemetry


def load_telemetry():
    db = SessionLocal()

    try:
        records = (
            db.query(Telemetry)
            .order_by(Telemetry.timestamp.asc())
            .all()
        )

        data = [
            {
                "temperature": r.temperature,
                "vibration": r.vibration,
                "load": r.load,
                "rpm": r.rpm,
                "fuel_rate": r.fuel_rate,
            }
            for r in records
        ]

        return pd.DataFrame(data)

    finally:
        db.close()


def train_model():

    df = load_telemetry()

    if len(df) < 50:
        print(
            f"Only {len(df)} telemetry records found."
        )
        print(
            "Generate at least 50-100 normal telemetry records first."
        )
        return

    features = [
        "temperature",
        "vibration",
        "load",
        "rpm",
        "fuel_rate",
    ]

    X = df[features]

    model = IsolationForest(
        n_estimators=200,
        contamination=0.05,
        random_state=42
    )

    model.fit(X)

    model_path = os.path.join(
        os.path.dirname(__file__),
        "model.pkl"
    )

    joblib.dump(model, model_path)

    print("✅ Isolation Forest trained successfully")
    print(f"Training samples: {len(X)}")
    print(f"Model saved to: {model_path}")


if __name__ == "__main__":
    train_model()