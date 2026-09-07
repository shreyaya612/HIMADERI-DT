# HIMADRI-DT 🇦🇶

### Digital Twin Platform for Efficient Remote Management of Indian Antarctic Research Stations

HIMADRI-DT is an **offline-first operational platform** designed to support remote monitoring, predictive maintenance, incident management, and AI-assisted decision-making for Indian Antarctic research stations such as **Maitri and Bharati**.

> **We don't just show the station's current state — we help the operator understand what happens next.**

---

## 🚀 Overview

Antarctic research stations operate in extremely remote and harsh environments where reliable connectivity cannot always be guaranteed.

HIMADRI-DT provides a local-first system that can:

- Monitor station telemetry
- Detect abnormal equipment behaviour
- Assess operational risk
- Provide AI-assisted explanations
- Retrieve relevant SOPs using RAG
- Run a local LLM for offline assistance
- Simulate operational incidents
- Track incident lifecycles
- Continue operating during connectivity loss
- Queue events for synchronization when connectivity returns
- Provide a unified React operator dashboard

---

## 🏗️ System Architecture

```text
                  ANTARCTIC STATION
                         │
                      Telemetry
                         │
                         ▼
                  ┌─────────────┐
                  │   FastAPI   │
                  │   Backend   │
                  └──────┬──────┘
                         │
        ┌────────────────┼─────────────────┐
        ▼                ▼                 ▼
     SQLite        Predictive AI      Incident Mode
        │                │                 │
        │                ▼                 │
        │             POLAR AI             │
        │              + RAG               │
        │              + LLM               │
        │                │                 │
        └────────────────┼─────────────────┘
                         ▼
                  React Dashboard
                         │
                         ▼
                     Operator
```

---

# ▶️ Running the Project

## Prerequisites

Make sure the following are installed:

- Python 3
- Node.js and npm
- Ollama (required for local LLM functionality)

---

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd HIMADRI-DT
```

---

# 2. Start the Backend

Open a terminal:

```powershell
cd backend
```

Create a virtual environment if you haven't already:

```powershell
python -m venv venv
```

Activate it:

```powershell
.\venv\Scripts\Activate
```

Install backend dependencies:

```powershell
pip install -r requirements.txt
```

Start FastAPI:

```powershell
uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

Swagger API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

# 3. Start the Frontend

Open a **second terminal**.

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Open the URL shown by Vite, usually:

```text
http://localhost:5173
```

---

# 4. Start Ollama

Make sure Ollama is installed and the required local model is available.

Check Ollama:

```powershell
ollama list
```

The project currently uses a local Llama model for the AI/RAG workflow.

If the model has not been downloaded yet, pull the configured model using Ollama.

---

# 🔄 Typical Startup

For normal development, you need:

### Terminal 1 — Backend

```powershell
cd HIMADRI-DT\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

### Terminal 2 — Frontend

```powershell
cd HIMADRI-DT\frontend
npm run dev
```

### Ollama

Keep the Ollama service available locally for POLAR AI functionality.

---

# 🎬 Basic Demo Flow

Once both frontend and backend are running:

```text
1. Open React Dashboard
        ↓
2. Check Station Status
        ↓
3. View Telemetry
        ↓
4. View AI / POLAR AI assessment
        ↓
5. Open Incident Mode
        ↓
6. Select Generator Failure
        ↓
7. Trigger Incident
        ↓
8. Observe ACTIVE incident
        ↓
9. Mitigate
        ↓
10. Resolve
        ↓
11. Incident moves to Recent History
```

### Offline Demo

You can also demonstrate communication loss:

```text
1. Open Incident Mode
        ↓
2. Select Communication Loss
        ↓
3. Trigger Incident
        ↓
4. Station becomes OFFLINE
        ↓
5. P1 sync event is queued
        ↓
