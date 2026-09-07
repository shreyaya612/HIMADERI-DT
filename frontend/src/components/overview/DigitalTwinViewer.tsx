import { useState } from "react"
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Activity,
  Layers,
  Compass
} from "lucide-react"

export interface StationAsset {
  id: string
  name: string
  type: "BUILDING" | "EQUIPMENT" | "SENSOR" | "COMM"
  status: "NORMAL" | "WARNING" | "CRITICAL"
  health: number
  load: number
  temp: number
  rulDays: number
  coordinates: { x: number; y: number; z: number }
  description: string
  output?: string
}

export const SAMPLE_STATION_ASSETS: StationAsset[] = [
  {
    id: "MAI-HAB-01",
    name: "Main Research Habitat",
    type: "BUILDING",
    status: "NORMAL",
    health: 98,
    load: 62,
    temp: 21.5,
    rulDays: 1450,
    coordinates: { x: 48, y: 45, z: 10 },
    description: "Primary residential block and scientific laboratories.",
    output: "42 Occupants"
  },
  {
    id: "MAI-GEN-01",
    name: "Primary Generator 01",
    type: "EQUIPMENT",
    status: "NORMAL",
    health: 96,
    load: 68,
    temp: 72.4,
    rulDays: 310,
    coordinates: { x: 32, y: 35, z: 8 },
    description: "Heavy-duty diesel power generation unit 1.",
    output: "210 kW"
  },
  {
    id: "MAI-GEN-02",
    name: "Secondary Generator 02",
    type: "EQUIPMENT",
    status: "CRITICAL",
    health: 74,
    load: 89,
    temp: 96.2,
    rulDays: 14,
    coordinates: { x: 38, y: 32, z: 8 },
    description: "Secondary power unit exhibiting thermal overload & abnormal vibration.",
    output: "208 kW (Overloaded)"
  },
  {
    id: "MAI-FUEL-01",
    name: "Polar Fuel Storage Farm",
    type: "EQUIPMENT",
    status: "NORMAL",
    health: 94,
    load: 68,
    temp: -12.0,
    rulDays: 420,
    coordinates: { x: 22, y: 60, z: 6 },
    description: "Insulated double-walled aviation & diesel fuel tanks.",
    output: "142,000 L"
  },
  {
    id: "MAI-HVAC-01",
    name: "Station Thermal HVAC",
    type: "EQUIPMENT",
    status: "WARNING",
    health: 84,
    load: 81,
    temp: 48.0,
    rulDays: 85,
    coordinates: { x: 55, y: 55, z: 7 },
    description: "Centralized station heating & ventilation heat exchanger.",
    output: "94% Efficiency"
  },
  {
    id: "MAI-WTR-01",
    name: "Glacier Water Plant",
    type: "EQUIPMENT",
    status: "NORMAL",
    health: 97,
    load: 54,
    temp: 4.2,
    rulDays: 520,
    coordinates: { x: 65, y: 40, z: 7 },
    description: "Glacier melt water filtration & purification loop.",
    output: "4,200 L/day"
  },
  {
    id: "MAI-SAT-01",
    name: "SatComm Parabolic Array",
    type: "COMM",
    status: "NORMAL",
    health: 99,
    load: 42,
    temp: -28.0,
    rulDays: 890,
    coordinates: { x: 72, y: 25, z: 14 },
    description: "Deep polar C-band satellite tracking transceiver.",
    output: "87% Signal (412ms)"
  },
  {
    id: "MAI-MET-01",
    name: "AWS Weather Mast",
    type: "SENSOR",
    status: "NORMAL",
    health: 95,
    load: 15,
    temp: -31.4,
    rulDays: 600,
    coordinates: { x: 18, y: 25, z: 12 },
    description: "Automatic Weather Station sensor suite.",
    output: "28 km/h NW"
  }
]

interface DigitalTwinViewerProps {
  onSelectAsset: (asset: StationAsset) => void
  selectedAssetId?: string
}

