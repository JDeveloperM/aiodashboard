"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSubscription } from "@/contexts/subscription-context"
import { useBotFollowing } from "@/contexts/bot-following-context"

interface BotCycleInfoProps {
  botId: string
  botName: string
  botType?: string
}

export function BotCycleInfo({ botId, botName, botType }: BotCycleInfoProps) {
  const { tier } = useSubscription()
  const { getBotCycleInfo, payForBotCycle } = useBotFollowing()
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  
  const cycleInfo = getBotCycleInfo(botId)
  const isNomad = tier === "NOMAD"
  
  if (!cycleInfo || !isNomad) return null
  
  const { daysLeft, cycleNumber, isPaid } = cycleInfo
  const isExpiringSoon = daysLeft <= 3
  const isExpired = daysLeft === 0
  
  const handlePayment = async () => {
    setIsPaymentLoading(true)
    try {
      await payForBotCycle(botId)
      // Here you would integrate with your payment system
      // For now, we'll just simulate the payment
    } finally {
      setIsPaymentLoading(false)
    }
  }
  
  return (
    <Card className="enhanced-card">
      <div className="enhanced-card-content p-4">
        {/* Bot Name Header */}
        <div className="mb-3">
          <h4 className="text-base font-semibold text-white mb-1">{botName}</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#4DA2FF]" />
              <span className="text-sm font-medium text-[#C0E6FF]">Cycle {cycleNumber}</span>
            </div>
            <Badge
              className={cn(
                "text-xs",
                isPaid && !isExpired
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : isExpiringSoon
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              )}
            >
              {isPaid && !isExpired ? "Active" : isExpired ? "Expired" : "Expiring Soon"}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#C0E6FF]">Days remaining:</span>
            <span className={cn(
              "text-sm font-medium",
              daysLeft > 7 ? "text-green-400" : 
              daysLeft > 3 ? "text-yellow-400" : "text-red-400"
            )}>
              {daysLeft} days
            </span>
          </div>
          
          <div className="w-full bg-[#030F1C] rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                daysLeft > 7 ? "bg-green-400" : 
                daysLeft > 3 ? "bg-yellow-400" : "bg-red-400"
              )}
              style={{ width: `${Math.max(5, (daysLeft / 30) * 100)}%` }}
            />
          </div>
          
          {(isExpiringSoon || isExpired) && (
            <div className="space-y-3">
              <div className="flex items-start space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-200">
                  {isExpired 
                    ? `Your ${botName} bot has expired. Pay to continue using it.`
                    : `Your ${botName} bot expires in ${daysLeft} days. Pay now to avoid interruption.`
                  }
                </div>
              </div>
              
              <Button
                onClick={handlePayment}
                disabled={isPaymentLoading}
                className="w-full bg-[#4DA2FF] text-white hover:bg-[#4DA2FF]/80 text-sm"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isPaymentLoading ? "Processing..." : "Pay $10 for Next Cycle"}
              </Button>
            </div>
          )}
          
          {isPaid && !isExpiringSoon && (
            <div className="flex items-center space-x-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-200">Bot is active and paid</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// Cycle explanation component
export function CycleExplanation() {
  return (
    <Card className="enhanced-card">
      <div className="enhanced-card-content p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Info className="w-5 h-5 text-[#4DA2FF]" />
          <h3 className="text-lg font-semibold text-white">How Bot Cycles Work</h3>
        </div>
        
        <div className="space-y-3 text-sm text-[#C0E6FF]">
          <div>
            <h4 className="font-medium text-white mb-1">For NOMAD Users:</h4>
            <ul className="space-y-1 ml-4">
              <li>• First cycle (30 days) is FREE when you follow a bot</li>
              <li>• After 30 days, pay $10 to continue for another 30 days</li>
              <li>• Bots stop working if payment is not made within 3 days of expiration</li>
              <li>• You can pay anytime during the last 7 days of a cycle</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-1">For PRO & ROYAL Users:</h4>
            <ul className="space-y-1 ml-4">
              <li>• Unlimited access to all bots</li>
              <li>• No cycle payments required</li>
              <li>• Premium support and features</li>
            </ul>
          </div>
          
          <div className="mt-4 p-3 bg-[#4DA2FF]/10 border border-[#4DA2FF]/20 rounded-lg">
            <p className="text-xs">
              <strong>Payment Methods:</strong> USDT, SUI, or credit card. 
              Payments are processed securely and cycles activate immediately.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
