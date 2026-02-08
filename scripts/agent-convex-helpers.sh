#!/usr/bin/env bash
# Agent helper functions for interacting with Mission Control (Convex)
# Source this file in agent HEARTBEAT scripts:
#   source /app/scripts/agent-convex-helpers.sh

CONVEX_URL="${CONVEX_URL:-}"

_mc_run() {
  local func="$1"
  shift
  if [ -n "$CONVEX_URL" ]; then
    npx convex run "$func" "$@" 2>/dev/null
  else
    echo '[]'
  fi
}

# Update agent heartbeat status
# Usage: mc_agent_heartbeat <agentId> [status]
mc_agent_heartbeat() {
  local agent_id="$1"
  local status="${2:-online}"
  _mc_run agents:heartbeat --args "{\"agentId\":\"$agent_id\",\"status\":\"$status\"}"
}

# Get unread notifications for an agent
# Usage: mc_get_notifications <agentId>
mc_get_notifications() {
  local agent_id="$1"
  _mc_run notifications:getUnread --args "{\"agentId\":\"$agent_id\"}"
}

# Get tasks assigned to an agent, optionally filtered by status
# Usage: mc_get_my_tasks <agentId> [status]
mc_get_my_tasks() {
  local agent_id="$1"
  local status="${2:-}"
  if [ -n "$status" ]; then
    _mc_run tasks:getByAssignee --args "{\"agentId\":\"$agent_id\",\"status\":\"$status\"}"
  else
    _mc_run tasks:getByAssignee --args "{\"agentId\":\"$agent_id\"}"
  fi
}

# Create a new task
# Usage: mc_create_task <title> <description> <assignee> [priority] [creator]
mc_create_task() {
  local title="$1"
  local desc="$2"
  local assignee="$3"
  local priority="${4:-medium}"
  local creator="${5:-jarvis}"
  _mc_run tasks:create --args "{\"title\":\"$title\",\"description\":\"$desc\",\"assignedTo\":\"$assignee\",\"priority\":\"$priority\",\"createdBy\":\"$creator\"}"
}

# Move a task to a new status
# Usage: mc_move_task <taskId> <status> [agentId]
mc_move_task() {
  local task_id="$1"
  local new_status="$2"
  local agent_id="${3:-}"
  if [ -n "$agent_id" ]; then
    _mc_run tasks:updateStatus --args "{\"taskId\":\"$task_id\",\"status\":\"$new_status\",\"agentId\":\"$agent_id\"}"
  else
    _mc_run tasks:updateStatus --args "{\"taskId\":\"$task_id\",\"status\":\"$new_status\"}"
  fi
}

# Post a message to Mission Control
# Usage: mc_post_message <from> <content> [taskId] [type]
mc_post_message() {
  local from="$1"
  local content="$2"
  local task_id="${3:-}"
  local msg_type="${4:-update}"
  if [ -n "$task_id" ]; then
    _mc_run messages:send --args "{\"from\":\"$from\",\"content\":\"$content\",\"taskId\":\"$task_id\",\"type\":\"$msg_type\"}"
  else
    _mc_run messages:send --args "{\"from\":\"$from\",\"content\":\"$content\",\"type\":\"$msg_type\"}"
  fi
}

# Mark a notification as read
# Usage: mc_mark_read <notificationId>
mc_mark_read() {
  local notif_id="$1"
  _mc_run notifications:markRead --args "{\"notificationId\":\"$notif_id\"}"
}
