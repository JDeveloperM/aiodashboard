"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Eye,
  Plus,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { ForumPost, forumService } from "@/lib/forum-service"
import { formatDistanceToNow } from "date-fns"
import { getCreatorProfile, getCreatorAvatarUrl, getCreatorCoverUrl } from "@/lib/creator-storage"
import { CreateReplyModal } from "./create-reply-modal"
import { useCreatorsDatabase } from "@/contexts/creators-database-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"

// Helper function to get avatar URL from blob ID
const getAvatarUrl = (blobId: string | null | undefined): string | undefined => {
  if (!blobId) {
    return undefined
  }

  try {
    // Check if it's a default avatar path (starts with /images/animepfp/)
    if (blobId.startsWith('/images/animepfp/')) {
      return blobId // Return the path directly for default avatars
    }

    // Check if it's already a full URL
    if (blobId.startsWith('http')) {
      return blobId
    }

    // Otherwise it's a Walrus blob ID
    const walrusUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`
    return walrusUrl
  } catch (error) {
    console.error('Error generating avatar URL:', error)
    return undefined
  }
}

interface CreatorContext {
  creatorId: string
  channelId: string
  channelName: string
  channelDescription: string
  creatorName: string
  channelBanner?: string
  channelAvatar?: string
  channelCover?: string
}

interface CreatorChannelPostsProps {
  creatorContext: CreatorContext
  categoryImage: string
  onCreatePost?: () => void
}



export default function CreatorChannelPosts({ creatorContext, categoryImage, onCreatePost }: CreatorChannelPostsProps) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [creatorData, setCreatorData] = useState<any>(null)
  const [creatorAvatar, setCreatorAvatar] = useState<string>("")
  const [creatorCover, setCreatorCover] = useState<string>("")
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false)

  // Get creators context to access channel-specific images
  const { creators } = useCreatorsDatabase()

  // Get current user to check if they're the creator
  const { user } = useSuiAuth()

  // Check if current user is the creator of this channel
  const isCreator = () => {
    if (!user?.address) return false

    // Check if user's address matches the creator ID (which should be the creator's wallet address)
    const isDirectMatch = user.address === creatorContext.creatorId

    // Also check in creators context for additional verification
    const creator = creators.find(c => c.id === creatorContext.creatorId || c.creatorAddress === creatorContext.creatorId)
    const isContextMatch = creator && (creator.creatorAddress === user.address || creator.id === user.address)

    console.log('🔐 Creator check:', {
      userAddress: user.address,
      creatorId: creatorContext.creatorId,
      isDirectMatch,
      isContextMatch,
      foundCreator: !!creator,
      creatorAddress: creator?.creatorAddress
    })

    return isDirectMatch || isContextMatch
  }

  useEffect(() => {
    loadPosts()
    if (!imagesLoaded) {
      loadCreatorData()
    }
  }, [creatorContext.creatorId, creatorContext.channelId, imagesLoaded])

  // Reset images loaded flag when creator/channel changes
  useEffect(() => {
    setImagesLoaded(false)
    setCreatorAvatar("")
    setCreatorCover("")
  }, [creatorContext.creatorId, creatorContext.channelId])

  const loadCreatorData = async () => {
    try {
      console.log('🔍 Loading creator data for:', creatorContext.creatorId)

      // Fetch creator data directly from API
      const response = await fetch('/api/creators')
      const result = await response.json()

      if (result.success && result.data) {
        // Normalize creator ID - handle wallet addresses and malformed IDs
        const normalizedCreatorId = creatorContext.creatorId.split('_')[0] // Remove any appended parts

        // Find the creator by matching multiple possible formats
        const dbCreator = result.data.find((c: any) =>
          c.id === creatorContext.creatorId || // Exact match
          c.creator_address === creatorContext.creatorId || // Wallet address match
          c.id === normalizedCreatorId || // Normalized ID match
          c.creator_address === normalizedCreatorId // Normalized wallet address match
        )

        console.log('🔍 Creator search:', {
          searchingFor: creatorContext.creatorId,
          normalized: normalizedCreatorId,
          foundCreator: !!dbCreator,
          creatorName: dbCreator?.channel_name_encrypted
        })

        if (dbCreator) {
          console.log('✅ Found creator in database:', dbCreator.channel_name_encrypted)

          // Find the specific channel in channels_data
          const channelData = dbCreator.channels_data?.find((ch: any) => ch.id === creatorContext.channelId)

          if (channelData) {
            console.log('✅ Found channel data:', channelData.name)
            console.log('🖼️ Channel images:', {
              channelAvatar: channelData.channelAvatar,
              channelCover: channelData.channelCover
            })

            // Use channel-specific images directly from database
            if (channelData.channelAvatar) {
              setCreatorAvatar(channelData.channelAvatar)
              console.log('✅ Set channel avatar:', channelData.channelAvatar)
            }

            if (channelData.channelCover) {
              setCreatorCover(channelData.channelCover)
              console.log('✅ Set channel cover:', channelData.channelCover)
            }
          } else {
            console.log('❌ Channel not found in database')
          }
        } else {
          console.log('❌ Creator not found in database')
        }
      }

      // Mark images as loaded to prevent further updates
      setImagesLoaded(true)
      console.log('✅ Images loaded and locked for:', creatorContext.creatorId, creatorContext.channelId)
    } catch (error) {
      console.error('❌ Error loading creator data:', error)
      setImagesLoaded(true) // Prevent infinite retries
    }
  }

  const loadPosts = async () => {
    try {
      setIsLoading(true)
      console.log('Loading posts for creator:', creatorContext.creatorId, 'channel:', creatorContext.channelId)
      const postsData = await forumService.getCreatorChannelPosts(
        creatorContext.creatorId,
        creatorContext.channelId
      )
      console.log('Loaded posts:', postsData)
      setPosts(postsData)
    } catch (error) {
      console.error('Error loading creator posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReplyCreated = async () => {
    // Reload posts after a reply is created
    setTimeout(async () => {
      await loadPosts()
    }, 500)
  }

  // Helper function to organize posts and replies (same as forum-thread-view)
  const organizePostsAndReplies = () => {
    const standalonePosts = posts.filter(post => !post.title.startsWith('Re:'))
    const replies = posts.filter(post => post.title.startsWith('Re:'))

    console.log('📊 Post counts:', {
      totalItems: posts.length,
      standalonePosts: standalonePosts.length,
      replies: replies.length
    })

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9333EA]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Channel Header - Enhanced Banner */}
      <div
        className="relative h-32 flex items-center p-4 rounded-lg overflow-hidden"
        style={{
          backgroundImage: creatorCover ? `url(${creatorCover})` : `url(${categoryImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1a2f51'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Main Banner Content */}
        <div className="banner-main-content flex items-center gap-3 w-full relative z-10">
          <Avatar className="h-16 w-16 border-2 border-white/20">
            <AvatarImage
              src={creatorAvatar}
              alt={creatorContext.creatorName}
            />
            <AvatarFallback className="bg-[#4DA2FF] text-white text-xl">
              {creatorContext.creatorName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold text-lg truncate">
                {creatorData?.channel_name || creatorContext.channelName}
              </h3>
            </div>
            <p className="text-white/80 text-sm mb-2">
              {creatorContext.creatorName} • {creatorData?.subscribers_count || 0} subscribers
            </p>
            <p className="text-white/70 text-xs mb-2 line-clamp-1">
              {creatorData?.channel_description || creatorContext.channelDescription}
            </p>

            {/* Tags */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/60">{organizePostsAndReplies().length} posts</span>
              <span className="text-white/40">•</span>
              {creatorData?.channel_categories?.map((category: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-white/10 text-white/80 text-xs px-2 py-0.5">
                  {category}
                </Badge>
              )) || (
                <>
                  <Badge variant="secondary" className="bg-white/10 text-white/80 text-xs px-2 py-0.5">
                    DeFi
                  </Badge>
                  <Badge variant="secondary" className="bg-white/10 text-white/80 text-xs px-2 py-0.5">
                    SUI
                  </Badge>
                  <Badge variant="secondary" className="bg-white/10 text-white/80 text-xs px-2 py-0.5">
                    Education
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Create Post Button - Only visible to channel creator */}
          {onCreatePost && isCreator() && (
            <Button
              onClick={onCreatePost}
              className="bg-[#9333EA] hover:bg-[#9333EA]/80 text-white px-4 py-2 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Channel Post
            </Button>
          )}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {organizePostsAndReplies().length === 0 ? (
          <Card className="bg-[#030f1c] border-[#1a2f51]">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No posts yet</h3>
              <p className="text-gray-500">This creator hasn't posted anything in this channel yet.</p>
            </CardContent>
          </Card>
        ) : (
          organizePostsAndReplies().map((post) => {
            const isExpanded = expandedPosts.has(post.id)

            return (
              <div key={post.id}>
                {/* Main Post */}
                <Card className="bg-[#1a2f51] border-[#C0E6FF]/10">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {/* Post Content */}
                      <div className="flex-1 min-w-0">
                        {/* Post Header */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-white">
                            {post.title}
                          </span>
                          <span className="text-xs text-[#C0E6FF]/40">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </span>
                        </div>

                        {/* Post Content */}
                        <div className="text-[#C0E6FF] whitespace-pre-wrap mb-3 text-sm">
                          {post.content}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {/* Reply Button */}
                          <CreateReplyModal
                            topicId={post.topic_id || post.id}
                            topicName={post.title}
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

                          {/* View Count */}
                          <div className="flex items-center gap-1 text-xs text-[#C0E6FF]/40">
                            <Eye className="w-3 h-3" />
                            {post.view_count || 0}
                          </div>

                          {/* Reply Count & Expand Button */}
                          {post.replyCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePostExpansion(post.id)}
                              className="h-7 text-xs text-[#C0E6FF]/60 hover:text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3 ml-1" />
                              ) : (
                                <ChevronDown className="w-3 h-3 ml-1" />
                              )}
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
                              <Avatar className="w-7 h-7">
                                <AvatarImage
                                  src={getAvatarUrl(reply.author_avatar)}
                                  alt={reply.author_username || 'User'}
                                />
                                <AvatarFallback className="bg-[#4DA2FF] text-white text-xs">
                                  {reply.author_username?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            </div>

                            {/* Reply Content */}
                            <div className="flex-1 min-w-0">
                              {/* Reply Header */}
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-white">
                                  {reply.author_username || `User ${reply.author_address.slice(0, 6)}`}
                                </span>
                                <span className="text-xs text-[#C0E6FF]/40">
                                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                </span>
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
          })
        )}
      </div>
    </div>
  )
}
