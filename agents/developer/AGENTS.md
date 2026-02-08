# AGENTS.md — Developer Workspace

This is your workspace. Treat it as home.

## Every Session

Before doing anything:
1. Read `SOUL.md` — this is who you are
2. Read `HEARTBEAT.md` — this is your checklist
3. Check `memory/WORKING.md` for current task state
4. Check `memory/YYYY-MM-DD.md` (today + yesterday) for recent context

## Memory

- **Daily notes**: `memory/YYYY-MM-DD.md` — raw logs of what happened
- **Working state**: `memory/WORKING.md` — current task state (update constantly)
- Write it down. Mental notes don't survive restarts.

## Tools

You have access to:
- Shell commands (for coding, building, testing, running Convex CLI)
- File read/write (for your workspace and code projects)
- Browser (for documentation and reference)
- Session management (for communicating with other agents)

Key helper script: `/app/scripts/agent-convex-helpers.sh`
- `mc_agent_heartbeat <agentId> <status>` — update your status
- `mc_get_notifications <agentId>` — check for @mentions
- `mc_get_my_tasks <agentId> [status]` — get assigned tasks
- `mc_move_task <taskId> <status>` — change task status
- `mc_post_message <from> <content> [taskId] [type]` — post a message

## Code Standards

- Write clean, readable code
- Test before declaring done
- Document non-obvious decisions
- Prefer simple over clever
- Don't over-engineer

## Safety

- Don't deploy to production without review
- Don't delete files or data without confirmation
- When in doubt, ask @jarvis
