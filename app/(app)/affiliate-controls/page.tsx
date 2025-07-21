"use client"

import { AffiliateControls } from "@/components/affiliate-controls"
import { ContactSponsorButton } from "@/components/contact-sponsor-button"
import { SubscriptionGuard } from "@/components/subscription-guard"
import { AffiliateSubscriptionPayment } from "@/components/affiliate-subscription-payment"
import { AffiliateSubscriptionManagement } from "@/components/affiliate-subscription-management"


import { Button } from "@/components/ui/button"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { useRouter } from "next/navigation"
import { Zap } from "lucide-react"

export default function AffiliateControlsPage() {
  const account = useCurrentAccount()
  const { user } = useSuiAuth()
  const router = useRouter()
  // Get user address from either traditional wallet or zkLogin
  const userAddress = user?.address || account?.address



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


        </div>

        <AffiliateControls />

        {/* Subscription Management */}
        {userAddress && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Subscription Management</h2>
              <p className="text-gray-400 mt-1">View your payment history and manage your affiliate subscription</p>
            </div>
            <AffiliateSubscriptionManagement userAddress={userAddress} />
          </div>
        )}
      </div>
    </SubscriptionGuard>
  )
}
