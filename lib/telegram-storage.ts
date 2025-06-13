// Telegram access token storage
// In production, this should be replaced with a proper database

export interface AccessTokenData {
  userId: string
  creatorId: string
  channelId: string
  subscriptionDuration: number // in days
  subscriptionStartDate: string
  subscriptionEndDate: string
  tier: 'NOMAD' | 'PRO' | 'ROYAL'
  paymentAmount: number
  channelName: string
  creatorName: string
}

export interface StoredAccessToken extends AccessTokenData {
  token: string
  used: boolean
  createdAt: string
  usedAt?: string
  telegramUserId?: string
  telegramUsername?: string
}

// In-memory storage for demo purposes
// In production, use a proper database like PostgreSQL, MongoDB, etc.
export const accessTokens = new Map<string, StoredAccessToken>()

// Helper functions for token management
export function storeAccessToken(token: string, data: StoredAccessToken): void {
  accessTokens.set(token, data)
}

export function getAccessToken(token: string): StoredAccessToken | undefined {
  return accessTokens.get(token)
}

export function updateAccessToken(token: string, updates: Partial<StoredAccessToken>): boolean {
  const existing = accessTokens.get(token)
  if (!existing) return false
  
  accessTokens.set(token, { ...existing, ...updates })
  return true
}

export function deleteAccessToken(token: string): boolean {
  return accessTokens.delete(token)
}

export function getAllAccessTokens(): StoredAccessToken[] {
  return Array.from(accessTokens.values())
}

export function getTokensByUserId(userId: string): StoredAccessToken[] {
  return Array.from(accessTokens.values()).filter(token => token.userId === userId)
}

export function getTokensByTelegramUserId(telegramUserId: string): StoredAccessToken[] {
  return Array.from(accessTokens.values()).filter(token => token.telegramUserId === telegramUserId)
}

export function getActiveSubscriptions(): StoredAccessToken[] {
  const now = new Date()
  return Array.from(accessTokens.values()).filter(token => {
    if (!token.used) return false
    return now <= new Date(token.subscriptionEndDate)
  })
}

export function getExpiredSubscriptions(): StoredAccessToken[] {
  const now = new Date()
  return Array.from(accessTokens.values()).filter(token => {
    if (!token.used) return false
    return now > new Date(token.subscriptionEndDate)
  })
}

export function getStorageStats() {
  const tokens = Array.from(accessTokens.values())
  const now = new Date()
  
  return {
    totalTokens: tokens.length,
    usedTokens: tokens.filter(t => t.used).length,
    activeSubscriptions: tokens.filter(t => {
      if (!t.used) return false
      return now <= new Date(t.subscriptionEndDate)
    }).length,
    expiredSubscriptions: tokens.filter(t => {
      if (!t.used) return false
      return now > new Date(t.subscriptionEndDate)
    }).length,
    totalRevenue: tokens.reduce((sum, t) => sum + t.paymentAmount, 0)
  }
}
