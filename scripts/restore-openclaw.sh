#!/bin/bash
# OpenClaw Restore Script
# Restores configuration and data from backup

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo "Usage: $0 <backup-file.tar.gz>"
    echo ""
    echo "Available backups:"
    ls -lh /home/node/openclaw-backups/*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}Error: Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

# Volume paths
CONFIG_VOLUME="/var/lib/docker/volumes/qsw0sgsgwcog4wg88g448sgs_openclaw-config/_data"
WORKSPACE_VOLUME="/var/lib/docker/volumes/qsw0sgsgwcog4wg88g448sgs_openclaw-workspace/_data"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}OpenClaw Restore Script${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Backup file: ${BACKUP_FILE}${NC}"
echo -e "${YELLOW}This will restore configuration and data.${NC}\n"

# Confirmation prompt
read -p "Are you sure you want to restore? This will overwrite current config! (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}Restore cancelled.${NC}"
    exit 0
fi

# Stop container before restore
echo -e "\n${YELLOW}[1/5] Stopping OpenClaw container...${NC}"
CONTAINER_NAME=$(docker ps --filter name=openclaw-qsw --format '{{.Names}}' | head -1)
if [ -n "$CONTAINER_NAME" ]; then
    docker stop "$CONTAINER_NAME"
    echo -e "${GREEN}✓ Container stopped${NC}"
else
    echo -e "${YELLOW}⚠ No running container found${NC}"
fi

# Extract backup
echo -e "${YELLOW}[2/5] Extracting backup...${NC}"
TEMP_DIR=$(mktemp -d)
tar -xzf "${BACKUP_FILE}" -C "${TEMP_DIR}"
BACKUP_DIR=$(find "${TEMP_DIR}" -maxdepth 1 -type d ! -path "${TEMP_DIR}" | head -1)
echo -e "${GREEN}✓ Backup extracted to ${TEMP_DIR}${NC}"

# Restore openclaw.json
echo -e "${YELLOW}[3/5] Restoring openclaw.json...${NC}"
if [ -f "${BACKUP_DIR}/openclaw.json" ]; then
    # Create backup of current config
    if [ -f "${CONFIG_VOLUME}/openclaw.json" ]; then
        cp "${CONFIG_VOLUME}/openclaw.json" "${CONFIG_VOLUME}/openclaw.json.before-restore-$(date +%Y%m%d-%H%M%S)"
    fi
    cp "${BACKUP_DIR}/openclaw.json" "${CONFIG_VOLUME}/openclaw.json"
    echo -e "${GREEN}✓ openclaw.json restored${NC}"
else
    echo -e "${RED}✗ openclaw.json not found in backup!${NC}"
fi

# Restore credentials
echo -e "${YELLOW}[4/5] Restoring credentials...${NC}"
if [ -d "${BACKUP_DIR}/credentials" ]; then
    # Backup current credentials
    if [ -d "${CONFIG_VOLUME}/credentials" ]; then
        mv "${CONFIG_VOLUME}/credentials" "${CONFIG_VOLUME}/credentials.before-restore-$(date +%Y%m%d-%H%M%S)"
    fi
    cp -r "${BACKUP_DIR}/credentials" "${CONFIG_VOLUME}/"
    echo -e "${GREEN}✓ Credentials restored${NC}"
else
    echo -e "${RED}✗ Credentials not found in backup!${NC}"
fi

# Restore workspace files
echo -e "${YELLOW}[5/5] Restoring workspace files...${NC}"
if [ -d "${BACKUP_DIR}/workspace" ]; then
    cp -r "${BACKUP_DIR}/workspace/"* "${WORKSPACE_VOLUME}/"
    echo -e "${GREEN}✓ Workspace files restored${NC}"
else
    echo -e "${YELLOW}⚠ Workspace files not found in backup${NC}"
fi

# Cleanup temp directory
rm -rf "${TEMP_DIR}"

# Restart container
echo -e "\n${YELLOW}Restarting OpenClaw container...${NC}"
if [ -n "$CONTAINER_NAME" ]; then
    docker start "$CONTAINER_NAME"
    echo -e "${GREEN}✓ Container restarted${NC}"
fi

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Restore Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Restored from: ${BACKUP_FILE}"
echo -e "Completed: $(date)"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Verify configuration: docker exec <container> openclaw status"
echo -e "2. Check security audit: docker exec <container> openclaw security audit --deep"
echo -e "3. Test functionality by sending a message to the bot\n"

exit 0
