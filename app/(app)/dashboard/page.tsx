"use client"

import Link from "next/link"
import { useSubscription } from "@/contexts/subscription-context"

import { RoleImage } from "@/components/ui/role-image"
import { TrendingUp, Users, Copy, Zap, BookOpen, ArrowRight, CheckCircle, ShoppingBag } from "lucide-react"

import { Badge } from "@/components/ui/badge"



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
              <RoleImage role="Copier" size="2xl" />
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
              <RoleImage role="PRO" size="2xl" />
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
              <RoleImage role="ROYAL" size="2xl" />
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
