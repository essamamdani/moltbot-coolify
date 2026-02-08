# HEARTBEAT.md — Jarvis

## On Wake

1. Source helpers: `source /app/scripts/agent-convex-helpers.sh`
2. Update status: `mc_agent_heartbeat "jarvis" "online"`
3. Check notifications: `mc_get_notifications "jarvis"`
4. If notifications → read and respond to each

## Task Triage

5. Check inbox tasks: `npx convex run tasks:listByStatus`
6. For each inbox task:
   - If coding/technical → assign to developer: `npx convex run tasks:assign '{"taskId":"<id>","assignedTo":"developer","agentId":"jarvis"}'`
   - If simple/coordination → assign to self and work on it
7. Post a comment explaining the assignment

## Review Queue

8. Check tasks in "review" status
9. For each review task:
   - Read the task result and any attached comments
   - If satisfactory → move to done: `npx convex run tasks:updateStatus '{"taskId":"<id>","status":"done","agentId":"jarvis"}'`
   - If needs work → post feedback comment, move back to in_progress

## Progress Check

10. Check in_progress tasks for stale work (no updates in recent heartbeats)
11. If stale → post a check-in comment to the assigned agent

## Stand Down

If nothing needs attention → reply `HEARTBEAT_OK`
