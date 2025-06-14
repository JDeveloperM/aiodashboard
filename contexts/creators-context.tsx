"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface Channel {
  id: string
  name: string
  type: 'free' | 'premium' | 'vip'
  price: number // in SUI (default price, usually for 30 days)
  description: string
  subscribers: number
  telegramUrl: string // Telegram channel URL for access
  subscriptionPackages?: string[] // Available durations: ["30", "60", "90"]
  pricing?: {
    thirtyDays?: number
    sixtyDays?: number
    ninetyDays?: number
  }
  availability?: {
    hasLimit: boolean
    currentSlots?: number
    maxSlots?: number
    status: 'available' | 'limited' | 'full'
  }
  // Channel-specific data for individual channel cards
  channelCategories?: string[]
  channelRole?: string
  channelLanguage?: string
}

interface Creator {
  id: string
  creatorAddress: string // Wallet address of the creator (for ownership verification)
  name: string
  username: string
  avatar: string
  coverImage?: string // Optional cover image for banner background
  role: string
  tier: 'PRO' | 'ROYAL' // Status tier (NOMADS not allowed as creators)
  subscribers: number
  category: string // Primary category (for backward compatibility)
  categories: string[] // All selected categories
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

interface CreatorsContextType {
  creators: Creator[]
  addCreator: (creator: Creator) => void
  updateCreator: (id: string, creator: Partial<Creator>) => void
  removeCreator: (id: string) => void
}

const CreatorsContext = createContext<CreatorsContextType | undefined>(undefined)

// Mock data for creators
const initialMockCreators: Creator[] = [
  {
    id: "1",
    name: "Kostas Trading",
    username: "kostas33",
    avatar: "/api/placeholder/64/64",
    role: "NFT Trader",
    tier: "ROYAL",
    subscribers: 15420,
    category: "Trading",
    categories: ["Crypto Trading", "Market Analysis", "Education"],
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
      website: "https://kostas.com",
      twitter: "https://twitter.com/kostas33",
      telegram: "https://t.me/kostas33"
    },
    bannerColor: "#10b981",
    channels: [
      {
        id: "1-1",
        name: "Trading Signals Pro",
        type: "free",
        price: 0,
        description: "Daily crypto market analysis and news updates",
        subscribers: 8500,
        telegramUrl: "https://t.me/kostas33",
        // Channel-specific data
        channelCategories: ["Trading", "Signals", "Premium"],
        channelRole: "Trading Expert",
        channelLanguage: "English",
        availability: {
          hasLimit: true,
          currentSlots: 3,
          maxSlots: 7,
          status: 'limited'
        }
      },
      {
        id: "1-2",
        name: "Market Analysis Hub",
        type: "premium",
        price: 5.0,
        description: "Exclusive trading signals with entry/exit points",
        subscribers: 2100,
        telegramUrl: "https://t.me/kostas",
        availability: {
          hasLimit: true,
          currentSlots: 4,
          maxSlots: 7,
          status: 'limited'
        },
        // Channel-specific data
        channelCategories: ["Analysis", "Education", "DeFi"],
        channelRole: "Market Analyst",
        channelLanguage: "Romanian"
      }
    ]
  },
  {
    id: "2",
    name: "Sarah Chen",
    username: "defisarah",
    avatar: "/api/placeholder/64/64",
    role: "DeFi Specialist",
    tier: "PRO",
    subscribers: 12800,
    category: "DeFi",
    categories: ["DeFi", "Yield Farming", "Education"],
    verified: true,
    contentTypes: ["Educational Content", "Protocol Reviews", "Yield Strategies"],
    languages: ["English", "Mandarin"],
    availability: {
      hasLimit: true,
      currentSlots: 30,
      maxSlots: 40,
      status: 'available'
    },
    socialLinks: {
      website: "https://defisarah.io",
      twitter: "https://twitter.com/defisarah",
      telegram: "https://t.me/defisarah"
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
        telegramUrl: "https://t.me/defisarah_basics",
        // Channel-specific data
        channelCategories: ["DeFi", "Education", "Basics"],
        channelRole: "DeFi Educator",
        channelLanguage: "Spanish"
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
          currentSlots: 0,
          maxSlots: 8,
          status: 'full'
        },
        // Channel-specific data
        channelCategories: ["Yield Farming", "Liquidity", "Advanced"],
        channelRole: "DeFi Strategist",
        channelLanguage: "French"
      }
    ]
  },
  {
    id: "3",
    name: "Marcus Rodriguez",
    username: "onchainmarcus",
    avatar: "/api/placeholder/64/64",
    role: "Technical Analyst",
    tier: "ROYAL",
    subscribers: 9500,
    category: "Analysis",
    categories: ["On-Chain Analysis", "Market Analysis", "Crypto Trading"],
    verified: true,
    contentTypes: ["On-Chain Analysis", "Market Reports", "Technical Analysis"],
    languages: ["English", "Spanish", "Portuguese"],
    availability: {
      hasLimit: false,
      status: 'available'
    },
    socialLinks: {
      website: "https://onchainmarcus.com",
      twitter: "https://twitter.com/onchainmarcus",
      telegram: "https://t.me/onchainmarcus"
    },
    bannerColor: "#8b5cf6",
    channels: [
      {
        id: "3-1",
        name: "Weekly On-Chain Report",
        type: "premium",
        price: 6.0,
        description: "Comprehensive weekly on-chain analysis and insights",
        subscribers: 4200,
        telegramUrl: "https://t.me/onchainmarcus_weekly"
      },
      {
        id: "3-2",
        name: "Real-Time Alerts",
        type: "premium",
        price: 10.0,
        description: "Real-time on-chain alerts and whale movements",
        subscribers: 2800,
        telegramUrl: "https://t.me/onchainmarcus_alerts"
      }
    ]
  },
  {
    id: "4",
    name: "Emma Foster",
    username: "cryptoemma",
    avatar: "/api/placeholder/64/64",
    role: "Crypto Educator",
    tier: "PRO",
    subscribers: 18200,
    category: "Education",
    categories: ["Education", "Market Analysis", "Community"],
    verified: true,
    contentTypes: ["Beginner Guides", "Live Q&A", "Market Education"],
    languages: ["English", "French"],
    availability: {
      hasLimit: true,
      currentSlots: 95,
      maxSlots: 100,
      status: 'limited'
    },
    socialLinks: {
      website: "https://cryptoemma.edu",
      twitter: "https://twitter.com/cryptoemma",
      telegram: "https://t.me/cryptoemma"
    },
    bannerColor: "#06b6d4",
    channels: [
      {
        id: "4-1",
        name: "Crypto 101",
        type: "free",
        price: 0,
        description: "Free beginner-friendly crypto education",
        subscribers: 12500,
        telegramUrl: "https://t.me/cryptoemma_101"
      },
      {
        id: "4-2",
        name: "Advanced Trading Course",
        type: "premium",
        price: 15.0,
        description: "Comprehensive trading course with live sessions",
        subscribers: 3200,
        telegramUrl: "https://t.me/cryptoemma_advanced",
        availability: {
          hasLimit: true,
          currentSlots: 45,
          maxSlots: 50,
          status: 'limited'
        }
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
    categories: ["NFTs", "Community", "Education"],
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
    categories: ["Market Analysis", "Crypto Trading", "Education"],
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
    categories: ["DeFi", "Yield Farming", "Education"],
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
    categories: ["Crypto Trading", "Market Analysis", "Education"],
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
      telegram: "https://t.me/cryptoyuki"
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
      }
    ]
  },
  {
    id: "9",
    name: "Maria Gonzalez",
    username: "cryptomaria",
    avatar: "/api/placeholder/64/64",
    role: "Technical Analyst",
    tier: "ROYAL",
    subscribers: 8900,
    category: "Analysis",
    categories: ["Market Analysis", "On-Chain Analysis", "Crypto Trading"],
    verified: true,
    contentTypes: ["Chart Analysis", "Technical Patterns", "Market Trends"],
    languages: ["English", "Spanish"],
    availability: {
      hasLimit: true,
      currentSlots: 20,
      maxSlots: 25,
      status: 'available'
    },
    socialLinks: {
      website: "https://cryptomaria.com",
      twitter: "https://twitter.com/cryptomaria",
      telegram: "https://t.me/cryptomaria"
    },
    bannerColor: "#ec4899",
    channels: [
      {
        id: "9-1",
        name: "Technical Analysis Pro",
        type: "premium",
        price: 8.0,
        description: "Advanced technical analysis and chart patterns",
        subscribers: 5600,
        telegramUrl: "https://t.me/cryptomaria_ta"
      }
    ]
  },
  {
    id: "10",
    name: "James Wilson",
    username: "cryptojames",
    avatar: "/api/placeholder/64/64",
    role: "Crypto Educator",
    tier: "PRO",
    subscribers: 15600,
    category: "Education",
    categories: ["Education", "DeFi", "Community"],
    verified: true,
    contentTypes: ["Educational Content", "Tutorials", "Q&A Sessions"],
    languages: ["English"],
    availability: {
      hasLimit: true,
      currentSlots: 45,
      maxSlots: 50,
      status: 'limited'
    },
    socialLinks: {
      website: "https://cryptojames.edu",
      twitter: "https://twitter.com/cryptojames",
      telegram: "https://t.me/cryptojames"
    },
    bannerColor: "#3b82f6",
    channels: [
      {
        id: "10-1",
        name: "Crypto Mastery Course",
        type: "premium",
        price: 15.0,
        description: "Complete cryptocurrency mastery course",
        subscribers: 12400,
        telegramUrl: "https://t.me/cryptojames_course"
      }
    ]
  },
  {
    id: "11",
    name: "Anna Petrov",
    username: "cryptoanna",
    avatar: "/api/placeholder/64/64",
    role: "DeFi Specialist",
    tier: "ROYAL",
    subscribers: 9200,
    category: "DeFi",
    categories: ["DeFi", "Yield Farming", "Liquidity Pools"],
    verified: true,
    contentTypes: ["DeFi Strategies", "Yield Optimization", "Risk Management"],
    languages: ["English", "Russian"],
    availability: {
      hasLimit: true,
      currentSlots: 18,
      maxSlots: 30,
      status: 'available'
    },
    socialLinks: {
      website: "https://cryptoanna.defi",
      twitter: "https://twitter.com/cryptoanna",
      telegram: "https://t.me/cryptoanna"
    },
    bannerColor: "#10b981",
    channels: [
      {
        id: "11-1",
        name: "DeFi Yield Strategies",
        type: "premium",
        price: 10.0,
        description: "Advanced DeFi yield farming strategies",
        subscribers: 6800,
        telegramUrl: "https://t.me/cryptoanna_yield"
      }
    ]
  },
  {
    id: "12",
    name: "Michael Chen",
    username: "cryptomike",
    avatar: "/api/placeholder/64/64",
    role: "NFT Trader",
    tier: "PRO",
    subscribers: 7800,
    category: "NFTs",
    categories: ["NFTs", "Market Analysis", "Community"],
    verified: false,
    contentTypes: ["NFT Analysis", "Market Trends", "Trading Tips"],
    languages: ["English", "Mandarin"],
    availability: {
      hasLimit: true,
      currentSlots: 25,
      maxSlots: 30,
      status: 'available'
    },
    socialLinks: {
      website: "https://cryptomike.nft",
      twitter: "https://twitter.com/cryptomike",
      telegram: "https://t.me/cryptomike"
    },
    bannerColor: "#8b5cf6",
    channels: [
      {
        id: "12-1",
        name: "NFT Trading Signals",
        type: "premium",
        price: 6.0,
        description: "NFT trading signals and market analysis",
        subscribers: 5200,
        telegramUrl: "https://t.me/cryptomike_nft"
      }
    ]
  },
  {
    id: "13",
    name: "Sophie Laurent",
    username: "cryptosophie",
    avatar: "/api/placeholder/64/64",
    role: "Market Analyst",
    tier: "ROYAL",
    subscribers: 12800,
    category: "Analysis",
    categories: ["Market Analysis", "On-Chain Analysis", "Education"],
    verified: true,
    contentTypes: ["Market Research", "Data Analysis", "Trend Reports"],
    languages: ["English", "French"],
    availability: {
      hasLimit: true,
      currentSlots: 40,
      maxSlots: 50,
      status: 'limited'
    },
    socialLinks: {
      website: "https://cryptosophie.com",
      twitter: "https://twitter.com/cryptosophie",
      telegram: "https://t.me/cryptosophie"
    },
    bannerColor: "#f59e0b",
    channels: [
      {
        id: "13-1",
        name: "Market Intelligence",
        type: "premium",
        price: 11.0,
        description: "Professional market intelligence and analysis",
        subscribers: 9600,
        telegramUrl: "https://t.me/cryptosophie_intel"
      }
    ]
  },
  {
    id: "14",
    name: "Alex Rodriguez",
    username: "cryptoalex2",
    avatar: "/api/placeholder/64/64",
    role: "Trading Expert",
    tier: "PRO",
    subscribers: 10500,
    category: "Trading",
    categories: ["Crypto Trading", "Market Analysis", "Education"],
    verified: true,
    contentTypes: ["Trading Strategies", "Risk Management", "Market Analysis"],
    languages: ["English", "Spanish"],
    availability: {
      hasLimit: true,
      currentSlots: 30,
      maxSlots: 35,
      status: 'limited'
    },
    socialLinks: {
      website: "https://cryptoalex2.trade",
      twitter: "https://twitter.com/cryptoalex2",
      telegram: "https://t.me/cryptoalex2"
    },
    bannerColor: "#ef4444",
    channels: [
      {
        id: "14-1",
        name: "Advanced Trading",
        type: "premium",
        price: 13.0,
        description: "Advanced trading strategies and techniques",
        subscribers: 7800,
        telegramUrl: "https://t.me/cryptoalex2_advanced"
      }
    ]
  },
  {
    id: "15",
    name: "Elena Volkov",
    username: "cryptoelena",
    avatar: "/api/placeholder/64/64",
    role: "DeFi Specialist",
    tier: "ROYAL",
    subscribers: 8600,
    category: "DeFi",
    categories: ["DeFi", "Yield Farming", "Education"],
    verified: true,
    contentTypes: ["DeFi Protocols", "Yield Strategies", "Security Analysis"],
    languages: ["English", "Russian"],
    availability: {
      hasLimit: true,
      currentSlots: 22,
      maxSlots: 25,
      status: 'limited'
    },
    socialLinks: {
      website: "https://cryptoelena.defi",
      twitter: "https://twitter.com/cryptoelena",
      telegram: "https://t.me/cryptoelena"
    },
    bannerColor: "#06b6d4",
    channels: [
      {
        id: "15-1",
        name: "DeFi Security Guide",
        type: "premium",
        price: 9.0,
        description: "DeFi security best practices and protocol analysis",
        subscribers: 6400,
        telegramUrl: "https://t.me/cryptoelena_security"
      }
    ]
  }
]

