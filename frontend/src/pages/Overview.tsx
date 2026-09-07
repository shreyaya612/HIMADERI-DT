import { useEffect, useState } from "react"
import TopBar from "../components/layout/TopBar"
import SideBar, { type NavItemTab } from "../components/layout/SideBar"
import KPIRow from "../components/overview/KPIRow"
import DigitalTwinViewer, { type StationAsset, SAMPLE_STATION_ASSETS } from "../components/overview/DigitalTwinViewer"
import StationStatusPanel from "../components/overview/StationStatusPanel"
import EnergyPanel from "../components/overview/EnergyPanel"
import FuelPanel from "../components/overview/FuelPanel"
import EnvironmentPanel from "../components/overview/EnvironmentPanel"
import InfrastructurePanel from "../components/overview/InfrastructurePanel"
import LogisticsPanel from "../components/overview/LogisticsPanel"
import PredictivePanel from "../components/overview/PredictivePanel"
import RiskPanel from "../components/overview/RiskPanel"
import WhatIfSimulation from "../components/overview/WhatIfSimulation"
import CommunicationEdgePanel from "../components/overview/CommunicationEdgePanel"
import AIAssistant from "../components/overview/AIAssistant"
import AlertDrawer from "../components/overview/AlertDrawer"
import AssetDrawer from "../components/overview/AssetDrawer"
import IncidentModePanel from "../components/overview/IncidentModePanel"

import {
  getLatestTelemetry,
  getAIAnalysis,
  getAlerts,
  getActiveIncidents,
  getIncidents,
  getStationConnectivity,
  createIncident,
  updateIncidentStatus,
  type AIAnalysis,
  type Alert,
  type Incident,
  type IncidentScenario
} from "../services/api"
import type { Telemetry } from "../types/telemetry"

