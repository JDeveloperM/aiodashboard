"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ForumPost, ForumReply, forumService } from "@/lib/forum-service"
import { useSubscription } from "@/contexts/subscription-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { 
  MessageSquare, 
  Reply,
  Clock,
  Crown,
  Star,
  Loader2,
  FileText,
  MessageCircle
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ForumUserActivityProps {
  onPostClick?: (postId: string, topicId: string, topicName: string) => void
}

interface ActivityItem {
  id: string
  type: 'post' | 'reply'
  title: string
  content: string
  topicName: string
  topicId?: string
  postId?: string
  createdAt: string
  replyCount?: number
}

export function ForumUserActivity({ onPostClick }: ForumUserActivityProps) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [replies, setReplies] = useState<ForumPost[]>([]) // Replies are also ForumPost objects
  const [allActivity, setAllActivity] = useState<ActivityItem[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [isLoadingReplies, setIsLoadingReplies] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const { tier } = useSubscription()
  const { user } = useSuiAuth()

  useEffect(() => {
    if (user?.address) {
      loadUserPosts()
      loadUserReplies()
    }
  }, [user?.address, tier])

  useEffect(() => {
    // Combine posts and replies into a unified activity feed
    const combinedActivity: ActivityItem[] = [
      ...posts.map(post => ({
        id: post.id,
        type: 'post' as const,
        title: post.title,
        content: post.content,
        topicName: post.topic_name || 'Unknown Topic',
        topicId: post.topic_id,
        createdAt: post.created_at,
        replyCount: post.reply_count
      })),
      ...replies.map(reply => ({
        id: reply.id,
        type: 'reply' as const,
        title: cleanReplyTitle(reply.title), // Remove "Re:" prefix for display
        content: reply.content,
        topicName: reply.topic_name || 'Unknown Topic',
        topicId: reply.topic_id,
        postId: reply.id, // For replies, the post ID is the reply itself
        createdAt: reply.created_at
      }))
    ]

    // Sort by creation date (newest first)
    combinedActivity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setAllActivity(combinedActivity)
  }, [posts, replies])

  const loadUserPosts = async () => {
    if (!user?.address) return
    
    setIsLoadingPosts(true)
    try {
      const result = await forumService.getUserPosts(user.address, tier, 1, 50)
      setPosts(result.posts)
    } catch (error) {
      console.error('Failed to load user posts:', error)
    } finally {
      setIsLoadingPosts(false)
    }
  }

  const loadUserReplies = async () => {
    if (!user?.address) return
    
    setIsLoadingReplies(true)
    try {
      const result = await forumService.getUserReplies(user.address, tier, 1, 50)
      setReplies(result.replies)
    } catch (error) {
      console.error('Failed to load user replies:', error)
    } finally {
      setIsLoadingReplies(false)
    }
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'ROYAL': return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 'PRO': return 'bg-gradient-to-r from-purple-500 to-purple-700'
      case 'NOMAD': return 'bg-gradient-to-r from-blue-500 to-blue-700'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-700'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'ROYAL': return <Crown className="w-3 h-3" />
      case 'PRO': return <Star className="w-3 h-3" />
      default: return null
    }
  }

  // Helper function to clean up reply titles by removing "Re:" prefixes
  const cleanReplyTitle = (title: string): string => {
    // Remove multiple "Re:" prefixes (handles "Re: Re: Re:" etc.)
    return title.replace(/^(Re:\s*)+/gi, '').trim()
  }

  const handlePostClick = (post: ForumPost) => {
    if (onPostClick && post.topic_id) {
      onPostClick(post.id, post.topic_id, post.topic_name || 'Unknown Topic')
    }
  }

  const handleReplyClick = (reply: ForumPost) => {
    // For replies, we navigate to the reply itself (which is a post with "Re:" prefix)
    if (onPostClick && reply.topic_id) {
      onPostClick(reply.id, reply.topic_id, reply.topic_name || 'Unknown Topic')
    }
  }

  if (!user?.address) {
    return (
      <Card className="bg-[#1a2f51] border-[#C0E6FF]/20">
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-[#C0E6FF]/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Sign In Required</h3>
          <p className="text-[#C0E6FF]/70">
            Please sign in to view your forum activity.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Banner */}
      <Card className="bg-[#1a2f51] border-[#C0E6FF]/20 overflow-hidden">
        <div
          className="h-32 bg-cover bg-center relative"
          style={{ backgroundImage: "url('/images/affiliatesF.png')" }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute bottom-4 left-6 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">My Forum Activity</h2>
              <p className="text-white/80">Track your posts and replies across all topics</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Activity Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#1a2f51] border border-[#C0E6FF]/20">
          <TabsTrigger
            value="all"
            className="text-[#C0E6FF] data-[state=active]:bg-[#10B981] data-[state=active]:text-white flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            All Activity ({allActivity.length})
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Posts ({posts.length})
          </TabsTrigger>
          <TabsTrigger
            value="replies"
            className="text-[#C0E6FF] data-[state=active]:bg-[#9333EA] data-[state=active]:text-white flex items-center gap-2"
          >
            <Reply className="w-4 h-4" />
            Replies ({replies.length})
          </TabsTrigger>
        </TabsList>

        {/* All Activity Tab Content */}
        <TabsContent value="all" className="space-y-4">
          {isLoadingPosts || isLoadingReplies ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
            </div>
          ) : allActivity.length > 0 ? (
            <div className="space-y-3">
              {allActivity.map((activity) => (
                <Card
                  key={`${activity.type}-${activity.id}`}
                  className="bg-[#1a2f51] border-[#C0E6FF]/10 hover:border-[#C0E6FF]/30 transition-colors cursor-pointer"
                  onClick={() => {
                    if (activity.type === 'post' && activity.topicId) {
                      onPostClick?.(activity.id, activity.topicId, activity.topicName)
                    } else if (activity.type === 'reply' && activity.postId && activity.topicId) {
                      onPostClick?.(activity.postId, activity.topicId, activity.topicName)
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Activity Type Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'post'
                          ? 'bg-[#4DA2FF]/20 text-[#4DA2FF]'
                          : 'bg-[#9333EA]/20 text-[#9333EA]'
                      }`}>
                        {activity.type === 'post' ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <Reply className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Activity Type Badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${
                            activity.type === 'post'
                              ? 'bg-[#4DA2FF]/20 text-[#4DA2FF] border-[#4DA2FF]/30'
                              : 'bg-[#9333EA]/20 text-[#9333EA] border-[#9333EA]/30'
                          } text-xs`}>
                            {activity.type === 'post' ? 'Posted' : 'Replied'}
                          </Badge>
                          <Clock className="w-3 h-3 text-[#C0E6FF]/70" />
                          <span className="text-xs text-[#C0E6FF]/70">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </span>
                        </div>

                        <h3 className={`font-semibold transition-colors mb-1 ${
                          activity.type === 'post'
                            ? 'text-white hover:text-[#4DA2FF]'
                            : 'text-white hover:text-[#9333EA]'
                        }`}>
                          {activity.title}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-[#C0E6FF]/70 mb-2">
                          <span>in</span>
                          <Badge variant="outline" className={`${
                            activity.type === 'post'
                              ? 'text-[#4DA2FF] border-[#4DA2FF]/30'
                              : 'text-[#9333EA] border-[#9333EA]/30'
                          }`}>
                            {activity.topicName}
                          </Badge>
                        </div>



                        {activity.type === 'post' && activity.replyCount !== undefined && (
                          <div className="flex items-center gap-2 text-sm text-[#C0E6FF]/70">
                            <MessageSquare className="w-4 h-4" />
                            <span>{activity.replyCount} replies</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-[#1a2f51] border-[#C0E6FF]/20">
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-[#C0E6FF]/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Activity Yet</h3>
                <p className="text-[#C0E6FF]/70">
                  You haven't created any posts or replies yet. Start participating in discussions!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Posts Tab Content */}
        <TabsContent value="posts" className="space-y-4">
          {isLoadingPosts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#4DA2FF]" />
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-[#1a2f51] border-[#C0E6FF]/10 hover:border-[#C0E6FF]/30 transition-colors cursor-pointer"
                  onClick={() => handlePostClick(post)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Post Icon */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4DA2FF]/20 text-[#4DA2FF] flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-[#4DA2FF]/20 text-[#4DA2FF] border-[#4DA2FF]/30 text-xs">
                            Posted
                          </Badge>
                          <Clock className="w-3 h-3 text-[#C0E6FF]/70" />
                          <span className="text-xs text-[#C0E6FF]/70">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </span>
                        </div>

                        <h3 className="text-white font-semibold hover:text-[#4DA2FF] transition-colors mb-1">
                          {post.title}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-[#C0E6FF]/70 mb-2">
                          <span>in</span>
                          <Badge variant="outline" className="text-[#4DA2FF] border-[#4DA2FF]/30">
                            {post.topic_name}
                          </Badge>
                        </div>



                        <div className="flex items-center gap-2 text-sm text-[#C0E6FF]/70">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.reply_count} replies</span>
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
                <FileText className="w-12 h-12 text-[#C0E6FF]/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Posts Yet</h3>
                <p className="text-[#C0E6FF]/70">
                  You haven't created any forum posts yet. Start a discussion to see your posts here!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Replies Tab Content */}
        <TabsContent value="replies" className="space-y-4">
          {isLoadingReplies ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#9333EA]" />
            </div>
          ) : replies.length > 0 ? (
            <div className="space-y-3">
              {replies.map((reply) => (
                <Card
                  key={reply.id}
                  className="bg-[#1a2f51] border-[#C0E6FF]/10 hover:border-[#C0E6FF]/30 transition-colors cursor-pointer"
                  onClick={() => handleReplyClick(reply)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Reply Icon */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#9333EA]/20 text-[#9333EA] flex items-center justify-center">
                        <Reply className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-[#9333EA]/20 text-[#9333EA] border-[#9333EA]/30 text-xs">
                            Replied
                          </Badge>
                          <Clock className="w-3 h-3 text-[#C0E6FF]/70" />
                          <span className="text-xs text-[#C0E6FF]/70">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </span>
                        </div>

                        <h3 className="text-white font-semibold hover:text-[#9333EA] transition-colors mb-1">
                          {cleanReplyTitle(reply.title)}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-[#C0E6FF]/70 mb-2">
                          <span>in</span>
                          <Badge variant="outline" className="text-[#9333EA] border-[#9333EA]/30">
                            {reply.topic_name || 'Unknown Topic'}
                          </Badge>
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
                <Reply className="w-12 h-12 text-[#C0E6FF]/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Replies Yet</h3>
                <p className="text-[#C0E6FF]/70">
                  You haven't replied to any posts yet. Join the conversation to see your replies here!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
