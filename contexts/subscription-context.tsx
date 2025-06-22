"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useMemo, useRef } from "react"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { encryptedStorage } from "@/lib/encrypted-database-storage"
import { toast } from "sonner"

export type SubscriptionTier = "NOMAD" | "PRO" | "ROYAL"

interface SubscriptionContextType {
  tier: SubscriptionTier
  setTier: (tier: SubscriptionTier) => Promise<void>
  canAccessCryptoBots: boolean
  canAccessForexBots: boolean
  upgradeToPremium: () => Promise<void>
  upgradeToVIP: () => Promise<void>
  isUpdatingTier: boolean
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSuiAuth()

  // Initialize with NOMAD as default tier
  const [tier, setTierState] = useState<SubscriptionTier>("NOMAD")

  const [isLoaded, setIsLoaded] = useState(false)
  const [isUpdatingTier, setIsUpdatingTier] = useState(false)

  // Prevent infinite re-renders with stable references
  const stableUserAddress = useMemo(() => user?.address, [user?.address])
  const lastLoadedAddress = useRef<string | undefined>(undefined)

  // Determine access based on AIONET tier system
  // According to guidelines: PRO and ROYAL have no cycle payments, ROYAL has VIP features
  const canAccessCryptoBots = tier === "PRO" || tier === "ROYAL"
  const canAccessForexBots = tier === "ROYAL"  // VIP-only (ROYAL tier)

  // Enhanced setTier function with database and Walrus persistence only
  const setTier = async (newTier: SubscriptionTier) => {
    setIsUpdatingTier(true)

    try {
      // Update local state immediately for better UX
      setTierState(newTier)

      // Save to database and Walrus if user is connected
      if (user?.address) {
        await encryptedStorage.updateUserTier(user.address, newTier)
        toast.success(`🎉 Subscription upgraded to ${newTier}! Your tier is now saved permanently.`)
      } else {
        toast.error(`Please connect your wallet to upgrade your tier.`)
        // Revert the state change if user is not connected
        setTierState(tier)
        return
      }
    } catch (error) {
      console.error(`Failed to update tier in database:`, error)
      toast.error(`Failed to save tier to database. Please try again.`)
      // Revert the state change on error
      setTierState(tier)
    } finally {
      setIsUpdatingTier(false)
    }
  }

  // Upgrade functions with database persistence
  const upgradeToPremium = async () => {
    await setTier("PRO")
  }

  const upgradeToVIP = async () => {
    await setTier("ROYAL")
  }

  // Load tier from database when user connects (STABLE VERSION)
  useEffect(() => {
    // Only load if address actually changed
    if (lastLoadedAddress.current === stableUserAddress) {
      return
    }

    lastLoadedAddress.current = stableUserAddress

    const loadTierFromDatabase = async () => {
      if (stableUserAddress) {
        try {
          const profile = await encryptedStorage.getDecryptedProfile(stableUserAddress)

          if (profile?.role_tier) {
            // Use callback to avoid dependency on current tier state
            setTierState(profile.role_tier)
          } else {
            setTierState("NOMAD")
          }
        } catch (error) {
          console.error(`Failed to load tier from database:`, error)
          setTierState("NOMAD")
        }
      } else {
        // User not connected, reset to NOMAD
        setTierState("NOMAD")
      }
      setIsLoaded(true)
    }

    // Small delay to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      loadTierFromDatabase()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [stableUserAddress]) // Only depend on stable address

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    tier,
    setTier,
    canAccessCryptoBots,
    canAccessForexBots,
    upgradeToPremium,
    upgradeToVIP,
    isUpdatingTier,
  }), [tier, canAccessCryptoBots, canAccessForexBots, isUpdatingTier])

  return (
    <SubscriptionContext.Provider value={contextValue}>
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
