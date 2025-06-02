"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RoleImage } from "@/components/ui/role-image"
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
  Gamepad2
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
  const [affiliateLink] = useState("https://metadudesx.io/ref/MDX789ABC")
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    socialMedia: [
      {
        platform: "Discord",
        icon: DiscordIcon,
        url: "https://discord.gg/metadudesx",
        connected: true,
        color: "#5865F2"
      },
      {
        platform: "Telegram",
        icon: TelegramIcon,
        url: "https://t.me/metadudesx",
        connected: true,
        color: "#0088CC"
      },
      {
        platform: "YouTube",
        icon: Youtube,
        url: "https://youtube.com/@metadudesx",
        connected: false,
        color: "#FF0000"
      },
      {
        platform: "X",
        icon: XIcon,
        url: "https://x.com/metadudesx",
        connected: false,
        color: "#000000"
      }
    ],
    achievements: [
      { name: "Top Ambassador", icon: Crown, color: "#FFD700" },
      { name: "Community Star", icon: Star, color: "#4DA2FF" },
      { name: "Elite Recruiter", icon: Trophy, color: "#FF6B35" },
      { name: "Social Connector", icon: Award, color: "#10B981" },
      { name: "Platform Guardian", icon: Shield, color: "#8B5CF6" },
      { name: "Growth Master", icon: Zap, color: "#F59E0B" },
      { name: "Top Trader", icon: TrendingUp, color: "#00D4AA" },
      { name: "Top Member", icon: Users, color: "#FF1493" },
      { name: "Top Gamer", icon: Gamepad2, color: "#9333EA" }
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

  // Load profile image from localStorage on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem('user-profile-image')
    if (savedImage) {
      setProfileData(prev => ({ ...prev, profileImage: savedImage }))
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
              <p className="text-[#C0E6FF] text-sm mb-2">{profileData.username}</p>
              <Badge className="bg-[#4DA2FF] text-white mb-6">
                Profile Level 5
              </Badge>

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

            {/* Column 2: Achievement Badges - 3x3 Grid */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-center">Achievements</h3>
              <div className="grid grid-cols-3 gap-2">
                {profileData.achievements.map((achievement, index) => {
                  const Icon = achievement.icon
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#1a2f51] border border-[#C0E6FF]/20 hover:border-[#C0E6FF]/40 transition-all duration-200 cursor-pointer group"
                      title={achievement.name}
                    >
                      <div
                        className="p-2 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: `${achievement.color}20` }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: achievement.color }}
                        />
                      </div>
                      <span className="text-[#C0E6FF] text-xs text-center leading-tight">
                        {achievement.name.split(' ').map((word, i) => (
                          <span key={i} className="block">{word}</span>
                        ))}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Column 3: Social Media Links - 3x3 Grid */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-center">Social Media</h3>
              <div className="grid grid-cols-3 gap-2">
                {profileData.socialMedia.map((social, index) => {
                  const Icon = social.icon
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#1a2f51] border border-[#C0E6FF]/20 hover:border-[#4DA2FF]/40 transition-all duration-200 cursor-pointer group"
                      title={social.platform}
                    >
                      <div
                        className="p-2 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: `${social.color}15` }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: social.color }}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant={social.connected ? "default" : "outline"}
                        className={social.connected
                          ? "bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white text-xs h-5 px-1"
                          : "border-[#C0E6FF]/50 text-[#C0E6FF] hover:bg-[#C0E6FF]/10 text-xs h-5 px-1"
                        }
                        onClick={() => handleSocialConnect(social.platform, social.url)}
                      >
                        {social.connected ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  )
                })}
                {/* Add Social Media Button */}
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#1a2f51] border border-[#C0E6FF]/20 hover:border-[#4DA2FF]/40 transition-all duration-200 cursor-pointer group">
                  <div
                    className="p-2 rounded-full bg-gray-500/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                    onClick={handleAddSocialMedia}
                  >
                    <Plus className="w-4 h-4 text-gray-400" />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-400/50 text-gray-400 hover:bg-gray-400/10 text-xs h-5 px-1"
                    onClick={handleAddSocialMedia}
                  >
                    Add More
                  </Button>
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
    </div>
  )
}
