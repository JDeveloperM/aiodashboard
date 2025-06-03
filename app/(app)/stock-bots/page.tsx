"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/contexts/subscription-context"
import { Users, TrendingUp, ArrowRight, AlertTriangle, Info, DollarSign, Activity, BarChart, LineChart } from "lucide-react"
import { PerformanceChart } from "@/components/performance-chart"

export default function StockBotsPage() {
  const { tier, canAccessForexBots } = useSubscription()
  const canAccessStockBots = canAccessForexBots  // Stock bots are VIP-only (ROYAL tier)

  // Sample bots data
  const bots = [
    {
      id: "hermes",
      name: "5000 Hermes",
      amount: "5,000 USDT",
      minInvestment: "Min. Investment",
      followers: 35,
      performance: "+22.15%",
      days: "30 days",
      strategy: "BYB-T",
      winRate: "94% Win Rate",
      mdd: "6.8% MDD",
      tradesWon: "245 Trades Won",
      tradesLost: "5 Trades Lost",
      profit: "$187,320.45 AUM",
      description: "Balanced stock trading strategy with focus on blue-chip stocks",
      badge: "VIP"
    },
    {
      id: "poseidon",
      name: "2000 Poseidon",
      amount: "2,000 USDT",
      minInvestment: "Min. Investment",
      followers: 42,
      performance: "+16.89%",
      days: "30 days",
      strategy: "BYB-T",
      winRate: "97% Win Rate",
      mdd: "7.2% MDD",
      tradesWon: "265 Trades Won",
      tradesLost: "3 Trades Lost",
      profit: "$142,780.65 AUM",
      description: "Poseidon is a sophisticated stock trading bot that uses a data-driven approach to identify high-probability trading opportunities in the stock market. By analyzing market trends, volume patterns, and key indicators, it aims to generate consistent returns while managing risk exposure.",
      badge: "VIP"
    },
    {
      id: "ares",
      name: "5000 Ares",
      amount: "5,000 USDT",
      minInvestment: "Min. Investment",
      followers: 28,
      performance: "+8.75%",
      days: "30 days",
      strategy: "BYB-T",
      winRate: "96% Win Rate",
      mdd: "5.4% MDD",
      tradesWon: "210 Trades Won",
      tradesLost: "4 Trades Lost",
      profit: "$78,450.30 AUM",
      description: "Conservative stock trading strategy with focus on dividend stocks and ETFs",
      badge: "VIP"
    },
  ]

  if (!canAccessStockBots) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center max-w-2xl mx-auto">
          <AlertTriangle className="h-12 w-12 text-[#FFD700] mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4 text-white">ROYAL NFT Required</h1>
          <p className="text-[#C0E6FF] mb-6">
            Stock trading bots are available exclusively for ROYAL NFT holders. Mint your ROYAL NFT to access these advanced
            automated trading strategies for the stock market and unlock VIP features.
          </p>
          <Button className="bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold">
            Mint ROYAL NFT - €600
          </Button>
        </div>
      </div>
    )
  }

  // Analytics data for stock bots
  const stockAnalytics = {
    totalProfit: "$408,551.40",
    activeBots: "2/3",
    winRate: "95.7%",
    totalTrades: "720",
    profitTrend: 12.5,
    winRateTrend: 1.8,
    tradesToday: 18,
    avgTradeProfit: "$38.75",
    bestPerformer: "Hermes",
    worstPerformer: "Ares"
  }

  // Performance data for stock bots
  const stockPerformanceData = [
    { date: "Jan", value: 1000 },
    { date: "Feb", value: 1120 },
    { date: "Mar", value: 1280 },
    { date: "Apr", value: 1450 },
    { date: "May", value: 1600 },
    { date: "Jun", value: 1750 },
    { date: "Jul", value: 1920 },
    { date: "Aug", value: 2150 },
    { date: "Sep", value: 2400 },
    { date: "Oct", value: 2700 },
    { date: "Nov", value: 3050 },
    { date: "Dec", value: 3450 },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Stock Trading Bots</h1>
          <p className="text-[#C0E6FF] mt-1">Advanced strategies for stock market trading</p>
        </div>
        <Button variant="outline" className="hidden md:flex items-center gap-2 border-[#C0E6FF] text-[#C0E6FF] hover:bg-[#C0E6FF]/10">
          <BarChart className="h-4 w-4" />
          Learn More
        </Button>
      </div>

      {/* Stock Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <DollarSign className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold">Total Profit</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{stockAnalytics.totalProfit}</p>
              <div className="flex items-center">
                <span className="text-green-400 text-xs flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{stockAnalytics.profitTrend}%
                </span>
                <span className="text-[#C0E6FF] text-xs ml-2">vs. last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold">Active Bots</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{stockAnalytics.activeBots}</p>
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
              <p className="text-2xl font-bold text-white">{stockAnalytics.winRate}</p>
              <div className="flex items-center">
                <span className="text-green-400 text-xs flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{stockAnalytics.winRateTrend}%
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
              <p className="text-2xl font-bold text-white">{stockAnalytics.totalTrades}</p>
              <div className="flex items-center">
                <span className="text-[#C0E6FF] text-xs">{stockAnalytics.tradesToday} trades today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-white">Stock Bots Performance</h2>
        <PerformanceChart
          data={stockPerformanceData}
          title=""
          valuePrefix="$"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <div key={bot.id} className="enhanced-card overflow-hidden">
            <div className="enhanced-card-content">
              <div className="bg-gradient-to-r from-green-600 to-green-900 p-3 text-white font-medium flex justify-between items-center mb-4 rounded-lg shadow-lg shadow-green-500/20">
                <span>{bot.name}</span>
                <Badge className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">{bot.badge}</Badge>
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
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium">{bot.strategy}</span>
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

                <Button className="w-full bg-gradient-to-r from-green-600 to-green-900 text-white font-semibold hover:opacity-90 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all duration-300">
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
