"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RoleImage } from "@/components/ui/role-image"
import { Mail, MessageCircle, X } from "lucide-react"

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
}

export function ContactSponsorModal({ isOpen, onClose, sponsor, loading }: ContactSponsorModalProps) {
  const handleEmailContact = () => {
    if (sponsor?.email) {
      window.open(`mailto:${sponsor.email}?subject=Need Help - AIONET Platform`, '_blank')
    }
  }

  const handleMessageContact = () => {
    // Placeholder for messaging functionality
    console.log('Message sponsor:', sponsor?.username)
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
            <Button
              onClick={onClose}
              variant="outline"
              className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
