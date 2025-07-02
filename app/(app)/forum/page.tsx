"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ForumTopicListSimple } from "@/components/forum/forum-topic-list-simple"
import { ForumThreadView } from "@/components/forum/forum-thread-view"
import { MyChannelsList } from "@/components/forum/my-channels-list"
import { MyCreatedChannelsList } from "@/components/forum/my-created-channels-list"
import { ForumUserActivity } from "@/components/forum/forum-user-activity"
import CreatorChannelPosts from "@/components/forum/CreatorChannelPosts"
import { ForumCategory, ForumTopic, forumService } from "@/lib/forum-service"
import { useSubscription } from "@/contexts/subscription-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import {
  MessageSquare,
  MessageCircle,
  Users,
  TrendingUp,
  AlertTriangle,
  Crown,
  Star,
  Loader2,
  User,
  ArrowLeft,
  ExternalLink,
  ChevronRight
} from "lucide-react"

export default function ForumPage() {
  const { tier } = useSubscription()
  const { isSignedIn } = useSuiAuth()
  const searchParams = useSearchParams()

  // Get URL parameters for creator context
  const urlTab = searchParams.get('tab')
  const creatorId = searchParams.get('creator')
  const channelId = searchParams.get('channel')
  const creatorName = searchParams.get('creatorName')
  const channelName = searchParams.get('channelName')
  const channelAvatar = searchParams.get('channelAvatar')
  const channelCover = searchParams.get('channelCover')

  const [activeTab, setActiveTab] = useState(urlTab || "general")
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [allTopics, setAllTopics] = useState<ForumTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<{id: string, name: string, categoryName: string} | null>(null)

  // Creator context state
  const [creatorContext, setCreatorContext] = useState<{
    creatorId: string
    channelId: string
    creatorName: string
    channelName: string
    channelDescription: string
    channelBanner?: string
    channelAvatar?: string
    channelCover?: string
  } | null>(null)

  useEffect(() => {
    loadForumData()
  }, [tier])

  // Handle URL parameters for creator context
  useEffect(() => {
    if (creatorId && channelId && creatorName && channelName) {
      const context = {
        creatorId,
        channelId,
        creatorName,
        channelName,
        channelDescription: `Channel content from ${creatorName}`,
        channelAvatar: channelAvatar || undefined,
        channelCover: channelCover || undefined
      }

      setCreatorContext(context)

      // Set active tab to creators if coming from AIO Creators
      if (urlTab === 'creators') {
        setActiveTab('creators')
      }
    }
  }, [creatorId, channelId, creatorName, channelName, channelAvatar, channelCover, urlTab])

  const loadForumData = async () => {
    setIsLoading(true)
    try {
      // Load categories accessible to user
      const categoriesData = await forumService.getCategories(tier)
      setCategories(categoriesData)

      // Load all topics for create post modal
      const topicsPromises = categoriesData.map(category =>
        forumService.getTopics(category.id, tier)
      )
      const topicsArrays = await Promise.all(topicsPromises)
      const flatTopics = topicsArrays.flat()
      setAllTopics(flatTopics)
    } catch (error) {
      console.error('Failed to load forum data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryByName = (name: string) => {
    return categories.find(cat => cat.name.toLowerCase().includes(name.toLowerCase()))
  }

  const getTopicsForCategory = (categoryName: string) => {
    const category = getCategoryByName(categoryName)
    return category ? allTopics.filter(topic => topic.category_id === category.id) : []
  }

  const handleTopicClick = (topicId: string, topicName: string, categoryName: string, isCreatorPost?: boolean, actualTopicId?: string) => {
    // For creator posts, use the actual topic ID for replies
    const targetTopicId = isCreatorPost && actualTopicId ? actualTopicId : topicId
    setSelectedTopic({ id: targetTopicId, name: topicName, categoryName })
  }

  const handleMyChannelClick = (creatorAddress: string, channelId: string, channelName: string, channelAvatar?: string, channelCover?: string) => {
    // Set creator context and navigate to that creator's content
    setCreatorContext({
      creatorId: creatorAddress,
      channelId: channelId,
      creatorName: channelName, // We'll use channel name as creator name for now
      channelName: channelName,
      channelDescription: `Channel content from ${channelName}`,
      channelAvatar: channelAvatar,
      channelCover: channelCover
    })

    // Update URL to reflect the creator context
    const newUrl = `/forum?tab=creators&creator=${encodeURIComponent(creatorAddress)}&channel=${encodeURIComponent(channelId)}&creatorName=${encodeURIComponent(channelName)}&channelName=${encodeURIComponent(channelName)}`
    window.history.pushState({}, '', newUrl)
  }

  const handleBackToTopics = () => {
    setSelectedTopic(null)
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

  const canAccessTab = (tabName: string) => {
    if (tabName === "general") return true
    if (tabName === "creators") {
      return tier === "PRO" || tier === "ROYAL"
    }
    if (tabName === "activity") {
      return isSignedIn // Only signed-in users can see their activity
    }
    return false
  }

  // If a topic is selected, show the thread view
  if (selectedTopic) {
    const getCategoryInfo = (categoryName: string) => {
      switch (categoryName.toLowerCase()) {
        case 'general':
          return { icon: <MessageCircle className="w-5 h-5" />, color: '#4DA2FF', name: 'General Discussion', image: '/images/generalF.png' }
        case 'creators':
          return { icon: <Users className="w-5 h-5" />, color: '#9333EA', name: 'Creator Hub', image: '/images/creatorsF.png' }
        case 'affiliates':
          return { icon: <TrendingUp className="w-5 h-5" />, color: '#10B981', name: 'Affiliate Network', image: '/images/affiliatesF.png' }
        default:
          return { icon: <MessageCircle className="w-5 h-5" />, color: '#4DA2FF', name: categoryName, image: '/images/generalF.png' }
      }
    }

    const categoryInfo = getCategoryInfo(selectedTopic.categoryName)

    return (
      <div className="space-y-6 p-6">
        <ForumThreadView
          topicId={selectedTopic.id}
          topicName={selectedTopic.name}
          categoryName={categoryInfo.name}
          categoryIcon={categoryInfo.icon}
          categoryColor={categoryInfo.color}
          categoryImage={categoryInfo.image}
          onBack={handleBackToTopics}
        />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto bg-[#1a2f51] border-[#C0E6FF]/30">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
            <p className="text-[#C0E6FF]">Please sign in to access the AIONET Forum.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">AIONET Forum</h1>
          <p className="text-gray-400 mt-1">Connect, discuss, and share with the AIONET community</p>
        </div>
      </div>

      {/* Breadcrumb Navigation for Creator Context */}
      {creatorContext && (
        <div className="flex items-center gap-2 text-sm bg-[#1a2f51] p-3 rounded-lg border border-[#C0E6FF]/20">
          <button
            onClick={() => window.location.href = '/aio-creators'}
            className="flex items-center gap-1 text-[#4DA2FF] hover:text-[#4DA2FF]/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            AIO Creators
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{creatorContext.creatorName}</span>
          {creatorContext.channelName !== creatorContext.creatorName &&
           creatorContext.channelName !== 'Default Channel' &&
           creatorContext.channelName !== 'Unnamed Channel' && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{creatorContext.channelName}</span>
            </>
          )}
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-white font-medium">Content</span>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => {
                setCreatorContext(null)
                setActiveTab('creators')
                window.history.replaceState({}, '', '/forum?tab=creators')
              }}
              className="text-[#9333EA] hover:text-[#9333EA]/80 text-sm flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              View My Channels
            </button>
            <button
              onClick={() => {
                setCreatorContext(null)
                window.history.replaceState({}, '', '/forum?tab=creators')
              }}
              className="text-[#4DA2FF] hover:text-[#4DA2FF]/80 text-sm flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              View All Creators
            </button>
          </div>
        </div>
      )}



      {/* Forum Tabs - Hide when viewing creator content */}
      {!creatorContext && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#1a2f51] border border-[#C0E6FF]/20">
            <TabsTrigger
              value="general"
              className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="creators"
              className={`text-[#C0E6FF] data-[state=active]:bg-[#9333EA] data-[state=active]:text-white flex items-center gap-2 ${
                !canAccessTab("creators") ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!canAccessTab("creators")}
            >
              <Users className="w-4 h-4" />
              Creators
              {!canAccessTab("creators") && <Crown className="w-3 h-3 text-yellow-400" />}
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="text-[#C0E6FF] data-[state=active]:bg-[#045cbd] data-[state=active]:text-white flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              My Activity
            </TabsTrigger>
          </TabsList>

          {/* General Tab Content */}
          <TabsContent value="general" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#4DA2FF]" />
              </div>
            ) : (
              <ForumTopicListSimple
                categoryId={getCategoryByName("general")?.id || ""}
                categoryName="General Discussion"
                categoryIcon={<MessageCircle className="w-5 h-5" />}
                categoryColor="#4DA2FF"
                categoryImage="/images/generalF.png"
                onTopicClick={(topicId, topicName, categoryName) => handleTopicClick(topicId, topicName, "general")}
              />
            )}
          </TabsContent>

          {/* Creators Tab Content */}
          <TabsContent value="creators" className="space-y-4">
            {/* Creator Hub Banner - Show when no specific creator context */}
            {!creatorContext && (
              <Card className="bg-[#030f1c] border-[#C0E6FF]/20">
                <div
                  className="relative bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(/images/creatorsF.png)`,
                    backgroundColor: '#9333EA'
                  }}
                >
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/60"></div>

                  <CardHeader className="relative z-10">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Creator Hub
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <p className="text-white/80">
                        View and manage your channels and view channels joined
                      </p>
                    </div>
                  </CardHeader>
                </div>
              </Card>
            )}

            {/* My Channels Section - Show channels user has created */}
            {!creatorContext && (
              <Card className="bg-[#1a2f51] border-[#C0E6FF]/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    My Channels
                  </CardTitle>
                  <p className="text-[#C0E6FF]/70 text-sm">
                    Channels you've created and manage
                  </p>
                </CardHeader>
                <CardContent>
                  <MyCreatedChannelsList onChannelClick={handleMyChannelClick} />
                </CardContent>
              </Card>
            )}

            {/* Channels Joined Section - Show when no specific creator context */}
            {!creatorContext && (
              <Card className="bg-[#1a2f51] border-[#C0E6FF]/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Channels Joined
                  </CardTitle>
                  <p className="text-[#C0E6FF]/70 text-sm">
                    Channels you've joined and have access to
                  </p>
                </CardHeader>
                <CardContent>
                  <MyChannelsList onChannelClick={handleMyChannelClick} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Activity Tab Content */}
          <TabsContent value="activity" className="space-y-4">
            <ForumUserActivity
              onPostClick={(postId, topicId, topicName) => handleTopicClick(topicId, topicName, "activity")}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Creator Content - Show when viewing specific creator (no tabs) */}
      {creatorContext && (
        <div className="space-y-4">
          {/* Creator Channel Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#9333EA]" />
            </div>
          ) : (
            <CreatorChannelPosts
              creatorContext={creatorContext}
              categoryImage="/images/creatorsF.png"
            />
          )}
        </div>
      )}
    </div>
  )
}
