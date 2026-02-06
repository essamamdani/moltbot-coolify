#!/usr/bin/env bash
set -e

# =============================================================================
# OpenClaw Bootstrap Script v2.0
# =============================================================================

OPENCLAW_STATE="/root/.openclaw"
CONFIG_FILE="$OPENCLAW_STATE/openclaw.json"
TEMPLATE_FILE="/app/openclaw.template.json"
WORKSPACE_DIR="/root/openclaw-workspace"

echo "🦞 OpenClaw Bootstrap Starting..."

# Ensure directory structure
mkdir -p "$OPENCLAW_STATE" "$WORKSPACE_DIR"
mkdir -p "$OPENCLAW_STATE/credentials"
mkdir -p "$OPENCLAW_STATE/agents/main/sessions"
mkdir -p "$OPENCLAW_STATE/python" "$OPENCLAW_STATE/npm"
chmod 700 "$OPENCLAW_STATE"

# -----------------------------------------------------------------------------
# gog CLI: Persistent Configuration
# -----------------------------------------------------------------------------
mkdir -p "$OPENCLAW_STATE/gogcli"
if [ ! -L "/root/.config/gogcli" ]; then
  mkdir -p /root/.config
  ln -sf "$OPENCLAW_STATE/gogcli" /root/.config/gogcli
fi

if [ -n "$GOOGLE_CALENDAR_CREDENTIALS_JSON" ]; then
  echo "$GOOGLE_CALENDAR_CREDENTIALS_JSON" > "$OPENCLAW_STATE/gogcli/credentials.json"
  chmod 600 "$OPENCLAW_STATE/gogcli/credentials.json"
  echo "✅ gog credentials configured"
fi

if [ -n "$GOG_KEYRING_PASSWORD" ]; then
  export GOG_KEYRING_PASSWORD
  echo "✅ gog keyring password set"
fi

# -----------------------------------------------------------------------------
# Configuration Generation (Template Based)
# -----------------------------------------------------------------------------
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Generating openclaw.json from template..."
  TOKEN=$(openssl rand -hex 24 2>/dev/null || node -e "console.log(require('crypto').randomBytes(24).toString('hex'))")
  
  if [ -f "$TEMPLATE_FILE" ]; then
    # Use template if available, replace TOKEN placeholder
    sed "s/{{ACCESS_TOKEN}}/$TOKEN/g" "$TEMPLATE_FILE" > "$CONFIG_FILE"
  else
    # Fallback to legacy hardcoded generation if template missing
    cat >"$CONFIG_FILE" <<EOF
{
  "gateway": {
    "port": 18789,
    "auth": { "mode": "token", "token": "$TOKEN" }
  },
  "agents": {
    "defaults": {
      "workspace": "$WORKSPACE_DIR",
      "model": {
        "primary": "google-antigravity/claude-opus-4-5-thinking",
        "fallbacks": ["google-antigravity/gemini-3-flash"]
      }
    }
  }
}
EOF
  fi
  echo "✅ Configuration generated"
fi

chmod 600 "$CONFIG_FILE"

# -----------------------------------------------------------------------------
# Workspace Seedling (Smart Sync)
# -----------------------------------------------------------------------------
# Copy workspace files only if they don't exist (-n) or are newer (-u)
if [ -d "/app/workspace-files" ]; then
  echo "Syncing workspace files..."
  cp -un /app/workspace-files/* "$WORKSPACE_DIR/" 2>/dev/null || true
fi

if [ -d "/app/skills" ]; then
  echo "Syncing repository skills..."
  mkdir -p "$WORKSPACE_DIR/skills"
  cp -run /app/skills/* "$WORKSPACE_DIR/skills/" 2>/dev/null || true
fi

# Ensure Librarian script is present
if [ -f "/app/scripts/librarian.py" ]; then
  mkdir -p "$WORKSPACE_DIR/scripts"
  cp -u /app/scripts/librarian.py "$WORKSPACE_DIR/scripts/"
fi

# -----------------------------------------------------------------------------
# Librarian & Cron Setup
# -----------------------------------------------------------------------------
# Register the librarian cron job if it doesn't exist
if command -v openclaw >/dev/null 2>&1; then
  if ! openclaw cron list | grep -q "librarian"; then
    echo "Registering Librarian cron job..."
    openclaw cron add --name "librarian" \
      --description "Automated knowledge distillation" \
      --every 12h \
      --message "Run python3 /root/openclaw-workspace/scripts/librarian.py" \
      --session isolated \
      --model "google-antigravity/gemini-3-flash" \
      --deliver --channel telegram --to "${TELEGRAM_OWNER_ID:-***REMOVED-TELEGRAM-ID***}" || true
  fi
fi

# -----------------------------------------------------------------------------
# Startup
# -----------------------------------------------------------------------------
ulimit -n 65535

# Extract token for banner
TOKEN=$(grep -o '"token": "[^"]*"' "$CONFIG_FILE" | head -n1 | cut -d'"' -f4)

echo ""
echo "=================================================================="
echo "🦞 OPENCLAW READY"
echo "=================================================================="
echo "Access Token: $TOKEN"
echo "Service URL:  https://${SERVICE_FQDN_OPENCLAW:-localhost}?token=$TOKEN"
echo "=================================================================="
echo ""

exec openclaw gateway run
