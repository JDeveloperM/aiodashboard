"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
      'Bybit Copy Trading (Crypto) Access',
      '$25 per 10% profit cycle',
      'Entry to the Official Discord Community',
      'Affiliate Dashboard & Control Access',
      'AIO Creators Channels Access',
      'MetaGo Academy Crypto Basic Level'
    ],
    icon: <RoleImage role="NOMAD" size="2xl" />,
    color: '#6B7280',
    gradient: 'from-gray-500 to-gray-700',
    maxSupply: 0,
    currentSupply: 0,
    benefits: [
      'Access to crypto copy trading platform',
      'Basic community features',
      'Standard affiliate access'
    ]
  },
  {
    id: 'PRO',
    name: 'PRO NFT',
    price: 400,
    currency: 'EUR',
    features: [
      'Bybit Copy Trading (Crypto) Access',
      'No Cycle Payments',
      'PRO Role within the Discord Community',
      'Affiliate Dashboard & Control Access',
      'MetaGo Academy Premium',
      'Access to RaffleCraft Decentralized Application',
      'Access to DEWhale Decentralized Application',
      'Comprehensive access to AIO Creator tools',
      'Free Access to 3 Premium AIO Creators channels'
    ],
    icon: <RoleImage role="PRO" size="2xl" />,
    color: '#4DA2FF',
    gradient: 'from-[#4DA2FF] to-[#011829]',
    maxSupply: 0,
    currentSupply: 0,
    benefits: [
      'Exempt from $25 cycle payments',
      'Access to premium educational content',
      'Priority customer support',
      'Exclusive community channels',
      'Advanced creator tools access'
    ]
  },
  {
    id: 'ROYAL',
    name: 'ROYAL NFT',
    price: 1500,
    currency: 'EUR',
    features: [
      'All PRO Features',
      'Bybit Copy Trading (FOREX) Access',
      'Bybit Copy Trading (STOCKS) Access',
      'Exclusive ROYAL Role in the Discord Community',
      'Priority early access to DEWhale DApp updates and features',
      'Free Access to 9 Premium AIO Creators channels',
      'Participation in Royalty Distribution: 10% from all new NFT mints'
    ],
    icon: <RoleImage role="ROYAL" size="2xl" />,
    color: '#FFD700',
    gradient: 'from-yellow-400 to-yellow-600',
    maxSupply: 0,
    currentSupply: 0,
    benefits: [
      'All PRO tier benefits included',
      'Access to FOREX and STOCKS trading',
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



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">AIONET NFT Tiers</h2>
          <p className="text-[#C0E6FF] mt-1">Mint your NFT on Sui Network to unlock exclusive features. PRO and ROYAL are unlimited NFT-based roles.</p>
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
              <div className="enhanced-card-content flex flex-col h-full">
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

                <div className="flex-1 flex flex-col">
                {/* Features */}
                <div className="space-y-2 flex-1">
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
                <div className="pt-4 mt-auto">
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
                  <td className="py-3 text-white">Crypto Copy Trading</td>
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
                  <td className="py-3 text-white">Discord Community Role</td>
                  <td className="py-3 text-center text-white">Basic</td>
                  <td className="py-3 text-center text-blue-400">PRO</td>
                  <td className="py-3 text-center text-yellow-400">ROYAL</td>
                </tr>
                <tr className="border-b border-[#C0E6FF]/10">
                  <td className="py-3 text-white">MetaGo Academy Access</td>
                  <td className="py-3 text-center text-white">Basic</td>
                  <td className="py-3 text-center text-blue-400">Premium</td>
                  <td className="py-3 text-center text-yellow-400">Premium</td>
                </tr>
                <tr className="border-b border-[#C0E6FF]/10">
                  <td className="py-3 text-white">DApps Access (RaffleCraft & DEWhale)</td>
                  <td className="py-3 text-center text-red-400">✗</td>
                  <td className="py-3 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  <td className="py-3 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-[#C0E6FF]/10">
                  <td className="py-3 text-white">Premium Creator Channels</td>
                  <td className="py-3 text-center text-red-400">✗</td>
                  <td className="py-3 text-center text-blue-400">3 Free</td>
                  <td className="py-3 text-center text-yellow-400">9 Free</td>
                </tr>
                <tr className="border-b border-[#C0E6FF]/10">
                  <td className="py-3 text-white">FOREX & STOCKS Trading</td>
                  <td className="py-3 text-center text-red-400">✗</td>
                  <td className="py-3 text-center text-red-400">✗</td>
                  <td className="py-3 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-[#C0E6FF]/10">
                  <td className="py-3 text-white">Royalty Distribution</td>
                  <td className="py-3 text-center text-red-400">✗</td>
                  <td className="py-3 text-center text-red-400">✗</td>
                  <td className="py-3 text-center text-yellow-400">10%</td>
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
