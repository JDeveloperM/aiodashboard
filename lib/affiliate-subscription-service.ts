"use client"

import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Types and interfaces
export interface AffiliateSubscription {
  id: string
  user_address: string
  subscription_type: 'trial' | 'monthly' | 'bonus'
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  price_usdc: number
  price_sui?: number
  sui_usd_rate?: number
  duration_days: number
  starts_at: string
  expires_at: string
  transaction_hash?: string
  payment_verified: boolean
  bonus_source?: 'rafflecraft_ticket' | 'promotion' | 'manual'
  bonus_reference_id?: string
  created_at: string
  updated_at: string
}

export interface AffiliatePayment {
  id: string
  user_address: string
  subscription_id: string
  amount_sui: number
  amount_usdc_equivalent: number
  sui_usd_rate: number
  transaction_hash: string
  block_height?: number
  transaction_timestamp?: string
  status: 'pending' | 'confirmed' | 'failed' | 'refunded'
  verification_attempts: number
  last_verification_at?: string
  created_at: string
  updated_at: string
}

export interface RaffleCraftBonusEvent {
  id: string
  user_address: string
  ticket_purchase_id: string
  ticket_transaction_hash: string
  raffle_id?: string
  bonus_days: number
  bonus_applied: boolean
  bonus_applied_at?: string
  affiliate_subscription_id?: string
  event_detected_at: string
  processed_at?: string
  created_at: string
  updated_at: string
}

export interface SubscriptionStatus {
  status: 'trial' | 'active' | 'expired' | 'cancelled'
  isActive: boolean
  daysRemaining: number
  expiresAt: string
  trialExpiresAt?: string
  subscriptionExpiresAt?: string
  autoRenew: boolean
  currentSubscription?: AffiliateSubscription
}

export interface PriceQuote {
  usdcPrice: number
  suiPrice: number
  suiUsdRate: number
  validUntil: string
}

