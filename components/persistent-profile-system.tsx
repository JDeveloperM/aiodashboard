"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoleImage } from "@/components/ui/role-image"
import { EnhancedAvatar } from "@/components/enhanced-avatar"
import { EnhancedBanner } from "@/components/enhanced-banner"
import { usePersistentProfile } from '@/hooks/use-persistent-profile'
import { useChannelSubscriptions, getChannelTypeBadgeColor, formatSubscriptionStatus } from '@/hooks/use-channel-subscriptions'
import { encryptedStorage } from '@/lib/encrypted-database-storage'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { useSubscription } from "@/contexts/subscription-context"
import { toast } from 'sonner'
import Image from "next/image"
import {
  CheckCircle2,
  AlertTriangle,
  History,
  Copy,
  ExternalLink,
  Users,
  Settings,
  Bot,
  Hash,
  Star,
  Lock,
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Trophy,
  Shield,
  Zap,
  User,
  Link,
  Repeat,
  Crown,
  X,
  TrendingUp,
  Target,
  Unlock,
  Gift,
  Coins
} from 'lucide-react'

// Social media image paths
const socialImages = {
  Discord: "/images/social/discord.png",
  Telegram: "/images/social/telegram.png",
  X: "/images/social/x.png"
}

// Achievement image mapping function - Updated with new hexagonal achievement icons
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

