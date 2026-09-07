import { X, AlertOctagon, Zap, CheckCircle2 } from "lucide-react"

export interface DetailedAlert {
  id: string
  title: string
  assetId: string
  severity: "CRITICAL" | "WARNING" | "INFO"
  detectedTime: string
  currentValue: string
  normalRange: string
  failureProb: number
  failureWindow: string
  rootCause: string
  impact: string
  recommendedAction: string
}

export const SAMPLE_DETAILED_ALERTS: Record<string, DetailedAlert> = {
  "AI-GEN-001": {
    id: "AI-GEN-001",
    title: "Generator 02 Overheating & Vibration Anomaly",
    assetId: "MAI-GEN-02",
    severity: "CRITICAL",
    detectedTime: "08:42 UTC",
    currentValue: "96.2°C | 0.85 mm/s",
    normalRange: "65.0–85.0°C | 0.25–0.45 mm/s",
    failureProb: 78,
    failureWindow: "2–5 hours",
    rootCause: "Cooling system thermal exchanger degradation",
    impact: "Potential 180 kW station power generation loss",
    recommendedAction: "Inspect cooling loop lines immediately and reduce generator load by 15%."
  },
  "AI-HVAC-002": {
    id: "AI-HVAC-002",
    title: "HVAC Heat Exchanger Efficiency Declining",
    assetId: "MAI-HVAC-01",
    severity: "WARNING",
    detectedTime: "07:31 UTC",
    currentValue: "48.0°C | 81% Load",
    normalRange: "30.0–42.0°C",
    failureProb: 42,
    failureWindow: "18–24 hours",
    rootCause: "Sub-zero ice buildup on external thermal intake vents",
    impact: "Station interior temperature dropping by 0.5°C/hr",
    recommendedAction: "Trigger automated thermal defroster or manually clear intake vent clearance."
  },
  "AI-MET-003": {
    id: "AI-MET-003",
    title: "Extreme Blizzard Weather Warning Model Update",
    assetId: "MAI-MET-01",
    severity: "INFO",
    detectedTime: "06:12 UTC",
    currentValue: "28 km/h NW Wind | Barometer 987 hPa",
    normalRange: "< 35 km/h",
    failureProb: 15,
    failureWindow: "6.5 hours",
    rootCause: "Polar low pressure trough moving south from Weddell Sea",
    impact: "Reduced visibility (< 1.8 km) and potential external travel restrictions",
    recommendedAction: "Secure loose station equipment and initiate storm shelter protocol."
  }
}

interface AlertDrawerProps {
  alertId: string | null
  onClose: () => void
  onViewAsset: (assetId: string) => void
  onRunSimulation: () => void
}

export default function AlertDrawer({
  alertId,
  onClose,
  onViewAsset,
  onRunSimulation
}: AlertDrawerProps) {
  if (!alertId) return null

  const alert = SAMPLE_DETAILED_ALERTS[alertId] || SAMPLE_DETAILED_ALERTS["AI-GEN-001"]

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-md flex-col border-l border-[#202A35] bg-[#0E141B] p-5 shadow-2xl animate-in slide-in-from-right">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#202A35] pb-4">
          <div className="flex items-center gap-2">
            <AlertOctagon
              size={18}
              className={alert.severity === "CRITICAL" ? "text-[#F05A5A]" : "text-[#E8B84A]"}
            />
            <span className="font-mono text-xs font-bold text-[#F2F5F7]">ALERT DETAILS & DIAGNOSTICS</span>
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
          
          {/* TITLE & SEVERITY BADGE */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold"
                style={{
                  color: alert.severity === "CRITICAL" ? "#F05A5A" : "#E8B84A",
                  backgroundColor: alert.severity === "CRITICAL" ? "rgba(240,90,90,0.15)" : "rgba(232,184,74,0.15)"
                }}
              >
                ● {alert.severity}
              </span>
              <span className="text-[10px] text-[#6E7883]">DETECTED: {alert.detectedTime}</span>
            </div>
            <h2 className="mt-2 text-base font-bold text-[#F2F5F7]">
              {alert.title}
            </h2>
            <div className="mt-1 text-[11px] text-[#78B9E8]">ASSET: {alert.assetId}</div>
          </div>

          {/* TELEMETRY BREAKDOWN */}
          <div className="rounded border border-[#202A35] bg-[#0B1016] p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-[#6E7883]">CURRENT VALUE</span>
              <span className="font-bold text-[#F05A5A]">{alert.currentValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E7883]">NORMAL RANGE</span>
              <span className="text-[#A7B0BA]">{alert.normalRange}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E7883]">FAILURE PROBABILITY</span>
              <span className="font-bold text-[#F05A5A]">{alert.failureProb}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E7883]">EST. FAILURE WINDOW</span>
              <span className="text-[#E8B84A]">{alert.failureWindow}</span>
            </div>
          </div>

          {/* ROOT CAUSE & IMPACT */}
          <div className="space-y-2">
            <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
              <div className="text-[10px] font-bold text-[#6E7883]">ROOT CAUSE DIAGNOSTIC</div>
              <div className="mt-1 text-[#F2F5F7]">{alert.rootCause}</div>
            </div>

            <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
              <div className="text-[10px] font-bold text-[#6E7883]">OPERATIONAL IMPACT</div>
              <div className="mt-1 text-[#F05A5A]">{alert.impact}</div>
            </div>
          </div>

          {/* RECOMMENDED ACTION */}
          <div className="rounded border border-[#78B9E8]/40 bg-[#78B9E8]/10 p-3">
            <div className="text-[10px] font-bold text-[#78B9E8]">RECOMMENDED OPERATOR ACTION</div>
            <div className="mt-1 text-[#F2F5F7]">{alert.recommendedAction}</div>
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="border-t border-[#202A35] pt-4 space-y-2 font-mono">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onViewAsset(alert.assetId)
                onClose()
              }}
              className="rounded border border-[#202A35] bg-[#121922] py-2 text-xs text-[#F2F5F7] transition hover:border-[#78B9E8] hover:text-[#78B9E8]"
            >
              VIEW ASSET
            </button>
            
            <button
              onClick={() => {
                onRunSimulation()
                onClose()
              }}
              className="flex items-center justify-center gap-1.5 rounded border border-[#78B9E8]/40 bg-[#78B9E8]/10 py-2 text-xs font-semibold text-[#78B9E8] transition hover:bg-[#78B9E8]/20"
            >
              <Zap size={13} />
              SIMULATE
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-1.5 rounded border border-[#42D392]/30 bg-[#42D392]/10 py-2 text-xs font-semibold text-[#42D392] transition hover:bg-[#42D392]/20"
          >
            <CheckCircle2 size={13} />
            ACKNOWLEDGE ALERT
          </button>
        </div>

      </div>
    </div>
  )
}
