"""Business rules for deterministic, simulated station incidents."""

import json
from datetime import datetime
from typing import Callable
from sqlalchemy.orm import Session
from models.incident import ALLOWED_TRANSITIONS, Incident, SCENARIOS, SOURCES, STATUSES
from services.asset_service import ensure_station_assets, get_asset
from services.sync_service import OFFLINE, enqueue_event, get_connectivity, set_connectivity

SCENARIO_DETAILS = {
    "GENERATOR_FAILURE": ("CRITICAL", "Generator failure", "Generator failure is simulated; protect essential loads and inspect the affected generator.", ["Confirm backup generation capacity.", "Isolate the failed generator and arrange maintenance inspection."]),
    "FIRE": ("CRITICAL", "Simulated fire incident", "A simulated fire incident requires immediate local emergency response.", ["Follow the approved local emergency response procedure.", "Account for personnel and isolate the affected area if safe."]),
    "BLACKOUT": ("CRITICAL", "Station blackout", "A simulated station power-loss incident has been declared.", ["Preserve essential loads and assess available backup power.", "Confirm safe status of critical systems."]),
    "FUEL_LEAK": ("HIGH", "Fuel leak", "A simulated fuel leak requires isolation and containment action.", ["Isolate the fuel source if safe.", "Contain the release and follow the approved local spill procedure."]),
    "COMMUNICATION_LOSS": ("HIGH", "Communication loss", "Station connectivity is offline; local operations and persistence remain available.", ["Continue local operations using the offline workflow.", "Record updates locally until connectivity is restored."]),
    "BLIZZARD": ("HIGH", "Simulated blizzard", "A simulated severe-weather incident is affecting station operations.", ["Restrict external activity according to the approved local procedure.", "Secure equipment and confirm personnel readiness."]),
}

def determine_affected_assets(station: str, scenario: str, asset_id: str | None) -> list[str]:
    supplied = asset_id.upper() if asset_id else None
    if scenario == "FUEL_LEAK": return [supplied or "MAI-FUEL-01"]
    if scenario == "GENERATOR_FAILURE": return [supplied or "MAI-GEN-02"]
    return [supplied] if supplied else []

def generate_incident_alert_info(incident_type: str, severity: str, title: str, actions: list[str]) -> list[dict]:
    return [{"id": f"INCIDENT-{incident_type}", "severity": severity, "title": title,
             "message": f"{title}: simulated operational incident.", "source": "Incident Mode", "recommended_actions": actions}]

def _mark_supported_assets(db: Session, station: str, asset_ids: list[str], status: str, health: int) -> None:
    ensure_station_assets(db, station)
    for asset_id in asset_ids:
        asset = get_asset(db, asset_id)
        if asset and asset.station_id == station: asset.status, asset.health = status, health
    db.commit()

def create_incident(db: Session, station: str, scenario: str, asset_id: str | None = None, source: str = "OPERATOR", simulation_runner: Callable | None = None) -> Incident:
    station, scenario, source = station.upper(), scenario.upper(), source.upper()
    if scenario not in SCENARIOS: raise ValueError(f"scenario must be one of: {', '.join(SCENARIOS)}")
    if source not in SOURCES: raise ValueError(f"source must be one of: {', '.join(SOURCES)}")
    severity, title, description, actions = SCENARIO_DETAILS[scenario]
    affected_assets = determine_affected_assets(station, scenario, asset_id)
    if scenario == "GENERATOR_FAILURE":
        result = simulation_runner(station, affected_assets[0]) if simulation_runner else None
        # The established simulation is authoritative; keep the incident usable
        # when it has no telemetry sample to calculate from.
        if not result or not result.get("state_changes"):
            _mark_supported_assets(db, station, affected_assets, "FAILED", 0)
    elif scenario in ("FIRE", "FUEL_LEAK"): _mark_supported_assets(db, station, affected_assets, "CRITICAL", 20)
    elif scenario == "BLACKOUT": _mark_supported_assets(db, station, affected_assets, "WARNING", 50)
    elif scenario == "COMMUNICATION_LOSS": set_connectivity(db, station, OFFLINE)
    alerts = generate_incident_alert_info(scenario, severity, title, actions)
    incident = Incident(station_id=station, incident_type=scenario, scenario=scenario, severity=severity, title=title, description=description, status="ACTIVE", source=source, affected_assets=json.dumps(affected_assets), alerts=json.dumps(alerts), prototype_note="Simulated operational scenario; not a live station incident.")
    db.add(incident); db.commit(); db.refresh(incident)
    if get_connectivity(db, station).state == OFFLINE: enqueue_event(db, station, "INCIDENT_CREATED", serialize_incident(incident), "P1")
    return incident

def get_incident(db: Session, incident_id: int) -> Incident | None:
    return db.query(Incident).filter(Incident.id == incident_id).first()

def list_incidents(db: Session, station: str | None = None, status: str | None = None) -> list[Incident]:
    query = db.query(Incident)
    if station: query = query.filter(Incident.station_id == station.upper())
    if status:
        status = status.upper()
        if status not in STATUSES: raise ValueError(f"status must be one of: {', '.join(STATUSES)}")
        query = query.filter(Incident.status == status)
    return query.order_by(Incident.created_at.desc(), Incident.id.desc()).all()

def list_active_incidents(db: Session, station: str | None = None) -> list[Incident]: return list_incidents(db, station, "ACTIVE")

def update_incident_status(db: Session, incident: Incident, status: str) -> Incident:
    status = status.upper()
    if status not in STATUSES or status not in ALLOWED_TRANSITIONS.get(incident.status, set()): raise ValueError(f"invalid incident status transition: {incident.status} -> {status}")
    incident.status = status
    if status == "MITIGATED": incident.mitigated_at = datetime.utcnow()
    if status == "RESOLVED": incident.resolved_at = datetime.utcnow()
    db.commit(); db.refresh(incident)
    if get_connectivity(db, incident.station_id).state == OFFLINE: enqueue_event(db, incident.station_id, "INCIDENT_STATUS_UPDATED", serialize_incident(incident), "P1")
    return incident

def serialize_incident(incident: Incident) -> dict:
    try: affected_assets = json.loads(incident.affected_assets or "[]")
    except json.JSONDecodeError: affected_assets = [value for value in (incident.affected_assets or "").split(",") if value]
    try: alerts = json.loads(incident.alerts or "[]")
    except json.JSONDecodeError: alerts = []
    return {"id": incident.id, "station_id": incident.station_id, "station": incident.station_id, "incident_type": incident.incident_type, "scenario": incident.incident_type, "severity": incident.severity, "title": incident.title, "description": incident.description, "status": incident.status, "source": incident.source, "affected_assets": affected_assets, "alerts": alerts, "recommended_actions": alerts[0].get("recommended_actions", []) if alerts else [], "created_at": incident.created_at, "mitigated_at": incident.mitigated_at, "resolved_at": incident.resolved_at, "prototype": True}
