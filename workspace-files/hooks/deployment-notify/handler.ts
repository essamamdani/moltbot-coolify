import type { HookHandler } from '../../src/hooks/hooks.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const handler: HookHandler = async (event) => {
  // Only trigger on gateway startup
  if (event.type !== 'gateway' || event.action !== 'startup') {
    return;
  }

  try {
    console.log('[deployment-notify] Deployment detected, sending notification...');

    // Get deployment info
    const version = await getOpenClawVersion();
    const containerInfo = await getContainerInfo();
    const timestamp = new Date().toISOString();

    // Format notification message
    const message = `🚀 **Deployment Complete**

📦 Version: \`${version}\`
🕐 Time: ${new Date().toUTCString()}
🐳 Container: \`${containerInfo.name}\`
💚 Status: ${containerInfo.healthy ? '✅ Healthy' : '⚠️ Starting'}

Dashboard: ***REMOVED-URL***`;

    // Send notification via Telegram
    // Note: This will be sent after the gateway is fully initialized
    event.messages.push(message);

    console.log('[deployment-notify] Notification queued successfully');
  } catch (error) {
    console.error('[deployment-notify] Error:', error instanceof Error ? error.message : String(error));
    // Don't throw - let other hooks run
  }
};

async function getOpenClawVersion(): Promise<string> {
  try {
    const { stdout } = await execAsync('openclaw --version');
    return stdout.trim();
  } catch {
    return 'unknown';
  }
}

async function getContainerInfo(): Promise<{ name: string; healthy: boolean }> {
  try {
    const { stdout: hostname } = await execAsync('hostname');
    const containerName = hostname.trim();
    
    // Check if container is healthy
    const { stdout: healthStatus } = await execAsync(
      `docker inspect ${containerName} --format '{{.State.Health.Status}}' 2>/dev/null || echo 'unknown'`
    );
    
    return {
      name: containerName.substring(0, 40) + (containerName.length > 40 ? '...' : ''),
      healthy: healthStatus.trim() === 'healthy'
    };
  } catch {
    return { name: 'unknown', healthy: false };
  }
}

export default handler;
