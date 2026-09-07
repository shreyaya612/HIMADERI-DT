"""Offline-first synchronization helpers backed by the existing SQLite database."""

import json
from datetime import date, datetime
from typing import Any

from sqlalchemy.orm import Session

from models.connectivity import StationConnectivity
from models.sync_queue import SyncQueueEvent


ONLINE = "ONLINE"
OFFLINE = "OFFLINE"
PENDING = "PENDING"
SYNCED = "SYNCED"

PRIORITIES = {
    "P0": 0,  # emergency / safety
    "P1": 1,  # critical equipment
    "P2": 2,  # energy / fuel
    "P3": 3,  # logistics
    "P4": 4,  # environmental telemetry
    "P5": 5,  # routine telemetry
}


def _json_default(value: Any):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    raise TypeError(f"{type(value).__name__} is not JSON serializable")


def get_connectivity(db: Session, station_id: str) -> StationConnectivity:
    station_id = station_id.upper()
    connectivity = (
        db.query(StationConnectivity)
        .filter(StationConnectivity.station_id == station_id)
        .first()
    )
    if connectivity is None:
        connectivity = StationConnectivity(station_id=station_id, state=ONLINE)
        db.add(connectivity)
        db.commit()
        db.refresh(connectivity)
    return connectivity


def set_connectivity(db: Session, station_id: str, state: str) -> tuple[StationConnectivity, dict | None]:
    connectivity = get_connectivity(db, station_id)
    previous_state = connectivity.state
    connectivity.state = state.upper()
    db.commit()
    db.refresh(connectivity)

    # A reconnect immediately flushes the durable local outbox.
    sync_result = None
    if previous_state == OFFLINE and connectivity.state == ONLINE:
        sync_result = run_synchronization(db, connectivity.station_id)
    return connectivity, sync_result


def enqueue_event(
    db: Session,
    station_id: str,
    event_type: str,
    payload: dict[str, Any],
    priority: str | int = "P5",
) -> SyncQueueEvent:
    if isinstance(priority, str):
        priority = priority.upper()
        if priority not in PRIORITIES:
            raise ValueError("priority must be one of P0, P1, P2, P3, P4, or P5")
        priority_value = PRIORITIES[priority]
    elif priority in PRIORITIES.values():
        priority_value = priority
    else:
        raise ValueError("priority must be between 0 and 5")

    event = SyncQueueEvent(
        station_id=station_id.upper(),
        event_type=event_type,
        payload=json.dumps(payload, default=_json_default),
        priority=priority_value,
        sync_status=PENDING,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def queue_if_offline(
    db: Session, station_id: str, event_type: str, payload: dict[str, Any], priority: str | int = "P5"
) -> SyncQueueEvent | None:
    if get_connectivity(db, station_id).state == OFFLINE:
        return enqueue_event(db, station_id, event_type, payload, priority)
    return None


def deliver_event(event: SyncQueueEvent) -> None:
    """Sync transport seam.

    The current prototype has no central cloud endpoint. A successful call means
    the locally persisted event was accepted by the configured sync transport.
    ``_simulate_sync_failure`` is an intentional demo/test switch.
    """
    payload = json.loads(event.payload)
    if payload.get("_simulate_sync_failure"):
        raise RuntimeError("Simulated sync transport failure")


def run_synchronization(db: Session, station_id: str | None = None) -> dict[str, Any]:
    query = db.query(SyncQueueEvent).filter(SyncQueueEvent.sync_status == PENDING)
    if station_id:
        query = query.filter(SyncQueueEvent.station_id == station_id.upper())

    events = query.order_by(SyncQueueEvent.priority.asc(), SyncQueueEvent.created_at.asc(), SyncQueueEvent.id.asc()).all()
    result = {"attempted": 0, "synced": 0, "failed": 0, "processed_event_ids": []}

    for event in events:
        result["attempted"] += 1
        try:
            deliver_event(event)
            event.sync_status = SYNCED
            result["synced"] += 1
        except Exception:
            # Failures remain pending and durable; no event is discarded.
            event.retry_count += 1
            result["failed"] += 1
        db.commit()
        result["processed_event_ids"].append(event.id)

    return result


def serialize_event(event: SyncQueueEvent) -> dict[str, Any]:
    return {
        "id": event.id,
        "station_id": event.station_id,
        "event_type": event.event_type,
        "payload": json.loads(event.payload),
        "priority": f"P{event.priority}",
        "created_at": event.created_at,
        "sync_status": event.sync_status,
        "retry_count": event.retry_count,
    }


def sync_status(db: Session, station_id: str | None = None) -> dict[str, Any]:
    query = db.query(SyncQueueEvent)
    if station_id:
        query = query.filter(SyncQueueEvent.station_id == station_id.upper())
    events = query.all()
    return {
        "station_id": station_id.upper() if station_id else None,
        "pending": sum(event.sync_status == PENDING for event in events),
        "synced": sum(event.sync_status == SYNCED for event in events),
        "failed_retries": sum(event.retry_count for event in events),
    }
