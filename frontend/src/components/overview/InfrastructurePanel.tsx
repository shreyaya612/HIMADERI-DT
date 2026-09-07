import { useState } from "react"
import { Cpu, Search, ChevronRight } from "lucide-react"
import { SAMPLE_STATION_ASSETS, type StationAsset } from "./DigitalTwinViewer"

interface InfrastructurePanelProps {
  onSelectAsset: (asset: StationAsset) => void
}

export default function InfrastructurePanel({ onSelectAsset }: InfrastructurePanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const categories = ["ALL", "BUILDING", "EQUIPMENT", "COMM", "SENSOR"]

  const filteredAssets = SAMPLE_STATION_ASSETS.filter((ast) => {
    if (selectedCategory !== "ALL" && ast.type !== selectedCategory) return false
    if (searchQuery.trim() && !ast.name.toLowerCase().includes(searchQuery.toLowerCase()) && !ast.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="rounded-lg border border-[#202A35] bg-[#0E141B] p-4 shadow-xl">
      
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-3 border-b border-[#202A35] pb-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-[#78B9E8]" />
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#F2F5F7]">
              STATION INFRASTRUCTURE & CRITICAL EQUIPMENT
            </h3>
            <p className="text-[10px] text-[#6E7883]">
              49 MONITORED TELEMETRY NODES · SCHIRMACHER OASIS
            </p>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-2.5 text-[#6E7883]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="rounded border border-[#202A35] bg-[#0B1016] pl-8 pr-3 py-1 text-[11px] text-[#F2F5F7] placeholder-[#6E7883] focus:border-[#78B9E8] focus:outline-none"
            />
          </div>

          <div className="flex rounded border border-[#202A35] bg-[#0B1016] p-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 text-[10px] transition ${
                  selectedCategory === cat ? "rounded bg-[#161F29] text-[#78B9E8] font-bold" : "text-[#A7B0BA] hover:text-[#F2F5F7]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ASSET TABLE */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-[#202A35] text-[10px] text-[#6E7883]">
              <th className="py-2 px-3 font-semibold">ASSET ID</th>
              <th className="py-2 px-3 font-semibold">NAME & TYPE</th>
              <th className="py-2 px-3 font-semibold">STATUS</th>
              <th className="py-2 px-3 font-semibold">HEALTH</th>
              <th className="py-2 px-3 font-semibold">TEMP</th>
              <th className="py-2 px-3 font-semibold">LOAD / OUTPUT</th>
              <th className="py-2 px-3 font-semibold">RUL EST.</th>
              <th className="py-2 px-3 font-semibold text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202A35]">
            {filteredAssets.map((asset) => (
              <tr
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className="group cursor-pointer transition hover:bg-[#121922]"
              >
                <td className="py-2.5 px-3 font-bold text-[#F2F5F7] group-hover:text-[#78B9E8]">
                  {asset.id}
                </td>
                <td className="py-2.5 px-3">
                  <div className="text-[#F2F5F7]">{asset.name}</div>
                  <div className="text-[10px] text-[#6E7883]">{asset.type}</div>
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      color: asset.status === "CRITICAL" ? "#F05A5A" : asset.status === "WARNING" ? "#E8B84A" : "#42D392",
                      backgroundColor: asset.status === "CRITICAL" ? "rgba(240,90,90,0.15)" : asset.status === "WARNING" ? "rgba(232,184,74,0.15)" : "rgba(66,211,146,0.15)"
                    }}
                  >
                    ● {asset.status}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#42D392]">{asset.health}%</span>
                    <div className="h-1.5 w-12 overflow-hidden rounded bg-[#161F29]">
                      <div className="h-full bg-[#42D392]" style={{ width: `${asset.health}%` }} />
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3 font-bold" style={{ color: asset.temp > 85 ? "#F05A5A" : "#F2F5F7" }}>
                  {asset.temp}°C
                </td>
                <td className="py-2.5 px-3 text-[#78B9E8]">
                  {asset.output || `${asset.load}%`}
                </td>
                <td className="py-2.5 px-3 text-[#E8B84A]">
                  {asset.rulDays} days
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#6E7883] group-hover:text-[#78B9E8]">
                    INSPECT <ChevronRight size={12} />
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
