"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface FriendRequest {
  id: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  receiver_id: string
  receiver_name: string
  receiver_avatar?: string
  status: 'pending' | 'accepted' | 'declined'
  message?: string
  created_at: string
  updated_at: string
}

export interface Friendship {
  id: string
  user1_id: string
  user1_name: string
  user1_avatar?: string
  user2_id: string
  user2_name: string
  user2_avatar?: string
  created_at: string
}

interface UseFriendRequestsProps {
  userId: string
  userName: string
  userAvatar?: string
  enabled?: boolean
}

export function useFriendRequests({ userId, userName, userAvatar, enabled = true }: UseFriendRequestsProps) {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Memoized helper functions to prevent unnecessary re-renders
  const friendshipMap = useMemo(() => {
    const map = new Map<string, Friendship>()
    friendships.forEach(friendship => {
      if (friendship.user1_id === userId) {
        map.set(friendship.user2_id, friendship)
      } else if (friendship.user2_id === userId) {
        map.set(friendship.user1_id, friendship)
      }
    })
    return map
  }, [friendships, userId])

  const requestMap = useMemo(() => {
    const map = new Map<string, FriendRequest>()
    friendRequests.forEach(request => {
      if (request.sender_id === userId) {
        map.set(request.receiver_id, request)
      } else if (request.receiver_id === userId) {
        map.set(request.sender_id, request)
      }
    })
    return map
  }, [friendRequests, userId])

  // Load friend requests and friendships
  const loadData = useCallback(async () => {
    if (!userId || !enabled) return

    try {
      setIsLoading(true)
      setError(null)

      // Load friend requests
      const { data: requests, error: requestsError } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (requestsError) {
        console.error('Friend requests error:', requestsError)
        throw requestsError
      }

      // Load friendships
      const { data: friends, error: friendsError } = await supabase
        .from('friendships')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (friendsError) {
        console.error('Friendships error:', friendsError)
        throw friendsError
      }

      console.log('Loaded friend requests:', requests?.length || 0)
      console.log('Loaded friendships:', friends?.length || 0)

      setFriendRequests(requests || [])
      setFriendships(friends || [])
      setInitialized(true)
    } catch (err) {
      console.error('Error loading friend data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load friend data')
    } finally {
      setIsLoading(false)
    }
  }, [userId, enabled])

  // Send friend request
  const sendFriendRequest = useCallback(async (
    receiverId: string,
    receiverName: string,
    receiverAvatar?: string,
    message?: string
  ) => {
    if (!userId || !userName || !enabled) {
      console.log('Cannot send friend request: missing data', { userId, userName, enabled })
      return false
    }

    try {
      setError(null)

      // Check if friendship already exists using the map
      if (friendshipMap.has(receiverId)) {
        setError('You are already friends with this user')
        console.log('Already friends with user:', receiverId)
        return false
      }

      // Check if request already exists using the map
      const existingRequest = requestMap.get(receiverId)
      if (existingRequest && existingRequest.status === 'pending') {
        setError('Friend request already sent')
        console.log('Friend request already pending for user:', receiverId)
        return false
      }

      console.log('Sending friend request to:', receiverId)

      const newRequest = {
        sender_id: userId,
        sender_name: userName,
        sender_avatar: userAvatar,
        receiver_id: receiverId,
        receiver_name: receiverName,
        receiver_avatar: receiverAvatar,
        message: message || `Hi! I'd like to connect with you on MetadudesX.`,
        status: 'pending' as const
      }

      const { data, error } = await supabase
        .from('friend_requests')
        .insert([newRequest])
        .select()

      if (error) {
        console.error('Supabase error sending friend request:', error)
        throw error
      }

      console.log('Friend request sent successfully:', data)

      // Reload data to get the latest state
      await loadData()

      return true
    } catch (err) {
      console.error('Error sending friend request:', err)
      setError(err instanceof Error ? err.message : 'Failed to send friend request')
      return false
    }
  }, [userId, userName, userAvatar, enabled, friendshipMap, requestMap, loadData])

  // Accept friend request
  const acceptFriendRequest = useCallback(async (requestId: string) => {
    try {
      setError(null)

      const request = friendRequests.find(r => r.id === requestId)
      if (!request) return false

      // Update request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId)

      if (updateError) throw updateError

      // Create friendship
      const friendship = {
        user1_id: request.sender_id,
        user1_name: request.sender_name,
        user1_avatar: request.sender_avatar,
        user2_id: request.receiver_id,
        user2_name: request.receiver_name,
        user2_avatar: request.receiver_avatar
      }

      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert([friendship])

      if (friendshipError) throw friendshipError

      return true
    } catch (err) {
      console.error('Error accepting friend request:', err)
      setError(err instanceof Error ? err.message : 'Failed to accept friend request')
      return false
    }
  }, [friendRequests])

  // Decline friend request
  const declineFriendRequest = useCallback(async (requestId: string) => {
    try {
      setError(null)

      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('id', requestId)

      if (error) throw error

      return true
    } catch (err) {
      console.error('Error declining friend request:', err)
      setError(err instanceof Error ? err.message : 'Failed to decline friend request')
      return false
    }
  }, [])

  // Check if users are friends (using memoized map)
  const areFriends = useCallback((otherUserId: string) => {
    return friendshipMap.has(otherUserId)
  }, [friendshipMap])

  // Check if friend request exists (using memoized map)
  const getFriendRequestStatus = useCallback((otherUserId: string) => {
    const request = requestMap.get(otherUserId)
    return request?.status || null
  }, [requestMap])

  // Get private chat room name for two users
  const getPrivateChatRoom = useCallback((otherUserId: string) => {
    const sortedIds = [userId, otherUserId].sort()
    return `private_${sortedIds[0]}_${sortedIds[1]}`
  }, [userId])

  // Set up realtime subscriptions
  useEffect(() => {
    if (!userId || !enabled) return

    console.log('Setting up realtime subscriptions for user:', userId)

    const requestsChannel = supabase
      .channel(`friend-requests-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`
        },
        (payload) => {
          console.log('Friend request realtime update:', payload)
          loadData()
        }
      )
      .subscribe()

    const friendshipsChannel = supabase
      .channel(`friendships-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `or(user1_id.eq.${userId},user2_id.eq.${userId})`
        },
        (payload) => {
          console.log('Friendship realtime update:', payload)
          loadData()
        }
      )
      .subscribe()

    // Initial load
    if (!initialized) {
      loadData()
    }

    return () => {
      console.log('Cleaning up realtime subscriptions')
      requestsChannel.unsubscribe()
      friendshipsChannel.unsubscribe()
    }
  }, [userId, enabled, loadData, initialized])

  return {
    friendRequests,
    friendships,
    isLoading,
    error,
    initialized,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    areFriends,
    getFriendRequestStatus,
    getPrivateChatRoom,
    reload: loadData,
    // Debug helpers
    friendshipMap,
    requestMap
  }
}
