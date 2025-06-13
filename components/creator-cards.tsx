"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RoleImage } from "@/components/ui/role-image"
import { TipPaymentModal } from "./tip-payment-modal"
import { useSubscription } from "@/contexts/subscription-context"
import { usePremiumAccess } from "@/contexts/premium-access-context"
import { Filter, FilterX } from "lucide-react"
import { toast } from "sonner"
import {
  Users,
  Coins,
  Play,
  FileText,
  BookOpen,
  TrendingUp,
  CheckCircle,
  MessageCircle,
  Clock,
  UserCheck,
  UserX,
  Send,
  LogOut
} from "lucide-react"
import Image from "next/image"

interface Channel {
  id: string
  name: string
  type: 'free' | 'premium' | 'vip'
  price: number // in SUI (default price, usually for 30 days)
  description: string
  subscribers: number
  telegramUrl: string // Telegram channel URL for access
  subscriptionPackages?: string[] // Available durations: ["30", "60", "90"]
  pricing?: {
    thirtyDays?: number
    sixtyDays?: number
    ninetyDays?: number
  }
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
  coverImage?: string // Optional cover image for banner background
  role: string
  tier: 'PRO' | 'ROYAL' // Status tier (NOMADS not allowed as creators)
  subscribers: number
  category: string // Primary category (for backward compatibility)
  categories: string[] // All selected categories
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
  const [showOnlyJoined, setShowOnlyJoined] = useState(false)
  const { tier } = useSubscription()
  const { canAccessPremiumForFree, recordPremiumAccess, getRemainingFreeAccess, premiumAccessRecords } = usePremiumAccess()

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
      // Redirect to Telegram channel for free access
      if (channel.telegramUrl) {
        window.open(channel.telegramUrl, '_blank')
      }
      onAccessChannel(creator.id, channel.id)
      return
    }

    // PRO and ROYAL users have limited free access to premium channels
    if (tier === 'PRO' || tier === 'ROYAL') {
      if (canAccessPremiumForFree(creator.id, channel.id)) {
        // User can access this premium channel for free
        console.log(`[CreatorCards] Recording premium access for ${tier} user: ${creator.id}_${channel.id}`)
        recordPremiumAccess(creator.id, channel.id)
        if (channel.telegramUrl) {
          window.open(channel.telegramUrl, '_blank')
        }
        onAccessChannel(creator.id, channel.id)
        return
      } else {
        // User has exceeded their free premium channel limit, show payment modal
        setSelectedCreator(creator)
        setSelectedChannel(channel)
        setShowPaymentModal(true)
        return
      }
    }

    const accessKey = `${creator.id}_${channel.id}`
    if (userAccess[accessKey]) {
      // User has access, redirect to Telegram channel
      if (channel.telegramUrl) {
        window.open(channel.telegramUrl, '_blank')
      }
      onAccessChannel(creator.id, channel.id)
      return
    }

    // Show payment modal for premium/vip channels (NOMAD users only)
    setSelectedCreator(creator)
    setSelectedChannel(channel)
    setShowPaymentModal(true)
  }

  const handleLeaveChannel = (creator: Creator, channel: Channel, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent triggering the access button

    const channelName = channel.name
    const creatorName = creator.name

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to leave "${channelName}" by ${creatorName}?\n\nThis will remove your access to this premium channel. You'll need to purchase access again if you want to rejoin.`
    )

    if (!confirmed) return

    // Remove from localStorage (paid access)
    const accessKey = `channel_access_${creator.id}_${channel.id}`
    localStorage.removeItem(accessKey)

    // Remove from premium access records (free access for PRO/ROYAL users)
    const premiumAccessKey = `premium_access_${creator.id}_${channel.id}`
    localStorage.removeItem(premiumAccessKey)

    // Update local state
    const newUserAccess = { ...userAccess }
    delete newUserAccess[`${creator.id}_${channel.id}`]
    setUserAccess(newUserAccess)

    // Show success message
    console.log(`[CreatorCards] User left channel: ${channelName} by ${creatorName}`)
    toast.success(`Successfully left "${channelName}". You no longer have access to this premium channel.`)
  }

  const handlePaymentSuccess = (creatorId: string, channelId: string) => {
    const accessKey = `${creatorId}_${channelId}`
    const expiry = new Date()
    expiry.setMonth(expiry.getMonth() + 1)
    setUserAccess(prev => ({
      ...prev,
      [accessKey]: expiry.toISOString()
    }))

    // Find the channel and redirect to Telegram
    const creator = creators.find(c => c.id === creatorId)
    const channel = creator?.channels.find(ch => ch.id === channelId)
    if (channel?.telegramUrl) {
      window.open(channel.telegramUrl, '_blank')
    }

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
    // Check if user has paid access (NOMAD users or premium users who exceeded limit)
    const accessKey = `${creatorId}_${channelId}`
    if (userAccess[accessKey]) {
      return true
    }

    // Check if user has already used a free premium slot for this specific channel
    // This means they've actually accessed it before, not just that they CAN access it
    const alreadyAccessedForFree = premiumAccessRecords.some(
      record => record.creatorId === creatorId && record.channelId === channelId
    )

    return alreadyAccessedForFree
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

  // Filter creators based on whether user has access to their channels
  const filteredCreators = showOnlyJoined
    ? creators.filter(creator =>
        creator.channels.some(channel =>
          channel.type === 'free' || hasAccess(creator.id, channel.id)
        )
      )
    : creators

  const joinedChannelsCount = creators.reduce((count, creator) => {
    return count + creator.channels.filter(channel =>
      channel.type === 'free' || hasAccess(creator.id, channel.id)
    ).length
  }, 0)

  return (
    <>
      {/* Filter Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowOnlyJoined(!showOnlyJoined)}
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 ${
              showOnlyJoined
                ? "bg-[#4DA2FF] text-white border-[#4DA2FF]"
                : "bg-[#1a2f51] text-[#C0E6FF] border-[#C0E6FF]/20 hover:border-[#4DA2FF]/50"
            }`}
          >
            {showOnlyJoined ? <FilterX className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            {showOnlyJoined ? "Show All" : "Show Joined Only"}
          </Button>

          {showOnlyJoined && (
            <span className="text-[#C0E6FF] text-sm">
              {joinedChannelsCount} joined channel{joinedChannelsCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="text-[#C0E6FF] text-sm">
          {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''} shown
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCreators.map((creator) => {
          const CategoryIcon = getCategoryIcon(creator.category)

          return (
            <div key={creator.id} id={`creator-${creator.id}`} className="enhanced-card overflow-hidden">
              {/* Banner with Avatar and Channel Icons */}
              <div
                className="relative h-20 flex items-center p-3 rounded-t-lg overflow-hidden"
                style={{
                  background: creator.coverImage
                    ? `url(${creator.coverImage})`
                    : `linear-gradient(135deg, ${creator.bannerColor}40, ${creator.bannerColor}20)`,
                  backgroundSize: creator.coverImage ? 'cover' : 'auto',
                  backgroundPosition: creator.coverImage ? 'center' : 'auto',
                  borderBottom: `2px solid ${creator.bannerColor}60`
                }}
              >
                {/* Cover Image Overlay for better text readability */}
                {creator.coverImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-t-lg"></div>
                )}
                {/* Main Banner Content */}
                <div className="banner-main-content flex items-center gap-2 w-full relative z-10">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarImage src={creator.avatar} alt={creator.name} />
                    <AvatarFallback className="bg-[#4DA2FF] text-white text-xl">
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
                    <div className="mt-1">
                      <span className="text-white/70 text-xs font-medium">
                        {creator.role}
                      </span>
                    </div>

                  </div>

                  {/* Chat Icon - Right Corner */}
                  <div className="flex items-center">
                    {/* Direct Message to Creator - Personal Telegram */}
                    {creator.socialLinks.telegram && (
                      <a
                        href={creator.socialLinks.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:scale-110 transition-transform"
                        title="Direct Message Creator on Telegram"
                      >
                        <MessageCircle className="w-5 h-5 text-white opacity-90 hover:opacity-100" />
                      </a>
                    )}
                  </div>
                </div>


              </div>

              <div className="p-3 space-y-3">
                {/* Categories - 3 per line */}
                <div className="grid grid-cols-3 gap-1">
                  {/* Display all categories in a 3-column grid */}
                  {(creator.categories || [creator.category]).slice(0, 6).map((category, index) => {
                    const CategoryIcon = getCategoryIcon(category)
                    return (
                      <Badge key={index} className={`text-xs px-1.5 py-1 ${getCategoryColor(category)} flex items-center justify-center`}>
                        <CategoryIcon className="w-3 h-3 mr-1" />
                        <span className="truncate">{category}</span>
                      </Badge>
                    )
                  })}
                  {/* Show +X more if there are more than 6 categories */}
                  {creator.categories && creator.categories.length > 6 && (
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs px-1.5 py-1 flex items-center justify-center">
                      +{creator.categories.length - 6}
                    </Badge>
                  )}
                </div>

                {/* Line 2: Subscribers and Availability */}
                <div className="flex items-center justify-center gap-4 text-xs text-[#C0E6FF]">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{creator.subscribers > 1000 ? `${(creator.subscribers/1000).toFixed(1)}k` : creator.subscribers} subscribers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getAvailabilityIcon(creator.availability.status)}
                    <span>{getAvailabilityText(creator.availability)}</span>
                  </div>
                </div>

                {/* Line 3: Languages */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {creator.languages.slice(0, 3).map((lang) => (
                    <Badge
                      key={lang}
                      variant="outline"
                      className="text-xs border-[#C0E6FF]/30 text-[#C0E6FF] px-1.5 py-0.5"
                    >
                      {lang}
                    </Badge>
                  ))}
                  {creator.languages.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-xs border-[#C0E6FF]/30 text-[#C0E6FF] px-1.5 py-0.5"
                    >
                      +{creator.languages.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Channel Details - Full Width at Bottom */}
                <div className="space-y-1.5">
                  {creator.channels.slice(0, 1).map((channel) => {
                    const hasChannelAccess = hasAccess(creator.id, channel.id)
                    const canAccessForFree = (tier === 'PRO' || tier === 'ROYAL') && canAccessPremiumForFree(creator.id, channel.id)

                    // Debug: Only log when there's an issue
                    if (hasChannelAccess && !canAccessForFree && channel.type === 'premium') {
                      console.log(`[CreatorCards] DEBUG: Channel ${channel.name} shows "Access" but user can't access for free`)
                    }

                    return (
                      <div
                        key={channel.id}
                        className="bg-[#1a2f51] rounded p-2 space-y-1"
                      >
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-1">
                            <span className="text-white text-xs font-medium">{channel.name}</span>
                            <Badge className={`text-xs ${getChannelTypeColor(channel.type)} px-1 py-0`}>
                              {channel.type[0].toUpperCase()}
                            </Badge>
                          </div>
                        </div>



                        {/* Show both Access and Leave buttons if user has access to premium/vip channels */}
                        {(hasChannelAccess && channel.type !== 'free') ? (
                          <div className="flex gap-1">
                            <Button
                              onClick={() => handleChannelAccess(creator, channel)}
                              size="sm"
                              className="flex-1 h-6 text-xs bg-green-600 hover:bg-green-700 text-white"
                            >
                              Access
                            </Button>
                            <Button
                              onClick={(e) => handleLeaveChannel(creator, channel, e)}
                              size="sm"
                              className="h-6 text-xs bg-red-600 hover:bg-red-700 text-white px-2"
                              title="Leave Channel"
                            >
                              <LogOut className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleChannelAccess(creator, channel)}
                            size="sm"
                            disabled={channel.availability?.status === 'full'}
                            className={`w-full h-6 text-xs ${
                              channel.availability?.status === 'full'
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : channel.type === 'free' || canAccessForFree
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
                            }`}
                          >
                            {channel.availability?.status === 'full' ? (
                              'Full'
                            ) : channel.type === 'free' ? (
                              'Access Free'
                            ) : canAccessForFree ? (
                              `Access Free (${getRemainingFreeAccess()} left)`
                            ) : (
                              // Show specific amount only if single subscription option, otherwise just "Tip SUI"
                              channel.subscriptionPackages && channel.subscriptionPackages.length > 1
                                ? 'Tip SUI'
                                : `Tip ${channel.price} SUI`
                            )}
                          </Button>
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
