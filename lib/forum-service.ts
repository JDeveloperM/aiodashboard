import { createClient } from '@supabase/supabase-js'
import { encryptedStorage } from './encrypted-database-storage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Types for forum data structures
export interface ForumCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color: string
  access_level: 'ALL' | 'PRO' | 'ROYAL' | 'CREATORS'
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ForumTopic {
  id: string
  category_id?: string
  name: string
  description?: string
  access_level?: 'ALL' | 'PRO' | 'ROYAL' | 'CREATORS'
  accessLevel?: 'ALL' | 'PRO' | 'ROYAL' | 'CREATORS' // Alternative naming
  sort_order?: number
  is_active?: boolean
  post_count?: number
  posts?: number // Alternative naming for post count
  replies?: number // Reply count
  last_post_at?: string
  lastActivity?: string // Alternative naming for last activity
  last_post_by?: string
  created_at?: string
  updated_at?: string
  // Creator-specific properties
  creatorId?: string
  channelId?: string
  contentType?: string
  isPinned?: boolean
  authorTier?: string
  viewCount?: number
}

export interface ForumPost {
  id: string
  topic_id: string
  author_address: string
  title: string
  content: string
  content_type: 'text' | 'markdown'
  is_pinned: boolean
  is_locked: boolean
  is_deleted: boolean
  view_count: number
  reply_count: number
  like_count: number
  created_at: string
  updated_at: string
  last_reply_at: string
  last_reply_by?: string
  is_moderated: boolean
  moderated_by?: string
  moderated_at?: string
  moderation_reason?: string
  
  // Joined data
  author_username?: string
  author_tier?: string
  author_avatar?: string
  topic_name?: string
  category_name?: string
}

export interface ForumReply {
  id: string
  post_id: string
  parent_reply_id?: string
  author_address: string
  content: string
  content_type: 'text' | 'markdown'
  is_deleted: boolean
  like_count: number
  created_at: string
  updated_at: string
  is_moderated: boolean
  moderated_by?: string
  moderated_at?: string
  moderation_reason?: string
  
  // Joined data
  author_username?: string
  author_tier?: string
  author_avatar?: string
}

export interface ForumStats {
  totalPosts: number
  totalMembers: number
  todaysPosts: number
  activeDiscussions: number
  totalReplies: number
}

export interface CreatePostData {
  topic_id: string
  title: string
  content: string
  content_type?: 'text' | 'markdown'
}

export interface CreateReplyData {
  post_id: string
  parent_reply_id?: string
  content: string
  content_type?: 'text' | 'markdown'
}

class ForumService {
  /**
   * Check if user has access to a specific access level
   */
  private hasAccess(userTier: string, requiredLevel: string): boolean {
    if (requiredLevel === 'ALL') return true
    if (requiredLevel === 'PRO') return userTier === 'PRO' || userTier === 'ROYAL'
    if (requiredLevel === 'ROYAL') return userTier === 'ROYAL'
    if (requiredLevel === 'CREATORS') return userTier === 'PRO' || userTier === 'ROYAL'
    return false
  }

  /**
   * Get forum statistics
   */
  async getForumStats(): Promise<ForumStats> {
    try {
      // Get total posts count
      const { count: totalPosts } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)

      // Get total members (users who have posted)
      const { data: uniqueAuthors } = await supabase
        .from('forum_posts')
        .select('author_address')
        .eq('is_deleted', false)

      const totalMembers = new Set(uniqueAuthors?.map(p => p.author_address) || []).size

      // Get today's posts
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: todaysPosts } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .gte('created_at', today.toISOString())

      // Get active discussions (posts with replies in last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { count: activeDiscussions } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .gte('last_reply_at', weekAgo.toISOString())

