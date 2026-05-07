#!/usr/bin/env node
/**
 * create-adk-agent — interactive scaffold for Google ADK projects
 * Usage: npx create-adk-agent  OR  uvx create-adk-agent
 */

"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

// ── Colours ───────────────────────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
};
const b = (s) => `${c.bold}${s}${c.reset}`;
const g = (s) => `${c.green}${s}${c.reset}`;
const cy = (s) => `${c.cyan}${s}${c.reset}`;
const y = (s) => `${c.yellow}${s}${c.reset}`;
const d = (s) => `${c.dim}${s}${c.reset}`;

// ── Prompt helpers ─────────────────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

async function askDefault(prompt, defaultVal) {
  const raw = await ask(`${cy("?")} ${b(prompt)} ${d(`(${defaultVal})`)} › `);
  return raw.trim() || defaultVal;
}

async function askMenu(prompt, choices) {
  console.log(`${cy("?")} ${b(prompt)}`);
  choices.forEach((c, i) => {
    const marker = i === 0 ? g("❯") : " ";
    console.log(`  ${marker} ${b(i + 1 + ".")} ${c.label}  ${d(c.desc || "")}`);
  });
  while (true) {
    const raw = await ask(`  Enter number ${d(`(1-${choices.length})`)}: `);
    const n = parseInt(raw.trim(), 10);
    if (n >= 1 && n <= choices.length) return choices[n - 1];
    console.log(y("  ⚠  Please enter a valid number."));
  }
}

// ── Provider / model configs ───────────────────────────────────────────────────
const PROVIDERS = [
  {
    label: "Google AI Studio",
    desc: "free tier, just GOOGLE_API_KEY",
    key: "google_ai_studio",
    envVars: ["GOOGLE_API_KEY"],
    envComment: "# Get yours: https://aistudio.google.com/app/apikey",
    defaultModel: "gemini-2.0-flash",
    modelExpr: (m) => `"${m}"`,
    litellmImport: "",
    extraDeps: [],
  },
  {
    label: "Vertex AI",
    desc: "GCP project required",
    key: "vertex_ai",
    envVars: ["GOOGLE_CLOUD_PROJECT", "GOOGLE_CLOUD_LOCATION"],
    envComment: "# Set up: gcloud auth application-default login",
    defaultModel: "gemini-2.0-flash",
    modelExpr: (m) => `"${m}"`,
    litellmImport: "",
    extraDeps: ["google-cloud-aiplatform>=1.38"],
  },
  {
    label: "OpenAI",
    desc: "gpt-4o via ADK LiteLLM",
    key: "openai",
    envVars: ["OPENAI_API_KEY"],
    envComment: "# Get yours: https://platform.openai.com/api-keys",
    defaultModel: "gpt-4o",
    modelExpr: (m) => `LiteLlm(model="openai/${m}")`,
    litellmImport: "from google.adk.models.lite_llm import LiteLlm\n",
    extraDeps: ["litellm>=1.40"],
  },
  {
    label: "Anthropic",
    desc: "claude-3-5-sonnet via ADK LiteLLM",
    key: "anthropic",
    envVars: ["ANTHROPIC_API_KEY"],
    envComment: "# Get yours: https://console.anthropic.com/",
    defaultModel: "claude-3-5-sonnet-20241022",
    modelExpr: (m) => `LiteLlm(model="anthropic/${m}")`,
    litellmImport: "from google.adk.models.lite_llm import LiteLlm\n",
    extraDeps: ["litellm>=1.40"],
  },
  {
    label: "Ollama",
    desc: "local, no API key needed",
    key: "ollama",
    envVars: [],
    envComment: "# Make sure ollama is running: ollama serve",
    defaultModel: "llama3.2",
    modelExpr: (m) => `LiteLlm(model="ollama/${m}")`,
    litellmImport: "from google.adk.models.lite_llm import LiteLlm\n",
    extraDeps: ["litellm>=1.40"],
  },
];

const AGENT_TYPES = [
  { label: "single",       desc: "one agent with tools — best starting point" },
  { label: "multi",        desc: "orchestrator + specialist sub-agents" },
  { label: "agentic_rag",  desc: "RAG pipeline — load & query documents" },
];

