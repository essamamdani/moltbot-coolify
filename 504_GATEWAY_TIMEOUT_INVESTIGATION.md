# 504 Gateway Timeout Investigation

## Issue Description

After every deployment, accessing `***REMOVED-URL***` results in a **504 Gateway Timeout** error. The issue is resolved by restarting the Coolify proxy (`coolify-proxy` container), but this is not a sustainable solution.

## Investigation Results

### ✅ What's Working

1. **Container is healthy:**
   ```
   ***REMOVED-DEPLOYMENT-ID***-224425322381  Up 2 minutes (healthy)  18789/tcp
   ```

2. **Service is responding locally:**
   ```bash
   curl http://10.0.1.14:18789/  # Returns HTML (200 OK)
   curl http://localhost:18789/  # Returns HTML (200 OK)
   ```

3. **Port is exposed:**
   ```
   "ExposedPorts": {
       "18789/tcp": {}
   }
   ```

4. **Networks are correct:**
   - Connected to `coolify` network (10.0.1.14)
   - Connected to internal network (10.0.9.4)
   - Has proper DNS aliases

5. **Traefik labels are present:**
   ```
   traefik.enable=true
   traefik.http.routers.http-0-qsw0sgsgwcog4wg88g448sgs-openclaw.rule=Host(`bot.appautomation.cloud`) && PathPrefix(`/`)
   traefik.http.routers.https-0-qsw0sgsgwcog4wg88g448sgs-openclaw.rule=Host(`bot.appautomation.cloud`) && PathPrefix(`/`)
   ```

### ❌ What's Missing

**CRITICAL:** The container is missing the **Traefik service port label**:

```
traefik.http.services.openclaw.loadbalancer.server.port=18789
```

Without this label, Traefik doesn't know which port to route traffic to, even though:
- The port is exposed
- The routers are configured
- The container is healthy

## Root Cause

**Traefik cannot determine the backend port** because:

1. The container exposes port `18789/tcp`
2. Traefik sees the router rules (HTTP/HTTPS)
3. But Traefik doesn't know which port to forward to
4. Result: Traefik times out trying to connect

When you restart `coolify-proxy`, Traefik re-scans all containers and **sometimes** correctly infers the port from the exposed ports. But this is unreliable and depends on timing.

## Why Restarting Proxy "Fixes" It

When you restart `coolify-proxy`:
1. Traefik re-reads all container labels
2. Traefik re-scans exposed ports
3. Traefik **may** auto-detect port 18789 as the backend
4. Routing starts working

But this is **not guaranteed** and depends on:
- Container startup order
- Traefik's port detection heuristics
- Whether other containers are also exposing ports

## The Fix

Add the missing Traefik service label to explicitly tell Traefik which port to use:

```yaml
labels:
  - "traefik.http.services.openclaw.loadbalancer.server.port=18789"
```

This ensures Traefik **always** knows where to route traffic, regardless of:
- Container restart order
- Proxy restarts
- Other containers on the network

## Additional Improvements

While investigating, I also found these potential improvements:

### 1. Increase Healthcheck Start Period

Current: `60s`
Recommended: `90s`

**Why:** OpenClaw bootstrap takes time:
- Building sandbox images
- Copying skills
- Starting Telegram bot
- Initializing gateway

A longer start period prevents premature "unhealthy" status.

### 2. Add Traefik Health Check

```yaml
labels:
  - "traefik.http.services.openclaw.loadbalancer.healthcheck.path=/"
  - "traefik.http.services.openclaw.loadbalancer.healthcheck.interval=30s"
```

**Why:** Traefik can independently verify the backend is responding before routing traffic.

### 3. Explicit Port Exposure

Add to docker-compose.yaml:
```yaml
expose:
  - "18789"
```

**Why:** Makes it explicit that this port should be accessible within the Docker network (not published to host).

## Comparison: Before vs After

### Before (Current - Broken)

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.https-0-qsw0sgsgwcog4wg88g448sgs-openclaw.rule=Host(`bot.appautomation.cloud`)"
  # ❌ Missing: traefik.http.services.openclaw.loadbalancer.server.port
```

**Result:** Traefik doesn't know where to send traffic → 504 Gateway Timeout

### After (Fixed)

```yaml
expose:
  - "18789"

labels:
  - "traefik.enable=true"
  - "traefik.http.services.openclaw.loadbalancer.server.port=18789"  # ✅ Added
  - "traefik.http.services.openclaw.loadbalancer.server.scheme=http"
  - "traefik.http.services.openclaw.loadbalancer.healthcheck.path=/"
  - "traefik.http.routers.https-0-qsw0sgsgwcog4wg88g448sgs-openclaw.rule=Host(`bot.appautomation.cloud`)"
```

**Result:** Traefik knows exactly where to route → Works immediately after deployment

## Testing Plan

After applying the fix:

1. **Deploy the changes:**
   ```bash
   git add docker-compose.yaml
   git commit -m "fix: add Traefik service port label to prevent 504 timeouts"
   git push origin main
   ```

2. **Wait for Coolify rebuild** (5-10 minutes)

3. **Test WITHOUT restarting proxy:**
   ```bash
   # Wait for container to be healthy
   ssh ***REMOVED-VPS*** "docker ps --filter name=openclaw"
   
   # Test immediately (should work now)
   curl -I ***REMOVED-URL***
   ```

4. **Verify Traefik sees the service:**
   ```bash
   ssh ***REMOVED-VPS*** "docker inspect openclaw-* | grep 'traefik.http.services'"
   ```

5. **Check logs for errors:**
   ```bash
   ssh ***REMOVED-VPS*** "docker logs coolify-proxy 2>&1 | tail -50"
   ```

## Expected Outcome

After the fix:
- ✅ No more 504 Gateway Timeout errors
- ✅ No need to restart Coolify proxy
- ✅ Service accessible immediately after deployment
- ✅ Traefik health checks verify backend is responding
- ✅ Faster startup detection (90s start period)

## References

- **Traefik Docker Provider:** https://doc.traefik.io/traefik/providers/docker/
- **Traefik Services:** https://doc.traefik.io/traefik/routing/services/
- **Coolify Proxy:** https://coolify.io/docs/knowledge-base/traefik

## Summary

**Problem:** Missing `traefik.http.services.*.loadbalancer.server.port` label
**Impact:** Traefik doesn't know which port to route to → 504 timeout
**Solution:** Add explicit port label + health check + longer start period
**Result:** Reliable routing without manual proxy restarts

---

**Status:** Investigation complete, fix ready to apply
**Next Step:** Apply the fix to docker-compose.yaml and deploy
