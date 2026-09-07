from retriever import retrieve


query = "Generator 2 has abnormal vibration. What should I check?"

results = retrieve(query)

print("\nTOP MATCHES:\n")

for i, result in enumerate(results, 1):
    print(f"--- Match {i} ---")
    print(f"Score: {result['score']:.3f}")
    print(result["text"])
    print()