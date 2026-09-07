import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const energyData = [
  { time: "14:00", value: 380 },
  { time: "16:00", value: 395 },
  { time: "18:00", value: 418 },
  { time: "20:00", value: 440 },
  { time: "22:00", value: 425 },
  { time: "00:00", value: 390 },
]

const fuelData = [
  { time: "Now", value: 68 },
  { time: "1d", value: 65 },
  { time: "2d", value: 62 },
  { time: "3d", value: 59 },
  { time: "4d", value: 55 },
  { time: "5d", value: 52 },
]

function ForecastPanel({
  title,
  subtitle,
  data,
  unit,
}: {
  title: string
  subtitle: string
  data: { time: string; value: number }[]
  unit: string
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0c1928] p-5">

      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-white">
            {title}
          </div>

          <div className="mt-1 text-xs text-slate-500">
            {subtitle}
          </div>
        </div>

        <span className="text-[9px] uppercase tracking-wider text-slate-600">
          AI FORECAST
        </span>
      </div>

      <div className="mt-4 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={35}
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="value"
              strokeWidth={2}
              fillOpacity={0.08}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-xs text-slate-500">
        Unit: {unit}
      </div>
    </div>
  )
}

function ForecastPanels() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ForecastPanel
        title="Energy Forecast"
        subtitle="Predicted station demand"
        data={energyData}
        unit="kW"
      />

      <ForecastPanel
        title="Fuel Forecast"
        subtitle="Projected reserve level"
        data={fuelData}
        unit="%"
      />
    </div>
  )
}

export default ForecastPanels