#!/usr/bin/env python3
import json

# Read current config
with open('current-production-config.json', 'r', encoding='utf-8') as f:
    config = json.load(f)

# Add Gemini Flash to fallbacks (first position)
if 'google-antigravity/gemini-3-flash' not in config['agents']['defaults']['model']['fallbacks']:
    config['agents']['defaults']['model']['fallbacks'].insert(0, 'google-antigravity/gemini-3-flash')

# Add model aliases
config['agents']['defaults']['models'] = {
    "google-antigravity/claude-opus-4-5-thinking": {"alias": "opus"},
    "google-antigravity/gemini-3-flash": {"alias": "flash"},
    "mistral/mistral-large-latest": {"alias": "mistral"},
    "mistral/codestral-latest": {"alias": "codestral"}
}

# Add heartbeat config
config['agents']['defaults']['heartbeat'] = {
    "every": "30m",
    "model": "google-antigravity/gemini-3-flash",
    "target": "last"
}

# Add subagents config
config['agents']['defaults']['subagents'] = {
    "model": "google-antigravity/gemini-3-flash",
    "maxConcurrent": 4,
    "archiveAfterMinutes": 60
}

# Add imageModel config
config['agents']['defaults']['imageModel'] = {
    "primary": "google-antigravity/gemini-3-flash",
    "fallbacks": ["google-antigravity/claude-opus-4-5-thinking"]
}

# Remove agent-specific model override
if 'model' in config['agents']['list'][0]:
    del config['agents']['list'][0]['model']

# Write updated config
with open('updated-production-config.json', 'w') as f:
    json.dump(config, f, indent=2)

print("Config updated successfully!")
print("\nChanges made:")
print("1. Added Gemini Flash to fallback chain (first position)")
print("2. Added model aliases (opus, flash, mistral, codestral)")
print("3. Set heartbeat to 30m with Gemini Flash")
print("4. Set sub-agents to use Gemini Flash (maxConcurrent: 4)")
print("5. Set imageModel to Gemini Flash with Opus fallback")
print("6. Removed agent-specific model override")
