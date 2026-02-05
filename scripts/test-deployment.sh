#!/bin/bash
# =============================================================================
# OpenClaw Deployment Test Script
# =============================================================================
# Tests basic functionality after deployment
# Usage: ./scripts/test-deployment.sh [container-name]

set -e

CONTAINER_NAME="${1:-$(docker ps --filter name=openclaw-qsw --format '{{.Names}}' | head -1)}"

if [ -z "$CONTAINER_NAME" ]; then
    echo "❌ No OpenClaw container found"
    exit 1
fi

echo "🧪 Testing OpenClaw deployment: $CONTAINER_NAME"
echo ""

# Test 1: Container is running
echo "1️⃣ Checking container status..."
if docker ps --filter name="$CONTAINER_NAME" --format '{{.Status}}' | grep -q "Up"; then
    echo "   ✅ Container is running"
else
    echo "   ❌ Container is not running"
    exit 1
fi

# Test 2: OpenClaw status
echo ""
echo "2️⃣ Checking OpenClaw status..."
if docker exec "$CONTAINER_NAME" openclaw status >/dev/null 2>&1; then
    echo "   ✅ OpenClaw is responding"
else
    echo "   ❌ OpenClaw status check failed"
    exit 1
fi

# Test 3: Health check
echo ""
echo "3️⃣ Running health check..."
if docker exec "$CONTAINER_NAME" openclaw health >/dev/null 2>&1; then
    echo "   ✅ Health check passed"
else
    echo "   ⚠️ Health check failed (may be normal during startup)"
fi

# Test 4: Config file exists
echo ""
echo "4️⃣ Checking configuration..."
if docker exec "$CONTAINER_NAME" test -f /root/.openclaw/openclaw.json; then
    echo "   ✅ Configuration file exists"
    
    # Check config permissions
    PERMS=$(docker exec "$CONTAINER_NAME" stat -c %a /root/.openclaw/openclaw.json)
    if [ "$PERMS" = "600" ]; then
        echo "   ✅ Configuration permissions correct (600)"
    else
        echo "   ⚠️ Configuration permissions: $PERMS (expected 600)"
    fi
else
    echo "   ❌ Configuration file missing"
    exit 1
fi

# Test 5: Workspace exists
echo ""
echo "5️⃣ Checking workspace..."
if docker exec "$CONTAINER_NAME" test -d /root/openclaw-workspace; then
    echo "   ✅ Workspace directory exists"
else
    echo "   ❌ Workspace directory missing"
    exit 1
fi

# Test 6: Skills loaded
echo ""
echo "6️⃣ Checking skills..."
SKILLS=$(docker exec "$CONTAINER_NAME" ls /root/openclaw-workspace/skills/ 2>/dev/null | wc -l)
if [ "$SKILLS" -gt 0 ]; then
    echo "   ✅ Skills found: $SKILLS"
    docker exec "$CONTAINER_NAME" ls /root/openclaw-workspace/skills/ | sed 's/^/      - /'
else
    echo "   ⚠️ No skills found in workspace"
fi

# Test 7: Plugins loaded
echo ""
echo "7️⃣ Checking plugins..."
if docker exec "$CONTAINER_NAME" openclaw plugins list 2>/dev/null | grep -q "telegram-enhanced"; then
    echo "   ✅ telegram-enhanced plugin loaded"
else
    echo "   ⚠️ telegram-enhanced plugin not found"
fi

# Test 8: Models configured
echo ""
echo "8️⃣ Checking model configuration..."
PRIMARY_MODEL=$(docker exec "$CONTAINER_NAME" openclaw config get agents.defaults.model.primary 2>/dev/null || echo "")
if [ -n "$PRIMARY_MODEL" ]; then
    echo "   ✅ Primary model: $PRIMARY_MODEL"
else
    echo "   ⚠️ Could not read primary model"
fi

# Test 9: OAuth accounts
echo ""
echo "9️⃣ Checking OAuth accounts..."
OAUTH_COUNT=$(docker exec "$CONTAINER_NAME" openclaw models status 2>/dev/null | grep -c "google-antigravity:" || echo "0")
if [ "$OAUTH_COUNT" -gt 0 ]; then
    echo "   ✅ OAuth accounts found: $OAUTH_COUNT"
else
    echo "   ⚠️ No OAuth accounts found (may need to authenticate)"
fi

# Test 10: Docker socket proxy
echo ""
echo "🔟 Checking Docker socket proxy..."
if docker exec "$CONTAINER_NAME" docker version >/dev/null 2>&1; then
    echo "   ✅ Docker socket proxy working"
else
    echo "   ❌ Docker socket proxy not accessible"
    exit 1
fi

# Summary
echo ""
echo "=================================================================="
echo "✅ All critical tests passed!"
echo "=================================================================="
echo ""
echo "Container: $CONTAINER_NAME"
echo "Status: $(docker ps --filter name="$CONTAINER_NAME" --format '{{.Status}}')"
echo ""
echo "Next steps:"
echo "  - Access dashboard: ***REMOVED-URL***?token=<your-token>"
echo "  - Check logs: docker logs -f $CONTAINER_NAME"
echo "  - Test Telegram: Send message to ***REMOVED-BOT***"
echo ""
