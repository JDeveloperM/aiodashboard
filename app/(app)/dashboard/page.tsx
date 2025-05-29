"use client"

import Link from "next/link"
import { useSubscription } from "@/contexts/subscription-context"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import WaterDrops from "@/components/ui/water-drops"
import { RoleImage } from "@/components/ui/role-image"
import { TrendingUp, Users, Copy, Zap, BookOpen, ArrowRight, CheckCircle, AlertCircle, Wifi, Crown, Star, ShoppingBag, MessageCircle, Send, Youtube, Instagram } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

// MetadudesX Community Analytics
const metadudesXAnalytics = {
  // Community Stats
  totalHolders: "283",
  copierUsers: "156", // Users with Copier tier (basic users)
  proHolders: "163",
  royalHolders: "120",
  targetHolders: "1100", // Goal for community growth
  dewhaleTargetHolders: "500", // Goal for DEWhale deployment

  // Community Growth
  discordMembers: "3,498",
  telegramMembers: "2,156",
  monthlyGrowth: "+15%"
}

// Navigation cards data
const navigationCards = [
  {
    title: "Copy Trading",
    description: "Automated trading bots for crypto, stocks, and forex markets",
    icon: Copy,
    href: "/copy-trading",
    features: ["Multiple Bot Types", "Automated Trading", "Performance Tracking"],
    color: "#4DA2FF"
  },
  {
    title: "Community",
    description: "Connect with traders, access exclusive content and portfolio ideas",
    icon: Users,
    href: "/community",
    features: ["Discord Access", "Portfolio Ideas", "Ambassador Program"],
    color: "#C0E6FF"
  },
  {
    title: "DApps",
    description: "Decentralized applications for advanced features",
    icon: Zap,
    href: "/dapps",
    features: ["NodeMe Pool", "RaffleCraft", "DEWhale Launchpad"],
    color: "#011829"
  },
  {
    title: "MetaGo Academy",
    description: "Educational courses on DeFi, NFTs and blockchain",
    icon: BookOpen,
    href: "/metago-academy",
    features: ["CEX & DEX Basics", "DeFi Courses", "NFT Education"],
    color: "#4DA2FF"
  },
  {
    title: "Marketplace",
    description: "Redeem points for exclusive items and rewards",
    icon: ShoppingBag,
    href: "/marketplace",
    features: ["Token Bundles", "Merchandise", "NFT Rewards"],
    color: "#C0E6FF"
  }
]

// Social platforms data
const socialPlatforms = [
  {
    name: "Discord",
    icon: DiscordIcon,
    url: "https://discord.gg/metadudesx",
    buttonText: "Join Server",
    color: "#5865F2",
    members: metadudesXAnalytics.discordMembers
  },
  {
    name: "Telegram",
    icon: TelegramIcon,
    url: "https://t.me/metadudesx",
    buttonText: "Join Channel",
    color: "#0088CC",
    members: metadudesXAnalytics.telegramMembers
  },
  {
    name: "YouTube",
    icon: Youtube,
    url: "https://youtube.com/@metadudesx",
    buttonText: "Subscribe",
    color: "#FF0000",
    members: "1.2K"
  },
  {
    name: "X",
    icon: XIcon,
    url: "https://x.com/metadudesx",
    buttonText: "Follow",
    color: "#000000",
    members: "3.5K"
  }
]



