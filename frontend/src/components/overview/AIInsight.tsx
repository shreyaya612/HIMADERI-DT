function AIInsight() {
  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04]">

      <div className="flex items-center justify-between border-b border-cyan-500/10 px-5 py-4">

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10">
            🤖
          </div>

          <div>
            <div className="text-sm font-semibold text-white">
              Predictive AI Insight
            </div>

            <div className="text-[10px] uppercase tracking-wider text-cyan-400">
              Automated equipment analysis
            </div>
          </div>
        </div>

        <span className="rounded-md bg-red-500/10 px-2 py-1 text-[10px] text-red-400">
          HIGH RISK
        </span>

      </div>

      <div className="grid gap-6 p-5 md:grid-cols-[1fr_auto]">

        <div>
          <div className="text-base font-medium text-slate-200">
            Generator 02
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Abnormal vibration pattern detected. Current telemetry
            indicates increasing equipment risk.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-400">
              Vibration&nbsp; 0.72
            </span>

            <span className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-400">
              Temperature&nbsp; 87°C
            </span>

            <span className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-400">
              Load&nbsp; 91%
            </span>
          </div>

          <div className="mt-5 flex gap-3">
            <button className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400">
              View in Digital Twin
            </button>

            <button className="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800">
              Ask Station AI
            </button>
          </div>
        </div>

        <div className="flex min-w-[110px] flex-col justify-center rounded-lg border border-slate-800 bg-[#091522] p-4 text-center">
          <div className="text-xs text-slate-500">
            HEALTH
          </div>

          <div className="mt-1 text-3xl font-semibold text-amber-400">
            71%
          </div>

          <div className="mt-1 text-[10px] text-slate-600">
            AI ESTIMATE
          </div>
        </div>

      </div>
    </div>
  )
}

export default AIInsight