export function CreatorsProvider({ children }: { children: React.ReactNode }) {
  const [creators, setCreators] = useState<Creator[]>(initialMockCreators)

  // Load creators from localStorage on client side
  useEffect(() => {
    const savedCreators = localStorage.getItem("aio-creators")
    if (savedCreators) {
      try {
        const parsedCreators = JSON.parse(savedCreators)
        setCreators(parsedCreators)
      } catch (error) {
        console.error("Failed to parse saved creators:", error)
        setCreators(initialMockCreators)
      }
    }
  }, [])

  // Save creators to localStorage when they change
  useEffect(() => {
    localStorage.setItem("aio-creators", JSON.stringify(creators))
  }, [creators])

  const addCreator = (creator: Creator) => {
    setCreators(prev => [...prev, creator])
  }

  const updateCreator = (id: string, updatedCreator: Partial<Creator>) => {
    setCreators(prev => prev.map(creator => 
      creator.id === id ? { ...creator, ...updatedCreator } : creator
    ))
  }

  const removeCreator = (id: string) => {
    setCreators(prev => prev.filter(creator => creator.id !== id))
  }

  return (
    <CreatorsContext.Provider
      value={{
        creators,
        addCreator,
        updateCreator,
        removeCreator,
      }}
    >
      {children}
    </CreatorsContext.Provider>
  )
}

export function useCreators() {
  const context = useContext(CreatorsContext)
  if (context === undefined) {
    throw new Error("useCreators must be used within a CreatorsProvider")
  }
  return context
}

export type { Creator, Channel }
