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
        subscribers: 8500
      },
      {
        id: "1-2",
        name: "Premium Trading Signals",
        type: "premium",
        price: 5.0,
        description: "Exclusive trading signals with entry/exit points",
        subscribers: 2100,
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
        subscribers: 9200
      },
      {
        id: "2-2",
        name: "Advanced DeFi Strategies",
        type: "premium",
        price: 8.0,
        description: "Advanced yield farming and liquidity strategies",
        subscribers: 1800,
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
        type: "free",
        price: 0,
        description: "Weekly technical analysis of major cryptocurrencies",
        subscribers: 12400
      },
      {
        id: "3-2",
        name: "Real-time Analysis",
        type: "premium",
        price: 10.0,
        description: "Live chart analysis and trading opportunities",
        subscribers: 3200
      },
      {
        id: "3-3",
        name: "Private Consultation",
        type: "vip",
        price: 25.0,
        description: "One-on-one technical analysis sessions",
        subscribers: 180
      }
    ]
  },
  {
    id: "4",
    name: "Emma Wilson",
    username: "cryptoeducator",
    avatar: "/api/placeholder/64/64",
    role: "Crypto Educator",
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
      twitter: "https://twitter.com/cryptoeducator"
    },
    bannerColor: "#3b82f6",
    channels: [
      {
        id: "4-1",
        name: "Crypto 101",
        type: "free",
        price: 0,
        description: "Complete beginner's guide to cryptocurrency",
        subscribers: 7800
      },
      {
        id: "4-2",
        name: "Advanced Concepts",
        type: "premium",
        price: 6.0,
        description: "Deep dive into blockchain technology and advanced topics",
        subscribers: 1200
      }
    ]
  },
  {
    id: "5",
    name: "David Kim",
    username: "nftdavid",
    avatar: "/api/placeholder/64/64",
    role: "NFT Creator",
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
      discord: "https://discord.gg/nftdavid"
    },
    bannerColor: "#ec4899",
    channels: [
      {
        id: "5-1",
        name: "NFT Market Updates",
        type: "free",
        price: 0,
        description: "Latest NFT trends and market analysis",
        subscribers: 5100
      },
      {
        id: "5-2",
        name: "Exclusive NFT Drops",
        type: "premium",
        price: 12.0,
        description: "Early access to NFT drops and whitelist opportunities",
        subscribers: 890
      },
      {
        id: "5-3",
        name: "Art Creation Workshop",
        type: "vip",
        price: 20.0,
        description: "Learn digital art creation and NFT minting",
        subscribers: 320
      }
    ]
  },
  {
    id: "6",
    name: "Lisa Zhang",
    username: "cryptolisa",
    avatar: "/api/placeholder/64/64",
    role: "Market Analyst",
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
        type: "free",
        price: 0,
        description: "Quick daily market overview and key events",
        subscribers: 8900
      },
      {
        id: "6-2",
        name: "Premium Market Insights",
        type: "premium",
        price: 7.0,
        description: "In-depth market analysis and predictions",
        subscribers: 1500
      }
    ]
  },
  {
    id: "7",
    name: "Roberto Silva",
    username: "defiroberto",
    avatar: "/api/placeholder/64/64",
    role: "DeFi Developer",
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
      twitter: "https://twitter.com/defiroberto"
    },
    bannerColor: "#84cc16",
    channels: [
      {
        id: "7-1",
        name: "DeFi Development",
        type: "free",
        price: 0,
        description: "Learn DeFi development basics and best practices",
        subscribers: 4200
      },
      {
        id: "7-2",
        name: "Smart Contract Audits",
        type: "premium",
        price: 9.0,
        description: "Live smart contract reviews and security analysis",
        subscribers: 980
      }
    ]
  },
  {
    id: "8",
    name: "Yuki Tanaka",
    username: "cryptoyuki",
    avatar: "/api/placeholder/64/64",
    role: "Trading Bot Expert",
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
        type: "free",
        price: 0,
        description: "Free guides for setting up trading bots",
        subscribers: 9800
      },
      {
        id: "8-2",
        name: "Advanced Bot Strategies",
        type: "premium",
        price: 12.0,
        description: "Premium bot configurations and strategies",
        subscribers: 2100
      },
      {
        id: "8-3",
        name: "Custom Bot Development",
        type: "vip",
        price: 30.0,
        description: "Personal bot development and optimization",
        subscribers: 150,
        availability: {
          hasLimit: true,
          currentSlots: 5,
          maxSlots: 10,
          status: 'available'
        }
      }
    ]
  },
  {
    id: "9",
    name: "Maria Gonzalez",
    username: "cryptomaria",
    avatar: "/api/placeholder/64/64",
    role: "Yield Farmer",
    subscribers: 8900,
    category: "DeFi",
    verified: true,
    contentTypes: ["Yield Strategies", "Farm Reviews", "Risk Analysis"],
    languages: ["English", "Spanish"],
    availability: {
      hasLimit: true,
      currentSlots: 18,
      maxSlots: 25,
      status: 'limited'
    },
    socialLinks: {
      website: "https://cryptomaria.farm",
      twitter: "https://twitter.com/cryptomaria",
      telegram: "https://t.me/cryptomaria"
    },
    bannerColor: "#22c55e",
    channels: [
      {
        id: "9-1",
        name: "Yield Farming Basics",
        type: "free",
        price: 0,
        description: "Learn the fundamentals of yield farming",
        subscribers: 6200
      },
      {
        id: "9-2",
        name: "High-Yield Strategies",
        type: "premium",
        price: 11.0,
        description: "Advanced yield farming strategies and opportunities",
        subscribers: 1400,
        availability: {
          hasLimit: true,
          currentSlots: 28,
          maxSlots: 35,
          status: 'limited'
        }
      }
    ]
  },
  {
    id: "10",
    name: "Ahmed Hassan",
    username: "cryptoahmed",
    avatar: "/api/placeholder/64/64",
    role: "Blockchain Developer",
    subscribers: 5600,
    category: "Education",
    verified: false,
    contentTypes: ["Smart Contracts", "Web3 Development", "Tutorials"],
    languages: ["English", "Arabic"],
    availability: {
      hasLimit: false,
      status: 'available'
    },
    socialLinks: {
      website: "https://cryptoahmed.dev",
      twitter: "https://twitter.com/cryptoahmed",
      discord: "https://discord.gg/cryptoahmed"
    },
    bannerColor: "#6366f1",
    channels: [
      {
        id: "10-1",
        name: "Web3 Development",
        type: "free",
        price: 0,
        description: "Learn Web3 and blockchain development",
        subscribers: 3800
      },
      {
        id: "10-2",
        name: "Smart Contract Mastery",
        type: "premium",
        price: 14.0,
        description: "Advanced smart contract development and security",
        subscribers: 890
      },
      {
        id: "10-3",
        name: "1-on-1 Mentoring",
        type: "vip",
        price: 35.0,
        description: "Personal mentoring sessions for blockchain development",
        subscribers: 45,
        availability: {
          hasLimit: true,
          currentSlots: 3,
          maxSlots: 5,
          status: 'limited'
        }
      }
    ]
  },
  {
    id: "11",
    name: "Sophie Laurent",
    username: "cryptosophie",
    avatar: "/api/placeholder/64/64",
    role: "NFT Strategist",
    subscribers: 10300,
    category: "NFTs",
    verified: true,
    contentTypes: ["NFT Analysis", "Collection Reviews", "Market Trends"],
    languages: ["English", "French"],
    availability: {
      hasLimit: true,
      currentSlots: 40,
      maxSlots: 60,
      status: 'available'
    },
    socialLinks: {
      website: "https://cryptosophie.nft",
      twitter: "https://twitter.com/cryptosophie",
      discord: "https://discord.gg/cryptosophie"
    },
    bannerColor: "#a855f7",
    channels: [
      {
        id: "11-1",
        name: "NFT Market Watch",
        type: "free",
        price: 0,
        description: "Daily NFT market updates and trending collections",
        subscribers: 7500
      },
      {
        id: "11-2",
        name: "Alpha NFT Calls",
        type: "premium",
        price: 16.0,
        description: "Early NFT project analysis and investment calls",
        subscribers: 1800,
        availability: {
          hasLimit: true,
          currentSlots: 45,
          maxSlots: 50,
          status: 'limited'
        }
      },
      {
        id: "11-3",
        name: "NFT Portfolio Review",
        type: "vip",
        price: 28.0,
        description: "Personal NFT portfolio analysis and optimization",
        subscribers: 120,
        availability: {
          hasLimit: true,
          currentSlots: 8,
          maxSlots: 10,
          status: 'limited'
        }
      }
    ]
  },
  {
    id: "12",
    name: "Carlos Mendoza",
    username: "cryptocarlos",
    avatar: "/api/placeholder/64/64",
    role: "Futures Trader",
    subscribers: 14200,
    category: "Trading",
    verified: true,
    contentTypes: ["Futures Trading", "Risk Management", "Leverage Strategies"],
    languages: ["English", "Spanish", "Portuguese"],
    availability: {
      hasLimit: true,
      currentSlots: 22,
      maxSlots: 30,
      status: 'limited'
    },
    socialLinks: {
      website: "https://cryptocarlos.trade",
      twitter: "https://twitter.com/cryptocarlos",
      telegram: "https://t.me/cryptocarlos"
    },
    bannerColor: "#ef4444",
    channels: [
      {
        id: "12-1",
        name: "Futures Trading Basics",
        type: "free",
        price: 0,
        description: "Learn the fundamentals of futures trading",
        subscribers: 9800
      },
      {
        id: "12-2",
        name: "Advanced Leverage Strategies",
        type: "premium",
        price: 13.0,
        description: "High-leverage trading strategies and risk management",
        subscribers: 2400,
        availability: {
          hasLimit: true,
          currentSlots: 18,
          maxSlots: 25,
          status: 'limited'
        }
      },
      {
        id: "12-3",
        name: "Live Trading Sessions",
        type: "vip",
        price: 22.0,
        description: "Real-time futures trading with live commentary",
        subscribers: 680,
        availability: {
          hasLimit: true,
          currentSlots: 12,
          maxSlots: 15,
          status: 'limited'
        }
      },
      {
        id: "12-4",
        name: "Risk Management Masterclass",
        type: "premium",
        price: 9.0,
        description: "Advanced risk management techniques for futures",
        subscribers: 1200
      }
    ]
  },
  {
    id: "13",
    name: "Priya Sharma",
    username: "cryptopriya",
    avatar: "/api/placeholder/64/64",
    role: "DeFi Researcher",
    subscribers: 7800,
    category: "DeFi",
    verified: false,
    contentTypes: ["Protocol Research", "Tokenomics", "DeFi Security"],
    languages: ["English", "Hindi"],
    availability: {
      hasLimit: true,
      currentSlots: 15,
      maxSlots: 20,
      status: 'available'
    },
    socialLinks: {
      website: "https://cryptopriya.research",
      twitter: "https://twitter.com/cryptopriya",
      discord: "https://discord.gg/cryptopriya"
    },
    bannerColor: "#14b8a6",
    channels: [
      {
        id: "13-1",
        name: "DeFi Protocol Reviews",
        type: "free",
        price: 0,
        description: "Weekly reviews of new DeFi protocols",
        subscribers: 5200
      },
      {
        id: "13-2",
        name: "Tokenomics Deep Dive",
        type: "premium",
        price: 10.0,
        description: "In-depth tokenomics analysis and research",
        subscribers: 1600,
        availability: {
          hasLimit: true,
          currentSlots: 8,
          maxSlots: 12,
          status: 'limited'
        }
      },
      {
        id: "13-3",
        name: "Security Audits",
        type: "vip",
        price: 18.0,
        description: "Smart contract security analysis and audits",
        subscribers: 320,
        availability: {
          hasLimit: true,
          currentSlots: 5,
          maxSlots: 8,
          status: 'available'
        }
      }
    ]
  },
  {
    id: "14",
    name: "James Mitchell",
    username: "cryptojames",
    avatar: "/api/placeholder/64/64",
    role: "Macro Analyst",
    subscribers: 16500,
    category: "Analysis",
    verified: true,
    contentTypes: ["Macro Analysis", "Economic Reports", "Market Cycles"],
    languages: ["English"],
    availability: {
      hasLimit: true,
      currentSlots: 48,
      maxSlots: 50,
      status: 'limited'
    },
    socialLinks: {
      website: "https://cryptojames.macro",
      twitter: "https://twitter.com/cryptojames",
      telegram: "https://t.me/cryptojames"
    },
    bannerColor: "#0ea5e9",
    channels: [
      {
        id: "14-1",
        name: "Weekly Macro Report",
        type: "free",
        price: 0,
        description: "Weekly macroeconomic analysis and crypto correlation",
        subscribers: 12800
      },
      {
        id: "14-2",
        name: "Market Cycle Analysis",
        type: "premium",
        price: 15.0,
        description: "Deep dive into market cycles and timing",
        subscribers: 2900,
        availability: {
          hasLimit: true,
          currentSlots: 35,
          maxSlots: 40,
          status: 'limited'
        }
      },
      {
        id: "14-3",
        name: "Economic Data Alerts",
        type: "premium",
        price: 8.0,
        description: "Real-time economic data and impact analysis",
        subscribers: 1800
      },
      {
        id: "14-4",
        name: "Private Macro Calls",
        type: "vip",
        price: 25.0,
        description: "Exclusive macro analysis and market predictions",
        subscribers: 420,
        availability: {
          hasLimit: true,
          currentSlots: 20,
          maxSlots: 25,
          status: 'limited'
        }
      },
      {
        id: "14-5",
        name: "Institutional Insights",
        type: "vip",
        price: 35.0,
        description: "Institutional-level macro analysis and positioning",
        subscribers: 180,
        availability: {
          hasLimit: true,
          currentSlots: 8,
          maxSlots: 10,
          status: 'limited'
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
      // In a real implementation, this would redirect to the Telegram channel
      // or open the content interface
    }
  }

  const getTotalStats = () => {
    const totalCreators = filteredCreators.length
    const totalSubscribers = filteredCreators.reduce((sum, creator) => sum + creator.subscribers, 0)
    const totalChannels = filteredCreators.reduce((sum, creator) => sum + creator.channels.length, 0)
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
          <div className="flex items-center justify-between pt-4 border-t border-[#C0E6FF]/20 mt-4">
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
