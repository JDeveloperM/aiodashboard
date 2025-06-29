/**
 * React hook for managing user channel subscriptions
 * Integrates with database + Walrus storage
 */

import { useState, useEffect, useCallback } from 'react'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { getUserJoinedChannels, addSampleChannelSubscriptions, type UserChannel } from '@/lib/channel-subscriptions-storage'
import { toast } from 'sonner'

interface UseChannelSubscriptionsReturn {
  channels: UserChannel[]
  isLoading: boolean
  error: string | null
  refreshChannels: () => Promise<void>
  addSampleChannels: () => Promise<void>
}

export function useChannelSubscriptions(): UseChannelSubscriptionsReturn {
  const { user } = useSuiAuth()
  const [channels, setChannels] = useState<UserChannel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's joined channels
  const fetchChannels = useCallback(async () => {
    if (!user?.address) {
      setChannels([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 Fetching channels for user:', user.address)
      const userChannels = await getUserJoinedChannels(user.address)

      console.log(`✅ Loaded ${userChannels.length} channels from database`)

      // If no channels found in database, check if we should show sample data
      if (userChannels.length === 0) {
        console.log('📺 No channels found in database')

        // For demo purposes, show sample data for any connected user
        // In production, you might want to remove this or only show for specific test addresses
        console.log('📺 Using sample data for demo purposes')
        setChannels(getSampleChannels())
      } else {
        setChannels(userChannels)
      }

    } catch (err) {
      console.error('❌ Failed to fetch channels:', err)
      setError(err instanceof Error ? err.message : 'Failed to load channels')

      // Fallback to sample data on error for better UX
      console.log('📺 Using sample data as fallback due to error')
      setChannels(getSampleChannels())

    } finally {
      setIsLoading(false)
    }
  }, [user?.address])

  // Refresh channels
  const refreshChannels = useCallback(async () => {
    await fetchChannels()
  }, [fetchChannels])

  // Add sample channels for demo/testing
  const addSampleChannels = useCallback(async () => {
    if (!user?.address) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setIsLoading(true)
      console.log('📺 Adding sample channels to database for user:', user.address)

      // Add sample data to the database
      await addSampleChannelSubscriptions(user.address)

      // Refresh channels to show the new data
      await fetchChannels()

      toast.success('Sample channels added successfully!')

    } catch (err) {
      console.error('❌ Failed to add sample channels:', err)
      toast.error('Failed to add sample channels')
    } finally {
      setIsLoading(false)
    }
  }, [user?.address, fetchChannels])

  // Load channels when user connects
  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  // Listen for channel removal events from other parts of the app
  useEffect(() => {
    const handleChannelRemoved = (event: CustomEvent) => {
      console.log('🔄 Channel removed event received, refreshing channels...')
      fetchChannels()
    }

    const handleChannelAdded = (event: CustomEvent) => {
      console.log('🔄 Channel added event received, refreshing channels...')
      fetchChannels()
    }

    window.addEventListener('channelRemoved', handleChannelRemoved as EventListener)
    window.addEventListener('channelAdded', handleChannelAdded as EventListener)

    return () => {
      window.removeEventListener('channelRemoved', handleChannelRemoved as EventListener)
      window.removeEventListener('channelAdded', handleChannelAdded as EventListener)
    }
  }, [fetchChannels])

  return {
    channels,
    isLoading,
    error,
    refreshChannels,
    addSampleChannels
  }
}

// Sample channels for demo purposes
function getSampleChannels(): UserChannel[] {
  const now = new Date()
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

  return [
    {
      id: 'daily-market-updates',
      name: 'Daily Market Updates',
      type: 'free',
      description: 'Get daily cryptocurrency market analysis and updates',
      subscribers: 8500,
      color: '#10b981',
      joinedDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      isActive: true,
      creatorAddress: 'sample-creator-1'
    },
    {
      id: 'premium-trading-signals',
      name: 'Premium Trading Signals',
      type: 'premium',
      description: 'Exclusive trading signals and market insights',
      subscribers: 2100,
      color: '#f59e0b',
      joinedDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      expiryDate: futureDate.toISOString(),
      isActive: true,
      daysRemaining: 23,
      creatorAddress: 'sample-creator-2'
    },
    {
      id: 'defi-basics',
      name: 'DeFi Basics',
      type: 'free',
      description: 'Learn the fundamentals of decentralized finance',
      subscribers: 9200,
      color: '#3b82f6',
      joinedDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      isActive: true,
      creatorAddress: 'sample-creator-3'
    },
    {
      id: 'advanced-bot-strategies',
      name: 'Advanced Bot Strategies',
      type: 'premium',
      description: 'Advanced cryptocurrency trading bot strategies',
      subscribers: 2100,
      color: '#f97316',
      joinedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      expiryDate: futureDate.toISOString(),
      isActive: true,
      daysRemaining: 25,
      creatorAddress: 'sample-creator-4'
    },
    {
      id: 'nft-alpha-calls',
      name: 'NFT Alpha Calls',
      type: 'vip',
      description: 'Exclusive NFT project alpha and early access',
      subscribers: 850,
      color: '#8b5cf6',
      joinedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      expiryDate: futureDate.toISOString(),
      isActive: true,
      daysRemaining: 27,
      creatorAddress: 'sample-creator-5'
    },
    {
      id: 'sui-ecosystem-news',
      name: 'Sui Ecosystem News',
      type: 'free',
      description: 'Latest news and updates from the Sui blockchain ecosystem',
      subscribers: 5600,
      color: '#06b6d4',
      joinedDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      isActive: true,
      creatorAddress: 'sample-creator-6'
    }
  ]
}

// Helper function to get channel type badge color
export function getChannelTypeBadgeColor(type: 'free' | 'premium' | 'vip'): string {
  switch (type) {
    case 'free':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'premium':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    case 'vip':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

// Helper function to format subscription status
export function formatSubscriptionStatus(channel: UserChannel): string {
  if (!channel.isActive) return 'Expired'
  if (channel.type === 'free') return 'Active'
  if (channel.daysRemaining !== undefined) {
    return `${channel.daysRemaining} days left`
  }
  return 'Active'
}
