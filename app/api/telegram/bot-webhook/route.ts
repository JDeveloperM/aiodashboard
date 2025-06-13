import { NextRequest, NextResponse } from 'next/server'
import { getAllAccessTokens, getTokensByTelegramUserId, getStorageStats } from '@/lib/telegram-storage'

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      is_bot: boolean
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
    chat: {
      id: number
      type: string
      title?: string
      username?: string
    }
    date: number
    text?: string
  }
  callback_query?: {
    id: string
    from: {
      id: number
      is_bot: boolean
      first_name: string
      last_name?: string
      username?: string
    }
    message?: any
    data?: string
  }
}

interface UserSubscription {
  userId: string
  telegramUserId: string
  telegramUsername?: string
  channelId: string
  channelName: string
  creatorName: string
  subscriptionEndDate: string
  tier: string
  daysRemaining: number
  isActive: boolean
}

// Webhook endpoint for Telegram bot
export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()
    
    console.log('[Telegram Bot] Received webhook:', JSON.stringify(update, null, 2))

    // Handle different types of updates
    if (update.message) {
      return handleMessage(update.message)
    }
    
    if (update.callback_query) {
      return handleCallbackQuery(update.callback_query)
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('[Telegram Bot] Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleMessage(message: TelegramUpdate['message']) {
  if (!message) return NextResponse.json({ ok: true })

  const { from, text, chat } = message
  const telegramUserId = from.id.toString()
  const telegramUsername = from.username

  console.log(`[Telegram Bot] Message from ${telegramUsername} (${telegramUserId}): ${text}`)

  // Handle different commands
  switch (text?.toLowerCase()) {
    case '/start':
      return handleStartCommand(telegramUserId, telegramUsername, chat.id)
    
    case '/mystatus':
    case '/status':
      return handleStatusCommand(telegramUserId, telegramUsername, chat.id)
    
    case '/mysubscriptions':
    case '/subs':
      return handleSubscriptionsCommand(telegramUserId, telegramUsername, chat.id)
    
    default:
      // Check if it's a channel access request
      if (text?.startsWith('/join_')) {
        const channelId = text.replace('/join_', '')
        return handleChannelJoinRequest(telegramUserId, telegramUsername, channelId, chat.id)
      }
      
      return NextResponse.json({ ok: true })
  }
}

async function handleCallbackQuery(callbackQuery: TelegramUpdate['callback_query']) {
  if (!callbackQuery) return NextResponse.json({ ok: true })

  const { from, data } = callbackQuery
  const telegramUserId = from.id.toString()
  const telegramUsername = from.username

  console.log(`[Telegram Bot] Callback from ${telegramUsername} (${telegramUserId}): ${data}`)

  // Handle callback data
  if (data?.startsWith('check_access_')) {
    const channelId = data.replace('check_access_', '')
    return handleAccessCheck(telegramUserId, telegramUsername, channelId)
  }

  return NextResponse.json({ ok: true })
}

async function handleStartCommand(telegramUserId: string, telegramUsername?: string, chatId?: number) {
  console.log(`[Telegram Bot] Start command from ${telegramUsername} (${telegramUserId})`)
  
  // Send welcome message (in a real implementation, you'd use Telegram Bot API)
  const welcomeMessage = {
    method: 'sendMessage',
    chat_id: chatId,
    text: `🤖 Welcome to AIO Premium Channel Bot!\n\n` +
          `I help manage access to premium Telegram channels.\n\n` +
          `Commands:\n` +
          `• /status - Check your subscription status\n` +
          `• /subs - View your active subscriptions\n` +
          `• /join_[channel] - Request access to a channel\n\n` +
          `To get started, use a one-time access link provided after purchasing a subscription.`,
    reply_markup: {
      inline_keyboard: [
        [{ text: '📊 Check Status', callback_data: 'check_status' }],
        [{ text: '📋 My Subscriptions', callback_data: 'my_subscriptions' }]
      ]
    }
  }

  return NextResponse.json(welcomeMessage)
}

async function handleStatusCommand(telegramUserId: string, telegramUsername?: string, chatId?: number) {
  const userSubscriptions = getUserSubscriptions(telegramUserId)
  
  let statusMessage = `📊 Your Subscription Status\n\n`
  
  if (userSubscriptions.length === 0) {
    statusMessage += `❌ No active subscriptions found.\n\n` +
                    `To get access to premium channels, purchase a subscription from the AIO Dashboard.`
  } else {
    statusMessage += `✅ Active Subscriptions: ${userSubscriptions.length}\n\n`
    
    userSubscriptions.forEach((sub, index) => {
      const status = sub.isActive ? '🟢 Active' : '🔴 Expired'
      statusMessage += `${index + 1}. ${sub.channelName}\n` +
                      `   Creator: ${sub.creatorName}\n` +
                      `   Status: ${status}\n` +
                      `   Days Remaining: ${sub.daysRemaining}\n` +
                      `   Tier: ${sub.tier}\n\n`
    })
  }

  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: statusMessage,
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔄 Refresh Status', callback_data: 'refresh_status' }]
      ]
    }
  }

  return NextResponse.json(response)
}

