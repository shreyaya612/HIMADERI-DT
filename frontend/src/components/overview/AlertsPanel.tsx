import type { Alert } from "../../services/api"

interface AlertsPanelProps {
  alerts: Alert[]
}

function AlertsPanel({ alerts }: AlertsPanelProps) {
  const activeCount = alerts.length

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0c1928]">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
          <div className="text-sm font-semibold text-white">
            Active Alerts
          </div>

          <div className="mt-1 text-xs text-slate-500">
            Station events requiring attention
          </div>
        </div>

        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400">
          {activeCount} Active
        </span>
      </div>

      <div className="divide-y divide-slate-800">
        {alerts.length === 0 ? (
          <div className="px-5 py-6 text-center text-xs text-emerald-400">
            ✓ No active alerts
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex gap-3 px-5 py-4"
            >
              <div
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  alert.severity === "CRITICAL"
                    ? "bg-red-400"
                    : "bg-amber-400"
                }`}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-200">
                    {alert.asset_id}
                  </span>

                  <span className="text-[10px] text-slate-600">
                    {new Date(alert.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  {alert.message}
                </div>

                <div
                  className={`mt-2 text-[10px] font-semibold ${
                    alert.severity === "CRITICAL"
                      ? "text-red-400"
                      : "text-amber-400"
                  }`}
                >
                  {alert.severity} · {alert.source}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="w-full border-t border-slate-800 px-5 py-3 text-xs text-cyan-400 hover:bg-slate-800/50">
        View all alerts →
      </button>
    </div>
  )
}

export default AlertsPanel