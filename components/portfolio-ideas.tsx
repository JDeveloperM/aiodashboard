"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, BarChart3, ArrowLeft } from "lucide-react"

interface CryptoAsset {
  symbol: string
  name: string
  description: string
  currentPrice: string
  buyTarget: string
  sellTarget: string
  riskLevel: 'medium' | 'high'
  marketCap: string
  change24h: number
}

const portfolioAssets: Record<'medium' | 'high', CryptoAsset[]> = {
  medium: [
    {
      symbol: "SUI",
      name: "Sui Network",
      description: "A next-generation smart contract platform designed for speed and scalability. Sui uses a novel consensus mechanism and parallel execution to achieve high throughput.",
      currentPrice: "$2.45",
      buyTarget: "$2.20 - $2.40",
      sellTarget: "$3.50 - $4.00",
      riskLevel: "medium",
      marketCap: "$6.8B",
      change24h: 5.2
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      description: "The world's programmable blockchain and home to thousands of decentralized applications. Ethereum continues to lead in DeFi and NFT ecosystems.",
      currentPrice: "$3,245",
      buyTarget: "$3,000 - $3,200",
      sellTarget: "$4,200 - $4,800",
      riskLevel: "medium",
      marketCap: "$390B",
      change24h: 2.1
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      description: "The original cryptocurrency and digital store of value. Bitcoin remains the most recognized and widely adopted cryptocurrency globally.",
      currentPrice: "$67,890",
      buyTarget: "$65,000 - $67,000",
      sellTarget: "$75,000 - $80,000",
      riskLevel: "medium",
      marketCap: "$1.34T",
      change24h: 1.8
    }
  ],
  high: [
    {
      symbol: "PEPE",
      name: "Pepe Coin",
      description: "A meme cryptocurrency that has gained significant traction in the crypto community. High volatility with potential for substantial gains or losses.",
      currentPrice: "$0.000012",
      buyTarget: "$0.000010 - $0.000011",
      sellTarget: "$0.000018 - $0.000025",
      riskLevel: "high",
      marketCap: "$5.1B",
      change24h: 12.5
    },
    {
      symbol: "SHIB",
      name: "Shiba Inu",
      description: "An Ethereum-based altcoin that features the Shiba Inu dog as its mascot. Part of the meme coin ecosystem with high volatility.",
      currentPrice: "$0.000024",
      buyTarget: "$0.000020 - $0.000023",
      sellTarget: "$0.000035 - $0.000045",
      riskLevel: "high",
      marketCap: "$14.2B",
      change24h: -3.7
    },
    {
      symbol: "DOGE",
      name: "Dogecoin",
      description: "The original meme cryptocurrency that started as a joke but has become a serious digital asset with strong community support.",
      currentPrice: "$0.38",
      buyTarget: "$0.32 - $0.36",
      sellTarget: "$0.55 - $0.70",
      riskLevel: "high",
      marketCap: "$55.8B",
      change24h: 8.9
    }
  ]
}