async function handleSubscriptionsCommand(telegramUserId: string, telegramUsername?: string, chatId?: number) {
  const userSubscriptions = getUserSubscriptions(telegramUserId)
  
  let subsMessage = `📋 Your Premium Channel Subscriptions\n\n`
  
  if (userSubscriptions.length === 0) {
    subsMessage += `No subscriptions found.\n\n` +
                   `Purchase subscriptions from the AIO Dashboard to access premium channels.`
  } else {
    userSubscriptions.forEach((sub, index) => {
      const expiryDate = new Date(sub.subscriptionEndDate).toLocaleDateString()
      subsMessage += `${index + 1}. **${sub.channelName}**\n` +
                    `   👤 Creator: ${sub.creatorName}\n` +
                    `   📅 Expires: ${expiryDate}\n` +
                    `   ⏰ Days Left: ${sub.daysRemaining}\n` +
                    `   🎯 Tier: ${sub.tier}\n` +
                    `   Status: ${sub.isActive ? '✅ Active' : '❌ Expired'}\n\n`
    })
  }

  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: subsMessage,
    parse_mode: 'Markdown'
  }

  return NextResponse.json(response)
}

async function handleChannelJoinRequest(telegramUserId: string, telegramUsername: string | undefined, channelId: string, chatId?: number) {
  const hasAccess = checkChannelAccess(telegramUserId, channelId)
  
  let responseMessage: string
  
  if (hasAccess) {
    responseMessage = `✅ Access Granted!\n\n` +
                     `You have valid access to this premium channel.\n` +
                     `You can now join and participate in the channel.`
  } else {
    responseMessage = `❌ Access Denied\n\n` +
                     `You don't have valid access to this premium channel.\n\n` +
                     `To get access:\n` +
                     `1. Purchase a subscription from the AIO Dashboard\n` +
                     `2. Use the one-time access link provided after payment\n` +
                     `3. Return here to join the channel`
  }

  const response = {
    method: 'sendMessage',
    chat_id: chatId,
    text: responseMessage
  }

  return NextResponse.json(response)
}

async function handleAccessCheck(telegramUserId: string, telegramUsername: string | undefined, channelId: string) {
  const hasAccess = checkChannelAccess(telegramUserId, channelId)
  const subscription = getUserSubscriptions(telegramUserId).find(sub => sub.channelId === channelId)
  
  let message: string
  
  if (hasAccess && subscription) {
    message = `✅ Access Confirmed\n\n` +
             `Channel: ${subscription.channelName}\n` +
             `Days Remaining: ${subscription.daysRemaining}\n` +
             `Expires: ${new Date(subscription.subscriptionEndDate).toLocaleDateString()}`
  } else {
    message = `❌ No Access\n\n` +
             `You don't have valid access to this channel.`
  }

  return NextResponse.json({
    method: 'answerCallbackQuery',
    callback_query_id: telegramUserId,
    text: message,
    show_alert: true
  })
}

// Helper functions
function getUserSubscriptions(telegramUserId: string): UserSubscription[] {
  const subscriptions: UserSubscription[] = []
  const tokens = getTokensByTelegramUserId(telegramUserId)

  for (const tokenData of tokens) {
    if (tokenData.used) {
      const now = new Date()
      const endDate = new Date(tokenData.subscriptionEndDate)
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const isActive = now <= endDate

      subscriptions.push({
        userId: tokenData.userId,
        telegramUserId: tokenData.telegramUserId!,
        telegramUsername: tokenData.telegramUsername,
        channelId: tokenData.channelId,
        channelName: tokenData.channelName,
        creatorName: tokenData.creatorName,
        subscriptionEndDate: tokenData.subscriptionEndDate,
        tier: tokenData.tier,
        daysRemaining: Math.max(0, daysRemaining),
        isActive
      })
    }
  }

  return subscriptions
}

function checkChannelAccess(telegramUserId: string, channelId: string): boolean {
  const tokens = getTokensByTelegramUserId(telegramUserId)

  for (const tokenData of tokens) {
    if (tokenData.channelId === channelId && tokenData.used) {
      const now = new Date()
      const endDate = new Date(tokenData.subscriptionEndDate)
      return now <= endDate
    }
  }
  return false
}

// GET endpoint for bot status and webhook info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  if (action === 'status') {
    const stats = getStorageStats()
    return NextResponse.json({
      status: 'active',
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/bot-webhook`,
      active_subscriptions: stats.activeSubscriptions,
      total_tokens: stats.totalTokens,
      timestamp: new Date().toISOString()
    })
  }
  
  return NextResponse.json({
    message: 'Telegram Bot Webhook Endpoint',
    status: 'ready'
  })
}
