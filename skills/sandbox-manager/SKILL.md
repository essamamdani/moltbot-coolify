---
name: sandbox-manager
description: Create and manage isolated application sandboxes (Next.js, Python, PHP, etc.) with public URLs via Cloudflare tunnels for rapid prototyping and testing.
metadata:
  openclaw:
    emoji: 📦
    requires:
      bins: ["docker", "sqlite3", "curl"]
      services: ["docker"]
    install:
      - id: "cloudflared"
        kind: "download"
        url: "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
        bins: ["cloudflared"]
        label: "Install Cloudflared (Linux)"
---

# Sandbox Manager

Create and manage isolated development sandboxes for rapid prototyping and testing. Each sandbox is a fully isolated Docker container with its own technology stack, persistent storage, and public URL.

## Features

- **Isolated Environments**: Each sandbox runs in its own Docker container
- **Persistent Storage**: Data survives container restarts
- **Public URLs**: Cloudflare tunnels provide instant public access
- **Multiple Stacks**: Support for 12+ technology stacks
- **Database Tracking**: SQLite registry tracks all sandboxes
- **Easy Cleanup**: Remove sandboxes with optional volume preservation

## Supported Stacks

| Stack | Language | Framework | Use Case |
|-------|----------|-----------|----------|
| `nextjs` | JavaScript/TypeScript | Next.js | React web apps |
| `fastapi` | Python | FastAPI | Python APIs |
| `laravel` | PHP | Laravel | PHP web apps |
| `rails` | Ruby | Rails | Ruby web apps |
| `gin` | Go | Gin | Go APIs |
| `springboot` | Java | Spring Boot | Java APIs |
| `dotnet` | C# | .NET | .NET apps |
| `axum` | Rust | Axum | Rust APIs |
| `ktor` | Kotlin | Ktor | Kotlin APIs |
| `vapor` | Swift | Vapor | Swift APIs |
| `flutter` | Dart | Flutter | Mobile/Web apps |
| `phoenix` | Elixir | Phoenix | Elixir web apps |

## Actions

### 🚀 Create a Sandbox

Spin up a new isolated development environment.

**Usage:**
```bash
{baseDir}/scripts/create_sandbox.sh --stack <stack> --title <title>
```

**Parameters:**
- `--stack`: Technology stack (see table above)
- `--title`: Human-readable name for the sandbox

**Example:**
```bash
{baseDir}/scripts/create_sandbox.sh --stack nextjs --title "My Portfolio Site"
```

**What it does:**
1. Creates a Docker container with the specified stack
2. Sets up persistent volume for data
3. Starts Cloudflare tunnel for public access
4. Registers sandbox in local database
5. Returns public URL and container details

**Returns:**
- Container name
- Public URL (via Cloudflare)
- Stack information
- Volume name

---

### 📋 List Sandboxes

View all active sandboxes and their details.

**Usage:**
```bash
{baseDir}/scripts/list_sandboxes.sh
```

**Returns:**
- Sandbox ID
- Container name
- Stack type
- Title/description
- Public URL
- Creation date
- Status (running/stopped)

**Example Output:**
```
ID  | Container Name        | Stack   | Title           | URL                    | Created
----|-----------------------|---------|-----------------|------------------------|----------
1   | sandbox-nextjs-abc123 | nextjs  | Portfolio Site  | https://abc.trycloudflare.com | 2026-02-04
2   | sandbox-fastapi-def456| fastapi | API Backend     | https://def.trycloudflare.com | 2026-02-04
```

---

### 🗑️ Delete a Sandbox

Remove a sandbox container and clean up resources.

**Usage:**
```bash
{baseDir}/scripts/delete_sandbox.sh --name <container_name> [--keep-volume]
```

**Parameters:**
- `--name`: Container name (from list command)
- `--keep-volume`: (Optional) Preserve data volume

