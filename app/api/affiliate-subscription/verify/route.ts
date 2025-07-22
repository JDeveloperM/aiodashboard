import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { transactionHash } = await request.json()

    if (!transactionHash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      )
    }

    // Find the subscription by transaction hash
    const { data: subscription, error: findError } = await supabaseAdmin
      .from('affiliate_subscriptions')
      .select('*')
      .eq('transaction_hash', transactionHash)
      .single()

    if (findError || !subscription) {
      console.error('Subscription not found:', findError)
      return NextResponse.json({ verified: false })
    }

    // First, get current user profile to check existing subscription
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('affiliate_subscription_expires_at')
      .eq('address', subscription.user_address)
      .single()

    // Calculate new expiration date
    let newExpiresAt = new Date(subscription.expires_at)

    // If user has an existing active subscription, extend from that date
    if (profile?.affiliate_subscription_expires_at) {
      const currentExpiration = new Date(profile.affiliate_subscription_expires_at)
      const now = new Date()

      // If current subscription is still active, extend from current expiration
      if (currentExpiration > now) {
        newExpiresAt = new Date(currentExpiration.getTime() + subscription.duration_days * 24 * 60 * 60 * 1000)
        console.log(`🔄 Extending existing subscription from ${currentExpiration.toISOString()} to ${newExpiresAt.toISOString()}`)
      }
    }

    // Update subscription status to active with correct expiration
    const { error: updateError } = await supabaseAdmin
      .from('affiliate_subscriptions')
      .update({
        status: 'active',
        payment_verified: true,
        expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('transaction_hash', transactionHash)

    if (updateError) {
      console.error('Failed to update subscription:', updateError)
      throw new Error(`Failed to update subscription: ${updateError.message}`)
    }

    // Update user profile with extended expiration
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        affiliate_subscription_status: 'active',
        affiliate_subscription_expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('address', subscription.user_address)

    if (profileError) {
      console.error('Failed to update user profile:', profileError)
      // Don't fail the whole operation for profile update errors
    }

    return NextResponse.json({ verified: true })
  } catch (error: any) {
    console.error('Verify subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify subscription' },
      { status: 500 }
    )
  }
}
