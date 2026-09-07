import { ShieldCheck, Zap, Fuel, Thermometer, CheckCircle2, AlertTriangle } from "lucide-react"

interface KPIRowProps {
  healthScore?: number
  powerKw?: number
  fuelPercent?: number
  temperature?: number
  healthyAssetsCount?: number
  totalAssetsCount?: number
  alertCount?: number
  criticalAlertCount?: number
}

export default function KPIRow({
  healthScore = 92,
  powerKw = 418,
  fuelPercent = 68,
  temperature = -31.4,
  healthyAssetsCount = 47,
  totalAssetsCount = 49,
  alertCount = 3,
  criticalAlertCount = 1
}: KPIRowProps) {
  const kpis = [
    {
      title: "STATION HEALTH",
      value: `${healthScore}%`,
      subText: "● HEALTHY",
      subColor: "text-[#42D392]",
      icon: <ShieldCheck size={16} className="text-[#42D392]" />,
      border: "border-[#202A35]"
    },
    {
      title: "POWER GENERATION",
      value: `${powerKw} kW`,
      subText: "↑ 4.2% VS NOMINAL",
      subColor: "text-[#78B9E8]",
      icon: <Zap size={16} className="text-[#78B9E8]" />,
      border: "border-[#202A35]"
    },
    {
      title: "FUEL RESERVE",
      value: `${fuelPercent}%`,
      subText: "47 DAYS REMAINING",
      subColor: "text-[#A7B0BA]",
      icon: <Fuel size={16} className="text-[#E8B84A]" />,
      border: "border-[#202A35]"
    },
    {
      title: "TEMPERATURE",
      value: `${temperature.toFixed(1)}°C`,
      subText: "● NORMAL RANGE",
      subColor: "text-[#62B7FF]",
      icon: <Thermometer size={16} className="text-[#62B7FF]" />,
      border: "border-[#202A35]"
    },
    {
      title: "ASSETS HEALTHY",
      value: `${Math.round((healthyAssetsCount / totalAssetsCount) * 100)}%`,
      subText: `${healthyAssetsCount} / ${totalAssetsCount} ASSETS`,
      subColor: "text-[#A7B0BA]",
      icon: <CheckCircle2 size={16} className="text-[#42D392]" />,
      border: "border-[#202A35]"
    },
    {
      title: "ALERTS",
      value: `0${alertCount}`,
      subText: `${criticalAlertCount} CRITICAL`,
      subColor: "text-[#F05A5A]",
      icon: <AlertTriangle size={16} className="text-[#F05A5A]" />,
      border: criticalAlertCount > 0 ? "border-[#F05A5A]/50 bg-[#F05A5A]/5" : "border-[#202A35]"
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className={`flex flex-col justify-between rounded-lg border bg-[#0E141B] p-3 shadow-sm transition hover:border-[#2A3542] ${kpi.border}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-[#6E7883]">
              {kpi.title}
            </span>
            {kpi.icon}
          </div>

          <div className="my-2">
            <div className="font-mono text-2xl font-bold tracking-tight text-[#F2F5F7]">
              {kpi.value}
            </div>
          </div>

          <div className={`font-mono text-[10px] font-medium tracking-wide ${kpi.subColor}`}>
            {kpi.subText}
          </div>
        </div>
      ))}
    </div>
  )
}
