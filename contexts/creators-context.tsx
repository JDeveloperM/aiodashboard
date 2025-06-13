"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface Channel {
  id: string
  name: string
  type: 'free' | 'premium' | 'vip'
  price: number // in SUI
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
  coverImage?: string // Optional cover image for banner background
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
        name: "VIP Trading Room",
        type: "vip",
        price: 15.0,
        description: "Exclusive VIP trading room with live calls",
        subscribers: 450,
        telegramUrl: "https://t.me/cryptoalex_vip",
        availability: {
          hasLimit: true,
          currentSlots: 18,
          maxSlots: 25,
          status: 'available'
        }
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
    username: "onchainmarcus",
    avatar: "/api/placeholder/64/64",
    role: "Technical Analyst",
    tier: "ROYAL",
    subscribers: 9500,
    category: "Analysis",
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
