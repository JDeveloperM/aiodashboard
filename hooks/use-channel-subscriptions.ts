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

      // Set the actual channels from database (empty array if none found)
      setChannels(userChannels)
      console.log(`📺 Set ${userChannels.length} actual user channels`)

    } catch (err) {
      console.error('❌ Failed to fetch channels:', err)
      setError(err instanceof Error ? err.message : 'Failed to load channels')
      setChannels([]) // Show empty state on error instead of sample data

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
