# {{PROJECT_NAME}}

> 🤖 ADK agent — powered by [Google Agent Development Kit](https://google.github.io/adk-docs/)
> **Type:** {{AGENT_TYPE}} | **Provider:** {{PROVIDER_KEY}} | **Model:** {{MODEL_NAME}}

## Quick Start

```bash
cp .env.example .env      # add your API key
uv sync                   # install deps
uv run adk web            # open Dev UI at http://localhost:8000
```

## Project Structure

```
{{PROJECT_NAME}}/          ← ADK requires this folder = module name
  __init__.py
  agent.py                 ← root_agent defined here
  tools/
    example.py
tests/
  test_agent.py
pyproject.toml
.env.example
```

> ⚠️ ADK convention: `adk web` is run from the **parent** folder, and it loads `{{PROJECT_NAME}}/agent.py`

## Running

| Command | What it does |
|---------|-------------|
| `uv run adk web` | Dev UI at localhost:8000 (chat + trace + events) |
| `uv run adk run {{PROJECT_NAME}}` | CLI chat mode |
| `uv run adk api_server` | FastAPI server |
| `make dev` | Same as `adk web` |
| `make test` | Run pytest |

## Adding Tools

```python
# {{PROJECT_NAME}}/tools/my_tool.py
def my_tool(input: str) -> dict:
    """Describe what this tool does — ADK uses this as the tool description."""
    return {"result": input}
```

Register in `agent.py`:
```python
from .tools.my_tool import my_tool
root_agent = Agent(..., tools=[my_tool])
```

## Provider: {{PROVIDER_KEY}}

{{ENV_CONTENT}}

## Docs

- [ADK Docs](https://google.github.io/adk-docs/)
- [ADK Samples](https://github.com/google/adk-samples)
- [ADK Python](https://github.com/google/adk-python)
