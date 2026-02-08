#!/usr/bin/env bash
# Mission Control Notification Daemon
# Polls Convex for undelivered notifications and delivers them
# to agent sessions via `openclaw sessions send`.
# Launched as a background process from bootstrap.sh.

set -euo pipefail

CONVEX_URL="${CONVEX_URL:-}"
POLL_INTERVAL="${MC_NOTIFICATION_POLL_INTERVAL:-5}"
LOG_DIR="/data/openclaw-workspace/logs"
LOG_FILE="$LOG_DIR/notification-daemon.log"
CONFIG_FILE="${OPENCLAW_STATE_DIR:-/data/.openclaw}/openclaw.json"

mkdir -p "$LOG_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

if [ -z "$CONVEX_URL" ]; then
  log "CONVEX_URL not set. Notification daemon disabled."
  exit 0
fi

log "Notification daemon started. Polling every ${POLL_INTERVAL}s."

# Dynamically read agent IDs from openclaw.json config
get_agent_ids() {
  if [ -f "$CONFIG_FILE" ]; then
    jq -r '.agents.list[]? | .id' "$CONFIG_FILE" 2>/dev/null | grep -v '^main$' || echo ""
  fi
}

while true; do
  NOTIFICATIONS=$(npx convex run notifications:getUndelivered 2>/dev/null || echo "[]")

  if [ "$NOTIFICATIONS" != "[]" ] && [ -n "$NOTIFICATIONS" ]; then
    # Get current agent list dynamically
    KNOWN_AGENTS=$(get_agent_ids)

    echo "$NOTIFICATIONS" | jq -c '.[]' 2>/dev/null | while read -r notif; do
      TARGET=$(echo "$notif" | jq -r '.targetAgent')
      CONTENT=$(echo "$notif" | jq -r '.content')
      NOTIF_ID=$(echo "$notif" | jq -r '._id')
      TYPE=$(echo "$notif" | jq -r '.type')

      # Construct session key dynamically
      SESSION_KEY="agent:${TARGET}:main"

      # Check if target agent exists in config
      if ! echo "$KNOWN_AGENTS" | grep -q "^${TARGET}$"; then
        log "Unknown agent target: $TARGET — skipping"
        continue
      fi

      # Deliver to agent session (fire-and-forget)
      if openclaw sessions send --session "$SESSION_KEY" --message "[MC:$TYPE] $CONTENT" 2>/dev/null; then
        # Mark as delivered in Convex
        npx convex run notifications:markDelivered --args "{\"notificationId\":\"$NOTIF_ID\"}" 2>/dev/null
        log "Delivered $TYPE notification to $TARGET"
      else
        log "Failed to deliver to $TARGET (agent may be asleep)"
      fi
    done
  fi

  sleep "$POLL_INTERVAL"
done
