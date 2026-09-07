"""Evidence-grounded POLAR AI assessment around the existing local RAG stack."""
import re
from typing import Any

try:
    from .assistant import ask_local_llm
except ImportError:
    from assistant import ask_local_llm

# Loading the sentence-transformer remains the retriever's responsibility and is
# deferred until an assessment is requested. This keeps backend startup offline-safe.
retrieve = None


TELEMETRY_FIELDS = ("temperature", "vibration", "load", "rpm", "fuel_rate")


def _available_telemetry(telemetry: dict[str, Any] | None) -> dict[str, Any]:
    return {key: telemetry[key] for key in TELEMETRY_FIELDS if telemetry and telemetry.get(key) is not None}


def _retrieve_safely(query: str) -> tuple[list[dict[str, Any]], str | None]:
    try:
        global retrieve
        if retrieve is None:
            try:
                from .retriever import retrieve as local_retrieve
            except ImportError:
                from retriever import retrieve as local_retrieve
            retrieve = local_retrieve
        return retrieve(query, top_k=2), None
    except Exception as exc:
        return [], f"SOP retrieval unavailable: {exc}"


def _source_label(results: list[dict[str, Any]]) -> str | None:
    if not results:
        return None
    text = " ".join(item["text"] for item in results).lower()
    if "generator operating procedure" in text:
        return "HIMADRI-DT Generator Operating Procedure (prototype reference)"
    return "Retrieved local SOP context"


def _sop_actions(context: str) -> list[str]:
    """Recommendations are retained from retrieved SOP bullets, not invented."""
    actions = []
    for line in context.splitlines():
        match = re.match(r"\s*-\s+(.+)", line)
        if match and match.group(1).strip() not in actions:
            actions.append(match.group(1).strip())
    if not actions:  # Chunks may contain bullets in a single line.
        actions = [item.strip() for item in re.findall(r"-\s*([^\-]+?)(?=\s+-|$)", context) if item.strip()]
    return actions[:6]


def _problem(telemetry: dict[str, Any], predictive: dict[str, Any] | None) -> str:
    if not telemetry:
        return "No current telemetry is available for this assessment."
    readings = ", ".join(f"{key}={value}" for key, value in telemetry.items())
    if not predictive:
        return f"Current telemetry is available ({readings}), but predictive AI output is unavailable."
    state = "flagged abnormal generator operating behaviour" if predictive.get("is_anomaly") else "not flagged the current readings as anomalous"
    return (
        f"Predictive AI has {state} (risk {predictive.get('risk', 'UNKNOWN')}, "
        f"health {predictive.get('health', 'UNKNOWN')}; available readings: {readings})."
    )


def _causes(query: str, predictive: dict[str, Any] | None, context: str, telemetry: dict[str, Any]) -> list[str]:
    if not telemetry or not predictive:
        return ["Insufficient telemetry to determine the cause."]
    if not predictive.get("is_anomaly"):
        return ["No likely cause is supported by the current telemetry and predictive AI output."]
    query_text = query.lower()
    context_text = context.lower()
    if "temperature" in query_text:
        relevant_triggers = {"cooling system", "coolant", "ventilation", "high load"}
    elif "vibration" in query_text:
        relevant_triggers = {"bearings", "lubrication", "mounting", "cooling system", "high load"}
    elif "load" in query_text:
        relevant_triggers = {"high load"}
    else:
        return ["Insufficient telemetry and condition-specific SOP evidence to determine the cause."]
    causes = ["A physical failure has not been diagnosed from the available data."]
    candidates = (
        ("cooling system", "Possible contributing factor: cooling-system or airflow condition (an SOP check)."),
        ("coolant", "Possible contributing factor: coolant level, where applicable (an SOP check)."),
        ("ventilation", "Possible contributing factor: blocked ventilation paths (an SOP check)."),
        ("bearings", "Possible contributing factor: bearing condition (an SOP check)."),
        ("lubrication", "Possible contributing factor: insufficient lubrication (an SOP check)."),
        ("mounting", "Possible contributing factor: generator mounting or loose surrounding components (an SOP check)."),
        ("high load", "Possible contributing factor: unusually high operating load (an SOP check)."),
    )
    for trigger, wording in candidates:
        if trigger in relevant_triggers and trigger in context_text:
            causes.append(wording)
    return causes[:4]


