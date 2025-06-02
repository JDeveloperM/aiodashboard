"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RoleImage } from "@/components/ui/role-image"
import { useSubscription } from "@/contexts/subscription-context"
import { usePoints } from "@/contexts/points-context"
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
  Link
} from "lucide-react"

// Custom X (formerly Twitter) icon component
const XIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

// Official Discord icon component
const DiscordIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
  </svg>
)

// Official Telegram icon component
const TelegramIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

interface InvitedUser {
  id: string
  username: string
  email: string
  joinDate: string
  status: 'Copier' | 'PRO' | 'ROYAL'
  commission: number
}

export function ProfileSystem() {
  const { tier } = useSubscription()
  const { addPoints } = usePoints()
  const [affiliateLink] = useState("https://metadudesx.io/ref/MDX789ABC")
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

      // Add points to the PointsContext (this will update the header)
      addPoints(claimingLevel.points, `Level ${claimingLevel.level} reward`)

      // Update profile points
      setProfileData(prev => {
        const newPoints = prev.points + claimingLevel.points
        // Save to localStorage to sync with header
        localStorage.setItem('user-points', newPoints.toString())
        return {
          ...prev,
          points: newPoints
        }
      })

      setIsClaimingLevelPoints(false)
      setShowLevelClaimDialog(false)
      setClaimingLevel(null)
    }, 2000)
  }

  const [metrics] = useState({
    totalInvites: 47,
    newUsers: 32,
    copiers: 18,
    proUsers: 10,
    royalUsers: 4,
    totalCommission: 2450.75
  })

  // Profile data with image upload functionality
  const [profileData, setProfileData] = useState({
    name: "MetaDude User",
    username: "@metadude_user",
    profileImage: "", // Will be loaded from localStorage
    points: 12450, // User points
    kycStatus: "verified", // "verified" or "not-verified"
    socialMedia: [
      {
        platform: "Discord",
        icon: DiscordIcon,
        url: "https://discord.gg/metadudesx",
        connected: true,
        username: "MetaDude#1234",
        color: "#5865F2"
      },
      {
        platform: "Telegram",
        icon: TelegramIcon,
        url: "https://t.me/metadudesx",
        connected: true,
        username: "@metadude_tg",
        color: "#0088CC"
      },
      {
        platform: "X",
        icon: XIcon,
        url: "https://x.com/metadudesx",
        connected: false,
        username: "",
        color: "#000000"
      }
    ],
    levelInfo: {
      currentLevel: 5,
      nextLevel: 6,
      currentXP: 2450,
      nextLevelXP: 5000,
      totalXP: 12450
    },
    achievements: [
      // Profile & Account Achievements
      { name: "Profile Picture", icon: User, color: "#4DA2FF", unlocked: true, claimed: false, xp: 15, tooltip: "Upload a profile picture to personalize your account" },
      { name: "KYC Verification", icon: CheckCircle2, color: "#10B981", unlocked: true, claimed: false, xp: 25, tooltip: "Complete KYC verification to unlock full platform features" },
      { name: "Reach Level 5", icon: Star, color: "#FFD700", unlocked: true, claimed: false, xp: 50, tooltip: "Reach profile level 5 to unlock advanced features" },

      // Social Media Achievements
      { name: "Connect Discord", icon: DiscordIcon, color: "#5865F2", unlocked: true, claimed: false, xp: 15, tooltip: "Connect your Discord account to join our community" },
      { name: "Connect Telegram", icon: TelegramIcon, color: "#0088CC", unlocked: true, claimed: false, xp: 15, tooltip: "Connect your Telegram account for updates and support" },
      { name: "Connect X", icon: XIcon, color: "#000000", unlocked: false, claimed: false, xp: 15, tooltip: "Connect your X (Twitter) account to stay updated" },

      // Trading & Bots Achievements
      { name: "Connect Bybit", icon: Link, color: "#F7931A", unlocked: false, claimed: false, xp: 25, tooltip: "Connect your Bybit account to start automated trading" },
      { name: "Follow Apollon Bot", icon: Bot, color: "#9333EA", unlocked: false, claimed: false, xp: 25, tooltip: "Follow the Apollon Bot for advanced crypto trading signals" },
      { name: "Follow Hermes Bot", icon: Bot, color: "#06B6D4", unlocked: false, claimed: false, xp: 25, tooltip: "Follow the Hermes Bot for high-frequency trading strategies" },
      { name: "Make 3 Cycles", icon: Repeat, color: "#10B981", unlocked: false, claimed: false, xp: 50, tooltip: "Complete at least 3 trading cycles with crypto bots" },

      // Upgrade Achievements
      { name: "Upgrade to PRO", icon: () => <RoleImage role="PRO" size="sm" />, color: "#4DA2FF", unlocked: false, claimed: false, xp: 50, tooltip: "Upgrade to PRO membership for enhanced features" },
      { name: "Upgrade to ROYAL", icon: () => <RoleImage role="ROYAL" size="sm" />, color: "#FFD700", unlocked: false, claimed: false, xp: 75, tooltip: "Upgrade to ROYAL membership for premium benefits" },

      // Copier Referral Achievements
      { name: "Refer 10 Copiers", icon: Users, color: "#6B7280", unlocked: false, claimed: false, xp: 75, tooltip: "Successfully refer 10 users who become Copiers (KYC required)" },
      { name: "Refer 50 Copiers", icon: Users, color: "#6B7280", unlocked: false, claimed: false, xp: 90, tooltip: "Successfully refer 50 users who become Copiers (KYC required)" },
      { name: "Refer 100 Copiers", icon: Users, color: "#6B7280", unlocked: false, claimed: false, xp: 100, tooltip: "Successfully refer 100 users who become Copiers (KYC required)" },

      // PRO Referral Achievements
      { name: "Refer 1 PRO", icon: () => <RoleImage role="PRO" size="sm" />, color: "#4DA2FF", unlocked: false, claimed: false, xp: 60, tooltip: "Successfully refer 1 user who becomes a PRO member" },
      { name: "Refer 5 PRO", icon: () => <RoleImage role="PRO" size="sm" />, color: "#4DA2FF", unlocked: false, claimed: false, xp: 70, tooltip: "Successfully refer 5 users who become PRO members" },
      { name: "Refer 10 PRO", icon: () => <RoleImage role="PRO" size="sm" />, color: "#4DA2FF", unlocked: false, claimed: false, xp: 80, tooltip: "Successfully refer 10 users who become PRO members" },

      // ROYAL Referral Achievements
      { name: "Refer 1 ROYAL", icon: () => <RoleImage role="ROYAL" size="sm" />, color: "#FFD700", unlocked: false, claimed: false, xp: 60, tooltip: "Successfully refer 1 user who becomes a ROYAL member" },
      { name: "Refer 3 ROYAL", icon: () => <RoleImage role="ROYAL" size="sm" />, color: "#FFD700", unlocked: false, claimed: false, xp: 70, tooltip: "Successfully refer 3 users who become ROYAL members" },
      { name: "Refer 5 ROYAL", icon: () => <RoleImage role="ROYAL" size="sm" />, color: "#FFD700", unlocked: false, claimed: false, xp: 80, tooltip: "Successfully refer 5 users who become ROYAL members" }
    ]
  })

  const [invitedUsers] = useState<InvitedUser[]>([
    {
      id: "1",
      username: "CryptoTrader_01",
      email: "trader01@email.com",
      joinDate: "2024-01-15",
      status: "ROYAL",
      commission: 150.00
    },
    {
      id: "2",
      username: "BlockchainFan",
      email: "blockchain@email.com",
      joinDate: "2024-01-12",
      status: "PRO",
      commission: 75.00
    },
    {
      id: "3",
      username: "DeFiExplorer",
      email: "defi@email.com",
      joinDate: "2024-01-10",
      status: "Copier",
      commission: 0.00
    },
    {
      id: "4",
      username: "NFTCollector",
      email: "nft@email.com",
      joinDate: "2024-01-08",
      status: "PRO",
      commission: 75.00
    },
    {
      id: "5",
      username: "MetaTrader",
      email: "meta@email.com",
      joinDate: "2024-01-05",
      status: "ROYAL",
      commission: 150.00
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

    // Load points from localStorage
    const savedPoints = localStorage.getItem('user-points')
    if (savedPoints) {
      setProfileData(prev => ({ ...prev, points: parseInt(savedPoints) }))
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
        title: 'Join MetadudesX',
        text: 'Join the MetadudesX community and start your Web3 journey!',
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
    switch (status) {
      case 'ROYAL':
        return 'bg-purple-500 text-white'
      case 'PRO':
        return 'bg-[#4DA2FF] text-white'
      case 'Copier':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getRoleStatusColor = (role: string) => {
    // Use the same blue background for all statuses
    return 'bg-[#4DA2FF] text-white'
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
              <div className="relative group mb-4">
                <Avatar className="h-24 w-24 bg-blue-100">
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
                    <RoleImage role={tier as "Copier" | "PRO" | "ROYAL"} size="sm" />
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

              {/* Social Media Links */}
              <div className="mb-6 w-full">
                <h3 className="text-white font-semibold mb-3 text-center">Social Media</h3>
                <div className="space-y-2">
                  {profileData.socialMedia.map((social, index) => {
                    const Icon = social.icon
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#1a2f51] border border-[#C0E6FF]/20 hover:border-[#4DA2FF]/40 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${social.color}15` }}
                          >
                            <Icon
                              className="w-4 h-4"
                              style={{ color: social.color }}
                            />
                          </div>
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

              {/* Referral Link */}
              <div className="w-full">
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
                  <p className="text-[#C0E6FF] text-xs text-center">
                    Earn 25% commission on PRO and ROYAL NFT purchases from your referrals.
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2: Achievement Badges - 6x3 Grid */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-center">Achievements</h3>
              <TooltipProvider>
                <div className="grid grid-cols-3 gap-1.5">
                  {profileData.achievements.map((achievement, index) => {
                    const Icon = achievement.icon
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
                                className={`p-2 rounded-full flex items-center justify-center transition-transform duration-200 ${
                                  !isLocked ? 'group-hover:scale-110' : ''
                                }`}
                                style={{ backgroundColor: `${achievement.color}20` }}
                              >
                                {isLocked ? (
                                  <Lock
                                    className="w-5 h-5"
                                    style={{ color: '#6B7280' }}
                                  />
                                ) : typeof Icon === 'function' ? (
                                  <Icon
                                    className="w-5 h-5"
                                    style={{ color: achievement.color }}
                                  />
                                ) : (
                                  <Icon
                                    className="w-5 h-5"
                                    style={{ color: achievement.color }}
                                  />
                                )}
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
                    style={{ width: `${(profileData.levelInfo.currentXP / profileData.levelInfo.nextLevelXP) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-[#C0E6FF]">
                  <span>{profileData.levelInfo.currentXP.toLocaleString()} XP</span>
                  <span>{profileData.levelInfo.nextLevelXP.toLocaleString()} XP</span>
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
                <p className="text-sm font-medium text-[#C0E6FF]">Total Commission</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">${metrics.totalCommission}</p>
                <p className="text-xs text-[#C0E6FF] mt-1">Lifetime earnings</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
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
          <div className="flex items-center gap-2 text-[#FFFFFF] mb-6">
            <Users className="w-5 h-5 text-[#4DA2FF]" />
            <h3 className="text-xl font-semibold">Recent Referrals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-[#C0E6FF]/20">
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium w-1/5">Username</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium w-1/3">Email</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium w-1/5">Join Date</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium w-1/6">Status</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium w-1/6">Commission</th>
                </tr>
              </thead>
              <tbody>
                {invitedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[#C0E6FF]/10 hover:bg-[#4DA2FF]/5 transition-colors">
                    <td className="py-3 px-2 text-left text-[#FFFFFF] text-sm truncate">{user.username}</td>
                    <td className="py-3 px-2 text-left text-[#C0E6FF] text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-left text-[#C0E6FF] text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>{new Date(user.joinDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-left">
                      <Badge className={getStatusColor(user.status)}>
                        <div className="flex items-center gap-1">
                          <RoleImage role={user.status as "Copier" | "PRO" | "ROYAL"} size="sm" />
                          {user.status}
                        </div>
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-left text-[#FFFFFF] text-sm font-semibold">
                      ${user.commission.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
