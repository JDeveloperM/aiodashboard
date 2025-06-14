"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { 
  getAllCreatorProfiles, 
  createOrUpdateCreator, 
  getCreatorProfile,
  type DecryptedCreator 
} from "@/lib/creator-storage"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { toast } from "sonner"

// Convert DecryptedCreator to the existing Creator interface for compatibility
interface Channel {
  id: string
  name: string
  type: 'free' | 'premium' | 'vip'
  price: number
  description: string
  subscribers: number
  telegramUrl: string
  subscriptionPackages?: string[]
  pricing?: {
    thirtyDays?: number
    sixtyDays?: number
    ninetyDays?: number
  }
  availability?: {
    hasLimit: boolean
    currentSlots?: number
    maxSlots?: number
    status: 'available' | 'limited' | 'full'
  }
  // Channel-specific data for individual channel cards
  channelCategories?: string[]
  channelRole?: string
  channelLanguage?: string
}

interface Creator {
  id: string
  creatorAddress: string // Wallet address of the creator (for ownership verification)
  name: string
  username: string
  avatar: string
  coverImage?: string
  role: string
  tier: 'PRO' | 'ROYAL'
  subscribers: number
  category: string
  categories: string[]
  channels: Channel[]
  contentTypes: string[]
  verified: boolean
  languages: string[]
  availability: {
    hasLimit: boolean
    currentSlots?: number
    maxSlots?: number
    status: 'available' | 'limited' | 'full'
  }
  socialLinks: {
    website?: string
    twitter?: string
    telegram?: string
    discord?: string
  }
  bannerColor: string
}

interface CreatorsContextType {
  creators: Creator[]
  addCreator: (creator: Creator, profileImageBlobId?: string, coverImageBlobId?: string) => Promise<void>
  updateCreator: (id: string, creator: Partial<Creator>, profileImageBlobId?: string, coverImageBlobId?: string) => Promise<void>
  removeCreator: (id: string) => Promise<void>
  deleteChannel: (creatorId: string, channelId: string) => Promise<void>
  refreshCreators: () => Promise<void>
  getUserCreators: (walletAddress: string) => Creator[]
  isLoading: boolean
  error: string | null
}

const CreatorsContext = createContext<CreatorsContextType | undefined>(undefined)

