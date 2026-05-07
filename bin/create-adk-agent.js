#!/usr/bin/env node
/**
 * create-adk-agent — interactive scaffold for Google ADK projects
 * Usage: npx create-google-adk-agent
 *        npx create-google-adk-agent --yes
 *        npx create-google-adk-agent --name my-bot --type multi --provider openai --model gpt-4o --yes
 */

"use strict";

const fs   = require("fs");
const path = require("path");
const rl_  = require("readline");

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  cyan: "\x1b[36m", green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m",
};
const b  = (s) => `${C.bold}${s}${C.reset}`;
const g  = (s) => `${C.green}${s}${C.reset}`;
const cy = (s) => `${C.cyan}${s}${C.reset}`;
const y  = (s) => `${C.yellow}${s}${C.reset}`;
const d  = (s) => `${C.dim}${s}${C.reset}`;

// ── Prompt helpers ─────────────────────────────────────────────────────────────
let rl;
const ask = (q) => new Promise((r) => rl.question(q, r));

async function askDefault(prompt, defaultVal) {
  const raw = await ask(`${cy("?")} ${b(prompt)} ${d(`(${defaultVal})`)} › `);
  return raw.trim() || defaultVal;
}

async function askMenu(prompt, choices) {
  console.log(`\n${cy("?")} ${b(prompt)}`);
  choices.forEach((c, i) => {
    const marker = i === 0 ? g("❯") : " ";
    console.log(`  ${marker} ${b((i+1) + ".")} ${c.label}  ${d(c.desc || "")}`);
  });
  while (true) {
    const raw = await ask(`  Enter number ${d(`(1-${choices.length})`)}: `);
    const n = parseInt(raw.trim(), 10);
    if (n >= 1 && n <= choices.length) return choices[n - 1];
    console.log(y("  ⚠  Please enter a valid number."));
  }
}

async function askCheckbox(prompt, choices) {
  console.log(`\n${cy("?")} ${b(prompt)} ${d("(space-separated numbers, or Enter to skip)")}`);
  choices.forEach((c, i) => {
    console.log(`  ${b((i+1) + ".")} ${c.label}  ${d(c.desc || "")}`);
  });
  const raw = await ask(`  Your choices: `);
  const selected = new Set(
    raw.trim().split(/[\s,]+/).map(n => parseInt(n, 10)).filter(n => n >= 1 && n <= choices.length)
  );
  return choices.filter((_, i) => selected.has(i + 1));
}

// ── Providers ──────────────────────────────────────────────────────────────────
const PROVIDERS = [
  {
    label: "Google AI Studio", desc: "free tier, just GOOGLE_API_KEY", key: "google_ai_studio",
    envVars: ["GOOGLE_API_KEY"], envComment: "# Get yours: https://aistudio.google.com/app/apikey",
    defaultModel: "gemini-2.0-flash", modelExpr: (m) => `"${m}"`, litellmImport: "", extraDeps: [],
  },
  {
    label: "Vertex AI", desc: "GCP project required", key: "vertex_ai",
    envVars: ["GOOGLE_CLOUD_PROJECT", "GOOGLE_CLOUD_LOCATION"],
    envComment: "# Set up: gcloud auth application-default login",
    defaultModel: "gemini-2.0-flash", modelExpr: (m) => `"${m}"`, litellmImport: "",
    extraDeps: ["google-cloud-aiplatform>=1.38"],
  },
  {
    label: "OpenAI", desc: "gpt-4o via ADK LiteLLM", key: "openai",
    envVars: ["OPENAI_API_KEY"], envComment: "# Get yours: https://platform.openai.com/api-keys",
    defaultModel: "gpt-4o", modelExpr: (m) => `LiteLlm(model="openai/${m}")`,
    litellmImport: "from google.adk.models.lite_llm import LiteLlm\n", extraDeps: ["litellm>=1.40"],
  },
  {
    label: "Anthropic", desc: "claude via ADK LiteLLM", key: "anthropic",
    envVars: ["ANTHROPIC_API_KEY"], envComment: "# Get yours: https://console.anthropic.com/",
    defaultModel: "claude-3-5-sonnet-20241022", modelExpr: (m) => `LiteLlm(model="anthropic/${m}")`,
    litellmImport: "from google.adk.models.lite_llm import LiteLlm\n", extraDeps: ["litellm>=1.40"],
  },
  {
    label: "Ollama", desc: "local, no API key needed", key: "ollama",
    envVars: [], envComment: "# Make sure ollama is running: ollama serve",
    defaultModel: "llama3.2", modelExpr: (m) => `LiteLlm(model="ollama/${m}")`,
    litellmImport: "from google.adk.models.lite_llm import LiteLlm\n", extraDeps: ["litellm>=1.40"],
  },
];