// ── File helpers ───────────────────────────────────────────────────────────────
function copyTemplateDir(src, dest, vars) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    // Rename _dot_ prefix → real dot files
    const realName = entry.name.replace(/^_dot_/, ".");
    // Rename {{PROJECT_NAME}} in directory/file names
    const destName = realName.replace(/\{\{PROJECT_NAME\}\}/g, vars.PROJECT_NAME);
    const destPath = path.join(dest, destName);

    if (entry.isDirectory()) {
      copyTemplateDir(srcPath, destPath, vars);
    } else {
      let content = fs.readFileSync(srcPath, "utf8");
      // Replace all template variables
      for (const [k, v] of Object.entries(vars)) {
        content = content.replaceAll(`{{${k}}}`, v);
      }
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, content, "utf8");
    }
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`
${c.cyan}${c.bold}  ╔═══════════════════════════════════╗
  ║    create-adk-agent  🤖            ║
  ╚═══════════════════════════════════╝${c.reset}
  ${d("Bootstrap a Google ADK project in seconds")}
`);

  // 1. Project name
  const projectName = await askDefault("Project name", "my-adk-agent");
  const safeName = projectName.replace(/[^a-z0-9_]/gi, "_").replace(/^[0-9]/, "_$&");

  // 2. Agent type
  const agentType = await askMenu("Agent type", AGENT_TYPES);

  // 3. Provider
  const provider = await askMenu("LLM Provider", PROVIDERS);

  // 4. Model
  const model = await askDefault("Model", provider.defaultModel);

  rl.close();

  // ── Derive template vars ────────────────────────────────────────────────────
  const extraDepsLines = provider.extraDeps.map((d) => `  "${d}",`).join("\n");

  const envContent = provider.envVars.length
    ? provider.envVars.map((v) => `${v}=your_key_here`).join("\n")
    : "# No API key required for this provider";

  const copilotLitellmNote = provider.litellmImport
    ? `\nfrom google.adk.models.lite_llm import LiteLlm\n`
    : "";

  const VARS = {
    PROJECT_NAME: safeName,
    AGENT_TYPE: agentType.label,
    PROVIDER_KEY: provider.key,
    MODEL_NAME: model,
    MODEL_EXPR: provider.modelExpr(model),
    LITELM_IMPORT: provider.litellmImport,
    EXTRA_DEPS: extraDepsLines,
    ENV_VARS_COMMENT: provider.envComment,
    ENV_CONTENT: envContent,
    LITELM_IMPORT_COPILOT: copilotLitellmNote,
  };

  // ── Output dir ──────────────────────────────────────────────────────────────
  const outDir = path.resolve(process.cwd(), projectName);
  if (fs.existsSync(outDir)) {
    console.error(`\n${c.red}✗ Directory '${projectName}' already exists.${c.reset}\n`);
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const TMPL = path.join(__dirname, "..", "template");

  // ── Copy base + type template ───────────────────────────────────────────────
  console.log(`\n  ${d("Creating project...")} `);
  copyTemplateDir(path.join(TMPL, "base"), outDir, VARS);
  copyTemplateDir(path.join(TMPL, agentType.label), outDir, VARS);

  // Rename .env.example
  const envEx = path.join(outDir, "_dot_env.example");
  if (fs.existsSync(envEx)) fs.renameSync(envEx, path.join(outDir, ".env.example"));

  // ── Print next steps ────────────────────────────────────────────────────────
  const envInstruction = provider.envVars.length
    ? provider.envVars.map((v) => `    ${v}=<your_key>`).join("\n")
    : "    # No key needed — just run!";

  console.log(`
  ${g("✅ Done!")} ${b(projectName)} created.

  ${b("Next steps:")}

  1. ${cy(`cd ${projectName}`)}
  2. Edit ${cy(".env.example")} → ${cy(".env")}:
${d(envInstruction)}
  3. ${cy("uv sync")}
  4. ${cy("uv run adk web")}   ${d("→ open http://localhost:8000")}

  ${d("─────────────────────────────────────────")}
  ${d("Agent type:  ")}${b(agentType.label)}
  ${d("Provider:    ")}${b(provider.key)}
  ${d("Model:       ")}${b(model)}
  ${d("─────────────────────────────────────────")}

  ${d("Tip: run")} ${cy("make dev")} ${d("as a shortcut for")} ${cy("uv run adk web")}
  ${d("     run")} ${cy("make test")} ${d("to run the test suite")}
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
