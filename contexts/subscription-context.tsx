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
  // Initialize with a function to check localStorage immediately
  const [tier, setTier] = useState<SubscriptionTier>(() => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const savedTier = localStorage.getItem("subscriptionTier") as SubscriptionTier | null
      console.log(`[SubscriptionContext] Initializing with saved tier: ${savedTier}`)
      if (savedTier && ["NOMAD", "PRO", "ROYAL"].includes(savedTier)) {
        console.log(`[SubscriptionContext] Using saved tier: ${savedTier}`)
        return savedTier
      }
    }
    console.log(`[SubscriptionContext] No saved tier found, defaulting to NOMAD`)
    return "NOMAD"
  })

  const [isLoaded, setIsLoaded] = useState(false)

  // Determine access based on AIONET tier system
  // According to guidelines: PRO and ROYAL have no cycle payments, ROYAL has VIP features
  const canAccessCryptoBots = tier === "PRO" || tier === "ROYAL"
  const canAccessForexBots = tier === "ROYAL"  // VIP-only (ROYAL tier)

  // Upgrade functions with persistence
  const upgradeToPremium = () => {
    setTier("PRO")
    if (typeof window !== 'undefined') {
      localStorage.setItem("subscriptionTier", "PRO")
    }
  }

  const upgradeToVIP = () => {
    setTier("ROYAL")
    if (typeof window !== 'undefined') {
      localStorage.setItem("subscriptionTier", "ROYAL")
    }
  }

  // Enhanced setTier function with automatic persistence
  const setTierWithPersistence = (newTier: SubscriptionTier) => {
    console.log(`[SubscriptionContext] Setting tier from ${tier} to ${newTier}`)
    setTier(newTier)
    if (typeof window !== 'undefined') {
      localStorage.setItem("subscriptionTier", newTier)
      console.log(`[SubscriptionContext] Saved tier ${newTier} to localStorage`)
    }
  }

  // Load tier from localStorage on client side (backup check)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTier = localStorage.getItem("subscriptionTier") as SubscriptionTier | null
      console.log(`[SubscriptionContext] useEffect backup check - saved: ${savedTier}, current: ${tier}`)
      if (savedTier && ["NOMAD", "PRO", "ROYAL"].includes(savedTier) && savedTier !== tier) {
        console.log(`[SubscriptionContext] Restoring tier from localStorage: ${savedTier}`)
        setTier(savedTier)
      }
      setIsLoaded(true)
    }
  }, [])

  // Save tier to localStorage when it changes (backup persistence)
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem("subscriptionTier", tier)
    }
  }, [tier, isLoaded])

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        setTier: setTierWithPersistence,
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
