"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Coins,
  Dice6,
  Rocket,
  Clock,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Crown
} from "lucide-react"

interface DAppInfo {
  name: string
  description: string
  icon: React.ReactNode
  features: string[]
  status: 'coming-soon' | 'beta' | 'live'
  estimatedLaunch?: string
  category: string
  href: string
  flagship?: boolean
}

const dapps: DAppInfo[] = [
  {
    name: "NodeMe Pool",
    description: "Comprehensive node management dashboard for Aethir and Hytopia nodes with real-time rewards tracking, staking management, and NFT portfolio overview.",
    icon: <Image src="/images/nodeme.png" alt="NodeMe Pool" width={32} height={32} className="w-8 h-8" />,
    features: [
      "Node rewards tracking",
      "Aethir & Hytopia nodes",
      "Staking management",
      "NFT portfolio view",
      "Real-time updates"
    ],
    status: "live",
    category: "Node Management",
    href: "/dapps/nodeme-pool"
  },
  {
    name: "RaffleCraft",
    description: "Live decentralized raffle platform with POL token integration. Participate in current rounds, track ticket purchases, and view winners history.",
    icon: <Image src="/images/rafflecraft.png" alt="RaffleCraft" width={32} height={32} className="w-8 h-8" />,
    features: [
      "Live raffle rounds",
      "POL token minting",
      "Ticket tracking",
      "Winners history",
      "Admin controls"
    ],
    status: "live",
    category: "Gaming",
    href: "/dapps/rafflecraft"
  },
  {
    name: "DEWhale Launchpad",
    description: "Premier launchpad for innovative projects on Sui Network with tier-based access and rigorous due diligence.",
    icon: <Image src="/images/dewhale.png" alt="DEWhale Launchpad" width={32} height={32} className="w-8 h-8" />,
    features: [
      "Project launches",
      "Tier-based access",
      "Due diligence",
      "Sui native",
      "High success rate"
    ],
    status: "coming-soon",
    estimatedLaunch: "Q4 2024",
    category: "Launchpad",
    href: "/dapps/dewhale-launchpad",
    flagship: true
  }
]

export function DAppsSection() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-[#4DA2FF] text-white'
      case 'beta':
        return 'bg-orange-500 text-white'
      case 'coming-soon':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live':
        return 'Live'
      case 'beta':
        return 'Beta'
      case 'coming-soon':
        return 'Coming Soon'
      default:
        return 'Coming Soon'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {dapps.map((dapp, index) => (
          <div key={dapp.name} className={`enhanced-card group hover:border-[#4DA2FF]/50 transition-all duration-300 ${dapp.flagship ? 'ring-2 ring-[#4DA2FF] ring-opacity-50' : ''}`}>
            <div className="enhanced-card-content">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#1a2f51] rounded-xl group-hover:scale-110 transition-transform duration-300">
                    {dapp.icon}
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                      {dapp.name}
                      {dapp.flagship && (
                        <Badge className="bg-gradient-to-r from-[#4DA2FF] to-purple-500 text-white text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Flagship
                        </Badge>
                      )}
                    </h3>
                    <Badge className={`mt-1 ${getStatusColor(dapp.status)}`}>
                      {getStatusText(dapp.status)}
                    </Badge>
                  </div>
                </div>
                <Badge variant="outline" className="border-[#C0E6FF] text-[#C0E6FF]">
                  {dapp.category}
                </Badge>
              </div>
              <div className="space-y-4">
              <p className="text-[#C0E6FF] text-sm leading-relaxed">
                {dapp.description}
              </p>

              <div className="space-y-2">
                <h4 className="text-[#FFFFFF] font-medium text-sm">Key Features:</h4>
                <ul className="space-y-1">
                  {dapp.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-[#C0E6FF] text-sm">
                      <div className="w-1.5 h-1.5 bg-[#4DA2FF] rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {dapp.estimatedLaunch && (
                <div className="flex items-center gap-2 p-3 bg-[#4DA2FF]/10 rounded-lg border border-[#4DA2FF]/30">
                  <Clock className="w-4 h-4 text-[#4DA2FF]" />
                  <span className="text-[#4DA2FF] text-sm font-medium">
                    Expected Launch: {dapp.estimatedLaunch}
                  </span>
                </div>
              )}

              <div className="pt-2">
                {dapp.status === 'live' ? (
                  <Button asChild className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-[#FFFFFF]">
                    <Link href={dapp.href}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Launch App
                    </Link>
                  </Button>
                ) : dapp.status === 'beta' ? (
                  <Button asChild className="w-full bg-orange-500 hover:bg-orange-500/80 text-white">
                    <Link href={dapp.href}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Join Beta
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className={`w-full ${dapp.flagship ? 'bg-gradient-to-r from-[#4DA2FF] to-purple-500 text-white hover:opacity-90' : 'border-[#C0E6FF] text-[#C0E6FF] hover:bg-[#C0E6FF]/10'}`}
                    variant={dapp.flagship ? "default" : "outline"}
                  >
                    <Link href={dapp.href}>
                      {dapp.flagship ? <Crown className="w-4 h-4 mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                      {dapp.flagship ? 'Explore Flagship' : 'Preview'}
                    </Link>
                  </Button>
                )}
              </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter Signup for Updates */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-[#4DA2FF]" />
              <h3 className="text-xl font-bold text-[#FFFFFF]">Stay Updated</h3>
            </div>
            <p className="text-[#C0E6FF] max-w-md mx-auto">
              Be the first to know when our DApps launch. Get exclusive early access and special benefits.
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-[#030F1C] border border-[#C0E6FF]/30 rounded-lg text-[#FFFFFF] placeholder-[#C0E6FF]/50 focus:outline-none focus:border-[#4DA2FF]"
              />
              <Button className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-[#FFFFFF]">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Development Status */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-white mb-6 justify-center">
            <h3 className="text-xl font-semibold">DApps Status</h3>
          </div>
          <div>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-between mx-auto">
                  <span className="text-green-400 font-bold text-lg mx-auto">✓</span>
                </div>
                <h4 className="text-[#FFFFFF] font-medium">NodeMe Pool</h4>
                <p className="text-green-400 text-sm font-medium">Live - Node Management</p>
                <p className="text-[#C0E6FF] text-xs">Track rewards & manage nodes</p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-green-400 font-bold text-lg">✓</span>
                </div>
                <h4 className="text-[#FFFFFF] font-medium">RaffleCraft</h4>
                <p className="text-green-400 text-sm font-medium">Live - Raffle Platform</p>
                <p className="text-[#C0E6FF] text-xs">Participate in live rounds</p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-[#4DA2FF] to-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-[#FFFFFF] font-medium">DEWhale Launchpad</h4>
                <p className="text-yellow-400 text-sm font-medium">Coming Q4 2024</p>
                <p className="text-[#C0E6FF] text-xs">Flagship project launchpad</p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
