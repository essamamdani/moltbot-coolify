# Production Safety Rules - Quick Reference

## 🚨 GOLDEN RULES

### Rule #1: NEVER DELETE PRODUCTION FILES
**EVER. NO EXCEPTIONS.**

Instead:
- ✅ Rename with timestamp: `mv file.json file.json.backup-$(date +%Y%m%d-%H%M%S)`
- ✅ Copy before editing: `cp file.json file.json.backup && edit file.json`
- ✅ Use sed/jq for in-place edits
- ❌ NEVER use `rm` on production files

### Rule #2: ALWAYS BACKUP FIRST
Before ANY change:
```bash
# Create timestamped backup
sudo cp /path/to/file /path/to/file.backup-$(date +%Y%m%d-%H%M%S)

# Verify backup exists
ls -la /path/to/file.backup-*

# Then make changes
```

### Rule #3: VERIFY BEFORE ACTING
Before making changes:
1. Read the file
2. Understand what it does
3. Check what depends on it
4. Identify consequences
5. Plan rollback
6. Get user approval
7. THEN act

### Rule #4: TEST ROLLBACK FIRST
Before applying a fix:
```bash
# Test that you CAN restore
sudo cp /path/to/file.backup /path/to/file.test-restore
sudo diff /path/to/file.backup /path/to/file.test-restore

# If diff shows nothing, rollback works
```

## 🔥 SACRED FILES (NEVER DELETE)

These files contain critical data that CANNOT be regenerated:

```
/root/.openclaw/openclaw.json              # Main config (OAuth, channels, settings)
/root/.openclaw/openclaw.json.bak.*        # Backups
/root/.openclaw/agents/*/agent.json        # Agent configs
/root/.openclaw/credentials/*              # Auth credentials
/root/.openclaw/channels/*                 # Channel configs
/root/.openclaw/agents/*/auth-profiles.json # OAuth tokens
```

**If you touch these files without backup, you will:**
- Lose OAuth profiles (9 accounts)
- Lose channel configurations
- Lose custom settings
- Break the system
- Risk user's job

## ✅ SAFE OPERATIONS

### Reading (Always Safe)
```bash
cat /root/.openclaw/openclaw.json
jq . /root/.openclaw/openclaw.json
openclaw config get
openclaw status
```

### Backing Up (Always Do This First)
```bash
# Backup with timestamp
sudo cp /root/.openclaw/openclaw.json \
  /root/.openclaw/openclaw.json.backup-$(date +%Y%m%d-%H%M%S)

# Backup to volume
sudo cp /var/lib/docker/volumes/.../openclaw.json \
  /var/lib/docker/volumes/.../openclaw.json.backup-manual
```

### Modifying (After Backup)
```bash
# Option 1: Edit in-place with jq
jq '.agents.defaults.heartbeat.every = "30m"' openclaw.json > /tmp/new.json
cat /tmp/new.json > openclaw.json

# Option 2: Use openclaw CLI
openclaw config set agents.defaults.heartbeat.every "30m"

# Option 3: Rename and recreate
mv openclaw.json openclaw.json.old
# Create new file
```

### Restoring (When Things Go Wrong)
```bash
# Find latest backup
ls -lt /root/.openclaw/*.json* | head -5

# Restore from backup
sudo cp /root/.openclaw/openclaw.json.bak.1 \
  /root/.openclaw/openclaw.json

# Restart to apply
sudo docker restart <container-name>
```

## ❌ DANGEROUS OPERATIONS

### NEVER DO THESE:
```bash
# ❌ Delete config files
rm /root/.openclaw/openclaw.json

# ❌ Delete without backup
rm -f /root/.openclaw/*.json

# ❌ Overwrite without backup
echo '{}' > /root/.openclaw/openclaw.json

# ❌ Delete credentials
rm -rf /root/.openclaw/credentials

# ❌ Delete in Docker volumes
sudo rm /var/lib/docker/volumes/.../openclaw.json
```

## 🛡️ INCIDENT RESPONSE

### If You Accidentally Deleted a File:

**IMMEDIATE ACTIONS:**
1. **STOP** - Don't make it worse
2. **CHECK BACKUPS** - Look for .bak files
   ```bash
   ls -la /root/.openclaw/*.json*
   sudo ls -la /var/lib/docker/volumes/*/openclaw-config/_data/*.json*
   ```
3. **RESTORE** - Copy backup to original location
   ```bash
   sudo cp /path/to/backup.json /path/to/original.json
   ```
4. **VERIFY** - Check file contents
   ```bash
   cat /path/to/original.json | jq .
   ```
5. **RESTART** - Reload configuration
   ```bash
   sudo docker restart <container-name>
   ```
6. **TEST** - Verify system works
   ```bash
   openclaw status
   openclaw models status
   ```

### If No Backup Exists:

**YOU'RE IN TROUBLE. But try this:**
1. Check Docker volume backups
2. Check container logs for config dumps
3. Check if file is in trash/recycle bin
4. Ask user if they have a backup
5. Recreate from documentation (last resort)

## 📋 PRE-CHANGE CHECKLIST

Before making ANY production change:

- [ ] I have read and understood the current configuration
- [ ] I have created a timestamped backup
- [ ] I have verified the backup is readable
- [ ] I have identified all dependencies
- [ ] I have a tested rollback plan
- [ ] I have explained the change to the user
- [ ] I have received explicit user approval
- [ ] I am NOT using `rm` command
- [ ] I know exactly what will happen
- [ ] I can restore in under 60 seconds if needed

**If ANY checkbox is unchecked, STOP and complete it first.**

## 🎯 REMEMBER

> **"Backups are cheap. Downtime is expensive. User's job is priceless."**

> **"When in doubt, don't delete. Rename, backup, or ask."**

> **"Every production file is sacred until proven otherwise."**

> **"The best fix is the one that doesn't break anything."**

## 📞 EMERGENCY CONTACTS

**If you break production:**
1. Restore from backup immediately
2. Document what happened
3. Inform user honestly
4. Learn from the mistake
5. Update this document

**User's Priority:** Their job depends on this system working.

**Your Priority:** Keep the system working, no matter what.

---

**Last Updated:** After critical incident on 2026-02-05
**Reason:** Deleted openclaw.json, lost OAuth profiles, broke production
**Lesson:** NEVER delete production files without exhaustive validation
