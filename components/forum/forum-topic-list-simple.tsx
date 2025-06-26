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
import { 
  MessageSquare, 
  Plus,
  Clock,
  Crown,
  Star,
  Loader2
} from "lucide-react"

interface ForumTopicListSimpleProps {
  categoryId: string
  categoryName: string
  categoryIcon: React.ReactNode
  categoryColor: string
  categoryImage?: string
  onTopicClick?: (topicId: string, topicName: string, categoryName: string) => void
}

export function ForumTopicListSimple({
  categoryId,
  categoryName,
  categoryIcon,
  categoryColor,
  categoryImage,
  onTopicClick
}: ForumTopicListSimpleProps) {
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
      const result = await forumService.getTopics(categoryId, tier)
      setTopics(result)
    } catch (error) {
      console.error('Failed to load topics:', error)
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
      {/* Category Header */}
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

          <CardHeader className="relative z-10">
            <CardTitle className="text-white flex items-center gap-2">
              <div className="text-white">
                {categoryIcon}
              </div>
              {categoryName}
            </CardTitle>
            <div className="flex items-center justify-between">
              <p className="text-white/80">
                {topics.length} {topics.length === 1 ? 'topic' : 'topics'} • Create new discussions and reply to existing ones
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
      </Card>

      {/* Topics List */}
      {topics.length > 0 ? (
        <div className="space-y-3">
          {topics.map((topic) => (
            <Card 
              key={topic.id} 
              className="bg-[#1a2f51] border-[#C0E6FF]/10 hover:border-[#C0E6FF]/30 transition-colors cursor-pointer"
              onClick={() => onTopicClick?.(topic.id, topic.name, categoryName)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold hover:text-[#4DA2FF] transition-colors mb-1">
                      {topic.name}
                    </h3>
                    {topic.description && (
                      <p className="text-[#C0E6FF]/70 text-sm mb-2 line-clamp-2">
                        {topic.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-[#C0E6FF]/50">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{topic.post_count} {topic.post_count === 1 ? 'reply' : 'replies'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Last activity {formatDate(topic.last_post_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Topic Stats */}
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-lg font-bold text-white">
                      {topic.post_count}
                    </div>
                    <div className="text-xs text-[#C0E6FF]/50">
                      Replies
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-[#1a2f51] border-[#C0E6FF]/20">
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-[#C0E6FF]/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Topics Yet</h3>
            <p className="text-[#C0E6FF]/70 mb-4">
              Be the first to start a discussion in {categoryName}!
            </p>
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
