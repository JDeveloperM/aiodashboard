"use client"

import { useState } from 'react'
import Image from 'next/image'
import {
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Calendar,
  Activity,
  Trophy,
  Star,
  Copy,
  ExternalLink,
  Share2,
  Link,
  Lock,
  Coins,
  Hash
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { RoleImage } from '@/components/ui/role-image'
import { EnhancedAvatar } from '@/components/enhanced-avatar'
import { EnhancedBanner } from '@/components/enhanced-banner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'

// Helper functions for channel display (same as main profile)
export function getChannelTypeBadgeColor(type: string) {
  switch (type) {
    case 'free': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'premium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'vip': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

export function formatSubscriptionStatus(channel: any) {
  if (!channel.isActive) return 'Expired'
  if (channel.type === 'free') return 'Active'
  if (channel.daysRemaining !== undefined) {
    return channel.daysRemaining > 0 ? `${channel.daysRemaining} days left` : 'Expires today'
  }
  return 'Active'
}

// Achievement image mapping function - Same as your profile
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
    "Mint Royal NFT Status": "/images/achievements/Elite ROYAL Network.png",
    "Upgrade to PRO": "/images/achievements/Expand Your PRO Network.png",
    "Upgrade to ROYAL": "/images/achievements/Elite ROYAL Network.png",

    // Referral Tiers Category
    "Recruit PRO NFT Holders": "/images/achievements/Recruit PRO NFT Holders.png",
    "Royal NFT Ambassadors": "/images/achievements/Royal NFT Ambassadors.png",
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

interface PublicProfileData {
  address: string
  username: string
  profileImageUrl: string | null
  bannerImageUrl: string | null
  roleTier: 'NOMAD' | 'PRO' | 'ROYAL'
  profileLevel: number
  currentXp: number
  totalXp: number
  kycStatus: string
  joinDate: string
  lastActive: string
  achievementsData: any[]
  isVerified: boolean
  memberSince: string
  socialLinks: any[]
  channelsJoined: any[]
  xpProgress: {
    current: number
    required: number
    percentage: number
  } | null
}

interface PublicProfileViewProps {
  profileData: PublicProfileData
}

export function PublicProfileView({ profileData }: PublicProfileViewProps) {
  const [imageError, setImageError] = useState(false)

  // Convert user's social links to display format
  const convertSocialLinksToUI = (socialLinks: any[]) => {
    const defaultSocials = [
      {
        platform: "Discord",
        image: "/images/social/discord.png",
        url: "",
        connected: false,
        username: "",
        color: "#5865F2"
      },
      {
        platform: "Telegram",
        image: "/images/social/telegram.png",
        url: "",
        connected: false,
        username: "",
        color: "#0088CC"
      },
      {
        platform: "X",
        image: "/images/social/x.png",
        url: "",
        connected: false,
        username: "",
        color: "#000000"
      }
    ]

    if (socialLinks && Array.isArray(socialLinks)) {
      socialLinks.forEach(link => {
        const social = defaultSocials.find(s =>
          s.platform.toLowerCase() === link.platform?.toLowerCase() ||
          (link.platform === 'x' && s.platform === 'X')
        )
        if (social && link.username) {
          social.connected = true
          social.username = link.username
          social.url = link.url || social.url
        }
      })
    }

    return defaultSocials
  }

  // Profile display data with actual user social links
  const profileDisplayData = {
    name: profileData.username,
    socialMedia: convertSocialLinksToUI(profileData.socialLinks || []),
    levelInfo: {
      currentLevel: profileData.profileLevel || 1,
      nextLevel: (profileData.profileLevel || 1) + 1,
      currentXP: profileData.currentXp || 0,
      nextLevelXP: getXpRequiredForLevel((profileData.profileLevel || 1) + 1),
      totalXP: profileData.totalXp || 0
    },
    kycStatus: profileData.isVerified ? "verified" : "not_verified"
  }

  // Level rewards data (same as your profile)
  const levelRewards = [
    { level: 1, points: 0, available: true, claimed: true, description: "Starting level - Affiliate Level 1" },
    { level: 2, points: 0, available: profileDisplayData.levelInfo.currentLevel >= 2, claimed: profileDisplayData.levelInfo.currentLevel >= 2, description: "Unlock 2nd Affiliate Level" },
    { level: 3, points: 0, available: profileDisplayData.levelInfo.currentLevel >= 3, claimed: profileDisplayData.levelInfo.currentLevel >= 3, description: "Unlock 3rd Affiliate Level" },
    { level: 4, points: 0, available: profileDisplayData.levelInfo.currentLevel >= 4, claimed: profileDisplayData.levelInfo.currentLevel >= 4, description: "Unlock 4th Affiliate Level" },
    { level: 5, points: 0, available: profileDisplayData.levelInfo.currentLevel >= 5, claimed: profileDisplayData.levelInfo.currentLevel >= 5, description: "Unlock 5th Affiliate Level (Max)" },
    { level: 6, points: 500, available: profileDisplayData.levelInfo.currentLevel >= 6, claimed: profileDisplayData.levelInfo.currentLevel >= 6, description: "Earn 500 Points" },
    { level: 7, points: 2000, available: profileDisplayData.levelInfo.currentLevel >= 7, claimed: profileDisplayData.levelInfo.currentLevel >= 7, description: "Earn 2,000 Points" },
    { level: 8, points: 6000, available: profileDisplayData.levelInfo.currentLevel >= 8, claimed: profileDisplayData.levelInfo.currentLevel >= 8, description: "Earn 6,000 Points + Bybit Partner" },
    { level: 9, points: 15000, available: profileDisplayData.levelInfo.currentLevel >= 9, claimed: profileDisplayData.levelInfo.currentLevel >= 9, description: "Earn 15,000 Points" },
    { level: 10, points: 35000, available: profileDisplayData.levelInfo.currentLevel >= 10, claimed: profileDisplayData.levelInfo.currentLevel >= 10, description: "Earn 35,000 Points" }
  ]

  // Mock achievements data (same structure as your profile)
  const achievements = profileData.achievementsData || []

  // Helper function for XP requirements
  function getXpRequiredForLevel(level: number): number {
    const xpRequirements = [0, 100, 250, 500, 800, 1200, 1800, 2600, 3600, 5000]
    return xpRequirements[level] || 5000
  }

  return (
    <div className="space-y-6">
      {/* User Profile Section - Exact same as your profile */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Profile Info - Takes 2/3 width */}
            <div className="lg:col-span-2 enhanced-card bg-[#030f1c] border border-[#C0E6FF]/20 m-2 overflow-hidden">
              {/* Banner Image Section */}
              <div className="relative rounded-t-lg overflow-hidden">
                <div className="w-full h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  {profileData.bannerImageUrl ? (
                    <img
                      src={profileData.bannerImageUrl}
                      alt="Profile banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">No banner image</div>
                  )}
                </div>

                {/* Avatar positioned on left side of banner - Twice the size */}
                <div className="absolute bottom-4 left-6">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#C0E6FF]/20 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    {profileData.profileImageUrl && !imageError ? (
                      <img
                        src={profileData.profileImageUrl}
                        alt={`${profileData.username}'s profile`}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-24 h-24 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Media Icons - Positioned at top right of banner */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                  {profileDisplayData.socialMedia.map((social: any, index: number) => (
                    <Button
                      key={index}
                      size="sm"
                      variant={social.connected ? "default" : "outline"}
                      className={`w-12 h-12 p-0 transition-all duration-200 ${social.connected
                        ? "text-white border-[#7dffae63] backdrop-blur-sm"
                        : "border-[#C0E6FF]/50 text-[#C0E6FF] hover:bg-[#C0E6FF]/10 hover:border-[#C0E6FF] bg-transparent opacity-50 cursor-not-allowed"
                      }`}
                      style={social.connected ? { backgroundColor: '#7dffae63' } : {}}
                      onMouseEnter={(e) => {
                        if (social.connected) {
                          e.currentTarget.style.backgroundColor = '#7dffae88'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (social.connected) {
                          e.currentTarget.style.backgroundColor = '#7dffae63'
                        }
                      }}
                      onClick={() => {
                        if (social.connected && social.url) {
                          window.open(social.url, '_blank')
                        }
                      }}
                      disabled={!social.connected}
                    >
                      <Image
                        src={social.image}
                        alt={social.platform}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                      />
                    </Button>
                  ))}
                </div>

                {/* Status - Positioned at bottom right of banner (removed level) */}
                <div className="absolute bottom-4 right-4 flex flex-wrap items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                  <Badge className="bg-[#3b82f6] text-white text-xs px-2 py-1 h-8 flex items-center">
                    <div className="flex items-center gap-1">
                      <RoleImage role={profileData.roleTier as "NOMAD" | "PRO" | "ROYAL"} size="md" />
                      {profileData.roleTier}
                    </div>
                  </Badge>
                </div>
              </div>

              {/* Username below banner */}
              <div className="px-4 md:px-8 py-4 bg-[#1a2f51] border border-[#C0E6FF]/20 rounded-b-lg">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div className="flex flex-col justify-center">
                    {/* Username and Profile Details - Same Line */}
                    <div className="flex flex-wrap items-center gap-4 border border-[#C0E6FF]/10 rounded-lg px-3 py-2">
                      {/* Username */}
                      <div className="flex items-center gap-2">
                        <img
                          src="/images/animepfp/AIONETmin.png"
                          alt="AIONET"
                          className="w-6 h-6 object-contain"
                        />
                        <h2 className="text-lg md:text-xl font-bold text-white">{profileDisplayData.name}</h2>
                      </div>

                      {/* Profile Details - Same Line */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {/* Verification Status */}
                        <div className="flex items-center gap-2">
                          {profileData.isVerified ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400">Verified</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400">Unverified</span>
                            </>
                          )}
                        </div>

                        {/* Join Date */}
                        {profileData.memberSince && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-400">Joined {profileData.memberSince}</span>
                          </div>
                        )}

                        {/* Profile Level */}
                        {profileData.profileLevel && (
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-400">Profile Level {profileData.profileLevel}</span>
                          </div>
                        )}

                        {/* Affiliate Level */}
                        {profileData.profileLevel && (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-purple-400" />
                            <span className="text-gray-400">
                              Affiliate Level {Math.min(profileData.profileLevel, 5)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Channels Joined */}
            <div className="lg:col-span-1 enhanced-card bg-[#030f1c] border border-[#C0E6FF]/20 rounded-lg m-2">
              <div className="flex flex-col h-full">
                {/* Channels Joined Section - Clean layout without inner border */}
                <div className="w-full flex-1 p-6 pb-4">
                  <h4 className="text-white font-semibold mb-6">Channels Joined</h4>

                  {/* Channels Display */}
                  <div className="space-y-3">
                    {profileData.channelsJoined && profileData.channelsJoined.length > 0 ? (
                      <div className="grid grid-cols-5 gap-3 justify-items-center">
                        {profileData.channelsJoined.slice(0, 25).map((channel: any) => (
                          <Tooltip key={channel.id}>
                            <TooltipTrigger asChild>
                              <div className="w-16 h-16 rounded-full cursor-pointer transition-all hover:scale-110 border-2 border-[#C0E6FF]/20 hover:border-[#C0E6FF]/40 overflow-hidden">
                                {channel.avatarUrl ? (
                                  <Image
                                    src={channel.avatarUrl}
                                    alt={channel.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ backgroundColor: channel.color }}
                                  >
                                    <Hash className="w-8 h-8 text-white" />
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1a2f51] border border-[#C0E6FF]/20 text-white p-3 max-w-xs">
                              <div className="space-y-2">
                                <div className="font-semibold text-sm">{channel.name}</div>
                                {channel.description && (
                                  <div className="text-xs text-[#C0E6FF]/80">{channel.description}</div>
                                )}
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge className={`${getChannelTypeBadgeColor(channel.type)} text-xs`}>
                                    {channel.type.toUpperCase()}
                                  </Badge>
                                  <span className="text-[#C0E6FF]">
                                    {formatSubscriptionStatus(channel)}
                                  </span>
                                </div>
                                <div className="text-xs text-[#C0E6FF]">
                                  {channel.subscribers.toLocaleString()} subscribers
                                </div>
                                <div className="text-xs text-[#C0E6FF]/60">
                                  Joined: {new Date(channel.joinedDate).toLocaleDateString()}
                                </div>
                                {channel.expiryDate && (
                                  <div className="text-xs text-[#C0E6FF]/60">
                                    Expires: {new Date(channel.expiryDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {profileData.channelsJoined.length > 25 && (
                          <div className="col-span-1 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-[#1a2f51] border-2 border-[#C0E6FF]/20 flex items-center justify-center cursor-pointer hover:border-[#C0E6FF]/40 transition-all">
                              <span className="text-[#C0E6FF] text-xs font-medium">+{profileData.channelsJoined.length - 25}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Hash className="w-8 h-8 text-[#C0E6FF]/50 mx-auto mb-2" />
                        <div className="text-[#C0E6FF]/70 text-sm mb-2">No channels joined</div>
                        <div className="text-[#C0E6FF]/50 text-xs">
                          This user hasn't joined any channels yet
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section - Exact same as your profile */}
      {profileData.achievementsData && (
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <h3 className="text-white font-semibold mb-4 text-center">Achievements</h3>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2 md:gap-3">
              {achievements.map((achievement: any, index: number) => {
                const isLocked = !achievement.unlocked && !achievement.claimed
                const canClaim = achievement.unlocked && !achievement.claimed

                const achievementCard = (
                  <div
                    key={index}
                    className={`flex flex-col items-center ${achievement.claimed ? 'justify-center' : 'justify-between'} gap-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer group relative min-h-[120px] ${
                      isLocked
                        ? 'bg-[#030f1c] border-[#C0E6FF]/10 opacity-60'
                        : achievement.claimed
                        ? 'bg-[#1a2f51] border-green-500/30 opacity-80'
                        : 'bg-[#1a2f51] border-[#C0E6FF]/20 hover:border-[#C0E6FF]/40'
                    }`}
                  >
                    {/* Claimed badge */}
                    {achievement.claimed && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}

                    {/* Icon - centered for claimed, at top for others */}
                    <div className={`flex items-center justify-center transition-transform duration-200 ${
                      !isLocked ? 'group-hover:scale-110' : ''
                    } ${achievement.claimed ? 'flex-1' : ''}`}>
                      {isLocked ? (
                        <div
                          className="p-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${achievement.color || '#6B7280'}20` }}
                        >
                          <Lock
                            className="w-8 h-8"
                            style={{ color: '#6B7280' }}
                          />
                        </div>
                      ) : (() => {
                        // Check if achievement has a custom image path (for social media achievements)
                        if (achievement.image) {
                          return (
                            <Image
                              src={achievement.image}
                              alt={achievement.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-contain"
                            />
                          )
                        }

                        // Check for custom achievement images using the same function as your profile
                        const customImage = getAchievementImage(achievement.name)
                        if (customImage) {
                          return (
                            <Image
                              src={customImage}
                              alt={achievement.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-contain"
                            />
                          )
                        } else if (achievement.icon && typeof achievement.icon === 'function') {
                          const Icon = achievement.icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>
                          return (
                            <div
                              className="p-4 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${achievement.color}20` }}
                            >
                              <Icon
                                className="w-8 h-8"
                                style={{ color: achievement.color }}
                              />
                            </div>
                          )
                        } else {
                          // Fallback for achievements without icons
                          return (
                            <div
                              className="p-4 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${achievement.color}20` }}
                            >
                              <div
                                className="w-8 h-8 rounded-full"
                                style={{ backgroundColor: achievement.color }}
                              />
                            </div>
                          )
                        }
                      })()}
                    </div>

                    {/* Text below icon - only show if not claimed */}
                    {!achievement.claimed && (
                      <div className="text-center flex-1 flex items-center justify-center">
                        <span className={`text-xs font-medium leading-tight ${
                          isLocked ? 'text-[#6B7280]' : 'text-[#C0E6FF]'
                        }`}>
                          {achievement.name}
                        </span>
                      </div>
                    )}

                    {/* No claim button for public view */}
                  </div>
                )

                return achievementCard
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
