"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  LogOut,
  ChevronDown,
  Users,
  Plus,
  RefreshCw,
  ArrowUpDown
} from 'lucide-react'
import { useZkLogin } from './zklogin-provider'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { useSuiClientQuery } from '@mysten/dapp-kit'
import { useAvatar } from '@/contexts/avatar-context'
import { nftMintingService } from '@/lib/nft-minting-service'
import { useProfile } from '@/contexts/profile-context'
import { useChannelCounts } from '@/hooks/use-channel-counts'
import { useSubscription } from '@/contexts/subscription-context'
import { useTokens } from '@/contexts/points-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PaionIcon } from './paion-icon'
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
  const { profile } = useProfile()
  const { getAvatarUrl, getFallbackText } = useAvatar()
  const { tier } = useSubscription()
  const { balance: paionBalance, isLoading: paionLoading } = useTokens()
  const { joinedChannels, maxJoinedChannels, createdChannels, maxCreatedChannels, isLoading: channelCountsLoading } = useChannelCounts()
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [jwtPayload, setJwtPayload] = useState<JWTPayload | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [userNFTs, setUserNFTs] = useState<any[]>([])
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false)
  const [nftImages, setNftImages] = useState<{[key: string]: string}>({})

  // USDC contract addresses for different networks
  const USDC_COIN_TYPES = {
    devnet: '0x2::sui::SUI', // For devnet, we'll use SUI as USDC equivalent for testing
    testnet: '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC',
    mainnet: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN'
  }

  // WAL (Walrus) token contract addresses for different networks
  const WAL_COIN_TYPES = {
    devnet: '0x2::sui::SUI', // For devnet, we'll use SUI as WAL equivalent for testing
    testnet: '0x2::sui::SUI', // Replace with actual WAL token contract when available
    mainnet: '0x2::sui::SUI' // Replace with actual WAL token contract when available
  }

  const currentNetwork = (process.env.NEXT_PUBLIC_SUI_NETWORK as keyof typeof USDC_COIN_TYPES) || 'devnet'
  const USDC_COIN_TYPE = USDC_COIN_TYPES[currentNetwork]
  const WAL_COIN_TYPE = WAL_COIN_TYPES[currentNetwork]

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

  // Query for WAL balance
  const { data: walBalance } = useSuiClientQuery(
    'getBalance',
    {
      owner: zkLoginUserAddress || '',
      coinType: WAL_COIN_TYPE,
    },
    {
      enabled: !!zkLoginUserAddress,
    }
  )

  const suiAmount = suiBalance ? parseInt(suiBalance.totalBalance) / 1000000000 : 0
  const usdcAmount = usdcBalance ? parseInt(usdcBalance.totalBalance) / 1000000 : 0 // USDC has 6 decimals
  const walAmount = walBalance ? parseInt(walBalance.totalBalance) / 1000000000 : 0 // WAL has 9 decimals like SUI

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
    if (!zkLoginUserAddress) return

    setIsLoadingNFTs(true)
    try {
      console.log('🔍 Fetching NFTs for address:', zkLoginUserAddress)

      // Debug: Check all owned objects first
      const { SuiClient } = await import('@mysten/sui/client')
      const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL || 'https://fullnode.testnet.sui.io' })

      const allObjects = await suiClient.getOwnedObjects({
        owner: zkLoginUserAddress,
        options: {
          showContent: true,
          showType: true,
          showOwner: true
        }
      })

      console.log('🔍 All owned objects:', allObjects.data)
      console.log('🔍 Total objects owned:', allObjects.data.length)

      // Now try to get NFTs specifically
      const nfts = await nftMintingService.getUserNFTs(zkLoginUserAddress)
      setUserNFTs(nfts)
      console.log('🎨 Fetched NFTs:', nfts)
      console.log('🎨 NFT count:', nfts.length)

      // Debug: Check recent transactions
      try {
        const transactions = await suiClient.queryTransactionBlocks({
          filter: {
            FromAddress: zkLoginUserAddress
          },
          limit: 10,
          options: {
            showEffects: true,
            showEvents: true,
            showInput: true
          }
        })

        console.log('📋 Recent transactions:', transactions.data)

        // Look for NFT minting transactions
        const mintTransactions = transactions.data.filter(tx =>
          tx.transaction?.data?.transaction?.kind === 'ProgrammableTransaction' &&
          JSON.stringify(tx).includes('mint_nft')
        )

        console.log('🎯 Mint transactions found:', mintTransactions)

        // Check for any created objects in recent transactions
        transactions.data.forEach((tx, index) => {
          if (tx.effects?.created && tx.effects.created.length > 0) {
            console.log(`📦 Transaction ${index} created objects:`, tx.effects.created)
          }
        })

      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      }

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
  }, [zkLoginUserAddress])

  // Refresh NFTs when popover opens
  useEffect(() => {
    if (isOpen && zkLoginUserAddress) {
      fetchNFTs()
    }
  }, [isOpen, zkLoginUserAddress])

  // Debug function for manual testing
  useEffect(() => {
    if (typeof window !== 'undefined' && zkLoginUserAddress) {
      // @ts-ignore - Adding to window for debugging
      window.debugNFTs = async () => {
        console.log('🔧 Manual NFT Debug for:', zkLoginUserAddress)
        await fetchNFTs()
      }

      // @ts-ignore - Adding to window for debugging
      window.checkNFTContract = async () => {
        const { SuiClient } = await import('@mysten/sui/client')
        const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL || 'https://fullnode.testnet.sui.io' })

        const contractConfig = nftMintingService.getContractConfig()
        console.log('📋 Contract Config:', contractConfig)

        try {
          const packageInfo = await suiClient.getObject({
            id: contractConfig.PACKAGE_ID,
            options: { showContent: true, showType: true }
          })
          console.log('📦 Package Info:', packageInfo)
        } catch (error) {
          console.error('❌ Failed to get package info:', error)
        }
      }

      console.log('🔧 Debug functions available:')
      console.log('  - window.debugNFTs() - Check NFTs for current user')
      console.log('  - window.checkNFTContract() - Check contract deployment')
    }
  }, [zkLoginUserAddress])

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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white hover:bg-[#C0E6FF]/10 px-3 py-2 h-auto"
        >
          <div className="flex items-center">
            {/* User Avatar */}
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
        <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-8rem)] pr-2">
          {/* Header with avatar, address and email */}
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
            <div className="text-sm text-[#C0E6FF] mb-2 font-medium">Balance</div>
            <div className="space-y-2">
              {/* SUI Balance */}
              <div className="flex items-center justify-between p-2 bg-[#0c1b36]/30 border border-[#C0E6FF]/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <img
                    src="/images/logo-sui.png"
                    alt="SUI"
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-white font-medium">{suiAmount.toFixed(4)}</span>
                </div>
                <span className="text-[#C0E6FF] text-sm font-medium">SUI</span>
              </div>
              {/* WAL Balance */}
              <div className="flex items-center justify-between p-2 bg-[#0c1b36]/30 border border-[#C0E6FF]/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <img
                    src="/images/wal-logo.png"
                    alt="WAL"
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-white font-medium">{walAmount.toFixed(4)}</span>
                </div>
                <span className="text-[#C0E6FF] text-sm font-medium">WAL</span>
              </div>
              {/* USDC Balance */}
              <div className="flex items-center justify-between p-2 bg-[#0c1b36]/30 border border-[#C0E6FF]/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">$</span>
                  </div>
                  <span className="text-white font-medium">{usdcAmount.toFixed(2)}</span>
                </div>
                <span className="text-[#C0E6FF] text-sm font-medium">USDC</span>
              </div>
              {/* pAION Balance */}
              <div className="flex items-center justify-between p-2 bg-[#0c1b36]/30 border border-[#C0E6FF]/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <PaionIcon size={24} />
                  <span className="text-white font-medium">
                    {paionLoading ? '...' : paionBalance.toLocaleString()}
                  </span>
                </div>
                <span className="text-[#C0E6FF] text-sm font-medium">pAION</span>
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
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {/* TODO: Implement swap functionality */}}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Swap
            </Button>
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
      walBalance={walAmount}
      paionBalance={paionBalance}
      isZkLogin={true}
    />
  </>
  )
}
