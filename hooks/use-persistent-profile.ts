"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { encryptedStorage, type DecryptedProfile, type Achievement } from '@/lib/encrypted-database-storage'
import { toast } from 'sonner'

interface ProfileState {
  profile: DecryptedProfile | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

interface ProfileActions {
  // Profile management
  loadProfile: () => Promise<void>
  updateProfile: (data: Partial<DecryptedProfile>) => Promise<boolean>
  
  // Specific field updates
  updateUsername: (username: string) => Promise<boolean>
  updateSocialLinks: (links: any[]) => Promise<boolean>
  updateKYCStatus: (status: 'verified' | 'pending' | 'not_verified') => Promise<boolean>
  updateTier: (tier: 'NOMAD' | 'PRO' | 'ROYAL') => Promise<boolean>
  
  // XP and achievements
  updateXP: (currentXP: number, totalXP: number, level: number) => Promise<boolean>
  claimAchievement: (achievementName: string, xpReward: number, pointsReward?: number) => Promise<boolean>
  updateAchievements: (achievements: Achievement[]) => Promise<boolean>
  
  // Utilities
  clearError: () => void
  refreshProfile: () => Promise<void>
}

export function usePersistentProfile(): ProfileState & ProfileActions {
  const { user, refreshUserState } = useSuiAuth()
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

      // Add a small delay to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 100))

      const profileData = await encryptedStorage.getDecryptedProfile(user.address)

      if (profileData) {
        // Check and fix missing XP fields for existing profiles
        try {
          await encryptedStorage.fixMissingXPFields(user.address)
          // Reload profile after potential fixes
          const updatedProfile = await encryptedStorage.getDecryptedProfile(user.address)
          setProfile(updatedProfile || profileData)
        } catch (error) {
          console.error('Failed to fix XP fields, using original profile:', error)
          setProfile(profileData)
        }
        console.log('✅ Profile loaded from database')
      } else {
        // Double-check if profile exists before creating new one (prevent duplicates)
        console.log('🔍 Double-checking profile existence before creating new one...')
        const doubleCheckProfile = await encryptedStorage.getDecryptedProfile(user.address)

        if (doubleCheckProfile) {
          console.log('✅ Profile found on double-check, using existing profile')
          setProfile(doubleCheckProfile)
        } else {
          // Create default profile if none exists (new user)
          console.log('📝 Creating default profile for new user...')
          const defaultProfile: Partial<DecryptedProfile> = {
            username: user.username || `User ${user.address.slice(0, 6)}`,
            role_tier: 'NOMAD',
            profile_level: 1,
            current_xp: 0,
            total_xp: 0,
            points: 0, // New users start with 0 points
            kyc_status: 'not_verified',
            join_date: new Date().toISOString(),
            achievements_data: [],
            social_links: [], // Will be stored in encrypted format
            referral_data: {},
            display_preferences: {
              language: 'en',
              performance_mode: false,
              email_notifications: true,
              push_notifications: true,
              browser_notifications: false,
              trade_notifications: true,
              news_notifications: true,
              promo_notifications: true,
              privacy_settings: {
                profile_visibility: 'public',
                show_achievements: true,
                show_level: true,
                show_join_date: true,
                show_last_active: false,
                allow_profile_search: true
              }
            },
            // payment_preferences: { // Column doesn't exist in current schema
            //   payment_methods: [],
            //   points_auto_renewal: true
            // },
            walrus_metadata: {}
          }

          const createdProfile = await encryptedStorage.upsertEncryptedProfile(
            user.address,
            defaultProfile
          )
          setProfile(createdProfile)
          console.log('✅ Default profile created for new user with starting points')
        }
      }
    } catch (error) {
      console.error('❌ Failed to load profile:', error)
      setError('Failed to load profile')
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [user?.address, user?.username])