def _consequences(predictive: dict[str, Any] | None, context: str) -> list[str]:
    if not predictive or not predictive.get("is_anomaly"):
        return ["No immediate consequence is established by the current predictive AI output."]
    consequences = ["Continued abnormal operation may require maintenance inspection or escalation under the retrieved SOP."]
    if "temperature continues to rise" in context.lower():
        consequences.append("If temperature continues to rise, the SOP calls for reducing operational load where safe and requesting maintenance inspection.")
    if "abnormal vibration continues" in context.lower():
        consequences.append("Continued abnormal vibration should be flagged for maintenance inspection under the SOP.")
    return consequences


def _ollama_summary(query: str, problem: str, context: str) -> tuple[str | None, bool]:
    """The existing local Ollama call enriches the assessment but is never required."""
    if not context:
        return None, False
    prompt = f"""You are POLAR AI, an offline Antarctic-station operational assistant.
Write one cautious sentence explaining why the operator should review this condition.
Use only the supplied problem statement and SOP context. Do not diagnose a physical failure.
PROBLEM: {problem}
SOP CONTEXT: {context}
OPERATOR QUESTION: {query}"""
    response = ask_local_llm(prompt)
    if not response or response.startswith("[Ollama Offline]"):
        return None, False
    return response.strip(), True


def _format_answer(assessment: dict[str, Any]) -> str:
    sections = (
        ("CURRENT PROBLEM", [assessment["problem"]]),
        ("LIKELY CAUSES", assessment["likely_causes"]),
        ("WHY IT MATTERS", [assessment["why_it_matters"]]),
        ("POSSIBLE NEXT CONSEQUENCES", assessment["possible_consequences"]),
        ("RECOMMENDED ACTION", assessment["recommended_actions"] or ["No approved SOP action is available."]),
        ("SOURCE", [assessment["source"] or "No SOP source available."]),
    )
    return "POLAR AI ASSESSMENT\n" + "\n".join(f"\n{title}\n- " + "\n- ".join(items) for title, items in sections)


def answer_question(query: str, telemetry: dict[str, Any] | None = None, predictive: dict[str, Any] | None = None) -> dict[str, Any]:
    """Combine real local telemetry/predictive evidence with retrieved approved SOP text."""
    telemetry = _available_telemetry(telemetry)
    results, retrieval_error = _retrieve_safely(query)
    context = "\n\n".join(item["text"] for item in results)
    problem = _problem(telemetry, predictive)
    ollama_summary, ollama_available = _ollama_summary(query, problem, context)
    if not telemetry:
        why_it_matters, confidence = "Telemetry is required to assess the current operational significance.", "LOW — no current telemetry was available."
    elif predictive and predictive.get("is_anomaly"):
        why_it_matters = ollama_summary or "Predictive AI has identified an abnormal pattern, so the operator should review the approved SOP checks."
        confidence = "MODERATE — based on available telemetry, predictive AI output, and retrieved SOP context."
    else:
        why_it_matters, confidence = (ollama_summary or "Current available evidence does not establish an abnormal equipment condition."), "LIMITED — based on the currently available evidence."
    assessment = {
        "question": query, "problem": problem, "telemetry": telemetry,
        "risk": predictive.get("risk") if predictive else None,
        "health": predictive.get("health") if predictive else None,
        "likely_causes": _causes(query, predictive, context, telemetry),
        "why_it_matters": why_it_matters,
        "possible_consequences": _consequences(predictive, context),
        "recommended_actions": _sop_actions(context), "source": _source_label(results),
        "confidence": confidence, "ollama_available": ollama_available,
        "retrieval_error": retrieval_error,
        "sources": [{"score": round(item["score"], 3), "text": item["text"]} for item in results],
    }
    assessment["answer"] = _format_answer(assessment)  # Compatibility with existing string clients.
    return assessment
