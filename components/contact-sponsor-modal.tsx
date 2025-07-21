"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RoleImage } from "@/components/ui/role-image"
import { Mail, MessageCircle, X, Wrench } from "lucide-react"
import { affiliateService } from "@/lib/affiliate-service"
import { toast } from "sonner"

interface SponsorInfo {
  username: string
  email: string
  address: string
  status: 'NOMAD' | 'PRO' | 'ROYAL'
  profileLevel: number
  affiliateLevel: number
  kycStatus: 'verified' | 'pending' | 'not_verified'
  joinDate: string
}

interface ContactSponsorModalProps {
  isOpen: boolean
  onClose: () => void
  sponsor: SponsorInfo | null
  loading: boolean
  userAddress?: string
}

export function ContactSponsorModal({ isOpen, onClose, sponsor, loading, userAddress }: ContactSponsorModalProps) {
  const [isFixing, setIsFixing] = useState(false)
  const [fixResult, setFixResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleEmailContact = () => {
    if (sponsor?.email) {
      window.open(`mailto:${sponsor.email}?subject=Need Help - AIONET Platform`, '_blank')
    }
  }

  const handleMessageContact = () => {
    // Placeholder for messaging functionality
    console.log('Message sponsor:', sponsor?.username)
  }

  const handleFixRelationship = async () => {
    try {
      setIsFixing(true)
      setFixResult(null)

      if (!userAddress) {
        toast.error('User address not found')
        return
      }

      console.log('🔧 Fixing affiliate relationship for:', userAddress)
      const result = await affiliateService.fixMissingAffiliateRelationship(userAddress)

      setFixResult(result)
      if (result.success) {
        toast.success('✅ Affiliate relationship fixed! Please reload the page.')
      } else {
        toast.error(`❌ ${result.message}`)
      }
    } catch (error) {
      console.error('Failed to fix relationship:', error)
      setFixResult({ success: false, message: error instanceof Error ? error.message : 'Unknown error' })
      toast.error('Failed to fix relationship')
    } finally {
      setIsFixing(false)
    }
  }

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'not_verified': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getKycStatusText = (status: string) => {
    switch (status) {
      case 'verified': return '✓'
      case 'pending': return '⏳'
      case 'not_verified': return '✗'
      default: return '?'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0a1628] border border-[#C0E6FF]/20 text-white">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-xl font-semibold text-[#C0E6FF] mb-2">
            Need help?
          </DialogTitle>
          <p className="text-sm text-gray-400">
            Contact your account manager
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4DA2FF]"></div>
          </div>
        ) : sponsor ? (
          <div className="space-y-6">
            {/* Sponsor Profile */}
            <div className="flex items-center gap-4 p-4 bg-[#030f1c] rounded-lg border border-[#C0E6FF]/10">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#4DA2FF] rounded-full flex items-center justify-center">
                  <RoleImage role={sponsor.status} size="lg" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {sponsor.username}
                  </h3>
                  <Badge className={`${getKycStatusColor(sponsor.kycStatus)} bg-transparent border-0 text-xs font-semibold px-1 py-0`}>
                    {getKycStatusText(sponsor.kycStatus)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Badge className="bg-[#4DA2FF]/20 text-[#4DA2FF] border-[#4DA2FF]/30 text-xs">
                    {sponsor.status}
                  </Badge>
                  <span>Profile Lv. {sponsor.profileLevel}</span>
                </div>
              </div>
            </div>

            {/* Contact Email */}
            <div className="flex items-center gap-3 p-3 bg-[#030f1c] rounded-lg border border-[#C0E6FF]/10">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {sponsor.email}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleEmailContact}
                className="bg-green-600 hover:bg-green-700 text-white h-12"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                onClick={handleMessageContact}
                className="bg-blue-600 hover:bg-blue-700 text-white h-12"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>

            {/* Member Since */}
            <div className="text-center text-xs text-gray-500">
              Member since {new Date(sponsor.joinDate).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Sponsor Found
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              You don't have a sponsor or account manager assigned yet.
            </p>

            {/* Fix Result Display */}
            {fixResult && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                fixResult.success
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {fixResult.message}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleFixRelationship}
                disabled={isFixing}
                className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white w-full"
              >
                {isFixing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Fixing...
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 mr-2" />
                    Fix Affiliate Relationship
                  </>
                )}
              </Button>

              <Button
                onClick={onClose}
                variant="outline"
                className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10 w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
