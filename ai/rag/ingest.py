import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer


BASE_DIR = os.path.dirname(__file__)

SOP_PATH = os.path.join(
    BASE_DIR,
    "generator_sop.txt"
)

INDEX_PATH = os.path.join(
    BASE_DIR,
    "sop_embeddings.npy"
)

CHUNKS_PATH = os.path.join(
    BASE_DIR,
    "sop_chunks.json"
)

MODEL_NAME = "all-MiniLM-L6-v2"


def load_sop():
    with open(SOP_PATH, "r", encoding="utf-8") as file:
        return file.read()


def chunk_text(text, chunk_size=120):
    words = text.split()

    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)

    return chunks


def main():

    print("Loading embedding model...")

    model = SentenceTransformer(MODEL_NAME)

    print("Reading SOP...")

    text = load_sop()

    chunks = chunk_text(text)

    print(f"Created {len(chunks)} chunks.")

    print("Generating embeddings...")

    embeddings = model.encode(
        chunks,
        normalize_embeddings=True
    )

    np.save(INDEX_PATH, embeddings)

    with open(CHUNKS_PATH, "w", encoding="utf-8") as file:
        json.dump(
            chunks,
            file,
            indent=2,
            ensure_ascii=False
        )

    print("\nRAG index created successfully.")

    print(f"Embeddings: {INDEX_PATH}")
    print(f"Chunks:     {CHUNKS_PATH}")


if __name__ == "__main__":
    main()