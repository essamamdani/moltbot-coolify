#!/bin/bash
# OpenClaw Automated Backup Script
# Backs up critical configuration and data to multiple locations

set -e  # Exit on error

# Configuration
BACKUP_BASE_DIR="/root/openclaw-backups"
BACKUP_DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="${BACKUP_BASE_DIR}/${BACKUP_DATE}"
RETENTION_DAYS=30  # Keep backups for 30 days

# Volume paths
CONFIG_VOLUME="/var/lib/docker/volumes/qsw0sgsgwcog4wg88g448sgs_openclaw-config/_data"
WORKSPACE_VOLUME="/var/lib/docker/volumes/qsw0sgsgwcog4wg88g448sgs_openclaw-workspace/_data"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}OpenClaw Backup Script${NC}"
echo -e "${GREEN}Started: $(date)${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# 1. Backup openclaw.json (CRITICAL)
echo -e "${YELLOW}[1/6] Backing up openclaw.json...${NC}"
if [ -f "${CONFIG_VOLUME}/openclaw.json" ]; then
    cp "${CONFIG_VOLUME}/openclaw.json" "${BACKUP_DIR}/openclaw.json"
    echo -e "${GREEN}✓ openclaw.json backed up${NC}"
else
    echo -e "${RED}✗ openclaw.json not found!${NC}"
fi

# 2. Backup credentials directory (CRITICAL)
echo -e "${YELLOW}[2/6] Backing up credentials...${NC}"
if [ -d "${CONFIG_VOLUME}/credentials" ]; then
    cp -r "${CONFIG_VOLUME}/credentials" "${BACKUP_DIR}/credentials"
    echo -e "${GREEN}✓ Credentials backed up${NC}"
else
    echo -e "${RED}✗ Credentials directory not found!${NC}"
fi

# 3. Backup auth profiles (CRITICAL)
echo -e "${YELLOW}[3/6] Backing up auth profiles...${NC}"
if [ -d "${CONFIG_VOLUME}/agents" ]; then
    mkdir -p "${BACKUP_DIR}/auth-profiles"
    find "${CONFIG_VOLUME}/agents" -name "auth-profiles.json" -exec cp --parents {} "${BACKUP_DIR}/auth-profiles/" \;
    echo -e "${GREEN}✓ Auth profiles backed up${NC}"
else
    echo -e "${RED}✗ Agents directory not found!${NC}"
fi

# 4. Backup workspace files (IMPORTANT)
echo -e "${YELLOW}[4/6] Backing up workspace...${NC}"
if [ -d "${WORKSPACE_VOLUME}" ]; then
    # Backup key workspace files (not entire workspace to save space)
    mkdir -p "${BACKUP_DIR}/workspace"
    for file in AGENTS.md MEMORY.md SOUL.md USER.md TOOLS.md HEARTBEAT.md IDENTITY.md; do
        if [ -f "${WORKSPACE_VOLUME}/${file}" ]; then
            cp "${WORKSPACE_VOLUME}/${file}" "${BACKUP_DIR}/workspace/"
        fi
    done
    # Backup memory directory if exists
    if [ -d "${WORKSPACE_VOLUME}/memory" ]; then
        cp -r "${WORKSPACE_VOLUME}/memory" "${BACKUP_DIR}/workspace/"
    fi
    echo -e "${GREEN}✓ Workspace files backed up${NC}"
else
    echo -e "${RED}✗ Workspace directory not found!${NC}"
fi

# 5. Create compressed archive
echo -e "${YELLOW}[5/6] Creating compressed archive...${NC}"
cd "${BACKUP_BASE_DIR}"
tar -czf "${BACKUP_DATE}.tar.gz" "${BACKUP_DATE}"
ARCHIVE_SIZE=$(du -h "${BACKUP_DATE}.tar.gz" | cut -f1)
echo -e "${GREEN}✓ Archive created: ${BACKUP_DATE}.tar.gz (${ARCHIVE_SIZE})${NC}"

# 6. Cleanup old backups
echo -e "${YELLOW}[6/6] Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
find "${BACKUP_BASE_DIR}" -name "*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete
find "${BACKUP_BASE_DIR}" -maxdepth 1 -type d -mtime +${RETENTION_DAYS} ! -path "${BACKUP_BASE_DIR}" -exec rm -rf {} \;
REMAINING_BACKUPS=$(find "${BACKUP_BASE_DIR}" -name "*.tar.gz" | wc -l)
echo -e "${GREEN}✓ Cleanup complete. ${REMAINING_BACKUPS} backups remaining${NC}"

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Backup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Backup location: ${BACKUP_DIR}"
echo -e "Archive: ${BACKUP_DATE}.tar.gz (${ARCHIVE_SIZE})"
echo -e "Completed: $(date)"
echo -e "${GREEN}========================================${NC}\n"

# Optional: Send notification (uncomment if you want Telegram notifications)
# TELEGRAM_BOT_TOKEN="your-bot-token"
# TELEGRAM_CHAT_ID="your-chat-id"
# MESSAGE="✅ OpenClaw backup completed successfully\nDate: ${BACKUP_DATE}\nSize: ${ARCHIVE_SIZE}"
# curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
#      -d chat_id="${TELEGRAM_CHAT_ID}" \
#      -d text="${MESSAGE}" > /dev/null

exit 0
