interface DataSourceBadgeProps {
  source: "SIMULATION" | "ERA5" | "STATION INPUT"
}

function DataSourceBadge({ source }: DataSourceBadgeProps) {
  return (
    <span className="rounded-md border border-slate-700 bg-slate-900/50 px-2 py-1 text-[9px] font-medium tracking-wider text-slate-500">
      {source}
    </span>
  )
}

export default DataSourceBadge