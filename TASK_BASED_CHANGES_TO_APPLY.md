# Task-Based Model Changes - Safe Application Guide

## Current Status
✅ **System is RESTORED and WORKING** with original configuration
✅ All custom settings preserved
✅ All OAuth profiles active
✅ Telegram connected
✅ 2 active sessions

## Changes Needed (Safe to Apply)

These changes will ONLY modify model assignment without touching any other settings:

### 1. Add Gemini Flash to Fallback Chain
**Current:**
```json
"fallbacks": [
  "mistral/mistral-large-latest",
  "mistral/codestral-latest"
]
```

**Change to:**
```json
"fallbacks": [
  "google-antigravity/gemini-3-flash",
  "mistral/mistral-large-latest",
  "mistral/codestral-latest"
]
```

### 2. Add Model Aliases
**Current:**
```json
"models": {
  "google-antigravity/claude-opus-4-5-thinking": {},
  "google-antigravity/gemini-3-flash": {}
}
```

**Change to:**
```json
"models": {
  "google-antigravity/claude-opus-4-5-thinking": { "alias": "opus" },
  "google-antigravity/gemini-3-flash": { "alias": "flash" },
  "mistral/mistral-large-latest": { "alias": "mistral" },
  "mistral/codestral-latest": { "alias": "codestral" }
}
```

### 3. Update Heartbeat (30min + Gemini Flash)
**Current:**
```json
"heartbeat": {
  "every": "1h"
}
```

**Change to:**
```json
"heartbeat": {
  "every": "30m",
  "model": "google-antigravity/gemini-3-flash",
  "target": "last"
}
```

### 4. Add Sub-agents Config
**Current:**
```json
"subagents": {
  "maxConcurrent": 8
}
```

**Change to:**
```json
"subagents": {
  "model": "google-antigravity/gemini-3-flash",
  "maxConcurrent": 4,
  "archiveAfterMinutes": 60
}
```

### 5. Add Image Model Config
**Add this new section:**
```json
"imageModel": {
  "primary": "google-antigravity/gemini-3-flash",
  "fallbacks": ["google-antigravity/claude-opus-4-5-thinking"]
}
```

### 6. Remove Agent-Specific Override
**In `agents.list[0]`, remove:**
```json
"model": {
  "primary": "google-antigravity/gemini-3-flash",
  "fallbacks": ["google-antigravity/gemini-3-flash"]
}
```

## How to Apply Safely

### Option 1: Manual via Dashboard (SAFEST)
1. Access: ***REMOVED-URL***?token=***REMOVED-OLD-TOKEN***
2. Go to Config section
3. Make changes one by one
4. Test after each change

### Option 2: Via SSH (Direct Edit)
```bash
# Backup current config first
ssh ***REMOVED-VPS*** "sudo cp /var/lib/docker/volumes/qsw0sgsgwcog4wg88g448sgs_openclaw-config/_data/openclaw.json /var/lib/docker/volumes/qsw0sgsgwcog4wg88g448sgs_openclaw-config/_data/openclaw.json.before-task-based"

# Edit the file manually
ssh ***REMOVED-VPS*** "sudo nano /var/lib/docker/volumes/qsw0sgsgwcog4wg88g448sgs_openclaw-config/_data/openclaw.json"

# Restart gateway to apply
ssh ***REMOVED-VPS*** "sudo docker restart ***REMOVED-DEPLOYMENT-ID***-232538113867"
```

### Option 3: Wait for Next Deployment
The bootstrap script changes are already committed. On the NEXT fresh deployment (new container), the task-based config will be applied automatically.

## Verification Commands

After applying changes:

```bash
# Check models
ssh ***REMOVED-VPS*** "sudo docker exec <container> openclaw models status"

# Verify heartbeat
ssh ***REMOVED-VPS*** "sudo docker exec <container> openclaw config get agents.defaults.heartbeat"

# Verify sub-agents
ssh ***REMOVED-VPS*** "sudo docker exec <container> openclaw config get agents.defaults.subagents"

# Check aliases
ssh ***REMOVED-VPS*** "sudo docker exec <container> openclaw config get agents.defaults.models"
```

## Rollback Plan

If anything goes wrong:
```bash
# Restore from backup
ssh ***REMOVED-VPS*** "sudo cp /var/lib/docker/volumes/qsw0sgsgwcog4wg88g448sgs_openclaw-config/_data/openclaw.json.bak.1 /var/lib/docker/volumes/qsw0sgsgwcog4wg88g448sgs_openclaw-config/_data/openclaw.json"

# Restart
ssh ***REMOVED-VPS*** "sudo docker restart <container>"
```

## What NOT to Touch

❌ DO NOT modify:
- auth.profiles (OAuth accounts)
- channels.telegram settings
- tools.elevated settings
- approvals settings
- gateway.auth.token
- Any other custom settings

## Expected Benefits

Once applied:
- 💰 ~75% cost reduction (heartbeats + sub-agents use cheap Gemini Flash)
- 🚀 Faster heartbeat monitoring (30m vs 1h)
- 🎯 Better task assignment (right model for right job)
- 🔄 More resilient fallback chain
- ⚡ Quick model switching with aliases (/model flash, /model opus)

## Current System is SAFE

Your production system is currently running with the ORIGINAL working configuration. All settings are preserved. The task-based changes are optional optimizations that can be applied when you're ready.
