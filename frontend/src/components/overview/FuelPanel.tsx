import { Fuel, AlertTriangle, Calendar, Droplets } from "lucide-react"

interface FuelPanelProps {
  reservePercent?: number
  daysRemaining?: number
  dailyConsumptionLiters?: number
  predictedDepletionDate?: string
  safetyReserveDays?: number
}

export default function FuelPanel({
  reservePercent = 68,
  daysRemaining = 47,
  dailyConsumptionLiters = 1240,
  predictedDepletionDate = "23 APR 2027",
  safetyReserveDays = 21
}: FuelPanelProps) {
  const isBelowSafetyReserve = daysRemaining < safetyReserveDays

  return (
    <div className="flex flex-col justify-between rounded-lg border border-[#202A35] bg-[#0E141B] p-4 shadow-xl">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#202A35] pb-3">
        <div className="flex items-center gap-2">
          <Fuel size={16} className="text-[#E8B84A]" />
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#F2F5F7]">
              FUEL RESERVE & DEPLETION PROJECTION
            </h3>
            <p className="text-[10px] text-[#6E7883]">
              MAITRI POLAR TANK FARM (MAI-FUEL-01)
            </p>
          </div>
        </div>
        <span className="rounded border border-[#E8B84A]/30 bg-[#E8B84A]/10 px-2 py-0.5 text-[9px] font-mono font-bold text-[#E8B84A]">
          47 DAYS OPERATIONAL
        </span>
      </div>

      {/* SAFETY WARNING IF BELOW THRESHOLD */}
      {isBelowSafetyReserve && (
        <div className="mt-3 flex items-center gap-2 rounded border border-[#F05A5A]/40 bg-[#F05A5A]/10 p-2.5 text-xs font-mono text-[#F05A5A]">
          <AlertTriangle size={15} />
          <span>⚠ BELOW SAFETY RESERVE (THRESHOLD: {safetyReserveDays} DAYS)</span>
        </div>
      )}

      {/* BODY CONTENT: VERTICAL TANK GAUGE + METRICS */}
      <div className="my-4 flex items-center gap-6">
        
        {/* VERTICAL TANK LEVEL VISUALIZATION */}
        <div className="relative flex h-40 w-16 flex-col justify-end rounded border border-[#2A3542] bg-[#0B1016] p-1 shadow-inner">
          
          {/* TANK LEVEL FILL */}
          <div
            className="w-full rounded-sm bg-gradient-to-t from-[#E8B84A]/60 to-[#E8B84A] transition-all duration-700"
            style={{ height: `${reservePercent}%` }}
          />

          {/* SAFETY THRESHOLD LINE (21 DAYS = ~30%) */}
          <div 
            className="absolute left-0 right-0 border-b border-dashed border-[#F05A5A]"
            style={{ bottom: `${(safetyReserveDays / 70) * 100}%` }}
            title={`Safety Reserve Threshold (${safetyReserveDays}d)`}
          />

          {/* TANK OVERLAY METRICS */}
          <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-xs font-bold text-white shadow-sm">
            <span className="drop-shadow-md">{reservePercent}%</span>
          </div>
        </div>

        {/* METRICS DETAILS */}
        <div className="flex-1 space-y-3 font-mono text-xs">
          
          <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
            <div className="text-[10px] text-[#6E7883]">TOTAL REMAINING CAPACITY</div>
            <div className="mt-0.5 text-xl font-bold text-[#F2F5F7]">
              {daysRemaining} DAYS <span className="text-xs text-[#A7B0BA]">({reservePercent}%)</span>
            </div>
            <div className="mt-1 text-[10px] text-[#62B7FF]">
              142,000 L / 210,000 L CAPACITY
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded border border-[#202A35] bg-[#0B1016] p-2">
              <div className="flex items-center gap-1 text-[9px] text-[#6E7883]">
                <Droplets size={11} className="text-[#62B7FF]" />
                CONSUMPTION
              </div>
              <div className="mt-1 font-bold text-[#F2F5F7]">{dailyConsumptionLiters} L/day</div>
            </div>

            <div className="rounded border border-[#202A35] bg-[#0B1016] p-2">
              <div className="flex items-center gap-1 text-[9px] text-[#6E7883]">
                <Calendar size={11} className="text-[#E8B84A]" />
                PREDICTED DEPLETION
              </div>
              <div className="mt-1 font-bold text-[#E8B84A]">{predictedDepletionDate}</div>
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER INFO */}
      <div className="border-t border-[#202A35] pt-2 font-mono text-[10px] text-[#6E7883]">
        SAFETY RESERVE THRESHOLD: {safetyReserveDays} DAYS (MINIMUM RE-SUPPLY BUFFER)
      </div>

    </div>
  )
}
