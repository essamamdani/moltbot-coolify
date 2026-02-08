#!/usr/bin/env node
/**
 * Mission Control Sidecar API
 *
 * Lightweight HTTP server running inside the openclaw container.
 * Handles agent management operations that require direct file system access
 * (creating workspaces, updating openclaw.json, seeding SOUL.md files).
 *
 * Endpoints:
 *   GET  /config          — Returns mc-config.json data
 *   GET  /agents          — Lists all agents from openclaw.json
 *   POST /agents/create   — Creates a new agent (workspace + config + SOUL.md)
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PORT = 18790;
const MC_SHARED_DIR = process.env.MC_SHARED_DIR || "/mc-shared";
const CONFIG_FILE =
  process.env.OPENCLAW_CONFIG_FILE || "/data/.openclaw/openclaw.json";
const STATE_DIR = process.env.OPENCLAW_STATE_DIR || "/data/.openclaw";
const CONVEX_URL = process.env.CONVEX_URL || "";

// --- Helpers ---

function readConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    // Strip comments for JSON5 compatibility
    const cleaned = raw.replace(/\/\/.*$/gm, "").replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to read config:", e.message);
    return null;
  }
}

function writeConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

function updateMcConfig(agents) {
  const mcConfigPath = path.join(MC_SHARED_DIR, "mc-config.json");
  try {
    const existing = JSON.parse(fs.readFileSync(mcConfigPath, "utf-8"));
    existing.agents = agents;
    fs.writeFileSync(mcConfigPath, JSON.stringify(existing, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to update mc-config.json:", e.message);
  }
}

function generateSoulMd(name, role, description) {
  return `# SOUL.md — ${name}

**Name:** ${name}
**Role:** ${role}

## Who You Are
${description}

## Mission Control Integration
You are part of an AI agent squad managed through Mission Control.
- Check your assigned tasks on each heartbeat
- Post progress updates to task threads
- Use @mentions to communicate with other agents
- Move tasks through the pipeline: assigned → in_progress → review

## Communication
- Use \`@jarvis\` to report to the coordinator
- Use \`@<agentId>\` to communicate with other specialists
- Post decisions and findings as task comments

## Heartbeat Protocol
Every 15 minutes, check for:
1. Notifications and @mentions
2. Newly assigned tasks
3. In-progress work to resume
If nothing needs attention, reply HEARTBEAT_OK.
`;
}

function generateHeartbeatMd(agentId) {
  return `# HEARTBEAT Checklist — ${agentId}

## On Wake (every 15 minutes)

### 1. Update Status
\`\`\`bash
source /app/scripts/agent-convex-helpers.sh
mc_agent_heartbeat "${agentId}" "online"
\`\`\`

### 2. Check Notifications
\`\`\`bash
mc_get_notifications "${agentId}"
\`\`\`
- If @mentions found: read context and respond

### 3. Check Assigned Tasks
\`\`\`bash
mc_get_my_tasks "${agentId}" "assigned"
\`\`\`
- If tasks found: pick one, move to in_progress, begin work

### 4. Resume In-Progress Work
- Check memory/WORKING.md for ongoing tasks
- Continue where you left off

### 5. Stand Down
- If nothing needs attention: reply HEARTBEAT_OK
`;
}

function generateAgentsMd(name) {
  return `# AGENTS.md — ${name} Workspace

## Every Session
1. Read SOUL.md — this is who you are
2. Read HEARTBEAT.md — this is your checklist
3. Check memory/WORKING.md for current task state

## Memory
- **Working state**: memory/WORKING.md — update constantly
- **Daily notes**: memory/YYYY-MM-DD.md — raw logs
- Write it down. Mental notes don't survive restarts.

## Tools
Helper script: \`/app/scripts/agent-convex-helpers.sh\`
- \`mc_agent_heartbeat <agentId> <status>\`
- \`mc_get_notifications <agentId>\`
- \`mc_get_my_tasks <agentId> [status]\`
- \`mc_move_task <taskId> <status>\`
- \`mc_post_message <from> <content> [taskId] [type]\`
`;
}

function toAgentId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// --- Route Handlers ---

function handleGetConfig(req, res) {
  const mcConfigPath = path.join(MC_SHARED_DIR, "mc-config.json");
  try {
    const data = fs.readFileSync(mcConfigPath, "utf-8");
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(data);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Config not found" }));
  }
}

function handleGetAgents(req, res) {
  const config = readConfig();
  if (!config) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to read config" }));
    return;
  }

  const agents = (config.agents?.list || []).map((a) => ({
    id: a.id,
    name: a.name || a.id,
    workspace: a.workspace,
    heartbeat: a.heartbeat,
    isDefault: a.default || false,
  }));

  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify({ agents }));
}

function handleCreateAgent(req, res) {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    try {
      const { name, role, description, avatar } = JSON.parse(body);

      if (!name || !role) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "name and role are required" }));
        return;
      }

      const agentId = toAgentId(name);
      const workspaceDir = `/data/openclaw-${agentId}`;

      // 1. Read current config
      const config = readConfig();
      if (!config) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to read config" }));
        return;
      }

      // 2. Check if agent already exists
      const existing = config.agents?.list?.find((a) => a.id === agentId);
      if (existing) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: `Agent '${agentId}' already exists` })
        );
        return;
      }

      // 3. Add agent to config
      if (!config.agents) config.agents = { list: [] };
      if (!config.agents.list) config.agents.list = [];

      config.agents.list.push({
        id: agentId,
        name: name,
        workspace: workspaceDir,
        heartbeat: { every: "15m" },
      });

      // 4. Write updated config (triggers OpenClaw hot-reload)
      writeConfig(config);

      // 5. Create workspace directory
      fs.mkdirSync(workspaceDir, { recursive: true });
      fs.mkdirSync(path.join(workspaceDir, "memory"), { recursive: true });

      // 6. Generate SOUL.md, HEARTBEAT.md, AGENTS.md
      const desc = description || `You are ${name}, a specialist in ${role}.`;
      fs.writeFileSync(
        path.join(workspaceDir, "SOUL.md"),
        generateSoulMd(name, role, desc)
      );
      fs.writeFileSync(
        path.join(workspaceDir, "HEARTBEAT.md"),
        generateHeartbeatMd(agentId)
      );
      fs.writeFileSync(
        path.join(workspaceDir, "AGENTS.md"),
        generateAgentsMd(name)
      );

      // 7. Create session directory
      const sessionDir = path.join(STATE_DIR, "agents", agentId, "sessions");
      fs.mkdirSync(sessionDir, { recursive: true });

      // 8. Update mc-config.json
      const agentIds = config.agents.list.map((a) => a.id);
      updateMcConfig(agentIds);

      // 9. Register in Convex (if available)
      if (CONVEX_URL) {
        try {
          const args = JSON.stringify({
            agentId,
            name,
            role,
            description: desc,
            heartbeatInterval: 900000,
            avatar: avatar || undefined,
          });
          execSync(
            `npx convex run agents:register --args '${args}' 2>/dev/null`,
            { timeout: 15000 }
          );
        } catch (e) {
          console.warn("Convex registration failed (non-fatal):", e.message);
        }
      }

      console.log(`Agent created: ${agentId} (${name})`);

      res.writeHead(201, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(
        JSON.stringify({
          success: true,
          agentId,
          name,
          role,
          workspace: workspaceDir,
        })
      );
    } catch (e) {
      console.error("Create agent error:", e);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}

// --- Server ---

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "GET" && url.pathname === "/config") {
    return handleGetConfig(req, res);
  }

  if (req.method === "GET" && url.pathname === "/agents") {
    return handleGetAgents(req, res);
  }

  if (req.method === "POST" && url.pathname === "/agents/create") {
    return handleCreateAgent(req, res);
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Mission Control sidecar API listening on port ${PORT}`);
});
