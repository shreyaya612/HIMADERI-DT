from rag_assistant import answer_question


query = "Generator 2 has abnormal vibration. What should I check?"

result = answer_question(query)

print("\nQUESTION:")
print(result["question"])

print("\nAI ANSWER:")
print(result["answer"])

print("\nSOURCES:")
for source in result["sources"]:
    print(f"\nScore: {source['score']}")
    print(source["text"])