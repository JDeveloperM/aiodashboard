"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CreateReplyModal } from "./create-reply-modal"
import { CreatePostModal } from "./create-post-modal"
import { ForumUserTooltip } from "./forum-user-tooltip"
import { ForumPost, ForumTopic, forumService } from "@/lib/forum-service"
import { forumUserService, ForumUserData } from "@/lib/forum-user-service"
import { useForumRealtime } from "@/hooks/use-forum-realtime"
import { useSubscription } from "@/contexts/subscription-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { 
  ArrowLeft,
  MessageSquare,
  Loader2,
  Plus,
  Clock,
  Crown,
  Star
} from "lucide-react"

interface ForumThreadViewProps {
  topicId: string
  topicName: string
  categoryName: string
  categoryIcon: React.ReactNode
  categoryColor: string
  categoryImage?: string
  onBack: () => void
}

export function ForumThreadView({
  topicId,
  topicName,
  categoryName,
  categoryIcon,
  categoryColor,
  categoryImage,
  onBack
}: ForumThreadViewProps) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [userDataCache, setUserDataCache] = useState<Map<string, ForumUserData>>(new Map())
  const { tier } = useSubscription()
  const { user } = useSuiAuth()

  // Real-time subscriptions for this topic
  useForumRealtime({
    topicId,
    onNewPost: (newPost) => {
      if (newPost.topic_id === topicId) {
        setPosts(prev => [...prev, newPost])
      }
    }
  })

  useEffect(() => {
    loadPosts()
    loadTopics()
  }, [topicId, tier])

  // Debug posts data
  useEffect(() => {
    if (posts.length > 0) {
      console.log('🔍 Forum Debug: Posts data:', posts.map(post => ({
        id: post.id,
        author_username: post.author_username,
        author_avatar: post.author_avatar,
        author_tier: post.author_tier
      })))
    }
  }, [posts])

  const loadPosts = async () => {
    setIsLoading(true)
    try {
      const result = await forumService.getPostsWithUserData(topicId, 1, 100, tier)
      setPosts(result.posts)

      // Preload user data for all unique authors
      const uniqueAuthors = [...new Set(result.posts.map(post => post.author_address))]
      await forumUserService.preloadUsers(uniqueAuthors)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReplyCreated = async () => {
    // Wait a moment for the database to update, then reload
    setTimeout(async () => {
      await loadPosts()
    }, 500)
  }

  const loadTopics = async () => {
    try {
      // Get all topics for the create post modal
      const allTopics = await forumService.getAllTopics(tier)
      setTopics(allTopics)
    } catch (error) {
      console.error('Failed to load topics:', error)
    }
  }

  const handlePostCreated = async () => {
    // Wait a moment for the database to update, then reload
    setTimeout(async () => {
      await loadPosts()
    }, 500)
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'ROYAL': return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 'PRO': return 'bg-gradient-to-r from-purple-400 to-purple-600'
      case 'NOMAD': return 'bg-gradient-to-r from-blue-400 to-blue-600'
      default: return 'bg-gray-500'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'ROYAL': return <Crown className="w-3 h-3" />
      case 'PRO': return <Star className="w-3 h-3" />
      default: return null
    }
  }

  // Helper function to organize posts and replies
  const organizePostsAndReplies = () => {
    const standalonePosts = posts.filter(post => !post.title.startsWith('Re:'))
    const replies = posts.filter(post => post.title.startsWith('Re:'))

    // Group replies by their parent post (based on title matching)
    const postsWithReplies = standalonePosts.map(post => {
      const postReplies = replies.filter(reply =>
        reply.title === `Re: ${post.title}` ||
        reply.title.includes(post.title)
      )
      return {
        ...post,
        replies: postReplies,
        replyCount: postReplies.length
      }
    })

    return postsWithReplies
  }

  // Toggle post expansion
  const togglePostExpansion = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown time'

    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

      if (diffInHours < 1) return 'Just now'
      if (diffInHours < 24) return `${diffInHours}h ago`
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
      return date.toLocaleDateString()
    } catch (error) {
      console.error('Error formatting date:', dateString, error)
      return 'Invalid date'
    }
  }

  const getAvatarUrl = (blobId: string | null | undefined): string | undefined => {
    if (!blobId) {
      console.log('🔍 Avatar Debug: No blob ID provided')
      return undefined
    }

    try {
      console.log('🔍 Avatar Debug: Processing blob ID:', blobId)

      // Check if it's a default avatar path (starts with /images/animepfp/)
      if (blobId.startsWith('/images/animepfp/')) {
        console.log('✅ Avatar Debug: Default avatar path found:', blobId)
        return blobId // Return the path directly for default avatars
      }

      // Check if it's already a full URL
      if (blobId.startsWith('http')) {
        console.log('✅ Avatar Debug: Full URL found:', blobId)
        return blobId
      }

      // Otherwise it's a Walrus blob ID
      const walrusUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`
      console.log('✅ Avatar Debug: Generated Walrus URL:', walrusUrl)
      return walrusUrl
    } catch (error) {
      console.error('❌ Avatar Debug: Error generating avatar URL:', error)
      return undefined
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#4DA2FF]" />
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={100}>
      <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-[#C0E6FF] hover:text-white hover:bg-[#1a2f51]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {categoryName}
        </Button>
      </div>

      {/* Thread Header */}
      <Card className="bg-[#030f1c] border-[#C0E6FF]/10 overflow-hidden">
        <div
          className="relative bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: categoryImage ? `url(${categoryImage})` : 'none',
            backgroundColor: !categoryImage ? categoryColor : 'transparent'
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60"></div>

          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <div className="text-white">
                    {categoryIcon}
                  </div>
                  {topicName}
                </CardTitle>
              </div>
              <CreatePostModal
                topics={topics}
                onPostCreated={handlePostCreated}
                currentTopicId={topicId}
                currentTopicName={topicName}
                hideTopicSelector={true}
              >
                <Button className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </CreatePostModal>
            </div>
          </CardHeader>
        </div>
      </Card>

      {/* Posts with Collapsible Replies */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {organizePostsAndReplies().map((post) => {
            const isExpanded = expandedPosts.has(post.id)

            return (
              <div key={post.id}>
                {/* Main Post */}
                <Card className="bg-[#1a2f51] border-[#C0E6FF]/10">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        <ForumUserTooltip
                          userAddress={post.author_address}
                          username={post.author_username}
                          avatar={getAvatarUrl(post.author_avatar)}
                          tier={post.author_tier}
                        >
                          <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-[#4DA2FF]/50 transition-all duration-200">
                            <AvatarImage
                              src={getAvatarUrl(post.author_avatar)}
                              alt={post.author_username || 'User'}
                              onError={() => console.log('❌ Avatar Debug: Failed to load image:', post.author_avatar)}
                            />
                            <AvatarFallback className="bg-[#4DA2FF] text-white text-sm">
                              {post.author_username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </ForumUserTooltip>
                      </div>

                      {/* Post Content */}
                      <div className="flex-1 min-w-0">
                        {/* Post Header */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {post.author_username || `User ${post.author_address.slice(0, 6)}`}
                          </span>
                          <Badge className={`${getTierBadgeColor(post.author_tier || 'NOMAD')} text-white text-xs px-1 py-0 h-4 flex items-center gap-1`}>
                            {getTierIcon(post.author_tier || 'NOMAD')}
                            {post.author_tier || 'NOMAD'}
                          </Badge>
                          <span className="text-xs text-[#C0E6FF]/40">
                            {formatDate(post.created_at)}
                          </span>
                        </div>

                        {/* Post Title */}
                        {post.title && (
                          <h3 className="text-base font-semibold text-white mb-2">
                            {post.title}
                          </h3>
                        )}

                        {/* Post Content */}
                        <div className="text-[#C0E6FF] whitespace-pre-wrap mb-3 text-sm">
                          {post.content}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {/* Reply Button */}
                          <CreateReplyModal
                            topicId={topicId}
                            topicName={topicName}
                            onReplyCreated={handleReplyCreated}
                            replyToPost={post}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#C0E6FF]/20 text-[#C0E6FF] hover:bg-[#030f1c] hover:text-white h-7 text-xs"
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Reply
                            </Button>
                          </CreateReplyModal>

                          {/* Replies Toggle Button */}
                          {post.replyCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePostExpansion(post.id)}
                              className="text-[#C0E6FF]/70 hover:text-white hover:bg-[#030f1c] h-7 text-xs"
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
                              <span className="ml-1 text-xs">
                                {isExpanded ? '▼' : '▶'}
                              </span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Collapsible Replies */}
                {post.replyCount > 0 && isExpanded && (
                  <div className="ml-6 mt-2 space-y-2">
                    {post.replies.map((reply) => (
                      <Card key={reply.id} className="bg-[#0f1a2e] border-[#C0E6FF]/5">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            {/* Reply Avatar */}
                            <div className="flex-shrink-0">
                              <ForumUserTooltip
                                userAddress={reply.author_address}
                                username={reply.author_username}
                                avatar={getAvatarUrl(reply.author_avatar)}
                                tier={reply.author_tier}
                              >
                                <Avatar className="w-7 h-7 cursor-pointer hover:ring-2 hover:ring-[#4DA2FF]/50 transition-all duration-200">
                                  <AvatarImage
                                    src={getAvatarUrl(reply.author_avatar)}
                                    alt={reply.author_username || 'User'}
                                  />
                                  <AvatarFallback className="bg-[#4DA2FF] text-white text-xs">
                                    {reply.author_username?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              </ForumUserTooltip>
                            </div>

                            {/* Reply Content */}
                            <div className="flex-1 min-w-0">
                              {/* Reply Header */}
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-white">
                                  {reply.author_username || `User ${reply.author_address.slice(0, 6)}`}
                                </span>
                                <Badge className={`${getTierBadgeColor(reply.author_tier || 'NOMAD')} text-white text-xs px-1 py-0 h-4 flex items-center gap-1`}>
                                  {getTierIcon(reply.author_tier || 'NOMAD')}
                                  {reply.author_tier || 'NOMAD'}
                                </Badge>
                                <span className="text-xs text-[#C0E6FF]/40">
                                  {formatDate(reply.created_at)}
                                </span>
                                <Badge variant="outline" className="text-xs text-[#C0E6FF]/60 border-[#C0E6FF]/20">
                                  Reply
                                </Badge>
                              </div>

                              {/* Reply Content */}
                              <div className="text-[#C0E6FF] whitespace-pre-wrap text-sm">
                                {reply.content}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="bg-[#1a2f51] border-[#C0E6FF]/10">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-10 h-10 text-[#C0E6FF]/50 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-2">No Posts Yet</h3>
            <p className="text-[#C0E6FF]/70 mb-4 text-sm">
              Be the first to start this discussion!
            </p>
            <CreatePostModal
              topics={topics}
              onPostCreated={handlePostCreated}
              currentTopicId={topicId}
              currentTopicName={topicName}
              hideTopicSelector={true}
            >
              <Button className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white h-8 text-sm">
                <Plus className="w-3 h-3 mr-2" />
                Start Discussion
              </Button>
            </CreatePostModal>
          </CardContent>
        </Card>
      )}
      </div>
    </TooltipProvider>
  )
}
