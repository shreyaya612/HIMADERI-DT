import asyncio
import sys
import os
from contextlib import asynccontextmanager

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from pydantic import BaseModel, Field
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database.db import engine, get_db, Base
from models.telemetry import Telemetry
from models.room import RoomState
from models.connectivity import StationConnectivity
from models.sync_queue import SyncQueueEvent
from services.telemetry_generator import generate_generator_telemetry
from services.sync_service import (
    OFFLINE,
    ONLINE,
    enqueue_event,
    get_connectivity,
    queue_if_offline,
    run_synchronization,
    serialize_event,
    set_connectivity,
    sync_status,
)
from models.simulation import SimulationRequest

from ai.rag.rag_assistant import answer_question
from ai.anomaly.detector import detect_anomaly
from ai.rag.assistant import ask_local_llm

class RoomDataRequest(BaseModel):
    buildingID: str
    floorNumber: int
    roomID: str

    peopleCount: int

    co2ppm: float
    roomVolume: float
    ventilationCoefficient: float

    fireDetected: bool
    smokeLevel: float
    temperature: float
    riskScore: float


class AssistantRequest(BaseModel):
    question: str


class ConnectivityUpdateRequest(BaseModel):
    state: str


class SyncEventRequest(BaseModel):
    station_id: str
    event_type: str
    payload: dict
    priority: str = Field(default="P5")
    
Base.metadata.create_all(bind=engine)

