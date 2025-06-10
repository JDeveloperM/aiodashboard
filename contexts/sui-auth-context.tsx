"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useZkLogin } from '@/components/zklogin-provider'

interface SuiUser {
  id: string
  address: string
  connectionType: 'wallet' | 'zklogin'
  username?: string
  email?: string
  profileImage?: string
  createdAt: Date
  lastLoginAt: Date
}

interface SuiAuthContextType {
  // User state
  user: SuiUser | null
  isLoaded: boolean
  isSignedIn: boolean
  
  // Authentication methods
  signOut: () => Promise<void>
  
  // User profile methods
  updateProfile: (data: Partial<SuiUser>) => Promise<void>
  
  // Utility methods
  formatAddress: (address: string) => string
}

const SuiAuthContext = createContext<SuiAuthContextType | undefined>(undefined)

export function SuiAuthProvider({ children }: { children: React.ReactNode }) {
  const suiAccount = useCurrentAccount()
  const { zkLoginUserAddress } = useZkLogin()
  const [user, setUser] = useState<SuiUser | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Create or update user when wallet connects
  useEffect(() => {
    const createOrUpdateUser = async () => {
      try {
        let currentUser: SuiUser | null = null

        if (suiAccount?.address) {
          // Wallet connection
          currentUser = {
            id: suiAccount.address,
            address: suiAccount.address,
            connectionType: 'wallet',
            username: `User ${suiAccount.address.slice(0, 6)}`,
            createdAt: new Date(),
            lastLoginAt: new Date()
          }
        } else if (zkLoginUserAddress) {
          // zkLogin connection
          currentUser = {
            id: zkLoginUserAddress,
            address: zkLoginUserAddress,
            connectionType: 'zklogin',
            username: `User ${zkLoginUserAddress.slice(0, 6)}`,
            createdAt: new Date(),
            lastLoginAt: new Date()
          }
        }

        // Load existing user data from localStorage if available
        if (currentUser) {
          const existingUserData = localStorage.getItem(`sui_user_${currentUser.address}`)
          if (existingUserData) {
            const parsedData = JSON.parse(existingUserData)
            currentUser = {
              ...currentUser,
              ...parsedData,
              lastLoginAt: new Date()
            }
          }
          
          // Save updated user data
          if (currentUser) {
            localStorage.setItem(`sui_user_${currentUser.address}`, JSON.stringify(currentUser))
          }
        }

        setUser(currentUser)
        setIsLoaded(true)
      } catch (error) {
        console.error('Error creating/updating user:', error)
        setUser(null)
        setIsLoaded(true)
      }
    }

    createOrUpdateUser()
  }, [suiAccount?.address, zkLoginUserAddress])

  const signOut = async () => {
    try {
      // Clear user data
      setUser(null)
      
      // Note: We can't programmatically disconnect wallets
      // Users need to disconnect from their wallet extension
      // or we can provide instructions
      
      // Clear any stored user data
      if (user) {
        localStorage.removeItem(`sui_user_${user.address}`)
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (data: Partial<SuiUser>) => {
    if (!user) return

    try {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      
      // Save to localStorage
      localStorage.setItem(`sui_user_${user.address}`, JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isSignedIn = !!(suiAccount?.address || zkLoginUserAddress)

  const value: SuiAuthContextType = {
    user,
    isLoaded,
    isSignedIn,
    signOut,
    updateProfile,
    formatAddress
  }

  return (
    <SuiAuthContext.Provider value={value}>
      {children}
    </SuiAuthContext.Provider>
  )
}

export function useSuiAuth() {
  const context = useContext(SuiAuthContext)
  if (context === undefined) {
    throw new Error('useSuiAuth must be used within a SuiAuthProvider')
  }
  return context
}

// Compatibility hooks to replace Clerk hooks
export function useUser() {
  const { user, isLoaded, isSignedIn } = useSuiAuth()
  
  return {
    user,
    isLoaded,
    isSignedIn
  }
}

// Additional compatibility exports
export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useSuiAuth()
  return isSignedIn ? <>{children}</> : null
}

export const SignedOut = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useSuiAuth()
  return !isSignedIn ? <>{children}</> : null
}
