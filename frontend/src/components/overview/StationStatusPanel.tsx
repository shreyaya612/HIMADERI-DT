import { Activity, Zap, Fuel, AlertOctagon, ChevronRight } from "lucide-react"

interface AlertItem {
  id: string
  severity: "CRITICAL" | "WARNING" | "INFO"
  title: string
  timestamp: string
}

interface StationStatusPanelProps {
  health: number
  power: number
  fuel: number
  alerts: AlertItem[]
  onSelectAlert: (alertId: string) => void
  onRunSimulation: () => void
}

export default function StationStatusPanel({
  health = 92,
  power = 418,
  fuel = 68,
  alerts = [],
  onSelectAlert,
  onRunSimulation
}: StationStatusPanelProps) {
  return (
    <div className="flex h-[480px] w-full flex-col justify-between rounded-lg border border-[#202A35] bg-[#0E141B] p-4 shadow-xl">
      
      {/* HEADER */}
      <div>
        <div className="flex items-center justify-between border-b border-[#202A35] pb-3">
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#F2F5F7]">
              STATION STATUS SUMMARY
            </h3>
            <p className="text-[10px] text-[#6E7883]">
              MAITRI STATION · TELEMETRY REAL-TIME AGGREGATION
            </p>
          </div>
          <span className="rounded border border-[#42D392]/30 bg-[#42D392]/10 px-2 py-0.5 text-[9px] font-mono font-bold text-[#42D392]">
            ● OPERATIONAL
          </span>
        </div>

        {/* METRIC BARS */}
        <div className="mt-4 space-y-3 font-mono text-xs">
          
          {/* HEALTH */}
          <div>
            <div className="flex justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-[#A7B0BA]">
                <Activity size={13} className="text-[#42D392]" />
                Station Health
              </span>
              <span className="font-bold text-[#42D392]">{health}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded bg-[#161F29]">
              <div className="h-full bg-[#42D392] transition-all duration-500" style={{ width: `${health}%` }} />
            </div>
          </div>

          {/* ENERGY */}
          <div>
            <div className="flex justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-[#A7B0BA]">
                <Zap size={13} className="text-[#78B9E8]" />
                Energy Generation
              </span>
              <span className="font-bold text-[#78B9E8]">{power} kW</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded bg-[#161F29]">
              <div className="h-full bg-[#78B9E8] transition-all duration-500" style={{ width: `${(power / 500) * 100}%` }} />
            </div>
          </div>

          {/* FUEL */}
          <div>
            <div className="flex justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-[#A7B0BA]">
                <Fuel size={13} className="text-[#E8B84A]" />
                Fuel Reserve
              </span>
              <span className="font-bold text-[#E8B84A]">{fuel}% (47d)</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded bg-[#161F29]">
              <div className="h-full bg-[#E8B84A] transition-all duration-500" style={{ width: `${fuel}%` }} />
            </div>
          </div>

        </div>
      </div>

      {/* ACTIVE ALERTS SECTION */}
      <div className="my-3 flex-1 overflow-hidden border-t border-[#202A35] pt-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#6E7883]">
            ACTIVE ALERTS ({alerts.length})
          </span>
          <span className="text-[9px] font-mono text-[#F05A5A]">1 CRITICAL</span>
        </div>

        <div className="mt-2.5 space-y-2 overflow-y-auto max-h-[160px] pr-1">
          {alerts.length === 0 ? (
            <div className="p-3 text-center text-xs text-[#6E7883]">No active alerts</div>
          ) : (
            alerts.map((alt) => (
              <div
                key={alt.id}
                onClick={() => onSelectAlert(alt.id)}
                className="group flex cursor-pointer items-center justify-between rounded border border-[#202A35] bg-[#0B1016] p-2.5 transition hover:border-[#2A3542] hover:bg-[#121922]"
              >
                <div className="flex items-center gap-2">
                  <AlertOctagon
                    size={14}
                    className={alt.severity === "CRITICAL" ? "text-[#F05A5A]" : "text-[#E8B84A]"}
                  />
                  <div>
                    <div className="text-[11px] font-medium text-[#F2F5F7] group-hover:text-[#78B9E8]">
                      {alt.title}
                    </div>
                    <div className="text-[9px] font-mono text-[#6E7883]">{alt.timestamp}</div>
                  </div>
                </div>
                <ChevronRight size={13} className="text-[#6E7883] group-hover:text-[#F2F5F7]" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="border-t border-[#202A35] pt-3">
        <button
          onClick={onRunSimulation}
          className="flex w-full items-center justify-center gap-2 rounded border border-[#78B9E8]/40 bg-[#78B9E8]/10 py-2.5 text-xs font-mono font-semibold text-[#78B9E8] transition hover:bg-[#78B9E8]/20"
        >
          <Zap size={14} />
          RUN FAILURE SIMULATION →
        </button>
      </div>

    </div>
  )
}
