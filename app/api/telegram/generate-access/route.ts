import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import {
  type AccessTokenData,
  type StoredAccessToken,
  storeAccessToken,
  getAccessToken,
  getTokensByUserId
} from '@/lib/telegram-storage'

export async function POST(request: NextRequest) {
  try {
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
    }: Omit<AccessTokenData, 'subscriptionStartDate' | 'subscriptionEndDate'> = body

    // Validate required fields
    if (!userId || !creatorId || !channelId || !subscriptionDuration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate secure access token
    const token = randomBytes(32).toString('hex')
    
    // Calculate subscription dates
    const subscriptionStartDate = new Date().toISOString()
    const subscriptionEndDate = new Date(
      Date.now() + subscriptionDuration * 24 * 60 * 60 * 1000
    ).toISOString()

    // Create access token data
    const accessTokenData: StoredAccessToken = {
      token,
      userId,
      creatorId,
      channelId,
      subscriptionDuration,
      subscriptionStartDate,
      subscriptionEndDate,
      tier,
      paymentAmount,
      channelName,
      creatorName,
      used: false,
      createdAt: new Date().toISOString()
    }

    // Store the token
    storeAccessToken(token, accessTokenData)

    // Generate access URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const accessUrl = `${baseUrl}/api/telegram/access/${token}`

    // Log for debugging
    console.log(`[Telegram Access] Generated token for user ${userId}, channel ${channelId}`)
    console.log(`[Telegram Access] Token expires: ${subscriptionEndDate}`)

    return NextResponse.json({
      success: true,
      accessUrl,
      token,
      subscriptionDetails: {
        channelName,
        creatorName,
        duration: subscriptionDuration,
        startDate: subscriptionStartDate,
        endDate: subscriptionEndDate,
        tier,
        paymentAmount
      }
    })

  } catch (error) {
    console.error('[Telegram Access] Error generating access token:', error)
    return NextResponse.json(
      { error: 'Failed to generate access token' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve token details (for admin/debugging)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const userId = searchParams.get('userId')

    if (token) {
      const tokenData = getAccessToken(token)
      if (!tokenData) {
        return NextResponse.json(
          { error: 'Token not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        tokenData: {
          ...tokenData,
          token: undefined // Don't expose the actual token
        }
      })
    }

    if (userId) {
      // Get all tokens for a user
      const userTokens = getTokensByUserId(userId)
        .map(tokenData => ({
          ...tokenData,
          token: undefined // Don't expose the actual tokens
        }))

      return NextResponse.json({
        success: true,
        tokens: userTokens
      })
    }

    return NextResponse.json(
      { error: 'Token or userId parameter required' },
      { status: 400 }
    )

  } catch (error) {
    console.error('[Telegram Access] Error retrieving token:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve token' },
      { status: 500 }
    )
  }
}


