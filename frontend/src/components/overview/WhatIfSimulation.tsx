import { useState } from "react"
import { PlaySquare, Play, CheckCircle2, RefreshCw } from "lucide-react"
import { runSimulation, type SimulationResult } from "../../services/api"

interface WhatIfSimulationProps {
  onSimulationComplete?: (result: SimulationResult) => void
}

export default function WhatIfSimulation({ onSimulationComplete }: WhatIfSimulationProps) {
  const [scenario, setScenario] = useState<string>("GENERATOR_FAILURE")
  const [durationHours, setDurationHours] = useState<number>(12)
  const [selectedAssetId, setSelectedAssetId] = useState<string>("MAI-GEN-02")
  const [systems, setSystems] = useState({
    Energy: true,
    HVAC: true,
    Fuel: true,
    Logistics: true
  })

  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const toggleSystem = (sys: keyof typeof systems) => {
    setSystems((prev) => ({ ...prev, [sys]: !prev[sys] }))
  }

  async function handleRunSimulation() {
    try {
      setLoading(true)
      const data = await runSimulation("MAITRI", scenario, selectedAssetId)
      setResult(data)
      if (onSimulationComplete) {
        onSimulationComplete(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-[#202A35] bg-[#0E141B] p-4 shadow-xl font-mono text-xs">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#202A35] pb-3">
        <div className="flex items-center gap-2">
          <PlaySquare size={16} className="text-[#78B9E8]" />
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#F2F5F7]">
              WHAT-IF FAILURE SIMULATION ENGINE
            </h3>
            <p className="text-[10px] text-[#6E7883]">
              PREDICTIVE INFRASTRUCTURE CASCADE SIMULATION
            </p>
          </div>
        </div>

        <span className="rounded border border-[#78B9E8]/30 bg-[#78B9E8]/10 px-2 py-0.5 text-[9px] font-mono font-bold text-[#78B9E8]">
          SIMULATION ACTIVE
        </span>
      </div>

      {/* CONTROLS GRID */}
      <div className="my-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        
        {/* SCENARIO */}
        <div>
          <label className="mb-1.5 block text-[10px] text-[#6E7883]">SCENARIO</label>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="w-full rounded border border-[#202A35] bg-[#0B1016] px-3 py-2 text-xs text-[#F2F5F7] focus:border-[#78B9E8] focus:outline-none"
          >
            <option value="GENERATOR_FAILURE">Generator 02 Failure</option>
            <option value="HVAC_FREEZE">HVAC Main Freeze-Up</option>
            <option value="FUEL_CONTAMINATION">Fuel Tank Contamination</option>
          </select>
        </div>

        {/* TARGET ASSET */}
        <div>
          <label className="mb-1.5 block text-[10px] text-[#6E7883]">TARGET ASSET</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="w-full rounded border border-[#202A35] bg-[#0B1016] px-3 py-2 text-xs text-[#F2F5F7] focus:border-[#78B9E8] focus:outline-none"
          >
            <option value="MAI-GEN-02">Generator 02 (MAI-GEN-02)</option>
            <option value="MAI-GEN-01">Generator 01 (MAI-GEN-01)</option>
            <option value="MAI-HVAC-01">HVAC Unit (MAI-HVAC-01)</option>
          </select>
        </div>

        {/* DURATION */}
        <div>
          <label className="mb-1.5 block text-[10px] text-[#6E7883]">SIMULATION DURATION</label>
          <select
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value))}
            className="w-full rounded border border-[#202A35] bg-[#0B1016] px-3 py-2 text-xs text-[#F2F5F7] focus:border-[#78B9E8] focus:outline-none"
          >
            <option value={6}>6 hours</option>
            <option value={12}>12 hours</option>
            <option value={24}>24 hours</option>
            <option value={48}>48 hours</option>
          </select>
        </div>

        {/* AFFECTED SYSTEMS CHECKBOXES */}
        <div>
          <label className="mb-1.5 block text-[10px] text-[#6E7883]">AFFECTED SUBSYSTEMS</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {(["Energy", "HVAC", "Fuel", "Logistics"] as const).map((sys) => (
              <label key={sys} className="flex cursor-pointer items-center gap-1 text-[11px] text-[#A7B0BA]">
                <input
                  type="checkbox"
                  checked={systems[sys]}
                  onChange={() => toggleSystem(sys)}
                  className="rounded border-[#202A35] bg-[#0B1016] text-[#78B9E8] focus:ring-0"
                />
                <span>{sys}</span>
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* RUN BUTTON */}
      <button
        onClick={handleRunSimulation}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded border border-[#78B9E8]/40 bg-[#78B9E8]/10 py-3 font-mono text-xs font-bold text-[#78B9E8] transition hover:bg-[#78B9E8]/20 disabled:opacity-50"
      >
        {loading ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />}
        {loading ? "RUNNING SIMULATION MODEL..." : "RUN WHAT-IF SIMULATION"}
      </button>

      {/* SIMULATION RESULT DISPLAY */}
      {result && (
        <div className="mt-5 border-t border-[#202A35] pt-4 space-y-4 animate-in fade-in">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#42D392]" />
              <span className="text-xs font-bold text-[#F2F5F7]">SIMULATION RESULT — STATION REMAINS OPERATIONAL</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#6E7883]">RISK TRANSITION:</span>
              <span className="rounded bg-[#E8B84A]/20 px-2 py-0.5 text-[10px] font-bold text-[#E8B84A]">
                LOW → MEDIUM (OR CRITICAL)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
              <div className="text-[10px] text-[#6E7883]">POWER CAPACITY</div>
              <div className="mt-1 text-sm font-bold text-[#F05A5A]">
                {result.simulation.power_capacity.before_percent}% → {result.simulation.power_capacity.after_percent}%
              </div>
            </div>

            <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
              <div className="text-[10px] text-[#6E7883]">STATION LOAD</div>
              <div className="mt-1 text-sm font-bold text-[#E8B84A]">
                {result.simulation.station_load.before_percent}% → {result.simulation.station_load.after_percent}%
              </div>
            </div>

            <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
              <div className="text-[10px] text-[#6E7883]">FUEL CONSUMPTION</div>
              <div className="mt-1 text-sm font-bold text-[#E8B84A]">
                +{result.simulation.fuel_demand.estimated_change_percent}%
              </div>
            </div>

            <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
              <div className="text-[10px] text-[#6E7883]">CRITICAL SYSTEMS</div>
              <div className="mt-1 text-sm font-bold text-[#42D392]">
                ● MAINTAINED
              </div>
            </div>
          </div>

          <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
            <div className="text-[10px] font-bold text-[#6E7883]">AFFECTED SUBSYSTEMS</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {result.simulation.affected_systems.map((sys) => (
                <span key={sys} className="rounded border border-[#2A3542] bg-[#121922] px-2 py-0.5 text-[10px] text-[#F2F5F7]">
                  {sys}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  )
}