import { Boxes, AlertTriangle } from "lucide-react"

interface ResourceItem {
  id: string
  name: string
  category: string
  stockPercent: number
  daysRemaining: number
  status: "CRITICAL" | "WARNING" | "NORMAL"
}

const RESOURCES: ResourceItem[] = [
  { id: "RES-05", name: "Generator Spare Parts & Filters", category: "MAINTENANCE", stockPercent: 42, daysRemaining: 23, status: "WARNING" },
  { id: "RES-01", name: "Aviation Fuel & Diesel (Polar)", category: "ENERGY", stockPercent: 68, daysRemaining: 47, status: "NORMAL" },
  { id: "RES-03", name: "Glacier Water Reserves", category: "WATER", stockPercent: 73, daysRemaining: 54, status: "NORMAL" },
  { id: "RES-02", name: "Station Food Rations & Freeze-Dried", category: "PROVISIONS", stockPercent: 82, daysRemaining: 61, status: "NORMAL" },
  { id: "RES-04", name: "Polar Medical Supplies & Trauma", category: "MEDICAL", stockPercent: 91, daysRemaining: 89, status: "NORMAL" },
]

export default function LogisticsPanel() {
  // Sort critical / warning resources first
  const sortedResources = [...RESOURCES].sort((a, b) => a.daysRemaining - b.daysRemaining)

  return (
    <div className="rounded-lg border border-[#202A35] bg-[#0E141B] p-4 shadow-xl">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#202A35] pb-3">
        <div className="flex items-center gap-2">
          <Boxes size={16} className="text-[#78B9E8]" />
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#F2F5F7]">
              LOGISTICS & RESOURCE DEPLETION INVENTORY
            </h3>
            <p className="text-[10px] text-[#6E7883]">
              SURFACING DAYS REMAINING UNTIL NEXT SHIPMENT RESUPPLY
            </p>
          </div>
        </div>
        <span className="rounded border border-[#78B9E8]/30 bg-[#78B9E8]/10 px-2 py-0.5 text-[9px] font-mono font-bold text-[#78B9E8]">
          5 MONITORED STOCKS
        </span>
      </div>

      {/* TABLE */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-[#202A35] text-[10px] text-[#6E7883]">
              <th className="py-2 px-3 font-semibold">RESOURCE</th>
              <th className="py-2 px-3 font-semibold">CATEGORY</th>
              <th className="py-2 px-3 font-semibold">STOCK LEVEL</th>
              <th className="py-2 px-3 font-semibold">DAYS REMAINING</th>
              <th className="py-2 px-3 font-semibold text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202A35]">
            {sortedResources.map((res) => (
              <tr key={res.id} className="transition hover:bg-[#121922]">
                <td className="py-2.5 px-3 font-bold text-[#F2F5F7]">
                  {res.name}
                </td>
                <td className="py-2.5 px-3 text-[#6E7883] text-[10px]">
                  {res.category}
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F2F5F7]">{res.stockPercent}%</span>
                    <div className="h-1.5 w-16 overflow-hidden rounded bg-[#161F29]">
                      <div
                        className="h-full"
                        style={{
                          width: `${res.stockPercent}%`,
                          backgroundColor: res.daysRemaining < 30 ? "#E8B84A" : "#42D392"
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3 font-bold text-[#78B9E8]">
                  {res.daysRemaining} days
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span
                    className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      color: res.status === "WARNING" ? "#E8B84A" : "#42D392",
                      backgroundColor: res.status === "WARNING" ? "rgba(232,184,74,0.15)" : "rgba(66,211,146,0.15)"
                    }}
                  >
                    {res.status === "WARNING" && <AlertTriangle size={10} />}
                    {res.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
