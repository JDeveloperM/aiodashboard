"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Copy,
  Send,
  ArrowDownToLine,
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  Users,
  Plus
} from 'lucide-react'
import { useZkLogin } from './zklogin-provider'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { useSuiClientQuery } from '@mysten/dapp-kit'
import { useAvatar } from '@/contexts/avatar-context'
import { usePersistentProfile } from '@/hooks/use-persistent-profile'
import { useChannelCounts } from '@/hooks/use-channel-counts'
import { useSubscription } from '@/contexts/subscription-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DepositModal } from './deposit-modal'
import { SendModal } from './send-modal'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface JWTPayload {
  email?: string
  name?: string
  picture?: string
  sub: string
  iss: string
  aud: string
}

export function ZkLoginWalletDisplay() {
  const router = useRouter()
  const { zkLoginUserAddress, jwt, reset: resetZkLogin } = useZkLogin()
  const { user, signOut, formatAddress } = useSuiAuth()
  const { profile } = usePersistentProfile()
  const { getAvatarUrl, getFallbackText } = useAvatar()
  const { tier } = useSubscription()
  const { joinedChannels, maxJoinedChannels, createdChannels, maxCreatedChannels, isLoading: channelCountsLoading } = useChannelCounts()
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [jwtPayload, setJwtPayload] = useState<JWTPayload | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)

  // USDC contract addresses for different networks
  const USDC_COIN_TYPES = {
    devnet: '0x2::sui::SUI', // For devnet, we'll use SUI as USDC equivalent for testing
    testnet: '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC',
    mainnet: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN'
  }

  const currentNetwork = (process.env.NEXT_PUBLIC_SUI_NETWORK as keyof typeof USDC_COIN_TYPES) || 'devnet'
  const USDC_COIN_TYPE = USDC_COIN_TYPES[currentNetwork]

  // Query for SUI balance
  const { data: suiBalance } = useSuiClientQuery(
    'getBalance',
    {
      owner: zkLoginUserAddress || '',
      coinType: '0x2::sui::SUI',
    },
    {
      enabled: !!zkLoginUserAddress,
    }
  )

  // Query for USDC balance
  const { data: usdcBalance } = useSuiClientQuery(
    'getBalance',
    {
      owner: zkLoginUserAddress || '',
      coinType: USDC_COIN_TYPE,
    },
    {
      enabled: !!zkLoginUserAddress,
    }
  )

  const suiAmount = suiBalance ? parseInt(suiBalance.totalBalance) / 1000000000 : 0
  const usdcAmount = usdcBalance ? parseInt(usdcBalance.totalBalance) / 1000000 : 0 // USDC has 6 decimals

  // Extract email and other info from JWT
  useEffect(() => {
    if (jwt) {
      try {
        const payload = jwt.split('.')[1]
        const decodedPayload: JWTPayload = JSON.parse(atob(payload))
        setJwtPayload(decodedPayload)
        console.log('Extracted JWT payload:', decodedPayload)
      } catch (error) {
        console.error('Failed to decode JWT:', error)
      }
    }
  }, [jwt])

  const copyAddress = async () => {
    if (zkLoginUserAddress) {
      try {
        await navigator.clipboard.writeText(zkLoginUserAddress)
        setCopiedAddress(true)
        toast.success('Address copied to clipboard!')
        setTimeout(() => setCopiedAddress(false), 2000)
      } catch (error) {
        toast.error('Failed to copy address')
      }
    }
  }

  const handleSignOut = async () => {
    // Reset zkLogin first
    resetZkLogin()
    // Then sign out from the app
    await signOut()
    setIsOpen(false)
    toast.success('Signed out successfully')
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  if (!zkLoginUserAddress || !jwtPayload) {
    return null
  }

  return (
    <>
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white hover:bg-[#C0E6FF]/10 px-3 py-2 h-auto"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {profile?.username || user?.username || 'Anonymous User'}
            </span>
            {/* User Avatar on the right */}
            <Avatar className="h-6 w-6">
              <AvatarImage src={getAvatarUrl()} alt={profile?.username || user?.username} />
              <AvatarFallback className="bg-[#4DA2FF] text-white text-xs">
                {getFallbackText()}
              </AvatarFallback>
            </Avatar>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-80 bg-[#0c1b36] border-[#1e3a8a] text-white p-0" 
        align="end"
        sideOffset={8}
      >
        <div className="p-4 space-y-4">
          {/* Header with avatar, address and email */}
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <Avatar className="h-8 w-8">
              <AvatarImage src={getAvatarUrl()} alt={user?.username} />
              <AvatarFallback className="bg-[#4DA2FF] text-white text-sm">
                {getFallbackText()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-white">
                  {formatAddress(zkLoginUserAddress)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0 hover:bg-[#1e3a8a] transition-colors"
                >
                  <Copy className={`h-3 w-3 ${copiedAddress ? 'text-green-400' : 'text-[#C0E6FF]'}`} />
                </Button>
              </div>
              <p className="text-sm text-[#C0E6FF]">{jwtPayload.email}</p>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-[#1a2f51]/50 rounded-lg p-3">
            <div className="text-sm text-[#C0E6FF] mb-2">Balance</div>
            <div className="space-y-2">
              {/* SUI Balance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="/images/logo-sui.png"
                    alt="SUI"
                    className="w-5 h-5"
                  />
                  <span className="text-white font-medium">{suiAmount.toFixed(4)}</span>
                </div>
                <span className="text-[#C0E6FF] text-sm">SUI</span>
              </div>
              {/* USDC Balance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">$</span>
                  </div>
                  <span className="text-white font-medium">{usdcAmount.toFixed(2)}</span>
                </div>
                <span className="text-[#C0E6FF] text-sm">USDC</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowSendModal(true)}
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowDepositModal(true)}
            >
              <ArrowDownToLine className="w-4 h-4 mr-2" />
              Deposit
            </Button>
          </div>

          <Separator className="bg-[#1e3a8a]" />

          {/* Channel Counters */}
          <TooltipProvider>
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-[#1a2f51]/50 rounded-lg hover:bg-[#1a2f51]/70 transition-colors cursor-help">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#4DA2FF]" />
                      <span className="text-[#C0E6FF] text-sm">Free Premium Channels</span>
                    </div>
                    <span className="text-white font-medium">
                      {channelCountsLoading ? '...' : `${joinedChannels}/${maxJoinedChannels}`}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Premium channels you've joined (limit: {maxJoinedChannels} for {tier} tier)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-[#1a2f51]/50 rounded-lg hover:bg-[#1a2f51]/70 transition-colors cursor-help">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#4DA2FF]" />
                      <span className="text-[#C0E6FF] text-sm">My Channels Created</span>
                    </div>
                    <span className={`font-medium ${createdChannels >= maxCreatedChannels ? 'text-yellow-400' : 'text-white'}`}>
                      {channelCountsLoading ? '...' : `${createdChannels}/${maxCreatedChannels}`}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Channels you've created (limit based on your {tier} tier)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <Separator className="bg-[#1e3a8a]" />

          {/* Menu Items */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 p-3 text-[#C0E6FF] hover:bg-[#1e3a8a] hover:text-white transition-colors"
              onClick={() => handleNavigation('/profile')}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 p-3 text-[#C0E6FF] hover:bg-[#1e3a8a] hover:text-white transition-colors"
              onClick={() => handleNavigation('/settings')}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 p-3 text-[#C0E6FF] hover:bg-[#1e3a8a] hover:text-white transition-colors"
              onClick={() => handleNavigation('/subscriptions')}
            >
              <CreditCard className="h-4 w-4" />
              <span>Subscriptions</span>
            </Button>

            <Separator className="bg-[#1e3a8a] my-2" />

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 p-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>

    {/* Deposit Modal */}
    <DepositModal
      isOpen={showDepositModal}
      onClose={() => setShowDepositModal(false)}
      walletAddress={zkLoginUserAddress}
      suiBalance={suiAmount}
      usdcBalance={usdcAmount}
    />

    {/* Send Modal */}
    <SendModal
      isOpen={showSendModal}
      onClose={() => setShowSendModal(false)}
      walletAddress={zkLoginUserAddress}
      suiBalance={suiAmount}
      usdcBalance={usdcAmount}
      isZkLogin={true}
    />
  </>
  )
}
