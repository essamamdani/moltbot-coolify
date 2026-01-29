#!/usr/bin/env bash
set -e

# State directories - Moltbot/Clawdbot overlap
# Binary might look for either depending on version
MOLT_STATE="/home/node/.moltbot"
CLAW_STATE="/home/node/.clawdbot"
CONFIG_FILE="$MOLT_STATE/moltbot.json"
WORKSPACE_DIR="/home/node/molt"

mkdir -p "$MOLT_STATE" "$CLAW_STATE" "$WORKSPACE_DIR"

# Ensure aliases work for interactive sessions
echo "alias fd=fdfind" >> /home/node/.bashrc
echo "alias bat=batcat" >> /home/node/.bashrc
echo "alias ll='ls -alF'" >> /home/node/.bashrc
echo "alias molty='moltbot'" >> /home/node/.bashrc
echo "alias clawd='moltbot'" >> /home/node/.bashrc

# Generate config on first boot
if [ ! -f "$CONFIG_FILE" ]; then
  if command -v openssl >/dev/null 2>&1; then
    TOKEN="$(openssl rand -hex 24)"
  else
    TOKEN="$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'))")"
  fi


cat >"$CONFIG_FILE" <<EOF
{
  "meta": {
    "lastTouchedVersion": "2026.1.24-3",
    "lastTouchedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  },
  "wizard": {
    "lastRunMode": "local",
    "lastRunAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "lastRunVersion": "2026.1.24-3",
    "lastRunCommand": "doctor"
  },
  "diagnostics": {
    "otel": {
      "enabled": true
    }
  },
  "update": {
    "channel": "stable"
  },
  "channels": {
    "whatsapp": {
      "dmPolicy": "pairing",
      "groupPolicy": "allowlist",
      "mediaMaxMb": 50,
      "debounceMs": 0
    },
    "telegram": {
      "enabled": true,
      "botToken": "${TELEGRAM_BOT_TOKEN:-}",
      "dmPolicy": "pairing",
      "groupPolicy": "allowlist",
      "streamMode": "partial"
    },
    "discord": {
      "dm": {
        "policy": "pairing"
      },
      "groupPolicy": "allowlist"
    },
    "googlechat": {
      "dm": {
        "policy": "pairing"
      },
      "groupPolicy": "allowlist"
    },
    "slack": {
      "mode": "socket",
      "webhookPath": "/slack/events",
      "userTokenReadOnly": true,
      "dm": {
        "policy": "pairing"
      },
      "groupPolicy": "allowlist"
    },
    "signal": {
      "dmPolicy": "pairing",
      "groupPolicy": "allowlist"
    },
    "imessage": {
      "dmPolicy": "pairing",
      "groupPolicy": "allowlist"
    }
  },
  "agents": {
    "defaults": {
      "workspace": "/home/node/molt",
      "compaction": {
        "mode": "safeguard"
      },
      "maxConcurrent": 4,
      "subagents": {
        "maxConcurrent": 8
      },
      "sandbox": {
        "mode": "non-main",
        "scope": "session"
      }
    },
    "list": [
      {
        "id": "main",
        "name": "Moltbot",
        "default": true,
        "workspace": "/home/node/molt"
      },
      {
        "id": "linkding",
        "name": "Linkding Agent",
        "workspace": "/home/node/molt-linkding"
      },
      {
        "id": "dbadmin",
        "name": "DB Administrator",
        "workspace": "/home/node/molt-dbadmin"
      }
    ]
  },
  "bindings": [],
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": ["main", "linkding", "dbadmin"]
    }
  },
  "messages": {
    "ackReactionScope": "group-mentions"
  },
  "commands": {
    "native": true,
    "nativeSkills": true,
    "text": true,
    "bash": true,
    "config": true,
    "debug": true,
    "restart": true,
    "useAccessGroups": true
  },
  "hooks": {
    "enabled": true,
    "token": "$TOKEN",
    "internal": {
      "enabled": true,
      "entries": {
        "boot-md": {
          "enabled": true
        },
        "command-logger": {
          "enabled": true
        },
        "session-memory": {
          "enabled": true
        }
      }
    }
  },
  "gateway": {
    "port": ${CLAWDBOT_GATEWAY_PORT:-18789},
    "mode": "local",
    "bind": "0.0.0.0",
    "controlUi": {
      "enabled": true,
      "allowInsecureAuth": false
    },
    "auth": {
      "mode": "token",
      "token": "$TOKEN"
    },
    "trustedProxies": [
      "*"
    ],
    "tailscale": {
      "mode": "off",
      "resetOnExit": false
    }
  },
  "skills": {
    "allowBundled": ["*"],
    "install": {
      "nodeManager": "npm"
    }
  },
  "plugins": {
    "entries": {
      "telegram": {
        "enabled": $([ -n "$TELEGRAM_BOT_TOKEN" ] && echo true || echo false)
      },
      "whatsapp": {
        "enabled": true
      },
      "discord": {
        "enabled": true
      },
      "googlechat": {
        "enabled": true
      },
      "slack": {
        "enabled": true
      },
      "signal": {
        "enabled": true
      },
      "imessage": {
        "enabled": true
      }
    }
  }
}
EOF
fi

