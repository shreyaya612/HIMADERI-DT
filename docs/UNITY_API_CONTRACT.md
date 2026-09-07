# HIMADRI-DT Unity API Contract

Unity treats FastAPI as its only integration boundary. It must not access SQLite,
the predictive model, Ollama, RAG files, or simulation internals directly.

## Polling

For the demo, poll `GET /api/stations/MAITRI/digital-twin` every 2–5 seconds.
Use `POST /api/simulation` only when the operator triggers a scenario. Unity should
render returned state, not implement simulation or AI logic.

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/stations/{station_id}` | Station identity, connectivity, asset count |
| GET | `/api/stations/{station_id}/assets` | Unity asset catalogue and current state |
| GET | `/api/assets/{asset_id}` | One asset's current state, AI risk, and telemetry |
| GET | `/api/assets/{asset_id}/telemetry` | Latest asset telemetry without duplicate asset metadata |
| GET | `/api/stations/{station_id}/digital-twin` | Complete Unity polling snapshot |
| GET | `/api/stations/{station_id}/connectivity` | Persisted `ONLINE` or `OFFLINE` edge state |
| GET | `/api/alerts` | Predictive AI alerts |
| POST | `/api/simulation` | Run a supported what-if scenario |
| POST | `/api/incidents` | Declare a persistent simulated operational incident |
| GET | `/api/incidents` | List incidents, optionally filtered by `station` and `status` |
| GET | `/api/incidents/active` | List active incidents, optionally filtered by `station` |
| GET | `/api/incidents/{incident_id}` | Retrieve one incident |
| POST | `/api/incidents/{incident_id}/status` | Move `ACTIVE → MITIGATED → RESOLVED` |

`/api/connectivity/{station_id}` is intentionally not duplicated; use the existing
station-scoped connectivity endpoint above.

## Asset IDs and logical Unity positions

Positions returned by the API are logical scene placement coordinates, not physical
survey coordinates.

| Asset ID | Unity object | Type |
| --- | --- | --- |
| `MAI-GEN-01` | `Generator_01` | `GENERATOR` |
| `MAI-GEN-02` | `Generator_02` | `GENERATOR` |
| `MAI-FUEL-01` | `FuelFarm` | `FUEL` |
| `MAI-HVAC-01` | `HVAC` | `HVAC` |
| `MAI-WTR-01` | `WaterSystem` | `WATER` |
| `MAI-BLD-01` | `MainBuilding` | `BUILDING` |

Asset status values are `NORMAL`, `WARNING`, `CRITICAL`, and `FAILED`.

## Example asset response

`GET /api/assets/MAI-GEN-02`

```json
{
  "id": "MAI-GEN-02",
  "station": "MAITRI",
  "type": "GENERATOR",
  "name": "Generator 02",
  "status": "WARNING",
  "health": 71,
  "position": { "x": 8.0, "y": 0.0, "z": -2.0 },
  "alert_state": true,
  "latest_telemetry": { "temperature": 92.1, "vibration": 0.73 },
  "risk": "MEDIUM"
}
```

Values are illustrative. Unity must use the returned values, including `null`
telemetry when no local reading exists.

## Simulation

`POST /api/simulation`

```json
{
  "station": "MAITRI",
  "scenario": "GENERATOR_FAILURE",
  "asset_id": "MAI-GEN-02"
}
```

The existing detailed simulation response is retained. Unity should additionally
read these machine-friendly fields:

```json
{
  "affected_assets": ["MAI-GEN-02", "MAI-HVAC-01"],
  "state_changes": [
    { "asset_id": "MAI-GEN-02", "status": "FAILED" },
    { "asset_id": "MAI-HVAC-01", "status": "WARNING" }
  ],
  "power_available_percent": 35.0,
  "alerts": [{ "asset_id": "MAI-GEN-02", "severity": "HIGH" }]
}
```

Simulation state is persisted in the existing SQLite database. A later
`GET /api/assets/MAI-GEN-02` or digital-twin poll reports `FAILED` until a future
backend state-update workflow changes it.

## Incident Mode

Incident Mode stores deterministic, simulated operational scenarios locally. The
supported values are `GENERATOR_FAILURE`, `FIRE`, `BLACKOUT`, `FUEL_LEAK`,
`COMMUNICATION_LOSS`, and `BLIZZARD`. Unity may create incidents through the API,
but normally polls the digital-twin snapshot and visualizes its active incidents.

```json
POST /api/incidents
{
  "station": "MAITRI",
  "scenario": "GENERATOR_FAILURE",
  "asset_id": "MAI-GEN-02"
}
```

The snapshot retains every existing field and adds an `incidents` array containing
only active incidents:

```json
{
  "station": "MAITRI",
  "incidents": [{
    "id": 1,
    "incident_type": "GENERATOR_FAILURE",
    "severity": "CRITICAL",
    "status": "ACTIVE",
    "affected_assets": ["MAI-GEN-02"]
  }]
}
```

Use `POST /api/incidents/1/status` with `{ "status": "MITIGATED" }`, followed
by `{ "status": "RESOLVED" }`. Resolved incidents no longer appear in the
digital-twin `incidents` array. A `COMMUNICATION_LOSS` incident sets connectivity
to `OFFLINE`; Unity can continue polling the local API and reading local state.
