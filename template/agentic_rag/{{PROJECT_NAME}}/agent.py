"""{{PROJECT_NAME}} — ADK agentic RAG pipeline."""

import os
from pathlib import Path
from dotenv import load_dotenv
{{LITELM_IMPORT}}from google.adk.agents import Agent

load_dotenv()

_MODEL = {{MODEL_EXPR}}

# ── Simple in-memory document store (replace with your vector DB) ─────────────

_DOCS: list[dict] = []  # {"id": str, "content": str, "source": str}

def load_documents(folder: str = "./docs") -> dict:
    """
    Load all .txt and .md files from a folder into the document store.
    Call this before asking questions.
    """
    global _DOCS
    _DOCS = []
    p = Path(folder)
    if not p.exists():
        return {"status": "error", "message": f"Folder '{folder}' not found."}
    for f in p.glob("**/*.txt"):
        _DOCS.append({"id": str(f), "content": f.read_text(errors="replace"), "source": str(f)})
    for f in p.glob("**/*.md"):
        _DOCS.append({"id": str(f), "content": f.read_text(errors="replace"), "source": str(f)})
    return {"status": "success", "loaded": len(_DOCS), "sources": [d["source"] for d in _DOCS]}


def search_documents(query: str, top_k: int = 3) -> dict:
    """
    Search loaded documents for content relevant to the query.
    Returns top matching passages. Load documents first with load_documents().
    """
    if not _DOCS:
        return {
            "status": "error",
            "message": "No documents loaded. Call load_documents() first.",
        }
    # Simple keyword search — swap for vector similarity in production
    query_words = set(query.lower().split())
    scored = []
    for doc in _DOCS:
        content_lower = doc["content"].lower()
        score = sum(1 for w in query_words if w in content_lower)
        if score > 0:
            # Return a relevant chunk (first 500 chars for now)
            scored.append((score, doc))
    scored.sort(key=lambda x: x[0], reverse=True)
    results = [
        {"source": d["source"], "excerpt": d["content"][:500]}
        for _, d in scored[:top_k]
    ]
    if not results:
        return {"status": "not_found", "message": "No relevant documents found.", "results": []}
    return {"status": "success", "results": results}


root_agent = Agent(
    name="{{PROJECT_NAME}}",
    model=_MODEL,
    description="RAG agent that answers questions from loaded documents.",
    instruction="""
    You are a helpful RAG assistant. To answer questions:
    1. First call search_documents() to retrieve relevant passages
    2. Base your answer strictly on the retrieved content
    3. Always cite which document your answer comes from
    4. If no relevant documents are found, say so clearly

    If the user wants to load documents, call load_documents() with the folder path.
    """,
    tools=[load_documents, search_documents],
)
