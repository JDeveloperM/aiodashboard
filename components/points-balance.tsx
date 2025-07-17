"use client"

import { useTokens } from "@/contexts/points-context"
import { Coins, TrendingUp } from "lucide-react"

export function TokenBalance() {
  const { balance, transactions, isLoading } = useTokens()

  const totalEarned = transactions
    .filter(t => t.type === "earned")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalSpent = transactions
    .filter(t => t.type === "spent")
    .reduce((sum, t) => sum + t.amount, 0)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#1a2f51] rounded-xl">
                  <Coins className="w-6 h-6 text-[#4DA2FF] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-semibold">pAION Balance</h3>
                  <p className="text-[#C0E6FF] text-sm">Loading...</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-20 h-8 bg-[#1a2f51] rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#1a2f51] rounded-xl">
                <Coins className="w-6 h-6 text-[#4DA2FF]" />
              </div>
              <div>
                <h3 className="text-white text-lg font-semibold">pAION Balance</h3>
                <p className="text-[#C0E6FF] text-sm">Available for redemption</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{balance.toLocaleString()}</p>
              <p className="text-[#C0E6FF] text-sm">pAION</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-[#1a2f51] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-[#C0E6FF] text-xs">Total Earned</span>
              </div>
              <p className="text-white font-semibold">{totalEarned.toLocaleString()}</p>
            </div>
            <div className="bg-[#1a2f51] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4 text-orange-400" />
                <span className="text-[#C0E6FF] text-xs">Total Spent</span>
              </div>
              <p className="text-white font-semibold">{totalSpent.toLocaleString()}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// Backward compatibility
export const PointsBalance = TokenBalance
