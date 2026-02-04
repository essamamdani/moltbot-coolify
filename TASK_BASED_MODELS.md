# Task-Based Model Assignment Configuration

**Last Updated:** February 5, 2026  
**OpenClaw Version:** 2026.2.2-3

## Overview

This document explains the task-based model assignment strategy implemented in your OpenClaw deployment. The configuration optimizes costs by using appropriate models for different types of tasks.

## Model Assignment Strategy

### 1. Main Agent Tasks (Complex Reasoning & Coding)

**Model:** `google-antigravity/claude-opus-4-5-thinking`

**Use Cases:**
- Complex coding tasks
- Deep reasoning and analysis
- Multi-step problem solving
- Code reviews and refactoring
- Architecture decisions

**Why Opus?**
- Highest capability model available
- Extended thinking mode for complex problems
- Best for tasks requiring deep reasoning
- Worth the cost for primary interactions

**Cost:** $15/1M input tokens, $75/1M output tokens

---

### 2. Fallback Chain (Resilience)

**Fallback Order:**
1. `google-antigravity/gemini-3-flash` (fast & cheap)
2. `mistral/mistral-large-latest` (good coding)
3. `mistral/codestral-latest` (specialized coding)

**Why This Order?**
- Gemini Flash: 200x cheaper than Opus, handles 80% of tasks well
- Mistral Large: Strong general capabilities, different provider
- Codestral: Specialized for coding tasks

**Resilience Strategy:**
- Multiple providers (Google Antigravity, Mistral)
- Different model families (Claude, Gemini, Mistral)
- Automatic failover on rate limits or errors

---

### 3. Heartbeat Tasks (Proactive Monitoring)

**Model:** `google-antigravity/gemini-3-flash`  
**Frequency:** Every 30 minutes

**Use Cases:**
- System health checks
- Memory review
- Workspace organization
- Proactive alerts
- Background monitoring

**Why Gemini Flash?**
- Extremely cheap (~$0.075/1M tokens)
- Fast response times
- Good enough for monitoring tasks
- 200x cost savings vs Opus

**Cost Savings:** ~$14.93 per 1M tokens vs Opus

---

### 4. Sub-Agent Tasks (Delegated Work)

**Model:** `google-antigravity/gemini-3-flash`  
**Max Concurrent:** 4 sub-agents

**Use Cases:**
- Parallel task execution
- Background research
- Data processing
- File operations
- Simple automation

**Why Gemini Flash?**
- Cost-effective for delegated tasks
- Fast enough for most sub-agent work
- Allows more concurrent operations
- Sub-agents don't need Opus-level reasoning

**Configuration:**
- `maxConcurrent: 4` - Balance between parallelism and resource usage
- `archiveAfterMinutes: 60` - Auto-cleanup after 1 hour

---

### 5. Vision/Image Tasks

**Model:** `google-antigravity/gemini-3-flash`  
**Fallback:** `google-antigravity/claude-opus-4-5-thinking`

**Use Cases:**
- Image analysis
- Screenshot understanding
- Diagram interpretation
- Visual debugging
- UI/UX review

**Why Gemini Flash?**
- Excellent vision capabilities
- Native multimodal support
- Much cheaper than Claude for vision
- 1M token context window

**Fallback to Opus:** For complex visual reasoning tasks

---

## Model Aliases (Quick Switching)

Use `/model <alias>` in chat to switch models:

| Alias | Model | Use Case |
|-------|-------|----------|
| `opus` | claude-opus-4-5-thinking | Complex tasks |
| `flash` | gemini-3-flash | Fast & cheap |
| `mistral` | mistral-large-latest | General tasks |
| `codestral` | codestral-latest | Coding focus |

**Examples:**
```
/model flash          # Switch to Gemini Flash
/model opus           # Switch back to Opus
/model mistral        # Try Mistral Large
```

---

## Cost Analysis

### Current Configuration (Task-Based)

**Typical Usage Pattern:**
- Main agent: 1M tokens/day @ Opus = $90/day
- Heartbeats: 0.5M tokens/day @ Flash = $0.04/day
- Sub-agents: 2M tokens/day @ Flash = $0.15/day
- Vision: 0.5M tokens/day @ Flash = $0.04/day

**Total:** ~$90.23/day

### Previous Configuration (All Opus)

**Same Usage Pattern:**
- Main agent: 1M tokens/day @ Opus = $90/day
- Heartbeats: 0.5M tokens/day @ Opus = $45/day
- Sub-agents: 2M tokens/day @ Opus = $180/day
- Vision: 0.5M tokens/day @ Opus = $45/day

