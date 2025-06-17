"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ContactSponsorModal } from "@/components/contact-sponsor-modal"
import { affiliateService, AffiliateUser } from "@/lib/affiliate-service"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { MessageCircle, HelpCircle } from "lucide-react"

export function ContactSponsorButton() {
  const account = useCurrentAccount()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sponsorInfo, setSponsorInfo] = useState<AffiliateUser | null>(null)
  const [loading, setLoading] = useState(false)

  const handleOpenModal = async () => {
    if (!account?.address) {
      return
    }

    setIsModalOpen(true)
    setLoading(true)
    setSponsorInfo(null)

    try {
      console.log('🔍 Fetching sponsor info for:', account.address)
      const sponsor = await affiliateService.getSponsorInfo(account.address)
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

  // Don't show button if wallet not connected
  if (!account?.address) {
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
      />
    </>
  )
}
