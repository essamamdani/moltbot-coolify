/**
 * Telegram Enhanced Plugin
 * 
 * Provides enhanced Telegram support with:
 * - Inline buttons with proper validation
 * - Target prefix handling (tg/group/telegram)
 * - Forum topic support
 * - Quick slash commands
 */

import type { PluginApi } from 'openclaw/plugin-sdk';

interface TelegramButton {
  text: string;
  callback_data?: string;
  url?: string;
}

interface SendParams {
  to: string;
  message: string;
  buttons?: TelegramButton[][];
  replyTo?: number;
  threadId?: number;
}

export default function (api: PluginApi) {
  const config = api.config.plugins?.entries?.['telegram-enhanced']?.config || {};
  
  // Register enhanced Telegram send tool with button support
  if (config.enableButtonTool !== false) {
    api.registerTool({
      name: "telegram_send",
      description: "Send Telegram messages with inline buttons. Supports all target formats: chat_id, @username, telegram:123, tg:group:123, telegram:group:123:topic:456. Handles button capability validation automatically.",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description: "Target: numeric chat_id, @username, or prefixed format (telegram:123, tg:group:123, telegram:group:123:topic:456)"
          },
          message: {
            type: "string",
            description: "Message text to send"
          },
          buttons: {
            type: "array",
            description: "Optional inline keyboard buttons (array of rows, each row is array of buttons)",
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string", description: "Button label" },
                  callback_data: { type: "string", description: "Data sent back when clicked" },
                  url: { type: "string", description: "URL to open (alternative to callback_data)" }
                },
                required: ["text"]
              }
            }
          },
          replyTo: {
            type: "number",
            description: "Optional message ID to reply to"
          },
          threadId: {
            type: "number",
            description: "Optional forum topic thread ID"
          }
        },
        required: ["to", "message"]
      },
      async execute(_id, params: SendParams) {
        try {
          // Normalize target with proper prefix handling
          const target = normalizeTarget(params.to);
          
          // Validate inline buttons capability
          const telegramConfig = api.config.channels?.telegram;
          if (params.buttons && params.buttons.length > 0) {
            const canSend = canSendButtons(telegramConfig, target);
            if (!canSend) {
              return {
                content: [{
                  type: "text",
                  text: `❌ Error: Inline buttons not allowed for target "${target}".\n\nCheck channels.telegram.capabilities.inlineButtons config.\nCurrent setting: ${telegramConfig?.capabilities?.inlineButtons || 'allowlist'}\n\nAllowed values:\n- 'all' - DMs + groups\n- 'dm' - DMs only\n- 'group' - Groups only\n- 'allowlist' - Authorized senders only\n- 'off' - Disabled`
                }]
              };
            }
          }
          
          // Build channel data for Telegram
          const channelData: any = {
            telegram: {}
          };
          
          if (params.buttons && params.buttons.length > 0) {
            channelData.telegram.reply_markup = {
              inline_keyboard: params.buttons
            };
          }
          
          if (params.replyTo) {
            channelData.telegram.reply_to_message_id = params.replyTo;
          }
          
          if (params.threadId) {
            channelData.telegram.message_thread_id = params.threadId;
          }
          
          // Send via runtime API
          const result = await api.runtime.sendMessage({
            channel: "telegram",
            to: target,
            text: params.message,
            channelData: Object.keys(channelData.telegram).length > 0 ? channelData : undefined
          });
          
          if (result.ok) {
            const buttonInfo = params.buttons ? ` with ${params.buttons.flat().length} button(s)` : '';
            const topicInfo = params.threadId ? ` (topic: ${params.threadId})` : '';
            return {
              content: [{
                type: "text",
                text: `✅ Message sent to ${target}${buttonInfo}${topicInfo}`
              }]
            };
          } else {
            return {
              content: [{
                type: "text",
                text: `❌ Failed to send message: ${result.error || 'Unknown error'}`
              }]
            };
          }
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`
            }]
          };
        }
      }
    });
  }
  
  // Register quick /buttons command
  if (config.enableButtonCommand !== false) {
    api.registerCommand({
      name: "buttons",
      description: "Send a message with inline buttons (Yes/No/Info template)",
      acceptsArgs: true,
      handler: async (ctx) => {
        try {
          const message = ctx.args?.trim() || "Choose an option:";
          
          // Use default button template or custom from config
          const buttons = config.defaultButtons || [
            [
              { text: "✅ Yes", callback_data: "yes" },
              { text: "❌ No", callback_data: "no" }
            ],
            [
              { text: "ℹ️ More Info", callback_data: "info" }
            ]
          ];
          
          await ctx.runtime.sendMessage({
            channel: ctx.channel,
            to: ctx.senderId,
            text: message,
            channelData: {
              telegram: {
                reply_markup: { inline_keyboard: buttons }
              }
            }
          });
          
          return { text: "✅ Buttons sent!" };
        } catch (error) {
          return { 
            text: `❌ Failed to send buttons: ${error instanceof Error ? error.message : String(error)}` 
          };
        }
      }
    });
  }
  
  api.logger.info('Telegram Enhanced plugin loaded', {
    buttonTool: config.enableButtonTool !== false,
    buttonCommand: config.enableButtonCommand !== false
  });
}

/**
 * Normalize Telegram target to proper format
 * Handles: numeric IDs, @usernames, prefixed formats
 */
function normalizeTarget(target: string): string {
  // Already has proper prefix
  if (target.startsWith('telegram:') || target.startsWith('tg:') || target.startsWith('group:')) {
    return target;
  }
  
  // Username format
  if (target.startsWith('@')) {
    return target;
  }
  
  // Numeric chat ID
  if (/^-?\d+$/.test(target)) {
    // Negative IDs are groups/supergroups
    // Positive IDs are users or channels
    if (target.startsWith('-')) {
      return `telegram:group:${target}`;
    }
    return `telegram:${target}`;
  }
  
  // Return as-is if unknown format
  return target;
}

/**
 * Check if inline buttons are allowed for the target
 */
function canSendButtons(config: any, target: string): boolean {
  const capability = config?.capabilities?.inlineButtons || 'allowlist';
  
  // Disabled globally
  if (capability === 'off') {
    return false;
  }
  
  // Allowed for all
  if (capability === 'all') {
    return true;
  }
  
  // Determine if target is group or DM
  const isGroup = target.includes('group:') || target.startsWith('-');
  const isDM = !isGroup;
  
  // Check scope restrictions
  if (capability === 'dm' && !isDM) {
    return false;
  }
  
  if (capability === 'group' && !isGroup) {
    return false;
  }
  
  // For 'allowlist', we allow it here and let the core handle authorization
  // The core will check channels.telegram.allowFrom / groupAllowFrom
  if (capability === 'allowlist') {
    return true;
  }
  
  return false;
}

// Export plugin metadata
export const id = "telegram-enhanced";
