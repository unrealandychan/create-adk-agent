     1|# 🤖 create-google-adk-agent
     2|
     3|> The fastest way to scaffold a production-ready [Google ADK](https://google.github.io/adk-docs/) AI agent — like `create-next-app`, but for intelligent agents.
     4|
     5|[![npm version](https://img.shields.io/npm/v/create-google-adk-agent?color=crimson&logo=npm&label=npm)](https://www.npmjs.com/package/create-google-adk-agent)
     6|[![PyPI version](https://img.shields.io/pypi/v/create-google-adk-agent?color=blue&logo=pypi&label=PyPI)](https://pypi.org/project/create-google-adk-agent/)
     7|[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
     8|[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue?logo=python)](https://www.python.org/)
     9|[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green?logo=node.js)](https://nodejs.org/)
    10|
    11|---
    12|
    13|## ⚡ Quick Start
    14|
    15|```bash
    16|# via npm (Node.js)
    17|npx create-google-adk-agent
    18|
    19|# via uv (Python)
    20|uvx create-google-adk-agent
    21|```
    22|
    23|---
    24|
    25|## 🎬 Interactive Demo
    26|
    27|```
    28|$ npx create-google-adk-agent
    29|
    30|✨ Welcome to create-google-adk-agent!
    31|
    32|? Project name: my-ai-agent
    33|? Agent type: (Use arrow keys)
    34|  ❯ single       — One focused agent
    35|    multi        — Orchestrator + sub-agents
    36|    agentic_rag  — RAG-powered agent
    37|
    38|? LLM provider:
    39|  ❯ Google AI Studio (gemini-2.0-flash)
    40|    Vertex AI
    41|    OpenAI
    42|    Anthropic
    43|    Ollama
    44|
    45|? Model name: gemini-2.0-flash
    46|
    47|? Built-in tools: (Press <space> to select)
    48|  ❯ ◉ web       — HTTP fetch + Markdown parsing (httpx + markitdown)
    49|    ◯ files     — PDF / DOCX / XLSX reader
    50|    ◯ code      — Python subprocess sandbox
    51|    ◯ datetime  — Current date & time
    52|
    53|? MCP servers: (Press <space> to select)
    54|    ◯ filesystem   ◯ fetch   ◯ github
    55|    ◯ memory       ◯ slack
    56|
    57|✅ Project created in ./my-ai-agent
    58|👉 cd my-ai-agent && uv run adk web
    59|```
    60|
    61|---
    62|
    63|## ✨ Features
    64|
    65|| Feature | Description |
    66||---|---|
    67|| 🧙 **Interactive wizard** | Guided Q&A for project name, agent type, LLM provider & model |
    68|| ⚡ **`--yes` / CI mode** | Skip all prompts with sensible defaults for automated pipelines |
    69|| 🛠️ **Built-in tools** | Checkbox-select web, file, code & datetime tools — auto-wired |
    70|| 🔌 **MCP servers** | One-click MCP integration — generates `mcp.json` + `tools/mcp.py` |
    71|| 🤖 **Multi-agent ready** | Scaffolds orchestrator + sub-agent architecture out of the box |
    72|| 📚 **Agentic RAG** | RAG pipeline template with embeddings + retrieval included |
    73|| 🧑‍✈️ **Copilot pre-wired** | `.github/copilot-instructions.md` ready for GitHub Copilot |
    74|| 🚀 **`uv` + `adk web`** | Virtual env, deps & dev server all ready — one command to run |
    75|| 🧪 **Tests included** | Starter test suite scaffolded alongside your agent |
    76|
    77|---
    78|
    79|## 📦 Installation & Usage
    80|
    81|### One-time run (recommended)
    82|
    83|```bash
    84|# Node / npx
    85|npx create-google-adk-agent
    86|
    87|# Python / uvx
    88|uvx create-google-adk-agent
    89|```
    90|
    91|### Global install
    92|
    93|```bash
    94|# npm
    95|npm install -g create-google-adk-agent
    96|create-google-adk-agent
    97|
    98|# pip / uv
    99|pip install create-google-adk-agent
   100|create-google-adk-agent
   101|```
   102|
   103|---
   104|
   105|## 🚩 CLI Options
   106|
   107|```
   108|Usage: create-google-adk-agent [options]
   109|
   110|Options:
   111|  -y, --yes         Use defaults for all prompts (non-interactive / CI mode)
   112|  -h, --help        Show help
   113|  -v, --version     Show version
   114|```
   115|
   116|### Non-interactive example (CI/CD)
   117|
   118|```bash
   119|npx create-google-adk-agent --yes
   120|# Generates a single-agent project with Google AI Studio + gemini-2.0-flash
   121|```
   122|
   123|---
   124|
   125|## 🤖 Agent Types
   126|
   127|| Type | Description | Best For |
   128||---|---|---|
   129|| `single` | One self-contained agent | Focused tasks, chatbots, simple automation |
   130|| `multi` | Orchestrator + specialised sub-agents | Complex pipelines, delegation workflows |
   131|| `agentic_rag` | RAG pipeline wired into an ADK agent | Document Q&A, knowledge-base assistants |
   132|
   133|---
   134|
   135|## 🧠 LLM Providers
   136|
   137|| Provider | Models | Notes |
   138||---|---|---|
   139|| **Google AI Studio** | `gemini-2.0-flash`, `gemini-1.5-pro`, … | Default — free tier available |
   140|| **Vertex AI** | All Gemini models | GCP project required |
   141|| **OpenAI** | `gpt-4o`, `gpt-4-turbo`, … | `OPENAI_API_KEY` required |
   142|| **Anthropic** | `claude-3-5-sonnet`, … | `ANTHROPIC_API_KEY` required |
   143|| **Ollama** | `llama3`, `mistral`, … | Local inference — no API key needed |
   144|
   145|---
   146|
   147|## 🛠️ Built-in Tools
   148|
   149|| Tool | Libraries | What it does |
   150||---|---|---|
   151|| `web` | `httpx` + `markitdown` | Fetch URLs & convert to clean Markdown |
   152|| `files` | `pypdf`, `python-docx`, `openpyxl` | Read PDF, DOCX & XLSX files |
   153|| `code` | stdlib `subprocess` | Execute Python in a sandboxed subprocess |
   154|| `datetime` | stdlib `datetime` | Return current date & time |
   155|
   156|---
   157|
   158|## 🔌 MCP Servers
   159|
   160|| Server | Purpose | Auto-generated files |
   161||---|---|---|
   162|| `filesystem` | Read/write local files via MCP | `mcp.json`, `tools/mcp.py` |
   163|| `fetch` | HTTP fetch via MCP | `mcp.json`, `tools/mcp.py` |
   164|| `github` | GitHub API via MCP | `mcp.json`, `tools/mcp.py` |
   165|| `memory` | Persistent key-value memory | `mcp.json`, `tools/mcp.py` |
   166|| `slack` | Post messages to Slack | `mcp.json`, `tools/mcp.py` |
   167|
   168|> Selecting any MCP server automatically generates a fully configured `mcp.json` and a ready-to-import `tools/mcp.py` module.
   169|
   170|---
   171|
   172|## 📁 Generated Project Structure
   173|
   174|```
   175|my-ai-agent/
   176|├── .github/
   177|│   └── copilot-instructions.md   # GitHub Copilot context
   178|├── my_ai_agent/
   179|│   ├── __init__.py
   180|│   ├── agent.py                  # Core ADK agent definition
   181|│   └── tools/
   182|│       ├── web.py                # (if selected)
   183|│       ├── files.py              # (if selected)
   184|│       ├── code.py               # (if selected)
   185|│       ├── datetime_tool.py      # (if selected)
   186|│       └── mcp.py                # (if MCP servers selected)
   187|├── tests/
   188|│   └── test_agent.py
   189|├── mcp.json                      # (if MCP servers selected)
   190|├── .env.example
   191|├── pyproject.toml                # uv-compatible
   192|└── README.md
   193|```
   194|
   195|---
   196|
   197|## 🏃 Running Your Agent
   198|
   199|```bash
   200|cd my-ai-agent
   201|
   202|# Copy and fill in your API key
   203|cp .env.example .env
   204|
   205|# Install dependencies (uv recommended)
   206|uv sync
   207|
   208|# Launch the ADK web UI
   209|uv run adk web
   210|
   211|# Or run tests
   212|uv run pytest
   213|```
   214|
   215|---
   216|
   217|## 🤝 Contributing
   218|
   219|Contributions, issues and feature requests are welcome!
   220|
   221|1. Fork the repo
   222|2. Create your branch: `git checkout -b feat/amazing-feature`
   223|3. Commit your changes: `git commit -m 'feat: add amazing feature'`
   224|4. Push: `git push origin feat/amazing-feature`
   225|5. Open a Pull Request
   226|
   227|Please make sure to update tests as appropriate and follow the existing code style.
   228|
   229|---
   230|
   231|## 📄 License
   232|
   233|This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
   234|
   235|---
   236|
   237|<p align="center">
   238|  Made with ❤️ for the Google ADK community<br/>
   239|  <a href="https://google.github.io/adk-docs/">Google ADK Docs</a> •
   240|  <a href="https://www.npmjs.com/package/create-google-adk-agent">npm</a> •
   241|  <a href="https://pypi.org/project/create-google-adk-agent/">PyPI</a>
   242|</p>
   243|