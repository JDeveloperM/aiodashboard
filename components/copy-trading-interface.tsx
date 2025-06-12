"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ActiveTradingBots } from "@/components/active-trading-bots"
import { ExternalLink, TrendingUp, DollarSign, Activity, Link as LinkIcon } from "lucide-react"
import Image from "next/image"

interface TradingStats {
  totalEarnings: string
  stableCoinProfits: string
  lastMonthPercentage: number
  connectionStatus: 'connected' | 'disconnected'
  isActive: boolean
}

export function CopyTradingInterface() {
  const [tradingStats] = useState<TradingStats>({
    totalEarnings: "$12,450.32",
    stableCoinProfits: "$8,920.15",
    lastMonthPercentage: 20,
    connectionStatus: 'disconnected',
    isActive: false
  })

  const [isConnecting, setIsConnecting] = useState(false)

  const handleBybitConnection = () => {
    setIsConnecting(true)
    // Simulate API connection
    setTimeout(() => {
      setIsConnecting(false)
    }, 2000)
  }

  const performanceData = [
    { month: "Jan", profit: 1200 },
    { month: "Feb", profit: 1800 },
    { month: "Mar", profit: 2100 },
    { month: "Apr", profit: 1950 },
    { month: "May", profit: 2400 },
    { month: "Jun", profit: 2850 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#FFFFFF]">AIONET Copy Trading</h2>
          <p className="text-[#C0E6FF] mt-1">Automated Bybit trading bots for AIONET NFT holders</p>
        </div>
      </div>

      {/* Top Row - Four Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Earnings */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Total Earnings</p>
                <p className="text-2xl font-bold text-white">{tradingStats.totalEarnings}</p>
                <div className="flex items-center mt-1">
                  <DollarSign className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">From Bybit copy trading</span>
                </div>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stable Coin Profits */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Stable Coin Profits</p>
                <p className="text-2xl font-bold text-white">{tradingStats.stableCoinProfits}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-[#C0E6FF] text-sm">+{tradingStats.lastMonthPercentage}% from last month</span>
                </div>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Connection Button */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-3">
                <p className="text-sm font-medium text-white">Bybit Connection</p>
                <div className="mt-2 space-y-2">
                  <Button
                    onClick={handleBybitConnection}
                    disabled={isConnecting}
                    className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white text-xs py-1 h-8"
                  >
                    {isConnecting ? "Connecting..." : "Connect to Bybit"}
                  </Button>
                  <p className="text-xs text-[#C0E6FF]">
                    No account?{" "}
                    <a
                      href="https://www.bybit.com/register?affiliate_id=AIONET"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4DA2FF] hover:underline inline-flex items-center gap-1"
                    >
                      Sign up <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <LinkIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Connection Status</p>
                <p className="text-2xl font-bold text-white">
                  {tradingStats.connectionStatus === 'connected' ? 'Active' : 'Inactive'}
                </p>
                <div className="flex items-center mt-1">
                  <Activity className={`w-4 h-4 mr-1 ${tradingStats.connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`} />
                  <span className={`text-sm ${tradingStats.connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
                    {tradingStats.connectionStatus === 'connected'
                      ? 'Trading bot is running'
                      : 'Connect to start trading'
                    }
                  </span>
                </div>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Active Trading Bots */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">My Active Trading Bots</h3>
        <ActiveTradingBots />
      </div>

      {/* Performance Overview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Performance Overview</h3>
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Performance Details Table */}
            <div className="border border-[#4DA2FF]/30 rounded-lg overflow-hidden">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-[#4DA2FF]/20">
                    <td className="px-3 py-2 text-white text-sm border-r border-[#4DA2FF]/20">Monthly Average</td>
                    <td className="px-3 py-2 text-[#FFFFFF] font-semibold text-sm">$2,075</td>
                  </tr>
                  <tr className="border-b border-[#4DA2FF]/20">
                    <td className="px-3 py-2 text-white text-sm border-r border-[#4DA2FF]/20">Best Month</td>
                    <td className="px-3 py-2 text-[#4DA2FF] font-semibold text-sm">$2,850</td>
                  </tr>
                  <tr className="border-b border-[#4DA2FF]/20">
                    <td className="px-3 py-2 text-white text-sm border-r border-[#4DA2FF]/20">Worst Month</td>
                    <td className="px-3 py-2 text-red-400 font-semibold text-sm">$1,200</td>
                  </tr>
                  <tr className="border-b border-[#4DA2FF]/20">
                    <td className="px-3 py-2 text-white text-sm border-r border-[#4DA2FF]/20">Win Rate</td>
                    <td className="px-3 py-2 text-[#4DA2FF] font-semibold text-sm">78.5%</td>
                  </tr>
                  <tr className="border-b border-[#4DA2FF]/20">
                    <td className="px-3 py-2 text-white text-sm border-r border-[#4DA2FF]/20">Loose Rate</td>
                    <td className="px-3 py-2 text-red-400 font-semibold text-sm">21.5%</td>
                  </tr>
                  <tr className="border-b border-[#4DA2FF]/20">
                    <td className="px-3 py-2 text-white text-sm border-r border-[#4DA2FF]/20">Active Bots</td>
                    <td className="px-3 py-2 text-green-400 font-semibold text-sm">3</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-white text-sm border-r border-[#4DA2FF]/20">Total Trades</td>
                    <td className="px-3 py-2 text-[#FFFFFF] font-semibold text-sm">1,247</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Column 2: Monthly Profits Table */}
            <div className="border border-[#4DA2FF]/30 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#4DA2FF]/20">
                    <th className="px-3 py-2 text-white text-sm text-left border-r border-[#4DA2FF]/20">Month</th>
                    <th className="px-3 py-2 text-white text-sm text-left">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.map((data, index) => (
                    <tr key={data.month} className={index < performanceData.length - 1 ? "border-b border-[#4DA2FF]/20" : ""}>
                      <td className="px-3 py-2 text-white text-sm border-r border-[#4DA2FF]/20">{data.month}</td>
                      <td className="px-3 py-2 text-[#4DA2FF] font-semibold text-sm">${data.profit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
