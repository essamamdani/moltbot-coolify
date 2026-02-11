# Timezone Update - Asia/Kuwait

## Changes Made

Updated timezone to `Asia/Kuwait` (UTC+3) in:
- ✅ `docker-compose.yaml` - Browser service TZ environment variable
- ✅ `coolify-template.yaml` - Browser service TZ
- ✅ `.env.example` - Default TZ value
- ✅ `workspace-files/USER.md` - User timezone reference

## Deployment

Changes pushed to GitHub. Coolify will automatically rebuild with the new timezone.

## VPS Environment Variable (Optional)

If you want to set TZ in your Coolify environment variables (recommended):

1. Go to Coolify dashboard
2. Navigate to your OpenClaw project
3. Go to Environment Variables
4. Add or update:
   ```
   TZ=Asia/Kuwait
   ```
5. Restart deployment

This ensures the timezone is consistent across all services.

## What This Affects

- Browser service timestamps
- Log timestamps
- Scheduled tasks (cron, heartbeats)
- Date/time displays in OpenClaw

## Verification

After Coolify rebuild, verify timezone:

```bash
ssh netcup

# Check browser container timezone
BROWSER_CONTAINER=$(sudo docker ps --filter name=browser --format '{{.Names}}' | head -1)
sudo docker exec $BROWSER_CONTAINER date

# Should show Kuwait time (UTC+3)
```

---

**Date:** February 12, 2026
**Status:** Committed and pushed
**Next:** Coolify will rebuild automatically