6. Local operation continues
```
---

# ✨ Features

## 1. Station Telemetry

The backend generates and processes station telemetry for monitoring equipment behaviour.

Current telemetry includes:

- Temperature
- Vibration
- Load
- RPM
- Fuel rate
- Timestamp

The current prototype uses **synthetic telemetry** to simulate station sensor data.

The telemetry pipeline is structured so that real station sensor data can be integrated in the future.

---

## 2. Predictive Anomaly Detection

HIMADRI-DT uses **Isolation Forest** to identify unusual operating patterns.

### Workflow

```text
Telemetry
    ↓
Feature Values
    ↓
Isolation Forest
    ↓
Normal / Anomaly
    ↓
Risk Assessment
    ↓
Alert
```

For example, an unusual combination of temperature, vibration, load and RPM can be detected as abnormal behaviour.

### Why Isolation Forest?

The system may not have enough labelled failure data for every possible equipment failure.

Isolation Forest is an **unsupervised anomaly detection algorithm**, allowing the system to identify unusual behaviour without requiring every possible failure to be labelled.

> The current implementation provides anomaly detection and early warning. It does not claim exact failure-time prediction.

---

# 🤖 3. POLAR AI

POLAR AI is the AI-assisted operational analysis layer.

It uses current station information and anomaly results to generate an operator-oriented assessment.

### Workflow

```text
Latest Telemetry
       +
Anomaly Result
       +
Risk / Health
       ↓
    POLAR AI
       ↓
   SOP Retrieval
       ↓
Relevant SOP Chunks
       ↓
    Local LLM
       ↓
Operator Assessment
```

The assessment can contain:

- Problem
- Current telemetry evidence
- Risk
- Health
- Possible causes
- Possible consequences
- Recommended actions
- SOP source
- Evidence-based confidence

---

# 📚 4. RAG-Based SOP Assistant

The project uses **Retrieval-Augmented Generation (RAG)** to ground AI responses in locally available operational procedures.

## RAG Pipeline

### Document Ingestion

```text
SOP Documents
      ↓
Text Extraction
      ↓
Chunking
      ↓
Embeddings
      ↓
Local Storage
```

### Retrieval

```text
Current Problem
      ↓
Query Embedding
      ↓
Similarity Search
      ↓
Relevant SOP Chunks
```

### Generation

```text
Station Condition
       +
Relevant SOP Context
       ↓
    Local LLM
       ↓
Operator Guidance
```

This helps prevent the LLM from relying only on general knowledge and instead provides it with relevant station procedures.

---

# 📴 5. Local LLM / Offline AI

The project uses **Ollama with a local Llama model** for local AI assistance.

This is important because Antarctic stations may experience communication outages.

Instead of depending completely on:

```text
Station
   ↓
Internet
   ↓
Cloud AI
```

the system can operate locally:

```text
Station
   ↓
FastAPI
   ↓
Local RAG
   ↓
Local LLM
   ↓
Operator Assistance
```

Therefore, AI assistance can continue to function locally even when external connectivity is unavailable.

> **Connectivity can fail, but station intelligence shouldn't.**

The system also provides a deterministic fallback when the AI/RAG path is unavailable.

---

# 🚨 6. Incident Mode

HIMADRI-DT provides persistent incident management.

### Supported Incident Scenarios

- `GENERATOR_FAILURE`
- `FIRE`
- `BLACKOUT`
- `FUEL_LEAK`
- `COMMUNICATION_LOSS`
- `BLIZZARD`

### Incident Lifecycle

```text
ACTIVE
   ↓
MITIGATED
   ↓
RESOLVED
```

The backend enforces this lifecycle.

A direct:

```text
ACTIVE → RESOLVED
```

transition is rejected.

Each incident is persisted in SQLite with information such as:

- Station
- Scenario
- Severity
- Title
- Description
- Source
- Affected assets
- Alerts
- Created timestamp
- Updated timestamp
- Lifecycle status

---

# 🖥️ 7. Operator Incident Workflow

Incidents can be created directly from the React dashboard.

Swagger is useful for API testing, but the operator does **not** need Swagger to use Incident Mode.

### Workflow

```text
React Dashboard
      ↓
