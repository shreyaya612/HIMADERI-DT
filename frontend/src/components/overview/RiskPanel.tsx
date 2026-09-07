import { ShieldAlert } from "lucide-react"

interface RiskItem {
  id: string
  title: string
  probability: string
  impact: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  timeHorizon: string
  rootCause: string
  recommendedAction: string
}

const RISKS: RiskItem[] = [
  {
    id: "RSK-01",
    title: "Generator 02 Thermal Degradation",
    probability: "78%",
    impact: "HIGH",
    timeHorizon: "2–5 hours",
    rootCause: "Cooling loop thermal exchanger inefficiency",
    recommendedAction: "Inspect cooling loop lines and reduce generator load by 15%."
  },
  {
    id: "RSK-02",
    title: "Extreme Blizzard Weather Impact",
    probability: "87%",
    impact: "HIGH",
    timeHorizon: "6h 24m",
    rootCause: "Weddell Sea polar atmospheric low pressure system",
    recommendedAction: "Secure station exterior, switch to storm shelter heating loop."
  },
  {
    id: "RSK-03",
    title: "Polar Fuel Reserve Depletion",
    probability: "12%",
    impact: "CRITICAL",
    timeHorizon: "47 days",
    rootCause: "Winter resupply ship window closed until Antarctic spring",
    recommendedAction: "Maintain daily fuel rationing protocol at 1,240 L/day."
  }
]

export default function RiskPanel() {
  return (
    <div className="rounded-lg border border-[#202A35] bg-[#0E141B] p-4 shadow-xl">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#202A35] pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-[#E8B84A]" />
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#F2F5F7]">
              OPERATIONAL RISK ASSESSMENT & MATRIX
            </h3>
            <p className="text-[10px] text-[#6E7883]">
              QUANTIFIED MULTI-FACTOR ANTARCTIC RISK EVALUATION
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-[#6E7883]">GLOBAL RISK SCORE:</span>
          <span className="rounded border border-[#42D392]/30 bg-[#42D392]/10 px-2.5 py-1 font-bold text-[#42D392]">
            18 / 100 (LOW RISK)
          </span>
        </div>
      </div>

      {/* RISKS TABLE */}
      <div className="mt-3 overflow-x-auto font-mono text-xs">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#202A35] text-[10px] text-[#6E7883]">
              <th className="py-2 px-3 font-semibold">RISK ID</th>
              <th className="py-2 px-3 font-semibold">THREAT TITLE</th>
              <th className="py-2 px-3 font-semibold">PROBABILITY</th>
              <th className="py-2 px-3 font-semibold">IMPACT</th>
              <th className="py-2 px-3 font-semibold">HORIZON</th>
              <th className="py-2 px-3 font-semibold">ROOT CAUSE</th>
              <th className="py-2 px-3 font-semibold text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202A35]">
            {RISKS.map((rsk) => (
              <tr key={rsk.id} className="transition hover:bg-[#121922]">
                <td className="py-2.5 px-3 font-bold text-[#78B9E8]">{rsk.id}</td>
                <td className="py-2.5 px-3 font-medium text-[#F2F5F7]">{rsk.title}</td>
                <td className="py-2.5 px-3 font-bold text-[#F05A5A]">{rsk.probability}</td>
                <td className="py-2.5 px-3">
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      color: rsk.impact === "CRITICAL" ? "#F05A5A" : rsk.impact === "HIGH" ? "#E8B84A" : "#42D392",
                      backgroundColor: rsk.impact === "CRITICAL" ? "rgba(240,90,90,0.15)" : "rgba(232,184,74,0.15)"
                    }}
                  >
                    {rsk.impact}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[#A7B0BA]">{rsk.timeHorizon}</td>
                <td className="py-2.5 px-3 text-[11px] text-[#6E7883]">{rsk.rootCause}</td>
                <td className="py-2.5 px-3 text-right text-[11px] text-[#78B9E8]">{rsk.recommendedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