export default function DigitalTwinViewer({
  onSelectAsset,
  selectedAssetId
}: DigitalTwinViewerProps) {
  const [hoveredAsset, setHoveredAsset] = useState<StationAsset | null>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [viewAngle, setViewAngle] = useState<"ISOMETRIC" | "TOP">("ISOMETRIC")
  const [rotation, setRotation] = useState<number>(0)

  // Visibility filters
  const [layers, setLayers] = useState({
    BUILDINGS: true,
    EQUIPMENT: true,
    SENSORS: true,
    ALERTS: true
  })

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }

  const handleReset = () => {
    setZoomLevel(1)
    setViewAngle("ISOMETRIC")
    setRotation(0)
  }

  const filteredAssets = SAMPLE_STATION_ASSETS.filter((ast) => {
    if (ast.type === "BUILDING" && !layers.BUILDINGS) return false
    if (ast.type === "EQUIPMENT" && !layers.EQUIPMENT) return false
    if ((ast.type === "SENSOR" || ast.type === "COMM") && !layers.SENSORS) return false
    return true
  })

  return (
    <div className="relative flex h-[480px] w-full flex-col overflow-hidden rounded-lg border border-[#202A35] bg-[#070A0E] shadow-xl">
      
      {/* HEADER CONTROLS */}
      <div className="z-10 flex items-center justify-between border-b border-[#202A35] bg-[#0E141B]/90 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#78B9E8]/10 text-[#78B9E8]">
            <Activity size={13} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#F2F5F7]">MAITRI 3D DIGITAL TWIN</span>
              <span className="rounded bg-[#42D392]/10 px-1.5 py-0.5 text-[9px] font-mono font-medium text-[#42D392] border border-[#42D392]/30">
                LIVE STATE
              </span>
            </div>
            <div className="text-[10px] font-mono text-[#6E7883]">
              ANTARCTIC SCHIRMACHER OASIS · 70°45′57″S 11°44′09″E
            </div>
          </div>
        </div>

        {/* CAMERA CONTROLS */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded border border-[#202A35] bg-[#0B1016] px-2 py-1 text-[10px] font-mono text-[#A7B0BA] hover:border-[#2A3542] hover:text-[#F2F5F7]"
            title="Reset View"
          >
            <RotateCcw size={11} />
            <span>RESET</span>
          </button>
          
          <button
            onClick={() => setViewAngle((prev) => (prev === "ISOMETRIC" ? "TOP" : "ISOMETRIC"))}
            className={`flex items-center gap-1 rounded border px-2 py-1 text-[10px] font-mono transition ${
              viewAngle === "TOP"
                ? "border-[#78B9E8]/50 bg-[#78B9E8]/10 text-[#78B9E8]"
                : "border-[#202A35] bg-[#0B1016] text-[#A7B0BA] hover:border-[#2A3542] hover:text-[#F2F5F7]"
            }`}
          >
            <Compass size={11} />
            <span>{viewAngle}</span>
          </button>

          <button
            onClick={() => setRotation((prev) => (prev + 45) % 360)}
            className="flex items-center gap-1 rounded border border-[#202A35] bg-[#0B1016] px-2 py-1 text-[10px] font-mono text-[#A7B0BA] hover:border-[#2A3542] hover:text-[#F2F5F7]"
            title="Rotate View"
          >
            <span>ROTATE</span>
          </button>

          <div className="flex items-center rounded border border-[#202A35] bg-[#0B1016] p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              className="p-1 text-[#A7B0BA] hover:text-[#F2F5F7]"
              title="Zoom Out"
            >
              <ZoomOut size={12} />
            </button>
            <span className="px-1.5 text-[10px] font-mono text-[#6E7883]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.15))}
              className="p-1 text-[#A7B0BA] hover:text-[#F2F5F7]"
              title="Zoom In"
            >
              <ZoomIn size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 3D CANVAS & TERRAIN VIEWPORT */}
      <div className="relative flex-1 cursor-grab overflow-hidden bg-[#070A0E] active:cursor-grabbing">
        
        {/* POLAR GRID & TERRAIN MAP BACKGROUND */}
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(120, 185, 232, 0.05) 0%, transparent 70%),
              linear-gradient(rgba(32, 42, 53, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(32, 42, 53, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 36px 36px, 36px 36px"
          }}
        >
          {/* TERRAIN ELEVATION CONTOURS */}
          <svg className="absolute inset-0 h-full w-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50%" cy="50%" rx="42%" ry="38%" fill="none" stroke="#78B9E8" strokeWidth="1" strokeDasharray="4 6" />
            <ellipse cx="50%" cy="50%" rx="30%" ry="26%" fill="none" stroke="#2A3542" strokeWidth="1" />
            <ellipse cx="50%" cy="50%" rx="18%" ry="14%" fill="none" stroke="#2A3542" strokeWidth="1" />
            <path d="M 100,200 Q 300,100 600,250 T 900,150" fill="none" stroke="#78B9E8" strokeWidth="0.75" opacity="0.4" />
          </svg>

          {/* ISOMETRIC STATION BUILDINGS & STRUCTURES LAYOUT */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <div className="relative h-[360px] w-[600px]">
              
              {/* STATION CENTRAL HABITAT BASELINE */}
              <div 
                className="absolute rounded-lg border border-[#78B9E8]/30 bg-[#0E141B]/80 shadow-2xl backdrop-blur-sm transition-all"
                style={{
                  left: "35%",
                  top: "35%",
                  width: "30%",
                  height: "30%",
                  transform: viewAngle === "ISOMETRIC" ? "rotateX(50deg) rotateZ(-30deg)" : "none"
                }}
              >
                <div className="p-2 text-[9px] font-mono font-bold tracking-wider text-[#78B9E8]/70">
                  MAITRI MAIN COMPLEX
                </div>
              </div>

              {/* ASSET NODES & HIGHLIGHTS */}
              {filteredAssets.map((asset) => {
                const isSelected = selectedAssetId === asset.id

                let statusColor = "#42D392" // Healthy Green
                let statusBg = "rgba(66, 211, 146, 0.15)"
                let statusBorder = "rgba(66, 211, 146, 0.4)"

                if (asset.status === "WARNING") {
                  statusColor = "#E8B84A" // Warning Amber
                  statusBg = "rgba(232, 184, 74, 0.15)"
                  statusBorder = "rgba(232, 184, 74, 0.4)"
                } else if (asset.status === "CRITICAL") {
                  statusColor = "#F05A5A" // Critical Red
                  statusBg = "rgba(240, 90, 90, 0.25)"
                  statusBorder = "rgba(240, 90, 90, 0.7)"
                }

                if (isSelected) {
                  statusColor = "#78B9E8" // Ice Blue
                  statusBorder = "#78B9E8"
                }

                return (
                  <div
                    key={asset.id}
                    onClick={() => onSelectAsset(asset)}
                    onMouseEnter={() => setHoveredAsset(asset)}
                    onMouseLeave={() => setHoveredAsset(null)}
                    className="absolute cursor-pointer transition-all duration-200 group"
                    style={{
                      left: `${asset.coordinates.x}%`,
                      top: `${asset.coordinates.y}%`,
                      transform: "translate(-50%, -50%)"
                    }}
                  >
                    {/* NODE MARKER */}
                    <div className="relative flex items-center justify-center">
                      
                      {/* PULSING CRITICAL RING */}
                      {asset.status === "CRITICAL" && (
                        <span 
                          className="absolute -inset-2 rounded-full animate-ping opacity-60"
                          style={{ backgroundColor: statusColor }}
                        />
                      )}

                      <div
                        className={`flex items-center gap-1.5 rounded border px-2 py-1 shadow-lg transition ${
                          isSelected ? "ring-2 ring-[#78B9E8]" : "hover:scale-105"
                        }`}
                        style={{
                          backgroundColor: statusBg,
                          borderColor: statusBorder
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: statusColor }}
                        />
                        <span className="text-[10px] font-mono font-semibold text-[#F2F5F7]">
                          {asset.name}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}

            </div>
          </div>
        </div>

        {/* HOVER TELEMETRY TOOLTIP */}
        {hoveredAsset && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-20 w-64 rounded border border-[#2A3542] bg-[#0E141B]/95 p-3 text-xs shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-[#202A35] pb-2">
              <span className="font-mono font-bold text-[#F2F5F7]">{hoveredAsset.id}</span>
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-mono font-bold"
                style={{
                  color: hoveredAsset.status === "CRITICAL" ? "#F05A5A" : hoveredAsset.status === "WARNING" ? "#E8B84A" : "#42D392",
                  backgroundColor: hoveredAsset.status === "CRITICAL" ? "rgba(240,90,90,0.15)" : "rgba(66,211,146,0.15)"
                }}
              >
                ● {hoveredAsset.status}
              </span>
            </div>
            
            <div className="mt-2 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#6E7883]">NAME</span>
                <span className="text-[#A7B0BA]">{hoveredAsset.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7883]">OUTPUT/LOAD</span>
                <span className="text-[#78B9E8]">{hoveredAsset.output || `${hoveredAsset.load}%`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7883]">TEMP</span>
                <span className={hoveredAsset.temp > 85 ? "text-[#F05A5A] font-bold" : "text-[#F2F5F7]"}>
                  {hoveredAsset.temp}°C
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7883]">HEALTH</span>
                <span className="text-[#42D392]">{hoveredAsset.health}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7883]">RUL EST.</span>
                <span className="text-[#E8B84A]">{hoveredAsset.rulDays} days</span>
              </div>
            </div>
            
            <div className="mt-2 border-t border-[#202A35] pt-1 text-[9px] text-[#6E7883]">
              Click to open detailed telemetry drawer →
            </div>
          </div>
        )}

        {/* BOTTOM LAYER TOGGLES & LEGEND */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-3 rounded border border-[#202A35] bg-[#0E141B]/90 px-3 py-1.5 backdrop-blur-md">
          <div className="flex items-center gap-1 text-[10px] font-mono text-[#6E7883]">
            <Layers size={12} />
            <span>LAYERS:</span>
          </div>

          {(["BUILDINGS", "EQUIPMENT", "SENSORS"] as const).map((layerKey) => (
            <button
              key={layerKey}
              onClick={() => toggleLayer(layerKey)}
              className={`text-[10px] font-mono transition ${
                layers[layerKey] ? "text-[#78B9E8] underline" : "text-[#6E7883] line-through"
              }`}
            >
              {layerKey}
            </button>
          ))}
        </div>

      </div>

      {/* FOOTER BAR WITH QUICK ASSET STATUS OVERVIEW */}
      <div className="flex items-center justify-between border-t border-[#202A35] bg-[#0B1016] px-4 py-2 text-[11px] font-mono">
        <div className="flex items-center gap-4">
          <span className="text-[#42D392]">● 6 HEALTHY</span>
          <span className="text-[#E8B84A]">● 1 WARNING</span>
          <span className="text-[#F05A5A] font-bold">● 1 CRITICAL</span>
        </div>

        <div className="text-[10px] text-[#6E7883]">
          SELECT ASSET TO INSPECT TELEMETRY & RUN SIMULATION
        </div>
      </div>

    </div>
  )
}
