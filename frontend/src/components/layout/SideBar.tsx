import {
  LayoutDashboard,
  Box,
  Zap,
  Fuel,
  Cpu,
  Boxes,
  CloudSnow,
  LineChart,
  ShieldAlert,
  PlaySquare,
  Radio,
  HardDrive,
  Bell,
  Bot
} from "lucide-react"

export type NavItemTab = 
  | "Overview"
  | "Digital Twin"
  | "Energy"
  | "Fuel"
  | "Infrastructure"
  | "Logistics"
  | "Environment"
  | "Predictive Analytics"
  | "Risk"
  | "What-If Simulation"
  | "Communications"
  | "Edge / Offline"
  | "Alerts"
  | "AI Assistant"

interface SideBarProps {
  activeTab: NavItemTab
  onSelectTab: (tab: NavItemTab) => void
  alertCount: number
}

interface NavSection {
  title?: string
  items: { label: NavItemTab; icon: React.ReactNode; badge?: number | string }[]
}

export default function SideBar({ activeTab, onSelectTab, alertCount }: SideBarProps) {
  const sections: NavSection[] = [
    {
      items: [
        { label: "Overview", icon: <LayoutDashboard size={15} /> }
      ]
    },
    {
      title: "OPERATIONS",
      items: [
        { label: "Digital Twin", icon: <Box size={15} /> },
        { label: "Energy", icon: <Zap size={15} /> },
        { label: "Fuel", icon: <Fuel size={15} /> },
        { label: "Infrastructure", icon: <Cpu size={15} /> },
        { label: "Logistics", icon: <Boxes size={15} /> },
        { label: "Environment", icon: <CloudSnow size={15} /> }
      ]
    },
    {
      title: "INTELLIGENCE",
      items: [
        { label: "Predictive Analytics", icon: <LineChart size={15} /> },
        { label: "Risk", icon: <ShieldAlert size={15} /> },
        { label: "What-If Simulation", icon: <PlaySquare size={15} /> }
      ]
    },
    {
      title: "SYSTEM",
      items: [
        { label: "Communications", icon: <Radio size={15} /> },
        { label: "Edge / Offline", icon: <HardDrive size={15} /> },
        { label: "Alerts", icon: <Bell size={15} />, badge: alertCount > 0 ? alertCount : undefined }
      ]
    },
    {
      title: "AI ASSISTANT",
      items: [
        { label: "AI Assistant", icon: <Bot size={15} />, badge: "OLLAMA" }
      ]
    }
  ]

  return (
    <aside className="fixed left-0 top-14 bottom-0 z-20 flex w-56 flex-col border-r border-[#202A35] bg-[#070A0E] text-[#A7B0BA]">
      
      {/* NAVIGATION SECTIONS */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-4">
            {section.title && (
              <div className="mb-1 px-2 text-[10px] font-mono font-bold tracking-widest text-[#6E7883]">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = activeTab === item.label
                return (
                  <button
                    key={item.label}
                    onClick={() => onSelectTab(item.label)}
                    className={`group relative flex w-full items-center justify-between rounded px-2.5 py-2 text-xs transition ${
                      isActive
                        ? "bg-[#121922] font-medium text-[#F2F5F7] shadow-sm border border-[#202A35]"
                        : "hover:bg-[#0E141B] hover:text-[#F2F5F7]"
                    }`}
                  >
                    {/* ICE BLUE LEFT INDICATOR ON ACTIVE ITEM */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#78B9E8]" />
                    )}

                    <div className="flex items-center gap-2.5">
                      <span className={`transition ${isActive ? "text-[#78B9E8]" : "text-[#6E7883] group-hover:text-[#A7B0BA]"}`}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold ${
                          typeof item.badge === "number"
                            ? "bg-[#F05A5A]/20 text-[#F05A5A]"
                            : "bg-[#78B9E8]/10 text-[#78B9E8] border border-[#78B9E8]/30"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* FOOTER: SYSTEM INFRASTRUCTURE STATUS */}
      <div className="border-t border-[#202A35] p-3 text-[11px]">
        <div className="flex items-center justify-between rounded border border-[#202A35] bg-[#0E141B] p-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#42D392] animate-subtle-pulse" />
            <div>
              <div className="font-mono text-[10px] font-bold text-[#F2F5F7]">MAITRI STATION</div>
              <div className="text-[9px] text-[#6E7883]">LAT: -70.76° S | LON: 11.74° E</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}