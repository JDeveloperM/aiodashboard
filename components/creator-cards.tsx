"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TipPaymentModal } from "./tip-payment-modal"
import {
  Users,
  Lock,
  Unlock,
  Coins,
  Play,
  FileText,
  BookOpen,
  TrendingUp,
  Shield,
  Calendar,
  CheckCircle,
  Globe,
  ExternalLink,
  MessageCircle,
  Hash,
  Clock,
  UserCheck,
  UserX
} from "lucide-react"

interface Channel {
  id: string
  name: string
  type: 'free' | 'premium' | 'vip'
  price: number // in SUI
  description: string
  subscribers: number
  availability?: {
    hasLimit: boolean
    currentSlots?: number
    maxSlots?: number
    status: 'available' | 'limited' | 'full'
  }
}

interface Creator {
  id: string
  name: string
  username: string
  avatar: string
  role: string
  subscribers: number
  category: string
  channels: Channel[]
  contentTypes: string[]
  verified: boolean
  languages: string[]
  availability: {
    hasLimit: boolean
    currentSlots?: number
    maxSlots?: number
    status: 'available' | 'limited' | 'full'
  }
  socialLinks: {
    website?: string
    twitter?: string
    telegram?: string
    discord?: string
  }
  bannerColor: string
}

interface CreatorCardsProps {
  creators: Creator[]
  onAccessChannel: (creatorId: string, channelId: string) => void
}