async def telemetry_loop():
    while True:
        db = next(get_db())

        try:
            data = generate_generator_telemetry()

            telemetry = Telemetry(**data)

            db.add(telemetry)
            db.commit()
            queue_if_offline(db, telemetry.station, "TELEMETRY", data, "P5")

            print(
                f"[TELEMETRY] {telemetry.asset_id} | "
                f"Temp: {telemetry.temperature}°C | "
                f"Vibration: {telemetry.vibration} | "
                f"Load: {telemetry.load}%"
            )

        except Exception as e:
            db.rollback()
            print(f"[TELEMETRY ERROR] {e}")

        finally:
            db.close()

        await asyncio.sleep(5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(telemetry_loop())

    yield

    task.cancel()


app = FastAPI(
    title="HIMADRI-DT API",
    description="Digital Twin Platform for Antarctic Stations",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "project": "HIMADRI-DT",
        "status": "running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HIMADRI-DT backend"
    }


@app.get("/api/stations/{station_id}/connectivity")
def station_connectivity(station_id: str, db: Session = Depends(get_db)):
    """Read the persisted edge-to-cloud state (ONLINE or OFFLINE)."""
    connectivity = get_connectivity(db, station_id)
    return {
        "station_id": connectivity.station_id,
        "state": connectivity.state,
        "updated_at": connectivity.updated_at,
    }


@app.post("/api/stations/{station_id}/connectivity")
def update_station_connectivity(
    station_id: str,
    request: ConnectivityUpdateRequest,
    db: Session = Depends(get_db),
):
    state = request.state.upper()
    if state not in (ONLINE, OFFLINE):
        raise HTTPException(status_code=422, detail="state must be ONLINE or OFFLINE")

    connectivity, reconnect_sync = set_connectivity(db, station_id, state)
    return {
        "station_id": connectivity.station_id,
        "state": connectivity.state,
        "updated_at": connectivity.updated_at,
        "reconnect_sync": reconnect_sync,
    }


@app.get("/api/sync/queue")
def get_sync_queue(
    station_id: str | None = None,
    include_synced: bool = False,
    db: Session = Depends(get_db),
):
    query = db.query(SyncQueueEvent)
    if station_id:
        query = query.filter(SyncQueueEvent.station_id == station_id.upper())
    if not include_synced:
        query = query.filter(SyncQueueEvent.sync_status != "SYNCED")
    events = query.order_by(
        SyncQueueEvent.priority.asc(),
        SyncQueueEvent.created_at.asc(),
        SyncQueueEvent.id.asc(),
    ).all()
    return {"events": [serialize_event(event) for event in events]}


@app.post("/api/sync/queue/events")
def add_sync_event(request: SyncEventRequest, db: Session = Depends(get_db)):
    """Demo-friendly manual local event capture; it never depends on cloud access."""
    try:
        event = enqueue_event(
            db, request.station_id, request.event_type, request.payload, request.priority
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return serialize_event(event)


@app.post("/api/sync/run")
def run_sync(station_id: str | None = None, db: Session = Depends(get_db)):
    if station_id:
        if get_connectivity(db, station_id).state == OFFLINE:
            return {
                "station_id": station_id.upper(),
                "message": "Station is OFFLINE; events remain in the local queue.",
                "attempted": 0,
                "synced": 0,
                "failed": 0,
                "processed_event_ids": [],
            }
        return run_synchronization(db, station_id)

    # Never send data for an offline station, even when running a global flush.
    totals = {"attempted": 0, "synced": 0, "failed": 0, "processed_event_ids": []}
    station_ids = [row[0] for row in db.query(SyncQueueEvent.station_id).distinct().all()]
    for queued_station_id in station_ids:
        if get_connectivity(db, queued_station_id).state == ONLINE:
            result = run_synchronization(db, queued_station_id)
            for key in ("attempted", "synced", "failed"):
                totals[key] += result[key]
            totals["processed_event_ids"].extend(result["processed_event_ids"])
    return totals


@app.get("/api/sync/status")
def get_sync_status(station_id: str | None = None, db: Session = Depends(get_db)):
    return sync_status(db, station_id)


@app.post("/api/telemetry/generate")
def generate_telemetry(db: Session = Depends(get_db)):

    data = generate_generator_telemetry()

    telemetry = Telemetry(**data)

    db.add(telemetry)
    db.commit()
    db.refresh(telemetry)
    queue_if_offline(db, telemetry.station, "TELEMETRY", data, "P5")

    return {
        "id": telemetry.id,
        "station": telemetry.station,
        "asset_id": telemetry.asset_id,
        "temperature": telemetry.temperature,
        "vibration": telemetry.vibration,
        "load": telemetry.load,
        "rpm": telemetry.rpm,
        "fuel_rate": telemetry.fuel_rate,
        "timestamp": telemetry.timestamp
    }
    
@app.post("/api/telemetry/generate-anomaly")
def generate_anomaly(db: Session = Depends(get_db)):

    data = generate_generator_telemetry(
        mode="anomaly"
    )

    telemetry = Telemetry(**data)

    db.add(telemetry)
    db.commit()
    db.refresh(telemetry)
    queue_if_offline(db, telemetry.station, "TELEMETRY_ANOMALY", data, "P1")

    return {
        "id": telemetry.id,
        "station": telemetry.station,
        "asset_id": telemetry.asset_id,
        "temperature": telemetry.temperature,
        "vibration": telemetry.vibration,
        "load": telemetry.load,
        "rpm": telemetry.rpm,
        "fuel_rate": telemetry.fuel_rate,
        "timestamp": telemetry.timestamp
    }


@app.get("/api/telemetry/latest")
def latest_telemetry(db: Session = Depends(get_db)):

    telemetry = (
        db.query(Telemetry)
        .order_by(Telemetry.timestamp.desc())
        .first()
    )

    if not telemetry:
        return {
            "message": "No telemetry available"
        }

    return {
        "id": telemetry.id,
        "station": telemetry.station,
        "asset_id": telemetry.asset_id,
        "temperature": telemetry.temperature,
        "vibration": telemetry.vibration,
        "load": telemetry.load,
        "rpm": telemetry.rpm,
        "fuel_rate": telemetry.fuel_rate,
        "timestamp": telemetry.timestamp
    }

@app.get("/api/ai/analyze")
def analyze_latest_telemetry(
    db: Session = Depends(get_db)
):

    telemetry = (
        db.query(Telemetry)
        .order_by(Telemetry.timestamp.desc())
        .first()
    )

    if not telemetry:
        return {
            "message": "No telemetry available"
        }

    telemetry_data = {
        "temperature": telemetry.temperature,
        "vibration": telemetry.vibration,
        "load": telemetry.load,
        "rpm": telemetry.rpm,
        "fuel_rate": telemetry.fuel_rate,
    }

    result = detect_anomaly(telemetry_data)

    return {
        "station": telemetry.station,
        "asset_id": telemetry.asset_id,

        "telemetry": telemetry_data,

        "ai": result,

        "timestamp": telemetry.timestamp
    }
    
@app.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):

    telemetry = (
        db.query(Telemetry)
        .order_by(Telemetry.timestamp.desc())
        .first()
    )

    if not telemetry:
        return []

    telemetry_data = {
        "temperature": telemetry.temperature,
        "vibration": telemetry.vibration,
        "load": telemetry.load,
        "rpm": telemetry.rpm,
        "fuel_rate": telemetry.fuel_rate,
    }

    ai_result = detect_anomaly(telemetry_data)

    alerts = []

    if ai_result["risk"] == "HIGH":
        alerts.append({
            "id": "AI-GEN-001",
            "severity": "CRITICAL",
            "asset_id": telemetry.asset_id,
            "title": "Generator anomaly detected",
            "message": (
                f"Abnormal operating pattern detected in "
                f"{telemetry.asset_id}"
            ),
            "timestamp": telemetry.timestamp,
            "source": "AI Predictive Monitoring"
        })

    elif ai_result["risk"] == "MEDIUM":
        alerts.append({
            "id": "AI-GEN-002",
            "severity": "WARNING",
            "asset_id": telemetry.asset_id,
            "title": "Generator requires attention",
            "message": (
                f"Unusual operating pattern detected in "
                f"{telemetry.asset_id}"
            ),
            "timestamp": telemetry.timestamp,
            "source": "AI Predictive Monitoring"
        })

    return alerts

@app.get("/api/stations/{station_id}/assets")
def get_station_assets(
    station_id: str,
    db: Session = Depends(get_db)
):
    station_id = station_id.upper()

    if station_id != "MAITRI":
        return {
            "station": station_id,
            "assets": []
        }

    telemetry = (
        db.query(Telemetry)
        .filter(Telemetry.station == station_id)
        .order_by(Telemetry.timestamp.desc())
        .first()
    )

    if not telemetry:
        return {
            "station": station_id,
            "assets": []
        }

    telemetry_data = {
        "temperature": telemetry.temperature,
        "vibration": telemetry.vibration,
        "load": telemetry.load,
        "rpm": telemetry.rpm,
        "fuel_rate": telemetry.fuel_rate,
    }

    ai_result = detect_anomaly(telemetry_data)

    generator_status = "NORMAL"

    if ai_result["risk"] == "HIGH":
        generator_status = "CRITICAL"
    elif ai_result["risk"] == "MEDIUM":
        generator_status = "WARNING"

    return {
        "station": station_id,
        "assets": [
            {
                "asset_id": "MAI-GEN-01",
                "name": "Generator 1",
                "type": "GENERATOR",
                "status": "NORMAL",
                "health": 96
            },
            {
                "asset_id": "MAI-GEN-02",
                "name": "Generator 2",
                "type": "GENERATOR",
                "status": generator_status,
                "health": ai_result["health"]
            },
            {
                "asset_id": "MAI-FUEL-01",
                "name": "Fuel Farm",
                "type": "FUEL",
                "status": "NORMAL",
                "health": 94
            },
            {
                "asset_id": "MAI-HVAC-01",
                "name": "HVAC System",
                "type": "HVAC",
                "status": "NORMAL",
                "health": 93
            },
            {
                "asset_id": "MAI-WTR-01",
                "name": "Water System",
                "type": "WATER",
                "status": "NORMAL",
                "health": 97
            }
        ]
    }

@app.post("/api/unity/rooms")
def update_room(
    room: RoomDataRequest,
    db: Session = Depends(get_db)
):
    room_state = RoomState(
        building_id=room.buildingID,
        floor_number=room.floorNumber,
        room_id=room.roomID,
        people_count=room.peopleCount,
        co2_ppm=room.co2ppm,
        room_volume=room.roomVolume,
        ventilation_coefficient=room.ventilationCoefficient,
        fire_detected=room.fireDetected,
        smoke_level=room.smokeLevel,
        temperature=room.temperature,
        risk_score=room.riskScore,
    )

    db.add(room_state)
    db.commit()
    db.refresh(room_state)

    return {
        "status": "received",
        "room": room.roomID,
        "building": room.buildingID,
        "risk_score": room.riskScore,
        "fire_detected": room.fireDetected,
        "timestamp": room_state.timestamp,
    }

@app.get("/api/unity/rooms/latest")
def get_latest_rooms(
    db: Session = Depends(get_db)
):
    rooms = (
        db.query(RoomState)
        .order_by(RoomState.timestamp.desc())
        .limit(50)
        .all()
    )

    return [
        {
            "buildingID": room.building_id,
            "floorNumber": room.floor_number,
            "roomID": room.room_id,
            "peopleCount": room.people_count,
            "co2ppm": room.co2_ppm,
            "roomVolume": room.room_volume,
            "ventilationCoefficient": room.ventilation_coefficient,
            "fireDetected": room.fire_detected,
            "smokeLevel": room.smoke_level,
            "temperature": room.temperature,
            "riskScore": room.risk_score,
            "timestamp": room.timestamp,
        }
        for room in rooms
    ]
    
@app.post("/api/simulation")
def run_simulation(
    request: SimulationRequest,
    db: Session = Depends(get_db)
):
    station = request.station.upper()
    scenario = request.scenario.upper()
    asset_id = request.asset_id.upper()

    if scenario != "GENERATOR_FAILURE":
        return {
            "station": station,
            "scenario": scenario,
            "asset_id": asset_id,
            "message": "Scenario not supported"
        }

    # Get latest telemetry for the selected generator
    generator = (
        db.query(Telemetry)
        .filter(
            Telemetry.station == station,
            Telemetry.asset_id == asset_id
        )
        .order_by(Telemetry.timestamp.desc())
        .first()
    )

    if not generator:
        return {
            "station": station,
            "scenario": scenario,
            "asset_id": asset_id,
            "message": "No telemetry available for selected asset"
        }

    # Current generator contribution
    generator_load = generator.load

    # Prototype station assumptions
    current_station_load = 72.0
    current_power_capacity = 100.0

    # Estimate the power contribution lost when generator fails
    lost_power = generator_load

    remaining_capacity = max(
        0,
        current_power_capacity - lost_power
    )

    # Estimate new station stress/load
    if remaining_capacity > 0:
        new_station_load = (
            current_station_load
            + (lost_power * 0.25)
        )
    else:
        new_station_load = 100

    new_station_load = min(
        100,
        round(new_station_load, 2)
    )

    # Estimate fuel demand increase on remaining systems
    fuel_change = min(
        50,
        round((lost_power / 100) * 25, 2)
    )

    # Determine affected systems
    affected_systems = []

    if new_station_load >= 80:
        affected_systems.extend([
            "HVAC",
            "Water System"
        ])

    if new_station_load >= 90:
        affected_systems.append(
            "Research Equipment"
        )

    if not affected_systems:
        affected_systems.append(
            "No critical systems immediately affected"
        )

    # Overall simulation risk
    if new_station_load >= 90:
        risk_level = "CRITICAL"
    elif new_station_load >= 80:
        risk_level = "HIGH"
    else:
        risk_level = "MEDIUM"

    return {
        "station": station,
        "scenario": scenario,
        "asset_id": asset_id,

        "current_state": {
            "generator_load_percent": round(
                generator_load, 2
            ),
            "generator_temperature": round(
                generator.temperature, 2
            ),
            "generator_vibration": round(
                generator.vibration, 3
            ),
            "fuel_rate": round(
                generator.fuel_rate, 2
            )
        },

        "simulation": {
            "generator_status": "FAILED",

            "power_capacity": {
                "before_percent": current_power_capacity,
                "after_percent": round(
                    remaining_capacity, 2
                )
            },

            "station_load": {
                "before_percent": current_station_load,
                "after_percent": new_station_load
            },

            "fuel_demand": {
                "estimated_change_percent": fuel_change
            },

            "affected_systems": affected_systems,

            "risk_level": risk_level
        },

        "message": (
            f"Failure of {asset_id} simulated using "
            "current telemetry. The station load and "
            "remaining power capacity were recalculated."
        )
    }
    
@app.post("/api/assistant/test")
def test_local_assistant():

    answer = ask_local_llm(
        """
        You are an operational assistant for an Antarctic research station.

        A generator is showing abnormal vibration.

        Give the operator 4 concise checks they should perform.
        Do not invent station-specific procedures.
        """
    )

    return {
        "mode": "LOCAL_AI",
        "answer": answer
    }

@app.post("/api/assistant")
def ask_assistant(request: AssistantRequest, db: Session = Depends(get_db)):
    telemetry = (
        db.query(Telemetry)
        .order_by(Telemetry.timestamp.desc())
        .first()
    )
    if not telemetry:
        return answer_question(request.question)

    telemetry_data = {
        "temperature": telemetry.temperature,
        "vibration": telemetry.vibration,
        "load": telemetry.load,
        "rpm": telemetry.rpm,
        "fuel_rate": telemetry.fuel_rate,
    }
    assessment = answer_question(
        request.question,
        telemetry=telemetry_data,
        predictive=detect_anomaly(telemetry_data),
    )
    assessment.update({
        "station": telemetry.station,
        "asset_id": telemetry.asset_id,
        "timestamp": telemetry.timestamp,
    })
    return assessment
