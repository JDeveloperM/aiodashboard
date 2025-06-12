"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit'
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { Coins, Calendar, Shield, CheckCircle, AlertCircle, Wallet } from "lucide-react"
import { toast } from "sonner"

interface Creator {
  id: string
  name: string
  username: string
  avatar: string
  role: string
  subscribers: number
  category: string
  channels: Channel[]
  contentTypes: string[]
  verified: boolean
  languages: string[]
  availability: {
    hasLimit: boolean
    currentSlots?: number
    maxSlots?: number
    status: 'available' | 'limited' | 'full'
  }
  socialLinks: {
    website?: string
    twitter?: string
    telegram?: string
    discord?: string
  }
  bannerColor: string
}

interface Channel {
  id: string
  name: string
  type: 'free' | 'premium' | 'vip'
  price: number // in SUI
  description: string
  subscribers: number
  telegramUrl: string // Telegram channel URL for access
  availability?: {
    hasLimit: boolean
    currentSlots?: number
    maxSlots?: number
    status: 'available' | 'limited' | 'full'
  }
}

interface TipPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  creator: Creator | null
  channel: Channel | null
  onPaymentSuccess: (creatorId: string, channelId: string) => void
}

export function TipPaymentModal({ 
  isOpen, 
  onClose, 
  creator, 
  channel, 
  onPaymentSuccess 
}: TipPaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'processing' | 'success'>('confirm')
  const account = useCurrentAccount()
  const { isSignedIn } = useSuiAuth()

  // Query for SUI balance
  const { data: balance } = useSuiClientQuery(
    'getBalance',
    {
      owner: account?.address || '',
      coinType: '0x2::sui::SUI',
    },
    {
      enabled: !!account?.address,
    }
  )

  const suiBalance = balance ? parseInt(balance.totalBalance) / 1000000000 : 0 // Convert from MIST to SUI

  const handlePayment = async () => {
    if (!creator || !channel || !account) return

    setIsProcessing(true)
    setPaymentStep('processing')

    try {
      // Simulate SUI transaction
      await new Promise(resolve => setTimeout(resolve, 3000))

      // In a real implementation, you would:
      // 1. Create a transaction block
      // 2. Add a transfer SUI transaction
      // 3. Sign and execute the transaction
      // 4. Verify the transaction on-chain
      // 5. Grant access to the channel

      setPaymentStep('success')
      
      // Grant access for 1 month
      const accessExpiry = new Date()
      accessExpiry.setMonth(accessExpiry.getMonth() + 1)
      
      // Store access in localStorage (in production, this would be on-chain or backend)
      const accessKey = `channel_access_${creator.id}_${channel.id}`
      localStorage.setItem(accessKey, accessExpiry.toISOString())

      toast.success(`Successfully purchased 1-month access to ${channel.name}!`)
      onPaymentSuccess(creator.id, channel.id)

      // Redirect to Telegram channel after successful payment
      if (channel.telegramUrl) {
        setTimeout(() => {
          window.open(channel.telegramUrl, '_blank')
        }, 1000) // Small delay to show success message first
      }

      setTimeout(() => {
        onClose()
        setPaymentStep('confirm')
      }, 2000)

    } catch (error) {
      console.error('Payment failed:', error)
      toast.error('Payment failed. Please try again.')
      setPaymentStep('confirm')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatSUI = (amount: number) => {
    return amount.toFixed(2)
  }

  if (!creator || !channel) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#030F1C] border-[#C0E6FF]/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {paymentStep === 'success' ? 'Payment Successful!' : 'Purchase Channel Access'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {paymentStep === 'confirm' && (
            <>
              {/* Creator Info */}
              <div className="flex items-center gap-3 p-4 bg-[#1a2f51] rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={creator.avatar} alt={creator.name} />
                  <AvatarFallback className="bg-[#4DA2FF] text-white">
                    {creator.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-semibold">{creator.name}</h3>
                  <p className="text-[#C0E6FF] text-sm">@{creator.username}</p>
                  <Badge className="bg-[#4da2ff] text-white text-xs mt-1">
                    {creator.role}
                  </Badge>
                </div>
              </div>

              {/* Channel Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">{channel.name}</h4>
                  <Badge 
                    className={
                      channel.type === 'premium' 
                        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                    }
                  >
                    {channel.type.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-[#C0E6FF] text-sm">{channel.description}</p>
                <div className="flex items-center gap-4 text-sm text-[#C0E6FF]">
                  <span>{channel.subscribers} subscribers</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>1 month access</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-[#1a2f51] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#C0E6FF]">Channel Access (1 month)</span>
                  <span className="text-white font-medium">{formatSUI(channel.price)} SUI</span>
                </div>
                <div className="border-t border-[#C0E6FF]/20 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Total</span>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-[#4DA2FF]" />
                      <span className="text-white font-bold">{formatSUI(channel.price)} SUI</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Balance */}
              {isSignedIn && account && (
                <div className="flex items-center justify-between p-3 bg-[#0f2746] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#4DA2FF]" />
                    <span className="text-[#C0E6FF] text-sm">Your SUI Balance</span>
                  </div>
                  <span className="text-white font-medium">{formatSUI(suiBalance)} SUI</span>
                </div>
              )}

              {/* Payment Button */}
              <div className="space-y-3">
                {!isSignedIn || !account ? (
                  <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <AlertCircle className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <p className="text-orange-400 text-sm">Please connect your Sui wallet to continue</p>
                  </div>
                ) : suiBalance < channel.price ? (
                  <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <p className="text-red-400 text-sm">Insufficient SUI balance</p>
                  </div>
                ) : (
                  <Button 
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
                  >
                    {isProcessing ? 'Processing...' : `Pay ${formatSUI(channel.price)} SUI`}
                  </Button>
                )}
                
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-[#C0E6FF]/30 text-[#C0E6FF]"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4DA2FF] mx-auto mb-4"></div>
              <h3 className="text-white font-semibold mb-2">Processing Payment</h3>
              <p className="text-[#C0E6FF] text-sm">Please wait while we process your SUI transaction...</p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Payment Successful!</h3>
              <p className="text-[#C0E6FF] text-sm mb-4">
                You now have 1-month access to <strong>{channel.name}</strong>
              </p>
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Access granted until {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