**Total:** ~$360/day

### **Savings: ~$270/day (75% reduction)**

---

## Google Antigravity OAuth Strategy

Your setup uses **9 OAuth profiles** for rate limit distribution:

**Profiles:**
1. davewitting05@gmail.com
2. kirocode2025@gmail.com
3. hydratv.info@gmail.com
4. amraly1983@gmail.com
5. lujainradyy@gmail.com
6. hamzah.rady@gmail.com
7. lujyamr08@gmail.com
8. amrooradi@gmail.com
9. me.amrrady@gmail.com

**Benefits:**
- Automatic rotation across accounts
- Higher effective rate limits
- Better resilience to quota issues
- No single point of failure

**Current Usage:**
- gemini-3-pro-image: 100% quota remaining (resets in 6d 23h)
- gemini-2.5-pro: 100% quota remaining (resets in 4h 59m)

---

## Configuration Location

**Production:** `/root/.openclaw/openclaw.json` (in container)  
**Bootstrap:** `scripts/bootstrap.sh` (generates config on first run)

**Key Sections:**
```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "google-antigravity/claude-opus-4-5-thinking",
        "fallbacks": [...]
      },
      "heartbeat": {
        "model": "google-antigravity/gemini-3-flash"
      },
      "subagents": {
        "model": "google-antigravity/gemini-3-flash"
      },
      "imageModel": {
        "primary": "google-antigravity/gemini-3-flash"
      }
    }
  }
}
```

---

## Monitoring & Optimization

### Check Model Status

```bash
# SSH into VPS
ssh ***REMOVED-VPS***

# Check current models
sudo docker exec <container-name> openclaw models status

# List available models
sudo docker exec <container-name> openclaw models list

# Check OAuth status
sudo docker exec <container-name> openclaw models status | grep -A 20 "OAuth/token status"
```

### Monitor Costs

Track token usage by model:
- Main agent logs: `/root/openclaw-workspace/memory/YYYY-MM-DD.md`
- Gateway logs: Check for model selection and fallback events
- OAuth quota: Monitor remaining percentages

### Adjust Configuration

**If costs are too high:**
- Reduce heartbeat frequency: `every: "1h"` or `every: "2h"`
- Use Flash for more tasks: Add to fallback chain earlier
- Reduce sub-agent concurrency: `maxConcurrent: 2`

**If quality is insufficient:**
- Use Opus for sub-agents: `subagents.model: "google-antigravity/claude-opus-4-5-thinking"`
- Add Opus to vision fallbacks earlier
- Increase heartbeat frequency for better monitoring

---

## Troubleshooting

### "Model is not allowed"

**Cause:** Model not in `agents.defaults.models` allowlist

**Fix:** Add model to allowlist or use `/model list` to see available models

### OAuth Token Expired

**Cause:** Google Antigravity OAuth token needs refresh

**Fix:**
```bash
# Check status
openclaw models status

# Re-authenticate if needed
openclaw models auth login --provider google-antigravity
```

### Fallback Not Working

**Cause:** All models in chain failing

**Fix:**
1. Check `openclaw models status` for auth issues
2. Verify API keys in environment variables
3. Check gateway logs for specific errors

### High Costs

**Cause:** Using Opus for everything

**Fix:**
1. Verify task-based config is active
2. Check heartbeat is using Flash: `openclaw config get agents.defaults.heartbeat.model`
3. Confirm sub-agents using Flash: `openclaw config get agents.defaults.subagents.model`

---

## Future Optimizations

### Potential Improvements

1. **Add More Providers:**
   - Configure direct Anthropic API as fallback
   - Add OpenAI for additional resilience
   - Consider local models for simple tasks

2. **Fine-Tune Task Assignment:**
   - Use Flash for more main agent tasks
   - Create task-specific agents with different models
   - Implement dynamic model selection based on task complexity

3. **Cost Monitoring:**
   - Set up usage tracking
   - Alert on high token consumption
   - Analyze which tasks use most tokens

4. **Rate Limit Optimization:**
   - Add more OAuth accounts if needed
   - Implement smarter rotation logic
   - Monitor quota usage patterns

---

## References

- **OpenClaw Models Docs:** https://docs.openclaw.ai/concepts/models
- **Model Failover:** https://docs.openclaw.ai/concepts/model-failover
- **Google Antigravity:** OAuth-based access to Claude models
- **Configuration Guide:** https://docs.openclaw.ai/gateway/configuration

---

**Questions or Issues?**

Check the comprehensive guide: `OPENCLAW_COMPREHENSIVE_GUIDE.md`
