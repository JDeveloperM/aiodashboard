"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
import { encryptedStorage } from '@/lib/encrypted-database-storage'

interface SuiUser {
  id: string
  address: string
  connectionType: 'wallet' | 'zklogin'
  username?: string
  email?: string
  profileImage?: string
  profileImageBlobId?: string
  createdAt: Date
  lastLoginAt: Date
  isNewUser?: boolean
  onboardingCompleted?: boolean
  profileSetupCompleted?: boolean
  kycCompleted?: boolean
}

interface SuiAuthContextType {
  // User state
  user: SuiUser | null
  isLoaded: boolean
  isSignedIn: boolean
  isNewUser: boolean

  // Authentication methods
  signOut: () => Promise<void>

  // User profile methods
  updateProfile: (data: Partial<SuiUser>) => Promise<void>

  // New user onboarding methods
  completeOnboarding: () => Promise<void>
  completeProfileSetup: () => Promise<void>
  completeKYC: () => Promise<void>
  refreshUserState: () => Promise<void>

  // Utility methods
  formatAddress: (address: string) => string
}

const SuiAuthContext = createContext<SuiAuthContextType | undefined>(undefined)

export function SuiAuthProvider({ children }: { children: React.ReactNode }) {
  const suiAccount = useCurrentAccount()
  const { zkLoginUserAddress } = useZkLogin()
  const [user, setUser] = useState<SuiUser | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)

  // Prevent infinite re-renders with refs
  const lastSuiAddress = useRef<string | undefined>(undefined)
  const lastZkLoginAddress = useRef<string | null | undefined>(undefined)
  const isProcessing = useRef(false)

  // Removed debug logs to clean console

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
    // Prevent infinite re-renders
    if (isProcessing.current) {
      console.log('⏸️ Skipping SuiAuth update - already processing')
      return
    }

    // Check if addresses actually changed
    const currentSuiAddress = suiAccount?.address
    const currentZkLoginAddress = zkLoginUserAddress

    if (lastSuiAddress.current === currentSuiAddress &&
        lastZkLoginAddress.current === currentZkLoginAddress) {
      console.log('⏸️ Skipping SuiAuth update - no address change')
      return
    }

    // Removed debug logs

    // Update refs
    lastSuiAddress.current = currentSuiAddress
    lastZkLoginAddress.current = currentZkLoginAddress
    isProcessing.current = true

    const createOrUpdateUser = async () => {
      try {
        let currentUser: SuiUser | null = null
        let userIsNew = false

        // Check for active wallet or zkLogin connection first
        if (currentSuiAddress) {
          // Check if this is a new user by looking for existing profile
          try {
            const existingProfile = await encryptedStorage.getDecryptedProfile(currentSuiAddress)
            // User is new if no profile exists OR onboarding is not completed
            const profileExists = !!existingProfile
            const onboardingCompleted = existingProfile?.onboarding_completed === true
            userIsNew = !profileExists || !onboardingCompleted

            console.log(`🔍 User ${currentSuiAddress} is ${userIsNew ? 'NEW' : 'EXISTING'}`, {
              profileExists,
              onboardingCompleted,
              profileId: existingProfile?.id,
              username: existingProfile?.username
            })
          } catch (error) {
            console.log('📝 Profile check failed, treating as new user:', error)
            userIsNew = true
          }

          // Wallet connection
          currentUser = {
            id: currentSuiAddress,
            address: currentSuiAddress,
            connectionType: 'wallet',
            username: `User ${currentSuiAddress.slice(0, 6)}`,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            isNewUser: userIsNew,
            onboardingCompleted: !userIsNew,
            profileSetupCompleted: !userIsNew,
            kycCompleted: false
          }
        } else if (currentZkLoginAddress) {
          // Check if this is a new user by looking for existing profile
          try {
            const existingProfile = await encryptedStorage.getDecryptedProfile(currentZkLoginAddress)
            // User is new if no profile exists OR onboarding is not completed
            const profileExists = !!existingProfile
            const onboardingCompleted = existingProfile?.onboarding_completed === true
            userIsNew = !profileExists || !onboardingCompleted

            console.log(`🔍 zkLogin User ${currentZkLoginAddress} is ${userIsNew ? 'NEW' : 'EXISTING'}`, {
              profileExists,
              onboardingCompleted,
              profileId: existingProfile?.id,
              username: existingProfile?.username
            })
          } catch (error) {
            console.log('📝 Profile check failed, treating as new user:', error)
            userIsNew = true
          }

          // zkLogin connection
          currentUser = {
            id: currentZkLoginAddress,
            address: currentZkLoginAddress,
            connectionType: 'zklogin',
            username: `User ${currentZkLoginAddress.slice(0, 6)}`,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            isNewUser: userIsNew,
            onboardingCompleted: !userIsNew,
            profileSetupCompleted: !userIsNew,
            kycCompleted: false
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
              profileImageBlobId: existingSession.profileImageBlobId,
              createdAt: new Date(existingSession.createdAt),
              lastLoginAt: new Date(existingSession.lastLoginAt)
            }

            console.log('User restored from session - wallet may reconnect automatically')
          }
        }

        // For new users, trigger database profile creation
        if (currentUser && userIsNew) {
          console.log('🆕 Creating database profile for new user...')
          try {
            await encryptedStorage.ensureProfileExists(currentUser.address)
            console.log('✅ Database profile created for new user')
          } catch (error) {
            console.error('❌ Failed to create database profile:', error)
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
              profileImageBlobId: currentUser.profileImageBlobId,
              createdAt: currentUser.createdAt instanceof Date ? currentUser.createdAt.toISOString() : new Date(currentUser.createdAt).toISOString(),
              lastLoginAt: currentUser.lastLoginAt instanceof Date ? currentUser.lastLoginAt.toISOString() : new Date(currentUser.lastLoginAt).toISOString()
            })

            console.log('User session saved to cookies')
          }
        }

        setUser(currentUser)
        setIsNewUser(userIsNew)
        setIsLoaded(true)
      } catch (error) {
        console.error('Error creating/updating user:', error)
        setUser(null)
        setIsLoaded(true)
      } finally {
        // Reset processing flag
        isProcessing.current = false
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
        profileImageBlobId: updatedUser.profileImageBlobId,
        createdAt: updatedUser.createdAt instanceof Date ? updatedUser.createdAt.toISOString() : new Date(updatedUser.createdAt).toISOString(),
        lastLoginAt: updatedUser.lastLoginAt instanceof Date ? updatedUser.lastLoginAt.toISOString() : new Date(updatedUser.lastLoginAt).toISOString()
      })

      console.log('Profile updated and saved to cookies')
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  // New user onboarding methods
  const completeOnboarding = async () => {
    if (!user) return

    try {
      const updatedUser = {
        ...user,
        onboardingCompleted: true,
        isNewUser: false,
        profileSetupCompleted: true
      }
      setUser(updatedUser)
      setIsNewUser(false)

      // Save to localStorage and cookies
      localStorage.setItem(`sui_user_${user.address}`, JSON.stringify(updatedUser))

      // Update session cookie
      const session = {
        address: user.address,
        connectionType: user.connectionType,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : new Date(user.createdAt).toISOString(),
        lastLoginAt: new Date().toISOString()
      }
      saveAuthSession(session)

      console.log('✅ Onboarding completed for user')
    } catch (error) {
      console.error('❌ Failed to complete onboarding:', error)
    }
  }

  const completeProfileSetup = async () => {
    if (!user) return

    try {
      const updatedUser = { ...user, profileSetupCompleted: true }
      setUser(updatedUser)

      // Save to localStorage and cookies
      localStorage.setItem(`sui_user_${user.address}`, JSON.stringify(updatedUser))
      console.log('✅ Profile setup completed for user')
    } catch (error) {
      console.error('❌ Failed to complete profile setup:', error)
    }
  }

  const completeKYC = async () => {
    if (!user) return

    try {
      const updatedUser = { ...user, kycCompleted: true }
      setUser(updatedUser)

      // Save to localStorage and cookies
      localStorage.setItem(`sui_user_${user.address}`, JSON.stringify(updatedUser))
      console.log('✅ KYC completed for user')
    } catch (error) {
      console.error('❌ Failed to complete KYC:', error)
    }
  }

  // Refresh user state (useful after profile updates)
  const refreshUserState = useCallback(async () => {
    if (user?.address) {
      try {
        const existingProfile = await encryptedStorage.getDecryptedProfile(user.address)
        // User is new if no profile exists OR onboarding is not completed
        const profileExists = !!existingProfile
        const onboardingCompleted = existingProfile?.onboarding_completed === true

        const updatedUser = {
          ...user,
          isNewUser: !profileExists || !onboardingCompleted,
          onboardingCompleted: onboardingCompleted,
          profileSetupCompleted: profileExists
        }

        setUser(updatedUser)
        setIsNewUser(!profileExists || !onboardingCompleted)

        // Update localStorage
        localStorage.setItem(`sui_user_${user.address}`, JSON.stringify(updatedUser))

        // User state refreshed successfully
      } catch (error) {
        console.error('❌ Failed to refresh user state:', error)
      }
    }
  }, [user])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isSignedIn = !!(suiAccount?.address || zkLoginUserAddress || user)

  const value: SuiAuthContextType = {
    user,
    isLoaded,
    isSignedIn,
    isNewUser,
    signOut,
    updateProfile,
    completeOnboarding,
    completeProfileSetup,
    completeKYC,
    refreshUserState,
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
