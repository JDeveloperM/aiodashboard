"use client"

import { useEffect, useCallback, useRef } from "react"
import { createClient } from '@supabase/supabase-js'
import { ForumPost, ForumReply } from "@/lib/forum-service"
import { useSubscription } from "@/contexts/subscription-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { toast } from "sonner"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UseForumRealtimeProps {
  topicId?: string
  postId?: string
  onNewPost?: (post: ForumPost) => void
  onPostUpdate?: (post: ForumPost) => void
  onNewReply?: (reply: ForumReply) => void
  onReplyUpdate?: (reply: ForumReply) => void
  onPostLikeUpdate?: (postId: string, likeCount: number) => void
  onReplyLikeUpdate?: (replyId: string, likeCount: number) => void
}

export function useForumRealtime({
  topicId,
  postId,
  onNewPost,
  onPostUpdate,
  onNewReply,
  onReplyUpdate,
  onPostLikeUpdate,
  onReplyLikeUpdate
}: UseForumRealtimeProps) {
  const { tier } = useSubscription()
  const { user } = useSuiAuth()
  const subscriptionsRef = useRef<any[]>([])

  // Check if user has access to topic
  const hasTopicAccess = useCallback(async (topicId: string): Promise<boolean> => {
    try {
      const { data: topic } = await supabase
        .from('forum_topics')
        .select('access_level')
        .eq('id', topicId)
        .single()

      if (!topic) return false

      if (topic.access_level === 'ALL') return true
      if (topic.access_level === 'PRO') return tier === 'PRO' || tier === 'ROYAL'
      if (topic.access_level === 'ROYAL') return tier === 'ROYAL'
      if (topic.access_level === 'CREATORS') return tier === 'PRO' || tier === 'ROYAL'
      
      return false
    } catch (error) {
      console.error('Failed to check topic access:', error)
      return false
    }
  }, [tier])

  // Subscribe to new posts in a topic
  const subscribeToTopicPosts = useCallback(async (topicId: string) => {
    if (!await hasTopicAccess(topicId)) return

    const subscription = supabase
      .channel(`topic-posts-${topicId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_posts',
          filter: `topic_id=eq.${topicId}`
        },
        async (payload) => {
          const newPost = payload.new as ForumPost
          
          // Don't show notification for user's own posts
          if (newPost.author_address === user?.address) return

          // Show toast notification
          toast.info('New post in this topic!', {
            description: newPost.title,
            duration: 3000
          })

          // Call callback if provided
          onNewPost?.(newPost)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'forum_posts',
          filter: `topic_id=eq.${topicId}`
        },
        (payload) => {
          const updatedPost = payload.new as ForumPost
          onPostUpdate?.(updatedPost)
          
          // Handle like count updates
          if (payload.old && (payload.old as any).like_count !== updatedPost.like_count) {
            onPostLikeUpdate?.(updatedPost.id, updatedPost.like_count)
          }
        }
      )
      .subscribe()

    subscriptionsRef.current.push(subscription)
  }, [hasTopicAccess, user?.address, onNewPost, onPostUpdate, onPostLikeUpdate])

  // Subscribe to replies for a specific post
  const subscribeToPostReplies = useCallback((postId: string) => {
    const subscription = supabase
      .channel(`post-replies-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_replies',
          filter: `post_id=eq.${postId}`
        },
        async (payload) => {
          const newReply = payload.new as ForumReply
          
          // Don't show notification for user's own replies
          if (newReply.author_address === user?.address) return

          // Show toast notification
          toast.info('New reply to this post!', {
            duration: 3000
          })

          // Call callback if provided
          onNewReply?.(newReply)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'forum_replies',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          const updatedReply = payload.new as ForumReply
          onReplyUpdate?.(updatedReply)
          
          // Handle like count updates
          if (payload.old && (payload.old as any).like_count !== updatedReply.like_count) {
            onReplyLikeUpdate?.(updatedReply.id, updatedReply.like_count)
          }
        }
      )
      .subscribe()

    subscriptionsRef.current.push(subscription)
  }, [user?.address, onNewReply, onReplyUpdate, onReplyLikeUpdate])

  // Subscribe to general forum activity (for stats updates)
  const subscribeToForumActivity = useCallback(() => {
    const subscription = supabase
      .channel('forum-activity')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_posts'
        },
        (payload) => {
          // This can be used to update forum statistics in real-time
          // For now, we'll just log the activity
          console.log('Forum activity:', payload.eventType, payload.table)
        }
      )
      .subscribe()

    subscriptionsRef.current.push(subscription)
  }, [])

  // Subscribe to user mentions (future feature)
  const subscribeToUserMentions = useCallback(() => {
    if (!user?.address) return

    // This would subscribe to posts/replies that mention the current user
    // Implementation would depend on how mentions are stored
    const subscription = supabase
      .channel(`user-mentions-${user.address}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_user_activity',
          filter: `user_address=eq.${user.address}`
        },
        (payload) => {
          // Handle user-specific notifications
          console.log('User activity:', payload.new)
        }
      )
      .subscribe()

    subscriptionsRef.current.push(subscription)
  }, [user?.address])

  // Setup subscriptions based on props
  useEffect(() => {
    // Clear existing subscriptions
    subscriptionsRef.current.forEach(sub => {
      supabase.removeChannel(sub)
    })
    subscriptionsRef.current = []

    // Subscribe to topic posts if topicId is provided
    if (topicId) {
      subscribeToTopicPosts(topicId)
    }

    // Subscribe to post replies if postId is provided
    if (postId) {
      subscribeToPostReplies(postId)
    }

    // Always subscribe to general forum activity
    subscribeToForumActivity()

    // Subscribe to user mentions
    subscribeToUserMentions()

    // Cleanup on unmount
    return () => {
      subscriptionsRef.current.forEach(sub => {
        supabase.removeChannel(sub)
      })
      subscriptionsRef.current = []
    }
  }, [topicId, postId, subscribeToTopicPosts, subscribeToPostReplies, subscribeToForumActivity, subscribeToUserMentions])

  // Manual cleanup function
  const cleanup = useCallback(() => {
    subscriptionsRef.current.forEach(sub => {
      supabase.removeChannel(sub)
    })
    subscriptionsRef.current = []
  }, [])

  return {
    cleanup,
    isConnected: subscriptionsRef.current.length > 0
  }
}