**Example:**
```bash
# Delete container and volume
{baseDir}/scripts/delete_sandbox.sh --name sandbox-nextjs-abc123

# Delete container but keep data
{baseDir}/scripts/delete_sandbox.sh --name sandbox-nextjs-abc123 --keep-volume
```

**What it does:**
1. Stops the container
2. Removes container
3. Optionally removes volume
4. Removes database entry
5. Stops Cloudflare tunnel

---

### 🔍 Database Operations

Direct database queries for advanced management.

**Usage:**
```bash
{baseDir}/scripts/db.sh <sql_query>
```

**Examples:**
```bash
# View all sandboxes
{baseDir}/scripts/db.sh "SELECT * FROM sandboxes;"

# Find sandboxes by stack
{baseDir}/scripts/db.sh "SELECT * FROM sandboxes WHERE stack='nextjs';"

# Count active sandboxes
{baseDir}/scripts/db.sh "SELECT COUNT(*) FROM sandboxes;"
```

## Database Schema

The sandbox registry uses SQLite with this schema:

```sql
CREATE TABLE sandboxes (
  id INTEGER PRIMARY KEY,
  container_name TEXT UNIQUE,
  stack TEXT,
  title TEXT,
  public_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Location:** `~/.openclaw/sandboxes.db`

## Use Cases

**Rapid Prototyping:**
- Spin up a Next.js app in seconds
- Test API designs with FastAPI
- Prototype mobile apps with Flutter

**Client Demos:**
- Create isolated demo environments
- Share public URLs instantly
- No deployment configuration needed

**Testing & Experimentation:**
- Test different frameworks
- Compare stack performance
- Isolated testing environments

**Learning & Education:**
- Try new technologies safely
- Isolated learning environments
- Easy cleanup after experiments

## Configuration

**Environment Variables:**
- `DOCKER_HOST`: Docker socket location (default: unix:///var/run/docker.sock)
- `SANDBOXES_DB`: Database location (default: ~/.openclaw/sandboxes.db)

**Requirements:**
- Docker daemon running
- Cloudflared installed
- SQLite3 available
- Network access for Cloudflare tunnels

## Security Notes

⚠️ **Important Security Considerations:**

1. **Public URLs**: Cloudflare tunnels expose sandboxes publicly
2. **No Authentication**: Default stacks have no auth
3. **Resource Limits**: Set Docker resource limits
4. **Cleanup**: Delete unused sandboxes regularly
5. **Sensitive Data**: Don't store secrets in sandboxes

**Best Practices:**
- Use sandboxes for development/testing only
- Add authentication for production-like demos
- Monitor resource usage
- Clean up after demos/tests
- Use `--keep-volume` for important data

## Troubleshooting

**Container won't start:**
- Check Docker daemon: `docker ps`
- Verify stack name is valid
- Check available resources

**No public URL:**
- Verify Cloudflared is installed
- Check network connectivity
- Look for tunnel errors in logs

**Database errors:**
- Check database file permissions
- Verify SQLite3 is installed
- Check disk space

**Volume issues:**
- List volumes: `docker volume ls`
- Inspect volume: `docker volume inspect <name>`
- Check disk space

## Advanced Usage

**Custom Stack Configuration:**
Modify `create_sandbox.sh` to add custom stacks with specific:
- Base images
- Port mappings
- Environment variables
- Volume mounts

**Monitoring:**
```bash
# Watch container logs
docker logs -f <container_name>

# Check resource usage
docker stats <container_name>

# Inspect container
docker inspect <container_name>
```

**Backup & Restore:**
```bash
# Backup volume
docker run --rm -v <volume_name>:/data -v $(pwd):/backup alpine tar czf /backup/sandbox-backup.tar.gz /data

# Restore volume
docker run --rm -v <volume_name>:/data -v $(pwd):/backup alpine tar xzf /backup/sandbox-backup.tar.gz -C /
```

## Notes

- Cloudflare tunnels are temporary and change on restart
- Volumes persist until explicitly deleted
- Database tracks metadata only (not container state)
- Each sandbox is fully isolated from others
- Resource usage depends on stack and workload