Simulate Incident
      ↓
Select Scenario
      ↓
Select Asset if required
      ↓
Create Incident
      ↓
FastAPI
      ↓
SQLite
      ↓
Incident ACTIVE
      ↓
Dashboard Updates
```

The operator can then manage the incident:

```text
ACTIVE
   ↓
MITIGATE
   ↓
MITIGATED
   ↓
RESOLVE
   ↓
RESOLVED
```

Resolved incidents disappear from the active incident display but remain available in recent incident history.

---

# 📡 8. Communication Loss

Communication loss is handled as an actual operational incident.

When a `COMMUNICATION_LOSS` incident is triggered:

```text
Communication Loss
        ↓
Station → OFFLINE
        ↓
Incident persisted locally
        ↓
P1 Sync Event Created
```

The local station continues operating instead of depending completely on the central connection.

---

# 💾 9. Offline-First Architecture

SQLite is used for local persistence.

The system stores important local state including:

- Telemetry
- Incidents
- Asset state
- Connectivity state
- Synchronization events

When connectivity is unavailable:

```text
Connection Lost
      ↓
Station OFFLINE
      ↓
Local Processing Continues
      ↓
Events Stored Locally
      ↓
Sync Queue
```

When connectivity returns:

```text
Connection Restored
      ↓
Pending Events
      ↓
Synchronization
```

The synchronization queue supports **priority-based event ordering**.

Important operational events such as incident creation can be assigned higher priority.

Failed synchronization attempts remain queued for retry.

---

# 🔄 10. Digital Twin Backend

The backend maintains a station-level digital twin state.

### Endpoint

```http
GET /api/stations/{station_id}/digital-twin
```

The response contains information such as:

- Station connectivity
- Assets
- Asset health
- Asset status
- Alert state
- Latest telemetry
- Risk
- Active incidents
- Environmental/telemetry information
- Simulation state

### Current Maitri Asset IDs

| Asset ID | Asset |
|---|---|
| `MAI-BLD-01` | Main Building |
| `MAI-FUEL-01` | Fuel Farm |
| `MAI-GEN-01` | Generator 01 |
| `MAI-GEN-02` | Generator 02 |
| `MAI-HVAC-01` | HVAC System |
| `MAI-WTR-01` | Water System |

Stable asset IDs provide a consistent contract between the backend and future visualization clients.

---

# 🔬 11. What-If Simulation

HIMADRI-DT includes a simulation layer for testing operational scenarios.

The current implementation supports **Generator Failure** simulation.

### Endpoint

```http
POST /api/simulation
```

### Example Request

```json
{
  "station": "MAITRI",
  "scenario": "GENERATOR_FAILURE",
  "asset_id": "MAI-GEN-02"
}
```

The simulation can expose:

- Affected assets
- State changes
- Power availability
- Alerts

This allows operators to explore possible consequences without directly modifying real physical infrastructure.

---

# 🌐 12. React Dashboard

The React dashboard acts as the operator's central monitoring interface.

It brings together:

- Station status
- Telemetry
- Alerts
- Predictive anomaly detection
- POLAR AI
- Incident Mode
- Connectivity status
- Incident history
- Digital Twin state

The frontend communicates with the FastAPI backend through typed API services.

Live information is periodically refreshed without requiring a complete page reload.

---

# 🔌 13. API Endpoints

### Telemetry

```http
GET /api/telemetry/latest
```

### AI

```http
GET /api/ai/analyze
POST /api/assistant
```

### Alerts

```http
GET /api/alerts
```

### Incidents

```http
POST /api/incidents
GET /api/incidents
GET /api/incidents/active
GET /api/incidents/{incident_id}
POST /api/incidents/{incident_id}/status
```

### Connectivity

```http
GET /api/stations/{station_id}/connectivity
POST /api/stations/{station_id}/connectivity
```

### Synchronization

```http
GET /api/sync/queue
POST /api/sync/queue/events
POST /api/sync/run
GET /api/sync/status
```

### Digital Twin

```http
GET /api/stations/{station_id}/digital-twin
```

### Simulation

```http
POST /api/simulation
```

---

# 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy
- SQLite

### AI / ML

- Python
- scikit-learn
- Isolation Forest
- Sentence Transformers
- Local Embeddings
- Ollama
- Llama
- RAG

---

# 📁 Project Structure

```text
HIMADRI-DT/
│
├── backend/
│   ├── main.py
│   ├── models/
│   ├── services/
│   └── tests/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
│
├── ai/
│   ├── anomaly/
│   │   ├── detector.py
│   │   ├── train.py
│   │   ├── model.pkl
│   │   └── test_detector.py
│   │
│   └── rag/
│       ├── assistant.py
│       ├── ingest.py
│       ├── rag_assistant.py
│       ├── retriever.py
│       ├── sop_chunks.json
│       └── sop_embeddings.npy
│
├── data/
│
└── docs/
    └── UNITY_API_CONTRACT.md
