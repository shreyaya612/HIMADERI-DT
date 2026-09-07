function DigitalTwinPreview() {
  return (
    <div className="relative min-h-[340px] overflow-hidden rounded-xl border border-slate-800 bg-[#091722]">

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative flex h-full min-h-[340px] flex-col">

        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-white">
              Digital Twin
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Maitri Station · Live system state
            </div>
          </div>

          <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-400">
            15 ASSETS
          </span>
        </div>

        {/* Placeholder */}
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">

            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/5 text-4xl">
              ◇
            </div>

            <div className="text-sm font-medium text-slate-300">
              3D Digital Twin
            </div>

            <div className="mt-1 text-xs text-slate-600">
              Unity visualization
            </div>

            <button className="mt-5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-400 hover:bg-cyan-500/20">
              Open Digital Twin →
            </button>

          </div>
        </div>

        {/* Asset status */}
        <div className="flex gap-5 border-t border-slate-800/80 px-5 py-3 text-[10px]">
          <span className="text-emerald-400">● 12 Normal</span>
          <span className="text-amber-400">● 2 Warning</span>
          <span className="text-red-400">● 1 Critical</span>
        </div>

      </div>
    </div>
  )
}

export default DigitalTwinPreview