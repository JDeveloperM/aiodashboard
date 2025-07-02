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
  // Special flags for creator posts
  isCreatorPost?: boolean // Indicates this is a post displayed as a topic
  topicId?: string // The actual topic ID for replies
}

export interface ForumPost {
  id: string
  topic_id: string
  author_address: string
  title: string
  content: string
  content_type: 'text' | 'markdown' | 'html'
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
  content_type: 'text' | 'markdown' | 'html'
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
  content_type?: 'text' | 'markdown' | 'html'
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
   * Get forum topics for a category with real-time post counts
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
      const filteredTopics = (data || []).filter(topic =>
        this.hasAccess(userTier, topic.access_level)
      )

      // Get real-time post counts for each topic (excluding replies)
      const topicsWithCounts = await Promise.all(
        filteredTopics.map(async (topic) => {
          // Count only original posts (not replies that start with "Re:")
          const { count } = await supabase
            .from('forum_posts')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id)
            .eq('is_deleted', false)
            .not('title', 'like', 'Re:%')

          // Get last post info (including replies for last activity)
          const { data: lastPost } = await supabase
            .from('forum_posts')
            .select('created_at, author_address')
            .eq('topic_id', topic.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          console.log(`📊 Topic "${topic.name}": ${count || 0} posts (excluding replies)`)

          return {
            ...topic,
            post_count: count || 0,
            posts: count || 0, // Alternative naming
            lastActivity: lastPost?.created_at || topic.last_post_at,
            last_post_at: lastPost?.created_at || topic.last_post_at,
            last_post_by: lastPost?.author_address || topic.last_post_by
          }
        })
      )

