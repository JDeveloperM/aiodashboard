"use client"

import { Notifications } from "./notifications"
import { useSubscription } from "@/contexts/subscription-context"
import { usePoints } from "@/contexts/points-context"
import { RoleImage } from "@/components/ui/role-image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import React from "react"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { Coins } from "lucide-react"
// Remove this line
// import { dark } from "@clerk/themes"

// Add this import instead
import { customDarkTheme } from "@/lib/clerk-theme"

export function TopNav() {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)
  const { tier } = useSubscription()
  const { isSignedIn, user } = useUser()
  const { balance } = usePoints()

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
          <RoleImage role={tier as "Copier" | "PRO" | "ROYAL"} size="md" />
          <SignedIn>
            <Badge className="bg-[#4da2ff] text-white text-xs md:text-sm">
              <div className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                <span className="font-medium">{balance.toLocaleString()}</span>
              </div>
            </Badge>
          </SignedIn>
          <Notifications />
          <SignedOut>
            <SignInButton>
              <Button variant="outline" size="sm">Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={customDarkTheme}
            >
              <UserButton.MenuItems>
                <UserButton.Action label="manageAccount" />
                <UserButton.Action label="signOut" />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
