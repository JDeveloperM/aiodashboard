"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useSubscription } from "./subscription-context"

interface PremiumAccessRecord {
  creatorId: string
  channelId: string
  accessedAt: Date
  tier: 'PRO' | 'ROYAL'
}

interface PremiumAccessContextType {
  premiumAccessCount: number
  premiumAccessLimit: number
  premiumAccessRecords: PremiumAccessRecord[]
  canAccessPremiumForFree: (creatorId: string, channelId: string) => boolean
  recordPremiumAccess: (creatorId: string, channelId: string) => void
  getRemainingFreeAccess: () => number
  resetPremiumAccess: () => void
}

const PremiumAccessContext = createContext<PremiumAccessContextType | undefined>(undefined)

export function PremiumAccessProvider({ children }: { children: React.ReactNode }) {
  const { tier } = useSubscription()
  const [premiumAccessRecords, setPremiumAccessRecords] = useState<PremiumAccessRecord[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Define limits based on tier
  const premiumAccessLimit = tier === 'ROYAL' ? 9 : tier === 'PRO' ? 3 : 0

  // Load premium access records from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRecords = localStorage.getItem("premiumAccessRecords")
      if (savedRecords) {
        try {
          const parsedRecords = JSON.parse(savedRecords).map((record: any) => ({
            ...record,
            accessedAt: new Date(record.accessedAt)
          }))
          setPremiumAccessRecords(parsedRecords)
          console.log(`[PremiumAccess] Loaded ${parsedRecords.length} premium access records`)
        } catch (error) {
          console.error("Failed to parse premium access records:", error)
          setPremiumAccessRecords([])
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Save premium access records to localStorage when they change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem("premiumAccessRecords", JSON.stringify(premiumAccessRecords))
    }
  }, [premiumAccessRecords, isLoaded])

  // Filter records for current tier (in case user upgraded/downgraded)
  const currentTierRecords = premiumAccessRecords.filter(record => record.tier === tier)
  const premiumAccessCount = currentTierRecords.length

  const canAccessPremiumForFree = (creatorId: string, channelId: string) => {
    // NOMAD users never get free premium access
    if (tier === 'NOMAD') {
      return false
    }

    // Check if already accessed this specific channel
    const alreadyAccessed = currentTierRecords.some(
      record => record.creatorId === creatorId && record.channelId === channelId
    )

    if (alreadyAccessed) {
      return true // Already used a slot for this channel
    }

    // Check if user has remaining free access slots
    return premiumAccessCount < premiumAccessLimit
  }

  const recordPremiumAccess = (creatorId: string, channelId: string) => {
    // Only record if it's a new access and user has a premium tier
    if (tier === 'NOMAD') return

    const alreadyAccessed = currentTierRecords.some(
      record => record.creatorId === creatorId && record.channelId === channelId
    )

    if (!alreadyAccessed && premiumAccessCount < premiumAccessLimit) {
      const newRecord: PremiumAccessRecord = {
        creatorId,
        channelId,
        accessedAt: new Date(),
        tier: tier as 'PRO' | 'ROYAL'
      }

      setPremiumAccessRecords(prev => [...prev, newRecord])
      console.log(`[PremiumAccess] Recorded premium access for ${tier} user: ${premiumAccessCount + 1}/${premiumAccessLimit}`)
    }
  }

  const getRemainingFreeAccess = () => {
    return Math.max(0, premiumAccessLimit - premiumAccessCount)
  }

  const resetPremiumAccess = () => {
    setPremiumAccessRecords([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem("premiumAccessRecords")
    }
    console.log(`[PremiumAccess] Reset premium access records`)
  }

  // Reset records when tier changes to NOMAD (downgrade)
  useEffect(() => {
    if (tier === 'NOMAD' && premiumAccessRecords.length > 0) {
      resetPremiumAccess()
    }
  }, [tier])

  return (
    <PremiumAccessContext.Provider
      value={{
        premiumAccessCount,
        premiumAccessLimit,
        premiumAccessRecords: currentTierRecords,
        canAccessPremiumForFree,
        recordPremiumAccess,
        getRemainingFreeAccess,
        resetPremiumAccess,
      }}
    >
      {children}
    </PremiumAccessContext.Provider>
  )
}

export function usePremiumAccess() {
  const context = useContext(PremiumAccessContext)
  if (context === undefined) {
    throw new Error("usePremiumAccess must be used within a PremiumAccessProvider")
  }
  return context
}

export type { PremiumAccessRecord }
