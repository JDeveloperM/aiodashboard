import { NextRequest, NextResponse } from 'next/server'
import { affiliateService } from '@/lib/affiliate-service'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referralCode, sessionId, userAgent, referrerUrl } = body

    // Validate required fields
    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      )
    }

    // Generate session ID if not provided
    const finalSessionId = sessionId || uuidv4()

    // Get IP address from request
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Track the referral click
    const success = await affiliateService.trackReferralClick(
      referralCode,
      finalSessionId,
      ipAddress,
      userAgent,
      referrerUrl
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Invalid referral code or tracking failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      sessionId: finalSessionId,
      message: 'Referral click tracked successfully'
    })

  } catch (error) {
    console.error('Error tracking referral:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get referral session data
    const session = await affiliateService.getReferralSession(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Referral session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session
    })

  } catch (error) {
    console.error('Error getting referral session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
