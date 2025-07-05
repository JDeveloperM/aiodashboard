"use client"

import Link from "next/link"
import { useSubscription } from "@/contexts/subscription-context"
import { useCommunityAnalytics } from "@/hooks/use-community-analytics"

import { RoleImage } from "@/components/ui/role-image"
import { TrendingUp, Users, Copy, Zap, BookOpen, ArrowRight, CheckCircle, Dice6, Rocket, RefreshCw, UserCheck, MessageSquare, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"

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
    title: "Find Members",
    description: "Search and connect with community members across the network",
    icon: Search,
    href: "/community",
    features: ["User Search", "Profile Discovery", "Network Building"],
    color: "#10B981"
  },
  {
    title: "Find Creators",
    description: "Discover content creators and access premium channels",
    icon: UserCheck,
    href: "/aio-creators",
    features: ["Creator Profiles", "Premium Channels", "Content Access"],
    color: "#9333EA"
  },
  {
    title: "Forum",
    description: "Engage in community discussions and share knowledge",
    icon: MessageSquare,
    href: "/forum",
    features: ["Discussion Categories", "Creator Channels", "Community Posts"],
    color: "#2196F3"
  }
]




export default function AIODashboard() {
  const { tier } = useSubscription()
  const { analytics, isLoading, error, refreshAnalytics } = useCommunityAnalytics()

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">AIO Dashboard</h1>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="enhanced-card">
              <div className="enhanced-card-content">
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-[#4DA2FF] animate-spin" />
                  <span className="ml-2 text-[#C0E6FF]">Loading...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !analytics) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">AIO Dashboard</h1>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content text-center py-8">
            <p className="text-red-400 mb-4">Failed to load community analytics</p>
            <button
              onClick={refreshAnalytics}
              className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">AIO Dashboard</h1>
            <p className="text-[#C0E6FF] text-sm mt-1">
              Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
            </p>
          </div>
          <button
            onClick={refreshAnalytics}
            className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

      {/* AIONET Community Stats */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Total AIONET Users */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Total AIONET Users</p>
                <p className="text-2xl font-bold text-white">{analytics.totalHolders}</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* NOMAD Users */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">NOMAD Users</p>
                <p className="text-2xl font-bold text-white">{analytics.nomadUsers}</p>
              </div>
              <RoleImage role="NOMAD" size="2xl" />
            </div>
          </div>
        </div>

        {/* PRO NFT Holders */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">PRO NFT Holders</p>
                <p className="text-2xl font-bold text-white">{analytics.proHolders}</p>
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
                <p className="text-2xl font-bold text-white">{analytics.royalHolders}</p>
              </div>
              <RoleImage role="ROYAL" size="2xl" />
            </div>
          </div>
        </div>
      </div>



      {/* Quick Navigation Cards */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Quick Navigation</h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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
                  {analytics.proHolders + analytics.royalHolders} / {analytics.dewhaleTargetHolders}
                </div>
                <div className="text-sm text-[#C0E6FF]">PRO/ROYAL Users for DEWhale Deployment</div>
                <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
                  <div
                    className="bg-gradient-to-r from-[#4DA2FF] to-[#007ACC] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((analytics.proHolders + analytics.royalHolders) / analytics.dewhaleTargetHolders) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-[#4DA2FF]/10 border border-[#4DA2FF]/20 rounded-lg p-3">
                <div className="text-[#4DA2FF] text-sm font-medium mb-1">Coming Soon</div>
                <div className="text-[#C0E6FF] text-sm">
                  DEWhale will launch when we reach 500 PRO/ROYAL users, enabling $100 KeyShares for early-stage investments.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
