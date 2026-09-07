import { useState, useEffect } from "react"
import { Shield, Bell, Wifi, Cpu, User, AlertTriangle } from "lucide-react"
import type { Incident } from "../../services/api"

interface TopBarProps {
  station: string
  onStationChange: (station: string) => void
  alertCount: number
  isEdgeMode: boolean
  onToggleEdgeMode: () => void
  onOpenAI: () => void
  activeIncident?: Incident
}

export default function TopBar({
  station,
  onStationChange,
  alertCount,
  isEdgeMode,
  onToggleEdgeMode,
  onOpenAI,
  activeIncident
}: TopBarProps) {
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toISOString().substring(11, 19) + " UTC")
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#202A35] bg-[#070A0E]/95 px-5 backdrop-blur-md">
      
      {/* LEFT: BRANDING & TITLE */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-[#78B9E8]/30 bg-[#78B9E8]/10 text-[#78B9E8]">
            <Shield size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-[#78B9E8]">NCPOR</span>
              <span className="text-xs text-[#2A3542]">|</span>
              <span className="text-xs font-bold tracking-wider text-[#F2F5F7]">POLAR DIGITAL TWIN</span>
            </div>
            <div className="text-[10px] font-mono tracking-widest text-[#6E7883]">
              ANTARCTIC OPERATIONS CONTROL CENTRE
            </div>
          </div>
        </div>

        {/* STATION SELECTOR */}
        <div className="ml-4 flex items-center rounded border border-[#202A35] bg-[#0B1016] p-0.5">
          {["MAITRI", "BHARATI", "BOTH"].map((st) => (
            <button
              key={st}
              onClick={() => onStationChange(st)}
              className={`px-2.5 py-1 text-[11px] font-mono font-medium transition ${
                station === st
                  ? "rounded bg-[#161F29] text-[#78B9E8] shadow-sm border border-[#2A3542]"
                  : "text-[#A7B0BA] hover:text-[#F2F5F7]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: SYSTEM STATUS & METADATA */}
      <div className="flex items-center gap-3">
        {activeIncident && (
          <div className="hidden items-center gap-1.5 rounded border border-[#F05A5A]/50 bg-[#F05A5A]/10 px-2 py-1 font-mono text-[10px] text-[#F05A5A] lg:flex">
            <AlertTriangle size={13} />
            <span className="font-bold">ACTIVE INCIDENT</span>
            <span>{activeIncident.incident_type.replaceAll("_", " ")} · {activeIncident.station} · {activeIncident.severity}</span>
          </div>
        )}
        
        {/* GLOBAL SYSTEM STATE */}
        <div className="hidden items-center gap-2 rounded border border-[#202A35] bg-[#0E141B] px-2.5 py-1 sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#42D392] animate-subtle-pulse" />
          <span className="text-[11px] font-mono tracking-wide text-[#42D392]">
            NOMINAL STATE
          </span>
        </div>

        {/* EDGE / SATELLITE MODE TOGGLE */}
        <button
          onClick={onToggleEdgeMode}
          title="Toggle Edge / Satellite Sync Mode"
          className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-mono transition ${
            isEdgeMode
              ? "border-[#E8B84A]/40 bg-[#E8B84A]/10 text-[#E8B84A]"
              : "border-[#202A35] bg-[#0E141B] text-[#62B7FF] hover:border-[#2A3542]"
          }`}
        >
          <Cpu size={12} />
          <span>{isEdgeMode ? "EDGE / OFFLINE" : "SAT LINK LIVE"}</span>
        </button>

        {/* LIVE SYNC & TIMESTAMP */}
        <div className="hidden items-center gap-2 border-l border-[#202A35] pl-3 md:flex">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#A7B0BA]">
            <Wifi size={13} className="text-[#42D392]" />
            <span className="text-[#6E7883]">SYNC</span>
            <span className="text-[#F2F5F7]">{time || "14:50:27 UTC"}</span>
          </div>
        </div>

        {/* ALERT BADGE */}
        <button 
          onClick={onOpenAI}
          className="relative flex items-center justify-center rounded border border-[#202A35] bg-[#0E141B] p-1.5 text-[#A7B0BA] transition hover:border-[#2A3542] hover:text-[#F2F5F7]"
          title="Active Alerts"
        >
          <Bell size={15} />
          {alertCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#F05A5A] px-1 text-[9px] font-mono font-bold text-white">
              {alertCount}
            </span>
          )}
        </button>

        {/* OPERATOR MENU */}
        <div className="flex items-center gap-2 rounded border border-[#202A35] bg-[#0B1016] px-2.5 py-1 text-xs">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#161F29] text-[#78B9E8]">
            <User size={11} />
          </div>
          <span className="font-mono text-[11px] text-[#F2F5F7]">OP-402</span>
        </div>

      </div>
    </header>
  )
}