class AffiliateSubscriptionService {
  /**
   * Get current subscription status for a user
   */
  async getSubscriptionStatus(userAddress: string): Promise<SubscriptionStatus> {
    try {
      console.log('🔍 Getting subscription status for:', userAddress)

      // Get user profile with subscription fields
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          affiliate_subscription_status,
          affiliate_trial_started_at,
          affiliate_trial_expires_at,
          affiliate_subscription_expires_at,
          affiliate_subscription_auto_renew
        `)
        .eq('address', userAddress)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        throw profileError
      }

      if (!profile) {
        throw new Error('User profile not found')
      }

      // Get current active subscription
      const { data: currentSub, error: subError } = await supabase
        .from('affiliate_subscriptions')
        .select('*')
        .eq('user_address', userAddress)
        .eq('status', 'active')
        .order('expires_at', { ascending: false })
        .limit(1)
        .single()

      if (subError && subError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching subscription:', subError)
      }

      const now = new Date()
      const trialExpires = profile.affiliate_trial_expires_at ? new Date(profile.affiliate_trial_expires_at) : null
      const subscriptionExpires = profile.affiliate_subscription_expires_at ? new Date(profile.affiliate_subscription_expires_at) : null

      let status: 'trial' | 'active' | 'expired' | 'cancelled' = profile.affiliate_subscription_status || 'trial'
      let isActive = false
      let daysRemaining = 0
      let expiresAt = ''

      // Determine current status and remaining days
      if (status === 'trial' && trialExpires) {
        isActive = now < trialExpires
        daysRemaining = isActive ? Math.ceil((trialExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
        expiresAt = trialExpires.toISOString()
      } else if (status === 'active' && subscriptionExpires) {
        isActive = now < subscriptionExpires
        daysRemaining = isActive ? Math.ceil((subscriptionExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
        expiresAt = subscriptionExpires.toISOString()
        
        // If subscription expired, update status
        if (!isActive) {
          await this.updateUserSubscriptionStatus(userAddress, 'expired')
          status = 'expired'
        }
      } else if (status === 'expired' || status === 'cancelled') {
        isActive = false
        daysRemaining = 0
        expiresAt = subscriptionExpires?.toISOString() || trialExpires?.toISOString() || ''
      }

      return {
        status,
        isActive,
        daysRemaining,
        expiresAt,
        trialExpiresAt: trialExpires?.toISOString(),
        subscriptionExpiresAt: subscriptionExpires?.toISOString(),
        autoRenew: profile.affiliate_subscription_auto_renew || false,
        currentSubscription: currentSub || undefined
      }

    } catch (error) {
      console.error('Failed to get subscription status:', error)
      return {
        status: 'expired',
        isActive: false,
        daysRemaining: 0,
        expiresAt: '',
        autoRenew: false
      }
    }
  }

  /**
   * Get current SUI/USD price quote for subscription
   */
  async getPriceQuote(): Promise<PriceQuote> {
    try {
      // In a real implementation, you would fetch from a price API like CoinGecko
      // For now, using a mock rate - replace with actual API call
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd')
      const data = await response.json()
      
      const suiUsdRate = data.sui?.usd || 2.50 // Fallback rate
      const usdcPrice = 15.00 // $15 USDC equivalent
      const suiPrice = usdcPrice / suiUsdRate
      
      return {
        usdcPrice,
        suiPrice: Math.ceil(suiPrice * 1000000000) / 1000000000, // Round up to 9 decimal places
        suiUsdRate,
        validUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Valid for 5 minutes
      }
    } catch (error) {
      console.error('Failed to get price quote:', error)
      // Fallback pricing
      return {
        usdcPrice: 15.00,
        suiPrice: 6.0, // Assuming $2.50 per SUI
        suiUsdRate: 2.50,
        validUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      }
    }
  }

  /**
   * Create a new subscription (payment pending)
   */
  async createSubscription(
    userAddress: string, 
    priceQuote: PriceQuote,
    transactionHash: string
  ): Promise<AffiliateSubscription> {
    try {
      console.log('💳 Creating subscription for:', userAddress)

      const now = new Date()
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

      const subscriptionData = {
        user_address: userAddress,
        subscription_type: 'monthly' as const,
        status: 'pending' as const,
        price_usdc: priceQuote.usdcPrice,
        price_sui: priceQuote.suiPrice,
        sui_usd_rate: priceQuote.suiUsdRate,
        duration_days: 30,
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        transaction_hash: transactionHash,
        payment_verified: false
      }

      const { data, error } = await supabase
        .from('affiliate_subscriptions')
        .insert(subscriptionData)
        .select()
        .single()

      if (error) {
        console.error('Error creating subscription:', error)
        throw error
      }

      // Create payment record
      await this.createPaymentRecord(userAddress, data.id, priceQuote, transactionHash)

      console.log('✅ Subscription created:', data.id)
      return data
    } catch (error) {
      console.error('Failed to create subscription:', error)
      throw error
    }
  }

  /**
   * Create payment record
   */
  private async createPaymentRecord(
    userAddress: string,
    subscriptionId: string,
    priceQuote: PriceQuote,
    transactionHash: string
  ): Promise<AffiliatePayment> {
    const paymentData = {
      user_address: userAddress,
      subscription_id: subscriptionId,
      amount_sui: priceQuote.suiPrice,
      amount_usdc_equivalent: priceQuote.usdcPrice,
      sui_usd_rate: priceQuote.suiUsdRate,
      transaction_hash: transactionHash,
      status: 'pending' as const,
      verification_attempts: 0
    }

    const { data, error } = await supabase
      .from('affiliate_payments')
      .insert(paymentData)
      .select()
      .single()

    if (error) {
      console.error('Error creating payment record:', error)
      throw error
    }

    return data
  }

  /**
   * Verify payment and activate subscription
   */
  async verifyAndActivateSubscription(transactionHash: string): Promise<boolean> {
    try {
      console.log('🔍 Verifying payment:', transactionHash)

      // In a real implementation, you would verify the transaction on the SUI blockchain
      // For now, we'll simulate verification
      const isValid = await this.verifyTransactionOnChain(transactionHash)

      if (!isValid) {
        console.log('❌ Transaction verification failed')
        return false
      }

      // Update payment status
      const { data: payment, error: paymentError } = await supabase
        .from('affiliate_payments')
        .update({ 
          status: 'confirmed',
          last_verification_at: new Date().toISOString(),
          verification_attempts: 1
        })
        .eq('transaction_hash', transactionHash)
        .select()
        .single()

      if (paymentError) {
        console.error('Error updating payment:', paymentError)
        return false
      }

      // Activate subscription
      const { error: subError } = await supabase
        .from('affiliate_subscriptions')
        .update({ 
          status: 'active',
          payment_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.subscription_id)

      if (subError) {
        console.error('Error activating subscription:', subError)
        return false
      }

      console.log('✅ Subscription activated successfully')
      return true
    } catch (error) {
      console.error('Failed to verify and activate subscription:', error)
      return false
    }
  }

  /**
   * Simulate blockchain transaction verification
   * In production, this would call SUI RPC to verify the transaction
   */
  private async verifyTransactionOnChain(transactionHash: string): Promise<boolean> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // For demo purposes, assume all transactions are valid
    // In production, implement actual SUI blockchain verification
    return true
  }

  /**
   * Process RaffleCraft ticket purchase bonus
   */
  async processRaffleCraftBonus(
    userAddress: string,
    ticketPurchaseId: string,
    ticketTransactionHash: string,
    raffleId?: string,
    bonusDays: number = 7
  ): Promise<boolean> {
    try {
      console.log('🎟️ Processing RaffleCraft bonus for:', userAddress)

      // Check if bonus already applied for this ticket
      const { data: existingBonus, error: checkError } = await supabase
        .from('rafflecraft_bonus_events')
        .select('id')
        .eq('ticket_purchase_id', ticketPurchaseId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing bonus:', checkError)
        throw checkError
      }

      if (existingBonus) {
        console.log('⚠️ Bonus already applied for this ticket purchase')
        return false
      }

      // Create bonus event record
      const bonusEventData = {
        user_address: userAddress,
        ticket_purchase_id: ticketPurchaseId,
        ticket_transaction_hash: ticketTransactionHash,
        raffle_id: raffleId,
        bonus_days: bonusDays,
        bonus_applied: false,
        event_detected_at: new Date().toISOString()
      }

      const { data: bonusEvent, error: bonusError } = await supabase
        .from('rafflecraft_bonus_events')
        .insert(bonusEventData)
        .select()
        .single()

      if (bonusError) {
        console.error('Error creating bonus event:', bonusError)
        throw bonusError
      }

      // Apply the bonus
      const bonusApplied = await this.applySubscriptionBonus(userAddress, bonusDays, bonusEvent.id, 'rafflecraft_ticket', ticketPurchaseId)

      if (bonusApplied) {
        // Update bonus event as applied
        await supabase
          .from('rafflecraft_bonus_events')
          .update({
            bonus_applied: true,
            bonus_applied_at: new Date().toISOString(),
            processed_at: new Date().toISOString()
          })
          .eq('id', bonusEvent.id)

        console.log('✅ RaffleCraft bonus applied successfully')
        toast.success(`🎟️ Bonus! +${bonusDays} days added to your affiliate subscription from RaffleCraft ticket purchase!`)
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to process RaffleCraft bonus:', error)
      return false
    }
  }

  /**
   * Apply subscription bonus (extend current subscription or create bonus subscription)
   */
  async applySubscriptionBonus(
    userAddress: string,
    bonusDays: number,
    bonusEventId: string,
    bonusSource: 'rafflecraft_ticket' | 'promotion' | 'manual',
    bonusReferenceId: string
  ): Promise<boolean> {
    try {
      console.log(`🎁 Applying ${bonusDays} day bonus for:`, userAddress)

      const currentStatus = await this.getSubscriptionStatus(userAddress)
      const now = new Date()

      let newExpiresAt: Date

      if (currentStatus.isActive) {
        // Extend current subscription
        const currentExpires = new Date(currentStatus.expiresAt)
        newExpiresAt = new Date(currentExpires.getTime() + bonusDays * 24 * 60 * 60 * 1000)

        // Update current subscription expiry
        if (currentStatus.status === 'trial') {
          await supabase
            .from('user_profiles')
            .update({
              affiliate_trial_expires_at: newExpiresAt.toISOString(),
              updated_at: now.toISOString()
            })
            .eq('address', userAddress)
        } else {
          await supabase
            .from('user_profiles')
            .update({
              affiliate_subscription_expires_at: newExpiresAt.toISOString(),
              updated_at: now.toISOString()
            })
            .eq('address', userAddress)
        }
      } else {
        // Create new bonus subscription
        newExpiresAt = new Date(now.getTime() + bonusDays * 24 * 60 * 60 * 1000)

        const bonusSubscriptionData = {
          user_address: userAddress,
          subscription_type: 'bonus' as const,
          status: 'active' as const,
          price_usdc: 0,
          duration_days: bonusDays,
          starts_at: now.toISOString(),
          expires_at: newExpiresAt.toISOString(),
          payment_verified: true,
          bonus_source: bonusSource,
          bonus_reference_id: bonusReferenceId
        }

        const { data: bonusSub, error: bonusSubError } = await supabase
          .from('affiliate_subscriptions')
          .insert(bonusSubscriptionData)
          .select()
          .single()

        if (bonusSubError) {
          console.error('Error creating bonus subscription:', bonusSubError)
          throw bonusSubError
        }

        // Update user profile status
        await supabase
          .from('user_profiles')
          .update({
            affiliate_subscription_status: 'active',
            affiliate_subscription_expires_at: newExpiresAt.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('address', userAddress)

        // Link bonus event to subscription
        await supabase
          .from('rafflecraft_bonus_events')
          .update({ affiliate_subscription_id: bonusSub.id })
          .eq('id', bonusEventId)
      }

      console.log('✅ Subscription bonus applied successfully')
      return true
    } catch (error) {
      console.error('Failed to apply subscription bonus:', error)
      return false
    }
  }

  /**
   * Check if user has active affiliate subscription (for access control)
   */
  async hasActiveSubscription(userAddress: string): Promise<boolean> {
    const status = await this.getSubscriptionStatus(userAddress)
    return status.isActive
  }

  /**
   * Get subscription history for a user
   */
  async getSubscriptionHistory(userAddress: string): Promise<AffiliateSubscription[]> {
    try {
      const { data, error } = await supabase
        .from('affiliate_subscriptions')
        .select('*')
        .eq('user_address', userAddress)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching subscription history:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Failed to get subscription history:', error)
      return []
    }
  }

  /**
   * Update user subscription status in user_profiles table
   */
  private async updateUserSubscriptionStatus(
    userAddress: string,
    status: 'trial' | 'active' | 'expired' | 'cancelled'
  ): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        affiliate_subscription_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('address', userAddress)

    if (error) {
      console.error('Error updating user subscription status:', error)
      throw error
    }
  }
}

// Export singleton instance
export const affiliateSubscriptionService = new AffiliateSubscriptionService()
