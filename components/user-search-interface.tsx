"use client"

import { useState, useEffect } from "react"
import { UserGrid } from "./user-grid"
import { UserSearchFilters } from "./user-search-filters"
import { Search, Users, Filter, Grid3X3, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface Achievement {
  name: string
  icon?: any
  image?: string
  color: string
  unlocked: boolean
  claimed: boolean
  xp: number
  tooltip: string
}

export interface SocialMedia {
  platform: string
  image: string
  url: string
  connected: boolean
  username: string
  color: string
}

export interface User {
  id: string
  name: string
  username: string
  email: string
  avatar?: string
  role: 'NOMAD' | 'PRO' | 'ROYAL'
  status: 'online' | 'idle' | 'dnd' | 'offline'
  joinDate: string
  lastActive: string
  kycStatus: 'verified' | 'pending' | 'not_verified'
  totalPoints: number
  level: number
  activity?: string
  location?: string
  bio?: string
  achievements: Achievement[]
  socialMedia: SocialMedia[]
}

// Social media image paths
const socialImages = {
  Discord: "/images/social/discord.png",
  Telegram: "/images/social/telegram.png",
  X: "/images/social/x.png"
}

// Mock user data - in a real app, this would come from an API
const mockUsers: User[] = [
  {
    id: "1",
    name: "Alex Thompson",
    username: "@alex_trader",
    email: "alex.thompson@example.com",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg",
    role: "ROYAL",
    status: "online",
    joinDate: "2024-01-15",
    lastActive: "2 minutes ago",
    kycStatus: "verified",
    totalPoints: 15420,
    level: 8,
    activity: "Trading crypto",
    location: "New York, USA",
    bio: "Professional crypto trader with 5+ years experience",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" },
      { name: "KYC Verification", color: "#10B981", unlocked: true, claimed: true, xp: 25, tooltip: "Complete KYC verification" },
      { name: "Connect Discord", image: socialImages.Discord, color: "#5865F2", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Discord account" },
      { name: "Connect Telegram", image: socialImages.Telegram, color: "#0088CC", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Telegram account" },
      { name: "Upgrade to ROYAL", color: "#FFD700", unlocked: true, claimed: true, xp: 75, tooltip: "Upgrade to ROYAL membership" },
      { name: "Refer 5 ROYAL", color: "#FFD700", unlocked: true, claimed: false, xp: 80, tooltip: "Successfully refer 5 ROYAL members" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: true, username: "AlexTrader#1234", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: true, username: "@alex_trader_tg", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: true, username: "@alex_crypto_trader", color: "#000000" }
    ]
  },
  {
    id: "2",
    name: "Sarah Chen",
    username: "@sarah_nft",
    email: "sarah.chen@example.com",
    role: "PRO",
    status: "online",
    joinDate: "2024-02-20",
    lastActive: "5 minutes ago",
    kycStatus: "verified",
    totalPoints: 8750,
    level: 6,
    activity: "Analyzing markets",
    location: "Singapore",
    bio: "NFT collector and DeFi enthusiast",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" },
      { name: "KYC Verification", color: "#10B981", unlocked: true, claimed: true, xp: 25, tooltip: "Complete KYC verification" },
      { name: "Connect Discord", image: socialImages.Discord, color: "#5865F2", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Discord account" },
      { name: "Upgrade to PRO", color: "#4DA2FF", unlocked: true, claimed: true, xp: 50, tooltip: "Upgrade to PRO membership" },
      { name: "Refer 1 PRO", color: "#4DA2FF", unlocked: true, claimed: false, xp: 60, tooltip: "Successfully refer 1 PRO member" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: true, username: "SarahNFT#5678", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: false, username: "", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: false, username: "", color: "#000000" }
    ]
  },
  {
    id: "3",
    name: "Marcus Johnson",
    username: "@marcus_defi",
    email: "marcus.johnson@example.com",
    role: "PRO",
    status: "idle",
    joinDate: "2024-01-08",
    lastActive: "1 hour ago",
    kycStatus: "verified",
    totalPoints: 12300,
    level: 7,
    activity: "Away",
    location: "London, UK",
    bio: "DeFi protocol developer and yield farmer",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" },
      { name: "KYC Verification", color: "#10B981", unlocked: true, claimed: true, xp: 25, tooltip: "Complete KYC verification" },
      { name: "Connect Telegram", image: socialImages.Telegram, color: "#0088CC", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Telegram account" },
      { name: "Upgrade to PRO", color: "#4DA2FF", unlocked: true, claimed: true, xp: 50, tooltip: "Upgrade to PRO membership" },
      { name: "Connect Bybit", color: "#F7931A", unlocked: true, claimed: false, xp: 25, tooltip: "Connect Bybit account" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: false, username: "", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: true, username: "@marcus_defi", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: false, username: "", color: "#000000" }
    ]
  },
  {
    id: "4",
    name: "Emma Rodriguez",
    username: "@emma_crypto",
    email: "emma.rodriguez@example.com",
    role: "NOMAD",
    status: "online",
    joinDate: "2024-03-10",
    lastActive: "Just now",
    kycStatus: "pending",
    totalPoints: 3200,
    level: 3,
    activity: "Learning about crypto",
    location: "Madrid, Spain",
    bio: "New to crypto, eager to learn",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" },
      { name: "Connect Discord", image: socialImages.Discord, color: "#5865F2", unlocked: true, claimed: false, xp: 15, tooltip: "Connect Discord account" },
      { name: "KYC Verification", color: "#10B981", unlocked: false, claimed: false, xp: 25, tooltip: "Complete KYC verification" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: true, username: "EmmaCrypto#9876", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: false, username: "", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: false, username: "", color: "#000000" }
    ]
  },
  {
    id: "5",
    name: "David Kim",
    username: "@david_whale",
    email: "david.kim@example.com",
    role: "ROYAL",
    status: "dnd",
    joinDate: "2023-12-05",
    lastActive: "30 minutes ago",
    kycStatus: "verified",
    totalPoints: 25600,
    level: 10,
    activity: "In a meeting",
    location: "Seoul, South Korea",
    bio: "Crypto whale and institutional investor",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" },
      { name: "KYC Verification", color: "#10B981", unlocked: true, claimed: true, xp: 25, tooltip: "Complete KYC verification" },
      { name: "Connect Discord", image: socialImages.Discord, color: "#5865F2", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Discord account" },
      { name: "Connect Telegram", image: socialImages.Telegram, color: "#0088CC", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Telegram account" },
      { name: "Connect X", image: socialImages.X, color: "#000000", unlocked: true, claimed: true, xp: 15, tooltip: "Connect X account" },
      { name: "Upgrade to ROYAL", color: "#FFD700", unlocked: true, claimed: true, xp: 75, tooltip: "Upgrade to ROYAL membership" },
      { name: "Refer 10 NOMADs", color: "#6B7280", unlocked: true, claimed: true, xp: 75, tooltip: "Successfully refer 10 NOMADs" },
      { name: "Refer 3 ROYAL", color: "#FFD700", unlocked: true, claimed: false, xp: 70, tooltip: "Successfully refer 3 ROYAL members" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: true, username: "DavidWhale#0001", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: true, username: "@david_whale", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: true, username: "@david_crypto_whale", color: "#000000" }
    ]
  },
  {
    id: "6",
    name: "Lisa Wang",
    username: "@lisa_analyst",
    email: "lisa.wang@example.com",
    role: "PRO",
    status: "online",
    joinDate: "2024-01-25",
    lastActive: "15 minutes ago",
    kycStatus: "verified",
    totalPoints: 9800,
    level: 6,
    activity: "Market analysis",
    location: "Hong Kong",
    bio: "Technical analyst and chart expert",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" },
      { name: "KYC Verification", color: "#10B981", unlocked: true, claimed: true, xp: 25, tooltip: "Complete KYC verification" },
      { name: "Connect Telegram", image: socialImages.Telegram, color: "#0088CC", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Telegram account" },
      { name: "Upgrade to PRO", color: "#4DA2FF", unlocked: true, claimed: true, xp: 50, tooltip: "Upgrade to PRO membership" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: false, username: "", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: true, username: "@lisa_analyst", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: false, username: "", color: "#000000" }
    ]
  },
  {
    id: "7",
    name: "James Wilson",
    username: "@james_hodler",
    email: "james.wilson@example.com",
    role: "NOMAD",
    status: "offline",
    joinDate: "2024-02-14",
    lastActive: "2 hours ago",
    kycStatus: "not_verified",
    totalPoints: 1850,
    level: 2,
    activity: "Offline",
    location: "Toronto, Canada",
    bio: "Long-term HODLer and Bitcoin maximalist",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: false, xp: 15, tooltip: "Upload a profile picture" },
      { name: "KYC Verification", color: "#10B981", unlocked: false, claimed: false, xp: 25, tooltip: "Complete KYC verification" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: false, username: "", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: false, username: "", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: false, username: "", color: "#000000" }
    ]
  },
  {
    id: "8",
    name: "Maria Santos",
    username: "@maria_trader",
    email: "maria.santos@example.com",
    role: "PRO",
    status: "online",
    joinDate: "2024-01-30",
    lastActive: "8 minutes ago",
    kycStatus: "verified",
    totalPoints: 11200,
    level: 7,
    activity: "Day trading",
    location: "São Paulo, Brazil",
    bio: "Day trader specializing in altcoins",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" },
      { name: "KYC Verification", color: "#10B981", unlocked: true, claimed: true, xp: 25, tooltip: "Complete KYC verification" },
      { name: "Connect Discord", image: socialImages.Discord, color: "#5865F2", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Discord account" },
      { name: "Upgrade to PRO", color: "#4DA2FF", unlocked: true, claimed: true, xp: 50, tooltip: "Upgrade to PRO membership" },
      { name: "Make 3 Cycles", color: "#10B981", unlocked: true, claimed: false, xp: 50, tooltip: "Complete 3 trading cycles" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: true, username: "MariaTrader#4321", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: false, username: "", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: false, username: "", color: "#000000" }
    ]
  },
  {
    id: "5",
    name: "David Chen",
    username: "@david_crypto",
    email: "david.chen@example.com",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg",
    role: "PRO",
    status: "online",
    joinDate: "2024-02-20",
    lastActive: "5 minutes ago",
    kycStatus: "verified",
    totalPoints: 8750,
    level: 6,
    activity: "DeFi farming",
    location: "Singapore",
    bio: "DeFi enthusiast and yield farmer",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" },
      { name: "Connect Discord", color: "#5865F2", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Discord account" },
      { name: "Upgrade to PRO", color: "#4DA2FF", unlocked: true, claimed: true, xp: 50, tooltip: "Upgrade to PRO membership" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: true, username: "DavidCrypto#9876", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: true, username: "@david_defi", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: false, username: "", color: "#000000" }
    ]
  },
  {
    id: "6",
    name: "Emma Rodriguez",
    username: "@emma_nft",
    email: "emma.rodriguez@example.com",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg",
    role: "ROYAL",
    status: "idle",
    joinDate: "2024-01-10",
    lastActive: "1 hour ago",
    kycStatus: "verified",
    totalPoints: 18900,
    level: 9,
    activity: "NFT collecting",
    location: "Madrid, Spain",
    bio: "NFT collector and digital artist",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" },
      { name: "Connect Discord", color: "#5865F2", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Discord account" },
      { name: "Connect Telegram", color: "#0088CC", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Telegram account" },
      { name: "Upgrade to PRO", color: "#4DA2FF", unlocked: true, claimed: true, xp: 50, tooltip: "Upgrade to PRO membership" },
      { name: "Upgrade to ROYAL", color: "#FFD700", unlocked: true, claimed: true, xp: 75, tooltip: "Upgrade to ROYAL membership" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: true, username: "EmmaNFT#1234", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: true, username: "@emma_artist", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: true, username: "@emma_nft_art", color: "#000000" }
    ]
  },
  {
    id: "7",
    name: "James Wilson",
    username: "@james_hodl",
    email: "james.wilson@example.com",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg",
    role: "NOMAD",
    status: "online",
    joinDate: "2024-03-15",
    lastActive: "Just now",
    kycStatus: "pending",
    totalPoints: 3200,
    level: 3,
    activity: "Learning crypto",
    location: "London, UK",
    bio: "New to crypto, eager to learn",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" },
      { name: "Connect Discord", color: "#5865F2", unlocked: true, claimed: false, xp: 15, tooltip: "Connect Discord account" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: true, username: "JamesHODL#5555", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: false, username: "", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: false, username: "", color: "#000000" }
    ]
  },
  {
    id: "8",
    name: "Sophia Kim",
    username: "@sophia_web3",
    email: "sophia.kim@example.com",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg",
    role: "PRO",
    status: "dnd",
    joinDate: "2024-01-25",
    lastActive: "30 minutes ago",
    kycStatus: "verified",
    totalPoints: 11200,
    level: 7,
    activity: "Building dApps",
    location: "Seoul, South Korea",
    bio: "Web3 developer and blockchain enthusiast",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" },
      { name: "Connect Discord", color: "#5865F2", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Discord account" },
      { name: "Connect Telegram", color: "#0088CC", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Telegram account" },
      { name: "Upgrade to PRO", color: "#4DA2FF", unlocked: true, claimed: true, xp: 50, tooltip: "Upgrade to PRO membership" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: true, username: "SophiaWeb3#7890", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: true, username: "@sophia_dev", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: true, username: "@sophia_web3", color: "#000000" }
    ]
  },
  {
    id: "9",
    name: "Michael Brown",
    username: "@mike_trader",
    email: "michael.brown@example.com",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg",
    role: "PRO",
    status: "online",
    joinDate: "2024-02-05",
    lastActive: "3 minutes ago",
    kycStatus: "verified",
    totalPoints: 9800,
    level: 6,
    activity: "Swing trading",
    location: "Toronto, Canada",
    bio: "Professional swing trader and market analyst",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" },
      { name: "Connect Discord", color: "#5865F2", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Discord account" },
      { name: "Upgrade to PRO", color: "#4DA2FF", unlocked: true, claimed: true, xp: 50, tooltip: "Upgrade to PRO membership" },
      { name: "Connect Bybit", color: "#F7931A", unlocked: true, claimed: true, xp: 25, tooltip: "Connect Bybit account" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: true, username: "MikeTrader#3456", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: false, username: "", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: true, username: "@mike_trades", color: "#000000" }
    ]
  },
  {
    id: "10",
    name: "Isabella Garcia",
    username: "@bella_crypto",
    email: "isabella.garcia@example.com",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg",
    role: "ROYAL",
    status: "online",
    joinDate: "2024-01-08",
    lastActive: "1 minute ago",
    kycStatus: "verified",
    totalPoints: 22100,
    level: 10,
    activity: "Community management",
    location: "Barcelona, Spain",
    bio: "Community manager and crypto educator",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" },
      { name: "Connect Discord", color: "#5865F2", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Discord account" },
      { name: "Connect Telegram", color: "#0088CC", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Telegram account" },
      { name: "Upgrade to PRO", color: "#4DA2FF", unlocked: true, claimed: true, xp: 50, tooltip: "Upgrade to PRO membership" },
      { name: "Upgrade to ROYAL", color: "#FFD700", unlocked: true, claimed: true, xp: 75, tooltip: "Upgrade to ROYAL membership" },
      { name: "Refer 5 Users", color: "#10B981", unlocked: true, claimed: true, xp: 100, tooltip: "Successfully refer 5 users" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: true, username: "BellaCrypto#1111", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: true, username: "@bella_community", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: true, username: "@bella_crypto_ed", color: "#000000" }
    ]
  },
  {
    id: "11",
    name: "Ryan O'Connor",
    username: "@ryan_defi",
    email: "ryan.oconnor@example.com",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg",
    role: "NOMAD",
    status: "idle",
    joinDate: "2024-03-20",
    lastActive: "2 hours ago",
    kycStatus: "not_verified",
    totalPoints: 1800,
    level: 2,
    activity: "Exploring DeFi",
    location: "Dublin, Ireland",
    bio: "New to DeFi, exploring opportunities",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: false, username: "", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: true, username: "@ryan_explorer", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: false, username: "", color: "#000000" }
    ]
  },
  {
    id: "12",
    name: "Aisha Patel",
    username: "@aisha_blockchain",
    email: "aisha.patel@example.com",
    avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg",
    role: "PRO",
    status: "online",
    joinDate: "2024-02-12",
    lastActive: "Just now",
    kycStatus: "verified",
    totalPoints: 13500,
    level: 8,
    activity: "Smart contract auditing",
    location: "Mumbai, India",
    bio: "Blockchain security expert and smart contract auditor",
    achievements: [
      { name: "Profile Picture", color: "#4DA2FF", unlocked: true, claimed: true, xp: 15, tooltip: "Upload a profile picture" },
      { name: "Connect Discord", color: "#5865F2", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Discord account" },
      { name: "Connect Telegram", color: "#0088CC", unlocked: true, claimed: true, xp: 15, tooltip: "Connect Telegram account" },
      { name: "Upgrade to PRO", color: "#4DA2FF", unlocked: true, claimed: true, xp: 50, tooltip: "Upgrade to PRO membership" },
      { name: "Security Expert", color: "#EF4444", unlocked: true, claimed: true, xp: 75, tooltip: "Complete security audit" }
    ],
    socialMedia: [
      { platform: "Discord", image: socialImages.Discord, url: "https://discord.gg/aionet", connected: true, username: "AishaBlockchain#2468", color: "#5865F2" },
      { platform: "Telegram", image: socialImages.Telegram, url: "https://t.me/aionet", connected: true, username: "@aisha_security", color: "#0088CC" },
      { platform: "X", image: socialImages.X, url: "https://x.com/aionet", connected: true, username: "@aisha_audits", color: "#000000" }
    ]
  }
]

export function UserSearchInterface() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'NOMAD' | 'PRO' | 'ROYAL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'online' | 'idle' | 'dnd' | 'offline'>('ALL')
  const [sortBy, setSortBy] = useState<'name' | 'joinDate' | 'level' | 'points'>('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter and sort users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'ALL' || user.status === selectedStatus

    return matchesSearch && matchesRole && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'joinDate':
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
      case 'level':
        return b.level - a.level
      case 'points':
        return b.totalPoints - a.totalPoints
      default:
        return 0
    }
  })

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
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF] placeholder:text-[#C0E6FF]/60"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(
                  viewMode === 'grid'
                    ? "bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
                    : "border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#4DA2FF]/10"
                )}
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Avatars</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  viewMode === 'list'
                    ? "bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
                    : "border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#4DA2FF]/10"
                )}
              >
                <List className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <UserSearchFilters
            selectedRole={selectedRole}
            selectedStatus={selectedStatus}
            sortBy={sortBy}
            onRoleChange={setSelectedRole}
            onStatusChange={setSelectedStatus}
            onSortChange={setSortBy}
          />

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-4 border-t border-[#C0E6FF]/20">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4DA2FF]" />
              <span className="text-[#C0E6FF] text-sm">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-400 text-green-400">
                {filteredUsers.filter(u => u.status === 'online').length} Online
              </Badge>
              <Badge variant="outline" className="border-[#4DA2FF] text-[#4DA2FF]">
                {filteredUsers.filter(u => u.kycStatus === 'verified').length} Verified
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* User Grid/List */}
      <UserGrid users={filteredUsers} viewMode={viewMode} />
    </div>
  )
}
