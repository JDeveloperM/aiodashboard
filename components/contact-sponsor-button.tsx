"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ContactSponsorModal } from "@/components/contact-sponsor-modal"
import { affiliateService, AffiliateUser } from "@/lib/affiliate-service"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { MessageCircle, HelpCircle } from "lucide-react"

export function ContactSponsorButton() {
  const account = useCurrentAccount()
  const { user, isSignedIn } = useSuiAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sponsorInfo, setSponsorInfo] = useState<AffiliateUser | null>(null)
  const [loading, setLoading] = useState(false)

  // Get the current user address from either traditional wallet or zkLogin
  const userAddress = user?.address || account?.address

  const handleOpenModal = async () => {
    if (!userAddress) {
      return
    }

    setIsModalOpen(true)
    setLoading(true)
    setSponsorInfo(null)

    try {
      console.log('🔍 Fetching sponsor info for:', userAddress)

      // Debug: Check if admin default code exists
      const adminCodeCheck = await affiliateService.checkAdminDefaultCode()
      console.log('🔍 Admin code check result:', adminCodeCheck)

      // Debug: Check user's affiliate status
      const debugInfo = await affiliateService.debugUserAffiliateStatus(userAddress)
      console.log('🔍 User debug info:', debugInfo)

      const sponsor = await affiliateService.getSponsorInfo(userAddress)
      console.log('🔍 Sponsor result:', sponsor)
      setSponsorInfo(sponsor)
    } catch (error) {
      console.error('Failed to fetch sponsor info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSponsorInfo(null)
  }

  // Don't show button if user not authenticated
  if (!isSignedIn || !userAddress) {
    return null
  }

  return (
    <>
      <Button
        onClick={handleOpenModal}
        variant="outline"
        size="sm"
        className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10 hover:text-white transition-colors"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Need Help?
      </Button>

      <ContactSponsorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        sponsor={sponsorInfo}
        loading={loading}
        userAddress={userAddress}
      />
    </>
  )
}
