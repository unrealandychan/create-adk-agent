"""{{PROJECT_NAME}} — ADK multi-agent (orchestrator + specialists)."""

from dotenv import load_dotenv
{{LITELM_IMPORT}}from google.adk.agents import Agent

load_dotenv()

_MODEL = {{MODEL_EXPR}}

# ── Specialist agents ─────────────────────────────────────────────────────────

research_agent = Agent(
    name="research_agent",
    model=_MODEL,
    description="Specialist for research, facts, and information retrieval.",
    instruction="""
    You are a research specialist. Answer factual questions thoroughly.
    Be precise and cite reasoning. Return structured, detailed answers.
    """,
    tools=[],
)

writer_agent = Agent(
    name="writer_agent",
    model=_MODEL,
    description="Specialist for writing, editing, summarising, and drafting content.",
    instruction="""
    You are a writing specialist. Help draft, edit, summarise, and improve text.
    Be clear, concise, and match the requested tone.
    """,
    tools=[],
)

# ── Orchestrator ──────────────────────────────────────────────────────────────

root_agent = Agent(
    name="{{PROJECT_NAME}}",
    model=_MODEL,
    description="Orchestrator that routes requests to the right specialist.",
    instruction="""
    You are an orchestrator. Delegate tasks to the most suitable specialist:
    - research_agent: factual questions, research, data, analysis
    - writer_agent: writing, editing, drafting, summarising

    If neither specialist is needed, handle it yourself briefly.
    Always pass the full user request to the chosen specialist.
    """,
    sub_agents=[research_agent, writer_agent],
)
