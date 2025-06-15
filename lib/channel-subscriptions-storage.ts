/**
 * Channel Subscriptions Storage
 * Database + Walrus integration for user channel memberships
 */

import { createClient } from '@supabase/supabase-js'
import { walrusService } from './walrus-client'
import { toast } from 'sonner'

// Database schema interfaces
interface ChannelSubscription {
  id: string
  user_address: string
  creator_address: string
  channel_id: string
  
  // Channel metadata
  channel_name: string
  channel_type: 'free' | 'premium' | 'vip'
  channel_description?: string
  channel_avatar_blob_id?: string
  
  // Subscription details
  subscription_status: 'active' | 'expired' | 'cancelled'
  subscription_tier: 'free' | 'premium' | 'vip'
  price_paid: number
  
  // Dates
  joined_date: string
  expiry_date?: string
  last_accessed: string
  
  // Telegram integration
  telegram_channel_url?: string
  telegram_access_token?: string
  
  // Metadata
  created_at: string
  updated_at: string
}

// UI-friendly channel interface
export interface UserChannel {
  id: string
  name: string
  type: 'free' | 'premium' | 'vip'
  description?: string
  avatarUrl?: string
  avatarBlobId?: string
  subscribers: number
  color: string
  
  // Subscription info
  joinedDate: string
  expiryDate?: string
  isActive: boolean
  daysRemaining?: number
  
  // Creator info
  creatorAddress: string
  telegramUrl?: string
}

