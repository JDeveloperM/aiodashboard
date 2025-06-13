"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useZkLogin } from '@/components/zklogin-provider'
import {
  saveAuthSession,
  getAuthSession,
  clearAuthSession,
  type AuthSession
} from '@/lib/auth-cookies'
import {
  initializeSessionManager,
  stopSessionManager,
  validateSession,
  addSessionEventListeners
} from '@/lib/auth-session'

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

  // Initialize session manager
  useEffect(() => {
    initializeSessionManager()

    // Add session event listeners (less aggressive)
    const cleanup = addSessionEventListeners({
      onWarning: (detail) => {
        console.warn(`Session expires in ${detail.minutes} minutes`)
        // Only show warning, don't force logout
      },
      onLogout: (detail) => {
        console.log('Session logout event:', detail.reason)
        // Only clear user if it's a legitimate expiry, not a wallet disconnect
        if (detail.reason === 'Session expired' && !suiAccount?.address && !zkLoginUserAddress) {
          setUser(null)
        }
      }
    })

    return () => {
      stopSessionManager()
      cleanup()
    }
  }, [])

  // Create or update user when wallet connects
  useEffect(() => {
    const createOrUpdateUser = async () => {
      try {
        let currentUser: SuiUser | null = null

        // Check for active wallet or zkLogin connection first
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
        } else {
          // No active connection, try to restore from cookie session
          const existingSession = getAuthSession()
          if (existingSession) {
            // Restore user from cookie session (keep user logged in even if wallet temporarily disconnects)
            currentUser = {
              id: existingSession.address,
              address: existingSession.address,
              connectionType: existingSession.connectionType,
              username: existingSession.username,
              email: existingSession.email,
              profileImage: existingSession.profileImage,
              createdAt: new Date(existingSession.createdAt),
              lastLoginAt: new Date(existingSession.lastLoginAt)
            }

            console.log('User restored from session - wallet may reconnect automatically')
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

          // Save to both localStorage and cookies
          if (currentUser) {
            localStorage.setItem(`sui_user_${currentUser.address}`, JSON.stringify(currentUser))

            // Save to cookie session
            saveAuthSession({
              address: currentUser.address,
              connectionType: currentUser.connectionType,
              username: currentUser.username,
              email: currentUser.email,
              profileImage: currentUser.profileImage,
              createdAt: currentUser.createdAt.toISOString(),
              lastLoginAt: currentUser.lastLoginAt.toISOString()
            })

            console.log('User session saved to cookies')
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

      // Clear cookies and localStorage
      clearAuthSession()

      // Note: We can't programmatically disconnect wallets
      // Users need to disconnect from their wallet extension
      // or we can provide instructions

      // Clear any stored user data
      if (user) {
        localStorage.removeItem(`sui_user_${user.address}`)
      }

      console.log('User signed out and session cleared')
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

      // Save to cookie session
      saveAuthSession({
        address: updatedUser.address,
        connectionType: updatedUser.connectionType,
        username: updatedUser.username,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        createdAt: updatedUser.createdAt.toISOString(),
        lastLoginAt: updatedUser.lastLoginAt.toISOString()
      })

      console.log('Profile updated and saved to cookies')
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isSignedIn = !!(suiAccount?.address || zkLoginUserAddress || user)

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
