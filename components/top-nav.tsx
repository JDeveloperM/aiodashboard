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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl()} alt={user?.username} />
                    <AvatarFallback className="bg-[#4DA2FF] text-white">
                      {getFallbackText()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#030F1C] border-[#1e3a8a]" align="end" forceMount>
                <DropdownMenuLabel className="font-normal text-white">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium leading-none">{user?.username}</p>
                    <p className="text-xs leading-none text-[#C0E6FF]">
                      {user?.address && formatAddress(user.address)}
                    </p>
                    {/* Status Icon and Points */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <RoleImage role={tier} size="sm" />
                        <span className="text-xs text-[#C0E6FF]">{tier}</span>
                      </div>
                      <Badge className="bg-[#4da2ff] text-white text-xs">
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          <span className="font-medium">{(profile?.points || 0).toLocaleString()}</span>
                        </div>
                      </Badge>
                    </div>
                    {/* Premium Access Status */}
                    {(tier === 'PRO' || tier === 'ROYAL') && (
                      <div className="pt-1">
                        <div className="text-xs text-[#C0E6FF]">
                          Premium Channels: {premiumAccessCount}/{premiumAccessLimit} used
                        </div>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#1e3a8a]" />
                <DropdownMenuItem asChild className="text-[#C0E6FF] hover:bg-[#1e3a8a] hover:text-white">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-[#C0E6FF] hover:bg-[#1e3a8a] hover:text-white">
                  <Link href="/subscriptions">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Subscriptions</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-[#C0E6FF] hover:bg-[#1e3a8a] hover:text-white">
                  <Link href="/settings">
                    <User className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#1e3a8a]" />
                <DropdownMenuItem
                  className="text-[#C0E6FF] hover:bg-[#1e3a8a] hover:text-white cursor-pointer"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
