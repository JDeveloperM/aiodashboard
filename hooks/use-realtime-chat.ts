"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface ChatMessage {
  id: string
  content: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
}

interface UseRealtimeChatProps {
  roomName: string
  userId: string
  userName: string
  userAvatar?: string
  onMessage?: (messages: ChatMessage[]) => void
  messages?: ChatMessage[]
}

export function useRealtimeChat({
  roomName,
  userId,
  userName,
  userAvatar,
  onMessage,
  messages: initialMessages = []
}: UseRealtimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // Load initial messages from database
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_name', roomName)
        .order('created_at', { ascending: true })
        .limit(50) // Load last 50 messages

      if (error) throw error

      const formattedMessages: ChatMessage[] = data.map(msg => ({
        id: msg.id,
        content: msg.content,
        user: {
          id: msg.user_id,
          name: msg.user_name,
          avatar: msg.user_avatar
        },
        createdAt: msg.created_at
      }))

      setMessages(formattedMessages)
      onMessage?.(formattedMessages)
    } catch (err) {
      console.error('Error loading messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }, [roomName, onMessage])

  // Send a new message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !userId || !userName) return

    try {
      setError(null)

      const newMessage = {
        content: content.trim(),
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar,
        room_name: roomName
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert([newMessage])

      if (error) throw error

      // Message will be added via realtime subscription
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
    }
  }, [userId, userName, userAvatar, roomName])

  // Set up realtime subscription
  useEffect(() => {
    if (!roomName) return

    const realtimeChannel = supabase
      .channel(`chat-${roomName}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_name=eq.${roomName}`
        },
        (payload) => {
          const newMessage: ChatMessage = {
            id: payload.new.id,
            content: payload.new.content,
            user: {
              id: payload.new.user_id,
              name: payload.new.user_name,
              avatar: payload.new.user_avatar
            },
            createdAt: payload.new.created_at
          }

          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev
            }
            const updated = [...prev, newMessage]
            onMessage?.(updated)
            return updated
          })
        }
      )
      .subscribe()

    setChannel(realtimeChannel)

    // Load initial messages
    loadMessages()

    return () => {
      realtimeChannel.unsubscribe()
    }
  }, [roomName, loadMessages, onMessage])

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    isConnected: channel?.state === 'joined'
  }
}
