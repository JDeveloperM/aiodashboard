"use client"

import { Notifications } from "./notifications"
import { useSubscription } from "@/contexts/subscription-context"
import { usePersistentProfile } from '@/hooks/use-persistent-profile'
import { usePremiumAccess } from "@/contexts/premium-access-context"
import { RoleImage } from "@/components/ui/role-image"
import { SuiWalletWithSocial } from "@/components/sui-wallet-with-social"
import { SessionStatus } from "@/components/session-status"
import { SessionRestorationBadge } from "@/components/session-restoration-indicator"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import React from "react"
import { SignedIn, SignedOut, useSuiAuth } from "@/contexts/sui-auth-context"
import { Coins, User, LogOut, CreditCard, Wallet, Copy } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAvatar } from "@/contexts/avatar-context"
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit'
import { toast } from 'sonner'
import { useState } from 'react'
import { useChannelSubscriptions } from '@/hooks/use-channel-subscriptions'
import { useCreatorsDatabase } from '@/contexts/creators-database-context'

export function TopNav() {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)
  const { tier } = useSubscription()
  const { isSignedIn, user, signOut, formatAddress } = useSuiAuth()
  const { profile } = usePersistentProfile()
  const { getRemainingFreeAccess, premiumAccessLimit, premiumAccessCount } = usePremiumAccess()
  const { getAvatarUrl, getFallbackText } = useAvatar()
  const account = useCurrentAccount()
  const { channels: joinedChannels } = useChannelSubscriptions()
  const { getUserCreators } = useCreatorsDatabase()

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
  const suiPriceUSD = 2.1 // You can replace this with a real-time price API later
  const suiBalanceUSD = suiBalance * suiPriceUSD

  // Get the correct username from profile or user context
  const displayUsername = profile?.username || user?.username || "Anonymous User"

  // Get user's created channels
  const userCreators = user?.address ? getUserCreators(user.address) : []
  const createdChannels = userCreators.reduce((acc, creator) => [...acc, ...creator.channels], [] as any[])

  // State for copy functionality
  const [copiedAddress, setCopiedAddress] = useState(false)

  // Copy address to clipboard
  const copyAddress = async () => {
    if (user?.address) {
      try {
        await navigator.clipboard.writeText(user.address)
        setCopiedAddress(true)
        toast.success('Address copied to clipboard!')
        setTimeout(() => setCopiedAddress(false), 2000)
      } catch (error) {
        toast.error('Failed to copy address')
      }
    }
  }

  const getTierColor = () => {
    switch (tier) {
      case "PRO":
        return "bg-blue-500 hover:bg-blue-600"
      case "ROYAL":
        return "bg-amber-500 hover:bg-amber-600"  // Changed from purple to amber (golden)
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <header className="sticky top-0 z-40 header-gradient">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="hidden md:block">
          <nav className="flex items-center space-x-2">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            {pathSegments.map((segment, index) => (
              <React.Fragment key={segment}>
                <span className="text-muted-foreground">/</span>
                <Link href={`/${pathSegments.slice(0, index + 1).join("/")}`} className="text-sm font-medium">
                  {segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ")}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        </div>
        <div className="md:hidden">
          <span className="text-sm font-medium">
            {pathSegments.length > 0
              ? pathSegments[pathSegments.length - 1].charAt(0).toUpperCase() +
                pathSegments[pathSegments.length - 1].slice(1).replace("-", " ")
              : "Home"}
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Notifications />

          {/* Session restoration indicator */}
          <SessionRestorationBadge />

          {/* Sui Wallet Connect with Social Login */}
          <SuiWalletWithSocial />

          {/* User Menu for authenticated users */}
          <SignedIn>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl()} alt={user?.username} />
                    <AvatarFallback className="bg-[#4DA2FF] text-white">
                      {getFallbackText()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-80 bg-[#030F1C] border-l border-[#1e3a8a] p-0"
              >
                <div className="flex flex-col h-full">
                  {/* Header Section */}
                  <SheetHeader className="p-6 pb-4 border-b border-[#1e3a8a]">
                    <div className="flex flex-col space-y-4">
                      {/* Avatar and Basic Info */}
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={getAvatarUrl()} alt={user?.username} />
                          <AvatarFallback className="bg-[#4DA2FF] text-white text-lg">
                            {getFallbackText()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <SheetTitle className="text-white text-lg font-semibold">
                            {displayUsername}
                          </SheetTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-[#C0E6FF]">
                              {user?.address && formatAddress(user.address)}
                            </p>
                            {user?.address && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyAddress}
                                className="h-6 w-6 p-0 hover:bg-[#1e3a8a] transition-colors"
                              >
                                <Copy className={`h-3 w-3 ${copiedAddress ? 'text-green-400' : 'text-[#C0E6FF]'}`} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status and Points */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RoleImage role={tier} size="sm" />
                          <span className="text-sm text-[#C0E6FF]">{tier}</span>
                        </div>
                        <Badge className="bg-[#4da2ff] text-white">
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4" />
                            <span className="font-medium">{(profile?.points || 0).toLocaleString()}</span>
                          </div>
                        </Badge>
                      </div>

                      {/* Channels Joined Status */}
                      <div className="bg-[#1a2f51]/50 rounded-lg p-3">
                        <div className="text-sm text-[#C0E6FF]">
                          Channels Joined: {joinedChannels.length}
                        </div>
                      </div>

                      {/* Channels Created Status */}
                      {createdChannels.length > 0 && (
                        <div className="bg-[#1a2f51]/50 rounded-lg p-3">
                          <div className="text-sm text-[#C0E6FF]">
                            Channels Created: {createdChannels.length}
                          </div>
                        </div>
                      )}
                    </div>
                  </SheetHeader>

                  {/* Navigation Menu */}
                  <div className="flex-1 p-6">
                    <nav className="space-y-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 p-3 rounded-lg text-[#C0E6FF] hover:bg-[#1e3a8a] hover:text-white transition-colors"
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">Profile</span>
                      </Link>

                      <Link
                        href="/subscriptions"
                        className="flex items-center gap-3 p-3 rounded-lg text-[#C0E6FF] hover:bg-[#1e3a8a] hover:text-white transition-colors"
                      >
                        <CreditCard className="h-5 w-5" />
                        <span className="font-medium">Subscriptions</span>
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center gap-3 p-3 rounded-lg text-[#C0E6FF] hover:bg-[#1e3a8a] hover:text-white transition-colors"
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">Settings</span>
                      </Link>

                      <Separator className="my-4 bg-[#1e3a8a]" />

                      {/* SUI Balance Section */}
                      <div className="bg-[#1a2f51]/50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-[#4DA2FF]/20 rounded-lg">
                            <Wallet className="w-5 h-5 text-[#4DA2FF]" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Wallet Balance</h4>
                            <p className="text-[#C0E6FF] text-sm">Available SUI</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[#C0E6FF] text-sm">SUI Balance:</span>
                            <div className="flex items-center gap-2">
                              <img
                                src="/images/logo-sui.png"
                                alt="SUI"
                                className="w-4 h-4"
                              />
                              <span className="text-white font-medium">{suiBalance.toFixed(4)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#C0E6FF] text-sm">USD Value:</span>
                            <span className="text-green-400 font-medium">${suiBalanceUSD.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </nav>
                  </div>

                  {/* Spacer to push sign out to bottom */}
                  <div className="flex-1" />

                  {/* Footer with Sign Out */}
                  <div className="p-6 pt-4 border-t border-[#1e3a8a] mt-auto">
                    <Button
                      onClick={() => signOut()}
                      variant="outline"
                      className="w-full justify-start gap-3 p-3 text-red-400 border-red-500/50 hover:bg-red-500/10 hover:text-red-300 hover:border-red-400 transition-colors shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Sign out</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
