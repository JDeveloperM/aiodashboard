"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { useCreatorsDatabase } from "@/contexts/creators-database-context"
import { 
  Users, 
  Calendar, 
  Crown,
  Star,
  MessageSquare,
  ExternalLink,
  Clock,
  Plus
} from "lucide-react"

interface CreatedChannel {
  id: string
  name: string
  type: 'free' | 'premium' | 'vip'
  price: number
  description: string
  subscribers: number
  creatorId: string
  creatorName: string
  creatorAddress: string
  avatarUrl?: string
  coverUrl?: string
  color: string
  channelCategories?: string[]
  channelRole?: string
  channelLanguage?: string
  availability?: {
    hasLimit: boolean
    currentSlots?: number
    maxSlots?: number
    status: 'available' | 'limited' | 'full'
  }
}

interface MyCreatedChannelsListProps {
  onChannelClick: (creatorAddress: string, channelId: string, channelName: string, channelAvatar?: string, channelCover?: string) => void
}

export function MyCreatedChannelsList({ onChannelClick }: MyCreatedChannelsListProps) {
  const { user } = useSuiAuth()
  const { getUserCreators } = useCreatorsDatabase()
  const [channels, setChannels] = useState<CreatedChannel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserCreatedChannels()
  }, [user])

  const loadUserCreatedChannels = async () => {
    if (!user?.address) {
      setChannels([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      // Get user's created channels from creators database
      const userCreators = getUserCreators(user.address)
      
      // Transform creator channels to match the display format
      const createdChannels: CreatedChannel[] = []
      
      userCreators.forEach(creator => {
        creator.channels.forEach(channel => {
          createdChannels.push({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            price: channel.price,
            description: channel.description,
            subscribers: channel.subscribers,
            creatorId: creator.id,
            creatorName: creator.name,
            creatorAddress: creator.creatorAddress,
            avatarUrl: (channel as any).channelAvatar || creator.avatar,
            coverUrl: (channel as any).channelCover || creator.coverImage,
            color: creator.bannerColor || '#4DA2FF',
            channelCategories: (channel as any).channelCategories,
            channelRole: (channel as any).channelRole,
            channelLanguage: (channel as any).channelLanguage,
            availability: channel.availability
          })
        })
      })

      setChannels(createdChannels)
    } catch (error) {
      console.error('Error loading created channels:', error)
      setChannels([])
    } finally {
      setIsLoading(false)
    }
  }

  const getTierBadgeColor = (type: string) => {
    switch (type) {
      case 'premium':
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case 'vip':
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30"
    }
  }

  const formatSubscriberCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  if (isLoading) {
    return (
      <Card className="bg-[#1a2f51] border-[#C0E6FF]/20">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4DA2FF] mx-auto mb-4"></div>
          <p className="text-[#C0E6FF]/70">Loading your channels...</p>
        </CardContent>
      </Card>
    )
  }

  if (channels.length === 0) {
    return (
      <Card className="bg-[#1a2f51] border-[#C0E6FF]/20">
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-[#C0E6FF]/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Channels Created</h3>
          <p className="text-[#C0E6FF]/70 mb-4">
            You haven't created any channels yet. Start creating content by setting up your first channel.
          </p>
          <Button
            onClick={() => window.location.href = '/creator-controls'}
            className="bg-[#9333EA] hover:bg-[#9333EA]/80 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Channel
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-semibold">My Channels ({channels.length})</h3>
        <Button
          onClick={() => window.location.href = '/creator-controls'}
          variant="outline"
          size="sm"
          className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create More
        </Button>
      </div>

      <div className="space-y-4">
        {channels.map((channel) => (
          <Card
            key={channel.id}
            className="overflow-hidden border-[#C0E6FF]/20 hover:border-[#4DA2FF]/50 transition-colors cursor-pointer"
            onClick={() => onChannelClick(channel.creatorAddress, channel.id, channel.name, channel.avatarUrl, channel.coverUrl)}
          >
            <div
              className="relative bg-cover bg-center bg-no-repeat min-h-[120px]"
              style={{
                background: channel.coverUrl
                  ? `linear-gradient(135deg, ${channel.color}40, ${channel.color}20), url(${channel.coverUrl})`
                  : `linear-gradient(135deg, ${channel.color}40, ${channel.color}20)`,
                backgroundSize: channel.coverUrl ? 'cover' : 'auto',
                backgroundPosition: channel.coverUrl ? 'center' : 'auto',
                borderBottom: `2px solid ${channel.color}60`
              }}
            >
              <div className="absolute inset-0 bg-black/30"></div>
              
              {/* Channel Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-24 w-24 border-2 border-white/20">
                      <AvatarImage
                        src={channel.avatarUrl}
                        alt={channel.name}
                      />
                      <AvatarFallback className="bg-[#4DA2FF] text-white text-2xl">
                        {channel.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg truncate">
                        {channel.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-white/80 text-sm">
                          <Users className="w-4 h-4" />
                          <span>{formatSubscriberCount(channel.subscribers)}</span>
                        </div>

                        {/* Slots Information */}
                        {channel.availability?.hasLimit && (
                          <div className="flex items-center gap-1 text-white/80 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>
                              {channel.availability.currentSlots || 0} out of {channel.availability.maxSlots || 0} slots
                            </span>
                          </div>
                        )}

                        <Badge className={getTierBadgeColor(channel.type)}>
                          {channel.type.toUpperCase()}
                        </Badge>

                        {channel.channelCategories && channel.channelCategories.length > 0 && (
                          <Badge variant="secondary" className="bg-white/10 text-white/80 text-xs">
                            {channel.channelCategories[0]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="ml-4">
                    <Button
                      size="sm"
                      className="bg-[#9333EA] hover:bg-[#9333EA]/80 text-white px-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        onChannelClick(channel.creatorAddress, channel.id, channel.name, channel.avatarUrl, channel.coverUrl)
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Manage Content
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