const AGENT_TYPES = [
  { label: "single",      desc: "one agent with tools — best starting point" },
  { label: "multi",       desc: "orchestrator + specialist sub-agents" },
  { label: "agentic_rag", desc: "RAG pipeline — load & query documents" },
];

const BUILTIN_TOOLS = [
  { label: "web",      desc: "fetch & parse web pages (httpx + markitdown)",  key: "web",      dep: "httpx>=0.27,markitdown>=0.0.1" },
  { label: "files",    desc: "read files & PDFs (markitdown)",                 key: "files",    dep: "markitdown>=0.0.1" },
  { label: "code",     desc: "run Python code snippets (subprocess sandbox)",  key: "code",     dep: "" },
  { label: "datetime", desc: "get current date/time for any timezone",         key: "datetime", dep: "" },
];

const MCP_SERVERS = [
  {
    label: "filesystem", desc: "read/write local files via MCP",
    key: "filesystem",
    config: { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem", "."] },
  },
  {
    label: "fetch",      desc: "fetch web URLs via MCP",
    key: "fetch",
    config: { command: "npx", args: ["-y", "@modelcontextprotocol/server-fetch"] },
  },
  {
    label: "github",     desc: "GitHub repos, issues, PRs via MCP (needs GITHUB_TOKEN)",
    key: "github",
    config: { command: "npx", args: ["-y", "@modelcontextprotocol/server-github"], env: { GITHUB_TOKEN: "${GITHUB_TOKEN}" } },
  },
  {
    label: "memory",     desc: "persistent key-value memory store via MCP",
    key: "memory",
    config: { command: "npx", args: ["-y", "@modelcontextprotocol/server-memory"] },
  },
  {
    label: "slack",      desc: "Slack messages & channels via MCP (needs SLACK_BOT_TOKEN)",
    key: "slack",
    config: { command: "npx", args: ["-y", "@modelcontextprotocol/server-slack"], env: { SLACK_BOT_TOKEN: "${SLACK_BOT_TOKEN}" } },
  },
];

// ── CLI arg parser ─────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--yes" || args[i] === "-y") flags.yes = true;
    else if (args[i].startsWith("--") && args[i+1] && !args[i+1].startsWith("--")) {
      flags[args[i].slice(2)] = args[++i];
    }
  }
  return flags;
}

// ── File helpers ───────────────────────────────────────────────────────────────
function copyTemplateDir(src, dest, vars) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const realName = entry.name.replace(/^_dot_/, ".");
    const destName = realName.replace(/\{\{PROJECT_NAME\}\}/g, vars.PROJECT_NAME);
    const destPath = path.join(dest, destName);
    if (entry.isDirectory()) {
      copyTemplateDir(srcPath, destPath, vars);
    } else {
      let content = fs.readFileSync(srcPath, "utf8");
      for (const [k, v] of Object.entries(vars)) content = content.replaceAll(`{{${k}}}`, v);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, content, "utf8");
    }
  }
}

function writeToolFiles(outDir, projectName, selectedTools) {
  if (!selectedTools.length) return;
  const toolsDir = path.join(outDir, projectName, "tools");
  fs.mkdirSync(toolsDir, { recursive: true });
  fs.writeFileSync(path.join(toolsDir, "__init__.py"), "");
  const TMPL = path.join(__dirname, "..", "template", "tools");
  for (const tool of selectedTools) {
    const src = path.join(TMPL, `${tool.key}.py`);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(toolsDir, `${tool.key}.py`));
  }
}

