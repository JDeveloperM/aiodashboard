"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoleImage } from "@/components/ui/role-image"
import { useSubscription } from "@/contexts/subscription-context"
import { usePoints } from "@/contexts/points-context"
import Image from "next/image"
import {
  Copy,
  Users,
  DollarSign,
  Share2,
  CheckCircle,
  ExternalLink,
  Calendar,
  Mail,
  Plus,
  Star,
  Crown,
  Trophy,
  Award,
  Shield,
  Zap,
  Youtube,
  Camera,
  Upload,
  TrendingUp,
  Gamepad2,
  Lock,
  CheckCircle2,
  XCircle,
  User,
  Bot,
  Repeat,
  ArrowUp,
  Link,
  Search,
  Filter,
  Hash,
  MessageCircle,
  Bell,
  Gift,
  MoreHorizontal
} from "lucide-react"

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

interface InvitedUser {
  id: string
  username: string
  email: string
  joinDate: string
  status: 'NOMAD' | 'PRO' | 'ROYAL'
  commission: number
  kycStatus: 'verified' | 'pending' | 'not_verified'
  level: number
}

export function ProfileSystem() {
  const { tier } = useSubscription()
  const { addPoints, balance } = usePoints()
  const [affiliateLink] = useState("https://aionet.io/ref/MDX789ABC")
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Claim dialog state
  const [showClaimDialog, setShowClaimDialog] = useState(false)
  const [claimingAchievement, setClaimingAchievement] = useState<any>(null)
  const [isClaimingPoints, setIsClaimingPoints] = useState(false)
  const [mobileTooltipOpen, setMobileTooltipOpen] = useState<number | null>(null)
  const [showProgressionModal, setShowProgressionModal] = useState(false)
  const [showLevelClaimDialog, setShowLevelClaimDialog] = useState(false)
  const [claimingLevel, setClaimingLevel] = useState<any>(null)
  const [isClaimingLevelPoints, setIsClaimingLevelPoints] = useState(false)

  // Level rewards data
  const [levelRewards, setLevelRewards] = useState([
    { level: 1, points: 0, available: true, claimed: false },
    { level: 2, points: 20, available: true, claimed: false },
    { level: 3, points: 50, available: true, claimed: false },
    { level: 4, points: 100, available: true, claimed: false },
    { level: 5, points: 180, available: true, claimed: false },
    { level: 6, points: 280, available: false, claimed: false },
    { level: 7, points: 400, available: false, claimed: false },
    { level: 8, points: 550, available: false, claimed: false },
    { level: 9, points: 750, available: false, claimed: false },
    { level: 10, points: 1000, available: false, claimed: false },
  ])

  const handleLevelClaim = (level: any) => {
    setClaimingLevel(level)
    setShowLevelClaimDialog(true)
  }

  const confirmClaimLevel = () => {
    setIsClaimingLevelPoints(true)
    setTimeout(() => {
      // Update the level as claimed
      const updatedLevelRewards = levelRewards.map(reward =>
        reward.level === claimingLevel.level
          ? { ...reward, claimed: true }
          : reward
      )
      setLevelRewards(updatedLevelRewards)

      // Save level claim status to localStorage
      localStorage.setItem('user-level-claims', JSON.stringify(updatedLevelRewards))

      // Add points to the PointsContext (this will update the header and profile)
      addPoints(claimingLevel.points, `Level ${claimingLevel.level} reward`)

      setIsClaimingLevelPoints(false)
      setShowLevelClaimDialog(false)
      setClaimingLevel(null)
    }, 2000)
  }

  const [metrics] = useState({
    totalInvites: 47,
    newUsers: 32,
    nomads: 18,
    proUsers: 10,
    royalUsers: 4,
    totalCommission: 2451
  })

  // Profile data with image upload functionality
  const [profileData, setProfileData] = useState({
    name: "Affiliate User",
    username: "@affiliate_user",
    profileImage: "", // Will be loaded from localStorage
    kycStatus: "verified", // "verified" or "not-verified"
    socialMedia: [
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
      currentLevel: 5,
      nextLevel: 6,
      currentXP: 330,
      nextLevelXP: 480,
      totalXP: 330
    },
    achievements: [
      // Profile & Account Achievements
      { name: "Profile Picture", icon: User, color: "#4DA2FF", unlocked: true, claimed: false, xp: 15, tooltip: "Upload a profile picture to personalize your account" },
      { name: "KYC Verification", icon: CheckCircle2, color: "#10B981", unlocked: true, claimed: false, xp: 25, tooltip: "Complete KYC verification to unlock full platform features" },
      { name: "Reach Level 5", icon: Star, color: "#FFD700", unlocked: true, claimed: false, xp: 50, tooltip: "Reach profile level 5 to unlock advanced features" },

      // Social Media Achievements
      { name: "Connect Discord", image: socialImages.Discord, color: "#5865F2", unlocked: true, claimed: false, xp: 15, tooltip: "Connect your Discord account to join our community" },
      { name: "Connect Telegram", image: socialImages.Telegram, color: "#0088CC", unlocked: true, claimed: false, xp: 15, tooltip: "Connect your Telegram account for updates and support" },
      { name: "Connect X", image: socialImages.X, color: "#000000", unlocked: false, claimed: false, xp: 15, tooltip: "Connect your X (Twitter) account to stay updated" },

      // Trading & Bots Achievements
      { name: "Connect Bybit", icon: Link, color: "#F7931A", unlocked: true, claimed: false, xp: 25, tooltip: "Connect your Bybit account to start automated trading" },
      { name: "Follow Apollon Bot", icon: Bot, color: "#9333EA", unlocked: false, claimed: false, xp: 25, tooltip: "Follow the Apollon Bot for advanced crypto trading signals" },
      { name: "Follow Hermes Bot", icon: Bot, color: "#06B6D4", unlocked: false, claimed: false, xp: 25, tooltip: "Follow the Hermes Bot for high-frequency trading strategies" },
      { name: "Make 3 Cycles", icon: Repeat, color: "#10B981", unlocked: false, claimed: false, xp: 50, tooltip: "Complete at least 3 trading cycles with crypto bots" },

      // Upgrade Achievements
      { name: "Upgrade to PRO", icon: () => <RoleImage role="PRO" size="sm" />, color: "#4DA2FF", unlocked: false, claimed: false, xp: 50, tooltip: "Upgrade to PRO membership for enhanced features" },
      { name: "Upgrade to ROYAL", icon: () => <RoleImage role="ROYAL" size="sm" />, color: "#FFD700", unlocked: false, claimed: false, xp: 75, tooltip: "Upgrade to ROYAL membership for premium benefits" },

      // NOMAD Referral Achievements
      { name: "Refer 10 NOMADs", icon: Users, color: "#6B7280", unlocked: false, claimed: false, xp: 75, tooltip: "Successfully refer 10 users who become NOMADs (KYC required)" },
      { name: "Refer 50 NOMADs", icon: Users, color: "#6B7280", unlocked: false, claimed: false, xp: 90, tooltip: "Successfully refer 50 users who become NOMADs (KYC required)" },
      { name: "Refer 100 NOMADs", icon: Users, color: "#6B7280", unlocked: false, claimed: false, xp: 100, tooltip: "Successfully refer 100 users who become NOMADs (KYC required)" },

      // PRO Referral Achievements
      { name: "Refer 1 PRO", icon: () => <RoleImage role="PRO" size="sm" />, color: "#4DA2FF", unlocked: false, claimed: false, xp: 60, tooltip: "Successfully refer 1 user who becomes a PRO member" },
      { name: "Refer 5 PRO", icon: () => <RoleImage role="PRO" size="sm" />, color: "#4DA2FF", unlocked: false, claimed: false, xp: 70, tooltip: "Successfully refer 5 users who become PRO members" },
      { name: "Refer 10 PRO", icon: () => <RoleImage role="PRO" size="sm" />, color: "#4DA2FF", unlocked: false, claimed: false, xp: 80, tooltip: "Successfully refer 10 users who become PRO members" },

      // ROYAL Referral Achievements
      { name: "Refer 1 ROYAL", icon: () => <RoleImage role="ROYAL" size="sm" />, color: "#FFD700", unlocked: false, claimed: false, xp: 60, tooltip: "Successfully refer 1 user who becomes a ROYAL member" },
      { name: "Refer 3 ROYAL", icon: () => <RoleImage role="ROYAL" size="sm" />, color: "#FFD700", unlocked: false, claimed: false, xp: 70, tooltip: "Successfully refer 3 users who become ROYAL members" },
      { name: "Refer 5 ROYAL", icon: () => <RoleImage role="ROYAL" size="sm" />, color: "#FFD700", unlocked: true, claimed: false, xp: 80, tooltip: "Successfully refer 5 users who become ROYAL members" }
    ]
  })

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'NOMAD' | 'PRO' | 'ROYAL'>('ALL')
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'ALL' | '1-3' | '4-6' | '7-10'>('ALL')

  // Pagination states
  const [displayedCount, setDisplayedCount] = useState(5)
  const [showLatestOnly, setShowLatestOnly] = useState(false)

  const [invitedUsers] = useState<InvitedUser[]>([
    {
      id: "1",
      username: "CryptoTrader_01",
      email: "trader01@email.com",
      joinDate: "2024-02-15",
      status: "ROYAL",
      commission: 150,
      kycStatus: "verified",
      level: 8
    },
    {
      id: "2",
      username: "BlockchainFan",
      email: "blockchain@email.com",
      joinDate: "2024-02-12",
      status: "PRO",
      commission: 75,
      kycStatus: "verified",
      level: 6
    },
    {
      id: "3",
      username: "DeFiExplorer",
      email: "defi@email.com",
      joinDate: "2024-02-10",
      status: "NOMAD",
      commission: 0,
      kycStatus: "not_verified",
      level: 2
    },
    {
      id: "4",
      username: "NFTCollector",
      email: "nft@email.com",
      joinDate: "2024-02-08",
      status: "PRO",
      commission: 75,
      kycStatus: "pending",
      level: 5
    },
    {
      id: "5",
      username: "MetaTrader",
      email: "meta@email.com",
      joinDate: "2024-02-05",
      status: "ROYAL",
      commission: 150,
      kycStatus: "verified",
      level: 9
    },
    {
      id: "6",
      username: "YieldFarmer",
      email: "yield@email.com",
      joinDate: "2024-01-28",
      status: "PRO",
      commission: 75,
      kycStatus: "verified",
      level: 7
    },
    {
      id: "7",
      username: "TokenHunter",
      email: "hunter@email.com",
      joinDate: "2024-01-25",
      status: "NOMAD",
      commission: 0,
      kycStatus: "verified",
      level: 3
    },
    {
      id: "8",
      username: "SmartContract_Dev",
      email: "dev@email.com",
      joinDate: "2024-01-22",
      status: "ROYAL",
      commission: 150,
      kycStatus: "verified",
      level: 10
    },
    {
      id: "9",
      username: "CryptoWhale",
      email: "whale@email.com",
      joinDate: "2024-01-20",
      status: "PRO",
      commission: 75,
      kycStatus: "pending",
      level: 6
    },
    {
      id: "10",
      username: "DAppBuilder",
      email: "builder@email.com",
      joinDate: "2024-01-18",
      status: "PRO",
      commission: 75,
      kycStatus: "verified",
      level: 8
    },
    {
      id: "11",
      username: "Web3Pioneer",
      email: "pioneer@email.com",
      joinDate: "2024-01-15",
      status: "NOMAD",
      commission: 0,
      kycStatus: "not_verified",
      level: 1
    },
    {
      id: "12",
      username: "StakingMaster",
      email: "staking@email.com",
      joinDate: "2024-01-12",
      status: "ROYAL",
      commission: 150,
      kycStatus: "verified",
      level: 9
    }
  ])

  // Load profile image and achievement data from localStorage on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem('user-profile-image')
    if (savedImage) {
      setProfileData(prev => ({ ...prev, profileImage: savedImage }))
    }

    // Load achievement claim status from localStorage
    const savedAchievements = localStorage.getItem('user-achievements')
    if (savedAchievements) {
      try {
        const parsedAchievements = JSON.parse(savedAchievements)
        setProfileData(prev => ({
          ...prev,
          achievements: prev.achievements.map(achievement => {
            const saved = parsedAchievements.find((a: any) => a.name === achievement.name)
            return saved ? { ...achievement, claimed: saved.claimed } : achievement
          })
        }))
      } catch (error) {
        console.error('Error loading achievement data:', error)
      }
    }



    // Load XP data from localStorage
    const savedCurrentXP = localStorage.getItem('user-current-xp')
    const savedTotalXP = localStorage.getItem('user-total-xp')
    if (savedCurrentXP || savedTotalXP) {
      setProfileData(prev => ({
        ...prev,
        levelInfo: {
          ...prev.levelInfo,
          currentXP: savedCurrentXP ? parseInt(savedCurrentXP) : prev.levelInfo.currentXP,
          totalXP: savedTotalXP ? parseInt(savedTotalXP) : prev.levelInfo.totalXP
        }
      }))
    }

    // Load level claim status from localStorage
    const savedLevelClaims = localStorage.getItem('user-level-claims')
    if (savedLevelClaims) {
      try {
        const parsedLevelClaims = JSON.parse(savedLevelClaims)
        setLevelRewards(parsedLevelClaims)
      } catch (error) {
        console.error('Error parsing saved level claims:', error)
      }
    }

    // Close mobile tooltip when clicking outside
    const handleClickOutside = () => {
      setMobileTooltipOpen(null)
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

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

  const handleAddSocialMedia = () => {
    // This would open a modal or form to add new social media
    console.log('Add new social media platform')
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string
        // Save to localStorage
        localStorage.setItem('user-profile-image', imageDataUrl)
        // Update state
        setProfileData(prev => ({ ...prev, profileImage: imageDataUrl }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    localStorage.removeItem('user-profile-image')
    setProfileData(prev => ({ ...prev, profileImage: '' }))
  }

  const getStatusColor = (status: string) => {
    // No background color for status badges
    return 'bg-transparent text-white border-0'
  }

  const getRoleStatusColor = (role: string) => {
    // No background color for role status badges
    return 'bg-transparent text-white border-0'
  }

  const getKycStatusColor = (status: 'verified' | 'pending' | 'not_verified') => {
    switch (status) {
      case 'verified':
        return 'text-green-500'
      case 'pending':
        return 'text-yellow-500'
      case 'not_verified':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getKycStatusText = (status: 'verified' | 'pending' | 'not_verified') => {
    switch (status) {
      case 'verified':
        return 'KYC'
      case 'pending':
        return 'KYC'
      case 'not_verified':
        return 'KYC'
      default:
        return 'KYC'
    }
  }

  // Filter and search logic
  const filteredUsers = invitedUsers.filter(user => {
    // Role filter
    const roleMatch = selectedRoleFilter === 'ALL' || user.status === selectedRoleFilter

    // Level filter
    const levelMatch = selectedLevelFilter === 'ALL' ||
      (selectedLevelFilter === '1-3' && user.level >= 1 && user.level <= 3) ||
      (selectedLevelFilter === '4-6' && user.level >= 4 && user.level <= 6) ||
      (selectedLevelFilter === '7-10' && user.level >= 7 && user.level <= 10)

    // Search filter (search in username and email)
    const searchMatch = searchTerm === '' ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    return roleMatch && levelMatch && searchMatch
  })

  // Sort by join date (newest first) and get latest 5 or paginated results
  const sortedUsers = [...filteredUsers].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())

  // Get latest 5 referrals for the "Latest Referrals" section
  const latestReferrals = sortedUsers.slice(0, 5)

  // Get displayed users based on pagination
  const displayedUsers = showLatestOnly ? latestReferrals : sortedUsers.slice(0, displayedCount)

  // Show more functionality
  const handleShowMore = () => {
    setDisplayedCount(prev => prev + 5)
  }

  const handleToggleLatest = () => {
    setShowLatestOnly(!showLatestOnly)
    setDisplayedCount(5) // Reset pagination when switching views
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

  // Referral action handlers
  const handleDirectMessage = (user: InvitedUser) => {
    // In a real app, this would open a direct message interface
    console.log(`Opening direct message to ${user.username}`)
    // You could integrate with a chat system or messaging API
    alert(`Direct message feature would open for ${user.username}`)
  }

  const handleSendEmail = (user: InvitedUser) => {
    // In a real app, this would open email composer or send via API
    console.log(`Sending email to ${user.email}`)
    const subject = encodeURIComponent('Message from AIONET')
    const body = encodeURIComponent(`Hi ${user.username},\n\nI hope you're enjoying your experience with AIONET!\n\nBest regards`)
    window.open(`mailto:${user.email}?subject=${subject}&body=${body}`, '_blank')
  }

  const handleSubscriptionReminder = (user: InvitedUser) => {
    // In a real app, this would send a subscription reminder via API
    console.log(`Sending subscription reminder to ${user.username}`)
    alert(`Subscription reminder sent to ${user.username}!\n\nThey will receive an email about upgrading their membership.`)
  }

  const handleSpecialBonusOffer = (user: InvitedUser) => {
    // In a real app, this would send a special bonus offer via API
    console.log(`Sending special bonus offer to ${user.username}`)
    alert(`Special bonus offer sent to ${user.username}!\n\nThey will receive an exclusive promotion via email and in-app notification.`)
  }

  const handleClaimAchievement = (achievement: any) => {
    setClaimingAchievement(achievement)
    setShowClaimDialog(true)
  }

  const confirmClaimAchievement = async () => {
    if (!claimingAchievement) return

    setIsClaimingPoints(true)

    // Simulate claim process delay for better UX
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Update achievement as claimed and add XP
    setProfileData(prev => {
      const updatedAchievements = prev.achievements.map(achievement =>
        achievement.name === claimingAchievement.name
          ? { ...achievement, claimed: true }
          : achievement
      )

      const newCurrentXP = prev.levelInfo.currentXP + claimingAchievement.xp
      const newTotalXP = prev.levelInfo.totalXP + claimingAchievement.xp

      // Save to localStorage
      localStorage.setItem('user-achievements', JSON.stringify(updatedAchievements))
      localStorage.setItem('user-current-xp', newCurrentXP.toString())
      localStorage.setItem('user-total-xp', newTotalXP.toString())

      return {
        ...prev,
        achievements: updatedAchievements,
        levelInfo: {
          ...prev.levelInfo,
          currentXP: newCurrentXP,
          totalXP: newTotalXP
        }
      }
    })

    setIsClaimingPoints(false)
    setShowClaimDialog(false)
    setClaimingAchievement(null)
  }

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Profile Info + Referral Link - Centered */}
            <div className="flex flex-col items-center text-center">
              <div className="relative group mb-4 mt-2">
                <Avatar className="h-36 w-36 bg-blue-100">
                  <AvatarImage src={profileData.profileImage} alt={profileData.name} />
                  <AvatarFallback className="bg-[#4DA2FF] text-white text-3xl font-semibold">
                    {profileData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Upload overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                     onClick={handleImageUpload}>
                  <Camera className="w-6 h-6 text-white" />
                </div>

                {/* Remove image button (only show if image exists) */}
                {profileData.profileImage && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors duration-200"
                    title="Remove image"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <h2 className="text-2xl font-bold text-white">{profileData.name}</h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <p className="text-[#C0E6FF] text-sm">{profileData.username}</p>
                <Badge className={`${getRoleStatusColor(tier)} text-xs`}>
                  <div className="flex items-center gap-1">
                    <RoleImage role={tier as "NOMAD" | "PRO" | "ROYAL"} size="md" />
                    {tier}
                  </div>
                </Badge>
              </div>

              {/* Profile Level and KYC Status */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge className="bg-[#4DA2FF] text-white">
                  Profile Level 5
                </Badge>
                {profileData.kycStatus === "verified" ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-semibold text-sm">KYC Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-500 font-semibold text-sm">KYC Not Verified</span>
                  </div>
                )}
              </div>

              {/* Referral Link */}
              <div className="mb-6 w-full">
                <h3 className="text-white font-semibold mb-3">Referral Link</h3>
                <div className="space-y-3">
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
                  <div className="text-[#C0E6FF] text-xs text-center space-y-1">
                    <p className="font-semibold">Earn additional bonuses from your referrals:</p>
                    <p>10 Points for every Copy Trade within the 10% Cycle.</p>
                    <p>100 Points for each PRO purchase made by your referrals.</p>
                    <p>375 Points for every ROYAL purchase made by your referrals.</p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="w-full">
                <h3 className="text-white font-semibold mb-3 text-center">Social Media</h3>
                <div className="space-y-2">
                  {profileData.socialMedia.map((social, index) => {
                    return (
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
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Column 2: Achievement Badges - 6x3 Grid */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-center">Achievements</h3>
              <TooltipProvider>
                <div className="grid grid-cols-3 gap-1.5">
                  {profileData.achievements.map((achievement, index) => {
                    const Icon = achievement.icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>
                    const isLocked = !achievement.unlocked
                    const canClaim = achievement.unlocked && !achievement.claimed

                    const achievementCard = (
                      <div
                        key={index}
                        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all duration-200 cursor-pointer group relative min-h-[80px] ${
                          isLocked
                            ? 'bg-[#030f1c] border-[#C0E6FF]/10 opacity-60'
                            : achievement.claimed
                            ? 'bg-[#1a2f51] border-green-500/30 opacity-80'
                            : 'bg-[#1a2f51] border-[#C0E6FF]/20 hover:border-[#C0E6FF]/40'
                        }`}
                        onClick={(e) => handleMobileTooltipClick(index, e)}
                      >
                        {/* Claimed badge */}
                        {achievement.claimed && (
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

                        {/* Main content - centered for locked, flex for unlocked with buttons */}
                        <div className={`flex flex-col items-center ${canClaim ? 'justify-between h-full' : 'justify-center'} gap-1`}>
                          <div className="flex flex-col items-center gap-2">
                            {/* Icon and text in horizontal layout - text hidden on mobile */}
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex items-center justify-center transition-transform duration-200 ${
                                  !isLocked ? 'group-hover:scale-110' : ''
                                }`}
                              >
                                {isLocked ? (
                                  <div
                                    className="p-2 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: `${achievement.color}20` }}
                                  >
                                    <Lock
                                      className="w-5 h-5"
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
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 object-contain"
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
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 object-contain"
                                      />
                                    )
                                  } else if (Icon && typeof Icon === 'function') {
                                    return (
                                      <div
                                        className="p-2 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: `${achievement.color}20` }}
                                      >
                                        <Icon
                                          className="w-5 h-5"
                                          style={{ color: achievement.color }}
                                        />
                                      </div>
                                    )
                                  } else {
                                    // Fallback for achievements without icons
                                    return (
                                      <div
                                        className="p-2 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: `${achievement.color}20` }}
                                      >
                                        <div
                                          className="w-5 h-5 rounded-full"
                                          style={{ backgroundColor: achievement.color }}
                                        />
                                      </div>
                                    )
                                  }
                                })()}
                              </div>
                              {/* Text hidden on mobile (md:block = show on medium screens and up) */}
                              <span className={`hidden md:block text-xs text-center leading-tight ${
                                isLocked ? 'text-[#6B7280]' : achievement.claimed ? 'text-green-400' : 'text-[#C0E6FF]'
                              }`}>
                                {achievement.name.split(' ').map((word, i) => (
                                  <span key={i} className="block">{word}</span>
                                ))}
                              </span>
                            </div>
                          </div>

                          {/* Claim button for unlocked, unclaimed achievements */}
                          {canClaim && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleClaimAchievement(achievement)
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs h-4 px-1 w-full mt-1"
                            >
                              Claim
                            </Button>
                          )}
                        </div>
                      </div>
                    )

                    // Always show tooltip if available
                    if (achievement.tooltip) {
                      return (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            {achievementCard}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{achievement.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    }

                    return achievementCard
                  })}
                </div>
              </TooltipProvider>
            </div>

            {/* Column 3: Level Progress */}
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
              <div className="mb-6">
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

              {/* Level Grid Component */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3 text-center">Level Rewards</h4>
                <div className="grid grid-cols-5 gap-2">
                  {levelRewards.map((reward) => (
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

              {/* Channels Section */}
              <div className="mb-6">
                {/* Channels Joined */}
                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-3 text-center">Channels Joined</h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { id: '1', name: 'Daily Market Updates', type: 'free', price: 0, subscribers: 8500, color: '#10b981' },
                      { id: '2', name: 'Premium Trading Signals', type: 'premium', price: 5.0, subscribers: 2100, color: '#f59e0b' },
                      { id: '3', name: 'DeFi Basics', type: 'free', price: 0, subscribers: 9200, color: '#3b82f6' },
                      { id: '4', name: 'Advanced Bot Strategies', type: 'premium', price: 12.0, subscribers: 2100, color: '#f97316' },
                    ].map((channel) => (
                      <TooltipProvider key={channel.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 border-2 border-[#C0E6FF]/20"
                              style={{ backgroundColor: channel.color }}
                            >
                              <Hash className="w-4 h-4 text-white" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#1a2f51] border border-[#C0E6FF]/20 text-white p-3 max-w-xs">
                            <div className="space-y-2">
                              <div className="font-semibold text-sm">{channel.name}</div>
                              <div className="flex items-center gap-2 text-xs">
                                <Badge className={`${
                                  channel.type === 'free'
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                } text-xs`}>
                                  {channel.type.toUpperCase()}
                                </Badge>
                                {channel.type !== 'free' && (
                                  <span className="text-[#C0E6FF]">{channel.price} SUI</span>
                                )}
                              </div>
                              <div className="text-xs text-[#C0E6FF]">
                                {channel.subscribers.toLocaleString()} subscribers
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>

                {/* Channels Owned */}
                <div>
                  <h4 className="text-white font-semibold mb-3 text-center">Channels Owned</h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { id: '5', name: 'My Trading Tips', type: 'premium', price: 8.0, subscribers: 1250, color: '#8b5cf6' },
                      { id: '6', name: 'Crypto News Daily', type: 'free', price: 0, subscribers: 3400, color: '#06b6d4' },
                    ].map((channel) => (
                      <TooltipProvider key={channel.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 border-2 border-yellow-400/50"
                              style={{ backgroundColor: channel.color }}
                            >
                              <Crown className="w-4 h-4 text-white" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#1a2f51] border border-[#C0E6FF]/20 text-white p-3 max-w-xs">
                            <div className="space-y-2">
                              <div className="font-semibold text-sm flex items-center gap-2">
                                {channel.name}
                                <Crown className="w-3 h-3 text-yellow-400" />
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <Badge className={`${
                                  channel.type === 'free'
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                } text-xs`}>
                                  {channel.type.toUpperCase()}
                                </Badge>
                                {channel.type !== 'free' && (
                                  <span className="text-[#C0E6FF]">{channel.price} SUI</span>
                                )}
                              </div>
                              <div className="text-xs text-[#C0E6FF]">
                                {channel.subscribers.toLocaleString()} subscribers
                              </div>
                              <div className="text-xs text-yellow-400">
                                Owner
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">Total Invites</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">{metrics.totalInvites}</p>
                <p className="text-xs text-[#C0E6FF] mt-1">Users invited via your link</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">New Users</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">{metrics.newUsers}</p>
                <p className="text-xs text-[#C0E6FF] mt-1">Successfully joined</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">Total Points</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">{metrics.totalCommission.toLocaleString()}</p>
                <p className="text-xs text-[#C0E6FF] mt-1">Lifetime earnings</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">Conversion Rate</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">
                  {Math.round((metrics.newUsers / metrics.totalInvites) * 100)}%
                </p>
                <p className="text-xs text-[#C0E6FF] mt-1">Invite to signup rate</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <Badge className="bg-[#4DA2FF] text-white">68%</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invited Users Table */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          {/* Header with Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            {/* Title and View Toggle */}
            <div className="flex items-center gap-4 text-[#FFFFFF]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4DA2FF]" />
                <h3 className="text-xl font-semibold">Referrals</h3>
              </div>

              {/* View Toggle Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleToggleLatest}
                  size="sm"
                  variant={showLatestOnly ? "default" : "outline"}
                  className={showLatestOnly
                    ? "bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white text-xs h-7 px-3"
                    : "border-[#C0E6FF]/50 text-[#C0E6FF] hover:bg-[#C0E6FF]/10 text-xs h-7 px-3"
                  }
                >
                  Latest 5
                </Button>
                <Button
                  onClick={handleToggleLatest}
                  size="sm"
                  variant={!showLatestOnly ? "default" : "outline"}
                  className={!showLatestOnly
                    ? "bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white text-xs h-7 px-3"
                    : "border-[#C0E6FF]/50 text-[#C0E6FF] hover:bg-[#C0E6FF]/10 text-xs h-7 px-3"
                  }
                >
                  All Referrals
                </Button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#C0E6FF]" />
                <Input
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF] placeholder:text-[#C0E6FF]/60"
                />
              </div>

              {/* Role Filter */}
              <div className="w-full sm:w-48">
                <Select value={selectedRoleFilter} onValueChange={(value: 'ALL' | 'NOMAD' | 'PRO' | 'ROYAL') => setSelectedRoleFilter(value)}>
                  <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF]">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-[#C0E6FF]" />
                      <SelectValue placeholder="Filter by role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2f51] border-[#C0E6FF]/30">
                    <SelectItem value="ALL" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">All Roles</SelectItem>
                    <SelectItem value="NOMAD" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <RoleImage role="NOMAD" size="sm" />
                        NOMAD
                      </div>
                    </SelectItem>
                    <SelectItem value="PRO" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <RoleImage role="PRO" size="sm" />
                        PRO
                      </div>
                    </SelectItem>
                    <SelectItem value="ROYAL" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <RoleImage role="ROYAL" size="sm" />
                        ROYAL
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Level Filter */}
              <div className="w-full sm:w-48">
                <Select value={selectedLevelFilter} onValueChange={(value: 'ALL' | '1-3' | '4-6' | '7-10') => setSelectedLevelFilter(value)}>
                  <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF]">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#C0E6FF]" />
                      <SelectValue placeholder="Filter by level" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2f51] border-[#C0E6FF]/30">
                    <SelectItem value="ALL" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">All Levels</SelectItem>
                    <SelectItem value="1-3" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Award className="w-3 h-3 text-[#4DA2FF]" />
                        Level 1-3
                      </div>
                    </SelectItem>
                    <SelectItem value="4-6" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Award className="w-3 h-3 text-[#4DA2FF]" />
                        Level 4-6
                      </div>
                    </SelectItem>
                    <SelectItem value="7-10" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Award className="w-3 h-3 text-[#4DA2FF]" />
                        Level 7-10
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {displayedUsers.length > 0 ? (
              displayedUsers.map((user) => {
                const [isExpanded, setIsExpanded] = React.useState(false)

                return (
                  <div key={user.id} className="bg-[#030f1c] border border-[#C0E6FF]/20 rounded-lg overflow-hidden">
                    {/* Main User Info */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold text-base">{user.username}</span>
                          <Badge className={`${getKycStatusColor(user.kycStatus)} bg-transparent border-0 text-xs font-semibold px-1 py-0`}>
                            {getKycStatusText(user.kycStatus)}
                          </Badge>
                        </div>
                        <MoreHorizontal className={`w-4 h-4 text-[#C0E6FF] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="w-3 h-3 text-[#C0E6FF]" />
                        <span className="text-[#C0E6FF] text-sm">{user.email}</span>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="w-3 h-3 text-[#4DA2FF]" />
                            <span className="text-[#C0E6FF] text-sm">Level {user.level}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-[#C0E6FF]" />
                            <span className="text-[#C0E6FF] text-xs">{new Date(user.joinDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(user.status)} mb-2`}>
                            <div className="flex items-center gap-1">
                              <RoleImage role={user.status as "NOMAD" | "PRO" | "ROYAL"} size="sm" />
                              <span className="text-xs">{user.status}</span>
                            </div>
                          </Badge>
                          <div className="text-[#4DA2FF] font-bold text-lg">
                            {user.commission.toLocaleString()}
                            <span className="text-xs ml-1">SUI</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Action Buttons */}
                    {isExpanded && (
                      <div className="bg-[#0a1628] p-4 border-t border-[#C0E6FF]/20">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Direct Message Button */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDirectMessage(user)
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-10 w-full"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>

                          {/* Send Email Button */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSendEmail(user)
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-sm h-10 w-full"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </Button>

                          {/* Subscription Reminder Button */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSubscriptionReminder(user)
                            }}
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white text-sm h-10 w-full"
                          >
                            <Bell className="w-4 h-4 mr-2" />
                            Remind
                          </Button>

                          {/* Special Bonus Offer Button */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSpecialBonusOffer(user)
                            }}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white text-sm h-10 w-full"
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            Bonus
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="bg-[#030f1c] border border-[#C0E6FF]/20 rounded-lg p-8 text-center">
                <Search className="w-8 h-8 text-[#C0E6FF]/50 mx-auto mb-2" />
                <p className="text-sm text-[#C0E6FF]">No referrals found matching your criteria</p>
                <p className="text-xs text-[#C0E6FF]/70">Try adjusting your search or filter settings</p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#C0E6FF]/20">
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[140px]">Username</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[180px]">Email</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[100px]">Join Date</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[80px]">Level</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[100px]">Status</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[80px]">SUI</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.length > 0 ? (
                  displayedUsers.map((user) => {
                    const [isHovered, setIsHovered] = React.useState(false)

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-[#C0E6FF]/10 hover:bg-[#4DA2FF]/5 transition-colors cursor-pointer"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      >
                        {!isHovered ? (
                          // Normal row content
                          <>
                            <td className="py-3 px-2 text-left text-[#FFFFFF] text-sm">
                              <div className="flex items-center gap-2">
                                <span className="truncate">{user.username}</span>
                                <Badge className={`${getKycStatusColor(user.kycStatus)} bg-transparent border-0 text-xs font-semibold px-1 py-0`}>
                                  {getKycStatusText(user.kycStatus)}
                                </Badge>
                                <MoreHorizontal className="w-3 h-3 text-[#C0E6FF]/60 ml-auto" />
                              </div>
                            </td>
                            <td className="py-3 px-2 text-left text-[#C0E6FF] text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-left text-[#C0E6FF] text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                <span className="text-xs">{new Date(user.joinDate).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-left text-[#FFFFFF] text-sm">
                              <div className="flex items-center gap-2">
                                <Award className="w-3 h-3 flex-shrink-0 text-[#4DA2FF]" />
                                <span className="font-semibold">{user.level}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-left">
                              <Badge className={getStatusColor(user.status)}>
                                <div className="flex items-center gap-1">
                                  <RoleImage role={user.status as "NOMAD" | "PRO" | "ROYAL"} size="sm" />
                                  <span className="text-xs">{user.status}</span>
                                </div>
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-left text-[#FFFFFF] text-sm font-semibold">
                              {user.commission.toLocaleString()}
                            </td>
                          </>
                        ) : (
                          // Action buttons row spanning all columns
                          <td colSpan={6} className="py-3 px-4 bg-[#0a1628] border border-[#C0E6FF]/30">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                              <div className="flex items-center gap-3">
                                <div className="text-left">
                                  <p className="text-white font-semibold text-sm">{user.username}</p>
                                  <p className="text-[#C0E6FF] text-xs">{user.email}</p>
                                </div>
                              </div>

                              <div className="flex gap-2 flex-wrap">
                                {/* Direct Message Button */}
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDirectMessage(user)
                                  }}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-2 lg:px-3"
                                >
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  <span className="hidden lg:inline">Message</span>
                                  <span className="lg:hidden">Msg</span>
                                </Button>

                                {/* Send Email Button */}
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSendEmail(user)
                                  }}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 px-2 lg:px-3"
                                >
                                  <Mail className="w-3 h-3 mr-1" />
                                  <span className="hidden lg:inline">Email</span>
                                  <span className="lg:hidden">Mail</span>
                                </Button>

                                {/* Subscription Reminder Button */}
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSubscriptionReminder(user)
                                  }}
                                  size="sm"
                                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-8 px-2 lg:px-3"
                                >
                                  <Bell className="w-3 h-3 mr-1" />
                                  <span className="hidden lg:inline">Remind</span>
                                  <span className="lg:hidden">Rem</span>
                                </Button>

                                {/* Special Bonus Offer Button */}
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSpecialBonusOffer(user)
                                  }}
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 px-2 lg:px-3"
                                >
                                  <Gift className="w-3 h-3 mr-1" />
                                  <span className="hidden lg:inline">Bonus</span>
                                  <span className="lg:hidden">Bon</span>
                                </Button>
                              </div>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#C0E6FF]">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-[#C0E6FF]/50" />
                        <p className="text-sm">No referrals found matching your criteria</p>
                        <p className="text-xs text-[#C0E6FF]/70">Try adjusting your search or filter settings</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Show More Button and Results Count */}
          <div className="mt-4 space-y-3">
            {/* Show More Button */}
            {!showLatestOnly && displayedUsers.length < filteredUsers.length && (
              <div className="text-center">
                <Button
                  onClick={handleShowMore}
                  variant="outline"
                  size="sm"
                  className="border-[#C0E6FF]/50 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                >
                  Show More ({Math.min(5, filteredUsers.length - displayedUsers.length)} more)
                </Button>
              </div>
            )}

            {/* Results Count */}
            <div className="text-center">
              <p className="text-[#C0E6FF] text-sm">
                {showLatestOnly ? (
                  <>Showing latest {displayedUsers.length} of {filteredUsers.length} referrals</>
                ) : (
                  <>Showing {displayedUsers.length} of {filteredUsers.length} referrals</>
                )}
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedRoleFilter !== 'ALL' && ` with ${selectedRoleFilter} role`}
                {selectedLevelFilter !== 'ALL' && ` at level ${selectedLevelFilter}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Festive Claim Dialog */}
      {showClaimDialog && claimingAchievement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1628] border border-[#C0E6FF]/20 rounded-xl p-6 max-w-md w-full mx-4 relative overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-8 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></div>
              <div className="absolute bottom-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            </div>

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
                  <h3 className="text-2xl font-bold text-white mb-2">✨ Claiming XP...</h3>
                  <p className="text-[#C0E6FF] mb-4">Adding {claimingAchievement.xp} XP to your account!</p>
                  <div className="w-full bg-[#1a2f51] rounded-full h-2 mb-4">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full animate-pulse w-full"></div>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
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
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-8 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></div>
              <div className="absolute bottom-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            </div>

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
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* XP Level Progression & Rewards Modal */}
      {showProgressionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1628] border border-[#C0E6FF]/20 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                XP Level Progression & Rewards
              </h3>
              <Button
                onClick={() => setShowProgressionModal(false)}
                variant="outline"
                size="sm"
                className="border-[#C0E6FF]/50 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
              >
                ✕
              </Button>
            </div>

            <div className="bg-[#1a2f51] rounded-lg p-4 border border-[#C0E6FF]/20 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#C0E6FF]/20">
                    <th className="text-center py-3 px-2 text-[#C0E6FF] font-medium">🏆 Level</th>
                    <th className="text-center py-3 px-2 text-[#C0E6FF] font-medium">🧪 XP Required</th>
                    <th className="text-center py-3 px-2 text-[#C0E6FF] font-medium">📈 XP from Previous</th>
                    <th className="text-center py-3 px-2 text-[#C0E6FF] font-medium">💰 Points Unlocked</th>
                    <th className="text-center py-3 px-2 text-[#C0E6FF] font-medium">💼 Total Points</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#C0E6FF]/10">
                    <td className="py-3 px-2 text-white font-semibold text-center">1</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">0</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">0</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">0</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">0</td>
                  </tr>
                  <tr className="border-b border-[#C0E6FF]/10">
                    <td className="py-3 px-2 text-white font-semibold text-center">2</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">50</td>
                    <td className="py-3 px-2 text-green-400 text-center">+50</td>
                    <td className="py-3 px-2 text-yellow-400 text-center">20</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">20</td>
                  </tr>
                  <tr className="border-b border-[#C0E6FF]/10">
                    <td className="py-3 px-2 text-white font-semibold text-center">3</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">120</td>
                    <td className="py-3 px-2 text-green-400 text-center">+70</td>
                    <td className="py-3 px-2 text-yellow-400 text-center">30</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">50</td>
                  </tr>
                  <tr className="border-b border-[#C0E6FF]/10">
                    <td className="py-3 px-2 text-white font-semibold text-center">4</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">210</td>
                    <td className="py-3 px-2 text-green-400 text-center">+90</td>
                    <td className="py-3 px-2 text-yellow-400 text-center">50</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">100</td>
                  </tr>
                  <tr className="border-b border-[#C0E6FF]/10">
                    <td className="py-3 px-2 text-white font-semibold text-center">5</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">330</td>
                    <td className="py-3 px-2 text-green-400 text-center">+120</td>
                    <td className="py-3 px-2 text-yellow-400 text-center">80</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">180</td>
                  </tr>
                  <tr className="border-b border-[#C0E6FF]/10">
                    <td className="py-3 px-2 text-white font-semibold text-center">6</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">480</td>
                    <td className="py-3 px-2 text-green-400 text-center">+150</td>
                    <td className="py-3 px-2 text-yellow-400 text-center">100</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">280</td>
                  </tr>
                  <tr className="border-b border-[#C0E6FF]/10">
                    <td className="py-3 px-2 text-white font-semibold text-center">7</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">660</td>
                    <td className="py-3 px-2 text-green-400 text-center">+180</td>
                    <td className="py-3 px-2 text-yellow-400 text-center">120</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">400</td>
                  </tr>
                  <tr className="border-b border-[#C0E6FF]/10">
                    <td className="py-3 px-2 text-white font-semibold text-center">8</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">830</td>
                    <td className="py-3 px-2 text-green-400 text-center">+170</td>
                    <td className="py-3 px-2 text-yellow-400 text-center">150</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">550</td>
                  </tr>
                  <tr className="border-b border-[#C0E6FF]/10">
                    <td className="py-3 px-2 text-white font-semibold text-center">9</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">940</td>
                    <td className="py-3 px-2 text-green-400 text-center">+110</td>
                    <td className="py-3 px-2 text-yellow-400 text-center">200</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">750</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 text-white font-semibold text-center">10</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">1000</td>
                    <td className="py-3 px-2 text-green-400 text-center">+60</td>
                    <td className="py-3 px-2 text-yellow-400 text-center">250</td>
                    <td className="py-3 px-2 text-[#C0E6FF] text-center">1000</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-4 text-center">
                <p className="text-[#C0E6FF] text-sm">
                  🔓 Earn XP by completing achievements. Each new level unlocks bigger rewards!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
