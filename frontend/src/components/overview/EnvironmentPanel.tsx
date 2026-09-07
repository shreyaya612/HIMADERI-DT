import { CloudSnow, Wind, Gauge, Eye, Thermometer, AlertTriangle } from "lucide-react"

interface EnvironmentPanelProps {
  temperature?: number
  windSpeedKmH?: number
  windDirection?: string
  humidityPercent?: number
  pressureHpa?: number
  visibilityKm?: number
  snowCm24h?: number
  hasBlizzardWarning?: boolean
}

export default function EnvironmentPanel({
  temperature = -31.4,
  windSpeedKmH = 28,
  windDirection = "NW",
  humidityPercent = 72,
  pressureHpa = 987,
  visibilityKm = 1.8,
  snowCm24h = 14,
  hasBlizzardWarning = true
}: EnvironmentPanelProps) {
  return (
    <div className="rounded-lg border border-[#202A35] bg-[#0E141B] p-4 shadow-xl">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#202A35] pb-3">
        <div className="flex items-center gap-2">
          <CloudSnow size={16} className="text-[#62B7FF]" />
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#F2F5F7]">
              ANTARCTIC ENVIRONMENT & METEOROLOGY
            </h3>
            <p className="text-[10px] text-[#6E7883]">
              MAITRI AWS MET MAST (MAI-MET-01)
            </p>
          </div>
        </div>
        <span className="rounded border border-[#62B7FF]/30 bg-[#62B7FF]/10 px-2 py-0.5 text-[9px] font-mono font-bold text-[#62B7FF]">
          AWS ONLINE
        </span>
      </div>

      {/* PROMINENT EXTREME WEATHER WARNING BANNER */}
      {hasBlizzardWarning && (
        <div className="mt-3 flex items-center justify-between rounded border border-[#E8B84A]/40 bg-[#E8B84A]/10 p-3 text-xs font-mono text-[#E8B84A]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="animate-subtle-pulse" />
            <div>
              <span className="font-bold">⚠ EXTREME WEATHER WARNING: </span>
              Blizzard conditions expected in 06h 24m
            </div>
          </div>
          <span className="rounded bg-[#E8B84A]/20 px-2 py-0.5 text-[10px] font-bold">
            CONFIDENCE: 87%
          </span>
        </div>
      )}

      {/* METEOROLOGICAL TELEMETRY GRID */}
      <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 font-mono text-xs">
        
        {/* TEMPERATURE */}
        <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-[#6E7883]">
            <Thermometer size={13} className="text-[#62B7FF]" />
            TEMPERATURE
          </div>
          <div className="mt-1 text-xl font-bold text-[#62B7FF]">{temperature.toFixed(1)}°C</div>
          <div className="text-[9px] text-[#6E7883]">WINDCHILL: -44°C</div>
        </div>

        {/* WIND */}
        <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-[#6E7883]">
            <Wind size={13} className="text-[#A7B0BA]" />
            WIND SPEED
          </div>
          <div className="mt-1 text-xl font-bold text-[#F2F5F7]">{windSpeedKmH} km/h</div>
          <div className="text-[9px] text-[#6E7883]">DIRECTION: {windDirection}</div>
        </div>

        {/* HUMIDITY */}
        <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-[#6E7883]">
            <CloudSnow size={13} className="text-[#A7B0BA]" />
            HUMIDITY
          </div>
          <div className="mt-1 text-xl font-bold text-[#F2F5F7]">{humidityPercent}%</div>
          <div className="text-[9px] text-[#6E7883]">RELATIVE RH</div>
        </div>

        {/* PRESSURE */}
        <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-[#6E7883]">
            <Gauge size={13} className="text-[#A7B0BA]" />
            PRESSURE
          </div>
          <div className="mt-1 text-xl font-bold text-[#F2F5F7]">{pressureHpa} hPa</div>
          <div className="text-[9px] text-[#E8B84A]">FALLING (-4 hPa)</div>
        </div>

        {/* VISIBILITY */}
        <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-[#6E7883]">
            <Eye size={13} className="text-[#A7B0BA]" />
            VISIBILITY
          </div>
          <div className="mt-1 text-xl font-bold text-[#F2F5F7]">{visibilityKm} km</div>
          <div className="text-[9px] text-[#E8B84A]">REDUCED</div>
        </div>

        {/* SNOW ACCUMULATION */}
        <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-[#6E7883]">
            <CloudSnow size={13} className="text-[#78B9E8]" />
            SNOW ACCUM.
          </div>
          <div className="mt-1 text-xl font-bold text-[#78B9E8]">{snowCm24h} cm</div>
          <div className="text-[9px] text-[#6E7883]">LAST 24 HOURS</div>
        </div>

      </div>

    </div>
  )
}