# Update TOKEN if it was not set (e.g. if config already existed)
if [ -z "$TOKEN" ]; then
  TOKEN="$(jq -r '.gateway.auth.token' "$CONFIG_FILE" 2>/dev/null || jq -r '.gateway.auth.token' "$MOLT_STATE/clawdbot.json" 2>/dev/null || echo "")"
fi

# Ensure all possible naming variations exist on every boot for robustness
cp -f "$CONFIG_FILE" "$MOLT_STATE/clawdbot.json" 2>/dev/null || true
cp -f "$CONFIG_FILE" "$CLAW_STATE/moltbot.json" 2>/dev/null || true
cp -f "$CONFIG_FILE" "$CLAW_STATE/clawdbot.json" 2>/dev/null || true
ln -sf "$CONFIG_FILE" "$MOLT_STATE/config.json" 2>/dev/null || true
ln -sf "$CONFIG_FILE" "$CLAW_STATE/config.json" 2>/dev/null || true

# Seed Agent Workspaces
seed_agent() {
  local id="$1"
  local name="$2"
  local dir="/home/node/molt-$id"
  if [ "$id" = "main" ]; then dir="/home/node/molt"; fi

  if ! mkdir -p "$dir" 2>/dev/null; then
    echo "⚠️ WARNING: Could not create directory $dir. Check volume permissions."
    return 1
  fi

  if [ ! -f "$dir/AGENTS.md" ]; then
    if ! cat >"$dir/AGENTS.md" <<EOF; then
# AGENTS.md - $name
This is the workspace for $name.
EOF
      echo "⚠️ WARNING: Could not write to $dir/AGENTS.md. Permission denied."
    fi
  fi

  if [ ! -f "$dir/SOUL.md" ]; then
    case "$id" in
      linkding)
        cat >"$dir/SOUL.md" <<EOF
# SOUL.md - Linkding Agent
You are the Linkding Bookmark Assistant. Your primary goal is to help the user manage bookmarks.
EOF
        ;;
      dbadmin)
        cat >"$dir/SOUL.md" <<EOF
# SOUL.md - DB Administrator
You are the Database and Container Administrator. You monitor Postgres and manage SQLite subagent sandboxes.
EOF
        ;;
      *)
        cat >"$dir/SOUL.md" <<EOF
# SOUL.md - Moltbot
You are Moltbot, a helpful and premium AI assistant.
EOF
        ;;
    esac
  fi
}

seed_agent "main" "Moltbot"
seed_agent "linkding" "Linkding Agent"
seed_agent "dbadmin" "DB Administrator"

# Export state directory for the binary
export CLAWDBOT_STATE_DIR="$MOLT_STATE"
export MOLTBOT_STATE_DIR="$MOLT_STATE"

# Resolve public URL (Coolify injects SERVICE_URL_MOLTBOT_18789 or SERVICE_FQDN_MOLTBOT)
BASE_URL="${SERVICE_URL_MOLTBOT_18789:-${SERVICE_FQDN_MOLTBOT:+https://$SERVICE_FQDN_MOLTBOT}}"
BASE_URL="${BASE_URL:-http://localhost:18789}"

if [ "${CLAWDBOT_PRINT_ACCESS:-1}" = "1" ]; then
  if [ "${MOLT_BOT_BETA:-false}" = "true" ]; then
    echo "🧪 MOLTBOT BETA MODE ACTIVE"
  fi
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🦞 MOLTBOT READY"
  echo ""
  echo "Dashboard:"
  echo "$BASE_URL/?token=$TOKEN"
  echo ""
  echo "WebSocket:"
  echo "${BASE_URL/https/wss}/__clawdbot__/ws"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
fi

# Run the moltbot gateway using the global binary
exec moltbot gateway