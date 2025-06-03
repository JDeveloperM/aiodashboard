"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

export type SubscriptionTier = "NOMAD" | "PRO" | "ROYAL"

interface SubscriptionContextType {
  tier: SubscriptionTier
  setTier: (tier: SubscriptionTier) => void
  canAccessCryptoBots: boolean
  canAccessForexBots: boolean
  upgradeToPremium: () => void
  upgradeToVIP: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>("NOMAD")

  // Determine access based on MetadudesX tier system
  // According to guidelines: PRO and ROYAL have no cycle payments, ROYAL has VIP features
  const canAccessCryptoBots = tier === "PRO" || tier === "ROYAL"
  const canAccessForexBots = tier === "ROYAL"  // VIP-only (ROYAL tier)

  // Upgrade functions
  const upgradeToPremium = () => {
    setTier("PRO")
  }

  const upgradeToVIP = () => {
    setTier("ROYAL")
  }

  // Load tier from localStorage on client side
  useEffect(() => {
    const savedTier = localStorage.getItem("subscriptionTier") as SubscriptionTier | null
    if (savedTier) {
      setTier(savedTier)
    }
  }, [])

  // Save tier to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("subscriptionTier", tier)
  }, [tier])

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        setTier,
        canAccessCryptoBots,
        canAccessForexBots,
        upgradeToPremium,
        upgradeToVIP,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
