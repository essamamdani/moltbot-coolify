#!/usr/bin/env bash
set -euo pipefail
set -x

if [[ -z "${CONVEX_URL:-}" ]]; then
  echo "convex-sync: CONVEX_URL not set, skipping."
  exit 0
fi

CFG_PATH="/data/.openclaw/openclaw.json"
MC_DIR="/app/mission-control"

if [[ ! -f "$CFG_PATH" ]]; then
  echo "convex-sync: config not found at $CFG_PATH"
  exit 0
fi

cd "$MC_DIR"

# Diagnostics
ls -la /app/scripts || true
ls -la "$MC_DIR" || true

# Ensure npx is available
if ! command -v npx >/dev/null 2>&1; then
  echo "convex-sync: npx not found; installing npm (brings npx)..."
  apt-get update -qq && apt-get install -y -qq npm >/dev/null
fi

# Ensure Convex CLI is available (fetched on demand)
npx --yes convex@1.17.0 --version >/dev/null

# Deploy schema if deploy key provided (idempotent)
if [[ -n "${CONVEX_DEPLOY_KEY:-}" ]]; then
  CONVEX_DEPLOY_KEY="$CONVEX_DEPLOY_KEY" npx convex deploy --url "$CONVEX_URL" || true
fi

# Register agents from openclaw.json (upsert)
CFG_PATH="$CFG_PATH" node - <<'NODE'
const { spawnSync } = require("child_process");
const fs = require("fs");

const convexUrl = process.env.CONVEX_URL;
const cfgPath = process.env.CFG_PATH;

if (!fs.existsSync(cfgPath)) {
  console.error("convex-sync: config not found at", cfgPath);
  process.exit(0);
}

const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const agents = (cfg.agents && cfg.agents.list) || [];

for (const a of agents) {
  const args = {
    agentId: a.id,
    name: a.name || a.id,
    role: a.role || "agent",
    description: a.description || "Imported from openclaw.json",
    heartbeatInterval: 900000,
    avatar: a.avatar,
  };

  console.log("convex-sync: registering", args.agentId);
  const res = spawnSync("npx", ["convex", "run", "agents:register", "--url", convexUrl, "--args", JSON.stringify(args)], { stdio: "inherit" });
  if (res.status !== 0) {
    console.error("convex-sync: register failed for", args.agentId, "exit", res.status);
  }
}
NODE
