import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer


BASE_DIR = os.path.dirname(__file__)

INDEX_PATH = os.path.join(
    BASE_DIR,
    "sop_embeddings.npy"
)

CHUNKS_PATH = os.path.join(
    BASE_DIR,
    "sop_chunks.json"
)

MODEL_NAME = "all-MiniLM-L6-v2"

model = SentenceTransformer(MODEL_NAME)


def load_index():
    embeddings = np.load(INDEX_PATH)

    with open(CHUNKS_PATH, "r", encoding="utf-8") as file:
        chunks = json.load(file)

    return embeddings, chunks


SOP_EMBEDDINGS, SOP_CHUNKS = load_index()


def retrieve(query, top_k=3):

    query_embedding = model.encode(
        [query],
        normalize_embeddings=True
    )[0]

    scores = SOP_EMBEDDINGS @ query_embedding

    ranked_indices = scores.argsort()[::-1][:top_k]

    results = []

    for index in ranked_indices:
        results.append({
            "text": SOP_CHUNKS[index],
            "score": float(scores[index])
        })

    return results