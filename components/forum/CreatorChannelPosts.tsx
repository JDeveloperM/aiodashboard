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
  ChevronUp,
  Edit,
  Trash2,
  MoreVertical,
  Pin
} from "lucide-react"
import { ForumPost, forumService } from "@/lib/forum-service"
import { formatDistanceToNow } from "date-fns"
import { getCreatorProfile, getCreatorAvatarUrl, getCreatorCoverUrl } from "@/lib/creator-storage"
import { CreateReplyModal } from "./create-reply-modal"
import { CreateChannelPostModal } from "../create-channel-post-modal"
import { EditChannelPostModal } from "../edit-channel-post-modal"
import { DeleteChannelPostModal } from "../delete-channel-post-modal"
import { RichContentDisplay } from "@/components/ui/rich-content-display"
import { ReplyActionButtons } from "./reply-action-buttons"
import { useCreatorsDatabase } from "@/contexts/creators-database-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  onCreatePost?: () => void // Keep for backward compatibility but not used
}



export default function CreatorChannelPosts({ creatorContext, categoryImage, onCreatePost }: CreatorChannelPostsProps) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [creatorData, setCreatorData] = useState<any>(null)
  const [creatorAvatar, setCreatorAvatar] = useState<string>("")
  const [creatorCover, setCreatorCover] = useState<string>("")
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

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

  const loadPosts = async (forceRefresh = false) => {
    try {
      setIsLoading(true)
      console.log('🔄 Loading posts for creator:', creatorContext.creatorId, 'channel:', creatorContext.channelId, forceRefresh ? '(FORCE REFRESH)' : '')

      // Clear current posts if force refresh
      if (forceRefresh) {
        setPosts([])
      }

      const postsData = await forumService.getCreatorChannelPosts(
        creatorContext.creatorId,
        creatorContext.channelId
      )
      console.log('📋 Loaded posts:', postsData.length, 'posts')
      console.log('📋 Posts data:', postsData.map(p => ({
        id: p.id,
        title: p.title,
        updated_at: p.updated_at,
        is_deleted: p.is_deleted
      })))
      setPosts(postsData)

      // Track views for all posts when they're loaded (simulate viewing the channel)
      if (user?.address && postsData.length > 0) {
        console.log('👁️ Tracking views for loaded posts', {
          userAddress: user.address,
          postsCount: postsData.length,
          postsToTrack: postsData.filter(p => p.author_address !== user.address).length
        })

        // Track views for posts not authored by current user (optimized - run in background)
        const postsToTrack = postsData.filter(post => post.author_address !== user.address)

        if (postsToTrack.length > 0) {
          // Process view tracking in background to avoid blocking UI
          setTimeout(async () => {
            for (const post of postsToTrack) {
              try {
                const result = await forumService.incrementPostView(post.id, user.address)

                // Update local state with new view count
                if (result.success && result.newViewCount) {
                  setPosts(currentPosts =>
                    currentPosts.map(p =>
                      p.id === post.id
                        ? { ...p, view_count: result.newViewCount! }
                        : p
                    )
                  )
                }
              } catch (error) {
                console.error('❌ View tracking failed for post:', post.id, error)
              }
            }
          }, 100) // Small delay to let UI render first
        }
      } else {
        console.log('👁️ Not tracking views:', {
          hasUser: !!user?.address,
          postsCount: postsData.length
        })
      }

      // Force component re-render
      if (forceRefresh) {
        setRefreshKey(prev => prev + 1)
        console.log('🔄 Forced component refresh, key:', refreshKey + 1)
      }
    } catch (error) {
      console.error('❌ Error loading creator posts:', error)
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

  const handleCreatePost = () => {
    console.log('🎯 Opening create post modal for channel:', creatorContext.channelName)
    setShowCreateModal(true)
  }

  const handlePostCreated = () => {
    console.log('✅ Post created successfully, closing modal and refreshing posts')
    setShowCreateModal(false)
    loadPosts() // Refresh posts
  }

  const handleEditPost = (post: ForumPost) => {
    console.log('✏️ Opening edit modal for post:', post.title)
    setSelectedPost(post)
    setShowEditModal(true)
  }

  const handleDeletePost = (post: ForumPost) => {
    console.log('🗑️ Opening delete modal for post:', post.title)
    setSelectedPost(post)
    setShowDeleteModal(true)
  }

  const handlePostUpdated = () => {
    console.log('✅ Post updated successfully, closing modal and refreshing posts')
    setShowEditModal(false)
    setSelectedPost(null)

    // Immediately refresh from database
    console.log('🔄 Immediate refresh after update...')
    loadPosts(true)

    // Also add a delayed refresh as backup
    setTimeout(() => {
      console.log('🔄 Delayed refresh after update...')
      loadPosts(true)
    }, 1000)
  }

  const handlePostDeleted = () => {
    console.log('✅ Post deleted successfully, closing modal and refreshing posts')
    const deletedPostId = selectedPost?.id

    setShowDeleteModal(false)
    setSelectedPost(null)

    // Immediately remove the post from the UI
    if (deletedPostId) {
      console.log('🗑️ Removing post from UI immediately:', deletedPostId)
      setPosts(currentPosts => {
        const filteredPosts = currentPosts.filter(p => p.id !== deletedPostId)
        console.log('📋 Posts after immediate removal:', filteredPosts.length, 'posts')
        return filteredPosts
      })
      setRefreshKey(prev => prev + 1)
    }

    // Also refresh from database as backup
    setTimeout(() => {
      console.log('🔄 Database refresh after delete...')
      loadPosts(true)
    }, 500)
  }

  // Check if current user owns a specific post
  const isPostOwner = (post: ForumPost) => {
    if (!user?.address) return false
    return post.author_address === user.address
  }

  // Helper function to organize posts and replies with nested creator answers
  const organizePostsAndReplies = () => {
    // Filter out creator answers from standalone posts - they should be treated as replies
    const standalonePosts = posts.filter(post =>
      !post.title.startsWith('Re:') &&
      !post.title.startsWith('Answer to ')
    )

    // Include both regular replies (Re:) and creator answers (Answer to)
    const allReplies = posts.filter(post =>
      post.title.startsWith('Re:') ||
      post.title.startsWith('Answer to ')
    )

    // Separate user replies from creator answers
    const userReplies = allReplies.filter(reply =>
      reply.author_address.toLowerCase() !== creatorContext.creatorId.toLowerCase()
    )

    const creatorAnswers = allReplies.filter(reply =>
      reply.author_address.toLowerCase() === creatorContext.creatorId.toLowerCase()
    )

    console.log('📊 Post counts:', {
      totalItems: posts.length,
      standalonePosts: standalonePosts.length,
      userReplies: userReplies.length,
      creatorAnswers: creatorAnswers.length
    })

    // Group replies by their parent post (based on title matching)
    const postsWithReplies = standalonePosts.map(post => {
      const postReplies = userReplies.filter(reply =>
        reply.title === `Re: ${post.title}` ||
        reply.title.includes(post.title)
      ).map(reply => {
        // Find creator answers for this specific reply using the precise title format
        const replyAnswers = creatorAnswers.filter(answer => {
          const matchesNewFormat = answer.title.startsWith(`Answer to ${reply.id}:`)

          console.log('🔍 Answer matching (Creator):', {
            replyId: reply.id,
            replyTitle: reply.title,
            answerTitle: answer.title,
            matchesNewFormat,
            finalMatch: matchesNewFormat
          })

          // Only use the new format for now to prevent cross-contamination
          // Old answers without proper ID matching will not be shown until they're re-answered
          return matchesNewFormat
        })

        return {
          ...reply,
          creatorAnswers: replyAnswers
        }
      })

      return {
        ...post,
        replies: postReplies,
        replyCount: postReplies.length
      }
    })

    return postsWithReplies
  }



  const togglePostExpansion = async (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)

        // Track view when post is expanded (user is engaging with content)
        if (user?.address) {
          const post = posts.find(p => p.id === postId)
          if (post && post.author_address !== user.address) {
            console.log('👁️ Tracking view for expanded post:', postId)
            forumService.incrementPostView(postId, user.address).then(result => {
              if (result.success && result.newViewCount) {
                setPosts(currentPosts =>
                  currentPosts.map(p =>
                    p.id === postId
                      ? { ...p, view_count: result.newViewCount! }
                      : p
                  )
                )
                console.log('✅ Updated local view count for expanded post:', postId, 'to:', result.newViewCount)
              }
            })
          }
        }
      }
      return newSet
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2196f3]"></div>
      </div>
    )
  }

  return (
    <div key={refreshKey} className="space-y-6">
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
          {isCreator() && (
            <Button
              onClick={handleCreatePost}
              className="bg-[#007acc] hover:bg-[#007acc]/80 text-white px-4 py-2 text-sm"
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
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {/* Pin Icon for Pinned Posts */}
                            {post.is_pinned && (
                              <Pin className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                            )}
                            <span className="text-lg font-bold text-white">
                              {post.title}
                            </span>
                            <span className="text-xs text-[#C0E6FF]/40">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                          </div>

                          {/* Edit/Delete Buttons - Only show for post owner */}
                          {isPostOwner(post) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-[#C0E6FF]/60 hover:text-white hover:bg-[#C0E6FF]/10"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white"
                              >
                                <DropdownMenuItem
                                  onClick={() => handleEditPost(post)}
                                  className="hover:bg-[#C0E6FF]/10 cursor-pointer"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Post
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeletePost(post)}
                                  className="hover:bg-red-500/10 text-red-400 hover:text-red-300 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Post
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        {/* Post Content */}
                        <div className="mb-3 text-sm">
                          <RichContentDisplay
                            content={post.content}
                            contentType={(post as any).content_type || 'text'}
                            className="text-[#C0E6FF]"
                          />
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
                    {post.replies.map((reply) => {
                      // Check if this is a creator answer
                      const isCreatorAnswer = reply.author_address && creatorContext.creatorId &&
                        reply.author_address.toLowerCase() === creatorContext.creatorId.toLowerCase()

                      return (
                        <Card
                          key={reply.id}
                          className={`border-[#C0E6FF]/5 ${
                            isCreatorAnswer
                              ? 'bg-green-500/10 border-green-500/20' // Transparent green for creator answers
                              : 'bg-[#0f1a2e]' // Default background for user replies
                          }`}
                        >
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

                                {/* Creator Action Buttons */}
                                <ReplyActionButtons
                                  replyId={reply.id}
                                  replyAuthor={reply.author_username || `User ${reply.author_address.slice(0, 6)}`}
                                  replyContent={reply.content}
                                  currentUserAddress={user?.address || ''}
                                  topicCreatorId={creatorContext.creatorId}
                                  replyAuthorAddress={reply.author_address}
                                  onReplyDeleted={handleReplyCreated}
                                  onAnswerCreated={handleReplyCreated}
                                />
                              </div>

                              {/* Reply Content */}
                              <div className="text-[#C0E6FF] whitespace-pre-wrap text-sm">
                                {reply.content}
                              </div>

                              {/* Creator Answers to this Reply */}
                              {reply.creatorAnswers && reply.creatorAnswers.length > 0 && (
                                <div className="mt-3 ml-4 space-y-2">
                                  {reply.creatorAnswers.map((answer) => (
                                    <Card
                                      key={answer.id}
                                      className="bg-green-500/10 border-green-500/20"
                                    >
                                      <CardContent className="p-3">
                                        <div className="flex items-start gap-3">
                                          {/* Answer Avatar */}
                                          <div className="flex-shrink-0">
                                            <Avatar className="w-6 h-6">
                                              <AvatarImage
                                                src={getAvatarUrl(answer.author_avatar)}
                                                alt={answer.author_username || 'Creator'}
                                              />
                                              <AvatarFallback className="bg-green-600 text-white text-xs">
                                                {answer.author_username?.charAt(0).toUpperCase() || 'C'}
                                              </AvatarFallback>
                                            </Avatar>
                                          </div>

                                          {/* Answer Content */}
                                          <div className="flex-1 min-w-0">
                                            {/* Answer Header */}
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-sm font-medium text-white">
                                                {answer.author_username || `Creator ${answer.author_address.slice(0, 6)}`}
                                              </span>
                                              <Badge className="bg-green-600 text-white text-xs px-1 py-0 h-4">
                                                Creator
                                              </Badge>
                                              <span className="text-xs text-[#C0E6FF]/40">
                                                {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                                              </span>
                                            </div>

                                            {/* Answer Content */}
                                            <div className="text-[#C0E6FF] whitespace-pre-wrap text-sm">
                                              {answer.content}
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Create Post Modal */}
      <CreateChannelPostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        channel={{
          id: creatorContext.channelId,
          name: creatorContext.channelName,
          creatorName: creatorContext.creatorName,
          creatorAvatar: creatorAvatar,
          type: 'free' // Default type since we don't have this info in forum context
        }}
        onPostCreated={handlePostCreated}
      />

      {/* Edit Post Modal */}
      <EditChannelPostModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedPost(null)
        }}
        post={selectedPost}
        onPostUpdated={handlePostUpdated}
      />

      {/* Delete Post Modal */}
      <DeleteChannelPostModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedPost(null)
        }}
        post={selectedPost}
        onPostDeleted={handlePostDeleted}
      />
    </div>
  )
}
