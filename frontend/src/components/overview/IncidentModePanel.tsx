import { useState } from "react"
import { AlertTriangle, CheckCircle2, Plus, RefreshCw, X } from "lucide-react"
import type { Incident, IncidentScenario } from "../../services/api"

const SCENARIOS: Array<{ value: IncidentScenario; label: string; assetRequired: boolean }> = [
  { value: "GENERATOR_FAILURE", label: "Generator Failure", assetRequired: true },
  { value: "FIRE", label: "Fire", assetRequired: false },
  { value: "BLACKOUT", label: "Blackout", assetRequired: false },
  { value: "FUEL_LEAK", label: "Fuel Leak", assetRequired: false },
  { value: "COMMUNICATION_LOSS", label: "Communication Loss", assetRequired: false },
  { value: "BLIZZARD", label: "Blizzard", assetRequired: false },
]

interface IncidentModePanelProps {
  station: string
  openIncidents: Incident[]
  history: Incident[]
  offline: boolean
  onCreate: (scenario: IncidentScenario, assetId?: string) => Promise<void>
  onStatusChange: (incident: Incident, status: "MITIGATED" | "RESOLVED") => Promise<void>
}

const displayScenario = (value: string) => value.replaceAll("_", " ")

export default function IncidentModePanel({ station, openIncidents, history, offline, onCreate, onStatusChange }: IncidentModePanelProps) {
  const [showModal, setShowModal] = useState(false)
  const [scenario, setScenario] = useState<IncidentScenario>("GENERATOR_FAILURE")
  const [assetId, setAssetId] = useState("MAI-GEN-02")
  const [creating, setCreating] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const selectedScenario = SCENARIOS.find((item) => item.value === scenario)!

  const triggerIncident = async () => {
    setCreating(true); setFormError(null)
    try {
      await onCreate(scenario, selectedScenario.assetRequired ? assetId : undefined)
      setShowModal(false)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to trigger the incident.")
    } finally { setCreating(false) }
  }

  const changeStatus = async (incident: Incident, status: "MITIGATED" | "RESOLVED") => {
    setUpdatingId(incident.id); setStatusError(null)
    try { await onStatusChange(incident, status) }
    catch (error) { setStatusError(error instanceof Error ? error.message : "Unable to update incident status.") }
    finally { setUpdatingId(null) }
  }

  return <>
    <section className="rounded-lg border border-[#202A35] bg-[#0E141B] p-4 shadow-xl font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#202A35] pb-3">
        <div><h2 className="font-bold tracking-wider text-[#F2F5F7]">INCIDENT MODE</h2><p className="mt-0.5 text-[10px] text-[#6E7883]">LOCAL, PERSISTENT OPERATOR INCIDENT CONTROL</p></div>
        <button onClick={() => { setFormError(null); setShowModal(true) }} disabled={station === "BOTH"} className="flex items-center gap-1.5 rounded border border-[#F05A5A]/50 bg-[#F05A5A]/10 px-3 py-2 font-bold text-[#F05A5A] transition hover:bg-[#F05A5A]/20 disabled:opacity-50"><Plus size={14} /> SIMULATE INCIDENT</button>
      </div>
      {offline && <div className="mt-3 rounded border border-[#E8B84A]/40 bg-[#E8B84A]/10 px-3 py-2 text-[#E8B84A]">● STATION OFFLINE — local operations and sync queue are active.</div>}
      {statusError && <div className="mt-3 rounded border border-[#F05A5A]/40 bg-[#F05A5A]/10 px-3 py-2 text-[#F05A5A]">{statusError}</div>}
      <div className="mt-4 space-y-3">
        {openIncidents.length === 0 ? <div className="rounded border border-[#202A35] bg-[#0B1016] p-3 text-[#42D392]">● NORMAL — no open incidents</div> : openIncidents.map((incident) => <article key={incident.id} className="rounded border border-[#F05A5A]/35 bg-[#0B1016] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><AlertTriangle size={15} className="text-[#F05A5A]" /><span className="font-bold text-[#F2F5F7]">{incident.title}</span><span className="rounded bg-[#F05A5A]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#F05A5A]">{incident.severity}</span><span className="rounded bg-[#E8B84A]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#E8B84A]">{incident.status}</span></div><span className="text-[#78B9E8]">{incident.station}</span></div>
          <p className="mt-2 text-[#D8DEE5]">{displayScenario(incident.incident_type)} · {incident.description}</p>
          <p className="mt-1 text-[10px] text-[#A7B0BA]">Assets: {incident.affected_assets.join(", ") || "station-level"} · {new Date(incident.created_at).toLocaleString()}</p>
          {incident.recommended_actions.length > 0 && <p className="mt-1 text-[10px] text-[#78B9E8]">Action: {incident.recommended_actions[0]}</p>}
          <div className="mt-3 flex gap-2">{incident.status === "ACTIVE" && <button disabled={updatingId === incident.id} onClick={() => changeStatus(incident, "MITIGATED")} className="flex items-center gap-1 rounded border border-[#E8B84A]/40 bg-[#E8B84A]/10 px-2.5 py-1.5 text-[#E8B84A] disabled:opacity-50">{updatingId === incident.id && <RefreshCw size={12} className="animate-spin" />} MITIGATE</button>}{incident.status === "MITIGATED" && <button disabled={updatingId === incident.id} onClick={() => changeStatus(incident, "RESOLVED")} className="flex items-center gap-1 rounded border border-[#42D392]/40 bg-[#42D392]/10 px-2.5 py-1.5 text-[#42D392] disabled:opacity-50">{updatingId === incident.id ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} RESOLVE</button>}</div>
        </article>)}</div>
      <div className="mt-4 border-t border-[#202A35] pt-3"><h3 className="font-bold text-[#A7B0BA]">RECENT INCIDENTS</h3><div className="mt-2 space-y-1.5">{history.slice(0, 5).map((incident) => <div key={incident.id} className="flex flex-wrap justify-between gap-2 rounded bg-[#0B1016] px-2.5 py-2 text-[10px]"><span className="text-[#F2F5F7]">{displayScenario(incident.incident_type)}</span><span className="text-[#78B9E8]">{incident.station}</span><span className={incident.status === "RESOLVED" ? "text-[#42D392]" : "text-[#E8B84A]"}>{incident.status}</span></div>)}{history.length === 0 && <p className="text-[#6E7883]">No recorded incidents.</p>}</div></div>
    </section>
    {showModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"><div className="w-full max-w-md rounded-lg border border-[#202A35] bg-[#0E141B] p-5 shadow-2xl"><div className="flex items-center justify-between border-b border-[#202A35] pb-3"><div><h2 className="font-mono text-sm font-bold text-[#F2F5F7]">SIMULATE INCIDENT</h2><p className="mt-1 font-mono text-[10px] text-[#6E7883]">PERSISTENT LOCAL OPERATIONAL SCENARIO</p></div><button onClick={() => !creating && setShowModal(false)} className="text-[#A7B0BA]"><X size={18} /></button></div><div className="space-y-4 py-4 font-mono text-xs"><label className="block text-[#A7B0BA]">STATION<div className="mt-1 rounded border border-[#202A35] bg-[#0B1016] px-3 py-2 text-[#F2F5F7]">{station}</div></label><label className="block text-[#A7B0BA]">SCENARIO<select value={scenario} onChange={(event) => setScenario(event.target.value as IncidentScenario)} className="mt-1 w-full rounded border border-[#202A35] bg-[#0B1016] px-3 py-2 text-[#F2F5F7]">{SCENARIOS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>{selectedScenario.assetRequired && <label className="block text-[#A7B0BA]">AFFECTED GENERATOR<select value={assetId} onChange={(event) => setAssetId(event.target.value)} className="mt-1 w-full rounded border border-[#202A35] bg-[#0B1016] px-3 py-2 text-[#F2F5F7]"><option value="MAI-GEN-01">Generator 01 (MAI-GEN-01)</option><option value="MAI-GEN-02">Generator 02 (MAI-GEN-02)</option></select></label>}{formError && <div className="rounded border border-[#F05A5A]/40 bg-[#F05A5A]/10 p-2 text-[#F05A5A]">{formError}</div>}</div><div className="flex justify-end gap-2 border-t border-[#202A35] pt-3 font-mono text-xs"><button disabled={creating} onClick={() => setShowModal(false)} className="rounded border border-[#202A35] px-3 py-2 text-[#A7B0BA]">CANCEL</button><button disabled={creating} onClick={triggerIncident} className="flex items-center gap-2 rounded border border-[#F05A5A]/50 bg-[#F05A5A]/10 px-3 py-2 font-bold text-[#F05A5A] disabled:opacity-50">{creating && <RefreshCw size={13} className="animate-spin" />}{creating ? "TRIGGERING..." : "TRIGGER INCIDENT"}</button></div></div></div>}
  </>
}
