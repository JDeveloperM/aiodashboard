"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RoleImage } from "@/components/ui/role-image"
import { UserCard } from "./user-card"
import { User } from "./user-search-interface"
import { X, MessageCircle, UserPlus, Trophy, ExternalLink, MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/components/ui/use-mobile"

// Social media image paths
const socialImages = {
  Discord: "/images/social/discord.png",
  Telegram: "/images/social/telegram.png",
  X: "/images/social/x.png"
}

// Achievement image mapping function
const getAchievementImage = (achievementName: string): string | null => {
  const imageMap: { [key: string]: string } = {
    "Profile Picture": "/images/achievements/profile.png",
    "KYC Verification": "/images/achievements/kyc.png",
    "Reach Level 5": "/images/achievements/level 5.png",
    "Connect Discord": "/images/achievements/dicord.png",
    "Connect Telegram": "/images/achievements/telegram.png",
    "Connect X": "/images/achievements/x.png",
    "Connect Bybit": "/images/achievements/bybit.png",
    "Follow Apollon Bot": "/images/achievements/apollon ai.png",
    "Follow Hermes Bot": "/images/achievements/hermes.png",
    "Make 3 Cycles": "/images/achievements/3 cyrcle.png",
    "Upgrade to PRO": "/images/achievements/upgrade to pro.png",
    "Upgrade to ROYAL": "/images/achievements/upgrade to royal.png",
    "Refer 10 NOMADs": "/images/achievements/refer nomad.png",
    "Refer 50 NOMADs": "/images/achievements/refer nomad.png",
    "Refer 100 NOMADs": "/images/achievements/refer nomad.png",
    "Refer 1 PRO": "/images/achievements/refer pro.png",
    "Refer 5 PRO": "/images/achievements/refer pro.png",
    "Refer 10 PRO": "/images/achievements/refer pro.png",
    "Refer 1 ROYAL": "/images/achievements/refer royal.png",
    "Refer 3 ROYAL": "/images/achievements/refer royal.png",
    "Refer 5 ROYAL": "/images/achievements/refer royal.png"
  }
  return imageMap[achievementName] || null
}

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-green-500'
    case 'away': return 'bg-yellow-500'
    case 'busy': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const getKycStatusColor = (status: string) => {
  switch (status) {
    case 'verified': return 'text-green-400'
    case 'pending': return 'text-yellow-400'
    default: return 'text-red-400'
  }
}

const getKycStatusIcon = (status: string) => {
  switch (status) {
    case 'verified': return <div className="w-2 h-2 bg-green-400 rounded-full" />
    case 'pending': return <div className="w-2 h-2 bg-yellow-400 rounded-full" />
    default: return <div className="w-2 h-2 bg-red-400 rounded-full" />
  }
}

interface UserAvatarGridProps {
  users: User[]
}

interface UserAvatarProps {
  user: User
  onCardToggle: (user: User | null) => void
  isCardOpen: boolean
  onSocialSelect?: (social: { platform: string; username: string; url: string }) => void
}

function UserAvatar({ user, onCardToggle, isCardOpen, onSocialSelect }: UserAvatarProps) {
  const isMobile = useIsMobile()
  const [showCard, setShowCard] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'idle':
        return 'bg-yellow-500'
      case 'dnd':
        return 'bg-red-500'
      case 'offline':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }



  const handleClick = () => {
    if (isMobile) {
      onCardToggle(isCardOpen ? null : user)
    }
  }

  const handleMouseEnter = () => {
    if (!isMobile) {
      setShowCard(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowCard(false)
    }
  }

  return (
    <div className="relative group">
      {/* Stacked Avatar Container */}
      <div
        className="relative cursor-pointer transform transition-all duration-300 hover:scale-110 hover:z-10"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
          {/* Main Avatar */}
          <div className="relative">
            <Avatar className="h-20 w-20 bg-blue-100 ring-2 ring-[#4DA2FF]/30 hover:ring-[#4DA2FF] transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#4DA2FF]/20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-[#4DA2FF] text-white text-lg font-semibold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Status Indicator */}
            <div className={cn(
              "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#030f1c] flex items-center justify-center transition-all duration-300",
              getStatusColor(user.status)
            )}>
              <div className="w-3 h-3 rounded-full bg-white/90" />
            </div>


          </div>

          {/* Hover/Active Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-[#4DA2FF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md -z-10" />
        </div>

        {/* Social Media Icons - Under Avatar */}
        {user.socialMedia && user.socialMedia.length > 0 && (
          <div className={cn("flex justify-center mt-1", isMobile ? "gap-0" : "gap-1")}>
            {user.socialMedia
              .filter(social => social.connected)
              .map((social, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center justify-center hover:scale-110 transition-transform cursor-pointer",
                        isMobile ? "w-[1.8rem] h-[1.8rem]" : "w-4 h-4"
                      )}
                      onClick={(e) => {
                        if (isMobile && onSocialSelect) {
                          e.stopPropagation()
                          // Close user card first, then show social popup
                          onCardToggle(null)
                          setTimeout(() => {
                            onSocialSelect({
                              platform: social.platform,
                              username: social.username || 'Connected',
                              url: social.url
                            })
                          }, 100)
                        }
                      }}
                    >
                      <Image
                        src={social.image}
                        alt={social.platform}
                        width={isMobile ? 29 : 16}
                        height={isMobile ? 29 : 16}
                        className={cn(
                          "object-contain opacity-80 hover:opacity-100 transition-opacity",
                          isMobile ? "w-[1.8rem] h-[1.8rem]" : "w-4 h-4"
                        )}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    <div className="font-medium">{social.platform}</div>
                    <div className="text-[#C0E6FF]/70">{social.username}</div>
                  </TooltipContent>
                </Tooltip>
              ))}
          </div>
        )}



        {/* Floating User Card - Positioned Above Avatar */}
        {!isMobile && showCard && (
          <div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-30 animate-in fade-in-0 zoom-in-95 duration-200"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative max-w-sm">
              {/* Card Shadow/Glow Effect */}
              <div className="absolute inset-0 bg-[#4DA2FF]/20 rounded-lg blur-xl scale-110 pointer-events-none" />
              <div className="relative bg-[#030f1c] border border-[#C0E6FF]/20 rounded-lg p-3">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10 bg-blue-100">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-[#4DA2FF] text-white font-semibold text-sm">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-sm">{user.name}</h3>
                      <Badge className="bg-[#4DA2FF] text-white text-xs px-1 py-0">
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-[#C0E6FF] text-xs">{user.username}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="text-center p-1 bg-[#1a2f51]/50 rounded">
                    <div className="text-[#4DA2FF] text-xs">Level</div>
                    <div className="text-white font-bold text-sm">{user.level}</div>
                  </div>
                  <div className="text-center p-1 bg-[#1a2f51]/50 rounded">
                    <div className={cn("text-xs", getKycStatusColor(user.kycStatus))}>KYC</div>
                    <div className="text-white font-bold text-xs">{user.kycStatus === 'verified' ? '✓' : '✗'}</div>
                  </div>
                </div>

                {/* Achievements Section */}
                {user.achievements && user.achievements.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[#C0E6FF] text-xs font-medium">Achievements</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#4DA2FF] hover:text-[#4DA2FF]/80 text-xs h-5 px-1"
                        onClick={() => {
                          // TODO: Navigate to user profile page
                          console.log('Navigate to profile:', user.id)
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        See More
                      </Button>
                    </div>
                    <div className="flex gap-1 justify-center">
                      {user.achievements
                        .filter(achievement => achievement.unlocked)
                        .slice(0, 5)
                        .map((achievement, index) => {
                          const customImage = getAchievementImage(achievement.name)
                          return (
                            <Tooltip key={index}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                                  {customImage ? (
                                    <Image
                                      src={customImage}
                                      alt={achievement.name}
                                      width={32}
                                      height={32}
                                      className="w-8 h-8 object-contain"
                                    />
                                  ) : achievement.image ? (
                                    <Image
                                      src={achievement.image}
                                      alt={achievement.name}
                                      width={32}
                                      height={32}
                                      className="w-8 h-8 object-contain"
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full" style={{ backgroundColor: achievement.color }} />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                <div className="font-medium">{achievement.name}</div>
                                <div className="text-[#C0E6FF]/70">{achievement.tooltip}</div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}
                    </div>
                  </div>
                )}



                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white text-xs h-7">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline" className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#4DA2FF]/10 text-xs h-7">
                    <UserPlus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {/* Arrow pointing to avatar */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#030f1c]"></div>
              </div>
            </div>
          </div>
        )}


    </div>
  )
}

export function UserAvatarGrid({ users }: UserAvatarGridProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [hoveredUser, setHoveredUser] = useState<User | null>(null)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const [selectedSocial, setSelectedSocial] = useState<{
    platform: string
    username: string
    url: string
  } | null>(null)
  const isMobile = useIsMobile()

  const handleCardToggle = (user: User | null) => {
    if (isMobile) {
      setSelectedUser(user)
    } else {
      // Clear any existing timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
        setHoverTimeout(null)
      }

      if (user) {
        setHoveredUser(user)
      } else {
        // Add a small delay before hiding to allow moving to the card
        const timeout = setTimeout(() => {
          setHoveredUser(null)
        }, 100)
        setHoverTimeout(timeout)
      }
    }
  }

  const handleCardHover = (isEntering: boolean) => {
    if (!isMobile) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
        setHoverTimeout(null)
      }

      if (!isEntering) {
        // Add delay when leaving the card
        const timeout = setTimeout(() => {
          setHoveredUser(null)
        }, 100)
        setHoverTimeout(timeout)
      }
    }
  }

  const closeCard = () => {
    setSelectedUser(null)
    setHoveredUser(null)
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
    }
  }, [hoverTimeout])

  const displayedUser = isMobile ? selectedUser : hoveredUser

  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={100}>
      <div className="relative">
        {/* Avatar Grid */}
        <div className="enhanced-card">
        <div className="enhanced-card-content">
          {/* Grid Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#4DA2FF] rounded-full animate-pulse" />
              <span className="text-[#C0E6FF] text-sm font-medium">
                {users.length} AIO Connect Member{users.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-[#C0E6FF]/60">
              {isMobile ? 'Tap avatars for details' : 'Hover avatars for details'}
            </div>
          </div>

          {/* Stacked Avatar Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3 justify-items-center">
            {users.map((user, index) => (
              <div
                key={user.id}
                className="animate-in fade-in-0 zoom-in-95"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                <UserAvatar
                  user={user}
                  onCardToggle={handleCardToggle}
                  isCardOpen={displayedUser?.id === user.id}
                  onSocialSelect={setSelectedSocial}
                />
              </div>
            ))}
          </div>

          {/* Grid Footer */}
          <div className="mt-8 pt-4 border-t border-[#C0E6FF]/10">
            <div className="flex items-center justify-center gap-4 text-xs text-[#C0E6FF]/50">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Online</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Away</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>Busy</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                <span>Offline</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating User Card - Desktop Hover */}
      {!isMobile && hoveredUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            className="pointer-events-auto max-w-sm animate-in fade-in-0 zoom-in-95 duration-200"
            data-floating-card="true"
            onMouseEnter={() => handleCardHover(true)}
            onMouseLeave={() => handleCardHover(false)}
          >
            <div className="relative">
              {/* Card Shadow/Glow Effect */}
              <div className="absolute inset-0 bg-[#4DA2FF]/20 rounded-lg blur-xl scale-110 pointer-events-none" />
              <div className="relative">
                <UserCard user={hoveredUser} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal User Card - Mobile Click */}
      {isMobile && selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-in fade-in-0 duration-300"
          onClick={closeCard}
        >
          <div
            className="relative w-72 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeCard}
              className="absolute top-2 right-2 z-10 bg-[#1a2f51] hover:bg-[#4DA2FF] text-white rounded-full p-2 transition-colors duration-200 shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Card Shadow/Glow Effect */}
            <div className="absolute inset-0 bg-[#4DA2FF]/20 rounded-lg blur-xl scale-110 pointer-events-none" />
            <div className="relative bg-[#030f1c] border border-[#C0E6FF]/20 rounded-lg p-4">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-12 w-12 bg-blue-100">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback className="bg-[#4DA2FF] text-white font-semibold">
                    {selectedUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-sm">{selectedUser.name}</h3>
                    <Badge className="bg-[#4DA2FF] text-white text-xs px-1 py-0">
                      {selectedUser.role}
                    </Badge>
                  </div>
                  <p className="text-[#C0E6FF] text-xs">{selectedUser.username}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center p-1 bg-[#1a2f51]/50 rounded">
                  <div className="text-[#4DA2FF] text-xs">Level</div>
                  <div className="text-white font-bold text-sm">{selectedUser.level}</div>
                </div>
                <div className="text-center p-1 bg-[#1a2f51]/50 rounded">
                  <div className={cn("text-xs", getKycStatusColor(selectedUser.kycStatus))}>KYC</div>
                  <div className="text-white font-bold text-xs">{selectedUser.kycStatus === 'verified' ? '✓' : '✗'}</div>
                </div>
              </div>

              {/* Status & KYC */}
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-1">
                  <div className={cn("w-2 h-2 rounded-full", getStatusColor(selectedUser.status))} />
                  <span className="text-white capitalize">{selectedUser.status}</span>
                </div>
                <div className="flex items-center gap-1">
                  {getKycStatusIcon(selectedUser.kycStatus)}
                  <span className={cn("font-medium", getKycStatusColor(selectedUser.kycStatus))}>
                    KYC {selectedUser.kycStatus === 'verified' ? 'Verified' : selectedUser.kycStatus === 'pending' ? 'Pending' : 'Required'}
                  </span>
                </div>
              </div>

              {/* Achievements Section */}
              {selectedUser.achievements && selectedUser.achievements.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[#C0E6FF] text-xs font-medium">Achievements</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#4DA2FF] hover:text-[#4DA2FF]/80 text-xs h-5 px-1"
                      onClick={() => {
                        // TODO: Navigate to user profile page
                        console.log('Navigate to profile:', selectedUser.id)
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      See More
                    </Button>
                  </div>
                  <div className="flex gap-1 justify-center">
                    {selectedUser.achievements
                      .filter(achievement => achievement.unlocked)
                      .slice(0, 5)
                      .map((achievement, index) => {
                        const customImage = getAchievementImage(achievement.name)
                        return (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                                {customImage ? (
                                  <Image
                                    src={customImage}
                                    alt={achievement.name}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 object-contain"
                                  />
                                ) : achievement.image ? (
                                  <Image
                                    src={achievement.image}
                                    alt={achievement.name}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 object-contain"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full" style={{ backgroundColor: achievement.color }} />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                              <div className="font-medium">{achievement.name}</div>
                              <div className="text-[#C0E6FF]/70">{achievement.tooltip}</div>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white text-xs h-7">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Message
                </Button>
                <Button size="sm" variant="outline" className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#4DA2FF]/10 text-xs h-7">
                  <UserPlus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Social Media Popup - Rendered AFTER user card to ensure higher z-index */}
      {isMobile && selectedSocial && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in-0 duration-300"
          onClick={() => setSelectedSocial(null)}
        >
          <div
            className="relative w-72 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedSocial(null)}
              className="absolute top-2 right-2 z-10 bg-[#1a2f51] hover:bg-[#4DA2FF] text-white rounded-full p-2 transition-colors duration-200 shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Card Shadow/Glow Effect */}
            <div className="absolute inset-0 bg-[#4DA2FF]/20 rounded-lg blur-xl scale-110 pointer-events-none" />
            <div className="relative bg-[#030f1c] border border-[#C0E6FF]/20 rounded-lg p-6">
              {/* Content */}
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-[#1a2f51]/50 rounded-full flex items-center justify-center">
                    {selectedSocial.platform === 'discord' && <MessageSquare className="w-8 h-8 text-[#5865F2]" />}
                    {selectedSocial.platform === 'telegram' && <Send className="w-8 h-8 text-[#0088cc]" />}
                    {selectedSocial.platform === 'x' && (
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-lg">𝕏</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1 capitalize">{selectedSocial.platform}</h3>
                  <p className="text-[#C0E6FF] text-sm">@{selectedSocial.username}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      window.open(selectedSocial.url, '_blank')
                      setSelectedSocial(null)
                    }}
                    className="flex-1 bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Profile
                  </Button>
                  <Button
                    onClick={() => setSelectedSocial(null)}
                    variant="outline"
                    className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#4DA2FF]/10"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      </div>
    </TooltipProvider>
  )
}
