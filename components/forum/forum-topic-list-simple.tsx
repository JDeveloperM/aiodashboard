"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
  Crown,
  Star,
  Loader2,
  Pin,
  User,
  Users,
  Reply
} from "lucide-react"

interface ForumTopicListSimpleProps {
  categoryId: string
  categoryName: string
  categoryIcon: React.ReactNode
  categoryColor: string
  categoryImage?: string
  onTopicClick?: (topicId: string, topicName: string, categoryName: string) => void
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
        // Load only creator-specific channel posts
        result = await forumService.getCreatorChannelPosts(creatorContext.creatorId, creatorContext.channelId)
      } else {
        // Load all topics for general forum
        result = await forumService.getTopics(categoryId, tier)
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
                    className="bg-[#9333EA] hover:bg-[#9333EA]/80 text-white"
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
          <div className="relative bg-[#9333EA]">
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
                className={`border-[#C0E6FF]/10 hover:border-[#C0E6FF]/30 transition-colors cursor-pointer ${
                  isCreatorTopic
                    ? "bg-gradient-to-r from-[#9333EA]/10 to-[#1a2f51] border-l-4 border-l-[#9333EA]"
                    : "bg-[#1a2f51]"
                }`}
                onClick={() => onTopicClick?.(topic.id, topic.name, categoryName)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isCreatorTopic && (
                          <Crown className="w-4 h-4 text-[#9333EA]" />
                        )}
                        <h3 className="text-white font-semibold hover:text-[#4DA2FF] transition-colors">
                          {topic.name}
                        </h3>
                        {isCreatorPost && (
                          <Badge className="bg-[#9333EA]/20 text-[#9333EA] border-[#9333EA]/30 text-xs">
                            Creator Channel
                          </Badge>
                        )}
                      </div>
                      {topic.description && (
                        <p className="text-[#C0E6FF]/70 text-sm mb-2 line-clamp-2">
                          {topic.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-[#C0E6FF]/50">
                        <div className="flex items-center gap-1">
                          {isCreatorTopic ? (
                            <>
                              <User className="w-3 h-3" />
                              <span>{topic.posts} {topic.posts === 1 ? 'post' : 'posts'}</span>
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-3 h-3" />
                              <span>{topic.posts} {topic.posts === 1 ? 'reply' : 'replies'}</span>
                            </>
                          )}
                        </div>
                        {isCreatorTopic && (
                          <div className="flex items-center gap-1">
                            <Reply className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">Replies allowed</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Last activity {formatDate(topic.lastActivity)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Topic Stats */}
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-lg font-bold text-white">
                        {topic.posts}
                      </div>
                      <div className="text-xs text-[#C0E6FF]/50">
                        {isCreatorTopic ? 'Posts' : 'Replies'}
                      </div>
                      {isCreatorTopic && (
                        <div className="text-xs text-[#9333EA] mt-1">
                          Creator Channel
                        </div>
                      )}
                      {topic.viewCount && (
                        <div className="text-xs text-[#C0E6FF]/50 mt-1">
                          {topic.viewCount} views
                        </div>
                      )}
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
                  className="bg-[#9333EA] hover:bg-[#9333EA]/80 text-white"
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