export default function Overview() {
  const [station, setStation] = useState<string>("MAITRI")
  const [activeTab, setActiveTab] = useState<NavItemTab>("Overview")
  const [isEdgeMode, setIsEdgeMode] = useState<boolean>(false)

  // Live Telemetry & AI state
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null)
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([])
  const [incidentHistory, setIncidentHistory] = useState<Incident[]>([])
  const [connectivity, setConnectivity] = useState<"ONLINE" | "OFFLINE">("ONLINE")
  const [error, setError] = useState<string | null>(null)

  // Drawers state
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<StationAsset | null>(null)
  const [aiQuery, setAiQuery] = useState<string>("")

  // Fetch live telemetry from backend
  useEffect(() => {
    async function loadData() {
      try {
        const telemetryData = await getLatestTelemetry()
        const aiData = await getAIAnalysis()
        const alertData = await getAlerts()

        setTelemetry(telemetryData)
        setAIAnalysis(aiData)
        setAlerts(alertData)
        setError(null)
      } catch (err) {
        // Fallback gracefully if backend is disconnected or offline
        setError("Telemetry offline — displaying cached station state")
      }
    }

    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const refreshIncidentData = async () => {
    const selectedStation = station === "BOTH" ? undefined : station
    const [open, history, stationConnectivity] = await Promise.all([
      getActiveIncidents(selectedStation), getIncidents(selectedStation),
      station === "BOTH" ? Promise.resolve(null) : getStationConnectivity(station),
    ])
    setActiveIncidents(open)
    setIncidentHistory(history)
    if (stationConnectivity) setConnectivity(stationConnectivity.state)
  }

  useEffect(() => {
    const loadIncidents = () => refreshIncidentData().catch(() => undefined)
    loadIncidents()
    const interval = setInterval(loadIncidents, 5000)
    return () => clearInterval(interval)
  }, [station])

  const handleCreateIncident = async (scenario: IncidentScenario, assetId?: string) => {
    const incident = await createIncident(station, scenario, assetId)
    setActiveIncidents((current) => [incident, ...current])
    setIncidentHistory((current) => [incident, ...current])
    await refreshIncidentData()
  }

  const handleIncidentStatusChange = async (incident: Incident, status: "MITIGATED" | "RESOLVED") => {
    const updated = await updateIncidentStatus(incident.id, status)
    setActiveIncidents((current) => status === "RESOLVED" ? current.filter((item) => item.id !== incident.id) : current.map((item) => item.id === incident.id ? updated : item))
    setIncidentHistory((current) => current.map((item) => item.id === incident.id ? updated : item))
    await refreshIncidentData()
  }

  const sampleAlertsList = alerts.length > 0 ? alerts.map((a) => ({
    id: a.id,
    severity: a.severity,
    title: a.title,
    timestamp: new Date(a.timestamp).toLocaleTimeString() + " UTC"
  })) : [
    { id: "AI-GEN-001", severity: "CRITICAL" as const, title: "Generator 02 overheating & abnormal vibration", timestamp: "08:42 UTC" },
    { id: "AI-HVAC-002", severity: "WARNING" as const, title: "HVAC efficiency declining", timestamp: "07:31 UTC" },
    { id: "AI-MET-003", severity: "INFO" as const, title: "Weather model updated — blizzard in 6h", timestamp: "06:12 UTC" }
  ]

  const handleSelectAssetById = (assetId: string) => {
    const found = SAMPLE_STATION_ASSETS.find((a) => a.id === assetId)
    if (found) {
      setSelectedAsset(found)
    }
  }

  const handleQueryAI = (query: string) => {
    setAiQuery(query)
    setActiveTab("AI Assistant")
  }

  return (
    <div className="min-h-screen bg-[#070A0E] text-[#F2F5F7]">
      
      {/* TOP SYSTEM BAR */}
      <TopBar
        station={station}
        onStationChange={setStation}
        alertCount={sampleAlertsList.length}
        isEdgeMode={isEdgeMode}
        onToggleEdgeMode={() => setIsEdgeMode(!isEdgeMode)}
        onOpenAI={() => setActiveTab("AI Assistant")}
        activeIncident={activeIncidents[0]}
      />

      {/* SIDEBAR NAVIGATION */}
      <SideBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        alertCount={sampleAlertsList.length}
      />

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="pl-56 pt-14">
        <div className="mx-auto max-w-[1600px] space-y-5 p-5">
          
          {/* HEADER BAR & STATUS NOTIFICATION */}
          <div className="flex flex-col justify-between gap-3 border-b border-[#202A35] pb-3 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-[#F2F5F7]">
                  {station} RESEARCH STATION — MISSION CONTROL
                </h1>
                <span className="rounded border border-[#78B9E8]/30 bg-[#78B9E8]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#78B9E8]">
                  {activeTab.toUpperCase()} VIEW
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#A7B0BA]">
                NCPOR Antarctic Operations · Real-Time Telemetry & AI Predictive Digital Twin
              </p>
            </div>

            {error && (
              <div className="rounded border border-[#E8B84A]/30 bg-[#E8B84A]/10 px-3 py-1 font-mono text-xs text-[#E8B84A]">
                ⚠ {error}
              </div>
            )}
          </div>

          {activeIncidents.length > 0 && (
            <section className="rounded border border-[#F05A5A]/40 bg-[#F05A5A]/10 p-3 font-mono">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-[#F05A5A]">🚨 ACTIVE INCIDENT</span>
                <span className="rounded bg-[#F05A5A]/20 px-1.5 py-0.5 font-bold text-[#F05A5A]">{activeIncidents[0].severity}</span>
                <span className="font-bold text-[#F2F5F7]">{activeIncidents[0].incident_type.replaceAll("_", " ")}</span>
                <span className="text-[#78B9E8]">{activeIncidents[0].station}</span>
              </div>
              <p className="mt-1 text-xs text-[#D8DEE5]">{activeIncidents[0].description}</p>
              <p className="mt-1 text-[11px] text-[#A7B0BA]">Affected: {activeIncidents[0].affected_assets.join(", ") || "station-level"} · {new Date(activeIncidents[0].created_at).toLocaleString()}</p>
              {activeIncidents[0].recommended_actions[0] && <p className="mt-1 text-[11px] text-[#78B9E8]">Action: {activeIncidents[0].recommended_actions[0]}</p>}
            </section>
          )}

          <IncidentModePanel
            station={station}
            openIncidents={activeIncidents}
            history={incidentHistory}
            offline={connectivity === "OFFLINE"}
            onCreate={handleCreateIncident}
            onStatusChange={handleIncidentStatusChange}
          />

          {/* DYNAMIC TAB RENDERING */}
          {activeTab === "Overview" && (
            <div className="space-y-5">
              
              {/* KPI CARDS ROW */}
              <KPIRow
                healthScore={aiAnalysis ? aiAnalysis.ai.health : 92}
                powerKw={telemetry ? Math.round(telemetry.load * 5.2) : 418}
                fuelPercent={68}
                temperature={telemetry ? telemetry.temperature : -31.4}
                healthyAssetsCount={47}
                totalAssetsCount={49}
                alertCount={sampleAlertsList.length}
                criticalAlertCount={1}
              />

              {/* HERO ROW: 3D DIGITAL TWIN (60%) + STATION STATUS PANEL (40%) */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <div className="lg:col-span-7 xl:col-span-8">
                  <DigitalTwinViewer
                    onSelectAsset={(ast) => setSelectedAsset(ast)}
                    selectedAssetId={selectedAsset?.id}
                  />
                </div>
                <div className="lg:col-span-5 xl:col-span-4">
                  <StationStatusPanel
                    health={aiAnalysis ? aiAnalysis.ai.health : 92}
                    power={418}
                    fuel={68}
                    alerts={sampleAlertsList}
                    onSelectAlert={(id) => setSelectedAlertId(id)}
                    onRunSimulation={() => setActiveTab("What-If Simulation")}
                  />
                </div>
              </div>

              {/* ENERGY & FUEL PANELS ROW */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <div className="lg:col-span-7 xl:col-span-8">
                  <EnergyPanel />
                </div>
                <div className="lg:col-span-5 xl:col-span-4">
                  <FuelPanel />
                </div>
              </div>

              {/* ENVIRONMENT METEOROLOGY PANEL */}
              <EnvironmentPanel />

              {/* INFRASTRUCTURE & CRITICAL ASSETS TABLE */}
              <InfrastructurePanel
                onSelectAsset={(ast) => setSelectedAsset(ast)}
              />

              {/* LOGISTICS & INVENTORY PANEL */}
              <LogisticsPanel />

              {/* PREDICTIVE ANALYTICS & RISK DASHBOARD ROW */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <PredictivePanel />
                <RiskPanel />
              </div>

              {/* WHAT-IF SIMULATION PANEL */}
              <WhatIfSimulation
                onSimulationComplete={() => {}}
              />

              {/* COMMUNICATIONS & EDGE PANEL */}
              <CommunicationEdgePanel
                isEdgeMode={isEdgeMode || connectivity === "OFFLINE"}
                onToggleMode={() => setIsEdgeMode(!isEdgeMode)}
              />

              {/* POLAR AI ASSISTANT PANEL */}
              <AIAssistant
                onViewAsset={handleSelectAssetById}
                onRunSimulation={() => setActiveTab("What-If Simulation")}
                initialQuery={aiQuery}
              />

            </div>
          )}

          {/* INDIVIDUAL TABS */}
          {activeTab === "Digital Twin" && (
            <div className="space-y-5">
              <DigitalTwinViewer
                onSelectAsset={(ast) => setSelectedAsset(ast)}
                selectedAssetId={selectedAsset?.id}
              />
              <InfrastructurePanel onSelectAsset={(ast) => setSelectedAsset(ast)} />
            </div>
          )}

          {activeTab === "Energy" && <EnergyPanel />}
          {activeTab === "Fuel" && <FuelPanel />}
          {activeTab === "Infrastructure" && <InfrastructurePanel onSelectAsset={(ast) => setSelectedAsset(ast)} />}
          {activeTab === "Logistics" && <LogisticsPanel />}
          {activeTab === "Environment" && <EnvironmentPanel />}
          {activeTab === "Predictive Analytics" && <PredictivePanel />}
          {activeTab === "Risk" && <RiskPanel />}
          {activeTab === "What-If Simulation" && <WhatIfSimulation />}
          {activeTab === "Communications" && <CommunicationEdgePanel isEdgeMode={isEdgeMode || connectivity === "OFFLINE"} onToggleMode={() => setIsEdgeMode(!isEdgeMode)} />}
          {activeTab === "Edge / Offline" && <CommunicationEdgePanel isEdgeMode={isEdgeMode || connectivity === "OFFLINE"} onToggleMode={() => setIsEdgeMode(!isEdgeMode)} />}
          {activeTab === "Alerts" && (
            <StationStatusPanel
              health={92}
              power={418}
              fuel={68}
              alerts={sampleAlertsList}
              onSelectAlert={(id) => setSelectedAlertId(id)}
              onRunSimulation={() => setActiveTab("What-If Simulation")}
            />
          )}
          {activeTab === "AI Assistant" && (
            <AIAssistant
              onViewAsset={handleSelectAssetById}
              onRunSimulation={() => setActiveTab("What-If Simulation")}
              initialQuery={aiQuery}
            />
          )}

          {/* FOOTER METADATA */}
          <footer className="flex flex-col gap-2 border-t border-[#202A35] pt-4 font-mono text-[10px] text-[#6E7883] sm:flex-row sm:items-center sm:justify-between">
            <div>
              NCPOR POLAR DIGITAL TWIN v2.4 · ANTARCTIC OPERATIONS CONTROL CENTRE
            </div>
            <div>
              MAITRI STATION LAT: -70.76° S LON: 11.74° E · BHARATI STATION LAT: -69.40° S LON: 76.19° E
            </div>
          </footer>

        </div>
      </main>

      {/* DRAWERS */}
      <AlertDrawer
        alertId={selectedAlertId}
        onClose={() => setSelectedAlertId(null)}
        onViewAsset={handleSelectAssetById}
        onRunSimulation={() => setActiveTab("What-If Simulation")}
      />

      <AssetDrawer
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onRunSimulation={() => setActiveTab("What-If Simulation")}
        onQueryAI={handleQueryAI}
      />

    </div>
  )
}
