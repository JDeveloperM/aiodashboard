"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import {
  Coins,
  TrendingUp,
  Users,
  Clock,
  Zap,
  ArrowRight,
  ExternalLink,
  Wallet,
  DollarSign,
  BarChart3,
  Info,
  Star,
  Shield,
  Activity,
  Pause,
  Crown
} from "lucide-react"



export default function NodeMePoolPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // Mock data for the NodeMe Pool dashboard
  const nodeStats = {
    availableRewards: "7304.67",
    lastUpdate: "02/10/05",
    allNodes: 8,
    activeNodes: 7,
    inactiveNodes: 1,
    nftsOwned: 6
  }

  const aethirData = {
    name: "Aethir NODES",
    price: "0.0536 USDT",
    totalNodes: 6,
    nodePrice: "$1505 (tier12)",
    totalVesting: "98,007.89 ATH",
    availableRewards: "42,191.07 ATH",
    totalInUSDT: "7203.01 USDT",
    stakeAmount: "28,000 veATH (12 months)",
    stakePeriodEnds: "19/06/2025",
    stakeRewards: "3,446.95 ATH"
  }



  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">NodeMe Pool</h1>
        <p className="text-[#C0E6FF] mt-1">Decentralized node management and rewards on Sui Network</p>
      </div>

      {/* Node Stats Overview */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Coins className="w-5 h-5 text-[#4DA2FF]" />
              <h3 className="font-semibold text-sm">Available Rewards</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{nodeStats.availableRewards}</p>
              <p className="text-xs text-[#C0E6FF]">Last Update: {nodeStats.lastUpdate}</p>
              <Button size="sm" className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white">
                Show Me
              </Button>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Activity className="w-5 h-5 text-[#4DA2FF]" />
              <h3 className="font-semibold text-sm">All Nodes</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{nodeStats.allNodes}</p>
              <p className="text-xs text-[#C0E6FF]">Total Nodes</p>
              <Button size="sm" className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white">
                Show Me
              </Button>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Zap className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-sm">Active Nodes</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{nodeStats.activeNodes}</p>
              <p className="text-xs text-[#C0E6FF]">Total Active Nodes</p>
              <Button size="sm" className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white">
                Show Me
              </Button>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Pause className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-sm">Inactive Nodes</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{nodeStats.inactiveNodes}</p>
              <p className="text-xs text-[#C0E6FF]">Total Inactive Nodes</p>
              <Button size="sm" className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white">
                Show Me
              </Button>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Star className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-sm">NodeMe NFTs</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{nodeStats.nftsOwned}</p>
              <p className="text-xs text-[#C0E6FF]">Total NodeMe NFTs</p>
              <Button size="sm" className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white">
                View on OpenSea
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Aethir NODES Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-center h-full">
              <div className="w-full h-72 sm:h-[26rem] rounded-lg overflow-hidden">
                <Image
                  src="/images/aethirbanner.jpg"
                  alt="Aethir Nodes"
                  width={400}
                  height={384}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white">
                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <h2 className="text-lg sm:text-xl font-bold">{aethirData.name}</h2>
              </div>
              <div className="text-[#4da2ff] font-bold text-base sm:text-lg">
                {aethirData.price}
              </div>
            </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="space-y-2">
                <tr className="border-b border-gray-600/30">
                  <td className="py-2 text-[#C0E6FF] font-medium">Total Nodes</td>
                  <td className="py-2 text-white text-right">{aethirData.totalNodes}</td>
                </tr>
                <tr className="border-b border-gray-600/30">
                  <td className="py-2 text-[#C0E6FF] font-medium">Node Price</td>
                  <td className="py-2 text-white text-right">{aethirData.nodePrice}</td>
                </tr>
                <tr className="border-b border-gray-600/30">
                  <td className="py-2 text-[#C0E6FF] font-medium">Total (VESTING)</td>
                  <td className="py-2 text-green-400 text-right font-semibold">{aethirData.totalVesting}</td>
                </tr>
                <tr className="border-b border-gray-600/30">
                  <td className="py-2 text-[#C0E6FF] font-medium">Available Rewards</td>
                  <td className="py-2 text-green-400 text-right font-semibold">{aethirData.availableRewards}</td>
                </tr>
                <tr className="border-b border-gray-600/30">
                  <td className="py-2 text-[#C0E6FF] font-medium">Total in USDT</td>
                  <td className="py-2 text-green-400 text-right font-semibold">{aethirData.totalInUSDT}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-6 pt-4 border-t border-gray-600">
              <h3 className="text-white font-semibold mb-3 text-center">Staking Information</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-600/30">
                      <td className="py-2 text-[#C0E6FF] font-medium">Stake Amount</td>
                      <td className="py-2 text-green-400 text-right font-semibold">{aethirData.stakeAmount}</td>
                    </tr>
                    <tr className="border-b border-gray-600/30">
                      <td className="py-2 text-[#C0E6FF] font-medium">Stake Period Ends</td>
                      <td className="py-2 text-white text-right">{aethirData.stakePeriodEnds}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[#C0E6FF] font-medium">Stake Rewards</td>
                      <td className="py-2 text-green-400 text-right font-semibold">{aethirData.stakeRewards}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>




    </div>
  )
}