export function PersistentProfileSystem() {
  const router = useRouter()
  const { user } = useSuiAuth()
  const { tier, setTier } = useSubscription()
  const {
    profile,
    isLoading,
    error,
    isInitialized,
    updateProfile,
    updateKYCStatus,
    updateTier,
    claimAchievement,
    updateAchievements,
    clearError,
    refreshProfile
  } = usePersistentProfile()

  // State for UI interactions
  const [copied, setCopied] = useState(false)
  const [showClaimDialog, setShowClaimDialog] = useState(false)
  const [claimingAchievement, setClaimingAchievement] = useState<any>(null)
  const [isClaimingPoints, setIsClaimingPoints] = useState(false)
  const [mobileTooltipOpen, setMobileTooltipOpen] = useState<number | null>(null)
  const [showLevelClaimDialog, setShowLevelClaimDialog] = useState(false)
  const [claimingLevel, setClaimingLevel] = useState<any>(null)
  const [isClaimingLevelPoints, setIsClaimingLevelPoints] = useState(false)
  const [showProgressionModal, setShowProgressionModal] = useState(false)

  // Level rewards state - Updated according to new progression system
  const [levelRewards, setLevelRewards] = useState([
    { level: 2, points: 0, available: false, claimed: false, description: "No reward" },
    { level: 3, points: 0, available: false, claimed: false, description: "No reward" },
    { level: 4, points: 0, available: false, claimed: false, description: "Unlock 4th Affiliate Level" },
    { level: 5, points: 0, available: false, claimed: false, description: "Unlock 5th Affiliate Level" },
    { level: 6, points: 500, available: false, claimed: false, description: "Earn 500 Points" },
    { level: 7, points: 2000, available: false, claimed: false, description: "Earn 2,000 Points" },
    { level: 8, points: 6000, available: false, claimed: false, description: "Earn 6,000 Points + Bybit Partner" },
    { level: 9, points: 15000, available: false, claimed: false, description: "Earn 15,000 Points" },
    { level: 10, points: 35000, available: false, claimed: false, description: "Earn 35,000 Points" }
  ])

  // Affiliate link
  const affiliateLink = `https://aionet.com/ref/${user?.address?.slice(0, 8) || 'user'}`

  // Function to determine if achievement should be unlocked based on user activity
  const checkAchievementUnlocked = (achievementName: string): boolean => {
    switch (achievementName) {
      case "Personalize Your Profile":
        // Unlocked if user has uploaded a profile image
        return !!profile?.profile_image_blob_id

      case "Unlock Full Access":
        // Unlocked if user has completed KYC
        return profile?.kyc_status === 'verified'

      case "Advanced User Status":
        // Unlocked if user has reached level 5
        return (profile?.profile_level || 1) >= 5

      case "Join the Community":
        // Unlocked if user has connected Discord
        return profile?.social_links?.some((link: any) => link.platform === 'Discord') || false

      case "Stay Informed":
        // Unlocked if user has connected Telegram
        return profile?.social_links?.some((link: any) => link.platform === 'Telegram') || false

      case "Follow the Conversation":
        // Unlocked if user has connected X
        return profile?.social_links?.some((link: any) => link.platform === 'X') || false

      case "Mint Royal NFT Status":
        // Unlocked if user has ROYAL tier
        return profile?.role_tier === 'ROYAL'

      // For now, other achievements are locked until we have more user activity data
      default:
        return false
    }
  }

  // Create achievements with proper unlock status
  const createAchievements = () => {
    const baseAchievements = [
      // Profile & KYC Category - Updated with new names and XP values
      { name: "Personalize Your Profile", icon: User, color: "#4DA2FF", xp: 50, category: "Profile/KYC", tooltip: "Upload a profile picture to your account" },
      { name: "Unlock Full Access", icon: CheckCircle2, color: "#10B981", xp: 100, category: "Profile/KYC", tooltip: "Finish the KYC verification process" },
      { name: "Advanced User Status", icon: Star, color: "#FFD700", xp: 200, category: "Profile/KYC", tooltip: "Achieve profile level 5" },

      // Social Connections Category - Updated with new names and XP values
      { name: "Join the Community", image: socialImages.Discord, color: "#5865F2", xp: 50, category: "Social Connections", tooltip: "Link your Discord account" },
      { name: "Stay Informed", image: socialImages.Telegram, color: "#0088CC", xp: 50, category: "Social Connections", tooltip: "Link your Telegram account" },
      { name: "Follow the Conversation", image: socialImages.X, color: "#000000", xp: 50, category: "Social Connections", tooltip: "Link your X (Twitter) account" },

      // Crypto Bot Activities Category - Updated with new names and XP values
      { name: "Automate Your Trades", icon: Link, color: "#F7931A", xp: 150, category: "Crypto Bot Activities", tooltip: "Link your Bybit account" },
      { name: "APLN Trading Signals", icon: Bot, color: "#9333EA", xp: 100, category: "Crypto Bot Activities", tooltip: "Subscribe to the APLN Bot" },
      { name: "HRMS Trading Insights", icon: Bot, color: "#06B6D4", xp: 100, category: "Crypto Bot Activities", tooltip: "Subscribe to the HRMS Bot" },
      { name: "ATHN Trading Edge", icon: Bot, color: "#8B5CF6", xp: 100, category: "Crypto Bot Activities", tooltip: "Subscribe to the ATHN Bot" },
      { name: "Master Trading Cycles", icon: Repeat, color: "#10B981", xp: 200, category: "Crypto Bot Activities", tooltip: "Finish at least 3 trading cycles with platform bots" },

      // User Upgrades Category - Updated with new names and XP values
      { name: "Mint Royal NFT Status", icon: Crown, color: "#8B5CF6", xp: 300, category: "User Upgrades", tooltip: "Mint a Royal NFT to achieve elite status" },

      // Referral Tiers Category - Updated with new names and XP values
      { name: "Recruit PRO NFT Holders", icon: Users, color: "#3B82F6", xp: 250, category: "Referral Tiers", tooltip: "Refer 5 users to become PRO NFT holders" },
      { name: "Royal NFT Ambassadors", icon: Users, color: "#8B5CF6", xp: 300, category: "Referral Tiers", tooltip: "Refer 3 users to become ROYAL NFT holders" },
      { name: "Build a NOMAD Network", icon: Users, color: "#F59E0B", xp: 500, category: "Referral Tiers", tooltip: "Add 50 NOMAD users to your network" },
      { name: "Expand Your PRO Network", icon: Users, color: "#3B82F6", xp: 600, category: "Referral Tiers", tooltip: "Add 30 PRO users to your network" },
      { name: "Elite ROYAL Network", icon: Users, color: "#8B5CF6", xp: 700, category: "Referral Tiers", tooltip: "Add 30 ROYAL users to your network" },
      { name: "Mentor Level 5 Users", icon: Users, color: "#10B981", xp: 400, category: "Referral Tiers", tooltip: "Help 10 network users achieve profile level 5" },
      { name: "Scale Level 5 Mentorship", icon: Users, color: "#10B981", xp: 700, category: "Referral Tiers", tooltip: "Help 50 network users achieve profile level 5" },
      { name: "Guide to Level 7", icon: Users, color: "#F59E0B", xp: 600, category: "Referral Tiers", tooltip: "Help 20 network users achieve profile level 7" },
      { name: "Lead to Level 9", icon: Users, color: "#FFD700", xp: 800, category: "Referral Tiers", tooltip: "Help 5 network users achieve profile level 9" }
    ]

    // If we have saved achievements, merge them with base achievements
    if (profile?.achievements_data && profile.achievements_data.length > 0) {
      return baseAchievements.map((baseAchievement: any) => {
        const savedAchievement = profile.achievements_data.find((saved: any) => saved.name === baseAchievement.name)
        return {
          ...baseAchievement,
          unlocked: checkAchievementUnlocked(baseAchievement.name),
          claimed: savedAchievement?.claimed || false,
          claimed_at: savedAchievement?.claimed_at
        }
      })
    }

    // Otherwise, create fresh achievements with proper unlock status
    return baseAchievements.map((achievement: any) => ({
      ...achievement,
      unlocked: checkAchievementUnlocked(achievement.name),
      claimed: false
    }))
  }

  // Default profile data with persistent data overlay
  const profileData = {
    name: profile?.username || user?.username || "Affiliate User",
    username: profile?.username || user?.username || "@affiliate_user",
    kycStatus: profile?.kyc_status || "not_verified",
    socialMedia: profile?.social_links && profile.social_links.length > 0 ? profile.social_links : [
      {
        platform: "Discord",
        image: socialImages.Discord,
        url: "https://discord.gg/aionet",
        connected: true,
        username: "Affiliate#1234",
        color: "#5865F2"
      },
      {
        platform: "Telegram",
        image: socialImages.Telegram,
        url: "https://t.me/aionet",
        connected: true,
        username: "@affiliate_tg",
        color: "#0088CC"
      },
      {
        platform: "X",
        image: socialImages.X,
        url: "https://x.com/aionet",
        connected: false,
        username: "",
        color: "#000000"
      }
    ],
    levelInfo: {
      currentLevel: profile?.profile_level || 1,
      nextLevel: (profile?.profile_level || 1) + 1,
      currentXP: profile?.current_xp || 0,
      nextLevelXP: profile?.profile_level === 1 ? 100 :
                   profile?.profile_level === 2 ? 250 :
                   profile?.profile_level === 3 ? 500 :
                   profile?.profile_level === 4 ? 800 :
                   profile?.profile_level === 5 ? 1200 :
                   profile?.profile_level === 6 ? 1800 :
                   profile?.profile_level === 7 ? 2600 :
                   profile?.profile_level === 8 ? 3600 :
                   profile?.profile_level === 9 ? 5000 : 5000,
      totalXP: profile?.total_xp || 0
    },
    achievements: createAchievements()
  }

  // Update level rewards availability based on current level
  useEffect(() => {
    if (profile) {
      const currentLevel = profile.profile_level || 1
      // Use referral_data.level_rewards as temporary storage until we add proper column
      const claimedLevels = profile.referral_data?.level_rewards || []

      setLevelRewards(prev => prev.map((reward: any) => ({
        ...reward,
        available: currentLevel >= reward.level,
        claimed: claimedLevels.some((claimed: any) => claimed.level === reward.level)
      })))
    }
  }, [profile])

  // Synchronize tier between subscription context and persistent profile
  useEffect(() => {
    if (profile?.role_tier && profile.role_tier !== tier) {
      console.log(`🔄 Syncing tier: ${tier} -> ${profile.role_tier}`)
      setTier(profile.role_tier)
    }
  }, [profile?.role_tier, tier, setTier])

  // Helper functions
  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join AIONET',
        text: 'Join the AIONET community and start your Web3 journey!',
        url: affiliateLink
      })
    } else {
      handleCopyLink()
    }
  }

  const handleSocialConnect = (platform: string, url: string) => {
    window.open(url, '_blank')
  }

  // Check if device is mobile
  const isMobile = () => {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const handleMobileTooltipClick = (index: number, e: React.MouseEvent) => {
    if (isMobile()) {
      e.stopPropagation()
      setMobileTooltipOpen(mobileTooltipOpen === index ? null : index)
    }
  }

  const getRoleStatusColor = (tier: string) => {
    switch (tier) {
      case 'ROYAL': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
      case 'PRO': return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
      case 'NOMAD': return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const handleClaimAchievement = async (achievement: any) => {
    setClaimingAchievement(achievement)
    setShowClaimDialog(true)
  }

  const confirmClaimAchievement = async () => {
    if (!claimingAchievement || !profile) {
      console.error('Missing claimingAchievement or profile:', { claimingAchievement, profile })
      return
    }

    setIsClaimingPoints(true)

    try {
      console.log('🎯 Starting achievement claim process for:', claimingAchievement.name)

      // Simulate claim process delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))

      // First, ensure the achievement exists in the database
      let currentAchievements = profile.achievements_data || []
      console.log('📋 Current achievements in database:', currentAchievements.length)

      // Check if achievement already exists in database
      const existingAchievement = currentAchievements.find((a: any) => a.name === claimingAchievement.name)
      console.log('🔍 Existing achievement found:', !!existingAchievement)

      if (!existingAchievement) {
        console.log('➕ Adding new achievement to database...')
        // Add the achievement to the database first
        const newAchievement = {
          name: claimingAchievement.name,
          icon: claimingAchievement.icon,
          color: claimingAchievement.color,
          unlocked: true,
          claimed: false,
          xp: claimingAchievement.xp,
          tooltip: claimingAchievement.tooltip,
          category: claimingAchievement.category || 'General'
        }

        currentAchievements = [...currentAchievements, newAchievement]

        // Update achievements in database using updateAchievements
        console.log('💾 Updating achievements in database...')
        const achievementUpdateSuccess = await updateAchievements(currentAchievements)
        if (!achievementUpdateSuccess) {
          throw new Error('Failed to add achievement to database')
        }
        console.log('✅ Achievement added to database successfully')
      }

      // Now claim the achievement and add XP
      console.log('🏆 Claiming achievement and adding XP...')
      console.log('📋 Profile before claim:', {
        achievements_count: profile?.achievements_data?.length || 0,
        current_xp: profile?.current_xp,
        total_xp: profile?.total_xp
      })

      const success = await claimAchievement(claimingAchievement.name, claimingAchievement.xp, claimingAchievement.points || 0)

      if (success) {
        console.log('🎉 Achievement claimed successfully!')

        // Reload profile to get updated data
        console.log('🔄 Refreshing profile...')
        await refreshProfile()

        console.log('📋 Profile after refresh:', {
          achievements_count: profile?.achievements_data?.length || 0,
          current_xp: profile?.current_xp,
          total_xp: profile?.total_xp,
          claimed_achievements: profile?.achievements_data?.filter((a: any) => a.claimed).map((a: any) => a.name) || []
        })

        const pointsText = claimingAchievement.points ? `, +${claimingAchievement.points} Points` : ''
        toast.success(`🎉 Achievement claimed! +${claimingAchievement.xp} XP${pointsText} added to your account`)
        setShowClaimDialog(false)
        setClaimingAchievement(null)
      } else {
        console.error('❌ Failed to claim achievement')
        toast.error('Failed to claim achievement. Please try again.')
      }
    } catch (error) {
      console.error('💥 Error claiming achievement:', error)
      toast.error(`Failed to claim achievement: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    setIsClaimingPoints(false)
  }

  const handleLevelClaim = (reward: any) => {
    setClaimingLevel(reward)
    setShowLevelClaimDialog(true)
  }

  const confirmClaimLevel = async () => {
    if (!claimingLevel || !profile) {
      console.error('Missing claimingLevel or profile:', { claimingLevel, profile })
      return
    }

    setIsClaimingLevelPoints(true)

    try {
      console.log('🎯 Starting level reward claim process for level:', claimingLevel.level)

      // Simulate claim process delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Get current level rewards from database (stored in referral_data temporarily)
      let currentLevelRewards = profile.referral_data?.level_rewards || []
      console.log('📋 Current level rewards in database:', currentLevelRewards.length)

      // Check if level reward already claimed
      const existingClaim = currentLevelRewards.find((claim: any) => claim.level === claimingLevel.level)
      if (existingClaim) {
        console.log('⚠️ Level reward already claimed')
        toast.error('Level reward already claimed!')
        return
      }

      // Add new level reward claim
      const newLevelReward = {
        level: claimingLevel.level,
        points: claimingLevel.points,
        claimed_at: new Date().toISOString()
      }

      currentLevelRewards = [...currentLevelRewards, newLevelReward]

      // Update level rewards and points in database
      console.log('💾 Updating level rewards and points in database...')

      // Calculate new points total
      const currentPoints = profile.points || 0
      const newPointsTotal = currentPoints + claimingLevel.points

      // First check if level_rewards_data column exists, if not use referral_data as temporary storage
      const { data, error } = await encryptedStorage.supabase
        .from('user_profiles')
        .update({
          referral_data: {
            ...profile.referral_data,
            level_rewards: currentLevelRewards
          },
          points: newPointsTotal, // Add points to the database
          updated_at: new Date().toISOString()
        })
        .eq('address', user?.address)
        .select()

      if (error) {
        console.error('❌ Database update failed:', error)
        throw new Error(`Database update failed: ${error.message}`)
      }

      console.log(`✅ Added ${claimingLevel.points} points. New total: ${newPointsTotal}`)

      console.log('✅ Level reward claimed successfully!')

      // Update local state
      setLevelRewards(prev => prev.map((reward: any) =>
        reward.level === claimingLevel.level
          ? { ...reward, claimed: true }
          : reward
      ))

      // Refresh profile to get updated data
      console.log('🔄 Refreshing profile...')
      await refreshProfile()

      toast.success(`🎉 Level ${claimingLevel.level} reward claimed! +${claimingLevel.points} points`)
      setShowLevelClaimDialog(false)
      setClaimingLevel(null)

    } catch (error) {
      console.error('💥 Error claiming level reward:', error)
      toast.error(`Failed to claim level reward: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    setIsClaimingLevelPoints(false)
  }

  // Close mobile tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMobileTooltipOpen(null)
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[#4DA2FF]" />
          <span className="text-white">Loading persistent profile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-red-500 font-medium">Database Connection Error</h3>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
              <Button
                onClick={clearError}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Profile Section - Original Design */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Profile Info - Takes 2/3 width */}
            <div className="lg:col-span-2 enhanced-card bg-[#030f1c] border border-[#C0E6FF]/20 m-2 overflow-hidden">
              {/* Banner Image Section */}
              <div className="relative rounded-t-lg overflow-hidden">
                <EnhancedBanner
                  editable={true}
                  showStorageInfo={false}
                  showDeleteButton={false}
                  className="w-full h-64 rounded-none"
                />

                {/* Avatar positioned on left side of banner */}
                <div className="absolute bottom-4 left-6">
                  <EnhancedAvatar
                    size="2xl"
                    editable={true}
                    showStorageInfo={false}
                    showDeleteButton={false}
                  />
                </div>

                {/* Social Media Icons - Positioned at top right of banner */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                  {profileData.socialMedia.map((social: any, index: number) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant={social.connected ? "default" : "outline"}
                            className={`w-12 h-12 p-0 transition-all duration-200 ${social.connected
                              ? "bg-[#10b981] hover:bg-[#10b981] text-white border-[#10b981]"
                              : "border-[#C0E6FF]/50 text-[#C0E6FF] hover:bg-[#C0E6FF]/10 hover:border-[#C0E6FF] bg-transparent"
                            }`}
                            onClick={() => handleSocialConnect(social.platform, social.url)}
                          >
                            <Image
                              src={social.image}
                              alt={social.platform}
                              width={32}
                              height={32}
                              className="w-8 h-8 object-contain"
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-black/90 text-white border border-[#C0E6FF]/20">
                          <p className="text-sm">
                            {social.connected
                              ? `Connected: ${social.username}`
                              : `Click to connect ${social.platform}`
                            }
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>

                {/* Status, Points, and Level - Positioned at bottom right of banner with dark background */}
                <div className="absolute bottom-4 right-4 flex flex-wrap items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                  <Badge className="bg-[#3b82f6] text-white text-xs px-2 py-1 h-8 flex items-center">
                    <div className="flex items-center gap-1">
                      <RoleImage role={tier as "NOMAD" | "PRO" | "ROYAL"} size="md" />
                      {tier}
                    </div>
                  </Badge>
                  <Badge className="bg-[#3b82f6] text-white text-xs px-2 py-1 h-8 flex items-center">
                    <div className="flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      <span className="font-medium">{(profile?.points || 0).toLocaleString()}</span>
                    </div>
                  </Badge>
                  <Badge className="bg-[#3b82f6] text-white text-xs px-2 py-1 h-8 flex items-center">
                    Level {profileData.levelInfo.currentLevel}
                  </Badge>
                </div>
              </div>

              {/* Username and Referral Link below banner */}
              <div className="px-4 md:px-8 py-4 bg-[#030f1c] rounded-b-lg">
                {/* Username with Referral Link */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div className="flex flex-col justify-center">
                    <h2 className="text-lg md:text-xl font-bold text-white">{profileData.name}</h2>
                  </div>

                  {/* Referral Link - positioned next to username */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <span className="text-[#C0E6FF] text-sm font-medium">Referral:</span>
                    <div className="flex items-center gap-1 md:gap-2 bg-[#1a2f51]/50 rounded-lg px-2 md:px-3 py-2">
                      <Input
                        value={affiliateLink}
                        readOnly
                        className="bg-transparent border-none text-[#FFFFFF] text-xs md:text-sm p-0 h-auto w-40 md:w-52 focus:ring-0"
                      />
                      <Button
                        onClick={handleCopyLink}
                        size="sm"
                        className="bg-transparent hover:bg-[#4DA2FF]/20 text-[#4DA2FF] p-1 md:p-2 h-auto"
                      >
                        {copied ? (
                          <CheckCircle className="w-3 md:w-4 h-3 md:h-4" />
                        ) : (
                          <Copy className="w-3 md:w-4 h-3 md:h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={handleShare}
                        size="sm"
                        className="bg-transparent hover:bg-[#C0E6FF]/20 text-[#C0E6FF] p-1 md:p-2 h-auto"
                      >
                        <ExternalLink className="w-3 md:w-4 h-3 md:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Channels - Takes 1/3 width */}
            <div className="lg:col-span-1 enhanced-card bg-[#030f1c] border border-[#C0E6FF]/20 rounded-lg m-2">
              <div className="flex flex-col h-full">
                {/* Channels Joined Section - Clean layout without inner border */}
                <div className="w-full flex-1 p-6 pb-4">
                  <h4 className="text-white font-semibold mb-6">Channels Joined</h4>
                  <ChannelsJoinedSection />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons Card */}
      <div className="enhanced-card">
        <div className="enhanced-card-content px-4 md:px-6">
          {/* Single Row: 3 Control Buttons - Mobile: 1 column (stacked), Desktop: 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="flex flex-col items-center">
              <Button
                onClick={() => router.push('/affiliate-controls')}
                className="bg-[#4da2ffcc] hover:bg-[#4da2ffcc]/80 text-white px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold w-full"
              >
                <Users className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Affiliate Controls</span>
                <span className="sm:hidden">Affiliate</span>
              </Button>
              <p className="text-[#C0E6FF] text-xs mt-2 text-center">Manage referrals and metrics</p>
            </div>

            <div className="flex flex-col items-center">
              <Button
                onClick={() => updateKYCStatus(profileData.kycStatus === "verified" ? "not_verified" : "verified")}
                className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-white w-full ${
                  profileData.kycStatus === "verified"
                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                }`}
              >
                {profileData.kycStatus === "verified" ? (
                  <CheckCircle2 className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
                ) : (
                  <AlertTriangle className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
                )}
                <span className="hidden sm:inline">
                  {profileData.kycStatus === "verified" ? "KYC Verified" : "Complete KYC"}
                </span>
                <span className="sm:hidden">KYC</span>
              </Button>
              <p className="text-[#C0E6FF] text-xs mt-2 text-center">
                {profileData.kycStatus === "verified" ? "Identity verified" : "Verify your identity"}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold w-full"
              >
                <History className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Transaction History</span>
                <span className="sm:hidden">History</span>
              </Button>
              <p className="text-[#C0E6FF] text-xs mt-2 text-center">View payment records</p>
            </div>
          </div>
        </div>
      </div>

      {/* Level Progress and Level Rewards Combined Card */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column 1: Level Progress */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-center">Level Progress</h3>

              {/* Current Level with XP Needed */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#C0E6FF] text-sm">Current Level</span>
                  <span className="text-white font-bold">Level {profileData.levelInfo.currentLevel}</span>
                </div>

                {/* Circular Level Progress Gauge */}
                <div className="flex flex-col items-center">
                  <div className="relative w-56 h-56 mb-4">
                    {/* Calculate progress once */}
                    {(() => {
                      // Use the same values from profileData.levelInfo for consistency
                      const currentXP = profileData.levelInfo.currentXP;
                      const nextLevelXP = profileData.levelInfo.nextLevelXP;
                      const currentLevel = profileData.levelInfo.currentLevel;

                      // Calculate what XP the current level started at
                      const levelThresholds = [0, 100, 250, 500, 800, 1200, 1800, 2600, 3600, 5000];
                      const currentLevelStartXP = levelThresholds[currentLevel - 1] || 0;

                      // Calculate progress within current level (0-100%)
                      const xpInCurrentLevel = currentXP - currentLevelStartXP;
                      const xpNeededForLevel = nextLevelXP - currentLevelStartXP;
                      const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForLevel) * 100));

                      // Debug log to see what's happening
                      console.log('🔍 Progress Calculation:', {
                        currentXP,
                        nextLevelXP,
                        currentLevel,
                        currentLevelStartXP,
                        xpInCurrentLevel,
                        xpNeededForLevel,
                        progressPercent: progressPercent.toFixed(1)
                      });

                      // Calculate the angle for the progress arc
                      const startAngle = -90; // Start at top
                      const endAngle = startAngle + (180 * progressPercent / 100); // End based on progress

                      // Convert angles to radians and calculate coordinates
                      const startAngleRad = (startAngle * Math.PI) / 180;
                      const endAngleRad = (endAngle * Math.PI) / 180;

                      const centerX = 120;
                      const centerY = 120;
                      const radius = 90;

                      const startX = centerX + radius * Math.cos(startAngleRad);
                      const startY = centerY + radius * Math.sin(startAngleRad);
                      const endX = centerX + radius * Math.cos(endAngleRad);
                      const endY = centerY + radius * Math.sin(endAngleRad);

                      const largeArcFlag = progressPercent > 50 ? 1 : 0;

                      return (
                        <svg className="w-full h-full" viewBox="0 0 240 240">
                          {/* Gradient Definition */}
                          <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#60A5FA" />
                              <stop offset="50%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#1D4ED8" />
                            </linearGradient>
                            <filter id="glow">
                              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                              <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>

                          {/* Background Arc - Full semicircle */}
                          <path
                            d="M 30 120 A 90 90 0 0 1 210 120"
                            fill="none"
                            stroke="#1a2f51"
                            strokeWidth="14"
                            strokeLinecap="round"
                          />

                          {/* Progress Arc - Only the filled portion with gradient and glow */}
                          {progressPercent > 0 && (
                            <path
                              d={`M 30 120 A 90 90 0 ${largeArcFlag} 1 ${endX} ${endY}`}
                              fill="none"
                              stroke="url(#progressGradient)"
                              strokeWidth="14"
                              strokeLinecap="round"
                              filter="url(#glow)"
                              className="transition-all duration-1000 ease-out"
                            />
                          )}
                        </svg>
                      );
                    })()}

                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-center bg-[#0a1628]/80 backdrop-blur-sm rounded-full w-28 h-28 flex flex-col items-center justify-center border border-[#C0E6FF]/20 shadow-lg">
                        <div className="text-3xl font-bold text-white mb-1">
                          {profileData.levelInfo.currentLevel}
                        </div>
                        <div className="text-sm text-[#C0E6FF]">Level</div>
                      </div>
                    </div>

                    {/* Progress Percentage Badge */}
                    <div className="absolute -top-1 right-2 bg-[#1a2f51] border border-[#C0E6FF]/30 text-[#C0E6FF] text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
                      {(() => {
                        // Use the same values from profileData.levelInfo for consistency
                        const currentXP = profileData.levelInfo.currentXP;
                        const nextLevelXP = profileData.levelInfo.nextLevelXP;
                        const currentLevel = profileData.levelInfo.currentLevel;

                        const levelThresholds = [0, 100, 250, 500, 800, 1200, 1800, 2600, 3600, 5000];
                        const currentLevelStartXP = levelThresholds[currentLevel - 1] || 0;

                        const xpInCurrentLevel = currentXP - currentLevelStartXP;
                        const xpNeededForLevel = nextLevelXP - currentLevelStartXP;
                        const progress = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForLevel) * 100));

                        return `${progress.toFixed(0)}%`;
                      })()}
                    </div>
                  </div>

                  {/* Level Info Below Gauge */}
                  <div className="flex justify-between items-center w-full">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">Next Level</div>
                      <div className="text-2xl font-bold text-[#4DA2FF]">{profileData.levelInfo.nextLevel}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">XP Needed</div>
                      <div className="text-2xl font-bold text-[#00D4AA]">
                        {(profileData.levelInfo.nextLevelXP - profileData.levelInfo.currentXP).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* XP Level Progression & Rewards Button */}
              <div>
                <Button
                  onClick={() => setShowProgressionModal(true)}
                  className="w-full bg-gradient-to-r from-[#4DA2FF] to-[#00D4AA] hover:from-[#4DA2FF]/80 hover:to-[#00D4AA]/80 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>XP Level Progression & Rewards</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Column 2: Level Rewards */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-center">Level Rewards</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {levelRewards.map((reward: any) => (
                  <div key={reward.level} className="bg-[#1a2f51] rounded-lg p-3 border border-[#C0E6FF]/20 text-center">
                    <div className="text-white font-bold text-sm mb-2">Level {reward.level}</div>
                    <div className="text-[#C0E6FF] text-xs mb-2 min-h-[2rem] flex items-center justify-center">
                      {reward.description}
                    </div>
                    {reward.claimed ? (
                      <div className="flex items-center justify-center py-1">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    ) : reward.points > 0 ? (
                      <Button
                        size="sm"
                        onClick={() => reward.available && !reward.claimed && handleLevelClaim(reward)}
                        className={`w-full text-white text-xs py-1 px-2 ${
                          reward.available && !reward.claimed
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                        disabled={!reward.available || reward.claimed}
                      >
                        Claim
                      </Button>
                    ) : (
                      <div className="text-[#6B7280] text-xs py-1">
                        {reward.available ? "Unlocked" : "Locked"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Card - Complete with all achievements */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <h3 className="text-white font-semibold mb-4 text-center">Achievements</h3>
          <TooltipProvider>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2 md:gap-3">
              {profileData.achievements.map((achievement: any, index: number) => {
                // Check if this achievement is claimed in the persistent profile
                const persistentAchievement = profile?.achievements_data?.find(
                  (a: any) => a.name === achievement.name
                )
                const isClaimedInDB = persistentAchievement?.claimed || false

                // Debug logging for first few achievements
                if (index < 3) {
                  console.log(`🔍 Achievement "${achievement.name}":`, {
                    local_claimed: achievement.claimed,
                    db_claimed: isClaimedInDB,
                    persistent_achievement: persistentAchievement,
                    total_db_achievements: profile?.achievements_data?.length || 0
                  })
                }

                // Override the achievement claimed status with database data
                const updatedAchievement = {
                  ...achievement,
                  claimed: isClaimedInDB
                }

                const isLocked = !updatedAchievement.unlocked
                const canClaim = updatedAchievement.unlocked && !updatedAchievement.claimed

                const achievementCard = (
                  <div
                    key={index}
                    className={`flex flex-col items-center ${updatedAchievement.claimed ? 'justify-center' : 'justify-between'} gap-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer group relative min-h-[120px] ${
                      isLocked
                        ? 'bg-[#030f1c] border-[#C0E6FF]/10 opacity-60'
                        : updatedAchievement.claimed
                        ? 'bg-[#1a2f51] border-green-500/30 opacity-80'
                        : 'bg-[#1a2f51] border-[#C0E6FF]/20 hover:border-[#C0E6FF]/40'
                    }`}
                    onClick={(e) => handleMobileTooltipClick(index, e)}
                  >
                    {/* Claimed badge */}
                    {updatedAchievement.claimed && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}

                    {/* Mobile tooltip for achievement name */}
                    {mobileTooltipOpen === index && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded z-50 whitespace-nowrap md:hidden">
                        {achievement.name}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                      </div>
                    )}

                    {/* Icon - centered for claimed, at top for others */}
                    <div className={`flex items-center justify-center transition-transform duration-200 ${
                      !isLocked ? 'group-hover:scale-110' : ''
                    } ${updatedAchievement.claimed ? 'flex-1' : ''}`}>
                      {isLocked ? (
                        <div
                          className="p-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${updatedAchievement.color}20` }}
                        >
                          <Lock
                            className="w-8 h-8"
                            style={{ color: '#6B7280' }}
                          />
                        </div>
                      ) : (() => {
                        // Check if achievement has a custom image path (for social media achievements)
                        if (updatedAchievement.image) {
                          return (
                            <Image
                              src={updatedAchievement.image}
                              alt={updatedAchievement.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-contain"
                            />
                          )
                        }

                        // Check for custom achievement images
                        const customImage = getAchievementImage(updatedAchievement.name)
                        if (customImage) {
                          return (
                            <Image
                              src={customImage}
                              alt={updatedAchievement.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-contain"
                            />
                          )
                        } else if (updatedAchievement.icon && typeof updatedAchievement.icon === 'function') {
                          const Icon = updatedAchievement.icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>
                          return (
                            <div
                              className="p-4 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${updatedAchievement.color}20` }}
                            >
                              <Icon
                                className="w-8 h-8"
                                style={{ color: updatedAchievement.color }}
                              />
                            </div>
                          )
                        } else {
                          // Fallback for achievements without icons
                          return (
                            <div
                              className="p-4 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${updatedAchievement.color}20` }}
                            >
                              <div
                                className="w-8 h-8 rounded-full"
                                style={{ backgroundColor: updatedAchievement.color }}
                              />
                            </div>
                          )
                        }
                      })()}
                    </div>

                    {/* Text below icon - only show if not claimed */}
                    {!updatedAchievement.claimed && (
                      <div className="text-center flex-1 flex items-center justify-center">
                        <span className={`text-xs font-medium leading-tight ${
                          isLocked ? 'text-[#6B7280]' : 'text-[#C0E6FF]'
                        }`}>
                          {updatedAchievement.name}
                        </span>
                      </div>
                    )}

                    {/* Claim button at bottom */}
                    {canClaim && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleClaimAchievement(updatedAchievement)
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 w-full"
                      >
                        Claim
                      </Button>
                    )}
                  </div>
                )

                // Always show tooltip if available
                if (updatedAchievement.tooltip) {
                  return (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        {achievementCard}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{updatedAchievement.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return achievementCard
              })}
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* Achievement Claim Dialog */}
      {showClaimDialog && claimingAchievement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1628] border border-[#C0E6FF]/20 rounded-xl p-6 max-w-md w-full mx-4 relative overflow-hidden">
            <div className="relative z-10 text-center">
              {!isClaimingPoints ? (
                <>
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto mb-4 p-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">🎉 Achievement Ready!</h3>
                    <p className="text-[#C0E6FF] mb-4">
                      Congratulations! You've unlocked the <span className="text-yellow-400 font-semibold">"{claimingAchievement.name}"</span> achievement!
                    </p>
                    <div className="bg-[#1a2f51] rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-white font-bold text-xl">+{claimingAchievement.xp} XP</span>
                        {claimingAchievement.points > 0 && (
                          <>
                            <span className="text-[#C0E6FF]">•</span>
                            <Coins className="w-5 h-5 text-[#4da2ff]" />
                            <span className="text-white font-bold text-xl">+{claimingAchievement.points} Points</span>
                          </>
                        )}
                      </div>
                      <p className="text-[#C0E6FF] text-sm">Will be added to your account</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowClaimDialog(false)}
                      variant="outline"
                      className="flex-1 border-[#C0E6FF]/50 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                    >
                      Later
                    </Button>
                    <Button
                      onClick={confirmClaimAchievement}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                    >
                      🎁 Claim Now!
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-8">
                  <div className="w-16 h-16 mx-auto mb-4 p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center animate-pulse">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">✨ Claiming Rewards...</h3>
                  <p className="text-[#C0E6FF] mb-4">
                    Adding {claimingAchievement.xp} XP{claimingAchievement.points > 0 ? ` and ${claimingAchievement.points} Points` : ''} to your account!
                  </p>
                  <div className="w-full bg-[#1a2f51] rounded-full h-2 mb-4">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full animate-pulse w-full"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Level Claim Dialog */}
      {showLevelClaimDialog && claimingLevel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1628] border border-[#C0E6FF]/20 rounded-xl p-6 max-w-md w-full mx-4 relative overflow-hidden">
            <div className="relative z-10 text-center">
              {!isClaimingLevelPoints ? (
                <>
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto mb-4 p-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">🎉 Level Reward Ready!</h3>
                    <p className="text-[#C0E6FF] mb-4">
                      Congratulations! You've reached <span className="text-yellow-400 font-semibold">Level {claimingLevel.level}</span> and unlocked your reward!
                    </p>
                    <div className="bg-[#1a2f51] rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        {claimingLevel.points > 0 ? (
                          <span className="text-white font-bold text-xl">+{claimingLevel.points} Points</span>
                        ) : (
                          <span className="text-white font-bold text-lg">{claimingLevel.description}</span>
                        )}
                      </div>
                      <p className="text-[#C0E6FF] text-sm">
                        {claimingLevel.points > 0 ? "Will be added to your account" : "Feature unlocked!"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowLevelClaimDialog(false)}
                      variant="outline"
                      className="flex-1 border-[#C0E6FF]/50 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                    >
                      Later
                    </Button>
                    <Button
                      onClick={confirmClaimLevel}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                    >
                      🎁 Claim Now!
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-8">
                  <div className="w-16 h-16 mx-auto mb-4 p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center animate-pulse">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">✨ Claiming Reward...</h3>
                  <p className="text-[#C0E6FF] mb-4">
                    {claimingLevel.points > 0
                      ? `Adding ${claimingLevel.points} points to your account!`
                      : `Unlocking: ${claimingLevel.description}`
                    }
                  </p>
                  <div className="w-full bg-[#1a2f51] rounded-full h-2 mb-4">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full animate-pulse w-full"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* XP Level Progression & Rewards Modal */}
      {showProgressionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A1628] border border-[#C0E6FF]/20 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#C0E6FF]/20">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">XP Level Progression & Rewards</h2>
              </div>
              <button
                onClick={() => setShowProgressionModal(false)}
                className="text-[#C0E6FF] hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#C0E6FF]/20">
                      <th className="text-left py-3 px-4 text-[#C0E6FF] font-semibold flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        Level
                      </th>
                      <th className="text-left py-3 px-4 text-[#C0E6FF] font-semibold">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-400" />
                          XP Required
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-[#C0E6FF] font-semibold">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          XP from Previous
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-[#C0E6FF] font-semibold">
                        <div className="flex items-center gap-2">
                          <Unlock className="w-4 h-4 text-yellow-400" />
                          Points Unlocked
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-[#C0E6FF] font-semibold">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-red-400" />
                          Total Points
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { level: 1, xpRequired: 0, xpFromPrevious: 0, pointsUnlocked: 0, totalPoints: 0, description: "Starting level" },
                      { level: 2, xpRequired: 100, xpFromPrevious: 100, pointsUnlocked: 0, totalPoints: 0, description: "No reward" },
                      { level: 3, xpRequired: 250, xpFromPrevious: 150, pointsUnlocked: 0, totalPoints: 0, description: "No reward" },
                      { level: 4, xpRequired: 500, xpFromPrevious: 250, pointsUnlocked: 0, totalPoints: 0, description: "Unlock 4th Affiliate Level" },
                      { level: 5, xpRequired: 800, xpFromPrevious: 300, pointsUnlocked: 0, totalPoints: 0, description: "Unlock 5th Affiliate Level" },
                      { level: 6, xpRequired: 1200, xpFromPrevious: 400, pointsUnlocked: 500, totalPoints: 500, description: "Earn 500 Points" },
                      { level: 7, xpRequired: 1800, xpFromPrevious: 600, pointsUnlocked: 2000, totalPoints: 2500, description: "Earn 2,000 Points" },
                      { level: 8, xpRequired: 2600, xpFromPrevious: 800, pointsUnlocked: 6000, totalPoints: 8500, description: "Earn 6,000 Points + Bybit Partner" },
                      { level: 9, xpRequired: 3600, xpFromPrevious: 1000, pointsUnlocked: 15000, totalPoints: 23500, description: "Earn 15,000 Points" },
                      { level: 10, xpRequired: 5000, xpFromPrevious: 1400, pointsUnlocked: 35000, totalPoints: 58500, description: "Earn 35,000 Points" }
                    ].map((row: any, index: number) => (
                      <tr key={row.level} className="border-b border-[#C0E6FF]/10 hover:bg-[#1a2f51]/30 transition-colors">
                        <td className="py-3 px-4 text-white font-semibold">{row.level}</td>
                        <td className="py-3 px-4 text-[#C0E6FF]">{row.xpRequired}</td>
                        <td className="py-3 px-4">
                          {row.xpFromPrevious > 0 ? (
                            <span className="text-green-400">+{row.xpFromPrevious}</span>
                          ) : (
                            <span className="text-[#C0E6FF]">{row.xpFromPrevious}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-yellow-400 font-semibold">{row.pointsUnlocked}</td>
                        <td className="py-3 px-4 text-white font-semibold">{row.totalPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Message */}
              <div className="mt-6 p-4 bg-[#1a2f51] rounded-lg border border-[#C0E6FF]/20">
                <div className="flex items-center gap-2 text-[#C0E6FF]">
                  <Gift className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold">Earn XP by completing achievements. Each new level unlocks bigger rewards!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Channels Refresh Button Component
function ChannelsRefreshButton() {
  const { refreshChannels, isLoading, channels } = useChannelSubscriptions()

  const debugChannelAvatars = () => {
    console.log('🔍 DEBUG: Channel avatars info:')
    channels.forEach((channel, index) => {
      console.log(`Channel ${index + 1}:`, {
        name: channel.name,
        avatarUrl: channel.avatarUrl,
        avatarBlobId: channel.avatarBlobId,
        creatorAddress: channel.creatorAddress
      })
    })
  }

  return (
    <div className="flex gap-1">
      <Button
        onClick={refreshChannels}
        size="sm"
        variant="ghost"
        className="text-[#C0E6FF] hover:text-white hover:bg-[#4DA2FF]/20 p-1"
        disabled={isLoading}
        title="Refresh channels"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
      <Button
        onClick={debugChannelAvatars}
        size="sm"
        variant="ghost"
        className="text-[#C0E6FF] hover:text-white hover:bg-[#4DA2FF]/20 p-1"
        title="Debug avatars"
      >
        🔍
      </Button>
    </div>
  )
}

// Channels Joined Section Component
function ChannelsJoinedSection() {
  const { channels, isLoading, error, refreshChannels, addSampleChannels } = useChannelSubscriptions()
  const router = useRouter()
  const { profile } = usePersistentProfile()

  // Get user tier from profile
  const tier = profile?.role_tier || 'NOMAD'

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <RefreshCw className="w-6 h-6 text-[#C0E6FF] animate-spin" />
        <span className="ml-2 text-[#C0E6FF]">Loading channels...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative h-full">
        {/* Error state content - Takes available space */}
        <div className="pb-32 sm:pb-20 text-center py-8">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm mb-4">Failed to load channels</p>
          <Button
            onClick={refreshChannels}
            size="sm"
            className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>

        {/* Control Buttons - Always at bottom, inside card */}
        <div className="absolute bottom-10 left-0 right-0 px-6 pb-2">
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-[#C0E6FF]/10">
            {/* Creator Controls Button - PRO and ROYAL only */}
            {(tier === 'PRO' || tier === 'ROYAL') ? (
              <div className="flex-1">
                <Button
                  onClick={() => router.push('/creator-controls')}
                  className="bg-[#10b981] hover:bg-[#10b981]/80 text-white px-2 py-2 text-xs font-semibold w-full"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Creator Controls</span>
                  <span className="sm:hidden">Creator</span>
                </Button>
              </div>
            ) : (
              <div className="flex-1">
                <Button
                  disabled
                  className="bg-gray-600 text-gray-400 px-2 py-2 text-xs font-semibold w-full cursor-not-allowed"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Creator Controls</span>
                  <span className="sm:hidden">Creator</span>
                </Button>
              </div>
            )}

            {/* Telegram Controls Button - PRO and ROYAL only */}
            {(tier === 'PRO' || tier === 'ROYAL') ? (
              <div className="flex-1">
                <Button
                  onClick={() => router.push('/telegram-admin')}
                  className="bg-[#0088cc] hover:bg-[#0088cc]/80 text-white px-2 py-2 text-xs font-semibold w-full"
                >
                  <Bot className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Telegram Controls</span>
                  <span className="sm:hidden">Telegram</span>
                </Button>
              </div>
            ) : (
              <div className="flex-1">
                <Button
                  disabled
                  className="bg-gray-600 text-gray-400 px-2 py-2 text-xs font-semibold w-full cursor-not-allowed"
                >
                  <Bot className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Telegram Controls</span>
                  <span className="sm:hidden">Telegram</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (channels.length === 0) {
    return (
      <div className="relative h-full">
        {/* Empty state content - Takes available space */}
        <div className="pb-32 sm:pb-20 text-center py-8">
          <Hash className="w-8 h-8 text-[#C0E6FF]/50 mx-auto mb-2" />
          <p className="text-[#C0E6FF]/70 text-sm mb-4">No channels joined yet</p>
          <p className="text-[#C0E6FF]/50 text-xs mb-4">
            Join channels from the AIO Creators page to see them here
          </p>
          <Button
            onClick={addSampleChannels}
            size="sm"
            className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Hash className="w-4 h-4 mr-2" />
            )}
            Add Sample Channels
          </Button>
        </div>

        {/* Control Buttons - Always at bottom, inside card */}
        <div className="absolute bottom-10 left-0 right-0 px-6 pb-2">
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-[#C0E6FF]/10">
            {/* Creator Controls Button - PRO and ROYAL only */}
            {(tier === 'PRO' || tier === 'ROYAL') ? (
              <div className="flex-1">
                <Button
                  onClick={() => router.push('/creator-controls')}
                  className="bg-[#10b981] hover:bg-[#10b981]/80 text-white px-2 py-2 text-xs font-semibold w-full"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Creator Controls</span>
                  <span className="sm:hidden">Creator</span>
                </Button>
              </div>
            ) : (
              <div className="flex-1">
                <Button
                  disabled
                  className="bg-gray-600 text-gray-400 px-2 py-2 text-xs font-semibold w-full cursor-not-allowed"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Creator Controls</span>
                  <span className="sm:hidden">Creator</span>
                </Button>
              </div>
            )}

            {/* Telegram Controls Button - PRO and ROYAL only */}
            {(tier === 'PRO' || tier === 'ROYAL') ? (
              <div className="flex-1">
                <Button
                  onClick={() => router.push('/telegram-admin')}
                  className="bg-[#0088cc] hover:bg-[#0088cc]/80 text-white px-2 py-2 text-xs font-semibold w-full"
                >
                  <Bot className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Telegram Controls</span>
                  <span className="sm:hidden">Telegram</span>
                </Button>
              </div>
            ) : (
              <div className="flex-1">
                <Button
                  disabled
                  className="bg-gray-600 text-gray-400 px-2 py-2 text-xs font-semibold w-full cursor-not-allowed"
                >
                  <Bot className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Telegram Controls</span>
                  <span className="sm:hidden">Telegram</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Limit channels display: 9 for desktop, 25 for mobile (5x5)
  const maxChannels = 25 // Maximum for mobile 5x5 grid
  const displayedChannels = channels.slice(0, maxChannels)

  return (
    <div className="relative h-full">
      {/* Channels Grid - Takes available space */}
      <div className="pb-32 sm:pb-20">
        <div className="grid grid-cols-5 gap-3 justify-items-center">
          {displayedChannels.map((channel) => (
            <TooltipProvider key={channel.id}>
              <Tooltip>
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
            </TooltipProvider>
          ))}
          {channels.length > maxChannels && (
            <div className="col-span-1 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#1a2f51] border-2 border-[#C0E6FF]/20 flex items-center justify-center cursor-pointer hover:border-[#C0E6FF]/40 transition-all">
                <span className="text-[#C0E6FF] text-xs font-medium">+{channels.length - maxChannels}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons - Always at bottom, inside card */}
      <div className="absolute bottom-10 left-0 right-0 px-6 pb-2">
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-[#C0E6FF]/10">
          {/* Creator Controls Button - PRO and ROYAL only */}
          {(tier === 'PRO' || tier === 'ROYAL') ? (
            <div className="flex-1">
              <Button
                onClick={() => router.push('/creator-controls')}
                className="bg-[#10b981] hover:bg-[#10b981]/80 text-white px-2 py-2 text-xs font-semibold w-full"
              >
                <Settings className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Creator Controls</span>
                <span className="sm:hidden">Creator</span>
              </Button>
            </div>
          ) : (
            <div className="flex-1">
              <Button
                disabled
                className="bg-gray-600 text-gray-400 px-2 py-2 text-xs font-semibold w-full cursor-not-allowed"
              >
                <Settings className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Creator Controls</span>
                <span className="sm:hidden">Creator</span>
              </Button>
            </div>
          )}

          {/* Telegram Controls Button - PRO and ROYAL only */}
          {(tier === 'PRO' || tier === 'ROYAL') ? (
            <div className="flex-1">
              <Button
                onClick={() => router.push('/telegram-admin')}
                className="bg-[#0088cc] hover:bg-[#0088cc]/80 text-white px-2 py-2 text-xs font-semibold w-full"
              >
                <Bot className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Telegram Controls</span>
                <span className="sm:hidden">Telegram</span>
              </Button>
            </div>
          ) : (
            <div className="flex-1">
              <Button
                disabled
                className="bg-gray-600 text-gray-400 px-2 py-2 text-xs font-semibold w-full cursor-not-allowed"
              >
                <Bot className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Telegram Controls</span>
                <span className="sm:hidden">Telegram</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
