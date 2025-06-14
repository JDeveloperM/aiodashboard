"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  ArrowRight
} from "lucide-react"
import { useSubscription } from "@/contexts/subscription-context"
import { RoleImage } from "@/components/ui/role-image"

interface NFTTier {
  id: 'NOMAD' | 'PRO' | 'ROYAL'
  name: string
  price: number
  currency: string
  features: string[]
  icon: React.ReactNode
  color: string
  gradient: string
  maxSupply: number
  currentSupply: number
  benefits: string[]
}

const nftTiers: NFTTier[] = [
  {
    id: 'NOMAD',
    name: 'NOMAD',
    price: 0,
    currency: 'FREE',
    features: [
      'Bybit Copy Trading Access',
      '$25 per 10% profit cycle',
      'Discord Community Access',
      'Monthly Reports',
      'Basic Support'
    ],
    icon: <RoleImage role="NOMAD" size="2xl" />,
    color: '#6B7280',
    gradient: 'from-gray-500 to-gray-700',
    maxSupply: 0,
    currentSupply: 0,
    benefits: [
      'Access to copy trading platform',
      'Basic community features',
      'Standard customer support'
    ]
  },
  {
    id: 'PRO',
    name: 'PRO NFT',
    price: 400,
    currency: 'EUR',
    features: [
      'No Cycle Payments',
      'Discord PRO Role',
      'AIO Creators Access',
      'Affiliate Program',
      'MetaGo Academy Premium',
      'Priority Support'
    ],
    icon: <RoleImage role="PRO" size="2xl" />,
    color: '#4DA2FF',
    gradient: 'from-[#4DA2FF] to-[#011829]',
    maxSupply: 1100,
    currentSupply: 163,
    benefits: [
      'Exempt from $25 cycle payments',
      'Access to advanced educational content',
      'Priority customer support',
      'Exclusive community channels',
      'Advanced portfolio analytics'
    ]
  },
  {
    id: 'ROYAL',
    name: 'ROYAL NFT',
    price: 1500,
    currency: 'EUR',
    features: [
      'All PRO Features',
      'Stock Trading Bots (VIP)',
      'Forex Trading Bots (VIP)',
      'Discord ROYAL Role',
      'Royalty Distribution (25%)',
      'DEWhale Early Access'
    ],
    icon: <RoleImage role="ROYAL" size="2xl" />,
    color: '#FFD700',
    gradient: 'from-yellow-400 to-yellow-600',
    maxSupply: 500,
    currentSupply: 120,
    benefits: [
      'All PRO tier benefits included',
      'Access to VIP trading strategies',
      'Personal trading consultation',
      'Early access to new DApps',
      'Highest tier community status'
    ]
  }
]