```

---

# 🧪 Testing & Validation

The implemented functionality has been validated through automated and browser-level testing.

### Current Results

- **24 backend tests passed**
- **Frontend TypeScript typecheck passed**
- **Frontend production build passed**
- React incident creation verified
- Incident mitigation and resolution verified
- Resolved incidents removed from active view
- Incident history persistence verified
- Communication Loss workflow verified
- Station OFFLINE state verified
- P1 incident synchronization event verified
- Digital Twin API verified
- AI assistant workflow verified
- Existing API contracts preserved

---

# 🔐 Design Principles

### Offline First

Critical station workflows should continue even when connectivity is unavailable.

### AI as Decision Support

AI assists the operator rather than directly controlling safety-critical infrastructure.

### Local Knowledge

Operational recommendations are grounded using locally available SOP information.

### Stateful Digital Twin

The backend maintains the current state of station assets and incidents.

### API-First Architecture

FastAPI provides the common communication layer between the dashboard, AI, simulation and station state.

### Auditable Operations

Incidents, statuses, alerts and synchronization events are persisted and traceable.

---

# 🚧 Current Scope

## Implemented

- Station telemetry pipeline
- Synthetic telemetry generation
- SQLite local persistence
- Isolation Forest anomaly detection
- POLAR AI
- Local RAG/SOP retrieval
- Local LLM integration
- Persistent Incident Mode
- Six incident scenarios
- Incident lifecycle management
- Communication Loss handling
- Offline connectivity state
- Priority-based synchronization queue
- Generator failure simulation
- Digital Twin backend state
- React operator dashboard
- API documentation
- Automated backend tests

## Future Work

- Bharati station implementation
- Real station sensor integration
- Production NCPOR/central synchronization
- Weather and environmental data integration
- Weather-aware fuel forecasting
- Logistics and spare-parts management
- Advanced failure prediction / RUL modelling
- More detailed digital twin visualization
- Expanded emergency simulations
- Production deployment and monitoring

---

# 🌍 Vision

HIMADRI-DT follows a simple operational cycle:

```text
MONITOR
   ↓
DETECT
   ↓
UNDERSTAND
   ↓
SIMULATE
   ↓
RESPOND
   ↓
SYNCHRONIZE
```

The goal is to provide Antarctic station operators with a platform that can:

> **Monitor the station, detect abnormal behaviour, understand the problem, simulate consequences, guide the response, and continue operating when connectivity fails.**

---

## 🇮🇳 Smart India Hackathon 2026

**Problem Statement:** SIH26060

**Theme:** Digital Platform for efficient remote management of Indian Antarctic Research Stations

**Domain:** Software

---

> ### The connection is gone. The intelligence isn't.