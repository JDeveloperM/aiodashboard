"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { getUserJoinedChannels, type UserChannel } from "@/lib/channel-subscriptions-storage"
import { 
  Users, 
  Calendar, 
  Crown,
  Star,
  MessageSquare,
  ExternalLink,
  Clock
} from "lucide-react"

interface MyChannelsListProps {
  onChannelClick: (creatorAddress: string, channelId: string, channelName: string, channelAvatar?: string, channelCover?: string) => void
}

export function MyChannelsList({ onChannelClick }: MyChannelsListProps) {
  const { user } = useSuiAuth()
  const [channels, setChannels] = useState<UserChannel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserChannels()
  }, [user])

  const loadUserChannels = async () => {
    if (!user?.address) {
      setChannels([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const userChannels = await getUserJoinedChannels(user.address)
      // Filter for active subscriptions only
      const activeChannels = userChannels.filter(channel =>
        channel.isActive &&
        (!channel.expiryDate || new Date(channel.expiryDate) > new Date())
      )
      setChannels(activeChannels)
    } catch (error) {
      console.error('Failed to load user channels:', error)
      setChannels([])
    } finally {
      setIsLoading(false)
    }
  }

  const getChannelTypeColor = (type: string) => {
    switch (type) {
      case 'vip':
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case 'premium':
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30"
    }
  }

  const getChannelTypeIcon = (type: string) => {
    switch (type) {
      case 'vip':
        return <Crown className="w-3 h-3" />
      case 'premium':
        return <Star className="w-3 h-3" />
      default:
        return <Users className="w-3 h-3" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  if (!user?.address) {
    return (
      <Card className="bg-[#1a2f51] border-[#C0E6FF]/20">
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-[#C0E6FF]/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-[#C0E6FF]/70">
            Connect your wallet to see your joined channels and access creator content.
          </p>
        </CardContent>
      </Card>
    )
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
          <h3 className="text-lg font-semibold text-white mb-2">No Channels Joined</h3>
          <p className="text-[#C0E6FF]/70 mb-4">
            You haven't joined any creator channels yet. Visit the AIO Creators page to discover and join channels.
          </p>
          <Button
            onClick={() => window.location.href = '/aio-creators'}
            className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Browse Creators
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
          onClick={() => window.location.href = '/aio-creators'}
          variant="outline"
          size="sm"
          className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Browse More
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
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-black/50"></div>

              {/* Channel Content */}
              <div className="relative z-10 p-4 h-full flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Avatar */}
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    {channel.avatarUrl ? (
                      <AvatarImage
                        src={channel.avatarUrl}
                        alt={channel.name}
                      />
                    ) : channel.avatarBlobId ? (
                      <AvatarImage
                        src={`https://aggregator.walrus-testnet.walrus.space/v1/blobs/${channel.avatarBlobId}`}
                        alt={channel.name}
                      />
                    ) : (
                      <AvatarFallback className="bg-[#4DA2FF] text-white text-lg">
                        {channel.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  {/* Channel Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-bold text-lg truncate">{channel.name}</h4>
                      <Badge className={`${getChannelTypeColor(channel.type)} shrink-0`}>
                        {getChannelTypeIcon(channel.type)}
                        <span className="ml-1">{channel.type.toUpperCase()}</span>
                      </Badge>
                    </div>

                    <p className="text-white/80 text-sm mb-2 line-clamp-2">
                      {channel.description || 'No description available'}
                    </p>

                    <div className="flex items-center gap-4 text-white/70 text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{channel.subscribers} subscribers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {formatDate(channel.joinedDate)}</span>
                      </div>
                      {channel.expiryDate && (
                        <div className={`flex items-center gap-1 ${
                          isExpiringSoon(channel.expiryDate) ? 'text-orange-300' : 'text-white/70'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>
                            {isExpiringSoon(channel.expiryDate) ? 'Expires soon' : `Until ${formatDate(channel.expiryDate)}`}
                          </span>
                        </div>
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
                    View Content
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
