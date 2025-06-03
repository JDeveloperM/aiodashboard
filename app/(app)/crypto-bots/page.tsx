"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/contexts/subscription-context"
import { Users, TrendingUp, ArrowRight, AlertTriangle, Info, DollarSign, Activity, BarChart, LineChart, Bitcoin } from "lucide-react"
import { PerformanceChart } from "@/components/performance-chart"

export default function CryptoBotsPage() {
  const { tier, canAccessCryptoBots } = useSubscription()

  // Sample bots data
  const bots = [
    {
      id: "zeus",
      name: "5000 Zeus",
      amount: "5,000 USDT",
      minInvestment: "Min. Investment",
      followers: 25,
      performance: "+30.20%",
      days: "30 days",
      strategy: "BYB-T",
      winRate: "91% Win Rate",
      mdd: "7.5% MDD",
      tradesWon: "230 Trades Won",
      tradesLost: "7 Trades Lost",
      profit: "$206,665.81 AUM",
      description: "Higher risk trading strategy",
      badge: "FREE"
    },
    {
      id: "apollo",
      name: "2000 Apollo",
      amount: "2,000 USDT",
      minInvestment: "Min. Investment",
      followers: 50,
      performance: "+14.73%",
      days: "30 days",
      strategy: "BYB-T",
      winRate: "98% Win Rate",
      mdd: "8.0% MDD",
      tradesWon: "278 Trades Won",
      tradesLost: "4 Trades Lost",
      profit: "$135,090.3 AUM",
      description: "Apollo is a sophisticated crypto trading bot that uses a data-driven approach to identify high-probability trading opportunities in the cryptocurrency market. By analyzing market trends, volume patterns, and key indicators, it aims to generate consistent returns while managing risk exposure.",
      badge: "FREE"
    },
    {
      id: "athena",
      name: "5000 Athena",
      amount: "5,000 USDT",
      minInvestment: "Min. Investment",
      followers: 20,
      performance: "+5.65%",
      days: "30 days",
      strategy: "BYB-T",
      winRate: "98% Win Rate",
      mdd: "7.9% MDD",
      tradesWon: "278 Trades Won",
      tradesLost: "2 Trades Lost",
      profit: "$65,690.21 AUM",
      description: "Conservative trading strategy with focus on capital preservation",
      badge: "PREMIUM"
    },
  ]

  if (!canAccessCryptoBots) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center max-w-2xl mx-auto">
          <AlertTriangle className="h-12 w-12 text-[#4DA2FF] mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4 text-white">PRO NFT Required</h1>
          <p className="text-[#C0E6FF] mb-6">
            Crypto trading bots are available for PRO and ROYAL NFT holders. Mint your PRO NFT to access these powerful
            automated trading strategies and eliminate cycle payments.
          </p>
          <Button className="bg-gradient-to-r from-[#4DA2FF] to-[#011829] text-white">
            Mint PRO NFT - €250
          </Button>
        </div>
      </div>
    )
  }

  // Analytics data for crypto bots
  const cryptoAnalytics = {
    totalProfit: "$407,846.32",
    activeBots: "2/3",
    winRate: "95.6%",
    totalTrades: "516",
    profitTrend: 14.8,
    winRateTrend: 2.3,
    tradesToday: 12,
    avgTradeProfit: "$42.35",
    bestPerformer: "Zeus",
    worstPerformer: "Athena"
  }

  // Performance data for crypto bots
  const cryptoPerformanceData = [
    { date: "Jan", value: 1000 },
    { date: "Feb", value: 1150 },
    { date: "Mar", value: 1320 },
    { date: "Apr", value: 1280 },
    { date: "May", value: 1420 },
    { date: "Jun", value: 1650 },
    { date: "Jul", value: 1800 },
    { date: "Aug", value: 2100 },
    { date: "Sep", value: 2400 },
    { date: "Oct", value: 2750 },
    { date: "Nov", value: 3200 },
    { date: "Dec", value: 3650 },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Crypto Trading Bots</h1>
          <p className="text-[#C0E6FF] mt-1">Automated trading strategies for cryptocurrency markets</p>
        </div>
        <Button variant="outline" className="hidden md:flex items-center gap-2 border-[#C0E6FF] text-[#C0E6FF] hover:bg-[#C0E6FF]/10">
          <Bitcoin className="h-4 w-4" />
          Learn More
        </Button>
      </div>

      {/* Crypto Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <DollarSign className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold">Total Profit</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{cryptoAnalytics.totalProfit}</p>
              <div className="flex items-center">
                <span className="text-green-400 text-xs flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{cryptoAnalytics.profitTrend}%
                </span>
                <span className="text-[#C0E6FF] text-xs ml-2">vs. last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Activity className="w-5 h-5 text-[#4DA2FF]" />
              <h3 className="font-semibold">Active Bots</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{cryptoAnalytics.activeBots}</p>
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
              <p className="text-2xl font-bold text-white">{cryptoAnalytics.winRate}</p>
              <div className="flex items-center">
                <span className="text-green-400 text-xs flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{cryptoAnalytics.winRateTrend}%
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
              <p className="text-2xl font-bold text-white">{cryptoAnalytics.totalTrades}</p>
              <div className="flex items-center">
                <span className="text-[#C0E6FF] text-xs">{cryptoAnalytics.tradesToday} trades today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-white">Crypto Bots Performance</h2>
        <PerformanceChart
          data={cryptoPerformanceData}
          title=""
          valuePrefix="$"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <div key={bot.id} className="enhanced-card overflow-hidden">
            <div className="enhanced-card-content">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-900 p-3 text-white font-medium flex justify-between items-center mb-4 rounded-lg shadow-lg shadow-purple-500/20">
                <span>{bot.name}</span>
                <Badge className="bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">{bot.badge}</Badge>
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
                  <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs font-medium">{bot.strategy}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <Info className="h-4 w-4 text-[#C0E6FF]" />
                    <span className="text-sm text-white">{bot.winRate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Info className="h-4 w-4 text-[#C0E6FF]" />
                    <span className="text-sm text-white">{bot.mdd}</span>
                  </div>
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

                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-900 text-white hover:opacity-90 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300">
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
