import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Zap } from "lucide-react"

const ENERGY_DATA = [
  { time: "08:00", observed: 402, predicted: 402, load: 70 },
  { time: "09:00", observed: 410, predicted: 408, load: 72 },
  { time: "10:00", observed: 415, predicted: 412, load: 73 },
  { time: "11:00", observed: 418, predicted: 418, load: 74 },
  { time: "12:00", observed: null, predicted: 422, load: 75 },
  { time: "13:00", observed: null, predicted: 425, load: 76 },
  { time: "14:00", observed: null, predicted: 419, load: 74 },
]

export default function EnergyPanel() {
  return (
    <div className="rounded-lg border border-[#202A35] bg-[#0E141B] p-4 shadow-xl">
      
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-3 border-b border-[#202A35] pb-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#78B9E8]" />
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#F2F5F7]">
              ENERGY GENERATION & LOAD MONITORING
            </h3>
          </div>
          <p className="text-[10px] text-[#6E7883]">
            PARALLEL DIESEL GENERATORS (MAI-GEN-01 & MAI-GEN-02)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-[#6E7883]">POWER QUALITY: </span>
            <span className="font-bold text-[#42D392]">98.7%</span>
          </div>
          <div>
            <span className="text-[#6E7883]">LOAD FACTOR: </span>
            <span className="font-bold text-[#78B9E8]">74%</span>
          </div>
        </div>
      </div>

      {/* STATS METRICS GRID */}
      <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
        <div className="rounded border border-[#202A35] bg-[#0B1016] p-2.5">
          <div className="text-[10px] text-[#6E7883]">CURRENT GENERATION</div>
          <div className="mt-1 text-lg font-bold text-[#78B9E8]">418 kW</div>
          <div className="text-[9px] text-[#42D392]">↑ 4.2% VS AVG</div>
        </div>

        <div className="rounded border border-[#202A35] bg-[#0B1016] p-2.5">
          <div className="text-[10px] text-[#6E7883]">STATION CONSUMPTION</div>
          <div className="mt-1 text-lg font-bold text-[#F2F5F7]">371 kW</div>
          <div className="text-[9px] text-[#6E7883]">RESERVE: 47 kW</div>
        </div>

        <div className="rounded border border-[#202A35] bg-[#0B1016] p-2.5">
          <div className="text-[10px] text-[#6E7883]">GEN-01 OUTPUT</div>
          <div className="mt-1 text-lg font-bold text-[#42D392]">210 kW</div>
          <div className="text-[9px] text-[#6E7883]">LOAD 68% | 72°C</div>
        </div>

        <div className="rounded border border-[#F05A5A]/30 bg-[#F05A5A]/5 p-2.5">
          <div className="text-[10px] text-[#F05A5A]">GEN-02 OUTPUT (ALERT)</div>
          <div className="mt-1 text-lg font-bold text-[#F05A5A]">208 kW</div>
          <div className="text-[9px] text-[#F05A5A]">LOAD 89% | 96°C ⚠</div>
        </div>
      </div>

      {/* POWER HISTORY CHART */}
      <div className="h-56 w-full pt-2">
        <div className="mb-2 flex items-center justify-between text-[10px] font-mono text-[#6E7883]">
          <span>POWER OUTPUT (kW) — OBSERVED VS PREDICTED</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#78B9E8]">
              <span className="h-0.5 w-3 bg-[#78B9E8]" /> OBSERVED
            </span>
            <span className="flex items-center gap-1 text-[#62B7FF]">
              <span className="h-0.5 w-3 border-b border-dashed border-[#62B7FF]" /> PREDICTED
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={ENERGY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#202A35" />
            <XAxis dataKey="time" stroke="#6E7883" fontSize={10} fontStyle="mono" />
            <YAxis stroke="#6E7883" fontSize={10} fontStyle="mono" domain={[350, 450]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0E141B",
                borderColor: "#2A3542",
                color: "#F2F5F7",
                fontSize: "11px",
                fontFamily: "IBM Plex Mono"
              }}
            />
            <Line
              type="monotone"
              dataKey="observed"
              stroke="#78B9E8"
              strokeWidth={2}
              dot={{ fill: "#78B9E8", r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#62B7FF"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
