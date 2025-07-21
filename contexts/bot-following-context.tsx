"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
// Using localStorage for bot following data (non-sensitive)
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { useCurrentAccount } from "@mysten/dapp-kit"

interface FollowedBot {
  id: string
  name: string
  type: "crypto" | "forex" | "stock"
  status: "active" | "stopped"
  followedAt: string
  lastUpdate: string
  cycleStartDate: string
  cycleEndDate: string
  cyclesPaid: number
  isPaid: boolean
}

interface BotFollowingContextType {
  followedBots: FollowedBot[]
  followBot: (botId: string, botName: string, botType: "crypto" | "forex" | "stock") => Promise<void>
  unfollowBot: (botId: string) => Promise<void>
  toggleBotStatus: (botId: string) => Promise<void>
  isFollowing: (botId: string) => boolean
  getBotStatus: (botId: string) => "active" | "stopped" | null
  getBotCycleInfo: (botId: string) => { daysLeft: number; cycleNumber: number; isPaid: boolean } | null
  payForBotCycle: (botId: string) => Promise<void>
  isLoading: boolean
}

const BotFollowingContext = createContext<BotFollowingContextType | undefined>(undefined)

export function BotFollowingProvider({ children }: { children: ReactNode }) {
  const { user } = useSuiAuth()
  const currentAccount = useCurrentAccount()
  const [followedBots, setFollowedBots] = useState<FollowedBot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Get user address from either SuiAuth context or current account
  const userAddress = user?.address || currentAccount?.address

  // Load followed bots from storage
  useEffect(() => {
    const loadFollowedBots = async () => {
      if (!userAddress) {
        setIsLoading(false)
        return
      }

      try {
        const stored = localStorage.getItem(`followed_bots_${userAddress}`)
        if (stored) {
          setFollowedBots(JSON.parse(stored))
        }
      } catch (error) {
        console.error("Error loading followed bots:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFollowedBots()
  }, [userAddress])

  // Save followed bots to storage
  const saveFollowedBots = (bots: FollowedBot[]) => {
    if (!userAddress) return

    try {
      localStorage.setItem(`followed_bots_${userAddress}`, JSON.stringify(bots))
    } catch (error) {
      console.error("Error saving followed bots:", error)
    }
  }

  const followBot = async (botId: string, botName: string, botType: "crypto" | "forex" | "stock") => {
    const now = new Date()
    const cycleEndDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days from now

    const newBot: FollowedBot = {
      id: botId,
      name: botName,
      type: botType,
      status: "active",
      followedAt: now.toISOString(),
      lastUpdate: now.toISOString(),
      cycleStartDate: now.toISOString(),
      cycleEndDate: cycleEndDate.toISOString(),
      cyclesPaid: 1, // First cycle is free
      isPaid: true
    }

    const updatedBots = [...followedBots, newBot]
    setFollowedBots(updatedBots)
    saveFollowedBots(updatedBots)
  }

  const unfollowBot = async (botId: string) => {
    const updatedBots = followedBots.filter(bot => bot.id !== botId)
    setFollowedBots(updatedBots)
    saveFollowedBots(updatedBots)
  }

  const toggleBotStatus = async (botId: string) => {
    const updatedBots = followedBots.map(bot =>
      bot.id === botId
        ? {
            ...bot,
            status: (bot.status === "active" ? "stopped" : "active") as "active" | "stopped",
            lastUpdate: new Date().toISOString()
          }
        : bot
    )
    setFollowedBots(updatedBots)
    saveFollowedBots(updatedBots)
  }

  const isFollowing = (botId: string): boolean => {
    return followedBots.some(bot => bot.id === botId)
  }

  const getBotStatus = (botId: string): "active" | "stopped" | null => {
    const bot = followedBots.find(bot => bot.id === botId)
    return bot ? bot.status : null
  }

  const getBotCycleInfo = (botId: string) => {
    const bot = followedBots.find(bot => bot.id === botId)
    if (!bot) return null

    const now = new Date()
    const cycleEnd = new Date(bot.cycleEndDate)
    const daysLeft = Math.max(0, Math.ceil((cycleEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))

    return {
      daysLeft,
      cycleNumber: bot.cyclesPaid,
      isPaid: bot.isPaid
    }
  }

  const payForBotCycle = async (botId: string) => {
    const updatedBots = followedBots.map(bot => {
      if (bot.id === botId) {
        const now = new Date()
        const newCycleEnd = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))

        return {
          ...bot,
          cycleStartDate: now.toISOString(),
          cycleEndDate: newCycleEnd.toISOString(),
          cyclesPaid: bot.cyclesPaid + 1,
          isPaid: true,
          lastUpdate: now.toISOString()
        }
      }
      return bot
    })

    setFollowedBots(updatedBots)
    saveFollowedBots(updatedBots)
  }

  const contextValue: BotFollowingContextType = {
    followedBots,
    followBot,
    unfollowBot,
    toggleBotStatus,
    isFollowing,
    getBotStatus,
    getBotCycleInfo,
    payForBotCycle,
    isLoading
  }

  return (
    <BotFollowingContext.Provider value={contextValue}>
      {children}
    </BotFollowingContext.Provider>
  )
}

export function useBotFollowing() {
  const context = useContext(BotFollowingContext)
  if (context === undefined) {
    throw new Error("useBotFollowing must be used within a BotFollowingProvider")
  }
  return context
}
