# Copilot Instructions — {{PROJECT_NAME}}

## What this project is

A **Google ADK** (Agent Development Kit) agent.
- **Type:** {{AGENT_TYPE}}
- **Provider:** {{PROVIDER_KEY}}
- **Model:** {{MODEL_NAME}}

## ADK Key Concepts

- `Agent` — core agent class with `name`, `model`, `instruction`, `tools`, `sub_agents`
- `root_agent` — **must** be named exactly `root_agent` in `agent.py` (ADK convention)
- Tools are plain Python functions with a docstring — ADK auto-generates the schema
- `SequentialAgent` — runs sub-agents one after another
- `ParallelAgent` — runs sub-agents concurrently
- `LoopAgent` — repeats a sub-agent until condition met

## Project Layout

```
{{PROJECT_NAME}}/     ← Python module (ADK loads this)
  __init__.py
  agent.py            ← root_agent lives here
  tools/              ← plain Python functions used as tools
tests/
pyproject.toml
.env / .env.example
```

## Running

```bash
uv run adk web        # Dev UI at http://localhost:8000
uv run adk run {{PROJECT_NAME}}   # CLI mode
```

> ⚠️ Run from the **parent** folder, not inside `{{PROJECT_NAME}}/`

## Model config ({{PROVIDER_KEY}})

```python
{{LITELM_IMPORT}}model = {{MODEL_EXPR}}
```

## Common Copilot tasks

- "Add a tool that fetches live stock prices"
- "Add a sub-agent for data analysis and wire it with SequentialAgent"
- "Add input/output guardrails"
- "Write a pytest test for the root agent"
- "Add session memory so the agent remembers previous turns"
- "Switch the model to gemini-1.5-pro"

## Code style

- Python 3.11+, type hints everywhere
- Tool functions: return `dict` with `{"status": "success", ...}` or `{"status": "error", "message": ...}`
- `root_agent` must always be exported from `agent.py`
