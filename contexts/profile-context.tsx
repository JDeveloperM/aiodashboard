"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { encryptedStorage, type DecryptedProfile, type Achievement } from '@/lib/encrypted-database-storage'
import { toast } from 'sonner'

interface ProfileContextType {
  profile: DecryptedProfile | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean
  
  // Actions
  loadProfile: () => Promise<void>
  updateProfile: (data: Partial<DecryptedProfile>) => Promise<boolean>
  updateUsername: (username: string) => Promise<boolean>
  updateSocialLinks: (links: any[]) => Promise<boolean>
  updateKYCStatus: (status: 'verified' | 'pending' | 'not_verified') => Promise<boolean>
  updateTier: (tier: 'NOMAD' | 'PRO' | 'ROYAL') => Promise<boolean>
  updateXP: (currentXP: number, totalXP: number, level: number) => Promise<boolean>
  claimAchievement: (achievementName: string, xpReward: number, pointsReward?: number) => Promise<boolean>
  updateAchievements: (achievements: Achievement[]) => Promise<boolean>
  clearError: () => void
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSuiAuth()
  const [profile, setProfile] = useState<DecryptedProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load profile from database
  const loadProfile = useCallback(async () => {
    if (!user?.address) return

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 Loading persistent profile for:', user.address)

      const profileData = await encryptedStorage.getDecryptedProfile(user.address)

      if (profileData) {
        setProfile(profileData)
        console.log('✅ Profile loaded from database')
      } else {
        console.log('📭 No profile found')
        setProfile(null)
      }
    } catch (error) {
      console.error('❌ Failed to load profile:', error)
      setError('Failed to load profile')
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [user?.address])

  // Update profile
  const updateProfile = useCallback(async (data: Partial<DecryptedProfile>): Promise<boolean> => {
    if (!user?.address) return false

    setIsLoading(true)
    setError(null)

    try {
      const updatedProfile = await encryptedStorage.upsertEncryptedProfile(user.address, data)
      
      if (updatedProfile) {
        setProfile(updatedProfile)
        console.log('✅ Profile updated successfully')
        return true
      }
      return false
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Failed to update profile: ${errorMessage}`)
      toast.error(`Failed to save profile: ${errorMessage}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user?.address])

  // Other methods (simplified for now)
  const updateUsername = useCallback(async (username: string): Promise<boolean> => {
    return updateProfile({ username })
  }, [updateProfile])

  const updateSocialLinks = useCallback(async (links: any[]): Promise<boolean> => {
    return updateProfile({ social_links: links })
  }, [updateProfile])

  const updateKYCStatus = useCallback(async (status: 'verified' | 'pending' | 'not_verified'): Promise<boolean> => {
    return updateProfile({ kyc_status: status })
  }, [updateProfile])

  const updateTier = useCallback(async (tier: 'NOMAD' | 'PRO' | 'ROYAL'): Promise<boolean> => {
    return updateProfile({ role_tier: tier })
  }, [updateProfile])

  const updateXP = useCallback(async (currentXP: number, totalXP: number, level: number): Promise<boolean> => {
    return updateProfile({ current_xp: currentXP, total_xp: totalXP, profile_level: level })
  }, [updateProfile])

  const claimAchievement = useCallback(async (achievementName: string, xpReward: number, pointsReward?: number): Promise<boolean> => {
    // Simplified implementation
    return updateProfile({ current_xp: (profile?.current_xp || 0) + xpReward })
  }, [updateProfile, profile])

  const updateAchievements = useCallback(async (achievements: Achievement[]): Promise<boolean> => {
    return updateProfile({ achievements_data: achievements })
  }, [updateProfile])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    await loadProfile()
  }, [loadProfile])

  // Load profile when user changes
  useEffect(() => {
    if (user?.address) {
      loadProfile()
    }
  }, [user?.address, loadProfile])

  const value: ProfileContextType = {
    profile,
    isLoading,
    error,
    isInitialized,
    loadProfile,
    updateProfile,
    updateUsername,
    updateSocialLinks,
    updateKYCStatus,
    updateTier,
    updateXP,
    claimAchievement,
    updateAchievements,
    clearError,
    refreshProfile
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

// Backward compatibility - export the same interface as usePersistentProfile
export const usePersistentProfile = useProfile
