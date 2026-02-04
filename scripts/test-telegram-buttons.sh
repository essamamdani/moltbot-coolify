#!/bin/bash
# Test script for Telegram inline buttons

set -e

echo "🧪 Testing Telegram Inline Buttons"
echo "=================================="
echo ""

# Check if container is running
CONTAINER_NAME=$(docker ps --filter "name=openclaw" --format "{{.Names}}" | head -n 1)

if [ -z "$CONTAINER_NAME" ]; then
    echo "❌ Error: No running OpenClaw container found"
    exit 1
fi

echo "✅ Found container: $CONTAINER_NAME"
echo ""

# Test 1: Check plugin is loaded
echo "Test 1: Checking if telegram-enhanced plugin is loaded..."
docker exec "$CONTAINER_NAME" openclaw plugins list | grep -q "telegram-enhanced" && \
    echo "✅ Plugin loaded" || \
    echo "❌ Plugin not found"
echo ""

# Test 2: Check plugin info
echo "Test 2: Getting plugin info..."
docker exec "$CONTAINER_NAME" openclaw plugins info telegram-enhanced
echo ""

# Test 3: Check Telegram channel status
echo "Test 3: Checking Telegram channel status..."
docker exec "$CONTAINER_NAME" openclaw channels status --channel telegram
echo ""

# Test 4: Send test message with buttons (requires target)
if [ -n "$1" ]; then
    TARGET="$1"
    echo "Test 4: Sending test message with buttons to $TARGET..."
    
    docker exec "$CONTAINER_NAME" openclaw message send \
        --channel telegram \
        --target "$TARGET" \
        --message "🧪 Test message with inline buttons" \
        --buttons '[[{"text":"✅ Test Passed","callback_data":"test:pass"},{"text":"❌ Test Failed","callback_data":"test:fail"}],[{"text":"ℹ️ More Info","url":"https://docs.openclaw.ai"}]]'
    
    echo "✅ Test message sent!"
else
    echo "Test 4: Skipped (no target provided)"
    echo "Usage: $0 <telegram_target>"
    echo "Example: $0 @username"
    echo "Example: $0 123456789"
fi

echo ""
echo "=================================="
echo "✅ Tests completed!"
echo ""
echo "To test manually:"
echo "1. Send a message to your bot in Telegram"
echo "2. Ask: 'Send me a message with buttons'"
echo "3. Or use: /buttons Do you want coffee?"