export function PortfolioIdeas() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<'medium' | 'high' | null>(null)
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoAsset | null>(null)

  const handlePortfolioSelect = (portfolio: 'medium' | 'high') => {
    setSelectedPortfolio(portfolio)
    setSelectedCrypto(null)
  }

  const handleCryptoSelect = (crypto: CryptoAsset) => {
    setSelectedCrypto(crypto)
  }

  const handleBack = () => {
    if (selectedCrypto) {
      setSelectedCrypto(null)
    } else {
      setSelectedPortfolio(null)
    }
  }

  if (selectedCrypto) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="border-[#C0E6FF] text-[#C0E6FF]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-[#FFFFFF]">{selectedCrypto.name}</h2>
            <p className="text-[#C0E6FF]">{selectedCrypto.symbol} Analysis</p>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Crypto Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="enhanced-card">
              <div className="enhanced-card-content">
                <div className="flex items-center gap-3 text-white mb-4">
                  <div className="p-2 bg-[#4DA2FF]/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-[#4DA2FF]" />
                  </div>
                  <h3 className="font-semibold">Market Overview</h3>
                </div>
                <div className="space-y-4">
                <p className="text-[#C0E6FF] text-sm leading-relaxed">
                  {selectedCrypto.description}
                </p>

                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <span className="text-[#C0E6FF] text-sm">Current Price</span>
                    <div className="text-xl font-bold text-[#FFFFFF]">{selectedCrypto.currentPrice}</div>
                  </div>
                  <div>
                    <span className="text-[#C0E6FF] text-sm">24h Change</span>
                    <div className={`text-xl font-bold flex items-center gap-1 ${
                      selectedCrypto.change24h >= 0 ? 'text-[#4DA2FF]' : 'text-red-400'
                    }`}>
                      {selectedCrypto.change24h >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {selectedCrypto.change24h >= 0 ? '+' : ''}{selectedCrypto.change24h}%
                    </div>
                  </div>
                  <div>
                    <span className="text-[#C0E6FF] text-sm">Market Cap</span>
                    <div className="text-xl font-bold text-[#FFFFFF]">{selectedCrypto.marketCap}</div>
                  </div>
                  <div>
                    <span className="text-[#C0E6FF] text-sm">Risk Level</span>
                    <Badge
                      className={selectedCrypto.riskLevel === 'medium'
                        ? 'bg-orange-500 text-white'
                        : 'bg-red-500 text-white'
                      }
                    >
                      {selectedCrypto.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="enhanced-card">
              <div className="enhanced-card-content">
                <div className="flex items-center gap-2 text-white mb-4">
                  <h3 className="font-semibold">Price Chart & Analysis</h3>
                </div>
                <div className="h-64 bg-[#030F1C] rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-[#4DA2FF] mx-auto mb-2" />
                    <p className="text-[#C0E6FF]">Interactive chart coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Targets */}
          <div className="space-y-6">
            <div className="enhanced-card">
              <div className="enhanced-card-content">
                <div className="flex items-center gap-2 text-white mb-4">
                  <Target className="w-5 h-5 text-[#4DA2FF]" />
                  <h3 className="font-semibold">Buy Targets</h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-[#4DA2FF]/10 rounded-lg border border-[#4DA2FF]/30">
                    <div className="text-sm text-[#C0E6FF]">Recommended Buy Zone</div>
                    <div className="text-lg font-bold text-[#4DA2FF]">{selectedCrypto.buyTarget}</div>
                  </div>
                  <p className="text-xs text-[#C0E6FF]">
                    Consider dollar-cost averaging within this range for optimal entry.
                  </p>
                </div>
              </div>
            </div>

            <div className="enhanced-card">
              <div className="enhanced-card-content">
                <div className="flex items-center gap-2 text-white mb-4">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold">Sell Targets</h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="text-sm text-[#C0E6FF]">Profit Taking Zone</div>
                    <div className="text-lg font-bold text-green-400">{selectedCrypto.sellTarget}</div>
                  </div>
                  <p className="text-xs text-[#C0E6FF]">
                    Consider taking profits gradually within this range.
                  </p>
                </div>
              </div>
            </div>

            <div className="enhanced-card border-orange-500/30">
              <div className="enhanced-card-content">
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium text-orange-400">⚠️ Risk Warning</div>
                  <p className="text-xs text-[#C0E6FF]">
                    This is not financial advice. Always do your own research and never invest more than you can afford to lose.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedPortfolio) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="border-[#C0E6FF] text-[#C0E6FF]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-[#FFFFFF]">
              {selectedPortfolio === 'medium' ? 'Medium Risk' : 'High Risk'} Portfolio
            </h2>
            <p className="text-[#C0E6FF]">Select a cryptocurrency for detailed analysis</p>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {portfolioAssets[selectedPortfolio].map((crypto) => (
            <div
              key={crypto.symbol}
              className="enhanced-card cursor-pointer hover:border-[#4DA2FF]/50 transition-colors"
              onClick={() => handleCryptoSelect(crypto)}
            >
              <div className="enhanced-card-content">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#4DA2FF]/20 rounded-full flex items-center justify-center">
                      <span className="text-[#4DA2FF] font-bold text-sm">{crypto.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{crypto.symbol}</div>
                      <div className="text-xs text-[#C0E6FF]">{crypto.name}</div>
                    </div>
                  </div>
                  <Badge
                    className={crypto.riskLevel === 'medium'
                      ? 'bg-orange-500 text-white'
                      : 'bg-red-500 text-white'
                    }
                  >
                    {crypto.riskLevel.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#C0E6FF] text-sm">Price</span>
                    <span className="text-white font-semibold">{crypto.currentPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#C0E6FF] text-sm">24h</span>
                    <span className={`font-semibold ${
                      crypto.change24h >= 0 ? 'text-[#4DA2FF]' : 'text-red-400'
                    }`}>
                      {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Medium Risk Portfolio */}
        <div
          className="enhanced-card cursor-pointer hover:border-[#4DA2FF]/50 transition-colors"
          onClick={() => handlePortfolioSelect('medium')}
        >
          <div className="enhanced-card-content">
            <div className="flex items-center gap-3 text-white mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="font-semibold">Medium Risk Portfolio</h3>
            </div>
            <div className="space-y-4">
              <p className="text-[#C0E6FF] text-sm">
                Balanced portfolio with established cryptocurrencies. Lower volatility with steady growth potential.
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#C0E6FF]">Risk Level</span>
                  <Badge className="bg-orange-500 text-white">MEDIUM</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#C0E6FF]">Assets</span>
                  <span className="text-white">3 cryptocurrencies</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#C0E6FF]">Time Horizon</span>
                  <span className="text-white">6-12 months</span>
                </div>
              </div>

              <Button className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white">
                View Portfolio Details
              </Button>
            </div>
          </div>
        </div>

        {/* High Risk Portfolio */}
        <div
          className="enhanced-card cursor-pointer hover:border-[#4DA2FF]/50 transition-colors"
          onClick={() => handlePortfolioSelect('high')}
        >
          <div className="enhanced-card-content">
            <div className="flex items-center gap-3 text-white mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-semibold">High Risk Portfolio</h3>
            </div>
            <div className="space-y-4">
              <p className="text-[#C0E6FF] text-sm">
                Aggressive portfolio with high-growth potential assets. Higher volatility with significant upside potential.
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#C0E6FF]">Risk Level</span>
                  <Badge className="bg-red-500 text-white">HIGH</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#C0E6FF]">Assets</span>
                  <span className="text-white">3 cryptocurrencies</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#C0E6FF]">Time Horizon</span>
                  <span className="text-white">3-6 months</span>
                </div>
              </div>

              <Button className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white">
                View Portfolio Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
