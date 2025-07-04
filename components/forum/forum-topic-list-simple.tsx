"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreateTopicModal } from "./create-topic-modal"
import { ForumTopic, forumService } from "@/lib/forum-service"
import { useSubscription } from "@/contexts/subscription-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { useCreatorsDatabase } from "@/contexts/creators-database-context"
import { useCurrentAccount } from "@mysten/dapp-kit"
import {
  MessageSquare,
  Plus,
  Clock,
  Loader2,
  Crown,
  Star,
  Users
} from "lucide-react"

interface ForumTopicListSimpleProps {
  categoryId: string
  categoryName: string
  categoryIcon: React.ReactNode
  categoryColor: string
  categoryImage?: string
  onTopicClick?: (topicId: string, topicName: string, categoryName: string, isCreatorPost?: boolean, actualTopicId?: string) => void
  creatorContext?: {
    creatorId: string
    channelId: string
    creatorName: string
    channelName: string
  } | null
}

export function ForumTopicListSimple({
  categoryId,
  categoryName,
  categoryIcon,
  categoryColor,
  categoryImage,
  onTopicClick,
  creatorContext
}: ForumTopicListSimpleProps) {
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [filteredTopics, setFilteredTopics] = useState<ForumTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { tier } = useSubscription()
  const { user } = useSuiAuth()
  const { creators } = useCreatorsDatabase()
  const currentAccount = useCurrentAccount()

  // Admin wallet address (from memories)
  const ADMIN_WALLET_ADDRESS = "0x311479200d45ef0243b92dbcf9849b8f6b931d27ae885197ea73066724f2bcf4"

  // Check if current user is admin
  const isAdmin = () => {
    if (!user?.address) return false
    const isAdminUser = user.address.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase()
    console.log('🔐 Admin check:', {
      userAddress: user.address,
      adminAddress: ADMIN_WALLET_ADDRESS,
      isAdmin: isAdminUser
    })
    return isAdminUser
  }

  // Get creator information when in creator context
  const currentCreator = creatorContext ? creators.find(creator => {
    // Extract the actual creator ID from compound ID format
    // Format: "creatorId_creator_timestamp_randomId_channel_channelNumber"
    const extractedCreatorId = creatorContext.creatorId.split('_creator_')[0]

    const addressMatch = creator.creatorAddress &&
      creator.creatorAddress.toLowerCase() === creatorContext.creatorId.toLowerCase()
    const idMatch = creator.id === creatorContext.creatorId
    const extractedIdMatch = creator.id === extractedCreatorId

    return addressMatch || idMatch || extractedIdMatch
  }) : null

  const currentChannel = currentCreator && creatorContext ? currentCreator.channels.find(channel => {
    // Extract channel number from compound channel ID
    // Format: "creatorId_creator_timestamp_randomId_channel_channelNumber"
    const channelMatch = creatorContext.channelId.split('_channel_')
    const extractedChannelNumber = channelMatch.length > 1 ? channelMatch[1] : creatorContext.channelId

    // Try multiple matching strategies
    const directMatch = channel.id === creatorContext.channelId
    const numberMatch = channel.id.endsWith(extractedChannelNumber)
    const indexMatch = currentCreator.channels.indexOf(channel).toString() === extractedChannelNumber

    console.log('🔍 Checking channel match:', {
      channelName: channel.name,
      channelId: channel.id,
      contextChannelId: creatorContext.channelId,
      extractedChannelNumber,
      directMatch,
      numberMatch,
      indexMatch
    })

    return directMatch || numberMatch || indexMatch
  }) : null

  // Check if current user is the creator of this channel
  const isCurrentUserCreator = currentCreator && (currentAccount?.address || user?.address) ?
    currentCreator.creatorAddress?.toLowerCase() === (currentAccount?.address || user?.address)?.toLowerCase() : false

  useEffect(() => {
    loadTopics()
  }, [categoryId, tier, creatorContext])

  // Filter topics based on creator context
  useEffect(() => {
    if (creatorContext) {
      // When in creator context, we already load only creator posts, so no additional filtering needed
      setFilteredTopics(topics)
    } else {
      setFilteredTopics(topics)
    }
  }, [topics, creatorContext])

  const loadTopics = async () => {
    setIsLoading(true)
    try {
      let result: ForumTopic[]
      if (creatorContext) {
        // For creator channels, we don't load topics here since CreatorChannelPosts handles posts
        // This component is only used for the header display in creator context
        result = []
      } else {
        // Load all topics for general forum
        result = await forumService.getTopics(categoryId, tier)
        console.log('📋 Loaded topics:', result.map(t => ({
          name: t.name,
          post_count: t.post_count,
          posts: t.posts,
          lastActivity: t.lastActivity,
          last_post_at: t.last_post_at
        })))
      }
      setTopics(result)
    } catch (error) {
      console.error('Failed to load topics:', error)
      setTopics([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No posts yet'
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
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
      {/* Creator Channel Header or Category Header */}
      <Card className="bg-[#030f1c] border-[#C0E6FF]/10 overflow-hidden">
        {creatorContext && currentCreator && currentChannel ? (
          // Creator-specific header
          <div
            className="relative bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: (() => {
                // Use channel-specific cover image if available
                const channelData = currentChannel as any
                const channelCover = channelData?.channelCover
                return channelCover ? `url(${channelCover})` : 'none'
              })(),
              backgroundColor: (() => {
                const channelData = currentChannel as any
                const channelCover = channelData?.channelCover
                return !channelCover ? currentCreator.bannerColor : 'transparent'
              })()
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/60"></div>

            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-white/20">
                  <AvatarImage
                    src={(() => {
                      // Use channel-specific avatar if available
                      const channelData = currentChannel as any
                      const channelAvatar = channelData?.channelAvatar
                      return channelAvatar
                    })()}
                    alt={currentCreator.name}
                  />
                  <AvatarFallback className="bg-[#4DA2FF] text-white text-lg">
                    {currentCreator.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-white flex items-center gap-2 text-xl">
                    {currentCreator.name}
                    <Badge className={`${getTierBadgeColor(currentCreator.tier)} text-white`}>
                      {getTierIcon(currentCreator.tier)}
                      <span className="ml-1">{currentCreator.tier}</span>
                    </Badge>
                    {currentCreator.verified && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        ✓ Verified
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-white/80 text-sm">
                    {currentChannel.name} • {currentChannel.subscribers} subscribers
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    {currentChannel.description}
                  </p>
                </div>
                {isCurrentUserCreator && (
                  <Button
                    onClick={() => window.location.href = '/creator-controls'}
                    className="bg-[#2196f3] hover:bg-[#2196f3]/80 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Channel Post
                  </Button>
                )}
              </div>
              <div className="mt-4 flex items-center gap-4 text-white/70 text-sm">
                <span>{filteredTopics.length} {filteredTopics.length === 1 ? 'post' : 'posts'}</span>
                <span>•</span>
                <span>{currentChannel.type.toUpperCase()} Channel</span>
                {currentChannel.type !== 'free' && (
                  <>
                    <span>•</span>
                    <span>{currentChannel.price} SUI</span>
                  </>
                )}
                <span>•</span>
                <span>{currentCreator.categories.join(', ')}</span>
              </div>
            </CardHeader>
          </div>
        ) : creatorContext ? (
          // Fallback for when creator context exists but data not found
          <div className="relative bg-[#2196f3]">
            <div className="absolute inset-0 bg-black/60"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                {creatorContext.channelName || 'Creator Channel'}
              </CardTitle>
              <p className="text-white/80 text-sm">
                by {creatorContext.creatorName} • Loading channel details...
              </p>
              <div className="mt-4 flex items-center gap-4 text-white/70 text-sm">
                <span>{filteredTopics.length} {filteredTopics.length === 1 ? 'post' : 'posts'}</span>
              </div>
            </CardHeader>
          </div>
        ) : (
          // Default category header
          <div
            className="relative bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: categoryImage ? `url(${categoryImage})` : 'none',
              backgroundColor: !categoryImage ? categoryColor : 'transparent'
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/60"></div>

            <CardHeader className="relative z-10">
              <CardTitle className="text-white flex items-center gap-2">
                <div className="text-white">
                  {categoryIcon}
                </div>
                {categoryName}
              </CardTitle>
              <div className="flex items-center justify-between">
                <p className="text-white/80">
                  {filteredTopics.length} {filteredTopics.length === 1 ? 'topic' : 'topics'} • Create new discussions and reply to existing ones
                </p>
                {/* New Topic Button - Only visible to admin */}
                {isAdmin() && (
                  <CreateTopicModal
                    categoryId={categoryId}
                    categoryName={categoryName}
                    onTopicCreated={loadTopics}
                  >
                    <Button className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      New Topic
                    </Button>
                  </CreateTopicModal>
                )}
              </div>
            </CardHeader>
          </div>
        )}
      </Card>

      {/* Topics List */}
      {filteredTopics.length > 0 ? (
        <div className="space-y-3">
          {filteredTopics.map((topic) => {
            const isCreatorTopic = topic.creatorId && topic.channelId
            const isCreatorPost = topic.contentType === 'creator_post'

            return (
              <Card
                key={topic.id}
                className="bg-[#1a2f51] border-[#C0E6FF]/10 hover:border-[#C0E6FF]/30 transition-colors cursor-pointer"
                onClick={() => onTopicClick?.(topic.id, topic.name, categoryName, topic.isCreatorPost, topic.topicId)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3 className="text-white font-semibold hover:text-[#4DA2FF] transition-colors mb-2">
                        {topic.name}
                      </h3>

                      {/* Description */}
                      {topic.description && (
                        <p className="text-[#C0E6FF]/70 text-sm mb-3 line-clamp-2">
                          {topic.description}
                        </p>
                      )}

                      {/* Posts and Last Activity */}
                      <div className="flex items-center gap-4 text-sm text-[#C0E6FF]/60">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{topic.post_count || topic.posts || 0} {(topic.post_count || topic.posts || 0) === 1 ? 'post' : 'posts'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(topic.lastActivity || topic.last_post_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="bg-[#1a2f51] border-[#C0E6FF]/20">
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-[#C0E6FF]/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {creatorContext ? `No Posts Yet` : 'No Topics Yet'}
            </h3>
            <p className="text-[#C0E6FF]/70 mb-4">
              {creatorContext
                ? isCurrentUserCreator
                  ? `This channel doesn't have any posts yet. Create your first post to get started!`
                  : `This channel doesn't have any posts yet. The creator will add content soon!`
                : `Be the first to start a discussion in ${categoryName}!`
              }
            </p>
            {creatorContext ? (
              isCurrentUserCreator && (
                <Button
                  onClick={() => window.location.href = '/creator-controls'}
                  className="bg-[#2196f3] hover:bg-[#2196f3]/80 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              )
            ) : (
              <CreateTopicModal
                categoryId={categoryId}
                categoryName={categoryName}
                onTopicCreated={loadTopics}
              >
                <Button className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Topic
                </Button>
              </CreateTopicModal>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
