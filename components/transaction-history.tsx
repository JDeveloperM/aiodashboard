"use client"

import { usePoints } from "@/contexts/points-context"
import { Coins, TrendingUp, History } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function TransactionHistory() {
  const { transactions } = usePoints()

  // Show only the last 5 transactions
  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="enhanced-card">
      <div className="enhanced-card-content">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#1a2f51] rounded-lg">
            <History className="w-5 h-5 text-[#4DA2FF]" />
          </div>
          <h3 className="text-white text-lg font-semibold">Recent Transactions</h3>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-[#1a2f51] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === "earned"
                      ? "bg-green-500/20"
                      : "bg-orange-500/20"
                  }`}>
                    {transaction.type === "earned" ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <Coins className="w-4 h-4 text-orange-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {transaction.description}
                    </p>
                    <p className="text-[#C0E6FF] text-xs">
                      {transaction.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === "earned"
                      ? "text-green-400"
                      : "text-orange-400"
                  }`}>
                    {transaction.type === "earned" ? "+" : "-"}
                    {transaction.amount.toLocaleString()}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      transaction.type === "earned"
                        ? "border-green-400 text-green-400"
                        : "border-orange-400 text-orange-400"
                    }`}
                  >
                    {transaction.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-[#C0E6FF] mx-auto mb-4 opacity-50" />
            <h4 className="text-white text-lg font-semibold mb-2">No Transactions Yet</h4>
            <p className="text-[#C0E6FF]">
              Your transaction history will appear here once you start earning or redeeming points.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
