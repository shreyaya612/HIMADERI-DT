try:
    from .retriever import retrieve
    from .assistant import ask_local_llm
except ImportError:
    from retriever import retrieve
    from assistant import ask_local_llm


def answer_question(query: str):
    results = retrieve(query, top_k=2)

    context = "\n\n".join(
        result["text"]
        for result in results
    )

    prompt = f"""
You are HIMADRI-DT, an offline operational assistant for an Antarctic research station.

Answer the operator's question using ONLY the SOP context provided below.

IMPORTANT RULES:
- Do not invent procedures.
- Do not use outside knowledge.
- Include the relevant steps from the SOP.
- Keep the answer concise and practical.
- If the SOP does not contain enough information, clearly say so.
- Do not claim that this is an official NCPOR procedure.

SOP CONTEXT:
{context}

OPERATOR QUESTION:
{query}

Give the operator a short step-by-step answer.
"""

    answer = ask_local_llm(prompt)

    return {
        "question": query,
        "answer": answer,
        "sources": [
            {
                "score": round(result["score"], 3),
                "text": result["text"]
            }
            for result in results
        ]
    }