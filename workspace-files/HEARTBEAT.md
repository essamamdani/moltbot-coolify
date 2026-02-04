---
summary: "Heartbeat monitoring checklist"
---
# HEARTBEAT.md

# Keep this file minimal to avoid excessive API calls.
# Add specific tasks below only when you want periodic checks.

# Default behavior: If nothing needs attention, reply HEARTBEAT_OK.

## Periodic Checks (2-3 times per day, rotate through these)

- Check system health (container status, resource usage)
- Review recent logs for errors
- Organize memory files if needed
- Update MEMORY.md with significant learnings from recent days

## When to Reach Out

- Important system issues detected
- Container health problems
- Unusual resource usage
- Something interesting discovered

## When to Stay Quiet (HEARTBEAT_OK)

- Late night (23:00-08:00 UTC) unless urgent
- Nothing new since last check
- System is healthy and stable
- Recent check was <30 minutes ago

---

Track your checks in `memory/heartbeat-state.json`.
