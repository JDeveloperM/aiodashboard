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
import { Coins, User, LogOut, CreditCard } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAvatar } from "@/contexts/avatar-context"

export function TopNav() {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)
  const { tier } = useSubscription()
  const { isSignedIn, user, signOut, formatAddress } = useSuiAuth()
  const { profile } = usePersistentProfile()
  const { getRemainingFreeAccess, premiumAccessLimit, premiumAccessCount } = usePremiumAccess()
  const { getAvatarUrl, getFallbackText } = useAvatar()

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
                            {user?.username}
                          </SheetTitle>
                          <p className="text-xs text-[#C0E6FF] mt-1">
                            {user?.address && formatAddress(user.address)}
                          </p>
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

                      {/* Premium Access Status */}
                      {(tier === 'PRO' || tier === 'ROYAL') && (
                        <div className="bg-[#1a2f51]/50 rounded-lg p-3">
                          <div className="text-sm text-[#C0E6FF]">
                            Premium Channels: {premiumAccessCount}/{premiumAccessLimit} used
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
                    </nav>
                  </div>

                  {/* Footer with Sign Out */}
                  <div className="p-6 pt-0 border-t border-[#1e3a8a]">
                    <Button
                      onClick={() => signOut()}
                      variant="ghost"
                      className="w-full justify-start gap-3 p-3 text-[#C0E6FF] hover:bg-[#1e3a8a] hover:text-white"
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
