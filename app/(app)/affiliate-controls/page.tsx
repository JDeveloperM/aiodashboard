"use client"

import { AffiliateControls } from "@/components/affiliate-controls"
import { ContactSponsorButton } from "@/components/contact-sponsor-button"
import { SubscriptionGuard } from "@/components/subscription-guard"
import { AffiliateSubscriptionPayment } from "@/components/affiliate-subscription-payment"
import { AIChatWidget } from "@/components/ai-chat-widget"
import { useAffiliateData } from "@/hooks/use-affiliate-data"
import { Button } from "@/components/ui/button"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { useRouter } from "next/navigation"
import { Zap, Ticket } from "lucide-react"

export default function AffiliateControlsPage() {
  const account = useCurrentAccount()
  const { user } = useSuiAuth()
  const router = useRouter()
  const { getAIAnalysisData, loading: affiliateDataLoading } = useAffiliateData()

  // Get user address from either traditional wallet or zkLogin
  const userAddress = user?.address || account?.address

  // Get AI analysis data
  const aiData = getAIAnalysisData()

  const handleRaffleCraftRedirect = () => {
    // Navigate to the RaffleCraft dapp page
    router.push('/dapps/rafflecraft')
  }

  return (
    <SubscriptionGuard feature="affiliate controls dashboard">
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Affiliate Controls</h1>
            <p className="text-gray-400 mt-1">Manage your affiliates, view metrics, and track your affiliate performance</p>
          </div>
          <ContactSponsorButton />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Renew Subscription Button */}
          {userAddress ? (
            <AffiliateSubscriptionPayment
              userAddress={userAddress}
              onPaymentSuccess={() => window.location.reload()}
              trigger={
                <Button className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Renew Subscription
                  <span className="text-xs opacity-80">($15/month)</span>
                </Button>
              }
            />
          ) : (
            <Button
              disabled
              className="bg-gray-600 text-gray-300 flex items-center gap-2 cursor-not-allowed"
            >
              <Zap className="w-4 h-4" />
              Renew Subscription
              <span className="text-xs opacity-80">(Connect wallet)</span>
            </Button>
          )}

          {/* RaffleCraft Button */}
          <Button
            onClick={handleRaffleCraftRedirect}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            Get RaffleCraft Ticket
            <span className="text-xs opacity-80">(+7 days bonus)</span>
          </Button>
        </div>

        <AffiliateControls />

        {/* Floating AI Chat Widget */}
        <AIChatWidget
          context="affiliate"
          data={aiData || undefined}
        />
      </div>
    </SubscriptionGuard>
  )
}
