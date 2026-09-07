import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { LineChart as ChartIcon, CheckCircle2 } from "lucide-react"

const PREDICTIVE_DATA = [
  { day: "01 SEP", observed: 82, predicted: 82 },
  { day: "02 SEP", observed: 84, predicted: 83 },
  { day: "03 SEP", observed: 85, predicted: 85 },
  { day: "04 SEP", observed: 83, predicted: 84 },
  { day: "05 SEP", observed: 88, predicted: 87 },
  { day: "06 SEP (NOW)", observed: 96, predicted: 94 },
  { day: "07 SEP", observed: null, predicted: 98 },
  { day: "08 SEP", observed: null, predicted: 102 },
  { day: "09 SEP", observed: null, predicted: 106 },
]

export default function PredictivePanel() {
  return (
    <div className="rounded-lg border border-[#202A35] bg-[#0E141B] p-4 shadow-xl">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#202A35] pb-3">
        <div className="flex items-center gap-2">
          <ChartIcon size={16} className="text-[#78B9E8]" />
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#F2F5F7]">
              PREDICTIVE THERMAL & LOAD DEGRADATION ANALYTICS
            </h3>
            <p className="text-[10px] text-[#6E7883]">
              PROPRIETARY MACHINE LEARNING MODEL · DEEP POLAR TELEMETRY
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded border border-[#78B9E8]/30 bg-[#78B9E8]/10 px-2.5 py-1 font-mono text-[10px] font-bold text-[#78B9E8]">
          <CheckCircle2 size={12} />
          PREDICTION CONFIDENCE: 92%
        </div>
      </div>

      {/* CHART & METRICS */}
      <div className="my-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        
        {/* METRICS SIDE SUMMARY */}
        <div className="space-y-3 font-mono text-xs">
          <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
            <div className="text-[10px] text-[#6E7883]">TARGET ASSET</div>
            <div className="mt-1 text-sm font-bold text-[#F2F5F7]">MAI-GEN-02 (GENERATOR 2)</div>
          </div>

          <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
            <div className="text-[10px] text-[#6E7883]">PREDICTED TEMP PEAK</div>
            <div className="mt-1 text-lg font-bold text-[#F05A5A]">106°C IN 72h</div>
            <div className="text-[9px] text-[#F05A5A]">EXCEEDS CRITICAL THRESHOLD (95°C)</div>
          </div>

          <div className="rounded border border-[#202A35] bg-[#0B1016] p-3">
            <div className="text-[10px] text-[#6E7883]">PRIMARY DRIVER</div>
            <div className="mt-1 text-[#A7B0BA]">Thermal loop heat exchanger efficiency decay</div>
          </div>
        </div>

        {/* CHART */}
        <div className="lg:col-span-2 h-56 w-full font-mono text-xs">
          <div className="mb-2 flex items-center justify-between text-[10px] text-[#6E7883]">
            <span>TEMPERATURE TREND (°C)</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[#78B9E8]">
                <span className="h-0.5 w-3 bg-[#78B9E8]" /> OBSERVED
              </span>
              <span className="flex items-center gap-1 text-[#F05A5A]">
                <span className="h-0.5 w-3 border-b border-dashed border-[#F05A5A]" /> PREDICTED MODEL
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PREDICTIVE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#202A35" />
              <XAxis dataKey="day" stroke="#6E7883" fontSize={10} fontStyle="mono" />
              <YAxis stroke="#6E7883" fontSize={10} fontStyle="mono" domain={[75, 115]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0E141B",
                  borderColor: "#2A3542",
                  color: "#F2F5F7",
                  fontSize: "11px",
                  fontFamily: "IBM Plex Mono"
                }}
              />
              <Line type="monotone" dataKey="observed" stroke="#78B9E8" strokeWidth={2} dot={{ fill: "#78B9E8", r: 3 }} />
              <Line type="monotone" dataKey="predicted" stroke="#F05A5A" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  )
}
