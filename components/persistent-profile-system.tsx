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

// Achievement image mapping function - EXACT from original
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

  // Level rewards state - now managed as state instead of static array
  const [levelRewards, setLevelRewards] = useState([
    { level: 2, points: 20, available: false, claimed: false },
    { level: 3, points: 30, available: false, claimed: false },
    { level: 4, points: 50, available: false, claimed: false },
    { level: 5, points: 80, available: false, claimed: false },
    { level: 6, points: 100, available: false, claimed: false },
    { level: 7, points: 120, available: false, claimed: false },
    { level: 8, points: 150, available: false, claimed: false },
    { level: 9, points: 180, available: false, claimed: false },
    { level: 10, points: 200, available: false, claimed: false }
  ])

  // Affiliate link
  const affiliateLink = `https://aionet.com/ref/${user?.address?.slice(0, 8) || 'user'}`

  // Function to determine if achievement should be unlocked based on user activity
  const checkAchievementUnlocked = (achievementName: string): boolean => {
    switch (achievementName) {
      case "Profile Picture":
        // Unlocked if user has uploaded a profile image
        return !!profile?.profile_image_blob_id

      case "KYC Verification":
        // Unlocked if user has completed KYC
        return profile?.kyc_status === 'verified'

      case "Reach Level 5":
        // Unlocked if user has reached level 5
        return (profile?.profile_level || 1) >= 5

      case "Connect Discord":
        // Unlocked if user has connected Discord
        return profile?.social_links?.some((link: any) => link.platform === 'Discord') || false

      case "Connect Telegram":
        // Unlocked if user has connected Telegram
        return profile?.social_links?.some((link: any) => link.platform === 'Telegram') || false

      case "Connect X":
        // Unlocked if user has connected X
        return profile?.social_links?.some((link: any) => link.platform === 'X') || false

      case "Upgrade to PRO":
        // Unlocked if user has PRO tier
        return profile?.role_tier === 'PRO'

      case "Upgrade to ROYAL":
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
      // Profile & Account Achievements - EXACT from original with points added
      { name: "Profile Picture", icon: User, color: "#4DA2FF", xp: 15, points: 10, tooltip: "Upload a profile picture to personalize your account" },
      { name: "KYC Verification", icon: CheckCircle2, color: "#10B981", xp: 25, points: 25, tooltip: "Complete KYC verification to unlock full platform features" },
      { name: "Reach Level 5", icon: Star, color: "#FFD700", xp: 50, points: 50, tooltip: "Reach profile level 5 to unlock advanced features" },

      // Social Media Achievements - EXACT from original with points added
      { name: "Connect Discord", image: socialImages.Discord, color: "#5865F2", xp: 15, points: 15, tooltip: "Connect your Discord account to join our community" },
      { name: "Connect Telegram", image: socialImages.Telegram, color: "#0088CC", xp: 15, points: 15, tooltip: "Connect your Telegram account for updates and support" },
      { name: "Connect X", image: socialImages.X, color: "#000000", xp: 15, points: 15, tooltip: "Connect your X (Twitter) account to stay updated" },

      // Trading & Bots Achievements - EXACT from original with points added
      { name: "Connect Bybit", icon: Link, color: "#F7931A", xp: 25, points: 30, tooltip: "Connect your Bybit account to start automated trading" },
      { name: "Follow Apollon Bot", icon: Bot, color: "#9333EA", xp: 25, points: 30, tooltip: "Follow the Apollon Bot for advanced crypto trading signals" },
      { name: "Follow Hermes Bot", icon: Bot, color: "#06B6D4", xp: 25, points: 30, tooltip: "Follow the Hermes Bot for high-frequency trading strategies" },
      { name: "Make 3 Cycles", icon: Repeat, color: "#10B981", xp: 50, points: 75, tooltip: "Complete at least 3 trading cycles with crypto bots" },

      // Upgrade Achievements - EXACT from original with points added
      { name: "Upgrade to PRO", icon: Crown, color: "#3B82F6", xp: 75, points: 100, tooltip: "Upgrade your account to PRO tier for advanced features" },
      { name: "Upgrade to ROYAL", icon: Crown, color: "#8B5CF6", xp: 150, points: 200, tooltip: "Upgrade your account to ROYAL tier for premium features" },

      // Referral Achievements - EXACT from original with points added
      { name: "Refer 10 NOMADs", icon: Users, color: "#F59E0B", xp: 50, points: 100, tooltip: "Successfully refer 10 NOMAD tier users to the platform" },
      { name: "Refer 50 NOMADs", icon: Users, color: "#F59E0B", xp: 150, points: 300, tooltip: "Successfully refer 50 NOMAD tier users to the platform" },
      { name: "Refer 100 NOMADs", icon: Users, color: "#F59E0B", xp: 300, points: 500, tooltip: "Successfully refer 100 NOMAD tier users to the platform" },
      { name: "Refer 1 PRO", icon: Users, color: "#3B82F6", xp: 100, points: 200, tooltip: "Successfully refer 1 PRO tier user to the platform" },
      { name: "Refer 5 PRO", icon: Users, color: "#3B82F6", xp: 400, points: 600, tooltip: "Successfully refer 5 PRO tier users to the platform" },
      { name: "Refer 10 PRO", icon: Users, color: "#3B82F6", xp: 750, points: 1000, tooltip: "Successfully refer 10 PRO tier users to the platform" },
      { name: "Refer 1 ROYAL", icon: Users, color: "#8B5CF6", xp: 200, points: 400, tooltip: "Successfully refer 1 ROYAL tier user to the platform" },
      { name: "Refer 3 ROYAL", icon: Users, color: "#8B5CF6", xp: 500, points: 800, tooltip: "Successfully refer 3 ROYAL tier users to the platform" },
      { name: "Refer 5 ROYAL", icon: Users, color: "#8B5CF6", xp: 800, points: 1200, tooltip: "Successfully refer 5 ROYAL tier users to the platform" }
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
      currentLevel: profile?.profile_level || 5,
      nextLevel: (profile?.profile_level || 5) + 1,
      currentXP: profile?.current_xp || 330,
      nextLevelXP: profile?.profile_level === 1 ? 50 :
                   profile?.profile_level === 2 ? 120 :
                   profile?.profile_level === 3 ? 210 :
                   profile?.profile_level === 4 ? 330 :
                   profile?.profile_level === 5 ? 480 :
                   profile?.profile_level === 6 ? 660 :
                   profile?.profile_level === 7 ? 830 :
                   profile?.profile_level === 8 ? 940 :
                   profile?.profile_level === 9 ? 1000 : 1000,
      totalXP: profile?.total_xp || 330
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
      {/* Database Status Header */}
      <div className="flex items-center justify-between p-4 bg-[#0A1628] border border-[#C0E6FF]/20 rounded-lg">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-[#4DA2FF]" />
          <span className="text-white font-medium">Persistent Profile System</span>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Database Synced
          </Badge>
          {profile && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Profile ID: {profile.id.slice(0, 8)}...
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              console.log('🔍 Debug Info:')
              console.log('👤 User:', user)
              console.log('📋 Profile:', profile)
              console.log('💰 Points in state:', profile?.points)
              console.log('🔗 User Address:', user?.address)
              console.log('🏠 Profile Address:', profile?.address)
              console.log('🔄 Loading:', isLoading)
              console.log('❌ Error:', error)

              // Check current database value
              if (user?.address) {
                try {
                  console.log('🔍 Checking current database value...')
                  const { data, error } = await encryptedStorage.supabase
                    .from('user_profiles')
                    .select('points, current_xp, total_xp, profile_level')
                    .eq('address', user.address)
                    .single()

                  console.log('📊 Database values:', { data, error })
                  if (data) {
                    toast.success(`DB Points: ${data.points}, State Points: ${profile?.points}`)
                  }
                } catch (error) {
                  console.error('❌ Database check failed:', error)
                }
              }

              try {
                console.log('🏗️ Checking database schema...')

                // Check what columns exist in the table
                const { data: columns, error: schemaError } = await encryptedStorage.supabase
                  .from('information_schema.columns')
                  .select('column_name, data_type, is_nullable, column_default')
                  .eq('table_name', 'user_profiles')
                  .order('ordinal_position')

                if (schemaError) {
                  console.error('❌ Schema check failed:', schemaError)
                } else {
                  console.log('📋 Current table columns:', columns)
                  const columnNames = columns?.map((col: any) => col.column_name) || []
                  console.log('📝 Column names:', columnNames)

                  const missingColumns = ['current_xp', 'total_xp', 'profile_level', 'role_tier', 'kyc_status', 'points']
                    .filter(col => !columnNames.includes(col))

                  if (missingColumns.length > 0) {
                    console.log('❌ Missing columns:', missingColumns)
                    toast.error(`Missing columns: ${missingColumns.join(', ')}`)
                  } else {
                    console.log('✅ All required columns exist')
                    toast.success('Database schema looks good!')
                  }
                }
              } catch (error) {
                console.error('❌ Schema check failed:', error)
                toast.error('Schema check failed - see console')
              }

              if (!user?.address) {
                toast.error('No wallet connected')
                return
              }
              try {
                console.log('🧪 Testing direct database access...')

                // Test direct Supabase access
                const { data, error } = await encryptedStorage.supabase
                  .from('user_profiles')
                  .select('*')
                  .eq('address', user.address)
                  .single()

                console.log('📊 Database test result:', { data, error })

                if (error) {
                  console.error('❌ Database error:', error)
                  toast.error(`Database error: ${error.message}`)
                } else {
                  console.log('✅ Database access successful')
                  toast.success('Database test successful!')
                }
              } catch (error) {
                console.error('❌ Database test failed:', error)
                toast.error(`Database test error: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            Debug
          </Button>
          <Button
            onClick={async () => {
              try {
                console.log('🔧 Attempting to fix RLS policies...')
                const result = await encryptedStorage.fixRLSPolicies()
                if (result.success) {
                  toast.success('RLS policies fixed! Try XP fix again.')
                } else {
                  toast.error(`RLS fix failed: ${result.error}`)
                  console.log('📋 Manual fix needed: Run the migration in Supabase dashboard')
                  console.log('🔗 Go to: https://supabase.com/dashboard → SQL Editor → Run fix_rls_policies.sql')
                }
              } catch (error) {
                console.error('❌ RLS fix failed:', error)
                toast.error('RLS fix failed - check console for manual steps')
              }
            }}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            Fix RLS
          </Button>
          <Button
            onClick={async () => {
              console.log('🏆 Achievement Debug Info:')
              console.log('📊 Profile achievements_data:', profile?.achievements_data)
              console.log('📋 Local profileData.achievements:', profileData.achievements.map((a: any) => ({
                name: a.name,
                claimed: a.claimed,
                unlocked: a.unlocked
              })))
              console.log('🔍 Claimed achievements in DB:', profile?.achievements_data?.filter((a: any) => a.claimed).map((a: any) => a.name) || [])
              console.log('🔍 Total achievements in DB:', profile?.achievements_data?.length || 0)

              toast.success('Achievement debug info logged to console')
            }}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            Debug Achievements
          </Button>
          <Button
            onClick={async () => {
              if (!user?.address) {
                toast.error('No wallet connected')
                return
              }
              try {
                console.log('🔧 Starting XP fix for address:', user.address)
                console.log('👤 User object:', user)
                console.log('📋 Current profile:', profile)

                await encryptedStorage.fixMissingXPFields(user.address)
                console.log('✅ XP fix completed, refreshing profile...')
                await refreshProfile()
                toast.success('XP fields fixed and profile refreshed!')
              } catch (error) {
                console.error('❌ XP fix failed:', error)
                console.error('Error details:', {
                  message: error instanceof Error ? error.message : 'Unknown error',
                  stack: error instanceof Error ? error.stack : undefined,
                  error
                })
                toast.error(`Failed to fix XP fields: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            Fix XP
          </Button>
          <Button
            onClick={async () => {
              console.log('🔄 Force refreshing profile...')
              console.log('📊 Current points in state:', profile?.points)
              await refreshProfile()
              console.log('📊 Points after refresh:', profile?.points)
              toast.success('Profile refreshed from database!')
            }}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#4DA2FF]/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* User Profile Section - Original Design */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column 1: Profile Info & Channels Joined */}
            <div className="enhanced-card bg-[#030f1c] border border-[#C0E6FF]/20 rounded-lg overflow-hidden m-2">
              {/* Banner Image Section */}
              <div className="relative">
                <EnhancedBanner
                  editable={true}
                  showStorageInfo={true}
                  className="w-full h-64"
                />

                {/* Avatar positioned over banner */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <EnhancedAvatar
                    size="2xl"
                    editable={true}
                    showStorageInfo={true}
                  />
                </div>
              </div>

              {/* Profile Content with top padding for avatar */}
              <div className="flex flex-col items-center text-center space-y-6 p-8 pt-16">
                {/* Profile Details Below Avatar */}
                <div className="space-y-4 w-full">
                <h2 className="text-2xl font-bold text-white">{profileData.name}</h2>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-[#C0E6FF] text-sm">{profileData.username}</p>
                </div>

                {/* Status and Points Display - Same Line */}
                <div className="flex items-center justify-center gap-3">
                  <Badge className={`${getRoleStatusColor(tier)} text-xs`}>
                    <div className="flex items-center gap-1">
                      <RoleImage role={tier as "NOMAD" | "PRO" | "ROYAL"} size="md" />
                      {tier}
                    </div>
                  </Badge>
                  <Badge className="bg-[#4da2ff]/20 text-[#4da2ff] border border-[#4da2ff]/30 text-sm px-3 py-1">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      <span className="font-medium">{(profile?.points || 0).toLocaleString()} Points</span>
                    </div>
                  </Badge>
                </div>

                {/* Profile Level */}
                <div className="flex items-center justify-center">
                  <Badge className="bg-transparent text-white text-lg px-4 py-2 border border-[#C0E6FF]/30">
                    Profile Level {profileData.levelInfo.currentLevel}
                  </Badge>
                </div>
              </div>

              {/* Channels Joined Section */}
              <div className="w-full bg-[#1a2f51]/30 rounded-lg p-4 border border-[#C0E6FF]/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold">Channels Joined</h4>
                  <ChannelsRefreshButton />
                </div>
                <ChannelsJoinedSection />

                {/* KYC Management and Transaction History Buttons */}
                <div className="w-full grid grid-cols-2 gap-3 mt-6">
                  <Button
                    onClick={() => updateKYCStatus(profileData.kycStatus === "verified" ? "not_verified" : "verified")}
                    className={`px-4 py-3 text-sm font-semibold text-white ${
                      profileData.kycStatus === "verified"
                        ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                    }`}
                  >
                    {profileData.kycStatus === "verified" ? (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 mr-2" />
                    )}
                    {profileData.kycStatus === "verified" ? "KYC Verified" : "Complete KYC"}
                  </Button>

                  <Button
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 text-sm font-semibold"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Transaction History
                  </Button>
                </div>
                </div>
              </div>
            </div>

            {/* Column 2: Referral Link & Social Media - Original Design */}
            <div className="enhanced-card bg-[#030f1c] border border-[#C0E6FF]/20 rounded-lg p-8 m-2">
              <div className="flex flex-col justify-center space-y-8">
                <div className="w-full bg-[#1a2f51]/30 rounded-lg p-5 border border-[#C0E6FF]/10">
                  <h3 className="text-white font-semibold mb-4 text-center">Referral Link</h3>
                  <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={affiliateLink}
                      readOnly
                      className="bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF] text-xs"
                    />
                    <Button
                      onClick={handleCopyLink}
                      size="sm"
                      className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-[#FFFFFF] px-2"
                    >
                      {copied ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      size="sm"
                      className="border-[#C0E6FF] text-[#C0E6FF] hover:bg-[#C0E6FF]/10 px-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-[#C0E6FF] text-xs space-y-1">
                    <p className="font-semibold">Earn additional bonuses from your referrals:</p>
                    <p>10 Points for every Copy Trade within the 10% Cycle.</p>
                    <p>100 Points for each PRO purchase made by your referrals.</p>
                    <p>375 Points for every ROYAL purchase made by your referrals.</p>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="w-full bg-[#1a2f51]/30 rounded-lg p-5 border border-[#C0E6FF]/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center">
                    <Button
                      onClick={() => router.push('/affiliate-controls')}
                      className="bg-[#4da2ffcc] hover:bg-[#4da2ffcc]/80 text-white px-4 py-3 text-sm font-semibold w-full"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Affiliate Controls
                    </Button>
                    <p className="text-[#C0E6FF] text-xs mt-2 text-center">Manage referrals and metrics</p>
                  </div>

                  {(tier === 'PRO' || tier === 'ROYAL') ? (
                    <div className="flex flex-col items-center">
                      <Button
                        onClick={() => router.push('/creator-controls')}
                        className="bg-[#10b981] hover:bg-[#10b981]/80 text-white px-4 py-3 text-sm font-semibold w-full"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Creator Controls
                      </Button>
                      <p className="text-[#C0E6FF] text-xs mt-2 text-center">Manage premium channels</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Button
                        disabled
                        className="bg-gray-600 text-gray-400 px-4 py-3 text-sm font-semibold w-full cursor-not-allowed"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Creator Controls
                      </Button>
                      <p className="text-gray-500 text-xs mt-2 text-center">PRO/ROYAL only</p>
                    </div>
                  )}

                  {(tier === 'PRO' || tier === 'ROYAL') ? (
                    <div className="flex flex-col items-center">
                      <Button
                        onClick={() => router.push('/telegram-admin')}
                        className="bg-[#0088cc] hover:bg-[#0088cc]/80 text-white px-4 py-3 text-sm font-semibold w-full"
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        Telegram Controls
                      </Button>
                      <p className="text-[#C0E6FF] text-xs mt-2 text-center">Monitor channel access</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Button
                        disabled
                        className="bg-gray-600 text-gray-400 px-4 py-3 text-sm font-semibold w-full cursor-not-allowed"
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        Telegram Controls
                      </Button>
                      <p className="text-gray-500 text-xs mt-2 text-center">PRO/ROYAL only</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Media */}
              <div className="w-full bg-[#1a2f51]/30 rounded-lg p-5 border border-[#C0E6FF]/10">
                <h3 className="text-white font-semibold mb-4 text-center">Social Media</h3>
                <div className="space-y-3">
                  {profileData.socialMedia.map((social: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#1a2f51] border border-[#C0E6FF]/20 hover:border-[#4DA2FF]/40 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={social.image}
                          alt={social.platform}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-contain"
                        />
                        <span className="text-white text-sm font-medium">{social.platform}</span>
                      </div>
                      <Button
                        size="sm"
                        variant={social.connected ? "default" : "outline"}
                        className={social.connected
                          ? "bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white text-xs h-6 px-2"
                          : "border-[#C0E6FF]/50 text-[#C0E6FF] hover:bg-[#C0E6FF]/10 text-xs h-6 px-2"
                        }
                        onClick={() => handleSocialConnect(social.platform, social.url)}
                        title={social.connected ? social.username : `Connect ${social.platform}`}
                      >
                        {social.connected ? social.username : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
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
            <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
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

                {/* XP Needed Display */}
                <div className="text-center mb-3 p-2 rounded-lg bg-[#1a2f51] border border-[#C0E6FF]/20">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-bold text-sm">
                      {(profileData.levelInfo.nextLevelXP - profileData.levelInfo.currentXP).toLocaleString()} XP needed for Level {profileData.levelInfo.nextLevel}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[#1a2f51] rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-[#4DA2FF] to-[#00D4AA] h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${(() => {
                        // Calculate progress within current level range
                        const currentLevelXP = profileData.levelInfo.currentLevel === 1 ? 0 :
                          profileData.levelInfo.currentLevel === 2 ? 0 :
                          profileData.levelInfo.currentLevel === 3 ? 50 :
                          profileData.levelInfo.currentLevel === 4 ? 120 :
                          profileData.levelInfo.currentLevel === 5 ? 210 :
                          profileData.levelInfo.currentLevel === 6 ? 330 :
                          profileData.levelInfo.currentLevel === 7 ? 480 :
                          profileData.levelInfo.currentLevel === 8 ? 660 :
                          profileData.levelInfo.currentLevel === 9 ? 830 : 940;

                        const xpInCurrentLevel = profileData.levelInfo.currentXP - currentLevelXP;
                        const xpNeededForNextLevel = profileData.levelInfo.nextLevelXP - currentLevelXP;

                        return Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));
                      })()}%`
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-[#C0E6FF]">
                  <span>{(() => {
                    const currentLevelXP = profileData.levelInfo.currentLevel === 1 ? 0 :
                      profileData.levelInfo.currentLevel === 2 ? 0 :
                      profileData.levelInfo.currentLevel === 3 ? 50 :
                      profileData.levelInfo.currentLevel === 4 ? 120 :
                      profileData.levelInfo.currentLevel === 5 ? 210 :
                      profileData.levelInfo.currentLevel === 6 ? 330 :
                      profileData.levelInfo.currentLevel === 7 ? 480 :
                      profileData.levelInfo.currentLevel === 8 ? 660 :
                      profileData.levelInfo.currentLevel === 9 ? 830 : 940;
                    return (profileData.levelInfo.currentXP - currentLevelXP).toLocaleString();
                  })()} XP</span>
                  <span>{(() => {
                    const currentLevelXP = profileData.levelInfo.currentLevel === 1 ? 0 :
                      profileData.levelInfo.currentLevel === 2 ? 0 :
                      profileData.levelInfo.currentLevel === 3 ? 50 :
                      profileData.levelInfo.currentLevel === 4 ? 120 :
                      profileData.levelInfo.currentLevel === 5 ? 210 :
                      profileData.levelInfo.currentLevel === 6 ? 330 :
                      profileData.levelInfo.currentLevel === 7 ? 480 :
                      profileData.levelInfo.currentLevel === 8 ? 660 :
                      profileData.levelInfo.currentLevel === 9 ? 830 : 940;
                    return (profileData.levelInfo.nextLevelXP - currentLevelXP).toLocaleString();
                  })()} XP</span>
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
              <div className="grid grid-cols-5 gap-2">
                {levelRewards.map((reward: any) => (
                  <div key={reward.level} className="bg-[#1a2f51] rounded-lg p-3 border border-[#C0E6FF]/20 text-center">
                    <div className="text-white font-bold text-sm mb-2">Level {reward.level}</div>
                    {reward.claimed ? (
                      <div className="flex items-center justify-center py-1">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    ) : (
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                        <span className="text-white font-bold text-xl">+{claimingLevel.points} Points</span>
                      </div>
                      <p className="text-[#C0E6FF] text-sm">Will be added to your account</p>
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
                  <h3 className="text-2xl font-bold text-white mb-2">✨ Claiming Points...</h3>
                  <p className="text-[#C0E6FF] mb-4">Adding {claimingLevel.points} points to your account!</p>
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
                      { level: 1, xpRequired: 0, xpFromPrevious: 0, pointsUnlocked: 0, totalPoints: 0 },
                      { level: 2, xpRequired: 50, xpFromPrevious: 50, pointsUnlocked: 20, totalPoints: 20 },
                      { level: 3, xpRequired: 120, xpFromPrevious: 70, pointsUnlocked: 30, totalPoints: 50 },
                      { level: 4, xpRequired: 210, xpFromPrevious: 90, pointsUnlocked: 50, totalPoints: 100 },
                      { level: 5, xpRequired: 330, xpFromPrevious: 120, pointsUnlocked: 80, totalPoints: 180 },
                      { level: 6, xpRequired: 480, xpFromPrevious: 150, pointsUnlocked: 100, totalPoints: 280 },
                      { level: 7, xpRequired: 660, xpFromPrevious: 180, pointsUnlocked: 120, totalPoints: 400 },
                      { level: 8, xpRequired: 830, xpFromPrevious: 170, pointsUnlocked: 150, totalPoints: 550 },
                      { level: 9, xpRequired: 940, xpFromPrevious: 110, pointsUnlocked: 200, totalPoints: 750 },
                      { level: 10, xpRequired: 1000, xpFromPrevious: 60, pointsUnlocked: 250, totalPoints: 1000 }
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
      <div className="text-center py-8">
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
    )
  }

  if (channels.length === 0) {
    return (
      <div className="text-center py-8">
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
    )
  }

  return (
    <div className="grid grid-cols-5 gap-3 justify-items-center">
      {channels.map((channel) => (
        <TooltipProvider key={channel.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-24 h-24 rounded-full cursor-pointer transition-all hover:scale-110 border-2 border-[#C0E6FF]/20 hover:border-[#C0E6FF]/40 overflow-hidden">
                {channel.avatarUrl ? (
                  <Image
                    src={channel.avatarUrl}
                    alt={channel.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: channel.color }}
                  >
                    <Hash className="w-12 h-12 text-white" />
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
    </div>
  )
}