// Convert DecryptedCreator to Creator interface
function convertDecryptedCreatorToCreator(decryptedCreator: DecryptedCreator): Creator {
  console.log('🔄 Converting creator:', decryptedCreator.channel_name, 'with channels_data:', decryptedCreator.channels_data)
  // Generate avatar URL from Walrus blob ID

  const avatar = decryptedCreator.profile_image_blob_id
    ? `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${decryptedCreator.profile_image_blob_id}`
    : "/api/placeholder/64/64"

  const coverImage = decryptedCreator.cover_image_blob_id
    ? `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${decryptedCreator.cover_image_blob_id}`
    : undefined



  // Convert channels data
  let channels: Channel[] = []

  if (decryptedCreator.channels_data && Array.isArray(decryptedCreator.channels_data)) {
    channels = decryptedCreator.channels_data.map((channelData: any) => ({
      id: channelData.id || `${decryptedCreator.id}-${Math.random().toString(36).substr(2, 9)}`,
      name: channelData.name || decryptedCreator.channel_name || 'Unnamed Channel',
      type: channelData.type || (decryptedCreator.is_premium ? 'premium' : 'free'),
      price: channelData.price || decryptedCreator.tip_pricing?.thirtyDays || 0,
      description: channelData.description || decryptedCreator.channel_description || '',
      subscribers: channelData.subscribers || decryptedCreator.subscribers_count || 0,
      telegramUrl: channelData.telegramUrl || `https://t.me/${decryptedCreator.telegram_username}`,
      subscriptionPackages: channelData.subscriptionPackages || decryptedCreator.subscription_packages,
      pricing: channelData.pricing || decryptedCreator.tip_pricing,
      availability: channelData.availability || {
        hasLimit: decryptedCreator.max_subscribers > 0,
        currentSlots: Math.floor(decryptedCreator.max_subscribers * 0.7),
        maxSlots: decryptedCreator.max_subscribers > 0 ? decryptedCreator.max_subscribers : undefined,
        status: decryptedCreator.max_subscribers > 0 ? 'limited' : 'available'
      },
      // Preserve channel-specific data for individual channel cards
      channelCategories: channelData.channelCategories || decryptedCreator.channel_categories,
      channelRole: channelData.channelRole || decryptedCreator.creator_role,
      channelLanguage: channelData.channelLanguage || decryptedCreator.channel_language
    }))
  } else if (decryptedCreator.channels_data) {
    // Handle case where channels_data might be a single object instead of array
    const channelData = decryptedCreator.channels_data as any
    channels = [{
      id: channelData.id || `${decryptedCreator.id}-${Math.random().toString(36).substr(2, 9)}`,
      name: channelData.name || decryptedCreator.channel_name || 'Unnamed Channel',
      type: channelData.type || (decryptedCreator.is_premium ? 'premium' : 'free'),
      price: channelData.price || decryptedCreator.tip_pricing?.thirtyDays || 0,
      description: channelData.description || decryptedCreator.channel_description || '',
      subscribers: channelData.subscribers || decryptedCreator.subscribers_count || 0,
      telegramUrl: channelData.telegramUrl || `https://t.me/${decryptedCreator.telegram_username}`,
      subscriptionPackages: channelData.subscriptionPackages || decryptedCreator.subscription_packages,
      pricing: channelData.pricing || decryptedCreator.tip_pricing,
      availability: channelData.availability || {
        hasLimit: decryptedCreator.max_subscribers > 0,
        currentSlots: Math.floor(decryptedCreator.max_subscribers * 0.7),
        maxSlots: decryptedCreator.max_subscribers > 0 ? decryptedCreator.max_subscribers : undefined,
        status: decryptedCreator.max_subscribers > 0 ? 'limited' : 'available'
      },
      // Preserve channel-specific data for individual channel cards
      channelCategories: channelData.channelCategories || decryptedCreator.channel_categories,
      channelRole: channelData.channelRole || decryptedCreator.creator_role,
      channelLanguage: channelData.channelLanguage || decryptedCreator.channel_language
    }]
  } else {
    // Fallback: create a channel from the creator's basic data
    channels = [{
      id: `${decryptedCreator.id}-default`,
      name: decryptedCreator.channel_name || 'Default Channel',
      type: decryptedCreator.is_premium ? 'premium' : 'free',
      price: decryptedCreator.tip_pricing?.thirtyDays || 0,
      description: decryptedCreator.channel_description || '',
      subscribers: decryptedCreator.subscribers_count || 0,
      telegramUrl: `https://t.me/${decryptedCreator.telegram_username}`,
      subscriptionPackages: decryptedCreator.subscription_packages,
      pricing: decryptedCreator.tip_pricing,
      availability: {
        hasLimit: decryptedCreator.max_subscribers > 0,
        currentSlots: Math.floor(decryptedCreator.max_subscribers * 0.7),
        maxSlots: decryptedCreator.max_subscribers > 0 ? decryptedCreator.max_subscribers : undefined,
        status: decryptedCreator.max_subscribers > 0 ? 'limited' : 'available'
      },
      // Use creator's basic data as channel-specific data
      channelCategories: decryptedCreator.channel_categories,
      channelRole: decryptedCreator.creator_role,
      channelLanguage: decryptedCreator.channel_language
    }]
  }

  return {
    id: decryptedCreator.id,
    creatorAddress: decryptedCreator.creator_address, // Map the wallet address for ownership verification
    name: decryptedCreator.channel_name || 'Unnamed Creator',
    username: decryptedCreator.telegram_username || 'unknown',
    avatar,
    coverImage,
    role: decryptedCreator.creator_role,
    tier: decryptedCreator.tier,
    subscribers: decryptedCreator.subscribers_count,
    category: decryptedCreator.primary_category || decryptedCreator.channel_categories[0] || 'General',
    categories: decryptedCreator.channel_categories,
    channels,
    contentTypes: ["Live Streams", "Analysis", "Tutorials"], // Default content types
    verified: decryptedCreator.verified,
    languages: [decryptedCreator.channel_language],
    availability: {
      hasLimit: decryptedCreator.max_subscribers > 0,
      currentSlots: Math.floor(decryptedCreator.max_subscribers * 0.7),
      maxSlots: decryptedCreator.max_subscribers > 0 ? decryptedCreator.max_subscribers : undefined,
      status: decryptedCreator.max_subscribers > 0 ? 'limited' : 'available'
    },
    socialLinks: decryptedCreator.social_links,
    bannerColor: decryptedCreator.banner_color
  }
}

