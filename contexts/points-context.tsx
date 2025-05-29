"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"

interface PointsContextType {
  balance: number
  addPoints: (amount: number) => void
  redeemPoints: (amount: number, itemName: string) => Promise<boolean>
  transactions: PointsTransaction[]
}

interface PointsTransaction {
  id: string
  type: "earned" | "redeemed"
  amount: number
  description: string
  timestamp: Date
}

const PointsContext = createContext<PointsContextType | undefined>(undefined)

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState(2500) // Starting balance
  const [transactions, setTransactions] = useState<PointsTransaction[]>([
    {
      id: "1",
      type: "earned",
      amount: 500,
      description: "Welcome bonus",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: "2", 
      type: "earned",
      amount: 1000,
      description: "Trading bot profits",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: "3",
      type: "earned", 
      amount: 750,
      description: "Community engagement",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: "4",
      type: "earned",
      amount: 250,
      description: "Ambassador referral",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ])

  const addPoints = (amount: number) => {
    setBalance(prev => prev + amount)
    const newTransaction: PointsTransaction = {
      id: Date.now().toString(),
      type: "earned",
      amount,
      description: "Points earned",
      timestamp: new Date()
    }
    setTransactions(prev => [newTransaction, ...prev])
    toast.success(`Earned ${amount} points!`)
  }

  const redeemPoints = async (amount: number, itemName: string): Promise<boolean> => {
    if (balance < amount) {
      toast.error("Insufficient points for this redemption")
      return false
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    setBalance(prev => prev - amount)
    const newTransaction: PointsTransaction = {
      id: Date.now().toString(),
      type: "redeemed",
      amount,
      description: `Redeemed: ${itemName}`,
      timestamp: new Date()
    }
    setTransactions(prev => [newTransaction, ...prev])
    toast.success(`Successfully redeemed ${itemName}!`)
    return true
  }

  // Load from localStorage on client side
  useEffect(() => {
    const savedBalance = localStorage.getItem("pointsBalance")
    const savedTransactions = localStorage.getItem("pointsTransactions")
    
    if (savedBalance) {
      setBalance(parseInt(savedBalance))
    }
    
    if (savedTransactions) {
      try {
        const parsed = JSON.parse(savedTransactions)
        setTransactions(parsed.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp)
        })))
      } catch (error) {
        console.error("Error parsing saved transactions:", error)
      }
    }
  }, [])

  // Save to localStorage when balance or transactions change
  useEffect(() => {
    localStorage.setItem("pointsBalance", balance.toString())
  }, [balance])

  useEffect(() => {
    localStorage.setItem("pointsTransactions", JSON.stringify(transactions))
  }, [transactions])

  return (
    <PointsContext.Provider
      value={{
        balance,
        addPoints,
        redeemPoints,
        transactions,
      }}
    >
      {children}
    </PointsContext.Provider>
  )
}

export function usePoints() {
  const context = useContext(PointsContext)
  if (context === undefined) {
    throw new Error("usePoints must be used within a PointsProvider")
  }
  return context
}