export default function Dashboard() {
  const { tier } = useSubscription()

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">MetadudesX Dashboard</h1>
          <p className="text-[#C0E6FF] mt-1">🇬🇷 Greek NFT-Gated Community</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-[#4DA2FF] text-white px-3 py-1">
            {metadudesXAnalytics.totalHolders} / {metadudesXAnalytics.targetHolders} Holders
          </Badge>
        </div>
      </div>

      {/* MetadudesX Community Stats */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Total NFT Holders */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Total NFT Holders</p>
                <p className="text-2xl font-bold text-white">{metadudesXAnalytics.totalHolders}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">Target: {metadudesXAnalytics.targetHolders}</span>
                </div>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Copier Users */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Copier Users</p>
                <p className="text-2xl font-bold text-white">{metadudesXAnalytics.copierUsers}</p>
                <div className="flex items-center mt-1">
                  <RoleImage role="Copier" size="sm" className="mr-1" />
                  <span className="text-[#C0E6FF] text-sm">Basic Tier</span>
                </div>
              </div>
              <div className="bg-gray-500/20 p-3 rounded-full">
                <RoleImage role="Copier" size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* PRO NFT Holders */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">PRO NFT Holders</p>
                <p className="text-2xl font-bold text-white">{metadudesXAnalytics.proHolders}</p>
                <div className="flex items-center mt-1">
                  <RoleImage role="PRO" size="sm" className="mr-1" />
                  <span className="text-[#C0E6FF] text-sm">PRO Tier</span>
                </div>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <RoleImage role="PRO" size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* ROYAL NFT Holders */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">ROYAL NFT Holders</p>
                <p className="text-2xl font-bold text-white">{metadudesXAnalytics.royalHolders}</p>
                <div className="flex items-center mt-1">
                  <RoleImage role="ROYAL" size="sm" className="mr-1" />
                  <span className="text-[#C0E6FF] text-sm">ROYAL Tier</span>
                </div>
              </div>
              <div className="bg-yellow-400/20 p-3 rounded-full">
                <RoleImage role="ROYAL" size="md" />
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Quick Navigation Cards */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Quick Navigation</h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {navigationCards.map((card, index) => {
            const Icon = card.icon

            // Regular navigation cards
            return (
              <Link key={index} href={card.href}>
                <div className="enhanced-card h-full cursor-pointer transition-all duration-300 hover:scale-105">
                  <div className="enhanced-card-content h-full flex flex-col">
                    <div className="flex items-center gap-2 text-white mb-4">
                      <Icon className="w-5 h-5 text-white" />
                      <h3 className="font-semibold">{card.title}</h3>
                    </div>
                    <div className="space-y-4 flex-grow">
                      <p className="text-[#C0E6FF] text-sm">
                        {card.description}
                      </p>
                      <div className="space-y-2">
                        {card.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-[#C0E6FF] text-xs">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#C0E6FF]/20">
                      <span className="text-blue-400 text-sm font-medium">Explore</span>
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Platform Connections */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Connect with MetadudesX</h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {socialPlatforms.map((platform, index) => {
            const Icon = platform.icon

            return (
              <div key={index} className="enhanced-card h-full">
                <div className="enhanced-card-content text-center h-full flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center space-y-4 w-full">
                    <div
                      className="p-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${platform.color}20` }}
                    >
                      <Icon
                        className="w-8 h-8"
                        style={{ color: platform.color }}
                      />
                    </div>

                    <div className="text-center">
                      <h3 className="font-semibold text-white mb-1">{platform.name}</h3>
                      <p className="text-[#C0E6FF] text-sm">{platform.members} members</p>
                    </div>

                    <Button
                      className="w-full transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: '#4da2ff',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = platform.color
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#4da2ff'
                      }}
                      onClick={() => window.open(platform.url, '_blank')}
                    >
                      {platform.buttonText}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* DEWhale Progress */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-1">
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Zap className="w-5 h-5 text-[#4DA2FF]" />
              <h3 className="font-semibold">DEWhale Launchpad Progress</h3>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {metadudesXAnalytics.totalHolders} / {metadudesXAnalytics.dewhaleTargetHolders}
                </div>
                <div className="text-sm text-[#C0E6FF]">Holders for DEWhale Deployment</div>
                <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
                  <div
                    className="bg-gradient-to-r from-[#4DA2FF] to-[#007ACC] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(parseInt(metadudesXAnalytics.totalHolders) / parseInt(metadudesXAnalytics.dewhaleTargetHolders)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-[#4DA2FF]/10 border border-[#4DA2FF]/20 rounded-lg p-3">
                <div className="text-[#4DA2FF] text-sm font-medium mb-1">Coming Soon</div>
                <div className="text-[#C0E6FF] text-sm">
                  DEWhale will launch when we reach 500 PRO holders, enabling $100 KeyShares for early-stage investments.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
