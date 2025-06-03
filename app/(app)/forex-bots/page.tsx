"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/contexts/subscription-context"
import { Users, TrendingUp, ArrowRight, AlertTriangle, Info, DollarSign, Activity, BarChart, LineChart } from "lucide-react"
import { PerformanceChart } from "@/components/performance-chart"

export default function ForexBotsPage() {
  const { tier, canAccessForexBots } = useSubscription()

  // Sample bots data
  const bots = [
    {
      id: "hades",
      name: "5000 Hades",
      amount: "5,000 USDT",
      minInvestment: "Min. Investment",
      followers: 32,
      performance: "+18.75%",
      days: "30 days",
      strategy: "BYB-T",
      winRate: "93% Win Rate",
      mdd: "6.2% MDD",
      tradesWon: "215 Trades Won",
      tradesLost: "6 Trades Lost",
      profit: "$168,450.25 AUM",
      description: "Aggressive forex trading strategy focusing on major currency pairs",
      badge: "VIP"
    },
    {
      id: "dionysus",
      name: "2000 Dionysus",
      amount: "2,000 USDT",
      minInvestment: "Min. Investment",
      followers: 45,
      performance: "+12.35%",
      days: "30 days",
      strategy: "BYB-T",
      winRate: "96% Win Rate",
      mdd: "5.8% MDD",
      tradesWon: "240 Trades Won",
      tradesLost: "5 Trades Lost",
      profit: "$124,680.90 AUM",
      description: "Dionysus is a sophisticated forex trading bot that uses a data-driven approach to identify high-probability trading opportunities in the forex market. By analyzing market trends, volume patterns, and key indicators, it aims to generate consistent returns while managing risk exposure.",
      badge: "VIP"
    },
    {
      id: "artemis",
      name: "5000 Artemis",
      amount: "5,000 USDT",
      minInvestment: "Min. Investment",
      followers: 38,
      performance: "+9.45%",
      days: "30 days",
      strategy: "BYB-T",
      winRate: "97% Win Rate",
      mdd: "4.2% MDD",
      tradesWon: "195 Trades Won",
      tradesLost: "3 Trades Lost",
      profit: "$82,340.15 AUM",
      description: "Conservative forex trading strategy with focus on stable currency pairs",
      badge: "VIP"
    },
  ]

  if (!canAccessForexBots) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center max-w-2xl mx-auto">
          <AlertTriangle className="h-12 w-12 text-[#FFD700] mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4 text-white">ROYAL NFT Required</h1>
          <p className="text-[#C0E6FF] mb-6">
            Forex trading bots are available exclusively for ROYAL NFT holders. Mint your ROYAL NFT to access these advanced
            automated trading strategies for foreign exchange markets.
          </p>
          <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold">
            Mint ROYAL NFT - €600
          </Button>
        </div>
      </div>
    )
  }

  // Analytics data for forex bots
  const forexAnalytics = {
    totalProfit: "$375,471.30",
    activeBots: "2/3",
    winRate: "95.3%",
    totalTrades: "650",
    profitTrend: 13.5,
    winRateTrend: 2.1,
    tradesToday: 15,
    avgTradeProfit: "$40.25",
    bestPerformer: "Hades",
    worstPerformer: "Artemis"
  }

  // Performance data for forex bots
  const forexPerformanceData = [
    { date: "Jan", value: 1000 },
    { date: "Feb", value: 1080 },
    { date: "Mar", value: 1250 },
    { date: "Apr", value: 1380 },
    { date: "May", value: 1520 },
    { date: "Jun", value: 1700 },
    { date: "Jul", value: 1850 },
    { date: "Aug", value: 2050 },
    { date: "Sep", value: 2300 },
    { date: "Oct", value: 2600 },
    { date: "Nov", value: 2950 },
    { date: "Dec", value: 3350 },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Forex Trading Bots</h1>
          <p className="text-[#C0E6FF] mt-1">Advanced strategies for foreign exchange markets</p>
        </div>
        <Button variant="outline" className="hidden md:flex items-center gap-2 border-[#C0E6FF] text-[#C0E6FF] hover:bg-[#C0E6FF]/10">
          <BarChart className="h-4 w-4" />
          Learn More
        </Button>
      </div>

      {/* Forex Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <DollarSign className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold">Total Profit</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{forexAnalytics.totalProfit}</p>
              <div className="flex items-center">
                <span className="text-green-400 text-xs flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{forexAnalytics.profitTrend}%
                </span>
                <span className="text-[#C0E6FF] text-xs ml-2">vs. last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Activity className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold">Active Bots</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{forexAnalytics.activeBots}</p>
              <div className="flex items-center">
                <span className="text-[#C0E6FF] text-xs">Currently running</span>
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <BarChart className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold">Win Rate</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{forexAnalytics.winRate}</p>
              <div className="flex items-center">
                <span className="text-green-400 text-xs flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{forexAnalytics.winRateTrend}%
                </span>
                <span className="text-[#C0E6FF] text-xs ml-2">vs. last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <LineChart className="w-5 h-5 text-orange-400" />
              <h3 className="font-semibold">Total Trades</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{forexAnalytics.totalTrades}</p>
              <div className="flex items-center">
                <span className="text-[#C0E6FF] text-xs">{forexAnalytics.tradesToday} trades today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-white">Forex Bots Performance</h2>
        <PerformanceChart
          data={forexPerformanceData}
          title=""
          valuePrefix="$"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <div key={bot.id} className="enhanced-card overflow-hidden">
            <div className="enhanced-card-content">
              <div className="bg-gradient-to-r from-blue-500 to-teal-600 p-3 text-white font-medium flex justify-between items-center mb-4 rounded-lg shadow-lg shadow-blue-500/20">
                <span>{bot.name}</span>
                <Badge className="bg-teal-400/20 text-teal-200 border border-teal-400/30">{bot.badge}</Badge>
              </div>
              <div className="space-y-4">
              <div className="p-4 border-b border-[#C0E6FF]/20">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-bold text-lg text-white">{bot.amount}</p>
                    <p className="text-xs text-[#C0E6FF]">{bot.minInvestment}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-[#C0E6FF]" />
                  <span className="text-sm text-[#C0E6FF]">{bot.followers} followers</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium">{bot.performance}</span>
                  </div>
                  <span className="text-xs text-[#C0E6FF]">{bot.days}</span>
                </div>
              </div>

              <div className="p-4 border-b border-[#C0E6FF]/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium">{bot.strategy}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="text-sm text-green-400">{bot.tradesWon}</p>
                  </div>
                  <div>
                    <p className="text-sm text-red-400">{bot.tradesLost}</p>
                  </div>
                </div>

                <div className="mb-2">
                  <p className="text-sm font-medium text-white">{bot.profit}</p>
                </div>

                <div className="text-xs text-[#C0E6FF] mb-4">
                  <p>{bot.description}</p>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-500 to-teal-600 text-white font-semibold hover:opacity-90 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300">
                  Start Following Now <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
