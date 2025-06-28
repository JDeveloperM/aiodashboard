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
  category_id: string
  name: string
  description?: string
  access_level: 'ALL' | 'PRO' | 'ROYAL' | 'CREATORS'
  sort_order: number
  is_active: boolean
  post_count: number
  last_post_at?: string
  last_post_by?: string
  created_at: string
  updated_at: string
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
        .select('access_level')
        .eq('id', postData.topic_id)
        .single()

      if (!topic || !this.hasAccess(userTier, topic.access_level)) {
        return { success: false, error: 'Access denied to this topic' }
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
