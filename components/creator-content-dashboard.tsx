"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCreatorsDatabase } from "@/contexts/creators-database-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { CreateChannelPostModal } from "./create-channel-post-modal"
import {
  Plus,
  MessageSquare,
  Users,
  Eye,
  TrendingUp,
  Calendar,
  Settings,
  FileText,
  Reply
} from "lucide-react"
import { toast } from "sonner"

interface CreatorContentDashboardProps {
  className?: string
  tier?: string
  currentChannelCount?: number
  maxChannels?: number
}

interface ChannelStats {
  total_posts: number
  total_replies: number
  total_views: number
  latest_post_date: string | null
}

export function CreatorContentDashboard({ className, tier = 'PRO', currentChannelCount = 0, maxChannels = 2 }: CreatorContentDashboardProps) {
  const { getUserCreators } = useCreatorsDatabase()
  const { user } = useSuiAuth()
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [channelStats, setChannelStats] = useState<Record<string, ChannelStats>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Get user's creator channels - memoize to prevent infinite re-renders
  const userCreators = user?.address ? getUserCreators(user.address) : []
  const allChannels = useMemo(() =>
    userCreators.flatMap(creator =>
      creator.channels.map(channel => ({
        ...channel,
        creatorId: creator.id,
        creatorName: creator.name,
        creatorAvatar: creator.avatar
      }))
    ), [userCreators]
  )

  useEffect(() => {
    if (allChannels.length > 0 && !selectedChannel) {
      setSelectedChannel(allChannels[0])
    }
  }, [allChannels.length, selectedChannel])

  useEffect(() => {
    loadChannelStats()
  }, []) // Only load stats once on mount

  const loadChannelStats = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would call the Supabase function
      // For now, we'll simulate the stats
      const stats: Record<string, ChannelStats> = {}
      
      for (const channel of allChannels) {
        // Use channel ID to generate consistent "random" values
        const seed = channel.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const seededRandom = (seed: number, index: number) => {
          const x = Math.sin(seed + index) * 10000
          return x - Math.floor(x)
        }

        stats[channel.id] = {
          total_posts: Math.floor(seededRandom(seed, 1) * 20) + 1,
          total_replies: Math.floor(seededRandom(seed, 2) * 100) + 5,
          total_views: Math.floor(seededRandom(seed, 3) * 1000) + 50,
          latest_post_date: new Date(Date.now() - seededRandom(seed, 4) * 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
      
      setChannelStats(stats)
    } catch (error) {
      console.error('Failed to load channel stats:', error)
      toast.error('Failed to load channel statistics')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = () => {
    if (!selectedChannel) {
      toast.error('Please select a channel first')
      return
    }
    console.log('🎯 Opening create post modal for channel:', selectedChannel.name)
    setShowCreateModal(true)
  }

  const handlePostCreated = () => {
    console.log('✅ Post created successfully, closing modal and refreshing stats')
    setShowCreateModal(false)
    loadChannelStats() // Refresh stats
    toast.success('Post created successfully!')
  }

  if (!user?.address) {
    return (
      <Card className="bg-[#1a2f51] border-[#C0E6FF]/20">
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-[#C0E6FF]/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Authentication Required</h3>
          <p className="text-[#C0E6FF]/70">Please connect your wallet to manage channel content.</p>
        </CardContent>
      </Card>
    )
  }

  if (allChannels.length === 0) {
    return (
      <Card className="bg-[#1a2f51] border-[#C0E6FF]/20">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-[#C0E6FF]/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Channels Found</h3>
          <p className="text-[#C0E6FF]/70 mb-4">
            You need to create a channel first before managing content.
          </p>
          <Button 
            onClick={() => window.location.href = '/creator-controls'}
            className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
          >
            Create Your First Channel
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentStats = selectedChannel ? channelStats[selectedChannel.id] : null

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Create Post Button */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white flex items-center gap-2 text-xl font-semibold">
          <FileText className="w-5 h-5" />
          Manage Your Content
        </h3>
        <Button
          onClick={handleCreatePost}
          className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
          disabled={!selectedChannel}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Channel Selector */}
      <Card className="bg-[#1a2f51] border-[#C0E6FF]/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Select Channel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allChannels.map((channel) => (
              <Card
                key={channel.id}
                className={`cursor-pointer transition-colors ${
                  selectedChannel?.id === channel.id
                    ? "bg-[#4DA2FF]/20 border-[#4DA2FF]"
                    : "bg-[#030f1c] border-[#C0E6FF]/10 hover:border-[#4DA2FF]/50"
                }`}
                onClick={() => setSelectedChannel(channel)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={channel.creatorAvatar} alt={channel.creatorName} />
                      <AvatarFallback className="bg-[#4DA2FF] text-white">
                        {channel.creatorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{channel.name}</h3>
                      <p className="text-[#C0E6FF]/70 text-xs">{channel.creatorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      className={
                        channel.type === 'premium'
                          ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          : channel.type === 'vip'
                          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                          : "bg-green-500/20 text-green-400 border-green-500/30"
                      }
                    >
                      {channel.type.toUpperCase()}
                    </Badge>
                    <span className="text-[#C0E6FF]/70 text-xs">
                      {channel.subscribers} subscribers
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Channel Stats */}
      {selectedChannel && currentStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#1a2f51] border-[#C0E6FF]/20">
            <CardContent className="p-4 h-full">
              <div className="flex flex-col justify-center items-center h-full space-y-3 text-center">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#4DA2FF]" />
                  <p className="text-[#C0E6FF]/70 text-sm font-medium">Total Posts</p>
                </div>
                <div>
                  <p className="text-white font-bold text-2xl">{currentStats.total_posts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2f51] border-[#C0E6FF]/20">
            <CardContent className="p-4 h-full">
              <div className="flex flex-col justify-center items-center h-full space-y-3 text-center">
                <div className="flex items-center gap-2">
                  <Reply className="w-5 h-5 text-green-400" />
                  <p className="text-[#C0E6FF]/70 text-sm font-medium">Total Replies</p>
                </div>
                <div>
                  <p className="text-white font-bold text-2xl">{currentStats.total_replies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1a2f51] border-[#C0E6FF]/20 md:col-span-2">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-5 h-5 text-[#4DA2FF]" />
                  <p className="text-white font-medium">Channel Creation Limits</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#030f1c] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Your Tier: {tier}</p>
                    <p className="text-[#C0E6FF] text-sm">
                      {tier === 'ROYAL' ? 'Maximum 3 channels allowed' : 'Maximum 2 channels allowed'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${currentChannelCount >= maxChannels ? 'text-red-400' : 'text-white'}`}>
                      {currentChannelCount} / {maxChannels}
                    </p>
                    <p className="text-[#C0E6FF] text-sm">Channels Created</p>
                  </div>
                </div>

                {/* Warning messages */}
                {currentChannelCount >= maxChannels && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm font-medium">⚠️ Channel limit reached!</p>
                    <p className="text-red-300 text-xs mt-1">
                      You have reached the maximum number of channels for {tier} tier.
                      {tier === 'PRO' && ' Upgrade to ROYAL to create up to 3 channels.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}



      {/* Create Post Modal */}
      <CreateChannelPostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        channel={selectedChannel}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}
