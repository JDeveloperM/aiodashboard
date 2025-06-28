"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ForumTopicListSimple } from "@/components/forum/forum-topic-list-simple"
import { ForumThreadView } from "@/components/forum/forum-thread-view"
import { ForumUserActivity } from "@/components/forum/forum-user-activity"
import { ForumCategory, ForumTopic, forumService } from "@/lib/forum-service"
import { useSubscription } from "@/contexts/subscription-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import {
  MessageSquare,
  Users,
  TrendingUp,
  AlertTriangle,
  Crown,
  Star,
  Loader2,
  User
} from "lucide-react"

export default function ForumPage() {
  const { tier } = useSubscription()
  const { isSignedIn } = useSuiAuth()
  const [activeTab, setActiveTab] = useState("general")
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [allTopics, setAllTopics] = useState<ForumTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<{id: string, name: string, categoryName: string} | null>(null)

  useEffect(() => {
    loadForumData()
  }, [tier])

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

  const handleTopicClick = (topicId: string, topicName: string, categoryName: string) => {
    setSelectedTopic({ id: topicId, name: topicName, categoryName })
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
          return { icon: <MessageSquare className="w-5 h-5" />, color: '#4DA2FF', name: 'General Discussion', image: '/images/generalF.png' }
        case 'creators':
          return { icon: <Users className="w-5 h-5" />, color: '#9333EA', name: 'Creator Hub', image: '/images/creatorsF.png' }
        case 'affiliates':
          return { icon: <TrendingUp className="w-5 h-5" />, color: '#10B981', name: 'Affiliate Network', image: '/images/affiliatesF.png' }
        default:
          return { icon: <MessageSquare className="w-5 h-5" />, color: '#4DA2FF', name: categoryName, image: '/images/generalF.png' }
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



      {/* Forum Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#1a2f51] border border-[#C0E6FF]/20">
          <TabsTrigger 
            value="general" 
            className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
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
            className="text-[#C0E6FF] data-[state=active]:bg-[#10B981] data-[state=active]:text-white flex items-center gap-2"
          >
            <User className="w-4 h-4" />
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
              categoryIcon={<MessageSquare className="w-5 h-5" />}
              categoryColor="#4DA2FF"
              categoryImage="/images/generalF.png"
              onTopicClick={(topicId, topicName, categoryName) => handleTopicClick(topicId, topicName, "general")}
            />
          )}
        </TabsContent>

        {/* Creators Tab Content */}
        <TabsContent value="creators" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#9333EA]" />
            </div>
          ) : (
            <ForumTopicListSimple
              categoryId={getCategoryByName("creator")?.id || ""}
              categoryName="Creator Hub"
              categoryIcon={<Users className="w-5 h-5" />}
              categoryColor="#9333EA"
              categoryImage="/images/creatorsF.png"
              onTopicClick={(topicId, topicName, categoryName) => handleTopicClick(topicId, topicName, "creators")}
            />
          )}
        </TabsContent>

        {/* My Activity Tab Content */}
        <TabsContent value="activity" className="space-y-4">
          <ForumUserActivity
            onPostClick={(postId, topicId, topicName) => handleTopicClick(topicId, topicName, "activity")}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
