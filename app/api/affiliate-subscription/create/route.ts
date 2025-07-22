import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { userAddress, priceQuote, transactionHash, durationDays, isRecurring = false } = await request.json()

    if (!userAddress || !priceQuote || !transactionHash || !durationDays) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Create subscription record directly with admin client
    const now = new Date()
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)

    // Determine subscription type based on duration and recurring setting
    let subscriptionType = 'one_time_30_days'
    if (isRecurring) {
      subscriptionType = durationDays >= 365 ? 'recurring_yearly' :
                        durationDays >= 90 ? 'recurring_quarterly' :
                        'recurring_monthly'
    } else {
      subscriptionType = durationDays >= 90 ? 'one_time_90_days' :
                        durationDays >= 60 ? 'one_time_60_days' :
                        'one_time_30_days'
    }

    const subscriptionData = {
      user_address: userAddress,
      transaction_hash: transactionHash,
      price_sui: priceQuote.suiPrice,
      price_usdc: priceQuote.usdcPrice,
      sui_usd_rate: priceQuote.suiUsdRate,
      duration_days: durationDays,
      subscription_type: subscriptionType,
      is_recurring: isRecurring,
      auto_renew: isRecurring,
      next_billing_date: isRecurring ? expiresAt.toISOString() : null,
      status: 'pending',
      payment_verified: false,
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('affiliate_subscriptions')
      .insert(subscriptionData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({ subscription: data })
  } catch (error: any) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
