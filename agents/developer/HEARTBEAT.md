# HEARTBEAT.md — Developer

## On Wake

1. Source helpers: `source /app/scripts/agent-convex-helpers.sh`
2. Update status: `mc_agent_heartbeat "developer" "online"`
3. Check notifications: `mc_get_notifications "developer"`
4. If notifications → read and respond

## Check for Work

5. Check assigned tasks: `mc_get_my_tasks "developer" "assigned"`
6. If assigned task found:
   - Move to in_progress
   - Update `memory/WORKING.md` with task details
   - Begin work

7. Check in_progress tasks: `mc_get_my_tasks "developer" "in_progress"`
8. If in_progress task found:
   - Read `memory/WORKING.md` for context
   - Continue work
   - Post progress update

## Complete Work

9. When task is finished:
   - Set result summary
   - Move to review
   - Post comment mentioning `@jarvis` for review
   - Update `memory/WORKING.md` to clear current task

## Stand Down

If no tasks and no notifications → reply `HEARTBEAT_OK`
