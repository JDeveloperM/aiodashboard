import { NextRequest, NextResponse } from 'next/server'
import {
  getAllAccessTokens,
  getStorageStats,
  deleteAccessToken,
  updateAccessToken,
  storeAccessToken,
  type StoredAccessToken
} from '@/lib/telegram-storage'

// Simple admin authentication (in production, use proper authentication)
const ADMIN_TOKEN = process.env.TELEGRAM_ADMIN_TOKEN || 'admin-token-change-me'

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return false
  
  const token = authHeader.replace('Bearer ', '')
  return token === ADMIN_TOKEN
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const channelId = searchParams.get('channelId')
    const creatorId = searchParams.get('creatorId')
    const status = searchParams.get('status') // 'used', 'unused', 'active', 'expired'

    // Get all tokens
    let tokens = getAllAccessTokens()

    // Apply filters
    if (userId) {
      tokens = tokens.filter(token => token.userId === userId)
    }

    if (channelId) {
      tokens = tokens.filter(token => token.channelId === channelId)
    }

    if (creatorId) {
      tokens = tokens.filter(token => token.creatorId === creatorId)
    }

    if (status) {
      const now = new Date()
      tokens = tokens.filter(token => {
        switch (status) {
          case 'used':
            return token.used
          case 'unused':
            return !token.used
          case 'active':
            return token.used && now <= new Date(token.subscriptionEndDate)
          case 'expired':
            return token.used && now > new Date(token.subscriptionEndDate)
          default:
            return true
        }
      })
    }

    // Sort by creation date (newest first)
    tokens.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Calculate statistics
    const stats = getStorageStats()

    return NextResponse.json({
      success: true,
      tokens,
      stats,
      count: tokens.length
    })

  } catch (error) {
    console.error('[Telegram Admin] Error fetching tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check admin authorization
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token parameter required' },
        { status: 400 }
      )
    }

    if (deleteAccessToken(token)) {
      console.log(`[Telegram Admin] Deleted token: ${token}`)

      return NextResponse.json({
        success: true,
        message: 'Token deleted successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('[Telegram Admin] Error deleting token:', error)
    return NextResponse.json(
      { error: 'Failed to delete token' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin authorization
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { token, updates } = body

    if (!token || !updates) {
      return NextResponse.json(
        { error: 'Token and updates required' },
        { status: 400 }
      )
    }

    // Update allowed fields
    const allowedUpdates = [
      'subscriptionEndDate',
      'subscriptionDuration',
      'used',
      'telegramUserId',
      'telegramUsername'
    ]

    const filteredUpdates: Partial<StoredAccessToken> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        (filteredUpdates as any)[key] = value
      }
    }

    if (updateAccessToken(token, filteredUpdates)) {
      console.log(`[Telegram Admin] Updated token: ${token}`)

      return NextResponse.json({
        success: true,
        message: 'Token updated successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('[Telegram Admin] Error updating token:', error)
    return NextResponse.json(
      { error: 'Failed to update token' },
      { status: 500 }
    )
  }
}

// POST endpoint for manual token creation (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      userId,
      creatorId,
      channelId,
      subscriptionDuration,
      tier,
      paymentAmount,
      channelName,
      creatorName
    } = body

    // Validate required fields
    if (!userId || !creatorId || !channelId || !subscriptionDuration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate token using the same logic as the main endpoint
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/generate-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        creatorId,
        channelId,
        subscriptionDuration,
        tier: tier || 'NOMAD',
        paymentAmount: paymentAmount || 0,
        channelName: channelName || 'Admin Created Channel',
        creatorName: creatorName || 'Admin'
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to generate token')
    }

    const result = await tokenResponse.json()
    console.log(`[Telegram Admin] Manually created token for user: ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'Token created successfully',
      ...result
    })

  } catch (error) {
    console.error('[Telegram Admin] Error creating token:', error)
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    )
  }
}
