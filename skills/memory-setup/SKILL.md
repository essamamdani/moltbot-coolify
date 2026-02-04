---
name: memory-setup
description: Enable and configure OpenClaw memory search for persistent context across sessions. Transforms agent from goldfish to elephant memory.
metadata:
  openclaw:
    emoji: 🧠
    requires:
      config: ["memorySearch.enabled"]
---

# Memory Setup Skill

Transform your agent from goldfish to elephant memory. This skill helps configure persistent memory for OpenClaw, enabling the agent to remember conversations, decisions, and context across sessions.

## What is Memory Search?

Memory search allows OpenClaw to:
- **Remember past conversations** across sessions
- **Recall decisions and context** from weeks/months ago
- **Track project history** and progress
- **Learn your preferences** over time
- **Build continuity** in long-term relationships

Without memory: Agent forgets everything between sessions, repeats questions, loses context.

With memory: Agent recalls past work, knows your preferences, tracks projects, builds relationships.

## Quick Setup

### 1. Enable Memory Search in Config

Add to `~/.openclaw/openclaw.json`:

```json
{
  "memorySearch": {
    "enabled": true,
    "provider": "gemini",
    "sources": ["memory", "sessions"],
    "indexMode": "hot",
    "minScore": 0.3,
    "maxResults": 20
  }
}
```

**Or use CLI:**
```bash
openclaw config set memorySearch.enabled true
openclaw config set memorySearch.provider gemini
openclaw config set memorySearch.sources '["memory", "sessions"]'
```

### 2. Create Memory Structure

In your workspace, create:

```
workspace/
├── MEMORY.md              # Long-term curated memory
└── memory/
    ├── logs/              # Daily logs (YYYY-MM-DD.md)
    ├── projects/          # Project-specific context
    ├── groups/            # Group chat context
    └── system/            # Preferences, setup notes
```

### 3. Initialize MEMORY.md

Create `MEMORY.md` in workspace root:

```markdown
# MEMORY.md — Long-Term Memory

## About [User Name]
- Key facts, preferences, context
- Communication style
- Goals and priorities

## Active Projects
- Project summaries and status
- Key decisions made
- Next steps

## Decisions & Lessons
- Important choices made
- Lessons learned
- What worked / didn't work

## Preferences
- Communication style
- Tools and workflows
- Favorite approaches
```

## Configuration Options

| Setting | Purpose | Recommended | Options |
|---------|---------|-------------|---------|
| `enabled` | Turn on memory search | `true` | true/false |
| `provider` | Embedding provider | `"gemini"` | voyage, openai, gemini, local |
| `sources` | What to index | `["memory", "sessions"]` | memory, sessions, both |
| `indexMode` | When to index | `"hot"` | hot (real-time), cold (on-demand) |
| `minScore` | Relevance threshold | `0.3` | 0.0-1.0 (lower = more results) |
| `maxResults` | Max snippets returned | `20` | 1-100 |

### Provider Options

**Gemini (Recommended for OpenClaw):**
```json
"provider": "gemini"
```
- Uses Google's Gemini embeddings
- Requires `GEMINI_API_KEY`
- Good quality, reasonable cost
- Works well with read-only filesystem

**Voyage AI:**
```json
"provider": "voyage"
```
- High-quality embeddings
- Requires `VOYAGE_API_KEY`
- Best accuracy

**OpenAI:**
```json
"provider": "openai"
```
- Uses OpenAI embeddings
- Requires `OPENAI_API_KEY`
- Good quality, higher cost

**Local (No API needed):**
```json
"provider": "local"
```
- ⚠️ Requires writable `/root/.node-llama-cpp`
- Won't work with read-only filesystem
- No API costs

### Source Options

**Memory only:**
```json
"sources": ["memory"]
```
- Only indexes MEMORY.md and memory/*.md files
- Curated, high-quality context
- Lower token usage

**Sessions only:**
```json
"sources": ["sessions"]
```
- Only indexes past conversation transcripts
- Full conversation history
- Higher token usage

**Both (Recommended):**
```json
"sources": ["memory", "sessions"]
```
- Complete context from both sources
- Best recall capability
- Balanced approach

## Daily Log Format

Create `memory/logs/YYYY-MM-DD.md` daily:

```markdown
# 2026-02-04 — Daily Log

## 10:30 — Fixed SearXNG Network
- Changed sandbox network to openclaw-internal
- Web search now working in sandboxes
- Tested with "OpenClaw" query

## 14:15 — Enabled Elevated Mode
- Set tools.elevated.enabled: true
- User can control via /elevated command
- Approved commands run on gateway host

## Follow-ups
- Monitor memory usage after changes
- Test browser automation with real sites
```

## Verification

Test memory is working:

**1. Check config:**
```bash
openclaw config get memorySearch
```

**2. Test search:**
```
User: "What do you remember about [past topic]?"
Agent: [Should search memory and return relevant context]
```

## Troubleshooting

### Memory search not working?

**Check configuration:**
```bash
openclaw config get memorySearch.enabled
# Should return: true
```

**Verify MEMORY.md exists:**
```bash
ls -la ~/openclaw-workspace/MEMORY.md
```

**Restart gateway:**
```bash
openclaw gateway restart
```

### Results not relevant?

**Lower threshold for more results:**
```bash
openclaw config set memorySearch.minScore 0.2
```

**Increase max results:**
```bash
openclaw config set memorySearch.maxResults 30
```

## Why This Matters

**Without memory:**
- ❌ Agent forgets everything between sessions
- ❌ Repeats questions you've already answered
- ❌ Loses context on ongoing projects
- ❌ No continuity or relationship building

**With memory:**
- ✅ Recalls past conversations and decisions
- ✅ Knows your preferences and style
- ✅ Tracks project history and progress
- ✅ Builds continuity over time

Goldfish 🐠 → Elephant 🐘