  // Update profile
  const updateProfile = useCallback(async (data: Partial<DecryptedProfile>): Promise<boolean> => {
    if (!user?.address) return false

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 Updating profile:', data)
      console.log('👤 User address:', user.address)

      // Enforce username immutability - once set, it cannot be changed
      if (data.username && profile?.username && profile.username !== data.username) {
        console.error('❌ Username cannot be changed once set')
        toast.error('Username cannot be changed once set to maintain referral code consistency')
        setIsLoading(false)
        return false
      }

      const updatedProfile = await encryptedStorage.upsertEncryptedProfile(
        user.address,
        data
      )
      setProfile(updatedProfile)
      console.log('✅ Profile updated successfully')

      // Note: Removed refreshUserState() call to prevent cascading re-renders
      // The profile state update is sufficient for most use cases

      toast.success('Profile updated')
      return true
    } catch (error) {
      console.error('❌ Failed to update profile:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userAddress: user.address,
        profileData: data
      })

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Failed to update profile: ${errorMessage}`)
      toast.error(`Failed to save profile: ${errorMessage}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user?.address])

  // Specific field updates
  const updateUsername = useCallback(async (username: string): Promise<boolean> => {
    // Enforce username immutability - once set, it cannot be changed
    if (profile?.username && profile.username !== username) {
      console.error('❌ Username cannot be changed once set')
      toast.error('Username cannot be changed once set to maintain referral code consistency')
      return false
    }

    return updateProfile({ username })
  }, [updateProfile, profile?.username])



  const updateSocialLinks = useCallback(async (links: any[]): Promise<boolean> => {
    if (!user?.address) return false

    try {
      console.log('🔗 Updating social links:', links)
      await encryptedStorage.updateSocialLinks(user.address, links)
      setProfile(prev => prev ? { ...prev, social_links: links } : null)

      // Refresh profile to ensure achievements are recalculated
      setTimeout(() => {
        loadProfile()
      }, 500)

      toast.success('Social links updated')
      return true
    } catch (error) {
      console.error('Failed to update social links:', error)
      toast.error('Failed to update social links')
      return false
    }
  }, [user?.address, loadProfile])

  const updateKYCStatus = useCallback(async (status: 'verified' | 'pending' | 'not_verified'): Promise<boolean> => {
    if (!user?.address) return false
    
    try {
      await encryptedStorage.updateKYCStatus(user.address, status)
      setProfile(prev => prev ? { ...prev, kyc_status: status } : null)
      toast.success(`KYC status updated to ${status}`)
      return true
    } catch (error) {
      console.error('Failed to update KYC status:', error)
      toast.error('Failed to update KYC status')
      return false
    }
  }, [user?.address])

  const updateTier = useCallback(async (tier: 'NOMAD' | 'PRO' | 'ROYAL'): Promise<boolean> => {
    if (!user?.address) return false
    
    try {
      await encryptedStorage.updateUserTier(user.address, tier)
      setProfile(prev => prev ? { ...prev, role_tier: tier } : null)
      toast.success(`Tier updated to ${tier}`)
      return true
    } catch (error) {
      console.error('Failed to update tier:', error)
      toast.error('Failed to update tier')
      return false
    }
  }, [user?.address])

  const updateXP = useCallback(async (currentXP: number, totalXP: number, level: number): Promise<boolean> => {
    if (!user?.address) return false
    
    try {
      await encryptedStorage.updateXPAndLevel(user.address, currentXP, totalXP, level)
      setProfile(prev => prev ? { 
        ...prev, 
        current_xp: currentXP, 
        total_xp: totalXP, 
        profile_level: level 
      } : null)
      return true
    } catch (error) {
      console.error('Failed to update XP:', error)
      return false
    }
  }, [user?.address])

  const claimAchievement = useCallback(async (achievementName: string, xpReward: number, pointsReward: number = 0): Promise<boolean> => {
    if (!profile || !user?.address) {
      console.error('❌ Missing profile or user address for achievement claim')
      return false
    }

    try {
      console.log(`🏆 Claiming achievement: ${achievementName} (+${xpReward} XP, +${pointsReward} Points)`)
      console.log('📊 Current profile state:', {
        current_xp: profile.current_xp,
        total_xp: profile.total_xp,
        profile_level: profile.profile_level,
        points: profile.points,
        achievements_count: profile.achievements_data?.length || 0
      })

      // Update achievement as claimed - handle case where achievement doesn't exist in DB yet
      const existingAchievements = profile.achievements_data || []
      const existingAchievement = existingAchievements.find(a => a.name === achievementName)

      let updatedAchievements: Achievement[]

      if (existingAchievement) {
        // Update existing achievement
        updatedAchievements = existingAchievements.map(achievement =>
          achievement.name === achievementName
            ? { ...achievement, claimed: true, claimed_at: new Date().toISOString() }
            : achievement
        )
        console.log('📝 Updated existing achievement in database')
      } else {
        // Add new achievement to database
        const newAchievement: Achievement = {
          name: achievementName,
          claimed: true,
          claimed_at: new Date().toISOString(),
          xp: xpReward,
          tooltip: `${achievementName} achievement`,
          category: 'general',
          color: '#4DA2FF',
          unlocked: true
        }
        updatedAchievements = [...existingAchievements, newAchievement]
        console.log('➕ Added new achievement to database:', newAchievement)
      }

      console.log('📊 Current achievements in database:', updatedAchievements.length)

      // Calculate new XP and Points
      const newCurrentXP = profile.current_xp + xpReward
      const newTotalXP = profile.total_xp + xpReward
      const newPoints = (profile.points || 0) + pointsReward

      // Calculate new level using the updated XP progression table
      let newLevel = 1
      if (newTotalXP >= 5000) newLevel = 10
      else if (newTotalXP >= 3600) newLevel = 9
      else if (newTotalXP >= 2600) newLevel = 8
      else if (newTotalXP >= 1800) newLevel = 7
      else if (newTotalXP >= 1200) newLevel = 6
      else if (newTotalXP >= 800) newLevel = 5
      else if (newTotalXP >= 500) newLevel = 4
      else if (newTotalXP >= 250) newLevel = 3
      else if (newTotalXP >= 100) newLevel = 2

      console.log('📈 New XP and Points calculation:', {
        newCurrentXP,
        newTotalXP,
        newPoints,
        newLevel,
        xpReward,
        pointsReward
      })

      // Update achievements in database FIRST
      console.log('💾 Updating achievements in database...', updatedAchievements)
      await encryptedStorage.updateAchievements(user.address, updatedAchievements)

      // Update XP, level, and points in database
      console.log('📊 Updating XP, level, and points in database...')
      await encryptedStorage.updateXPAndLevel(user.address, newCurrentXP, newTotalXP, newLevel)

      // Update points separately if there's a points reward
      if (pointsReward > 0) {
        console.log('💰 Updating points in database...')
        await encryptedStorage.supabase
          .from('user_profiles')
          .update({
            points: newPoints,
            updated_at: new Date().toISOString()
          })
          .eq('address', user.address)
      }

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        achievements_data: updatedAchievements,
        current_xp: newCurrentXP,
        total_xp: newTotalXP,
        profile_level: newLevel,
        points: newPoints
      } : null)

      console.log('✅ Achievement claimed successfully!')
      const rewardText = pointsReward > 0 ? `+${xpReward} XP, +${pointsReward} Points` : `+${xpReward} XP`
      toast.success(`🎉 Achievement claimed! ${rewardText} (Level ${newLevel})`)
      return true
    } catch (error) {
      console.error('❌ Failed to claim achievement:', error)
      toast.error(`Failed to claim achievement: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    }
  }, [profile, user?.address])

  const updateAchievements = useCallback(async (achievements: Achievement[]): Promise<boolean> => {
    if (!user?.address) return false
    
    try {
      await encryptedStorage.updateAchievements(user.address, achievements)
      setProfile(prev => prev ? { ...prev, achievements_data: achievements } : null)
      return true
    } catch (error) {
      console.error('Failed to update achievements:', error)
      return false
    }
  }, [user?.address])

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
  }, [user?.address]) // Removed loadProfile dependency to prevent infinite loops

  // Removed the second useEffect that was causing excessive re-renders
  // Profile will be loaded when user.address changes, which is sufficient

  return {
    // State
    profile,
    isLoading,
    error,
    isInitialized,
    
    // Actions
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
}
