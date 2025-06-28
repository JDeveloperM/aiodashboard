"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useRouter } from "next/navigation"
import ReactCountryFlag from "react-country-flag"
import { getCountryCodeByName } from "@/lib/locations"
import { forumUserService, ForumUserData } from "@/lib/forum-user-service"

interface ForumUserTooltipProps {
  children: React.ReactNode
  userAddress: string
  username?: string
  avatar?: string
  tier?: string
}

export function ForumUserTooltip({
  children,
  userAddress,
  username,
  avatar,
  tier = 'NOMAD'
}: ForumUserTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [userData, setUserData] = useState<ForumUserData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Fetch user data when tooltip is shown
  useEffect(() => {
    if (showTooltip && !userData && !isLoading) {
      setIsLoading(true)
      forumUserService.getUserData(userAddress)
        .then(data => {
          setUserData(data)
        })
        .catch(error => {
          console.error('Error fetching user data for tooltip:', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [showTooltip, userAddress, userData, isLoading])

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation()
    let identifier = userData?.name || username || userAddress
    if (identifier) {
      if (identifier.startsWith('@')) {
        identifier = identifier.slice(1)
      }
      router.push(`/profile/${encodeURIComponent(identifier)}`)
    }
  }

  // Use fetched data or fallback to props
  const displayData = userData || {
    address: userAddress,
    name: username || `User ${userAddress.slice(0, 6)}`, // Display name
    username: username ? `@${username.toLowerCase().replace(/\s+/g, '_')}` : `@${userAddress.slice(0, 8)}`, // @handle
    avatar: avatar,
    tier: tier,
    level: 1,
    kycStatus: 'unverified',
    socialMedia: [],
    achievements: [],
    postCount: 0,
    replyCount: 0
  }

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-red-400'
    }
  }



  const getAchievementImage = (achievementName: string): string | null => {
    const imageMap: { [key: string]: string } = {
      // Profile/KYC Category
      "Personalize Your Profile": "/images/achievements/Personalize Your Profile.png",
      "Unlock Full Access": "/images/achievements/Unlock Full Access.png",
      "Advanced User Status": "/images/achievements/Advanced User Status.png",

      // Social Connections Category
      "Join the Community": "/images/achievements/Join the Community.png",
      "Stay Informed": "/images/achievements/Stay Informed.png",
      "Follow the Conversation": "/images/achievements/Follow the Conversation.png",

      // Crypto Bot Activities Category
      "Automate Your Trades": "/images/achievements/Automate Your Trades.png",
      "APLN Trading Signals": "/images/achievements/APLN Trading Signals.png",
      "HRMS Trading Insights": "/images/achievements/HRMS Trading Insights.png",
      "ATHN Trading Edge": "/images/achievements/ATHN Trading Edge.png",
      "Master Trading Cycles": "/images/achievements/Master Trading Cycles.png",

      // User Upgrades Category
      "Mint Royal NFT Status": "/images/achievements/Elite ROYAL Network.png", // Using Elite ROYAL Network icon
      "Upgrade to PRO": "/images/achievements/Expand Your PRO Network.png",
      "Upgrade to ROYAL": "/images/achievements/Elite ROYAL Network.png",

      // Referral Tiers Category
      "Recruit PRO NFT Holders": "/images/achievements/Expand Your PRO Network.png",
      "Royal NFT Ambassadors": "/images/achievements/Elite ROYAL Network.png",
      "Build a NOMAD Network": "/images/achievements/Build a NOMAD Network.png",
      "Expand Your PRO Network": "/images/achievements/Expand Your PRO Network.png",
      "Elite ROYAL Network": "/images/achievements/Elite ROYAL Network.png",
      "Mentor Level 5 Users": "/images/achievements/Mentor Level 5 Users.png",
      "Scale Level 5 Mentorship": "/images/achievements/Scale Level 5 Mentorship.png",
      "Guide to Level 7": "/images/achievements/Guide to Level 7.png",
      "Lead to Level 9": "/images/achievements/Lead to Level 9.png"
    }

    return imageMap[achievementName] || null
  }

  return (
    <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
      <TooltipTrigger asChild>
        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent
        className="p-0 border-0 bg-transparent"
        side="top"
        align="center"
        sideOffset={8}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div
          className="relative w-64 max-h-80"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Card Shadow/Glow Effect */}
          <div className="absolute inset-0 bg-[#4DA2FF]/20 rounded-lg blur-xl scale-110 pointer-events-none" />
          <div className="relative bg-[#030f1c] border border-[#C0E6FF]/20 rounded-lg p-3 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-10 w-10 bg-blue-100">
                <AvatarImage src={displayData.avatar} alt={displayData.name || 'User'} />
                <AvatarFallback className="bg-[#4DA2FF] text-white font-semibold text-sm">
                  {displayData.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-sm">
                    {displayData.name}
                  </h3>
                  {displayData.location && getCountryCodeByName(displayData.location) && (
                    <ReactCountryFlag
                      countryCode={getCountryCodeByName(displayData.location)!}
                      svg
                      style={{
                        width: '1em',
                        height: '1em',
                      }}
                      title={displayData.location}
                    />
                  )}
                  {/* View Profile Button */}
                  <Button
                    onClick={handleViewProfile}
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#4DA2FF]/10 hover:border-[#4DA2FF]/50 bg-transparent"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
                <p className="text-[#C0E6FF] text-xs mb-1">
                  {displayData.username}
                </p>

                {/* Social Media Icons */}
                {displayData.socialMedia && displayData.socialMedia.length > 0 && (
                  <div className="flex gap-1">
                    {displayData.socialMedia
                      .filter(social => social.connected)
                      .map((social, index) => (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                              <Image
                                src={social.image}
                                alt={social.platform}
                                width={16}
                                height={16}
                                className="w-4 h-4 object-contain opacity-80 hover:opacity-100 transition-opacity"
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
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="text-center p-1 bg-[#1a2f51]/50 rounded">
                <div className="text-[#4DA2FF] text-xs">Level</div>
                <div className="text-white font-bold text-sm">{displayData.level}</div>
              </div>
              <div className="text-center p-1 bg-[#1a2f51]/50 rounded">
                <div className={cn("text-xs", getKycStatusColor(displayData.kycStatus || 'unverified'))}>KYC</div>
                <div className="text-white font-bold text-xs">{displayData.kycStatus === 'verified' ? '✓' : '✗'}</div>
              </div>
            </div>

            {/* Forum Stats */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="text-center p-1 bg-[#1a2f51]/50 rounded">
                <div className="text-[#4DA2FF] text-xs">Posts</div>
                <div className="text-white font-bold text-sm">{displayData.postCount}</div>
              </div>
              <div className="text-center p-1 bg-[#1a2f51]/50 rounded">
                <div className="text-[#4DA2FF] text-xs">Replies</div>
                <div className="text-white font-bold text-sm">{displayData.replyCount}</div>
              </div>
            </div>

            {/* Achievements Section */}
            {displayData.achievements && displayData.achievements.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-[#C0E6FF] text-xs font-medium">Achievements ({displayData.achievements.length})</span>
                </div>
                <div className="grid grid-cols-5 justify-items-center max-h-32 overflow-y-auto">
                  {displayData.achievements
                    .filter(achievement => achievement.unlocked)
                    .map((achievement, index) => {
                      const customImage = getAchievementImage(achievement.name)
                      return (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                              {(() => {
                                // Check if achievement has a custom image path (for social media achievements)
                                if (achievement.image) {
                                  return (
                                    <Image
                                      src={achievement.image}
                                      alt={achievement.name}
                                      width={32}
                                      height={32}
                                      className="w-8 h-8 object-contain"
                                    />
                                  )
                                }

                                // Check for custom achievement images
                                const customImage = getAchievementImage(achievement.name)
                                if (customImage) {
                                  return (
                                    <Image
                                      src={customImage}
                                      alt={achievement.name}
                                      width={32}
                                      height={32}
                                      className="w-8 h-8 object-contain"
                                    />
                                  )
                                } else {
                                  // Fallback for achievements without icons
                                  return (
                                    <div
                                      className="w-8 h-8 rounded-full"
                                      style={{ backgroundColor: achievement.color || '#4DA2FF' }}
                                    />
                                  )
                                }
                              })()}
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
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