export function CreatorCards({ creators, onAccessChannel }: CreatorCardsProps) {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [userAccess, setUserAccess] = useState<Record<string, string>>({})

  // Load user access from localStorage
  useEffect(() => {
    const access: Record<string, string> = {}
    creators.forEach(creator => {
      creator.channels.forEach(channel => {
        const accessKey = `channel_access_${creator.id}_${channel.id}`
        const expiry = localStorage.getItem(accessKey)
        if (expiry && new Date(expiry) > new Date()) {
          access[`${creator.id}_${channel.id}`] = expiry
        }
      })
    })
    setUserAccess(access)
  }, [creators])

  const handleChannelAccess = (creator: Creator, channel: Channel) => {
    if (channel.type === 'free') {
      onAccessChannel(creator.id, channel.id)
      return
    }

    const accessKey = `${creator.id}_${channel.id}`
    if (userAccess[accessKey]) {
      onAccessChannel(creator.id, channel.id)
      return
    }

    setSelectedCreator(creator)
    setSelectedChannel(channel)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (creatorId: string, channelId: string) => {
    const accessKey = `${creatorId}_${channelId}`
    const expiry = new Date()
    expiry.setMonth(expiry.getMonth() + 1)
    setUserAccess(prev => ({
      ...prev,
      [accessKey]: expiry.toISOString()
    }))
    onAccessChannel(creatorId, channelId)
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'trading':
        return TrendingUp
      case 'education':
        return BookOpen
      case 'analysis':
        return FileText
      case 'defi':
        return Coins
      case 'nfts':
        return Play
      default:
        return Play
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'trading':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'education':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'analysis':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'defi':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'nfts':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getChannelTypeColor = (type: string) => {
    switch (type) {
      case 'free':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'premium':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'vip':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const hasAccess = (creatorId: string, channelId: string) => {
    const accessKey = `${creatorId}_${channelId}`
    return !!userAccess[accessKey]
  }

  const getAccessExpiry = (creatorId: string, channelId: string) => {
    const accessKey = `${creatorId}_${channelId}`
    const expiry = userAccess[accessKey]
    return expiry ? new Date(expiry) : null
  }

  const getAvailabilityIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <UserCheck className="w-3 h-3 text-green-400" />
      case 'limited':
        return <Clock className="w-3 h-3 text-orange-400" />
      case 'full':
        return <UserX className="w-3 h-3 text-red-400" />
      default:
        return <UserCheck className="w-3 h-3 text-green-400" />
    }
  }

  const getAvailabilityText = (availability: Creator['availability']) => {
    if (!availability.hasLimit) return 'Open'

    switch (availability.status) {
      case 'available':
        return `${availability.currentSlots}/${availability.maxSlots} slots`
      case 'limited':
        return `${availability.currentSlots}/${availability.maxSlots} slots`
      case 'full':
        return 'Full'
      default:
        return 'Open'
    }
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {creators.map((creator) => {
          const CategoryIcon = getCategoryIcon(creator.category)

          return (
            <div key={creator.id} className="enhanced-card overflow-hidden">
              {/* Banner with Avatar */}
              <div
                className="relative h-28 flex items-end p-4 rounded-t-lg"
                style={{
                  background: `linear-gradient(135deg, ${creator.bannerColor}40, ${creator.bannerColor}20)`,
                  borderBottom: `2px solid ${creator.bannerColor}60`
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-12 w-12 border-2 border-white/20">
                    <AvatarImage src={creator.avatar} alt={creator.name} />
                    <AvatarFallback className="bg-[#4DA2FF] text-white">
                      {creator.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="text-white font-semibold text-sm truncate">{creator.name}</h3>
                      {creator.verified && (
                        <CheckCircle className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-white/80 text-xs">@{creator.username}</p>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-1">
                    {creator.socialLinks.website && (
                      <a
                        href={creator.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 bg-white/10 rounded hover:bg-white/20 transition-colors"
                      >
                        <Globe className="w-3 h-3 text-white" />
                      </a>
                    )}
                    {creator.socialLinks.twitter && (
                      <a
                        href={creator.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 bg-white/10 rounded hover:bg-white/20 transition-colors"
                      >
                        <Hash className="w-3 h-3 text-white" />
                      </a>
                    )}
                    {creator.socialLinks.telegram && (
                      <a
                        href={creator.socialLinks.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 bg-white/10 rounded hover:bg-white/20 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3 text-white" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 space-y-3">
                {/* Role and Category */}
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#4da2ff] text-white text-xs">
                    {creator.role}
                  </Badge>
                  <Badge className={`text-xs ${getCategoryColor(creator.category)}`}>
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {creator.category}
                  </Badge>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-xs text-[#C0E6FF]">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{creator.subscribers > 1000 ? `${(creator.subscribers/1000).toFixed(1)}k` : creator.subscribers}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getAvailabilityIcon(creator.availability.status)}
                    <span>{getAvailabilityText(creator.availability)}</span>
                  </div>
                </div>

                {/* Languages */}
                <div className="flex flex-wrap gap-1">
                  {creator.languages.slice(0, 3).map((lang) => (
                    <Badge
                      key={lang}
                      variant="outline"
                      className="text-xs border-[#C0E6FF]/30 text-[#C0E6FF] px-1 py-0"
                    >
                      {lang}
                    </Badge>
                  ))}
                  {creator.languages.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-xs border-[#C0E6FF]/30 text-[#C0E6FF] px-1 py-0"
                    >
                      +{creator.languages.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Channels - Compact */}
                <div className="space-y-1">
                  {creator.channels.slice(0, 2).map((channel) => {
                    const hasChannelAccess = hasAccess(creator.id, channel.id)

                    return (
                      <div
                        key={channel.id}
                        className="bg-[#1a2f51] rounded p-2 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-white text-xs font-medium truncate">{channel.name}</span>
                            <Badge className={`text-xs ${getChannelTypeColor(channel.type)} px-1 py-0`}>
                              {channel.type[0].toUpperCase()}
                            </Badge>
                          </div>
                          {channel.type !== 'free' && (
                            <div className="flex items-center gap-1 text-[#4DA2FF] text-xs">
                              <Coins className="w-2 h-2" />
                              <span>{channel.price}</span>
                            </div>
                          )}
                        </div>

                        {/* Channel Availability */}
                        {channel.availability && channel.availability.hasLimit && (
                          <div className="flex items-center gap-1 text-xs">
                            {getAvailabilityIcon(channel.availability.status)}
                            <span className="text-[#C0E6FF]">
                              {channel.availability.status === 'full'
                                ? 'Full'
                                : `${channel.availability.currentSlots}/${channel.availability.maxSlots} slots`
                              }
                            </span>
                          </div>
                        )}

                        <Button
                          onClick={() => handleChannelAccess(creator, channel)}
                          size="sm"
                          disabled={channel.availability?.status === 'full'}
                          className={`w-full h-6 text-xs ${
                            channel.availability?.status === 'full'
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : channel.type === 'free' || hasChannelAccess
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
                          }`}
                        >
                          {channel.availability?.status === 'full' ? (
                            'Full'
                          ) : channel.type === 'free' ? (
                            'Access Free'
                          ) : hasChannelAccess ? (
                            'Access'
                          ) : (
                            `${channel.price} SUI`
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>

                {/* All Channels as Rounded Images */}
                <div className="flex flex-wrap gap-1 justify-center pt-2 border-t border-[#C0E6FF]/20">
                  {creator.channels.map((channel) => {
                    const hasChannelAccess = hasAccess(creator.id, channel.id)

                    return (
                      <div
                        key={channel.id}
                        onClick={() => handleChannelAccess(creator, channel)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
                          channel.availability?.status === 'full'
                            ? "bg-gray-600 cursor-not-allowed"
                            : channel.type === 'free' || hasChannelAccess
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-[#4DA2FF] hover:bg-[#4DA2FF]/80"
                        }`}
                        title={`${channel.name} - ${
                          channel.availability?.status === 'full'
                            ? 'Full'
                            : channel.type === 'free'
                            ? 'Free'
                            : `${channel.price} SUI`
                        }`}
                      >
                        {channel.type === 'free' ? (
                          <Unlock className="w-3 h-3 text-white" />
                        ) : hasChannelAccess ? (
                          <CheckCircle className="w-3 h-3 text-white" />
                        ) : channel.availability?.status === 'full' ? (
                          <UserX className="w-3 h-3 text-gray-400" />
                        ) : (
                          <Lock className="w-3 h-3 text-white" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <TipPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        creator={selectedCreator}
        channel={selectedChannel}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  )
}
