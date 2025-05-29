"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  DollarSign,
  Activity,
  StopCircle,
  Trash2,
  AlertTriangle,
  Bitcoin,
  TrendingDown,
  RotateCcw,
  Clock
} from "lucide-react"
import Image from "next/image"

interface ActiveBot {
  id: string
  name: string
  type: "crypto" | "forex" | "stock"
  status: "active" | "paused" | "stopped"
  profit: number
  totalTrades: number
  winRate: number
  investment: string
  dailyProfit: number
  isPositive: boolean
  lastUpdate: string
  completedCycles: number
  currentCycleProgress: number
  todaysProfit: number
}

export function ActiveTradingBots() {
  const [activeBots, setActiveBots] = useState<ActiveBot[]>([
    {
      id: "1",
      name: "BTC Scalping Pro",
      type: "crypto",
      status: "active",
      profit: 12.5,
      totalTrades: 45,
      winRate: 78,
      investment: "$2,500",
      dailyProfit: 2.3,
      isPositive: true,
      lastUpdate: new Date().toLocaleTimeString(),
      completedCycles: 3,
      currentCycleProgress: 7.2,
      todaysProfit: 2.3
    },
    {
      id: "2",
      name: "ETH Swing Trader",
      type: "crypto",
      status: "active",
      profit: 8.7,
      totalTrades: 23,
      winRate: 65,
      investment: "$1,800",
      dailyProfit: 1.2,
      isPositive: true,
      lastUpdate: new Date().toLocaleTimeString(),
      completedCycles: 2,
      currentCycleProgress: 4.8,
      todaysProfit: 1.2
    },
    {
      id: "3",
      name: "EUR/USD Grid Bot",
      type: "forex",
      status: "paused",
      profit: -2.1,
      totalTrades: 67,
      winRate: 45,
      investment: "$3,200",
      dailyProfit: -0.8,
      isPositive: false,
      lastUpdate: new Date().toLocaleTimeString(),
      completedCycles: 1,
      currentCycleProgress: 2.1,
      todaysProfit: -0.8
    }
  ])

  const handleStopBot = (botId: string) => {
    setActiveBots(prev =>
      prev.map(bot =>
        bot.id === botId
          ? { ...bot, status: bot.status === "active" ? "stopped" : "active" }
          : bot
      )
    )
  }

  const handleDeleteBot = (botId: string) => {
    setActiveBots(prev => prev.filter(bot => bot.id !== botId))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "crypto":
        return "from-[#4DA2FF] to-[#011829]"
      case "forex":
        return "from-yellow-400 to-yellow-600"
      case "stock":
        return "from-purple-400 to-purple-600"
      default:
        return "from-[#4DA2FF] to-[#011829]"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "crypto":
        return <Bitcoin className="w-4 h-4" />
      case "forex":
        return <DollarSign className="w-4 h-4" />
      case "stock":
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Bitcoin className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-white">Active</Badge>
      case "paused":
        return <Badge className="bg-yellow-500 text-white">Paused</Badge>
      case "stopped":
        return <Badge className="bg-red-500 text-white">Stopped</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>
    }
  }

  if (activeBots.length === 0) {
    return (
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-[#C0E6FF] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Active Bots</h3>
            <p className="text-[#C0E6FF] text-sm">
              Start following trading bots to see them here
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activeBots.map((bot) => (
        <div key={bot.id} className="enhanced-card overflow-hidden">
          <div className="enhanced-card-content">
            {/* Header */}
            <div className={`bg-gradient-to-r ${getTypeColor(bot.type)} p-3 text-white font-medium flex justify-between items-center mb-4 rounded-lg`}>
              <div className="flex items-center gap-2">
                {getTypeIcon(bot.type)}
                <span>{bot.name}</span>
              </div>
              {getStatusBadge(bot.status)}
            </div>

            {/* Bot Performance */}
            <div className="space-y-4">
              {/* Investment & Profit */}
              <div className="p-4 border-b border-[#C0E6FF]/20">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-bold text-lg text-white">{bot.investment}</p>
                    <p className="text-xs text-[#C0E6FF]">Investment Amount</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${bot.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bot.profit >= 0 ? '+' : ''}{bot.profit}%
                    </p>
                    <p className="text-xs text-[#C0E6FF]">Total Profit</p>
                  </div>
                </div>
              </div>

              {/* Cycle Information */}
              <div className="p-4 border-b border-[#C0E6FF]/20">
                {/* Completed Cycles */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <RotateCcw className="w-4 h-4 text-[#4DA2FF]" />
                    <p className="text-sm text-[#C0E6FF]">Completed Cycles</p>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-lg font-bold text-white">{bot.completedCycles}</p>
                    <p className="text-xs text-[#C0E6FF]">10% profit cycles</p>
                  </div>
                  <div className="w-full bg-[#030F1C] rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-[#4DA2FF]"
                      style={{ width: `${Math.min(100, (bot.completedCycles / 5) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Cycle Progress */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-[#4DA2FF]" />
                    <p className="text-sm text-[#C0E6FF]">Current Cycle</p>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-lg font-bold text-white">{bot.currentCycleProgress.toFixed(1)}%</p>
                    <p className="text-xs text-[#C0E6FF]">to next 10%</p>
                  </div>
                  <div className="w-full bg-[#030F1C] rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-[#4DA2FF]"
                      style={{ width: `${bot.currentCycleProgress * 10}%` }}
                    ></div>
                  </div>
                </div>

                {/* Today's Profit */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-[#4DA2FF]" />
                    <p className="text-sm text-[#C0E6FF]">Today's Profit</p>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      {bot.todaysProfit >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <p className={`text-lg font-bold ${bot.todaysProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {bot.todaysProfit >= 0 ? '+' : ''}{bot.todaysProfit.toFixed(1)}%
                      </p>
                    </div>
                    <p className="text-xs text-[#C0E6FF]">daily performance</p>
                  </div>
                  <div className="w-full bg-[#030F1C] rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${bot.todaysProfit >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(100, Math.abs(bot.todaysProfit) * 20)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-xs text-[#C0E6FF] mt-3">
                  <p>Last update: {bot.lastUpdate}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 flex gap-2">
                <Button
                  onClick={() => handleStopBot(bot.id)}
                  variant="outline"
                  size="sm"
                  className={`flex-1 ${
                    bot.status === "active"
                      ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                  }`}
                >
                  <StopCircle className="w-4 h-4 mr-1" />
                  {bot.status === "active" ? "Stop" : "Start"}
                </Button>
                <Button
                  onClick={() => handleDeleteBot(bot.id)}
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
