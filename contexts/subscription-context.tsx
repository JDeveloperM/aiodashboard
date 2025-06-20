"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
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

  // Determine access based on AIONET tier system
  // According to guidelines: PRO and ROYAL have no cycle payments, ROYAL has VIP features
  const canAccessCryptoBots = tier === "PRO" || tier === "ROYAL"
  const canAccessForexBots = tier === "ROYAL"  // VIP-only (ROYAL tier)

  // Enhanced setTier function with database and Walrus persistence only
  const setTier = async (newTier: SubscriptionTier) => {
    console.log(`[SubscriptionContext] Setting tier from ${tier} to ${newTier}`)
    setIsUpdatingTier(true)

    try {
      // Update local state immediately for better UX
      setTierState(newTier)

      // Save to database and Walrus if user is connected
      if (user?.address) {
        console.log(`[SubscriptionContext] Updating tier in database for ${user.address}`)
        await encryptedStorage.updateUserTier(user.address, newTier)
        console.log(`[SubscriptionContext] ✅ Tier ${newTier} saved to database and Walrus`)
        toast.success(`🎉 Subscription upgraded to ${newTier}! Your tier is now saved permanently.`)
      } else {
        console.log(`[SubscriptionContext] ⚠️ User not connected, cannot save tier`)
        toast.error(`Please connect your wallet to upgrade your tier.`)
        // Revert the state change if user is not connected
        setTierState(tier)
        return
      }
    } catch (error) {
      console.error(`[SubscriptionContext] ❌ Failed to update tier in database:`, error)
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

  // Load tier from database when user connects
  useEffect(() => {
    const loadTierFromDatabase = async () => {
      if (user?.address) {
        try {
          console.log(`[SubscriptionContext] Loading tier from database for ${user.address}`)
          const profile = await encryptedStorage.getDecryptedProfile(user.address)

          if (profile?.role_tier) {
            const dbTier = profile.role_tier
            console.log(`[SubscriptionContext] Found tier in database: ${dbTier}`)

            // Only update if different from current state
            if (dbTier !== tier) {
              console.log(`[SubscriptionContext] Updating tier from database: ${tier} -> ${dbTier}`)
              setTierState(dbTier)
            }
          } else {
            console.log(`[SubscriptionContext] No tier found in database, defaulting to NOMAD`)
            setTierState("NOMAD")
          }
        } catch (error) {
          console.error(`[SubscriptionContext] Failed to load tier from database:`, error)
          console.log(`[SubscriptionContext] Defaulting to NOMAD tier`)
          setTierState("NOMAD")
        }
      } else {
        // User not connected, reset to NOMAD
        console.log(`[SubscriptionContext] User not connected, resetting to NOMAD`)
        setTierState("NOMAD")
      }
      setIsLoaded(true)
    }

    loadTierFromDatabase()
  }, [user?.address]) // Re-run when user connects/disconnects



  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        setTier,
        canAccessCryptoBots,
        canAccessForexBots,
        upgradeToPremium,
        upgradeToVIP,
        isUpdatingTier,
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