function writeMcpJson(outDir, selectedMcp) {
  if (!selectedMcp.length) return;
  const mcpConfig = { mcpServers: {} };
  for (const s of selectedMcp) mcpConfig.mcpServers[s.key] = s.config;
  fs.writeFileSync(path.join(outDir, "mcp.json"), JSON.stringify(mcpConfig, null, 2));
  // Also write tools/mcp.py helper
  const toolsDir = path.join(outDir);
  const mcpHelper = `"""MCP toolset helper — auto-generated by create-google-adk-agent.

Usage in agent.py:
    from .tools.mcp import get_mcp_toolsets
    # Then pass to Agent(tools=[...], before_agent_callback=...) or use directly

ADK MCP docs: https://google.github.io/adk-docs/tools/mcp-tools/
"""

import json
from pathlib import Path
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters

_MCP_CONFIG = json.loads((Path(__file__).parent.parent / "mcp.json").read_text())


def get_mcp_toolsets() -> list[MCPToolset]:
    """Return a list of MCPToolset instances from mcp.json."""
    toolsets = []
    for name, cfg in _MCP_CONFIG.get("mcpServers", {}).items():
        env = cfg.get("env", {})
        toolsets.append(
            MCPToolset(
                connection_params=StdioServerParameters(
                    command=cfg["command"],
                    args=cfg.get("args", []),
                    env=env or None,
                )
            )
        )
    return toolsets
`;
  // Ensure tools dir exists (may already from writeToolFiles)
  const projectToolsDir = path.join(outDir, /* need project name */ "tools");
  // We'll write the mcp helper alongside, just put it at project root tools/ if exists,
  // otherwise skip - handled in writeToolFiles flow
  fs.writeFileSync(path.join(outDir, "mcp.json"), JSON.stringify(mcpConfig, null, 2));
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  const flags = parseArgs();
  const YES   = !!flags.yes;

  if (!YES) {
    rl = rl_.createInterface({ input: process.stdin, output: process.stdout });
  }

  console.log(`
${C.cyan}${C.bold}  ╔════════════════════════════════════╗
  ║   create-google-adk-agent  🤖      ║
  ╚════════════════════════════════════╝${C.reset}
  ${d("Bootstrap a Google ADK project in seconds")}
  ${YES ? y("  ⚡ --yes mode: using all defaults") : ""}
`);

  // ── Gather inputs ──────────────────────────────────────────────────────────
  let projectName, agentType, provider, model, selectedTools, selectedMcp;

  if (YES) {
    projectName   = flags.name     || "my-adk-agent";
    agentType     = AGENT_TYPES.find(t => t.label === flags.type) || AGENT_TYPES[0];
    provider      = PROVIDERS.find(p => p.key === flags.provider)  || PROVIDERS[0];
    model         = flags.model    || provider.defaultModel;
    selectedTools = [];
    selectedMcp   = [];
    console.log(`  ${d("Project:")}   ${b(projectName)}`);
    console.log(`  ${d("Type:")}      ${b(agentType.label)}`);
    console.log(`  ${d("Provider:")}  ${b(provider.key)}`);
    console.log(`  ${d("Model:")}     ${b(model)}`);
    console.log(`  ${d("Tools:")}     ${b("none (add manually)")}`);
    console.log(`  ${d("MCP:")}       ${b("none (add manually)")}\n`);
  } else {
    projectName   = await askDefault("Project name", flags.name || "my-adk-agent");
    agentType     = await askMenu("Agent type", AGENT_TYPES);
    provider      = await askMenu("LLM Provider", PROVIDERS);
    model         = await askDefault("Model", flags.model || provider.defaultModel);
    selectedTools = await askCheckbox("Built-in tools (optional)", BUILTIN_TOOLS);
    selectedMcp   = await askCheckbox("MCP servers (optional)", MCP_SERVERS);
    rl.close();
  }

  const safeName = projectName.replace(/[^a-z0-9_]/gi, "_").replace(/^[0-9]/, "_$&");

  // ── Build template vars ────────────────────────────────────────────────────
  const extraDepsLines = [
    ...provider.extraDeps,
    ...selectedTools.flatMap(t => t.dep ? t.dep.split(",").map(s => s.trim()) : []),
  ].map(d => `  "${d}",`).join("\n");

  const toolImports = selectedTools.length
    ? selectedTools.map(t => `from .tools.${t.key} import *`).join("\n") + "\n"
    : "";

  const toolsList = selectedTools.length
    ? selectedTools.map(t => {
        const fnMap = { web: "fetch_webpage", files: "read_file", code: "run_python_code", datetime: "get_current_time" };
        return fnMap[t.key] || t.key;
      }).join(", ")
    : "get_current_time";

  const mcpNote = selectedMcp.length
    ? `\n# MCP servers configured in mcp.json — see tools/mcp.py for MCPToolset usage\n`
    : "";

  const envContent = provider.envVars.length
    ? provider.envVars.map(v => `${v}=your_key_here`).join("\n")
    : "# No API key required for this provider";

  const VARS = {
    PROJECT_NAME:        safeName,
    AGENT_TYPE:          agentType.label,
    PROVIDER_KEY:        provider.key,
    MODEL_NAME:          model,
    MODEL_EXPR:          provider.modelExpr(model),
    LITELM_IMPORT:       provider.litellmImport,
    EXTRA_DEPS:          extraDepsLines,
    ENV_VARS_COMMENT:    provider.envComment,
    ENV_CONTENT:         envContent,
    TOOLS_IMPORTS:       toolImports,
    TOOLS_LIST:          toolsList,
    MCP_NOTE:            mcpNote,
    LITELM_IMPORT_COPILOT: provider.litellmImport,
  };

  // ── Output dir ─────────────────────────────────────────────────────────────
  const outDir = path.resolve(process.cwd(), projectName);
  if (fs.existsSync(outDir)) {
    console.error(`\n${C.red}✗ Directory '${projectName}' already exists.${C.reset}\n`);
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const TMPL = path.join(__dirname, "..", "template");

  console.log(`\n  ${d("Creating project...")} `);
  copyTemplateDir(path.join(TMPL, "base"), outDir, VARS);
  copyTemplateDir(path.join(TMPL, agentType.label), outDir, VARS);

  // Rename .env.example
  const envEx = path.join(outDir, "_dot_env.example");
  if (fs.existsSync(envEx)) fs.renameSync(envEx, path.join(outDir, ".env.example"));

  // Write tool files
  writeToolFiles(outDir, safeName, selectedTools);

  // Write mcp.json + mcp helper
  if (selectedMcp.length) {
    const mcpConfig = { mcpServers: {} };
    for (const s of selectedMcp) mcpConfig.mcpServers[s.key] = s.config;
    fs.writeFileSync(path.join(outDir, "mcp.json"), JSON.stringify(mcpConfig, null, 2));

    const toolsDir = path.join(outDir, safeName, "tools");
    fs.mkdirSync(toolsDir, { recursive: true });
    if (!fs.existsSync(path.join(toolsDir, "__init__.py")))
      fs.writeFileSync(path.join(toolsDir, "__init__.py"), "");

    const mcpHelper = `"""MCP toolset helper — auto-generated by create-google-adk-agent."""
import json
from pathlib import Path
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters

_CFG = json.loads((Path(__file__).parent.parent.parent / "mcp.json").read_text())

def get_mcp_toolsets() -> list[MCPToolset]:
    """Return MCPToolset instances from mcp.json. Use in Agent(tools=[...])."""
    out = []
    for name, cfg in _CFG.get("mcpServers", {}).items():
        out.append(MCPToolset(connection_params=StdioServerParameters(
            command=cfg["command"], args=cfg.get("args", []), env=cfg.get("env") or None,
        )))
    return out
`;
    fs.writeFileSync(path.join(toolsDir, "mcp.py"), mcpHelper);
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const envInstruction = provider.envVars.length
    ? provider.envVars.map(v => `    ${v}=<your_key>`).join("\n")
    : "    # No key needed — just run!";

  const toolsSummary = selectedTools.length ? selectedTools.map(t => t.label).join(", ") : "none";
  const mcpSummary   = selectedMcp.length   ? selectedMcp.map(s => s.label).join(", ")   : "none";

  console.log(`
  ${g("✅ Done!")} ${b(projectName)} created.

  ${b("Next steps:")}

  1. ${cy(`cd ${projectName}`)}
  2. Edit ${cy(".env.example")} → ${cy(".env")}:
${d(envInstruction)}
  3. ${cy("uv sync")}
  4. ${cy("uv run adk web")}   ${d("→ open http://localhost:8000")}

  ${d("──────────────────────────────────────────")}
  ${d("Agent type: ")}${b(agentType.label)}
  ${d("Provider:   ")}${b(provider.key)}
  ${d("Model:      ")}${b(model)}
  ${d("Tools:      ")}${b(toolsSummary)}
  ${d("MCP:        ")}${b(mcpSummary)}
  ${d("──────────────────────────────────────────")}

  ${d("Tip:")} ${cy("make dev")} = ${cy("uv run adk web")} | ${cy("make test")} = pytest
  ${selectedMcp.length ? d("MCP: see mcp.json + " + safeName + "/tools/mcp.py") : ""}
`);
}

main().catch((e) => { console.error(e); process.exit(1); });
