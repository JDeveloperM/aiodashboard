"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ForumTopic, forumService } from "@/lib/forum-service"
import { useSubscription } from "@/contexts/subscription-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Crown, 
  Star,
  Clock,
  Loader2
} from "lucide-react"

interface ForumTopicListProps {
  categoryId: string
  categoryName: string
  categoryIcon: React.ReactNode
  categoryColor: string
  onCategoryClick?: (categoryId: string, categoryName: string) => void
}

export function ForumTopicList({
  categoryId,
  categoryName,
  categoryIcon,
  categoryColor,
  onCategoryClick
}: ForumTopicListProps) {
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { tier } = useSubscription()
  const { user } = useSuiAuth()

  useEffect(() => {
    loadTopics()
  }, [categoryId, tier])

  const loadTopics = async () => {
    setIsLoading(true)
    try {
      // Load topics for this category
      const topicsData = await forumService.getTopics(categoryId, tier)
      setTopics(topicsData)
    } catch (error) {
      console.error('Failed to load forum data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTierIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'ROYAL': return <Crown className="w-3 h-3 text-yellow-400" />
      case 'PRO': return <Star className="w-3 h-3 text-purple-400" />
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
      {/* Category Header */}
      <Card
        className="bg-[#030f1c] border-[#C0E6FF]/20 hover:border-[#C0E6FF]/30 transition-colors cursor-pointer"
        onClick={() => onCategoryClick?.(categoryId, categoryName)}
      >
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 hover:text-[#4DA2FF] transition-colors">
            <div style={{ color: categoryColor }}>
              {categoryIcon}
            </div>
            {categoryName}
          </CardTitle>
          <p className="text-[#C0E6FF]/70 text-sm">
            Click to view topics and create discussions
          </p>
        </CardHeader>
      </Card>




    </div>
  )
}
