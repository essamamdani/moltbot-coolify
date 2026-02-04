# Telegram Enhanced Plugin

Enhanced Telegram support for OpenClaw with inline buttons, proper target validation, and forum topic handling.

## Features

- ✅ **Inline Buttons** - Full support for Telegram inline keyboards
- ✅ **Target Validation** - Handles all Telegram target formats (numeric IDs, @usernames, prefixed formats)
- ✅ **Forum Topics** - Support for forum topic threads with `message_thread_id`
- ✅ **Capability Checking** - Validates button permissions before sending
- ✅ **Quick Commands** - `/buttons` slash command for instant button sends
- ✅ **Error Handling** - Clear error messages with configuration guidance

## Installation

The plugin is automatically loaded from `/app/extensions/telegram-enhanced/` in the Docker container.

## Configuration

Add to your `openclaw.json`:

```json
{
  "plugins": {
    "enabled": true,
    "load": {
      "paths": ["/app/extensions/telegram-enhanced"]
    },
    "entries": {
      "telegram-enhanced": {
        "enabled": true,
        "config": {
          "enableButtonTool": true,
          "enableButtonCommand": true,
          "defaultButtons": [
            [
              { "text": "✅ Yes", "callback_data": "yes" },
              { "text": "❌ No", "callback_data": "no" }
            ],
            [
              { "text": "ℹ️ More Info", "callback_data": "info" }
            ]
          ]
        }
      }
    }
  },
  "channels": {
    "telegram": {
      "capabilities": {
        "inlineButtons": "all"
      }
    }
  }
}
```

### Configuration Options

- `enableButtonTool` (boolean, default: true) - Enable `telegram_send` tool
- `enableButtonCommand` (boolean, default: true) - Enable `/buttons` slash command
- `defaultButtons` (array) - Default button template for `/buttons` command

### Inline Button Capabilities

Set `channels.telegram.capabilities.inlineButtons` to:

- `all` - Allow buttons in DMs and groups
- `dm` - Allow buttons only in DMs
- `group` - Allow buttons only in groups
- `allowlist` - Allow buttons only for authorized senders (default)
- `off` - Disable buttons completely

## Usage

### Via Agent Tool

The agent can use the `telegram_send` tool:

```json
{
  "tool": "telegram_send",
  "to": "@username",
  "message": "Choose an option:",
  "buttons": [
    [
      { "text": "✅ Yes", "callback_data": "yes" },
      { "text": "❌ No", "callback_data": "no" }
    ],
    [
      { "text": "ℹ️ More Info", "callback_data": "info" }
    ]
  ]
}
```

### Via Slash Command

In Telegram, send:

```
/buttons Do you want coffee?
```

This sends a message with the default button template.

### Via CLI

```bash
openclaw message send --channel telegram --target @yourchat \
  --message "Choose an option:" \
  --buttons '[[{"text":"Yes","callback_data":"yes"},{"text":"No","callback_data":"no"}]]'
```

## Target Formats

The plugin handles all Telegram target formats:

- **Numeric ID**: `123456789` (user), `-1001234567890` (group)
- **Username**: `@username`
- **Prefixed**: `telegram:123`, `tg:group:123`
- **Topic**: `telegram:group:123:topic:456`

## Button Format

Buttons are arrays of rows, each row is an array of button objects:

```json
[
  [
    { "text": "Button 1", "callback_data": "data1" },
    { "text": "Button 2", "callback_data": "data2" }
  ],
  [
    { "text": "Button 3", "url": "https://example.com" }
  ]
]
```

Each button must have:
- `text` (required) - Button label
- `callback_data` OR `url` (one required)
  - `callback_data` - Data sent back when clicked
  - `url` - URL to open in browser

## Callback Handling

When a user clicks a button, Telegram sends the callback data back to the agent as a message:

```
callback_data: yes
```

The agent sees this as a regular message and can respond accordingly.

## Forum Topics

For forum groups, include the topic ID:

```json
{
  "tool": "telegram_send",
  "to": "telegram:group:-1001234567890:topic:123",
  "message": "Topic message with buttons",
  "buttons": [[{ "text": "Reply", "callback_data": "reply" }]],
  "threadId": 123
}
```

## Error Messages

The plugin provides clear error messages:

- **Buttons not allowed**: Shows current capability setting and allowed values
- **Invalid target**: Explains proper target format
- **Send failure**: Shows Telegram API error details

## Examples

### Yes/No Question

```json
{
  "tool": "telegram_send",
  "to": "@user",
  "message": "Do you approve this deployment?",
  "buttons": [
    [
      { "text": "✅ Approve", "callback_data": "deploy:approve" },
      { "text": "❌ Reject", "callback_data": "deploy:reject" }
    ]
  ]
}
```

### Menu with URL

```json
{
  "tool": "telegram_send",
  "to": "123456789",
  "message": "Choose an action:",
  "buttons": [
    [
      { "text": "📊 Dashboard", "url": "***REMOVED-URL***" }
    ],
    [
      { "text": "🔄 Restart", "callback_data": "restart" },
      { "text": "📝 Logs", "callback_data": "logs" }
    ]
  ]
}
```

### Reply to Message

```json
{
  "tool": "telegram_send",
  "to": "@user",
  "message": "Quick reply options:",
  "buttons": [
    [
      { "text": "👍", "callback_data": "thumbs_up" },
      { "text": "👎", "callback_data": "thumbs_down" }
    ]
  ],
  "replyTo": 12345
}
```

## Troubleshooting

### Buttons Not Showing

1. Check `channels.telegram.capabilities.inlineButtons` is not `off`
2. Verify target format is correct
3. Check authorization (for `allowlist` mode)
4. Review gateway logs: `openclaw logs --follow`

### "Buttons not allowed" Error

The error message shows:
- Current capability setting
- Allowed values
- How to fix the configuration

Update `channels.telegram.capabilities.inlineButtons` in your config.

### Callback Not Received

1. Ensure bot has privacy mode disabled (for groups)
2. Check bot is a member of the group
3. Verify `channels.telegram.groups` includes the group

## Security

- Button capability checking prevents unauthorized button sends
- Target validation prevents malformed requests
- Authorization follows core Telegram channel rules
- Callback data is treated as user input (validate before acting)

## Development

To modify the plugin:

1. Edit `extensions/telegram-enhanced/index.ts`
2. Update version in `package.json` and `openclaw.plugin.json`
3. Rebuild Docker image
4. Deploy via Coolify

## Support

- **OpenClaw Docs**: https://docs.openclaw.ai/channels/telegram
- **Plugin Docs**: https://docs.openclaw.ai/plugin
- **This Repo**: https://github.com/amraly83/openclaw-coolify

## License

MIT
