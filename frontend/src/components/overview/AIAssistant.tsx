import { useState } from "react"
import { Bot, Send, Sparkles, FileText, Zap, Box, CheckCircle2 } from "lucide-react"

interface AssistantResponse {
  question: string
  answer: string
  problem: string
  telemetry: Record<string, number>
  risk: string | null
  health: number | null
  likely_causes: string[]
  why_it_matters: string
  possible_consequences: string[]
  recommended_actions: string[]
  source: string | null
  confidence: string
  sources: {
    score: number
    text: string
  }[]
}

interface AIAssistantProps {
  onViewAsset?: (assetId: string) => void
  onRunSimulation?: () => void
  initialQuery?: string
}

export default function AIAssistant({
  onViewAsset,
  onRunSimulation,
  initialQuery = ""
}: AIAssistantProps) {
  const [question, setQuestion] = useState(initialQuery || "")
  const [response, setResponse] = useState<AssistantResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const sampleQueries = [
    "Why is Generator 02 showing elevated temperature?",
    "Generator 2 has abnormal vibration. What should I check?",
    "What is the blizzard safety protocol for Maitri?"
  ]

  const askAssistant = async (queryToAsk?: string) => {
    const q = queryToAsk || question
    if (!q.trim()) return

    setLoading(true)
    setError("")

    try {
      const res = await fetch("http://127.0.0.1:8000/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: q.trim()
        })
      })

      if (!res.ok) {
        throw new Error("Assistant request failed")
      }

      const data = await res.json()
      setResponse(data)
    } catch (err) {
      console.error(err)
      setError("Unable to reach the offline POLAR AI assistant. Check the backend connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-[#202A35] bg-[#0E141B] p-5 shadow-xl font-mono text-xs">
      
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between border-b border-[#202A35] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#78B9E8]/10 text-[#78B9E8]">
            <Bot size={15} />
          </div>
          <div>
            <h2 className="text-sm font-mono font-bold tracking-wider text-[#F2F5F7]">
              POLAR AI OPERATIONAL ASSISTANT
            </h2>
            <p className="text-[10px] text-[#6E7883]">
              GROUNDED IN NCPOR LOCAL STATION STANDARD OPERATING PROCEDURES (SOP)
            </p>
          </div>
        </div>

        <span className="rounded border border-[#42D392]/30 bg-[#42D392]/10 px-2.5 py-1 text-[10px] font-bold text-[#42D392]">
          ● OFFLINE AI (OLLAMA LLOCAL)
        </span>
      </div>

      {/* SAMPLE QUICK PROMPTS */}
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="text-[10px] text-[#6E7883] py-1">SUGGESTED:</span>
        {sampleQueries.map((sq, i) => (
          <button
            key={i}
            onClick={() => {
              setQuestion(sq)
              askAssistant(sq)
            }}
            className="rounded border border-[#202A35] bg-[#0B1016] px-2.5 py-1 text-[10px] text-[#A7B0BA] transition hover:border-[#78B9E8] hover:text-[#78B9E8]"
          >
            "{sq}"
          </button>
        ))}
      </div>

      {/* INPUT FORM */}
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              askAssistant()
            }
          }}
          placeholder="Ask about a station issue or SOP procedure..."
          className="flex-1 rounded border border-[#202A35] bg-[#0B1016] px-4 py-2.5 text-xs text-[#F2F5F7] placeholder-[#6E7883] outline-none focus:border-[#78B9E8]"
        />

        <button
          onClick={() => askAssistant()}
          disabled={loading || !question.trim()}
          className="flex items-center gap-1.5 rounded border border-[#78B9E8]/40 bg-[#78B9E8] px-5 py-2.5 font-bold text-[#070A0E] transition hover:bg-[#62B7FF] disabled:opacity-50"
        >
          {loading ? (
            <Sparkles size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
          <span>{loading ? "PROCESSING..." : "ASK POLAR AI"}</span>
        </button>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="mt-4 rounded border border-[#F05A5A]/30 bg-[#F05A5A]/10 p-3 text-xs text-[#F05A5A]">
          {error}
        </div>
      )}

      {/* AI RESPONSE PANEL */}
      {response && (
        <div className="mt-5 space-y-4 border-t border-[#202A35] pt-4 animate-in fade-in">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#78B9E8]" />
              <span className="text-xs font-bold text-[#78B9E8]">POLAR AI ASSESSMENT</span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#6E7883]">
              <CheckCircle2 size={12} className="text-[#42D392]" />
              <span>CONFIDENCE: {response.confidence}</span>
            </div>
          </div>

          <div className="grid gap-3 rounded border border-[#202A35] bg-[#0B1016] p-4 text-xs leading-relaxed text-[#F2F5F7]">
            <AssessmentSection title="CURRENT PROBLEM" items={[response.problem]} />
            {(response.risk || response.health !== null) && (
              <div className="text-[10px] text-[#A7B0BA]">
                PREDICTIVE AI: {response.risk ?? "UNKNOWN"} RISK{response.health !== null ? ` · HEALTH ${response.health}` : ""}
              </div>
            )}
            <AssessmentSection title="LIKELY CAUSES" items={response.likely_causes} />
            <AssessmentSection title="WHY IT MATTERS" items={[response.why_it_matters]} />
            <AssessmentSection title="POSSIBLE NEXT CONSEQUENCES" items={response.possible_consequences} />
            <AssessmentSection title="RECOMMENDED ACTION" items={response.recommended_actions} />
            <AssessmentSection title="SOURCE" items={[response.source ?? "No SOP source available."]} />
          </div>

          {/* CITATIONS / SOP SOURCES */}
          {response.sources && response.sources.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-[#6E7883]">RETRIEVED SOP CONTEXT & CITATIONS</div>
              
              <div className="rounded border border-[#202A35] bg-[#0B1016] p-3 text-[11px] text-[#A7B0BA]">
                <div className="flex items-center justify-between border-b border-[#202A35] pb-1.5 mb-1.5">
                  <span className="flex items-center gap-1.5 font-bold text-[#78B9E8]">
                    <FileText size={13} />
                    GENERATOR OPERATING PROCEDURE (SOP-MAI-GEN-02)
                  </span>
                  <span className="text-[#42D392] font-bold">
                    {(response.sources[0].score * 100).toFixed(1)}% RELEVANCE
                  </span>
                </div>
                <div className="line-clamp-3 text-[10px] text-[#6E7883]">
                  {response.sources[0].text}
                </div>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#202A35]">
            <button
              onClick={() => onViewAsset && onViewAsset("MAI-GEN-02")}
              className="flex items-center gap-1.5 rounded border border-[#202A35] bg-[#121922] px-3 py-1.5 text-xs text-[#F2F5F7] hover:border-[#78B9E8] hover:text-[#78B9E8]"
            >
              <Box size={13} />
              VIEW ASSET (MAI-GEN-02)
            </button>

            <button
              onClick={() => onRunSimulation && onRunSimulation()}
              className="flex items-center gap-1.5 rounded border border-[#78B9E8]/40 bg-[#78B9E8]/10 px-3 py-1.5 text-xs font-semibold text-[#78B9E8] hover:bg-[#78B9E8]/20"
            >
              <Zap size={13} />
              RUN WHAT-IF SIMULATION
            </button>
          </div>

        </div>
      )}

    </div>
  )
}

function AssessmentSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-bold text-[#78B9E8]">{title}</div>
      <ul className="space-y-1 text-[#A7B0BA]">
        {items.map((item, index) => <li key={index}>• {item}</li>)}
      </ul>
    </div>
  )
}