export function DashboardSubscriptions() {
  const { tier, setTier, isUpdatingTier } = useSubscription()
  const [selectedTier, setSelectedTier] = useState<NFTTier | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)

  const currentTierData = nftTiers.find(t => t.id === tier) || nftTiers[0]

  const handleUpgrade = async (targetTier: NFTTier) => {
    setIsUpgrading(true)
    setSelectedTier(targetTier)

    try {
      // Simulate NFT purchase process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update tier in database and Walrus storage
      console.log(`🎯 Upgrading to ${targetTier.id}...`)
      await setTier(targetTier.id)
      console.log(`✅ Successfully upgraded to ${targetTier.id}`)
    } catch (error) {
      console.error(`❌ Failed to upgrade to ${targetTier.id}:`, error)
    } finally {
      setIsUpgrading(false)
      setSelectedTier(null)
    }
  }

  const getSupplyPercentage = (current: number, max: number) => {
    return max > 0 ? (current / max) * 100 : 0
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">AIONET NFT Tiers</h2>
          <p className="text-[#C0E6FF] mt-1">Mint your NFT on Sui Network to unlock exclusive features</p>
        </div>
        <Badge className={`bg-gradient-to-r ${currentTierData.gradient} text-white px-4 py-2`}>
          Current: {currentTierData.name}
        </Badge>
      </div>

      {/* NFT Tiers */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {nftTiers.map((tierData) => {
          const isCurrentTier = tierData.id === tier
          const canUpgrade = tierData.id !== 'NOMAD' && tierData.id !== tier

          return (
            <div
              key={tierData.id}
              className={`enhanced-card transition-all duration-300 ${
                isCurrentTier
                  ? 'ring-2 ring-[#4DA2FF] ring-opacity-50'
                  : 'hover:border-[#4DA2FF]/50'
              }`}
            >
              <div className="enhanced-card-content">
                <div className="mb-6">
                <div className="flex items-center justify-between">
                  {tierData.icon}
                  {isCurrentTier && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{tierData.name}</h3>
                <div className="text-2xl font-bold text-[#4DA2FF]">
                  {tierData.price === 0 ? 'FREE' : `€${tierData.price}`}
                  {tierData.price > 0 && (
                    <span className="text-sm text-[#C0E6FF] font-normal ml-2">one-time</span>
                  )}
                </div>
                </div>

                <div className="space-y-4">
                {/* Supply Information for NFTs */}
                {tierData.maxSupply > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#C0E6FF]">Supply</span>
                      <span className="text-white">{tierData.currentSupply}/{tierData.maxSupply}</span>
                    </div>
                    <Progress
                      value={getSupplyPercentage(tierData.currentSupply, tierData.maxSupply)}
                      className="h-2"
                    />
                  </div>
                )}

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-[#C0E6FF]">Features:</h4>
                  <ul className="space-y-1">
                    {tierData.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-white">
                        <CheckCircle className="w-3 h-3 text-[#4DA2FF]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {isCurrentTier ? (
                    <Button
                      disabled
                      className="w-full bg-green-500 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Current Tier
                    </Button>
                  ) : canUpgrade ? (
                    <Button
                      onClick={() => handleUpgrade(tierData)}
                      disabled={isUpgrading || isUpdatingTier}
                      className={`w-full text-white ${
                        tierData.id === 'PRO'
                          ? 'bg-[#4da2ff] hover:bg-[#3d8bff] transition-colors duration-200'
                          : `bg-gradient-to-r ${tierData.gradient} hover:opacity-90`
                      }`}
                    >
                      {(isUpgrading && selectedTier?.id === tierData.id) || isUpdatingTier ? (
                        "Processing..."
                      ) : (
                        <>
                          Upgrade to {tierData.name}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      disabled
                      variant="outline"
                      className="w-full border-[#C0E6FF]/30 text-[#C0E6FF]"
                    >
                      {tierData.id === 'NOMAD' ? 'Default Tier' : 'Lower Tier'}
                    </Button>
                  )}
                </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Benefits Comparison */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-white mb-6">
            <h3 className="text-xl font-semibold">Tier Benefits Comparison</h3>
          </div>
          <div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#C0E6FF]/20">
                  <th className="text-left py-3 text-[#C0E6FF] font-medium">Benefit</th>
                  <th className="text-center py-3 text-[#C0E6FF] font-medium">NOMAD</th>
                  <th className="text-center py-3 text-[#C0E6FF] font-medium">PRO</th>
                  <th className="text-center py-3 text-[#C0E6FF] font-medium">ROYAL</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-[#C0E6FF]/10">
                  <td className="py-3 text-white">Copy Trading Access</td>
                  <td className="py-3 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  <td className="py-3 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  <td className="py-3 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-[#C0E6FF]/10">
                  <td className="py-3 text-white">Cycle Payment Exemption</td>
                  <td className="py-3 text-center text-red-400">✗</td>
                  <td className="py-3 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  <td className="py-3 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-[#C0E6FF]/10">
                  <td className="py-3 text-white">Advanced Courses</td>
                  <td className="py-3 text-center text-red-400">✗</td>
                  <td className="py-3 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  <td className="py-3 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-[#C0E6FF]/10">
                  <td className="py-3 text-white">VIP Trading Bots</td>
                  <td className="py-3 text-center text-red-400">✗</td>
                  <td className="py-3 text-center text-red-400">✗</td>
                  <td className="py-3 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                </tr>

              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