      // Get total replies count
      const { count: totalReplies } = await supabase
        .from('forum_replies')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)

      return {
        totalPosts: totalPosts || 0,
        totalMembers,
        todaysPosts: todaysPosts || 0,
        activeDiscussions: activeDiscussions || 0,
        totalReplies: totalReplies || 0
      }
    } catch (error) {
      console.error('Failed to get forum stats:', error)
      return {
        totalPosts: 0,
        totalMembers: 0,
        todaysPosts: 0,
        activeDiscussions: 0,
        totalReplies: 0
      }
    }
  }

  /**
   * Get forum categories accessible to user
   */
  async getCategories(userTier: string = 'NOMAD'): Promise<ForumCategory[]> {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error

      // Filter categories based on user access level
      return (data || []).filter(category => 
        this.hasAccess(userTier, category.access_level)
      )
    } catch (error) {
      console.error('Failed to get categories:', error)
      return []
    }
  }

  /**
   * Get forum topics for a category
   */
  async getTopics(categoryId: string, userTier: string = 'NOMAD'): Promise<ForumTopic[]> {
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error

      // Filter topics based on user access level
      return (data || []).filter(topic =>
        this.hasAccess(userTier, topic.access_level)
      )
    } catch (error) {
      console.error('Failed to get topics:', error)
      return []
    }
  }

  /**
   * Get forum topics for a specific creator
   */
  async getCreatorTopics(
    categoryId: string,
    creatorId: string,
    userTier: string = 'NOMAD'
  ): Promise<ForumTopic[]> {
    try {
      // First get all topics in the category
      const allTopics = await this.getTopics(categoryId, userTier)

      // Filter topics that mention the creator in name, description, or have creator-specific tags
      // In a real implementation, you might have a creator_id field in the topics table
      const creatorTopics = allTopics.filter(topic => {
        const searchText = `${topic.name} ${topic.description || ''}`.toLowerCase()
        const creatorSearchTerms = [
          creatorId.toLowerCase(),
          // You could add more creator-specific search terms here
        ]

        return creatorSearchTerms.some(term => searchText.includes(term))
      })

      return creatorTopics
    } catch (error) {
      console.error('Failed to get creator topics:', error)
      return []
    }
  }

  /**
   * Get creator channel posts as topics for forum display
   */
  async getCreatorChannelPosts(creatorId: string, channelId: string): Promise<ForumTopic[]> {
    try {
      // Get posts directly from the creator's channel
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          id,
          title,
          content,
          created_at,
          updated_at,
          author_address,
          post_type,
          is_pinned,
          view_count,
          topic_id,
          forum_topics (
            id,
            name,
            description
          )
        `)
        .eq('creator_id', creatorId)
        .eq('channel_id', channelId)
        .eq('post_type', 'creator_post')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching creator channel posts:', error)
        return []
      }

      // Convert posts to topic format for display
      return (data || []).map(post => ({
        id: post.id,
        name: post.title,
        description: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
        posts: 1, // Each post is treated as a topic
        replies: 0, // We'll count replies separately if needed
        lastActivity: post.updated_at || post.created_at,
        accessLevel: 'ALL' as 'ALL' | 'PRO' | 'ROYAL',
        creatorId: creatorId,
        channelId: channelId,
        contentType: 'creator_post',
        isPinned: post.is_pinned || false,
        authorTier: 'PRO', // Default tier for creators
        viewCount: post.view_count || 0
      }))
    } catch (error) {
      console.error('Error in getCreatorChannelPosts:', error)
      return []
    }
  }

  /**
   * Get all forum topics across all categories
   */
  async getAllTopics(userTier: string = 'NOMAD'): Promise<ForumTopic[]> {
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error

      // Filter topics based on user access level
      return (data || []).filter(topic =>
        this.hasAccess(userTier, topic.access_level)
      )
    } catch (error) {
      console.error('Failed to get all topics:', error)
      return []
    }
  }

  /**
   * Get posts for a topic with pagination
   */
  async getPosts(
    topicId: string, 
    page: number = 1, 
    limit: number = 20,
    userTier: string = 'NOMAD'
  ): Promise<{ posts: ForumPost[], totalCount: number }> {
    try {
      const offset = (page - 1) * limit

      // First check if user has access to this topic
      const { data: topic } = await supabase
        .from('forum_topics')
        .select('access_level')
        .eq('id', topicId)
        .single()

      if (!topic || !this.hasAccess(userTier, topic.access_level)) {
        return { posts: [], totalCount: 0 }
      }

      // Get posts with author information
      const { data, error, count } = await supabase
        .from('forum_posts')
        .select(`
          *,
          forum_topics!inner(name, forum_categories!inner(name))
        `, { count: 'exact' })
        .eq('topic_id', topicId)
        .eq('is_deleted', false)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return {
        posts: data || [],
        totalCount: count || 0
      }
    } catch (error) {
      console.error('Failed to get posts:', error)
      return { posts: [], totalCount: 0 }
    }
  }

  /**
   * Get posts related to a specific creator across all topics in a category
   */
  async getCreatorPosts(
    categoryId: string,
    creatorId: string,
    userTier: string = 'NOMAD',
    limit: number = 20,
    offset: number = 0
  ): Promise<{ posts: ForumPost[], totalCount: number }> {
    try {
      // Get creator-specific topics first
      const creatorTopics = await this.getCreatorTopics(categoryId, creatorId, userTier)
      const topicIds = creatorTopics.map(topic => topic.id)

      if (topicIds.length === 0) {
        return { posts: [], totalCount: 0 }
      }

      // Get posts from these topics
      const { data, error, count } = await supabase
        .from('forum_posts')
        .select(`
          *,
          forum_topics!inner(name)
        `, { count: 'exact' })
        .in('topic_id', topicIds)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return {
        posts: data || [],
        totalCount: count || 0
      }
    } catch (error) {
      console.error('Failed to get creator posts:', error)
      return { posts: [], totalCount: 0 }
    }
  }

  /**
   * Create a creator channel post
   */
  async createCreatorChannelPost(
    creatorAddress: string,
    channelId: string,
    postData: {
      title: string
      content: string
      isPinned?: boolean
      publishNow?: boolean
      scheduledDate?: string
    }
  ): Promise<{ success: boolean; postId?: string; topicId?: string; error?: string }> {
    try {
      console.log('🚀 Creating creator channel post:', {
        creatorAddress,
        channelId,
        title: postData.title
      })


      // First, create or get the creator's channel topic in the Creators category
      const { data: creatorCategory, error: categoryError } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('name', 'Creator Hub')
        .single()

      if (categoryError) {
        console.error('❌ Error finding Creator Hub category:', categoryError)
        return { success: false, error: `Creator Hub category error: ${categoryError.message}` }
      }

      if (!creatorCategory) {
        console.error('❌ Creator Hub category not found')
        return { success: false, error: 'Creator Hub category not found' }
      }

      // Create a topic for this creator's channel if it doesn't exist
      const topicName = `${channelId} - Channel Posts`
      const { data: existingTopic, error: topicSearchError } = await supabase
        .from('forum_topics')
        .select('id')
        .eq('category_id', creatorCategory.id)
        .eq('creator_id', creatorAddress)
        .eq('channel_id', channelId)
        .single()

      if (topicSearchError && topicSearchError.code !== 'PGRST116') {
        console.error('❌ Error searching for existing topic:', topicSearchError)
        return { success: false, error: `Topic search error: ${topicSearchError.message}` }
      }

      let topicId: string

      if (existingTopic) {
        topicId = existingTopic.id
      } else {
        // Create new topic for this creator's channel
        const { data: newTopic, error: topicError } = await supabase
          .from('forum_topics')
          .insert({
            category_id: creatorCategory.id,
            name: topicName,
            description: `Posts and discussions for channel ${channelId}`,
            creator_id: creatorAddress,
            channel_id: channelId,
            content_type: 'creator_post',
            access_level: 'ALL'
          })
          .select('id')
          .single()

        if (topicError || !newTopic) {
          console.error('❌ Failed to create topic:', topicError)
          return { success: false, error: `Failed to create channel topic: ${topicError?.message || 'Unknown error'}` }
        }

        topicId = newTopic.id
      }

      // Create the post
      const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: topicId,
          author_address: creatorAddress,
          title: postData.title,
          content: postData.content,
          creator_id: creatorAddress,
          channel_id: channelId,
          post_type: 'creator_post',
          is_pinned: postData.isPinned || false,
          content_type: 'text'
        })
        .select('id')
        .single()

      if (postError || !post) {
        console.error('❌ Failed to create post:', postError)
        return { success: false, error: `Failed to create post: ${postError?.message || 'Unknown error'}` }
      }

      return {
        success: true,
        postId: post.id,
        topicId: topicId
      }

    } catch (error) {
      console.error('Failed to create creator channel post:', error)
      return { success: false, error: 'Internal server error' }
    }
  }

  /**
   * Create a user reply to a creator post
   */
  async createUserReply(
    userAddress: string,
    postData: {
      topic_id: string
      title: string
      content: string
      parent_post_id?: string
    },
    userTier: string = 'NOMAD'
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      // Check if user has access to the topic
      const { data: topic } = await supabase
        .from('forum_topics')
        .select('access_level, creator_id, channel_id')
        .eq('id', postData.topic_id)
        .single()

      if (!topic || !this.hasAccess(userTier, topic.access_level)) {
        return { success: false, error: 'Access denied to this topic' }
      }

      // Create the reply
      const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: postData.topic_id,
          author_address: userAddress,
          title: postData.title.startsWith('Re:') ? postData.title : `Re: ${postData.title}`,
          content: postData.content,
          post_type: 'user_reply',
          content_type: 'text'
        })
        .select('id')
        .single()

      if (postError || !post) {
        return { success: false, error: 'Failed to create reply' }
      }

      return {
        success: true,
        postId: post.id
      }

    } catch (error) {
      console.error('Failed to create user reply:', error)
      return { success: false, error: 'Internal server error' }
    }
  }

  /**
   * Moderate a reply (approve, reject, flag)
   */
  async moderateReply(
    creatorAddress: string,
    replyId: string,
    action: 'approve' | 'reject' | 'flag',
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if the creator owns the channel where this reply was made
      const { data: reply } = await supabase
        .from('forum_posts')
        .select(`
          id,
          topic_id,
          forum_topics!inner(creator_id, channel_id)
        `)
        .eq('id', replyId)
        .single()

      if (!reply || !reply.forum_topics?.[0]?.creator_id) {
        return { success: false, error: 'Reply not found or not in a creator channel' }
      }

      if (reply.forum_topics[0].creator_id !== creatorAddress) {
        return { success: false, error: 'You can only moderate replies in your own channels' }
      }

      // Perform the moderation action
      let updateData: any = {}

      switch (action) {
        case 'approve':
          updateData = { is_approved: true, is_flagged: false }
          break
        case 'reject':
          updateData = { is_deleted: true, deleted_reason: reason || 'Rejected by creator' }
          break
        case 'flag':
          updateData = { is_flagged: true, flag_reason: reason || 'Flagged by creator' }
          break
      }

      const { error: updateError } = await supabase
        .from('forum_posts')
        .update(updateData)
        .eq('id', replyId)

      if (updateError) {
        return { success: false, error: 'Failed to moderate reply' }
      }

      return { success: true }

    } catch (error) {
      console.error('Failed to moderate reply:', error)
      return { success: false, error: 'Internal server error' }
    }
  }

  /**
   * Pin or unpin a creator post
   */
  async togglePostPin(
    creatorAddress: string,
    postId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if the creator owns this post
      const { data: post } = await supabase
        .from('forum_posts')
        .select('creator_id, is_pinned')
        .eq('id', postId)
        .single()

      if (!post || post.creator_id !== creatorAddress) {
        return { success: false, error: 'You can only pin your own posts' }
      }

      const { error: updateError } = await supabase
        .from('forum_posts')
        .update({ is_pinned: !post.is_pinned })
        .eq('id', postId)

      if (updateError) {
        return { success: false, error: 'Failed to update post pin status' }
      }

      return { success: true }

    } catch (error) {
      console.error('Failed to toggle post pin:', error)
      return { success: false, error: 'Internal server error' }
    }
  }

  /**
   * Delete a creator post
   */
  async deleteCreatorPost(
    creatorAddress: string,
    postId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if the creator owns this post
      const { data: post } = await supabase
        .from('forum_posts')
        .select('creator_id')
        .eq('id', postId)
        .single()

      if (!post || post.creator_id !== creatorAddress) {
        return { success: false, error: 'You can only delete your own posts' }
      }

      const { error: deleteError } = await supabase
        .from('forum_posts')
        .update({ is_deleted: true, deleted_reason: 'Deleted by creator' })
        .eq('id', postId)

      if (deleteError) {
        return { success: false, error: 'Failed to delete post' }
      }

      return { success: true }

    } catch (error) {
      console.error('Failed to delete creator post:', error)
      return { success: false, error: 'Internal server error' }
    }
  }

  /**
   * Get channel moderation statistics
   */
  async getChannelModerationStats(
    creatorAddress: string,
    channelId: string
  ): Promise<{
    pending_replies: number
    flagged_replies: number
    total_replies: number
    total_posts: number
  }> {
    try {
      // Get all posts in creator's channel topics
      const { data: channelTopics } = await supabase
        .from('forum_topics')
        .select('id')
        .eq('creator_id', creatorAddress)
        .eq('channel_id', channelId)

      if (!channelTopics || channelTopics.length === 0) {
        return { pending_replies: 0, flagged_replies: 0, total_replies: 0, total_posts: 0 }
      }

      const topicIds = channelTopics.map(t => t.id)

      // Get reply statistics
      const { data: replyStats } = await supabase
        .from('forum_posts')
        .select('is_approved, is_flagged, post_type')
        .in('topic_id', topicIds)
        .eq('is_deleted', false)

      if (!replyStats) {
        return { pending_replies: 0, flagged_replies: 0, total_replies: 0, total_posts: 0 }
      }

      const stats = replyStats.reduce((acc, post) => {
        if (post.post_type === 'creator_post') {
          acc.total_posts++
        } else if (post.post_type === 'user_reply') {
          acc.total_replies++
          if (!post.is_approved && !post.is_flagged) {
            acc.pending_replies++
          }
          if (post.is_flagged) {
            acc.flagged_replies++
          }
        }
        return acc
      }, { pending_replies: 0, flagged_replies: 0, total_replies: 0, total_posts: 0 })

      return stats

    } catch (error) {
      console.error('Failed to get channel moderation stats:', error)
      return { pending_replies: 0, flagged_replies: 0, total_replies: 0, total_posts: 0 }
    }
  }

  /**
   * Get recent posts across all accessible categories
   */
  async getRecentPosts(
    userTier: string = 'NOMAD',
    limit: number = 10
  ): Promise<ForumPost[]> {
    try {
      // Get accessible categories first
      const categories = await this.getCategories(userTier)
      const categoryIds = categories.map(c => c.id)

      if (categoryIds.length === 0) return []

      // Get topics from accessible categories
      const { data: topics } = await supabase
        .from('forum_topics')
        .select('id, access_level')
        .in('category_id', categoryIds)
        .eq('is_active', true)

      if (!topics) return []

      // Filter topics by access level
      const accessibleTopicIds = topics
        .filter(topic => this.hasAccess(userTier, topic.access_level))
        .map(topic => topic.id)

      if (accessibleTopicIds.length === 0) return []

      // Get recent posts from accessible topics
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          forum_topics!inner(name, forum_categories!inner(name))
        `)
        .in('topic_id', accessibleTopicIds)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Failed to get recent posts:', error)
      return []
    }
  }

  /**
   * Create a new forum post
   */
  async createPost(
    authorAddress: string,
    postData: CreatePostData,
    userTier: string = 'NOMAD'
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      // Check if user has access to the topic
      const { data: topic } = await supabase
        .from('forum_topics')
        .select('access_level, creator_id, channel_id, content_type')
        .eq('id', postData.topic_id)
        .single()

      if (!topic || !this.hasAccess(userTier, topic.access_level)) {
        return { success: false, error: 'Access denied to this topic' }
      }

      // Check if this is a creator channel topic
      if (topic.creator_id && topic.channel_id && topic.content_type === 'creator_post') {
        // Only the creator can create new posts in their channel topics
        if (topic.creator_id !== authorAddress) {
          return { success: false, error: 'Only the channel creator can create posts in this channel' }
        }
      }

      // Create the post
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: postData.topic_id,
          author_address: authorAddress,
          title: postData.title,
          content: postData.content,
          content_type: postData.content_type || 'text'
        })
        .select('id')
        .single()

      if (error) throw error

      // Get current topic data to increment post count
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .select('post_count')
        .eq('id', postData.topic_id)
        .single()

      if (topicError) throw topicError

      // Update topic post count and last post info
      const { error: updateError } = await supabase
        .from('forum_topics')
        .update({
          post_count: (topicData?.post_count || 0) + 1,
          last_post_at: new Date().toISOString(),
          last_post_by: authorAddress,
          updated_at: new Date().toISOString()
        })
        .eq('id', postData.topic_id)

      if (updateError) {
        console.error('Failed to update topic stats:', updateError)
        // Don't fail the whole operation, just log the error
      }

      return { success: true, postId: data.id }
    } catch (error) {
      console.error('Failed to create post:', error)
      return { success: false, error: 'Failed to create post' }
    }
  }

  /**
   * Enhance posts with user profile data
   */
  async enhancePostsWithUserData(posts: ForumPost[]): Promise<ForumPost[]> {
    try {
      const uniqueAddresses = [...new Set(posts.map(post => post.author_address))]

      // Get user profiles for all unique addresses
      const profilePromises = uniqueAddresses.map(async (address) => {
        try {
          const profile = await encryptedStorage.getDecryptedProfile(address)
          return { address, profile }
        } catch (error) {
          console.error(`Failed to get profile for ${address}:`, error)
          return { address, profile: null }
        }
      })

      const profileResults = await Promise.all(profilePromises)
      const profileMap = new Map(
        profileResults.map(result => [result.address, result.profile])
      )

      // Enhance posts with profile data
      return posts.map(post => {
        const profile = profileMap.get(post.author_address)

        // Extract topic and category names from joined data if available
        const topicName = (post as any).forum_topics?.name || post.topic_name
        const categoryName = (post as any).forum_topics?.forum_categories?.name || post.category_name

        return {
          ...post,
          author_username: profile?.username || `User ${post.author_address.slice(0, 6)}`,
          author_tier: profile?.role_tier || 'NOMAD',
          author_avatar: profile?.profile_image_blob_id || undefined,
          topic_name: topicName,
          category_name: categoryName
        }
      })
    } catch (error) {
      console.error('Failed to enhance posts with user data:', error)
      return posts
    }
  }

  /**
   * Get posts with enhanced user data
   */
  async getPostsWithUserData(
    topicId: string,
    page: number = 1,
    limit: number = 20,
    userTier: string = 'NOMAD'
  ): Promise<{ posts: ForumPost[], totalCount: number }> {
    const result = await this.getPosts(topicId, page, limit, userTier)
    const enhancedPosts = await this.enhancePostsWithUserData(result.posts)

    return {
      posts: enhancedPosts,
      totalCount: result.totalCount
    }
  }

  /**
   * Get recent posts with enhanced user data
   */
  async getRecentPostsWithUserData(
    userTier: string = 'NOMAD',
    limit: number = 10
  ): Promise<ForumPost[]> {
    const posts = await this.getRecentPosts(userTier, limit)
    return this.enhancePostsWithUserData(posts)
  }

  /**
   * Like/unlike a post
   */
  async togglePostLike(
    userAddress: string,
    postId: string
  ): Promise<{ success: boolean; isLiked: boolean; error?: string }> {
    try {
      // Check if user already liked this post
      const { data: existingLike } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('user_address', userAddress)
        .eq('post_id', postId)
        .single()

      if (existingLike) {
        // Unlike the post
        const { error } = await supabase
          .from('forum_likes')
          .delete()
          .eq('user_address', userAddress)
          .eq('post_id', postId)

        if (error) throw error

        // Get current like count and decrease it
        const { data: postData, error: postError } = await supabase
          .from('forum_posts')
          .select('like_count')
          .eq('id', postId)
          .single()

        if (postError) throw postError

        await supabase
          .from('forum_posts')
          .update({ like_count: Math.max(0, (postData?.like_count || 0) - 1) })
          .eq('id', postId)

        return { success: true, isLiked: false }
      } else {
        // Like the post
        const { error } = await supabase
          .from('forum_likes')
          .insert({
            user_address: userAddress,
            post_id: postId
          })

        if (error) throw error

        // Get current like count and increase it
        const { data: postData, error: postError } = await supabase
          .from('forum_posts')
          .select('like_count')
          .eq('id', postId)
          .single()

        if (postError) throw postError

        await supabase
          .from('forum_posts')
          .update({ like_count: (postData?.like_count || 0) + 1 })
          .eq('id', postId)

        return { success: true, isLiked: true }
      }
    } catch (error) {
      console.error('Failed to toggle post like:', error)
      return { success: false, isLiked: false, error: 'Failed to toggle like' }
    }
  }

  /**
   * Check if user has liked a post
   */
  async hasUserLikedPost(userAddress: string, postId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('user_address', userAddress)
        .eq('post_id', postId)
        .single()

      return !!data
    } catch (error) {
      return false
    }
  }

  /**
   * Record user activity
   */
  async recordActivity(
    userAddress: string,
    activityType: 'post_created' | 'reply_created' | 'post_liked' | 'reply_liked' | 'post_viewed',
    postId?: string,
    replyId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('forum_user_activity')
        .insert({
          user_address: userAddress,
          activity_type: activityType,
          post_id: postId,
          reply_id: replyId
        })
    } catch (error) {
      console.error('Failed to record user activity:', error)
    }
  }

  /**
   * Get user's posts across all accessible topics (excluding replies)
   */
  async getUserPosts(
    userAddress: string,
    userTier: string = 'NOMAD',
    page: number = 1,
    limit: number = 20
  ): Promise<{ posts: ForumPost[], totalCount: number }> {
    try {
      const offset = (page - 1) * limit

      // Get accessible categories first
      const categories = await this.getCategories(userTier)
      const categoryIds = categories.map(c => c.id)

      if (categoryIds.length === 0) return { posts: [], totalCount: 0 }

      // Get topics from accessible categories
      const { data: topics } = await supabase
        .from('forum_topics')
        .select('id, access_level')
        .in('category_id', categoryIds)
        .eq('is_active', true)

      if (!topics) return { posts: [], totalCount: 0 }

      // Filter topics by access level
      const accessibleTopicIds = topics
        .filter(topic => this.hasAccess(userTier, topic.access_level))
        .map(topic => topic.id)

      if (accessibleTopicIds.length === 0) return { posts: [], totalCount: 0 }

      // Get user's original posts (not replies) from accessible topics
      const { data, error, count } = await supabase
        .from('forum_posts')
        .select(`
          *,
          forum_topics!inner(name, forum_categories!inner(name))
        `, { count: 'exact' })
        .eq('author_address', userAddress)
        .in('topic_id', accessibleTopicIds)
        .eq('is_deleted', false)
        .not('title', 'like', 'Re:%') // Exclude replies (posts with titles starting with "Re:")
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Enhance posts with user data
      const enhancedPosts = await this.enhancePostsWithUserData(data || [])

      return {
        posts: enhancedPosts,
        totalCount: count || 0
      }
    } catch (error) {
      console.error('Failed to get user posts:', error)
      return { posts: [], totalCount: 0 }
    }
  }

  /**
   * Get user's replies across all accessible topics (posts with "Re:" prefix)
   */
  async getUserReplies(
    userAddress: string,
    userTier: string = 'NOMAD',
    page: number = 1,
    limit: number = 20
  ): Promise<{ replies: ForumPost[], totalCount: number }> {
    try {
      const offset = (page - 1) * limit

      // Get accessible categories first
      const categories = await this.getCategories(userTier)
      const categoryIds = categories.map(c => c.id)

      if (categoryIds.length === 0) return { replies: [], totalCount: 0 }

      // Get topics from accessible categories
      const { data: topics } = await supabase
        .from('forum_topics')
        .select('id, access_level')
        .in('category_id', categoryIds)
        .eq('is_active', true)

      if (!topics) return { replies: [], totalCount: 0 }

      // Filter topics by access level
      const accessibleTopicIds = topics
        .filter(topic => this.hasAccess(userTier, topic.access_level))
        .map(topic => topic.id)

      if (accessibleTopicIds.length === 0) return { replies: [], totalCount: 0 }

      // Get user's replies (posts with "Re:" prefix) from accessible topics
      const { data, error, count } = await supabase
        .from('forum_posts')
        .select(`
          *,
          forum_topics!inner(name, forum_categories!inner(name))
        `, { count: 'exact' })
        .eq('author_address', userAddress)
        .in('topic_id', accessibleTopicIds)
        .eq('is_deleted', false)
        .like('title', 'Re:%') // Only replies (posts with titles starting with "Re:")
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Enhance replies with user data
      const enhancedReplies = await this.enhancePostsWithUserData(data || [])

      return {
        replies: enhancedReplies,
        totalCount: count || 0
      }
    } catch (error) {
      console.error('Failed to get user replies:', error)
      return { replies: [], totalCount: 0 }
    }
  }
}

export const forumService = new ForumService()