      return topicsWithCounts
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
   * Get creator channel posts as actual post objects for direct display
   */
  async getCreatorChannelPosts(creatorId: string, channelId: string): Promise<ForumPost[]> {
    try {
      const timestamp = new Date().toISOString()
      console.log('🔍 Fetching posts for creator:', creatorId, 'channel:', channelId, 'at:', timestamp)

      // First, get the topic ID for this creator's channel
      const { data: topic } = await supabase
        .from('forum_topics')
        .select('id')
        .eq('creator_id', creatorId)
        .eq('channel_id', channelId)
        .single()

      if (!topic) {
        console.log('📭 No topic found for creator channel')
        return []
      }

      console.log('📋 Found topic ID:', topic.id)

      // Query ALL posts in this topic (both creator posts and user replies)
      const { data: postsData, error: postsError } = await supabase
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
          is_deleted,
          view_count,
          topic_id,
          reply_count,
          creator_id,
          channel_id
        `)
        .eq('topic_id', topic.id)
        .eq('is_deleted', false)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (postsError) {
        console.error('Error fetching creator channel posts:', postsError)
        return []
      }

      if (!postsData || postsData.length === 0) {
        console.log('📭 No posts found in topic')
        return []
      }

      console.log('📊 Found posts:', postsData.length, 'posts')
      postsData.forEach(post => {
        console.log(`  - ${post.title} (${post.post_type}) [deleted: ${post.is_deleted}] [pinned: ${post.is_pinned}]`)
      })

      // Get user profiles separately for the authors
      const authorAddresses = [...new Set(postsData.map(post => post.author_address))]
      const { data: userProfiles } = await supabase
        .from('user_profiles')
        .select('address, username_encrypted, profile_image_blob_id, role_tier')
        .in('address', authorAddresses)

      // Merge posts with user profile data
      const postsWithProfiles = postsData.map(post => ({
        ...post,
        user_profiles: userProfiles?.find(profile => profile.address === post.author_address) || null
      }))

      return await this.formatPostsData(postsWithProfiles)
    } catch (error) {
      console.error('Error in getCreatorChannelPosts:', error)
      return []
    }
  }

  /**
   * Helper function to format posts data
   */
  private async formatPostsData(postsData: any[]): Promise<ForumPost[]> {
    // Import encryption service for username decryption
    const { encryptedStorage } = await import('@/lib/encrypted-database-storage')

    const formattedPosts = await Promise.all(postsData.map(async (post) => {
      let username = 'Unknown'

      // Try to decrypt username if available
      if (post.user_profiles?.username_encrypted) {
        try {
          const decryptedProfile = await encryptedStorage.getDecryptedProfile(post.author_address)
          username = decryptedProfile?.username || `User ${post.author_address.slice(0, 6)}`
        } catch (error) {
          console.error('Failed to decrypt username for', post.author_address, error)
          username = `User ${post.author_address.slice(0, 6)}`
        }
      }

      return {
        id: post.id,
        topic_id: post.topic_id,
        title: post.title,
        content: post.content,
        author_address: post.author_address,
        author_username: username,
        author_avatar: post.user_profiles?.profile_image_blob_id || '',
        author_tier: post.user_profiles?.role_tier || 'NOMAD',
        post_type: post.post_type,
        is_pinned: post.is_pinned || false,
        is_locked: post.is_locked || false,
        is_deleted: post.is_deleted || false,
        view_count: post.view_count || 0,
        reply_count: post.reply_count || 0,
        like_count: post.like_count || 0,
        created_at: post.created_at,
        updated_at: post.updated_at,
        last_reply_at: post.last_reply_at || post.updated_at,
        last_reply_by: post.last_reply_by,
        is_moderated: post.is_moderated || false,
        moderated_by: post.moderated_by,
        moderated_at: post.moderated_at,
        moderation_reason: post.moderation_reason,
        content_type: post.content_type || 'text'
      }
    }))

    return formattedPosts
  }

  /**
   * Get a specific topic by ID
   */
  async getTopicById(topicId: string): Promise<ForumTopic | null> {
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('id', topicId)
        .single()

      if (error) {
        console.error('Error fetching topic:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Failed to get topic by ID:', error)
      return null
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
   * Update a creator channel post
   */
  async updateCreatorChannelPost(
    postId: string,
    authorAddress: string,
    updateData: {
      title?: string
      content?: string
      isPinned?: boolean
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Updating creator channel post via API:', {
        postId,
        authorAddress,
        title: updateData.title
      })

      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateData,
          userAddress: authorAddress
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ API update failed:', result)
        return { success: false, error: result.error || 'Failed to update post' }
      }

      console.log('✅ Post updated successfully via API:', result)
      return { success: true }

    } catch (error) {
      console.error('Failed to update creator channel post:', error)
      return { success: false, error: 'Internal server error' }
    }
  }

  /**
   * Delete a creator channel post
   */
  async deleteCreatorChannelPost(
    postId: string,
    authorAddress: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Deleting creator channel post via API:', {
        postId,
        authorAddress
      })

      const response = await fetch(`/api/forum/posts/${postId}?userAddress=${encodeURIComponent(authorAddress)}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ API delete failed:', result)
        return { success: false, error: result.error || 'Failed to delete post' }
      }

      console.log('✅ Post deleted successfully via API:', result)
      return { success: true }

    } catch (error) {
      console.error('Failed to delete creator channel post:', error)
      return { success: false, error: 'Internal server error' }
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
      channelName?: string // Add channel name to use proper topic name
    }
  ): Promise<{ success: boolean; postId?: string; topicId?: string; error?: string }> {
    try {
      console.log('🚀 Creating creator channel post:', {
        creatorAddress,
        channelId,
        title: postData.title
      })


      // First, let's check what categories exist
      const { data: allCategories } = await supabase
        .from('forum_categories')
        .select('id, name')

      console.log('📂 Available categories:', allCategories)

      // Try to find the creators category (could be "Creators", "Creator Hub", etc.)
      const { data: creatorCategory, error: categoryError } = await supabase
        .from('forum_categories')
        .select('id, name')
        .or('name.eq.Creators,name.eq.Creator Hub,name.ilike.%creator%')
        .limit(1)
        .single()

      console.log('🎯 Found creator category:', creatorCategory)

      if (categoryError) {
        console.error('❌ Error finding creator category:', categoryError)
        // If no creator category found, let's create one
        const { data: newCategory, error: createError } = await supabase
          .from('forum_categories')
          .insert({
            name: 'Creators',
            description: 'Creator channels and content',
            icon: 'Users',
            color: '#9333EA',
            sort_order: 2
          })
          .select('id')
          .single()

        if (createError) {
          console.error('❌ Failed to create Creators category:', createError)
          return { success: false, error: `Failed to create Creators category: ${createError.message}` }
        }

        console.log('✅ Created new Creators category:', newCategory)
        var categoryId = newCategory.id
      } else {
        var categoryId = creatorCategory.id
      }

      // Find or create ONE topic for this creator's channel (not per post)
      // Use the actual channel name if provided, otherwise fall back to channel ID
      const topicName = postData.channelName || `${channelId} - Channel Posts`
      const { data: existingTopic, error: topicSearchError } = await supabase
        .from('forum_topics')
        .select('id')
        .eq('category_id', categoryId)
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
            category_id: categoryId,
            name: topicName,
            description: `Posts and discussions for ${postData.channelName || channelId}`,
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
          content_type: 'html'
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
          content_type: 'html'
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
   * Delete a creator post (hard deletion with cascade cleanup)
   */
  async deleteCreatorPost(
    creatorAddress: string,
    postId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if the creator owns this post
      const { data: post } = await supabase
        .from('forum_posts')
        .select('creator_id, topic_id')
        .eq('id', postId)
        .single()

      if (!post || post.creator_id !== creatorAddress) {
        return { success: false, error: 'You can only delete your own posts' }
      }

      console.log('🗑️ Starting comprehensive post deletion...')

      // 1. Delete all replies to this post first
      console.log('🗑️ Deleting replies to post...')
      const { error: repliesError } = await supabase
        .from('forum_posts')
        .delete()
        .eq('parent_post_id', postId)

      if (repliesError) {
        console.warn('⚠️ Failed to delete replies:', repliesError)
      } else {
        console.log('✅ Post replies deleted')
      }

      // 2. Delete the main post
      console.log('🗑️ Deleting main post...')
      const { error: deleteError } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId)

      if (deleteError) {
        return { success: false, error: 'Failed to delete post' }
      }

      console.log('✅ Main post deleted')

      // 3. Update topic reply count if this was a reply
      if (post.topic_id) {
        console.log('🔄 Updating topic reply count...')
        const { error: updateError } = await supabase.rpc('decrement_topic_reply_count', {
          topic_id: post.topic_id
        })

        if (updateError) {
          console.warn('⚠️ Failed to update topic reply count:', updateError)
        }
      }

      console.log('🎉 Post deletion completed successfully')
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
      console.log('🔍 createPost called with:', {
        authorAddress,
        topicId: postData.topic_id,
        userTier,
        title: postData.title
      })

      // Check if user has access to the topic
      const { data: topic } = await supabase
        .from('forum_topics')
        .select('access_level, creator_id, channel_id, content_type')
        .eq('id', postData.topic_id)
        .single()

      console.log('📋 Topic data retrieved:', topic)

      if (!topic) {
        console.log('❌ Topic not found')
        return { success: false, error: 'Topic not found' }
      }

      const hasTopicAccess = this.hasAccess(userTier, topic.access_level)
      console.log('🔐 Access level check:', {
        userTier,
        topicAccessLevel: topic.access_level,
        hasAccess: hasTopicAccess
      })

      if (!hasTopicAccess) {
        return { success: false, error: 'Access denied to this topic' }
      }

      // Check if this is a creator channel topic
      if (topic.creator_id && topic.channel_id && topic.content_type === 'creator_post') {
        // Only the creator can create new posts in their channel topics (case-insensitive comparison)
        if (topic.creator_id.toLowerCase() !== authorAddress.toLowerCase()) {
          console.log('🔍 Creator access check failed:', {
            topicCreatorId: topic.creator_id,
            authorAddress: authorAddress,
            match: topic.creator_id.toLowerCase() === authorAddress.toLowerCase()
          })
          return { success: false, error: 'Only the channel creator can create posts in this channel' }
        }
        console.log('✅ Creator access check passed for channel topic')
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
   * Increment post view count
   */
  async incrementPostView(postId: string, userAddress?: string): Promise<{ success: boolean; newViewCount?: number; error?: string }> {
    try {
      console.log('👁️ Incrementing view count via API for post:', postId)

      const response = await fetch(`/api/forum/posts/${postId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ API view increment failed:', result)
        return { success: false, error: result.error || 'Failed to increment view count' }
      }

      console.log('✅ View count incremented successfully via API:', result)
      return { success: true, newViewCount: result.newViewCount }

    } catch (error) {
      console.error('Failed to increment post view:', error)
      return { success: false, error: 'Internal server error' }
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
