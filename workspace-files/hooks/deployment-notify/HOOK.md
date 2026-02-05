---
name: deployment-notify
description: "Sends Telegram notification when new deployment completes"
homepage: https://github.com/amraly83/openclaw-coolify
metadata:
  openclaw:
    emoji: "🚀"
    events: ["gateway:startup"]
    requires:
      env: ["TELEGRAM_BOT_TOKEN"]
---

# Deployment Notification Hook

Sends a Telegram notification when a new deployment completes successfully.

## What It Does

- Detects gateway startup (new deployment)
- Collects deployment information (version, timestamp, container ID)
- Sends formatted notification to Telegram
- Includes quick action buttons

## Requirements

- Telegram bot token (`TELEGRAM_BOT_TOKEN` environment variable)
- Telegram channel configured

## Notification Format

```
🚀 Deployment Complete

Version: 2026.2.2-3
Time: 2026-02-05 10:30:00 UTC
Container: openclaw-xxx-123456
Status: ✅ Healthy

[View Dashboard] [Check Status]
```

## Configuration

No additional configuration needed. Uses existing Telegram channel configuration.

## Usage

Hook runs automatically on gateway startup. No manual intervention required.

## Disable

```bash
openclaw hooks disable deployment-notify
```
