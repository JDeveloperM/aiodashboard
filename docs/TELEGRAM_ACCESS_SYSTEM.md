# Telegram Premium Channel Access System

This document describes the one-time link access system for premium Telegram channels implemented in the AIO Dashboard.

## Overview

The system provides secure, one-time access links for premium Telegram channels with the following features:

- **One-time use links**: Each access link can only be used once for security
- **QR code generation**: Visual QR codes for easy mobile access
- **Subscription tracking**: Tracks subscription duration and expiration
- **Telegram bot integration**: Bot validates access and manages channel permissions
- **Admin dashboard**: Monitor and manage all access tokens

## Architecture

### Components

1. **Frontend Components**
   - `TelegramAccessModal`: Displays access link and QR code after payment
   - `TipPaymentModal`: Modified to generate Telegram access instead of direct redirects
   - `TelegramAdminDashboard`: Admin interface for monitoring access tokens

2. **API Endpoints**
   - `/api/telegram/generate-access`: Creates one-time access tokens
   - `/api/telegram/access/[token]`: Validates and activates access tokens
   - `/api/telegram/bot-webhook`: Webhook for Telegram bot integration
   - `/api/telegram/admin/tokens`: Admin API for token management

3. **Utility Libraries**
   - `lib/telegram-access.ts`: Helper functions for access link generation and QR codes

### Data Flow

```
1. User purchases premium channel access
2. Payment is processed successfully
3. System generates one-time access token
4. QR code and access link are created
5. User clicks link or scans QR code
6. Token is validated and marked as used
7. User is granted access to Telegram channel
8. Telegram bot tracks subscription status
```

## API Reference

### Generate Access Token

**POST** `/api/telegram/generate-access`

Creates a new one-time access token for a premium channel subscription.

**Request Body:**
```json
{
  "userId": "user_123",
  "creatorId": "creator_456",
  "channelId": "channel_789",
  "subscriptionDuration": 30,
  "tier": "PRO",
  "paymentAmount": 5.0,
  "channelName": "Premium Trading Signals",
  "creatorName": "CryptoAlex"
}
```

**Response:**
```json
{
  "success": true,
  "accessUrl": "http://localhost:3000/api/telegram/access/abc123...",
  "token": "abc123...",
  "subscriptionDetails": {
    "channelName": "Premium Trading Signals",
    "creatorName": "CryptoAlex",
    "duration": 30,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T00:00:00.000Z",
    "tier": "PRO",
    "paymentAmount": 5.0
  }
}
```

### Access Token Validation

**GET** `/api/telegram/access/[token]`

Validates and activates an access token. Returns HTML page with subscription details.

**Query Parameters:**
- `telegram_user_id`: Telegram user ID (sent by bot)
- `telegram_username`: Telegram username (sent by bot)
- `telegram_first_name`: Telegram first name (sent by bot)

**Response:** HTML page with subscription activation status

### Telegram Bot Webhook

**POST** `/api/telegram/bot-webhook`

Webhook endpoint for Telegram bot to handle user interactions.

**Supported Commands:**
- `/start`: Welcome message and bot introduction
- `/status`: Check user's subscription status
- `/subs`: List all user subscriptions
- `/join_[channel]`: Request access to specific channel

### Admin Token Management

**GET** `/api/telegram/admin/tokens`

Admin endpoint to retrieve and filter access tokens.

**Headers:**
```
Authorization: Bearer admin-token-change-me
```

**Query Parameters:**
- `userId`: Filter by user ID
- `channelId`: Filter by channel ID
- `creatorId`: Filter by creator ID
- `status`: Filter by status (used, unused, active, expired)

## Telegram Bot Integration

### Bot Setup

1. Create a new Telegram bot using [@BotFather](https://t.me/botfather)
2. Get the bot token and configure webhook URL
3. Set webhook to: `https://yourdomain.com/api/telegram/bot-webhook`

### Bot Commands

The bot supports the following commands:

- **`/start`**: Initialize bot interaction
- **`/status`**: Show subscription status
- **`/subs`**: List active subscriptions
- **`/join_[channel]`**: Request channel access

### Access Validation Flow

1. User clicks one-time access link
2. Link validates token and subscription
3. User's Telegram info is recorded
4. Bot receives webhook updates
5. Bot grants/denies channel access based on subscription status

## Security Features

### Token Security
- 64-character hex tokens (32 bytes of randomness)
- One-time use only
- Automatic expiration based on subscription duration
- Secure token validation

### Access Control
- Admin endpoints require authentication
- User data is tracked and logged
- Subscription status is continuously monitored
- Failed access attempts are logged

## Configuration

### Environment Variables

Add to `.env.local`:

```env
# Telegram Bot Configuration
TELEGRAM_ADMIN_TOKEN=your-secure-admin-token
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional: Telegram Bot Token (for direct bot API calls)
TELEGRAM_BOT_TOKEN=your-bot-token
```

### Admin Access

Admin dashboard is available at `/telegram-admin` and requires:
- User must be signed in
- User must have ROYAL tier subscription
- Proper admin token for API access

## Usage Examples

### Frontend Integration

```typescript
import { generateTelegramAccessLink } from '@/lib/telegram-access'

// After successful payment
const accessData = {
  userId: user.id,
  creatorId: creator.id,
  channelId: channel.id,
  subscriptionDuration: 30,
  tier: 'PRO',
  paymentAmount: 5.0,
  channelName: channel.name,
  creatorName: creator.name
}

const result = await generateTelegramAccessLink(accessData)
if (result.success) {
  // Show access modal with QR code
  setSubscriptionSummary(await createSubscriptionSummary(result))
  setShowTelegramModal(true)
}
```

### Bot Integration

```python
# Python example for Telegram bot
import requests

def validate_user_access(user_id, channel_id):
    webhook_url = "https://yourdomain.com/api/telegram/bot-webhook"
    data = {
        "update_id": 123,
        "message": {
            "from": {"id": user_id},
            "text": f"/join_{channel_id}"
        }
    }
    response = requests.post(webhook_url, json=data)
    return response.json()
```

## Monitoring and Analytics

### Admin Dashboard Features

- **Real-time statistics**: Active subscriptions, revenue, usage metrics
- **Token management**: View, search, and manage access tokens
- **User tracking**: Monitor Telegram user associations
- **Subscription monitoring**: Track active/expired subscriptions

### Logging

The system logs:
- Token generation events
- Access attempts (successful/failed)
- Subscription activations
- Bot interactions
- Admin actions

## Troubleshooting

### Common Issues

1. **Token not found**: Check if token was already used or expired
2. **Access denied**: Verify subscription is still active
3. **Bot not responding**: Check webhook URL and bot token
4. **Admin access denied**: Verify ROYAL tier and authentication

### Debug Mode

Enable debug logging by setting:
```env
DEBUG_TELEGRAM_ACCESS=true
```

## Future Enhancements

- Database persistence (currently uses in-memory storage)
- Advanced analytics and reporting
- Multi-language bot support
- Automated subscription renewals
- Integration with payment processors
- Mobile app deep linking
