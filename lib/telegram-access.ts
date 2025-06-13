import QRCode from 'qrcode'

export interface TelegramAccessData {
  userId: string
  creatorId: string
  channelId: string
  subscriptionDuration: number
  tier: 'NOMAD' | 'PRO' | 'ROYAL'
  paymentAmount: number
  channelName: string
  creatorName: string
}

export interface AccessLinkResponse {
  success: boolean
  accessUrl?: string
  token?: string
  qrCodeDataUrl?: string
  subscriptionDetails?: {
    channelName: string
    creatorName: string
    duration: number
    startDate: string
    endDate: string
    tier: string
    paymentAmount: number
  }
  error?: string
}

/**
 * Generate a one-time access link for a premium Telegram channel
 */
export async function generateTelegramAccessLink(data: TelegramAccessData): Promise<AccessLinkResponse> {
  try {
    const response = await fetch('/api/telegram/generate-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to generate access link')
    }

    const result = await response.json()
    
    // Generate QR code for the access URL
    const qrCodeDataUrl = await QRCode.toDataURL(result.accessUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    return {
      ...result,
      qrCodeDataUrl
    }

  } catch (error) {
    console.error('[Telegram Access] Error generating access link:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get user's active subscriptions
 */
export async function getUserSubscriptions(userId: string) {
  try {
    const response = await fetch(`/api/telegram/generate-access?userId=${userId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch user subscriptions')
    }

    const result = await response.json()
    return result.tokens || []

  } catch (error) {
    console.error('[Telegram Access] Error fetching subscriptions:', error)
    return []
  }
}

/**
 * Validate if a subscription is still active
 */
export function isSubscriptionActive(subscriptionEndDate: string): boolean {
  const now = new Date()
  const endDate = new Date(subscriptionEndDate)
  return now <= endDate
}

/**
 * Calculate days remaining in subscription
 */
export function getDaysRemaining(subscriptionEndDate: string): number {
  const now = new Date()
  const endDate = new Date(subscriptionEndDate)
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Format subscription duration for display
 */
export function formatSubscriptionDuration(days: number): string {
  if (days === 30) return '1 Month'
  if (days === 60) return '2 Months'
  if (days === 90) return '3 Months'
  if (days === 365) return '1 Year'
  return `${days} Days`
}

/**
 * Generate a shareable access link with additional parameters
 */
export function generateShareableLink(accessUrl: string, channelName: string, creatorName: string): string {
  const url = new URL(accessUrl)
  url.searchParams.set('channel', channelName)
  url.searchParams.set('creator', creatorName)
  url.searchParams.set('source', 'share')
  return url.toString()
}

/**
 * Create a Telegram deep link for bot interaction
 */
export function createTelegramBotLink(botUsername: string, startParameter?: string): string {
  const baseUrl = `https://t.me/${botUsername}`
  return startParameter ? `${baseUrl}?start=${startParameter}` : baseUrl
}

/**
 * Validate access token format
 */
export function isValidAccessToken(token: string): boolean {
  // Check if token is a valid hex string of expected length (64 characters for 32 bytes)
  return /^[a-f0-9]{64}$/i.test(token)
}

/**
 * Extract token from access URL
 */
export function extractTokenFromUrl(accessUrl: string): string | null {
  try {
    const url = new URL(accessUrl)
    const pathParts = url.pathname.split('/')
    const token = pathParts[pathParts.length - 1]
    return isValidAccessToken(token) ? token : null
  } catch {
    return null
  }
}

/**
 * Create subscription summary for display
 */
export interface SubscriptionSummary {
  channelName: string
  creatorName: string
  duration: string
  startDate: string
  endDate: string
  daysRemaining: number
  isActive: boolean
  tier: string
  paymentAmount: number
  accessUrl: string
  qrCodeDataUrl?: string
}

export async function createSubscriptionSummary(
  accessLinkResponse: AccessLinkResponse
): Promise<SubscriptionSummary | null> {
  if (!accessLinkResponse.success || !accessLinkResponse.subscriptionDetails || !accessLinkResponse.accessUrl) {
    return null
  }

  const { subscriptionDetails, accessUrl, qrCodeDataUrl } = accessLinkResponse
  const daysRemaining = getDaysRemaining(subscriptionDetails.endDate)
  const isActive = isSubscriptionActive(subscriptionDetails.endDate)

  return {
    channelName: subscriptionDetails.channelName,
    creatorName: subscriptionDetails.creatorName,
    duration: formatSubscriptionDuration(subscriptionDetails.duration),
    startDate: new Date(subscriptionDetails.startDate).toLocaleDateString(),
    endDate: new Date(subscriptionDetails.endDate).toLocaleDateString(),
    daysRemaining,
    isActive,
    tier: subscriptionDetails.tier,
    paymentAmount: subscriptionDetails.paymentAmount,
    accessUrl,
    qrCodeDataUrl
  }
}

/**
 * Copy text to clipboard (for sharing access links)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const success = document.execCommand('copy')
      textArea.remove()
      return success
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Download QR code as image
 */
export function downloadQRCode(qrCodeDataUrl: string, filename: string = 'telegram-access-qr.png') {
  const link = document.createElement('a')
  link.download = filename
  link.href = qrCodeDataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Generate instructions for using the access link
 */
export function generateAccessInstructions(channelName: string, creatorName: string): string {
  return `🔗 One-Time Access Link for ${channelName}

📋 Instructions:
1. Click the access link or scan the QR code
2. This will activate your subscription and grant access
3. Join the Telegram channel using the provided link
4. The bot will verify your subscription automatically

⚠️ Important:
• This link can only be used ONCE
• Keep it secure and don't share with others
• Your subscription will be tracked by the Telegram bot
• Contact ${creatorName} if you have any issues

🤖 Bot Commands:
• /status - Check your subscription status
• /subs - View all your subscriptions
• /help - Get help and support`
}

export default {
  generateTelegramAccessLink,
  getUserSubscriptions,
  isSubscriptionActive,
  getDaysRemaining,
  formatSubscriptionDuration,
  generateShareableLink,
  createTelegramBotLink,
  isValidAccessToken,
  extractTokenFromUrl,
  createSubscriptionSummary,
  copyToClipboard,
  downloadQRCode,
  generateAccessInstructions
}
