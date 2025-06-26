"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ForumPostCard } from "./forum-post-card"
import { CreateTopicModal } from "./create-topic-modal"
import { ForumPost, forumService } from "@/lib/forum-service"
import { useForumRealtime } from "@/hooks/use-forum-realtime"
import { useSubscription } from "@/contexts/subscription-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import {
  ArrowLeft,
  MessageSquare,
  Loader2,
  Plus,
  Clock
} from "lucide-react"

interface ForumTopicDetailProps {
  categoryId: string
  categoryName: string
  categoryIcon: React.ReactNode
  categoryColor: string
  onBack: () => void
  onTopicClick?: (topicId: string, topicName: string) => void
}

export function ForumTopicDetail({
  categoryId,
  categoryName,
  categoryIcon,
  categoryColor,
  onBack,
  onTopicClick
}: ForumTopicDetailProps) {
  const [topics, setTopics] = useState<any[]>([])
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

      {/* Category Header */}
      <Card className="bg-[#030f1c] border-[#C0E6FF]/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <div style={{ color: categoryColor }}>
              {categoryIcon}
            </div>
            {categoryName}
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-[#C0E6FF]/70">
              {topics.length} {topics.length === 1 ? 'topic' : 'topics'} in this category
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
      </Card>

      {/* Topics List */}
      {topics.length > 0 ? (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className="bg-[#1a2f51] border-[#C0E6FF]/10 hover:border-[#C0E6FF]/30 transition-colors cursor-pointer"
              onClick={() => onTopicClick?.(topic.id, topic.name)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold hover:text-[#4DA2FF] transition-colors mb-2">
                      {topic.name}
                    </h3>
                    {topic.description && (
                      <p className="text-[#C0E6FF]/70 text-sm mb-2">
                        {topic.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-[#C0E6FF]/50">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{topic.post_count} posts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Last post {formatDate(topic.last_post_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Topic Stats */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {topic.post_count}
                    </div>
                    <div className="text-xs text-[#C0E6FF]/50">
                      Posts
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
              Be the first to create a topic in this category!
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
