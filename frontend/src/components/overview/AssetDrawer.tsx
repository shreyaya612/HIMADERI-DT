import { X, Activity, Zap, Thermometer, ShieldAlert, Bot } from "lucide-react"
import { type StationAsset } from "./DigitalTwinViewer"

interface AssetDrawerProps {
  asset: StationAsset | null
  onClose: () => void
  onRunSimulation: (assetId: string) => void
  onQueryAI: (query: string) => void
}

export default function AssetDrawer({
  asset,
  onClose,
  onRunSimulation,
  onQueryAI
}: AssetDrawerProps) {
  if (!asset) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-md flex-col border-l border-[#202A35] bg-[#0E141B] p-5 shadow-2xl animate-in slide-in-from-right">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#202A35] pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#F2F5F7]">ASSET TELEMETRY INSPECTION</span>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#6E7883] hover:bg-[#161F29] hover:text-[#F2F5F7]"
          >
            <X size={16} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 font-mono text-xs">
          
          {/* TITLE & BADGES */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#78B9E8]">{asset.id}</span>
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold"
                style={{
                  color: asset.status === "CRITICAL" ? "#F05A5A" : asset.status === "WARNING" ? "#E8B84A" : "#42D392",
                  backgroundColor: asset.status === "CRITICAL" ? "rgba(240,90,90,0.15)" : asset.status === "WARNING" ? "rgba(232,184,74,0.15)" : "rgba(66,211,146,0.15)"
                }}
              >
                ● {asset.status}
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-[#F2F5F7]">{asset.name}</h2>
            <div className="mt-0.5 text-[10px] text-[#6E7883]">{asset.description}</div>
          </div>

          {/* TELEMETRY SPECS GRID */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
              <div className="flex items-center gap-1 text-[10px] text-[#6E7883]">
                <Activity size={12} className="text-[#42D392]" />
                HEALTH SCORE
              </div>
              <div className="mt-1 text-lg font-bold text-[#42D392]">{asset.health}%</div>
            </div>

            <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
              <div className="flex items-center gap-1 text-[10px] text-[#6E7883]">
                <Thermometer size={12} className="text-[#F05A5A]" />
                TEMPERATURE
              </div>
              <div className="mt-1 text-lg font-bold" style={{ color: asset.temp > 85 ? "#F05A5A" : "#F2F5F7" }}>
                {asset.temp}°C
              </div>
            </div>

            <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
              <div className="flex items-center gap-1 text-[10px] text-[#6E7883]">
                <Zap size={12} className="text-[#78B9E8]" />
                LOAD / OUTPUT
              </div>
              <div className="mt-1 text-lg font-bold text-[#78B9E8]">{asset.output || `${asset.load}%`}</div>
            </div>

            <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
              <div className="flex items-center gap-1 text-[10px] text-[#6E7883]">
                <ShieldAlert size={12} className="text-[#E8B84A]" />
                RUL ESTIMATE
              </div>
              <div className="mt-1 text-lg font-bold text-[#E8B84A]">{asset.rulDays} days</div>
            </div>
          </div>

          {/* MAINTENANCE & SENSOR LOG */}
          <div className="rounded border border-[#202A35] bg-[#0B1016] p-3 space-y-2 text-[11px]">
            <div className="text-[10px] font-bold text-[#6E7883]">MAINTENANCE & HISTORY</div>
            <div className="flex justify-between">
              <span className="text-[#6E7883]">LAST INSPECTED</span>
              <span className="text-[#A7B0BA]">14 AUG 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E7883]">SCHEDULED OVERHAUL</span>
              <span className="text-[#A7B0BA]">28 OCT 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E7883]">LOCATION NODE</span>
              <span className="text-[#F2F5F7]">SCHIRMACHER SECTOR 4</span>
            </div>
          </div>

        </div>

        {/* ACTIONS */}
        <div className="border-t border-[#202A35] pt-4 space-y-2 font-mono">
          <button
            onClick={() => {
              onRunSimulation(asset.id)
              onClose()
            }}
            className="flex w-full items-center justify-center gap-2 rounded border border-[#78B9E8]/40 bg-[#78B9E8]/10 py-2.5 text-xs font-semibold text-[#78B9E8] transition hover:bg-[#78B9E8]/20"
          >
            <Zap size={14} />
            RUN FAILURE SIMULATION
          </button>

          <button
            onClick={() => {
              onQueryAI(`Why is ${asset.name} (${asset.id}) showing status ${asset.status}?`)
              onClose()
            }}
            className="flex w-full items-center justify-center gap-2 rounded border border-[#202A35] bg-[#121922] py-2 text-xs font-semibold text-[#F2F5F7] transition hover:border-[#78B9E8] hover:text-[#78B9E8]"
          >
            <Bot size={14} />
            ASK POLAR AI ABOUT THIS ASSET
          </button>
        </div>

      </div>
    </div>
  )
}
