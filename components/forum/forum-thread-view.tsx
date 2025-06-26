"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CreateReplyModal } from "./create-reply-modal"
import { CreatePostModal } from "./create-post-modal"
import { ForumPost, ForumTopic, forumService } from "@/lib/forum-service"
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
                <p className="text-white/80 text-sm">
                  {posts.length > 1 ? `${posts.length - 1} ${posts.length === 2 ? 'reply' : 'replies'}` : 'No replies yet'}
                </p>
              </div>
              <CreatePostModal
                topics={topics}
                onPostCreated={handlePostCreated}
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

      {/* Thread Posts */}
      {posts.length > 0 ? (
        <div className="space-y-2">
          {/* Original Post */}
          {posts[0] && (
            <Card className="bg-[#1a2f51] border-[#C0E6FF]/10">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={getAvatarUrl(posts[0].author_avatar)}
                        alt={posts[0].author_username || 'User'}
                        onError={() => console.log('❌ Avatar Debug: Failed to load image for main post:', posts[0].author_avatar)}
                      />
                      <AvatarFallback className="bg-[#4DA2FF] text-white text-sm">
                        {posts[0].author_username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    {/* Post Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {posts[0].author_username || `User ${posts[0].author_address.slice(0, 6)}`}
                      </span>
                      <Badge className={`${getTierBadgeColor(posts[0].author_tier || 'NOMAD')} text-white text-xs px-1 py-0 h-4 flex items-center gap-1`}>
                        {getTierIcon(posts[0].author_tier || 'NOMAD')}
                        {posts[0].author_tier || 'NOMAD'}
                      </Badge>
                      <span className="text-xs text-[#C0E6FF]/40">
                        {formatDate(posts[0].created_at)}
                      </span>
                    </div>

                    {/* Post Title */}
                    {posts[0].title && (
                      <h3 className="text-base font-semibold text-white mb-2">
                        {posts[0].title}
                      </h3>
                    )}

                    {/* Post Content */}
                    <div className="text-[#C0E6FF] whitespace-pre-wrap mb-3 text-sm">
                      {posts[0].content}
                    </div>

                    {/* Reply Button - Only on original post */}
                    <CreateReplyModal
                      topicId={topicId}
                      topicName={topicName}
                      onReplyCreated={handleReplyCreated}
                      replyToPost={posts[0]}
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
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Replies - Show newest first */}
          {posts.length > 1 && (
            <div className="ml-6 space-y-2">
              {posts.slice(1).reverse().map((post, index) => (
                <Card key={post.id} className="bg-[#0f1a2e] border-[#C0E6FF]/5">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        <Avatar className="w-7 h-7">
                          <AvatarImage
                            src={getAvatarUrl(post.author_avatar)}
                            alt={post.author_username || 'User'}
                            onError={() => console.log('❌ Avatar Debug: Failed to load image for reply:', post.author_avatar)}
                          />
                          <AvatarFallback className="bg-[#4DA2FF] text-white text-xs">
                            {post.author_username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Reply Content */}
                      <div className="flex-1 min-w-0">
                        {/* Reply Header */}
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

                        {/* Reply Content */}
                        <div className="text-[#C0E6FF] whitespace-pre-wrap text-sm">
                          {post.content}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card className="bg-[#1a2f51] border-[#C0E6FF]/10">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-10 h-10 text-[#C0E6FF]/50 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-2">No Posts Yet</h3>
            <p className="text-[#C0E6FF]/70 mb-4 text-sm">
              Be the first to start this discussion!
            </p>
            <CreateReplyModal
              topicId={topicId}
              topicName={topicName}
              onReplyCreated={handleReplyCreated}
            >
              <Button className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white h-8 text-sm">
                <Plus className="w-3 h-3 mr-2" />
                Start Discussion
              </Button>
            </CreateReplyModal>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
