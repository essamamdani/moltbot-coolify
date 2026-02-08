#!/usr/bin/env bash
# One-time Convex initialization for Mission Control
# Deploys schema and seeds initial agent data.
# Skips if already initialized (marker file exists).

set -euo pipefail

CONVEX_URL="${CONVEX_URL:-}"
CONVEX_DEPLOY_KEY="${CONVEX_DEPLOY_KEY:-}"
MARKER="/data/.openclaw/.convex-initialized"

if [ -f "$MARKER" ]; then
  echo "Mission Control (Convex) already initialized."
  exit 0
fi

if [ -z "$CONVEX_URL" ]; then
  echo "CONVEX_URL not set. Skipping Mission Control setup."
  echo "Set CONVEX_URL in your environment to enable Mission Control."
  exit 0
fi

echo "Initializing Mission Control (Convex)..."

# Deploy schema and functions if deploy key is available
if [ -n "$CONVEX_DEPLOY_KEY" ] && [ -d "/app/mission-control/convex" ]; then
  cd /app/mission-control
  CONVEX_DEPLOY_KEY="$CONVEX_DEPLOY_KEY" npx convex deploy --url "$CONVEX_URL" 2>/dev/null || {
    echo "Convex deploy failed. Schema may need manual deployment."
    echo "Run: cd mission-control && npx convex deploy"
  }
  cd /app
fi

# Seed initial agent data
echo "Seeding agent data..."

npx convex run agents:register --args '{
  "agentId": "jarvis",
  "name": "Jarvis",
  "role": "coordinator",
  "description": "Squad coordinator — delegates tasks, monitors progress, reviews completed work",
  "heartbeatInterval": 900000,
  "avatar": "🎯"
}' 2>/dev/null || echo "Jarvis agent seed skipped (may already exist)"

npx convex run agents:register --args '{
  "agentId": "developer",
  "name": "Developer",
  "role": "developer",
  "description": "Code specialist — writes code, fixes bugs, creates technical documentation",
  "heartbeatInterval": 900000,
  "avatar": "💻"
}' 2>/dev/null || echo "Developer agent seed skipped (may already exist)"

# Mark as initialized
mkdir -p "$(dirname "$MARKER")"
touch "$MARKER"
echo "Mission Control initialized successfully."
