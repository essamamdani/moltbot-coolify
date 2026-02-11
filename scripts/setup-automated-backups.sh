#!/bin/bash
# Setup Automated Backups for OpenClaw
# Configures daily backups via cron and optional off-site sync

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}OpenClaw Automated Backup Setup${NC}"
echo -e "${GREEN}========================================${NC}\n"

# 1. Make backup script executable
echo -e "${YELLOW}[1/4] Making backup script executable...${NC}"
chmod +x /root/openclaw-coolify/scripts/backup-openclaw.sh
chmod +x /root/openclaw-coolify/scripts/restore-openclaw.sh
echo -e "${GREEN}✓ Scripts are now executable${NC}"

# 2. Create backup directory
echo -e "${YELLOW}[2/4] Creating backup directory...${NC}"
mkdir -p /root/openclaw-backups
echo -e "${GREEN}✓ Backup directory created: /root/openclaw-backups${NC}"

# 3. Setup cron job for daily backups
echo -e "${YELLOW}[3/4] Setting up daily cron job...${NC}"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "backup-openclaw.sh"; then
    echo -e "${YELLOW}⚠ Cron job already exists. Skipping...${NC}"
else
    # Add cron job (runs daily at 3 AM)
    (crontab -l 2>/dev/null; echo "0 3 * * * /root/openclaw-coolify/scripts/backup-openclaw.sh >> /var/log/openclaw-backup.log 2>&1") | crontab -
    echo -e "${GREEN}✓ Cron job added (runs daily at 3 AM)${NC}"
fi

# 4. Run initial backup
echo -e "${YELLOW}[4/4] Running initial backup...${NC}"
/root/openclaw-coolify/scripts/backup-openclaw.sh

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${GREEN}Automated backups configured:${NC}"
echo -e "• Backup script: /root/openclaw-coolify/scripts/backup-openclaw.sh"
echo -e "• Backup location: /root/openclaw-backups/"
echo -e "• Schedule: Daily at 3:00 AM"
echo -e "• Retention: 30 days"
echo -e "• Log file: /var/log/openclaw-backup.log\n"

echo -e "${YELLOW}View cron jobs:${NC}"
echo -e "  crontab -l\n"

echo -e "${YELLOW}View backup log:${NC}"
echo -e "  tail -f /var/log/openclaw-backup.log\n"

echo -e "${YELLOW}List backups:${NC}"
echo -e "  ls -lh /root/openclaw-backups/\n"

echo -e "${YELLOW}Restore from backup:${NC}"
echo -e "  /root/openclaw-coolify/scripts/restore-openclaw.sh /root/openclaw-backups/<backup-file>.tar.gz\n"

echo -e "${GREEN}========================================${NC}\n"

exit 0
