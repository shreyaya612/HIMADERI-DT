import random
from datetime import datetime


def generate_generator_telemetry(
    station="MAITRI",
    asset_id="MAI-GEN-02",
    mode="normal"
):
    # -----------------------------
    # NORMAL OPERATING CONDITIONS
    # -----------------------------

    load = random.uniform(60, 85)

    vibration = random.uniform(0.25, 0.45)

    # Temperature is influenced by generator load
    temperature = (
        65
        + (load * 0.15)
        + random.uniform(-2, 2)
    )

    # RPM varies around the normal operating range
    rpm = 1500 + random.uniform(-40, 40)

    # Fuel consumption increases with load
    fuel_rate = (
        9
        + (load * 0.08)
        + random.uniform(-0.5, 0.5)
    )

    # -----------------------------
    # ANOMALOUS CONDITIONS
    # -----------------------------

    if mode == "anomaly":

        load = random.uniform(88, 98)

        vibration = random.uniform(0.65, 1.0)

        temperature = (
            80
            + (load * 0.17)
            + random.uniform(-2, 4)
        )

        rpm = 1400 + random.uniform(-50, 50)

        fuel_rate = (
            14
            + (load * 0.08)
            + random.uniform(0, 2)
        )

    return {
        "station": station,
        "asset_id": asset_id,

        "temperature": round(
            temperature, 2
        ),

        "vibration": round(
            vibration, 3
        ),

        "load": round(
            load, 2
        ),

        "rpm": round(
            rpm, 2
        ),

        "fuel_rate": round(
            fuel_rate, 2
        ),

        "timestamp": datetime.utcnow()
    }