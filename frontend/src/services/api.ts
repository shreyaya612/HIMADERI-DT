import type { Telemetry } from "../types/telemetry"

const API_BASE_URL = "http://127.0.0.1:8000"

export async function getLatestTelemetry(): Promise<Telemetry> {
  const response = await fetch(
    `${API_BASE_URL}/api/telemetry/latest`,
    {
      cache: "no-store",
    }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch telemetry")
  }

  const data = await response.json()

  if (data.message === "No telemetry available") {
    throw new Error("No telemetry available")
  }

  return data
}

export interface AIAnalysis {
  station: string
  asset_id: string
  telemetry: {
    temperature: number
    vibration: number
    load: number
    rpm: number
    fuel_rate: number
  }
  ai: {
    is_anomaly: boolean
    risk: "LOW" | "MEDIUM" | "HIGH"
    anomaly_score: number
    health: number
  }
  timestamp: string
}

export async function getAIAnalysis(): Promise<AIAnalysis> {
  const response = await fetch(
    `${API_BASE_URL}/api/ai/analyze`,
    {
      cache: "no-store",
    }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch AI analysis")
  }

  return response.json()
}

export interface Alert {
  id: string
  severity: "CRITICAL" | "WARNING"
  asset_id: string
  title: string
  message: string
  timestamp: string
  source: string
}

export async function getAlerts(): Promise<Alert[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/alerts`,
    {
      cache: "no-store",
    }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch alerts")
  }

  return response.json()
}

export interface SimulationResult {
  station: string
  scenario: string
  asset_id: string

  current_state: {
    generator_load_percent: number
    generator_temperature: number
    generator_vibration: number
    fuel_rate: number
  }

  simulation: {
    generator_status: string

    power_capacity: {
      before_percent: number
      after_percent: number
    }

    station_load: {
      before_percent: number
      after_percent: number
    }

    fuel_demand: {
      estimated_change_percent: number
    }

    affected_systems: string[]

    risk_level: "MEDIUM" | "HIGH" | "CRITICAL"
  }

  message: string
}

export async function runSimulation(
  station: string,
  scenario: string,
  asset_id: string
): Promise<SimulationResult> {

  const response = await fetch(
    `${API_BASE_URL}/api/simulation`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        station,
        scenario,
        asset_id,
      }),
    }
  )

  if (!response.ok) {
    throw new Error("Failed to run simulation")
  }

  return response.json()
}

export interface Incident {
  id: number
  station: string
  incident_type: "GENERATOR_FAILURE" | "FIRE" | "BLACKOUT" | "FUEL_LEAK" | "COMMUNICATION_LOSS" | "BLIZZARD"
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  title: string
  description: string
  status: "ACTIVE" | "MITIGATED" | "RESOLVED"
  source: "OPERATOR" | "SIMULATION"
  affected_assets: string[]
  recommended_actions: string[]
  created_at: string
}

export async function getActiveIncidents(station?: string): Promise<Incident[]> {
  const query = station && station !== "BOTH" ? `?station=${encodeURIComponent(station)}` : ""
  const response = await fetch(`${API_BASE_URL}/api/incidents/active${query}`, { cache: "no-store" })
  if (!response.ok) throw new Error("Failed to fetch active incidents")
  const data = await response.json()
  return data.incidents
}

export async function createIncident(station: string, scenario: Incident["incident_type"], asset_id?: string): Promise<Incident> {
  const response = await fetch(`${API_BASE_URL}/api/incidents`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ station, scenario, asset_id, source: "OPERATOR" }),
  })
  if (!response.ok) throw new Error("Failed to create incident")
  return response.json()
}

export async function updateIncidentStatus(id: number, status: Incident["status"]): Promise<Incident> {
  const response = await fetch(`${API_BASE_URL}/api/incidents/${id}/status`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
  })
  if (!response.ok) throw new Error("Failed to update incident status")
  return response.json()
}
