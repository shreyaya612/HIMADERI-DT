interface MetricCardProps {
  title: string
  value: string
  unit?: string
  status: "normal" | "warning" | "critical"
  icon: string
}

const statusStyles = {
  normal: "text-emerald-400",
  warning: "text-amber-400",
  critical: "text-red-400",
}

function MetricCard({
  title,
  value,
  unit,
  status,
  icon,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0c1928] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold">
          {value}
        </span>

        {unit && (
          <span className="text-sm text-slate-500">
            {unit}
          </span>
        )}
      </div>

      <div
        className={`mt-3 text-xs font-medium uppercase tracking-wider ${statusStyles[status]}`}
      >
        ● {status}
      </div>
    </div>
  )
}

export default MetricCard