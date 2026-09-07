"""Single source of Unity-facing station and asset state."""

from sqlalchemy.orm import Session

from ai.anomaly.detector import detect_anomaly
from models.asset import DigitalTwinAsset
from models.telemetry import Telemetry


# These are logical Unity scene coordinates, not physical survey coordinates.
MAITRI_ASSETS = (
    ("MAI-GEN-01", "GENERATOR", "Generator 01", 96, (4.0, 0.0, -2.0)),
    ("MAI-GEN-02", "GENERATOR", "Generator 02", 96, (8.0, 0.0, -2.0)),
    ("MAI-FUEL-01", "FUEL", "Fuel Farm", 94, (13.0, 0.0, -4.0)),
    ("MAI-HVAC-01", "HVAC", "HVAC System", 93, (3.0, 0.0, 6.0)),
    ("MAI-WTR-01", "WATER", "Water System", 97, (-2.0, 0.0, 4.0)),
    ("MAI-BLD-01", "BUILDING", "Main Building", 98, (0.0, 0.0, 0.0)),
)


def ensure_station_assets(db: Session, station_id: str) -> list[DigitalTwinAsset]:
    station_id = station_id.upper()
    if station_id != "MAITRI":
        return []
    existing_ids = {row[0] for row in db.query(DigitalTwinAsset.id).filter(DigitalTwinAsset.station_id == station_id).all()}
    for asset_id, asset_type, name, health, position in MAITRI_ASSETS:
        if asset_id not in existing_ids:
            db.add(DigitalTwinAsset(
                id=asset_id, station_id=station_id, asset_type=asset_type, name=name,
                status="NORMAL", health=health,
                position_x=position[0], position_y=position[1], position_z=position[2],
            ))
    db.commit()
    return db.query(DigitalTwinAsset).filter(DigitalTwinAsset.station_id == station_id).order_by(DigitalTwinAsset.id).all()


def latest_telemetry(db: Session, station_id: str, asset_id: str):
    return (
        db.query(Telemetry)
        .filter(Telemetry.station == station_id, Telemetry.asset_id == asset_id)
        .order_by(Telemetry.timestamp.desc())
        .first()
    )


def telemetry_payload(telemetry: Telemetry | None):
    if not telemetry:
        return None
    return {
        "temperature": telemetry.temperature, "vibration": telemetry.vibration,
        "load": telemetry.load, "rpm": telemetry.rpm, "fuel_rate": telemetry.fuel_rate,
        "timestamp": telemetry.timestamp,
    }


def asset_payload(db: Session, asset: DigitalTwinAsset) -> dict:
    telemetry = latest_telemetry(db, asset.station_id, asset.id)
    telemetry_data = telemetry_payload(telemetry)
    ai = detect_anomaly(telemetry_data) if telemetry_data else None
    status, health = asset.status, asset.health
    # A stored simulated failure is authoritative until a later state update.
    if status != "FAILED" and ai:
        status = "CRITICAL" if ai["risk"] == "HIGH" else "WARNING" if ai["risk"] == "MEDIUM" else "NORMAL"
        health = ai["health"]
    return {
        "id": asset.id, "asset_id": asset.id, "station": asset.station_id,
        "type": asset.asset_type, "name": asset.name, "status": status, "health": health,
        "alert_state": status in ("WARNING", "CRITICAL", "FAILED"),
        "position": {"x": asset.position_x, "y": asset.position_y, "z": asset.position_z},
        "latest_telemetry": telemetry_data, "risk": ai["risk"] if ai else None,
    }


def station_asset_payloads(db: Session, station_id: str) -> list[dict]:
    return [asset_payload(db, asset) for asset in ensure_station_assets(db, station_id)]


def get_asset(db: Session, asset_id: str) -> DigitalTwinAsset | None:
    return db.query(DigitalTwinAsset).filter(DigitalTwinAsset.id == asset_id.upper()).first()