class ChannelSubscriptionsStorage {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  /**
   * Get all channels that a user has joined
   */
  async getUserChannels(userAddress: string): Promise<UserChannel[]> {
    try {
      console.log('📺 Fetching user channels for address:', userAddress)

      const { data: subscriptions, error } = await this.supabase
        .from('channel_subscriptions')
        .select('*')
        .eq('user_address', userAddress)
        .order('joined_date', { ascending: false })

      if (error) {
        console.error('❌ Error fetching user channels:', error)
        throw error
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log('📺 No channels found for user')
        return []
      }

      console.log(`📺 Found ${subscriptions.length} channel subscriptions`)

      // Convert database records to UI-friendly format
      const channels: UserChannel[] = await Promise.all(
        subscriptions.map(async (sub: ChannelSubscription) => {
          // Get avatar URL from Walrus if available
          let avatarUrl: string | undefined
          if (sub.channel_avatar_blob_id) {
            try {
              avatarUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${sub.channel_avatar_blob_id}`
              console.log(`🖼️ Generated avatar URL for channel ${sub.channel_name}:`, avatarUrl)
            } catch (error) {
              console.warn('⚠️ Failed to get avatar URL for channel:', sub.channel_id, error)
            }
          } else {
            console.log(`⚠️ No avatar blob ID found for channel ${sub.channel_name}`)
          }

          // Calculate subscription status
          const now = new Date()
          const expiryDate = sub.expiry_date ? new Date(sub.expiry_date) : null
          const isActive = sub.subscription_status === 'active' && 
                          (!expiryDate || now <= expiryDate)
          
          let daysRemaining: number | undefined
          if (expiryDate && isActive) {
            daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          }

          // Generate color based on channel type
          const typeColors = {
            free: '#10b981',
            premium: '#f59e0b', 
            vip: '#f97316'
          }

          return {
            id: sub.channel_id,
            name: sub.channel_name,
            type: sub.channel_type,
            description: sub.channel_description,
            avatarUrl,
            avatarBlobId: sub.channel_avatar_blob_id,
            subscribers: 0, // TODO: Get from creators table or separate tracking
            color: typeColors[sub.channel_type],
            
            // Subscription info
            joinedDate: sub.joined_date,
            expiryDate: sub.expiry_date,
            isActive,
            daysRemaining,
            
            // Creator info
            creatorAddress: sub.creator_address,
            telegramUrl: sub.telegram_channel_url
          }
        })
      )

      console.log(`✅ Successfully processed ${channels.length} user channels`)
      return channels

    } catch (error) {
      console.error('❌ Failed to fetch user channels:', error)
      throw error
    }
  }

  /**
   * Add a new channel subscription for a user
   */
  async addChannelSubscription(
    userAddress: string,
    channelData: {
      creatorAddress: string
      channelId: string
      channelName: string
      channelType: 'free' | 'premium' | 'vip'
      channelDescription?: string
      pricePaid?: number
      subscriptionTier?: 'free' | 'premium' | 'vip'
      expiryDate?: string
      telegramChannelUrl?: string
      avatarFile?: File
      channelAvatarBlobId?: string // Use existing blob ID from creator's profile
    },
    signer?: any
  ): Promise<string> {
    try {
      console.log('➕ Adding channel subscription for user:', userAddress)

      let avatarBlobId: string | undefined

      // Use provided blob ID or store new avatar in Walrus if provided
      if (channelData.channelAvatarBlobId && channelData.channelAvatarBlobId !== 'fallback_avatar_blob') {
        avatarBlobId = channelData.channelAvatarBlobId
        console.log(`🔗 Using existing channel avatar blob ID: ${avatarBlobId}`)
      } else if (channelData.avatarFile) {
        console.log('📸 Storing channel avatar in Walrus...')
        const imageData = new Uint8Array(await channelData.avatarFile.arrayBuffer())
        const imageResult = await walrusService.storeBlob(imageData, 'channel-avatar', {
          epochs: 365,
          deletable: true,
          originalName: channelData.avatarFile.name,
          mimeType: channelData.avatarFile.type,
          signer
        })
        avatarBlobId = imageResult.blobId
        console.log(`🔒 Channel avatar stored in Walrus: ${avatarBlobId}`)
      } else {
        // Use robust fallback system to get a working avatar blob ID
        console.log('🔄 Using robust fallback system for avatar...')
        console.log('📸 Received avatar data:', channelData.channelAvatarBlobId)

        avatarBlobId = await getWorkingAvatarBlobId(
          channelData.channelAvatarBlobId || '', // This is now the creator's avatar URL
          channelData.creatorAddress
        )
        console.log(`🎯 Final avatar blob ID: ${avatarBlobId}`)
      }

      console.log('💾 Storing channel subscription with avatar blob ID:', avatarBlobId)

      // Insert subscription record
      const { data, error } = await this.supabase
        .from('channel_subscriptions')
        .insert({
          user_address: userAddress,
          creator_address: channelData.creatorAddress,
          channel_id: channelData.channelId,
          channel_name: channelData.channelName,
          channel_type: channelData.channelType,
          channel_description: channelData.channelDescription,
          channel_avatar_blob_id: avatarBlobId,
          subscription_status: 'active',
          subscription_tier: channelData.subscriptionTier || channelData.channelType,
          price_paid: channelData.pricePaid || 0,
          expiry_date: channelData.expiryDate,
          telegram_channel_url: channelData.telegramChannelUrl,
          joined_date: new Date().toISOString(),
          last_accessed: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error adding channel subscription:', error)
        throw error
      }

      console.log('✅ Channel subscription added successfully:', data.id)
      return data.id

    } catch (error) {
      console.error('❌ Failed to add channel subscription:', error)
      throw error
    }
  }

  /**
   * Update channel avatar
   */
  async updateChannelAvatar(
    userAddress: string,
    channelId: string,
    avatarFile: File,
    signer?: any
  ): Promise<string> {
    try {
      console.log('📸 Updating channel avatar for:', channelId)

      // Store new avatar in Walrus
      const imageData = new Uint8Array(await avatarFile.arrayBuffer())
      const imageResult = await walrusService.storeBlob(imageData, 'channel-avatar', {
        epochs: 365,
        deletable: true,
        originalName: avatarFile.name,
        mimeType: avatarFile.type,
        signer
      })

      // Update database record
      const { error } = await this.supabase
        .from('channel_subscriptions')
        .update({
          channel_avatar_blob_id: imageResult.blobId,
          updated_at: new Date().toISOString()
        })
        .eq('user_address', userAddress)
        .eq('channel_id', channelId)

      if (error) {
        throw error
      }

      console.log('✅ Channel avatar updated successfully')
      return imageResult.blobId

    } catch (error) {
      console.error('❌ Failed to update channel avatar:', error)
      throw error
    }
  }

  /**
   * Get channel avatar URL from Walrus
   */
  async getChannelAvatarUrl(blobId: string): Promise<string | null> {
    try {
      if (!blobId) return null
      return `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`
    } catch (error) {
      console.error('❌ Failed to get channel avatar URL:', error)
      return null
    }
  }

  /**
   * Remove channel subscription
   */
  async removeChannelSubscription(userAddress: string, channelId: string): Promise<void> {
    try {
      console.log('🗑️ Removing channel subscription:', channelId)

      // Actually delete the record instead of just marking as cancelled
      const { error } = await this.supabase
        .from('channel_subscriptions')
        .delete()
        .eq('user_address', userAddress)
        .eq('channel_id', channelId)

      if (error) {
        throw error
      }

      console.log('✅ Channel subscription removed successfully')

    } catch (error) {
      console.error('❌ Failed to remove channel subscription:', error)
      throw error
    }
  }
}

// Helper function to extract blob ID from Walrus URL
function extractBlobIdFromUrl(url: string): string | undefined {
  if (!url) return undefined

  // Match Walrus URL pattern: https://aggregator.walrus-testnet.walrus.space/v1/blobs/{blobId}
  const match = url.match(/\/blobs\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : undefined
}

/**
 * Get creator's profile image blob ID from database
 */
async function getCreatorProfileImageBlobId(creatorAddress: string): Promise<string | undefined> {
  try {
    // Use the same supabase instance as the main class
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log('🔍 Fetching creator profile image blob ID for:', creatorAddress)

    const { data, error } = await supabase
      .from('creators')
      .select('profile_image_blob_id')
      .eq('creator_address', creatorAddress)
      .single()

    if (error) {
      console.warn('⚠️ Failed to fetch creator profile image blob ID:', error)
      return undefined
    }

    console.log('✅ Found creator profile image blob ID:', data?.profile_image_blob_id)
    return data?.profile_image_blob_id || undefined

  } catch (error) {
    console.error('❌ Error fetching creator profile image blob ID:', error)
    return undefined
  }
}

/**
 * Get a working avatar blob ID with multiple fallback strategies
 */
async function getWorkingAvatarBlobId(
  creatorAvatarUrl: string,
  creatorAddress: string
): Promise<string | undefined> {
  console.log('🔍 Getting working avatar blob ID...')
  console.log('📸 Creator avatar URL:', creatorAvatarUrl)
  console.log('👤 Creator address:', creatorAddress)

  // Strategy 1: Extract from avatar URL
  const extractedBlobId = extractBlobIdFromUrl(creatorAvatarUrl)
  if (extractedBlobId) {
    console.log('✅ Strategy 1 success - extracted blob ID:', extractedBlobId)
    return extractedBlobId
  }

  // Strategy 2: Get from database
  console.log('🔄 Strategy 1 failed, trying database lookup...')
  const dbBlobId = await getCreatorProfileImageBlobId(creatorAddress)
  if (dbBlobId) {
    console.log('✅ Strategy 2 success - database blob ID:', dbBlobId)
    return dbBlobId
  }

  // Strategy 3: Use a known working sample blob ID for testing
  console.log('⚠️ All strategies failed, using test blob ID')
  return 'sample_avatar_blob_1' // This should work for testing
}

// Export singleton
export const channelSubscriptionsStorage = new ChannelSubscriptionsStorage()

// Helper functions for React components
export async function getUserJoinedChannels(userAddress: string): Promise<UserChannel[]> {
  return channelSubscriptionsStorage.getUserChannels(userAddress)
}

export async function addUserChannelSubscription(
  userAddress: string,
  channelData: Parameters<typeof channelSubscriptionsStorage.addChannelSubscription>[1],
  signer?: any
): Promise<string> {
  return channelSubscriptionsStorage.addChannelSubscription(userAddress, channelData, signer)
}

/**
 * Add sample channel subscriptions for testing/demo purposes
 */
export async function addSampleChannelSubscriptions(userAddress: string): Promise<void> {
  try {
    console.log('📺 Adding sample channel subscriptions for user:', userAddress)

    const sampleChannels = [
      {
        creatorAddress: 'sample_creator_1',
        channelId: 'daily-market-updates',
        channelName: 'Daily Market Updates',
        channelType: 'free' as const,
        channelDescription: 'Get daily cryptocurrency market analysis and updates',
        subscriptionTier: 'free' as const,
        pricePaid: 0,
        telegramChannelUrl: 'https://t.me/daily_market_updates',
        channelAvatarBlobId: 'sample_avatar_blob_1' // Sample blob ID
      },
      {
        creatorAddress: 'sample_creator_2',
        channelId: 'premium-trading-signals',
        channelName: 'Premium Trading Signals',
        channelType: 'premium' as const,
        channelDescription: 'Exclusive trading signals and market insights',
        subscriptionTier: 'premium' as const,
        pricePaid: 5.0,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        telegramChannelUrl: 'https://t.me/premium_trading_signals',
        channelAvatarBlobId: 'sample_avatar_blob_2' // Sample blob ID
      },
      {
        creatorAddress: 'sample_creator_3',
        channelId: 'defi-basics',
        channelName: 'DeFi Basics',
        channelType: 'free' as const,
        channelDescription: 'Learn the fundamentals of decentralized finance',
        subscriptionTier: 'free' as const,
        pricePaid: 0,
        telegramChannelUrl: 'https://t.me/defi_basics',
        channelAvatarBlobId: 'sample_avatar_blob_3' // Sample blob ID
      },
      {
        creatorAddress: 'sample_creator_4',
        channelId: 'advanced-bot-strategies',
        channelName: 'Advanced Bot Strategies',
        channelType: 'premium' as const,
        channelDescription: 'Advanced cryptocurrency trading bot strategies',
        subscriptionTier: 'premium' as const,
        pricePaid: 12.0,
        expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
        telegramChannelUrl: 'https://t.me/advanced_bot_strategies',
        channelAvatarBlobId: 'sample_avatar_blob_4' // Sample blob ID
      },
      {
        creatorAddress: 'sample_creator_5',
        channelId: 'nft-alpha-calls',
        channelName: 'NFT Alpha Calls',
        channelType: 'vip' as const,
        channelDescription: 'Exclusive NFT project alpha and early access',
        subscriptionTier: 'vip' as const,
        pricePaid: 25.0,
        expiryDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(), // 27 days from now
        telegramChannelUrl: 'https://t.me/nft_alpha_calls',
        channelAvatarBlobId: 'sample_avatar_blob_5' // Sample blob ID
      },
      {
        creatorAddress: 'sample_creator_6',
        channelId: 'sui-ecosystem-news',
        channelName: 'Sui Ecosystem News',
        channelType: 'free' as const,
        channelDescription: 'Latest news and updates from the Sui blockchain ecosystem',
        subscriptionTier: 'free' as const,
        pricePaid: 0,
        telegramChannelUrl: 'https://t.me/sui_ecosystem_news',
        channelAvatarBlobId: 'sample_avatar_blob_6' // Sample blob ID
      }
    ]

    // Add each sample channel subscription
    for (const channelData of sampleChannels) {
      try {
        await channelSubscriptionsStorage.addChannelSubscription(userAddress, channelData)
        console.log(`✅ Added sample channel: ${channelData.channelName}`)
      } catch (error) {
        // Ignore duplicate errors (channel already exists for user)
        if (error instanceof Error && error.message.includes('duplicate')) {
          console.log(`⚠️ Channel already exists: ${channelData.channelName}`)
        } else {
          console.error(`❌ Failed to add channel ${channelData.channelName}:`, error)
        }
      }
    }

    console.log('✅ Sample channel subscriptions added successfully')

  } catch (error) {
    console.error('❌ Failed to add sample channel subscriptions:', error)
    throw error
  }
}
