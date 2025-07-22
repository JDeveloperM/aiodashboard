import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { action, userAddress, subscriptionId, newDuration, newRecurring } = await request.json()

    if (!action || !userAddress) {
      return NextResponse.json(
        { error: 'Action and user address are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'cancel':
        return await cancelSubscription(subscriptionId)
      
      case 'update':
        return await updateSubscription(subscriptionId, newDuration, newRecurring)
      
      case 'get_active':
        return await getActiveRecurringSubscription(userAddress)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Subscription management error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to manage subscription' },
      { status: 500 }
    )
  }
}

async function cancelSubscription(subscriptionId: string) {
  const { error } = await supabaseAdmin
    .from('affiliate_subscriptions')
    .update({
      auto_renew: false,
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', subscriptionId)
    .eq('is_recurring', true)

  if (error) {
    throw new Error(`Failed to cancel subscription: ${error.message}`)
  }

  return NextResponse.json({ success: true, message: 'Subscription cancelled successfully' })
}

async function updateSubscription(subscriptionId: string, newDuration?: number, newRecurring?: boolean) {
  const updates: any = {
    updated_at: new Date().toISOString()
  }

  if (newDuration !== undefined) {
    updates.duration_days = newDuration
    // Update subscription type based on new duration
    if (newRecurring) {
      updates.subscription_type = newDuration >= 365 ? 'recurring_yearly' : 
                                 newDuration >= 90 ? 'recurring_quarterly' : 
                                 'recurring_monthly'
    } else {
      updates.subscription_type = newDuration >= 90 ? 'one_time_90_days' :
                                 newDuration >= 60 ? 'one_time_60_days' :
                                 'one_time_30_days'
    }
  }

  if (newRecurring !== undefined) {
    updates.is_recurring = newRecurring
    updates.auto_renew = newRecurring
  }

  const { error } = await supabaseAdmin
    .from('affiliate_subscriptions')
    .update(updates)
    .eq('id', subscriptionId)

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`)
  }

  return NextResponse.json({ success: true, message: 'Subscription updated successfully' })
}

async function getActiveRecurringSubscription(userAddress: string) {
  const { data, error } = await supabaseAdmin
    .from('affiliate_subscriptions')
    .select('*')
    .eq('user_address', userAddress)
    .eq('is_recurring', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    throw new Error(`Failed to get active subscription: ${error.message}`)
  }

  return NextResponse.json({ subscription: data?.[0] || null })
}
