"use client"

import { useState, useEffect } from "react"
import { CreatorCards } from "./creator-cards"
import { Search, Filter, Users, TrendingUp, BookOpen, FileText, Coins, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Channel {
  id: string
  name: string
  type: 'free' | 'premium' | 'vip'
  price: number
  description: string
  subscribers: number
  telegramUrl: string // Telegram channel URL for access
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
  role: string
  tier: 'PRO' | 'ROYAL' // Status tier (NOMADS not allowed as creators)
  subscribers: number
  category: string
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

// Mock data for creators
const mockCreators: Creator[] = [
  {
    id: "1",
    name: "Alex Thompson",
    username: "cryptoalex",
    avatar: "/api/placeholder/64/64",
    role: "Trading Expert",
    tier: "ROYAL",
    subscribers: 15420,
    category: "Trading",
    verified: true,
    contentTypes: ["Live Streams", "Market Analysis", "Tutorials"],
    languages: ["English", "Spanish"],
    availability: {
      hasLimit: true,
      currentSlots: 45,
      maxSlots: 50,
      status: 'limited'
    },
    socialLinks: {
      website: "https://cryptoalex.com",
      twitter: "https://twitter.com/cryptoalex",
      telegram: "https://t.me/cryptoalex"
    },
    bannerColor: "#10b981",
    channels: [
      {
        id: "1-1",
        name: "Daily Market Updates",
        type: "free",
        price: 0,
        description: "Daily crypto market analysis and news updates",
        subscribers: 8500,
        telegramUrl: "https://t.me/cryptoalex_daily"
      },
      {
        id: "1-2",
        name: "Premium Trading Signals",
        type: "premium",
        price: 5.0,
        description: "Exclusive trading signals with entry/exit points",
        subscribers: 2100,
        telegramUrl: "https://t.me/cryptoalex_premium",
        availability: {
          hasLimit: true,
          currentSlots: 85,
          maxSlots: 100,
          status: 'limited'
        }
      },
      {
        id: "1-3",
        name: "VIP Strategy Sessions",
        type: "vip",
        price: 15.0,
        description: "Private strategy sessions and portfolio reviews",
        subscribers: 450,
        telegramUrl: "https://t.me/cryptoalex_vip",
        availability: {
          hasLimit: true,
          currentSlots: 15,
          maxSlots: 15,
          status: 'full'
        }
      }
    ]
  },
  {
    id: "2",
    name: "Sarah Chen",
    username: "defiSarah",
    avatar: "/api/placeholder/64/64",
    role: "DeFi Specialist",
    tier: "PRO",
    subscribers: 12800,
    category: "DeFi",
    verified: true,
    contentTypes: ["Educational Content", "Protocol Reviews", "Yield Farming"],
    languages: ["English", "Mandarin", "Korean"],
    availability: {
      hasLimit: false,
      status: 'available'
    },
    socialLinks: {
      website: "https://defisarah.io",
      twitter: "https://twitter.com/defisarah",
      telegram: "https://t.me/defisarah",
      discord: "https://discord.gg/defisarah"
    },
    bannerColor: "#f59e0b",
    channels: [
      {
        id: "2-1",
        name: "DeFi Basics",
        type: "free",
        price: 0,
        description: "Learn DeFi fundamentals and protocols",
        subscribers: 9200,
        telegramUrl: "https://t.me/defisarah_basics"
      },
      {
        id: "2-2",
        name: "Advanced DeFi Strategies",
        type: "premium",
        price: 8.0,
        description: "Advanced yield farming and liquidity strategies",
        subscribers: 1800,
        telegramUrl: "https://t.me/defisarah_advanced",
        availability: {
          hasLimit: true,
          currentSlots: 25,
          maxSlots: 50,
          status: 'available'
        }
      }
    ]
  },
  {
    id: "3",
    name: "Marcus Rodriguez",
    username: "techanalyst",
    avatar: "/api/placeholder/64/64",
    role: "Technical Analyst",
    tier: "ROYAL",
    subscribers: 18600,
    category: "Analysis",
    verified: true,
    contentTypes: ["Chart Analysis", "Market Reports", "Live Trading"],
    languages: ["English", "Spanish", "Portuguese"],
    availability: {
      hasLimit: true,
      currentSlots: 25,
      maxSlots: 25,
      status: 'full'
    },
    socialLinks: {
      website: "https://techanalyst.pro",
      twitter: "https://twitter.com/techanalyst",
      telegram: "https://t.me/techanalyst"
    },
    bannerColor: "#8b5cf6",
    channels: [
      {
        id: "3-1",
        name: "Weekly Chart Reviews",
        type: "premium",
        price: 8.0,
        description: "Weekly technical analysis of major cryptocurrencies",
        subscribers: 12400,
        telegramUrl: "https://t.me/techanalyst_charts"
      },
      {
        id: "3-2",
        name: "Real-time Analysis",
        type: "premium",
        price: 10.0,
        description: "Live chart analysis and trading opportunities",
        subscribers: 3200,
        telegramUrl: "https://t.me/techanalyst_realtime"
      },
      {
        id: "3-3",
        name: "Private Consultation",
        type: "vip",
        price: 25.0,
        description: "One-on-one technical analysis sessions",
        subscribers: 180,
        telegramUrl: "https://t.me/techanalyst_private"
      }
    ]
  },
  {
    id: "4",
    name: "Emma Wilson",
    username: "cryptoeducator",
    avatar: "/api/placeholder/64/64",
    role: "Crypto Educator",
    tier: "PRO",
    subscribers: 9400,
    category: "Education",
    verified: false,
    contentTypes: ["Beginner Guides", "Webinars", "Q&A Sessions"],
    languages: ["English", "French"],
    availability: {
      hasLimit: true,
      currentSlots: 15,
      maxSlots: 30,
      status: 'available'
    },
    socialLinks: {
      website: "https://cryptoeducator.com",
      twitter: "https://twitter.com/cryptoeducator",
      telegram: "https://t.me/cryptoeducator"
    },
    bannerColor: "#3b82f6",
    channels: [
      {
        id: "4-1",
        name: "Crypto 101",
        type: "premium",
        price: 6.0,
        description: "Complete beginner's guide to cryptocurrency",
        subscribers: 7800,
        telegramUrl: "https://t.me/cryptoeducator_101"
      },
      {
        id: "4-2",
        name: "Advanced Concepts",
        type: "premium",
        price: 6.0,
        description: "Deep dive into blockchain technology and advanced topics",
        subscribers: 1200,
        telegramUrl: "https://t.me/cryptoeducator_advanced"
      }
    ]
  },
  {
    id: "5",
    name: "David Kim",
    username: "nftdavid",
    avatar: "/api/placeholder/64/64",
    role: "NFT Creator",
    tier: "ROYAL",
    subscribers: 7200,
    category: "NFTs",
    verified: true,
    contentTypes: ["NFT Reviews", "Art Creation", "Market Trends"],
    languages: ["English", "Korean", "Japanese"],
    availability: {
      hasLimit: true,
      currentSlots: 8,
      maxSlots: 20,
      status: 'available'
    },
    socialLinks: {
      website: "https://nftdavid.art",
      twitter: "https://twitter.com/nftdavid",
      telegram: "https://t.me/nftdavid",
      discord: "https://discord.gg/nftdavid"
    },
    bannerColor: "#ec4899",
    channels: [
      {
        id: "5-1",
        name: "NFT Market Updates",
        type: "premium",
        price: 10.0,
        description: "Latest NFT trends and market analysis",
        subscribers: 5100,
        telegramUrl: "https://t.me/nftdavid_updates"
      },
      {
        id: "5-2",
        name: "Exclusive NFT Drops",
        type: "premium",
        price: 12.0,
        description: "Early access to NFT drops and whitelist opportunities",
        subscribers: 890,
        telegramUrl: "https://t.me/nftdavid_drops"
      },
      {
        id: "5-3",
        name: "Art Creation Workshop",
        type: "vip",
        price: 20.0,
        description: "Learn digital art creation and NFT minting",
        subscribers: 320,
        telegramUrl: "https://t.me/nftdavid_workshop"
      }
    ]
  },
  {
    id: "6",
    name: "Lisa Zhang",
    username: "cryptolisa",
    avatar: "/api/placeholder/64/64",
    role: "Market Analyst",
    tier: "PRO",
    subscribers: 11200,
    category: "Analysis",
    verified: true,
    contentTypes: ["Market Reports", "Price Predictions", "News Analysis"],
    languages: ["English", "Mandarin"],
    availability: {
      hasLimit: true,
      currentSlots: 12,
      maxSlots: 15,
      status: 'limited'
    },
    socialLinks: {
      website: "https://cryptolisa.com",
      twitter: "https://twitter.com/cryptolisa",
      telegram: "https://t.me/cryptolisa"
    },
    bannerColor: "#06b6d4",
    channels: [
      {
        id: "6-1",
        name: "Daily Market Brief",
        type: "premium",
        price: 7.0,
        description: "Quick daily market overview and key events",
        subscribers: 8900,
        telegramUrl: "https://t.me/cryptolisa_daily"
      },
      {
        id: "6-2",
        name: "Premium Market Insights",
        type: "premium",
        price: 7.0,
        description: "In-depth market analysis and predictions",
        subscribers: 1500,
        telegramUrl: "https://t.me/cryptolisa_premium"
      }
    ]
  },
  {
    id: "7",
    name: "Roberto Silva",
    username: "defiroberto",
    avatar: "/api/placeholder/64/64",
    role: "DeFi Developer",
    tier: "ROYAL",
    subscribers: 6800,
    category: "DeFi",
    verified: false,
    contentTypes: ["Code Reviews", "Protocol Analysis", "Development Tips"],
    languages: ["English", "Portuguese", "Spanish"],
    availability: {
      hasLimit: false,
      status: 'available'
    },
    socialLinks: {
      website: "https://defiroberto.dev",
      twitter: "https://twitter.com/defiroberto",
      telegram: "https://t.me/defiroberto"
    },
    bannerColor: "#84cc16",
    channels: [
      {
        id: "7-1",
        name: "DeFi Development",
        type: "premium",
        price: 9.0,
        description: "Learn DeFi development basics and best practices",
        subscribers: 4200,
        telegramUrl: "https://t.me/defiroberto_dev"
      },
      {
        id: "7-2",
        name: "Smart Contract Audits",
        type: "premium",
        price: 9.0,
        description: "Live smart contract reviews and security analysis",
        subscribers: 980,
        telegramUrl: "https://t.me/defiroberto_audits"
      }
    ]
  },
  {
    id: "8",
    name: "Yuki Tanaka",
    username: "cryptoyuki",
    avatar: "/api/placeholder/64/64",
    role: "Trading Bot Expert",
    tier: "PRO",
    subscribers: 13500,
    category: "Trading",
    verified: true,
    contentTypes: ["Bot Strategies", "Automation", "Backtesting"],
    languages: ["English", "Japanese"],
    availability: {
      hasLimit: true,
      currentSlots: 35,
      maxSlots: 40,
      status: 'limited'
    },
    socialLinks: {
      website: "https://cryptoyuki.io",
      twitter: "https://twitter.com/cryptoyuki",
      telegram: "https://t.me/cryptoyuki",
      discord: "https://discord.gg/cryptoyuki"
    },
    bannerColor: "#f97316",
    channels: [
      {
        id: "8-1",
        name: "Bot Setup Guides",
        type: "premium",
        price: 12.0,
        description: "Premium guides for setting up trading bots",
        subscribers: 9800,
        telegramUrl: "https://t.me/cryptoyuki_bots"
      },
      {
        id: "8-2",
        name: "Advanced Bot Strategies",
        type: "premium",
        price: 12.0,
        description: "Premium bot configurations and strategies",
        subscribers: 2100,
        telegramUrl: "https://t.me/cryptoyuki_advanced"
      },
      {
        id: "8-3",
        name: "Custom Bot Development",
        type: "vip",
        price: 30.0,
        description: "Personal bot development and optimization",
        subscribers: 150,
        telegramUrl: "https://t.me/cryptoyuki_custom",
        availability: {
          hasLimit: true,
          currentSlots: 5,
          maxSlots: 10,
          status: 'available'
        }
      }
    ]
  }

]

export function AIOCreatorsInterface() {
  const [creators, setCreators] = useState<Creator[]>(mockCreators)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<'subscribers' | 'name' | 'category'>('subscribers')

  const categories = [
    { value: "all", label: "All Categories", icon: Users },
    { value: "trading", label: "Trading", icon: TrendingUp },
    { value: "defi", label: "DeFi", icon: Coins },
    { value: "analysis", label: "Analysis", icon: FileText },
    { value: "education", label: "Education", icon: BookOpen },
    { value: "nfts", label: "NFTs", icon: Play }
  ]

  // Filter and sort creators
  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || 
                           creator.category.toLowerCase() === selectedCategory.toLowerCase()

    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'category':
        return a.category.localeCompare(b.category)
      case 'subscribers':
      default:
        return b.subscribers - a.subscribers
    }
  })

  const handleAccessChannel = (creatorId: string, channelId: string) => {
    const creator = creators.find(c => c.id === creatorId)
    const channel = creator?.channels.find(ch => ch.id === channelId)

    if (creator && channel) {
      toast.success(`Accessing ${channel.name} by ${creator.name}`)
      // Redirect to Telegram channel
      if (channel.telegramUrl) {
        window.open(channel.telegramUrl, '_blank')
      }
    }
  }

  const getTotalStats = () => {
    const totalCreators = filteredCreators.length
    // Fixed values as requested
    const totalSubscribers = 340
    const totalChannels = 8
    const freeChannels = filteredCreators.reduce((sum, creator) =>
      sum + creator.channels.filter(ch => ch.type === 'free').length, 0)

    return { totalCreators, totalSubscribers, totalChannels, freeChannels }
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#C0E6FF]" />
              <Input
                placeholder="Search creators, categories, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF] placeholder:text-[#C0E6FF]/60"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48 bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2f51] border-[#C0E6FF]/30">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <SelectItem key={category.value} value={category.value} className="text-[#FFFFFF]">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full lg:w-40 bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2f51] border-[#C0E6FF]/30">
                <SelectItem value="subscribers" className="text-[#FFFFFF]">Subscribers</SelectItem>
                <SelectItem value="name" className="text-[#FFFFFF]">Name</SelectItem>
                <SelectItem value="category" className="text-[#FFFFFF]">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Summary */}
          <div className="pt-4 border-t border-[#C0E6FF]/20 mt-4">
            {/* Mobile: Stack vertically */}
            <div className="flex flex-col gap-3 md:hidden">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4DA2FF]" />
                <span className="text-[#C0E6FF] text-sm">
                  {stats.totalCreators} creator{stats.totalCreators !== 1 ? 's' : ''} found
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                  {stats.freeChannels} Free Channels
                </Badge>
                <Badge variant="outline" className="border-[#4DA2FF] text-[#4DA2FF] text-xs">
                  {stats.totalChannels} Total Channels
                </Badge>
                <Badge variant="outline" className="border-orange-400 text-orange-400 text-xs">
                  {stats.totalSubscribers.toLocaleString()} Subscribers
                </Badge>
              </div>
            </div>

            {/* Desktop: Side by side */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4DA2FF]" />
                <span className="text-[#C0E6FF] text-sm">
                  {stats.totalCreators} creator{stats.totalCreators !== 1 ? 's' : ''} found
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-green-400 text-green-400">
                  {stats.freeChannels} Free Channels
                </Badge>
                <Badge variant="outline" className="border-[#4DA2FF] text-[#4DA2FF]">
                  {stats.totalChannels} Total Channels
                </Badge>
                <Badge variant="outline" className="border-orange-400 text-orange-400">
                  {stats.totalSubscribers.toLocaleString()} Subscribers
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creators Grid */}
      {filteredCreators.length === 0 ? (
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-[#C0E6FF]/50 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">
                No creators found
              </h3>
              <p className="text-[#C0E6FF] max-w-md mx-auto">
                Try adjusting your search criteria or filters to find more creators.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <CreatorCards 
          creators={filteredCreators}
          onAccessChannel={handleAccessChannel}
        />
      )}
    </div>
  )
}
