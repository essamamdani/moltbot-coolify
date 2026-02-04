---
name: memory-setup
description: Enable and configure OpenClaw memory search for persistent context. Use when setting up memory, fixing memory issues, or helping configure memorySearch. Covers MEMORY.md, daily logs, and vector search setup.
metadata:
  openclaw:
    emoji: 🧠
    requires:
      bins: []
---

# Memory Setup Skill

Enable persistent memory for OpenClaw agents. Transform from goldfish to elephant.

## Quick Setup

### 1. Enable Memory Search in Config

Memory search is **enabled by default** in OpenClaw. To customize, add to `~/.openclaw/openclaw.json`:

```json
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "enabled": true,
        "provider": "local",
        "fallback": "none",
        "sources": ["memory", "sessions"]
      }
    }
  }
}
```

### 2. Memory Structure (Already Created)

Your workspace already has:

```
/root/openclaw-workspace/
├── MEMORY.md              # Long-term curated memory
└── memory/
    ├── YYYY-MM-DD.md      # Daily logs
    └── heartbeat-state.json
```

### 3. Verify Memory is Working

Check memory status:
```bash
openclaw memory status
```

Reindex if needed:
```bash
openclaw memory index
```

## Config Options

| Setting | Purpose | Default | Recommended |
|---------|---------|---------|-------------|
| `enabled` | Turn on memory search | `true` | `true` |
| `provider` | Embedding provider | `local` | `local` (no API cost) |
| `fallback` | Fallback if provider fails | `openai` | `none` (stay local) |
| `sources` | What to index | `["memory"]` | `["memory", "sessions"]` |

### Provider Options
- `local` — Local embeddings (no API, ~600MB model, recommended)
- `openai` — OpenAI embeddings (requires `OPENAI_API_KEY`)
- `gemini` — Gemini embeddings (requires `GEMINI_API_KEY`)

### Source Options
- `memory` — MEMORY.md + memory/*.md files only
- `sessions` — Past conversation transcripts
- `["memory", "sessions"]` — Full context (recommended)

## Daily Log Format

Create `memory/YYYY-MM-DD.md` daily:

```markdown
# YYYY-MM-DD — Daily Log

## [Time] — [Event/Task]
- What happened
- Decisions made
- Follow-ups needed

## [Time] — [Another Event]
- Details
```

## Agent Instructions (Already in AGENTS.md)

Your AGENTS.md already includes memory instructions. The agent should:
1. Read `MEMORY.md` in main sessions only (not shared contexts)
2. Read today + yesterday's daily logs on session start
3. Update `MEMORY.md` periodically with curated learnings

## Troubleshooting

### Memory search not working?
```bash
# Check status
openclaw memory status

# Check config
openclaw config get agents.defaults.memorySearch

# Reindex
openclaw memory index --verbose

# Restart gateway
openclaw gateway restart
```

### Provider errors?
- **Local provider fails**: Model auto-downloads (~600MB). Wait for download to complete.
- **OpenAI provider**: Set `OPENAI_API_KEY` environment variable
- **Gemini provider**: Set `GEMINI_API_KEY` environment variable
- **Recommended**: Use `local` provider with `fallback: "none"` to avoid API costs

### Index location
- Default: `~/.openclaw/memory/<agentId>.sqlite`
- Check with: `openclaw memory status`

## Full Config Example (Local, No API Costs)

```json
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "enabled": true,
        "provider": "local",
        "fallback": "none",
        "sources": ["memory", "sessions"],
        "local": {
          "modelPath": "hf:ggml-org/embeddinggemma-300M-GGUF/embeddinggemma-300M-Q8_0.gguf"
        }
      }
    }
  }
}
```

## Why This Matters

Without memory:
- Agent forgets everything between sessions
- Repeats questions, loses context
- No continuity on projects

With memory:
- Recalls past conversations
- Knows your preferences
- Tracks project history
- Builds relationship over time

Goldfish → Elephant. 🐘

## VPS Deployment Notes

For your Coolify deployment:
- Memory index stored in `openclaw-config` volume (persists across restarts)
- MEMORY.md and daily logs in `openclaw-workspace` volume (persists)
- Local embeddings model cached in container (downloads once)
- No additional API keys needed if using `local` provider
