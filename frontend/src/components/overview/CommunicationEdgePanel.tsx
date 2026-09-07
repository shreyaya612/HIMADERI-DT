import { Radio, Wifi, Cpu, CheckCircle2 } from "lucide-react"

interface CommunicationEdgePanelProps {
  isEdgeMode: boolean
  onToggleMode: () => void
}

export default function CommunicationEdgePanel({
  isEdgeMode,
  onToggleMode
}: CommunicationEdgePanelProps) {
  return (
    <div className="rounded-lg border border-[#202A35] bg-[#0E141B] p-4 shadow-xl font-mono text-xs">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#202A35] pb-3">
        <div className="flex items-center gap-2">
          <Radio size={16} className="text-[#78B9E8]" />
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-[#F2F5F7]">
              COMMUNICATIONS & EDGE OFFLINE SYSTEM
            </h3>
            <p className="text-[10px] text-[#6E7883]">
              DEEP POLAR SATELLITE LINK & AUTONOMOUS EDGE COMPUTING NODE
            </p>
          </div>
        </div>

        <button
          onClick={onToggleMode}
          className={`rounded border px-2.5 py-1 text-[10px] font-bold transition ${
            isEdgeMode
              ? "border-[#E8B84A]/40 bg-[#E8B84A]/10 text-[#E8B84A]"
              : "border-[#42D392]/40 bg-[#42D392]/10 text-[#42D392]"
          }`}
        >
          {isEdgeMode ? "● OFFLINE / EDGE MODE ACTIVE" : "● SATELLITE LINK ONLINE"}
        </button>
      </div>

      {/* STATUS BREAKDOWN */}
      <div className="my-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        
        {/* SATELLITE LINK STATUS */}
        <div className="rounded border border-[#202A35] bg-[#0B1016] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi size={15} className={isEdgeMode ? "text-[#E8B84A]" : "text-[#42D392]"} />
              <span className="font-bold text-[#F2F5F7]">C-BAND POLAR SATELLITE LINK</span>
            </div>
            <span
              className="rounded px-2 py-0.5 text-[9px] font-bold"
              style={{
                color: isEdgeMode ? "#E8B84A" : "#42D392",
                backgroundColor: isEdgeMode ? "rgba(232,184,74,0.15)" : "rgba(66,211,146,0.15)"
              }}
            >
              {isEdgeMode ? "DEGRADED / OFFLINE" : "CONNECTED"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#6E7883]">SIGNAL STRENGTH:</span>
              <div className="font-bold text-[#F2F5F7]">{isEdgeMode ? "14%" : "87%"}</div>
            </div>
            <div>
              <span className="text-[#6E7883]">LATENCY:</span>
              <div className="font-bold text-[#78B9E8]">{isEdgeMode ? "1240 ms" : "412 ms"}</div>
            </div>
            <div>
              <span className="text-[#6E7883]">LAST SYNC:</span>
              <div className="text-[#A7B0BA]">{isEdgeMode ? "14:12:08 UTC" : "14:31:42 UTC"}</div>
            </div>
            <div>
              <span className="text-[#6E7883]">QUEUED TRANSMISSION:</span>
              <div className="text-[#E8B84A]">{isEdgeMode ? "18.4 MB (24 events)" : "2.4 MB"}</div>
            </div>
          </div>
        </div>

        {/* EDGE SYSTEM STATUS */}
        <div className="rounded border border-[#202A35] bg-[#0B1016] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={15} className="text-[#78B9E8]" />
              <span className="font-bold text-[#F2F5F7]">STATION EDGE COMPUTING NODE</span>
            </div>
            <span className="rounded bg-[#42D392]/10 px-2 py-0.5 text-[9px] font-bold text-[#42D392]">
              ● ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-[#A7B0BA]">
              <CheckCircle2 size={12} className="text-[#42D392]" />
              <span>Local Digital Twin</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#A7B0BA]">
              <CheckCircle2 size={12} className="text-[#42D392]" />
              <span>Local Ollama AI</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#A7B0BA]">
              <CheckCircle2 size={12} className="text-[#42D392]" />
              <span>Telemetry Cache</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#A7B0BA]">
              <CheckCircle2 size={12} className="text-[#42D392]" />
              <span>Autonomous Rules</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
