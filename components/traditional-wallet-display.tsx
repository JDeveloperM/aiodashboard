"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Copy,
  Send,
  ArrowDownToLine,
  User,
  Settings,
  CreditCard,
  LogOut,
  Wallet,
  Users,
  Plus,
  RefreshCw
} from 'lucide-react'
import { useCurrentAccount, useDisconnectWallet, useSuiClientQuery } from '@mysten/dapp-kit'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { useAvatar } from '@/contexts/avatar-context'
import { useProfile } from '@/contexts/profile-context'
import { useChannelCounts } from '@/hooks/use-channel-counts'
import { useSubscription } from '@/contexts/subscription-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { nftMintingService } from '@/lib/nft-minting-service'
import { DepositModal } from './deposit-modal'
import { SendModal } from './send-modal'

export function TraditionalWalletDisplay() {
  const router = useRouter()
  const account = useCurrentAccount()
  const { mutate: disconnectWallet } = useDisconnectWallet()
  const { user, signOut, formatAddress } = useSuiAuth()
  const { profile } = useProfile()
  const { getAvatarUrl, getFallbackText } = useAvatar()
  const { tier } = useSubscription()
  const { joinedChannels, maxJoinedChannels, createdChannels, maxCreatedChannels, isLoading: channelCountsLoading } = useChannelCounts()
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [userNFTs, setUserNFTs] = useState<any[]>([])
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false)
  const [nftImages, setNftImages] = useState<{[key: string]: string}>({})

  // USDC contract address on Sui testnet
  const USDC_COIN_TYPE = '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC'

  // Query for SUI balance
  const { data: suiBalance } = useSuiClientQuery(
    'getBalance',
    {
      owner: account?.address || '',
      coinType: '0x2::sui::SUI',
    },
    {
      enabled: !!account?.address,
    }
  )

  // Query for USDC balance
  const { data: usdcBalance } = useSuiClientQuery(
    'getBalance',
    {
      owner: account?.address || '',
      coinType: USDC_COIN_TYPE,
    },
    {
      enabled: !!account?.address,
    }
  )

  const suiAmount = suiBalance ? parseInt(suiBalance.totalBalance) / 1000000000 : 0
  const usdcAmount = usdcBalance ? parseInt(usdcBalance.totalBalance) / 1000000 : 0 // USDC has 6 decimals

  const copyAddress = async () => {
    if (account?.address) {
      try {
        await navigator.clipboard.writeText(account.address)
        setCopiedAddress(true)
        toast.success('Address copied to clipboard!')
        setTimeout(() => setCopiedAddress(false), 2000)
      } catch (error) {
        toast.error('Failed to copy address')
      }
    }
  }

  const handleSignOut = async () => {
    // Disconnect wallet first
    disconnectWallet()
    // Then sign out from the app
    await signOut()
    setIsOpen(false)
    toast.success('Signed out successfully')
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  // Helper function to decode NFT type
  const decodeNFTType = (nftData: any): string => {
    console.log('🔧 decodeNFTType called with:', nftData)

    const decodeBytes = (bytes: any): string => {
      console.log('🔧 decodeBytes called with:', bytes, 'type:', typeof bytes)
      if (Array.isArray(bytes)) {
        try {
          const decoded = new TextDecoder().decode(new Uint8Array(bytes))
          console.log('🔧 Decoded array to string:', decoded)
          return decoded
        } catch (error) {
          console.log('🔧 Failed to decode array:', error)
          return 'Unknown'
        }
      }
      const result = bytes?.toString() || 'Unknown'
      console.log('🔧 Converted to string:', result)
      return result
    }

    let nftType = 'Unknown'

    console.log('🔧 Checking collection_type:', nftData?.collection_type)
    if (nftData?.collection_type) {
      nftType = decodeBytes(nftData.collection_type)
      console.log('🔧 Got type from collection_type:', nftType)
    } else if (nftData?.tier) {
      nftType = decodeBytes(nftData.tier)
      console.log('🔧 Got type from tier:', nftType)
    } else if (nftData?.type) {
      nftType = decodeBytes(nftData.type)
      console.log('🔧 Got type from type:', nftType)
    } else if (nftData?.name) {
      nftType = decodeBytes(nftData.name)
      console.log('🔧 Got type from name:', nftType)
    }

    const cleanType = nftType.trim().toUpperCase()
    const finalType = ['PRO', 'ROYAL'].includes(cleanType) ? cleanType : 'Unknown'

    console.log('🔧 Final type detection:', {
      original: nftType,
      cleaned: cleanType,
      final: finalType
    })

    return finalType
  }

  // Function to fetch user's NFTs
  const fetchNFTs = async () => {
    if (!account?.address) return

    setIsLoadingNFTs(true)
    try {
      const nfts = await nftMintingService.getUserNFTs(account.address)
      setUserNFTs(nfts)
      console.log('Fetched user NFTs:', nfts)

      // Set up static NFT images based on type
      const imageMap: {[key: string]: string} = {}

      nfts.forEach((nft, index) => {
        const nftData = nft.data?.content?.fields
        const nftId = nft.data?.objectId
        let nftType = decodeNFTType(nftData)

        // Fallback if type detection fails
        if (nftType === 'Unknown') {
          nftType = index === 0 ? 'PRO' : 'ROYAL'
        }

        // Simple assignment: PRO = pro-nft.png, ROYAL = royal-nft.png
        if (nftType === 'PRO') {
          imageMap[nftId] = '/images/nfts/pro-nft.png'
        } else if (nftType === 'ROYAL') {
          imageMap[nftId] = '/images/nfts/royal-nft.png'
        }

        console.log(`🖼️ NFT ${nftId} is ${nftType} -> ${imageMap[nftId]}`)
      })

      console.log('🗺️ Static image map:', imageMap)
      setNftImages(imageMap)

      // Test if images are accessible
      Object.entries(imageMap).forEach(([nftId, imagePath]) => {
        const img = new Image()
        img.onload = () => console.log(`✅ Image accessible: ${imagePath}`)
        img.onerror = () => console.error(`❌ Image not accessible: ${imagePath}`)
        img.src = imagePath
      })

    } catch (error) {
      console.error('Failed to fetch NFTs:', error)
      setUserNFTs([])
    } finally {
      setIsLoadingNFTs(false)
    }
  }

  // Fetch NFTs on address change
  useEffect(() => {
    fetchNFTs()
  }, [account?.address])

  // Refresh NFTs when popover opens
  useEffect(() => {
    if (isOpen && account?.address) {
      fetchNFTs()
    }
  }, [isOpen, account?.address])

  if (!account?.address) {
    return null
  }

  return (
    <>
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white hover:bg-[#C0E6FF]/10 px-3 py-2 h-auto"
        >
          <div className="flex items-center gap-3">
            {/* Wallet Icon */}
            <Wallet className="w-5 h-5 text-green-400" />
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
      </SheetTrigger>

      <SheetContent className="w-96 bg-[#0c1b36] border-[#1e3a8a] text-white" side="right">
        <SheetHeader>
          <SheetTitle className="text-[#C0E6FF]">Wallet Details</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {/* Header with avatar and address */}
          <div className="flex items-center gap-2">
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
                  {formatAddress(account.address)}
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
              <p className="text-sm text-[#C0E6FF]">Crypto Wallet</p>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-[#1a2f51]/50 rounded-lg p-3">
            <div className="text-sm text-[#C0E6FF] mb-2">Balance</div>
            <div className="space-y-1">
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

          {/* NFTs Section */}
          <div className="bg-[#1a2f51]/50 rounded-lg p-3">
            <div className="text-sm text-[#C0E6FF] mb-2">AIONET NFTs</div>

            {userNFTs.length > 0 ? (() => {
              // Filter NFTs first to determine final count
              const filteredNFTs = userNFTs
                .map((nft, index) => {
                  const nftData = nft.data?.content?.fields
                  const nftId = nft.data?.objectId
                  let nftType = decodeNFTType(nftData)

                  if (nftType === 'Unknown') {
                    nftType = index === 0 ? 'PRO' : 'ROYAL'
                  }

                  return { nft, nftData, nftId, nftType, index }
                })
                .filter(({ nftType }) => {
                  // Simple logic: if user has ROYAL, hide PRO
                  const hasRoyal = userNFTs.some((nft, index) => {
                    const nftData = nft.data?.content?.fields
                    let type = decodeNFTType(nftData)
                    if (type === 'Unknown') {
                      type = index === 0 ? 'PRO' : 'ROYAL'
                    }
                    return type === 'ROYAL'
                  })

                  if (hasRoyal && nftType === 'PRO') {
                    console.log('🚫 Hiding PRO NFT because user has ROYAL')
                    return false
                  }

                  return true
                })

              // Use flex with justify-center for single NFT, grid for multiple
              const containerClass = filteredNFTs.length === 1
                ? "flex justify-center"
                : "grid grid-cols-2 gap-3"

              return (
                <div className={containerClass}>
                  {filteredNFTs.map(({ nft, nftData, nftId, nftType, index }) => {

                  return (
                    <div
                      key={nftId || index}
                      className="flex flex-col items-center gap-2"
                    >
                      {/* NFT Image */}
                      {nftImages[nftId] ? (
                        <img
                          src={nftImages[nftId]}
                          alt={`${nftType} NFT`}
                          className="w-40 h-40 rounded-lg object-cover border-2 border-[#4DA2FF]"
                          onLoad={() => {
                            console.log(`✅ Successfully loaded image: ${nftImages[nftId]}`)
                          }}
                          onError={(e) => {
                            console.error(`❌ Failed to load image: ${nftImages[nftId]} for ${nftType} NFT`)
                          }}
                        />
                      ) : (
                        <div className={`w-40 h-40 rounded-lg flex items-center justify-center ${
                          nftType === 'PRO' ? 'bg-blue-500' :
                          nftType === 'ROYAL' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`}>
                          <span className="text-2xl font-bold text-white">
                            {nftType === 'PRO' ? 'P' : nftType === 'ROYAL' ? 'R' : 'N'}
                          </span>
                        </div>
                      )}

                      {/* Explorer Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs bg-[#1a2f51] border-[#4DA2FF] text-[#4DA2FF] hover:bg-[#4DA2FF] hover:text-white"
                        onClick={() => {
                          const explorerUrl = `https://suiscan.xyz/testnet/object/${nftId}`
                          window.open(explorerUrl, '_blank')
                        }}
                      >
                        View
                      </Button>
                    </div>
                  )
                })}
                </div>
              )
            })() : (
              <div className="text-center py-3">
                <div className="text-[#C0E6FF] text-sm">No NFTs owned</div>
                <div className="text-[#C0E6FF]/60 text-xs mt-1">
                  Mint NFTs to unlock exclusive features
                </div>
              </div>
            )}
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

          {/* Create Channel Button */}
          <Button
            variant="outline"
            className="w-full border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
            onClick={() => handleNavigation('/creator-controls')}
          >
            <span className="mr-2">+</span>
            Create Channel
          </Button>

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
          <div className="space-y-0.5">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 p-2 text-[#C0E6FF] hover:bg-[#1e3a8a] hover:text-white transition-colors"
              onClick={() => handleNavigation('/profile')}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-2 p-2 text-[#C0E6FF] hover:bg-[#1e3a8a] hover:text-white transition-colors"
              onClick={() => handleNavigation('/settings')}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-2 p-2 text-[#C0E6FF] hover:bg-[#1e3a8a] hover:text-white transition-colors"
              onClick={() => handleNavigation('/subscriptions')}
            >
              <CreditCard className="h-4 w-4" />
              <span>Subscriptions</span>
            </Button>

            <Separator className="bg-[#1e3a8a] my-1" />

            <Button
              variant="ghost"
              className="w-full justify-start gap-2 p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    {/* Deposit Modal */}
    <DepositModal
      isOpen={showDepositModal}
      onClose={() => setShowDepositModal(false)}
      walletAddress={account?.address || null}
      suiBalance={suiAmount}
      usdcBalance={usdcAmount}
    />

    {/* Send Modal */}
    <SendModal
      isOpen={showSendModal}
      onClose={() => setShowSendModal(false)}
      walletAddress={account?.address || null}
      suiBalance={suiAmount}
      usdcBalance={usdcAmount}
      isZkLogin={false}
    />
  </>
  )
}