export function CreatorsDatabaseProvider({ children }: { children: React.ReactNode }) {
  const [creators, setCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useSuiAuth()
  const currentAccount = useCurrentAccount()

  // Load creators from database
  const refreshCreators = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading creators from database...')
      const decryptedCreators = await getAllCreatorProfiles()

      console.log(`📊 Retrieved ${decryptedCreators.length} creators from database`)

      // Convert to Creator interface
      const convertedCreators = decryptedCreators.map(convertDecryptedCreatorToCreator)

      console.log('📋 Converted creators:', convertedCreators.map(c => `${c.username}: ${c.channels.length} channels`))
      console.log('🔍 Creator IDs and Channel IDs for debugging:')
      convertedCreators.forEach(creator => {
        console.log(`Creator: ${creator.name} (ID: ${creator.id})`)
        creator.channels.forEach(channel => {
          console.log(`  - Channel: ${channel.name} (ID: ${channel.id})`)
        })
      })

      // Debug: Log channel-specific data for first creator
      if (convertedCreators.length > 0) {
        const firstCreator = convertedCreators[0]
        console.log('🔍 First creator channels debug:', firstCreator.channels.map(ch => ({
          name: ch.name,
          channelCategories: ch.channelCategories,
          channelRole: ch.channelRole,
          channelLanguage: ch.channelLanguage,
          availability: ch.availability
        })))

        // Also log the raw database data for comparison
        console.log('🔍 Raw database creator data:', {
          channel_categories: decryptedCreators[0]?.channel_categories,
          creator_role: decryptedCreators[0]?.creator_role,
          channel_language: decryptedCreators[0]?.channel_language,
          channels_data: decryptedCreators[0]?.channels_data
        })
      }

      setCreators(convertedCreators)
      console.log(`✅ Loaded ${convertedCreators.length} creators from database`)
    } catch (err) {
      console.error('Failed to load creators:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load creators'

      // Check for specific database errors and fallback to localStorage
      if (errorMessage.includes('table') && errorMessage.includes('does not exist')) {
        console.log('📝 Database not available, falling back to localStorage...')

        // Try to load from localStorage
        try {
          const localCreators = JSON.parse(localStorage.getItem('creators') || '[]')
          setCreators(localCreators)
          setError('Using local storage (database not available)')
          console.log(`✅ Loaded ${localCreators.length} creators from localStorage`)
        } catch (localError) {
          console.error('Failed to load from localStorage:', localError)
          setError('Database not set up and localStorage unavailable')
          setCreators([])
        }
      } else {
        setError(errorMessage)
        setCreators([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Load creators on mount
  useEffect(() => {
    refreshCreators()
  }, [])

  const getUserCreators = (walletAddress: string): Creator[] => {
    if (!walletAddress) return []

    return creators.filter(creator =>
      creator.creatorAddress &&
      creator.creatorAddress.toLowerCase() === walletAddress.toLowerCase()
    )
  }

  const addCreator = async (creator: Creator, profileImageBlobId?: string, coverImageBlobId?: string) => {
    console.log('🔄 addCreator called with:', creator)
    console.log('🖼️ Profile image blob ID:', profileImageBlobId)
    console.log('🖼️ Cover image blob ID:', coverImageBlobId)

    if (!currentAccount?.address) {
      console.error('❌ No wallet connected in addCreator')
      throw new Error('No wallet connected')
    }

    console.log('✅ Wallet address:', currentAccount.address)

    try {
      console.log('➕ Adding new creator to database...')

      // Convert Creator to DecryptedCreator format
      const decryptedCreatorData: Partial<DecryptedCreator> = {
        creator_address: currentAccount.address,
        channel_name: creator.name,
        channel_description: creator.channels[0]?.description || '',
        telegram_username: creator.username,
        creator_role: creator.role,
        channel_language: creator.languages[0] || 'English',
        channel_categories: creator.categories,
        primary_category: creator.category,
        tier: creator.tier,
        max_subscribers: creator.availability.maxSlots || 0,
        is_premium: creator.channels.some(ch => ch.type === 'premium'),
        subscription_packages: creator.channels[0]?.subscriptionPackages || [],
        tip_pricing: creator.channels[0]?.pricing || {},
        subscribers_count: creator.subscribers,
        verified: creator.verified,
        banner_color: creator.bannerColor,
        social_links: creator.socialLinks,
        channels_data: creator.channels,
        // Add blob IDs if provided
        profile_image_blob_id: profileImageBlobId,
        cover_image_blob_id: coverImageBlobId
      }

      console.log('📝 Converted creator data:', decryptedCreatorData)
      console.log('🔄 Calling createOrUpdateCreator with blob IDs...')

      await createOrUpdateCreator(currentAccount.address, decryptedCreatorData)

      console.log('✅ createOrUpdateCreator completed successfully')
      console.log('🔄 Refreshing creators list...')

      // Refresh the creators list
      await refreshCreators()

      console.log('✅ Creators list refreshed')
      toast.success('Creator profile created successfully!')
    } catch (err) {
      console.error('Failed to add creator:', err)

      // Fallback to localStorage if database fails
      if (err instanceof Error && err.message.includes('table does not exist')) {
        console.log('📝 Database not available, falling back to localStorage...')

        // Save to localStorage as fallback
        const existingCreators = JSON.parse(localStorage.getItem('creators') || '[]')
        const newCreators = [...existingCreators, creator]
        localStorage.setItem('creators', JSON.stringify(newCreators))

        // Update local state
        setCreators(newCreators)

        toast.success('Creator profile created successfully! (Saved locally - database not available)')
        return
      }

      toast.error('Failed to create creator profile')
      throw err
    }
  }

  const updateCreator = async (id: string, updatedCreator: Partial<Creator>, profileImageBlobId?: string, coverImageBlobId?: string) => {
    console.log('🔄 updateCreator called with:', { id, updatedCreator })
    console.log('🖼️ Profile image blob ID:', profileImageBlobId)
    console.log('🖼️ Cover image blob ID:', coverImageBlobId)

    if (!currentAccount?.address) {
      throw new Error('No wallet connected')
    }

    try {
      console.log('✏️ Updating creator in database...')

      // Find the creator to update
      const existingCreator = creators.find(c => c.id === id)
      if (!existingCreator) {
        throw new Error('Creator not found')
      }

      // Merge the updates
      const mergedCreator = { ...existingCreator, ...updatedCreator }

      console.log('📝 Merged creator data:', mergedCreator)
      console.log('📊 Total channels after update:', mergedCreator.channels.length)

      // Convert to DecryptedCreator format
      const decryptedCreatorData: Partial<DecryptedCreator> = {
        channel_name: mergedCreator.name,
        channel_description: mergedCreator.channels[0]?.description || '',
        telegram_username: mergedCreator.username,
        creator_role: mergedCreator.role,
        channel_language: mergedCreator.languages[0] || 'English',
        channel_categories: mergedCreator.categories,
        primary_category: mergedCreator.category,
        tier: mergedCreator.tier,
        max_subscribers: mergedCreator.availability.maxSlots || 0,
        is_premium: mergedCreator.channels.some(ch => ch.type === 'premium'),
        subscription_packages: mergedCreator.channels[0]?.subscriptionPackages || [],
        tip_pricing: mergedCreator.channels[0]?.pricing || {},
        subscribers_count: mergedCreator.subscribers,
        verified: mergedCreator.verified,
        banner_color: mergedCreator.bannerColor,
        social_links: mergedCreator.socialLinks,
        channels_data: mergedCreator.channels,
        // Add blob IDs if provided
        profile_image_blob_id: profileImageBlobId,
        cover_image_blob_id: coverImageBlobId
      }

      console.log('📝 Converted creator data for database:', decryptedCreatorData)

      await createOrUpdateCreator(currentAccount.address, decryptedCreatorData)

      console.log('✅ Creator updated in database')

      // Refresh the creators list
      await refreshCreators()

      console.log('✅ Creators list refreshed')
      toast.success('Creator profile updated successfully!')
    } catch (err) {
      console.error('❌ Failed to update creator:', err)
      toast.error('Failed to update creator profile')
      throw err
    }
  }

  const removeCreator = async (id: string) => {
    // For now, we don't implement deletion to preserve data
    // In the future, you could add a soft delete flag
    console.log('Remove creator not implemented for data preservation')
    toast.info('Creator removal not available')
  }

  const deleteChannel = async (creatorId: string, channelId: string) => {
    console.log('🗑️ deleteChannel called with:', { creatorId, channelId })
    console.log('🔍 Available creators:', creators.map(c => ({ id: c.id, name: c.name, channelsCount: c.channels.length })))

    // Smart creator finding: handle both correct creator IDs and channel IDs passed as creator IDs
    let actualCreator: Creator | undefined
    let actualCreatorId = creatorId

    // First, try to find creator directly
    actualCreator = creators.find(c => c.id === creatorId)

    // If not found and creatorId looks like a channel ID, extract the creator ID
    if (!actualCreator && creatorId.includes('_channel_')) {
      console.log('🔧 CreatorId looks like channel ID, extracting actual creator ID...')
      actualCreatorId = creatorId.split('_channel_')[0]
      actualCreator = creators.find(c => c.id === actualCreatorId)
      console.log('🔍 Extracted creator ID:', actualCreatorId)
    }

    // If still not found, try to find creator by searching through all channels
    if (!actualCreator) {
      console.log('🔍 Creator not found by ID, searching through all channels...')
      for (const creator of creators) {
        if (creator.channels.some(ch => ch.id === channelId)) {
          actualCreator = creator
          actualCreatorId = creator.id
          console.log('✅ Found creator by channel search:', creator.name)
          break
        }
      }
    }

    if (!currentAccount?.address) {
      throw new Error('No wallet connected')
    }

    try {
      console.log('🔍 Validating found creator and channel...')

      // Use the creator we found above
      if (!actualCreator) {
        console.error('❌ Creator not found! Available creator IDs:', creators.map(c => c.id))
        console.error('❌ Looking for creator ID:', creatorId)
        console.error('❌ Channel ID:', channelId)
        throw new Error(`Creator not found with ID: ${creatorId}`)
      }

      console.log('✅ Using creator:', { id: actualCreator.id, name: actualCreator.name, channelsCount: actualCreator.channels.length })

      // Find the channel
      const channel = actualCreator.channels.find(ch => ch.id === channelId)
      if (!channel) {
        console.error('❌ Channel not found! Available channel IDs:', actualCreator.channels.map(ch => ch.id))
        console.error('❌ Looking for channel ID:', channelId)
        throw new Error(`Channel not found with ID: ${channelId}`)
      }

      console.log('✅ Found channel:', { id: channel.id, name: channel.name, type: channel.type })
      console.log(`🗑️ Deleting channel "${channel.name}" from creator "${actualCreator.name}"`)

      // Remove the channel from the channels array
      const updatedChannels = actualCreator.channels.filter(ch => ch.id !== channelId)

      console.log(`📊 Channels before deletion: ${actualCreator.channels.length}`)
      console.log(`📊 Channels after deletion: ${updatedChannels.length}`)

      if (updatedChannels.length === 0) {
        console.log('⚠️ This was the last channel for this creator')
      }

      // Prepare the updated channels data for database
      console.log('📝 Preparing updated channels data for database...')
      console.log('🔍 Updated channels:', updatedChannels.map(ch => ({ id: ch.id, name: ch.name, type: ch.type })))

      // Create a complete update that preserves existing data but updates channels
      // Use the actualCreator we found above
      const decryptedCreatorData: Partial<DecryptedCreator> = {
        creator_address: currentAccount.address,
        channel_name: actualCreator.name,
        channel_description: updatedChannels[0]?.description || actualCreator.channels[0]?.description || '',
        telegram_username: actualCreator.username,
        creator_role: actualCreator.role,
        channel_language: actualCreator.languages?.[0] || 'English',
        channel_categories: actualCreator.categories,
        primary_category: actualCreator.category,
        tier: actualCreator.tier,
        max_subscribers: actualCreator.availability?.maxSlots || 0,
        is_premium: updatedChannels.some(ch => ch.type === 'premium'),
        subscription_packages: updatedChannels[0]?.subscriptionPackages || [],
        tip_pricing: updatedChannels[0]?.pricing || {},
        subscribers_count: actualCreator.subscribers,
        verified: actualCreator.verified,
        banner_color: actualCreator.bannerColor,
        social_links: actualCreator.socialLinks,
        channels_data: updatedChannels // This is the key update
      }

      console.log('📝 Updating creator in database with new channels data...')
      console.log('🔍 Database update payload:', {
        wallet: currentAccount.address,
        channelsCount: updatedChannels.length,
        creatorName: actualCreator.name,
        originalChannelsCount: actualCreator.channels.length
      })

      await createOrUpdateCreator(currentAccount.address, decryptedCreatorData)

      console.log('✅ Channel deleted from database')

      // Refresh the creators list to reflect changes
      await refreshCreators()

      console.log('✅ Creators list refreshed')
      toast.success(`Channel "${channel.name}" deleted successfully!`)
    } catch (err) {
      console.error('❌ Failed to delete channel:', err)
      toast.error('Failed to delete channel')
      throw err
    }
  }

  const value: CreatorsContextType = {
    creators,
    addCreator,
    updateCreator,
    removeCreator,
    deleteChannel,
    refreshCreators,
    getUserCreators,
    isLoading,
    error
  }

  return (
    <CreatorsContext.Provider value={value}>
      {children}
    </CreatorsContext.Provider>
  )
}

export function useCreatorsDatabase() {
  const context = useContext(CreatorsContext)
  if (context === undefined) {
    throw new Error('useCreatorsDatabase must be used within a CreatorsDatabaseProvider')
  }
  return context
}

// Export types for compatibility
export type { Creator, Channel, CreatorsContextType }
