"use client"

import { useState, useEffect, useCallback } from 'react'
import { encryptedStorage, type DecryptedProfile } from '@/lib/encrypted-database-storage'
import { User, Achievement, SocialMedia } from '@/components/user-search-interface'

interface CommunityUsersState {
  users: User[]
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

interface CommunityUsersActions {
  refreshUsers: () => Promise<void>
  clearError: () => void
}

// Social media image paths
const socialImages = {
  Discord: "/images/social/discord.png",
  Telegram: "/images/social/telegram.png",
  X: "/images/social/x.png"
}

// Helper function to get avatar URL (handles both default avatars and Walrus blobs)
const getAvatarUrl = async (blobId: string | null): Promise<string | undefined> => {
  if (!blobId) return undefined

  try {
    // Check if it's a default avatar path (starts with /images/animepfp/)
    if (blobId.startsWith('/images/animepfp/')) {
      return blobId // Return the path directly for default avatars
    }

    // Otherwise it's a Walrus blob ID
    return `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`
  } catch (error) {
    console.warn('Failed to get avatar URL:', error)
    return undefined
  }
}

// Helper function to determine user status (mock for now, can be enhanced later)
const getUserStatus = (): 'online' | 'idle' | 'dnd' | 'offline' => {
  const statuses: ('online' | 'idle' | 'dnd' | 'offline')[] = ['online', 'idle', 'dnd', 'offline']
  const weights = [0.4, 0.3, 0.2, 0.1] // 40% online, 30% idle, 20% dnd, 10% offline
  
  const random = Math.random()
  let cumulative = 0
  
  for (let i = 0; i < statuses.length; i++) {
    cumulative += weights[i]
    if (random <= cumulative) {
      return statuses[i]
    }
  }
  
  return 'offline'
}

// Helper function to get last active time
const getLastActiveTime = (lastActive: string): string => {
  const now = new Date()
  const lastActiveDate = new Date(lastActive)
  const diffMs = now.getTime() - lastActiveDate.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
}

// Helper function to convert database achievements to UI format
const convertAchievements = (achievementsData: any[], profile: DecryptedProfile): Achievement[] => {
  // Base achievements that should always be available (updated with new names and XP values)
  const baseAchievements = [
    // Profile & KYC Category
    { name: "Personalize Your Profile", color: "#4DA2FF", xp: 50, tooltip: "Upload a profile picture to your account" },
    { name: "Unlock Full Access", color: "#10B981", xp: 100, tooltip: "Finish the KYC verification process" },
    { name: "Advanced User Status", color: "#FFD700", xp: 200, tooltip: "Achieve profile level 5" },

    // Social Connection Achievements
    { name: "Connect Discord", color: "#5865F2", xp: 15, tooltip: "Connect your Discord account to join our community" },
    { name: "Connect Telegram", color: "#0088CC", xp: 15, tooltip: "Connect your Telegram account for updates" },
    { name: "Connect X", color: "#000000", xp: 15, tooltip: "Connect your X (Twitter) account" },

    // Bot & Trading Achievements
    { name: "Connect Bybit", color: "#F7931A", xp: 25, tooltip: "Connect your Bybit account for trading" },
    { name: "Follow Apollon Bot", color: "#9333EA", xp: 20, tooltip: "Follow Apollon AI bot for trading signals" },
    { name: "Follow Hermes Bot", color: "#059669", xp: 20, tooltip: "Follow Hermes bot for market insights" },
    { name: "Make 3 Cycles", color: "#10B981", xp: 50, tooltip: "Complete 3 successful trading cycles" },

    // Upgrade Achievements
    { name: "Upgrade to PRO", color: "#4DA2FF", xp: 50, tooltip: "Upgrade your membership to PRO tier" },
    { name: "Upgrade to ROYAL", color: "#FFD700", xp: 75, tooltip: "Upgrade your membership to ROYAL tier" },

    // Referral Achievements
    { name: "Refer 10 NOMADs", color: "#6B7280", xp: 75, tooltip: "Successfully refer 10 NOMAD members" },
    { name: "Refer 50 NOMADs", color: "#6B7280", xp: 100, tooltip: "Successfully refer 50 NOMAD members" },
    { name: "Refer 100 NOMADs", color: "#6B7280", xp: 150, tooltip: "Successfully refer 100 NOMAD members" },
    { name: "Refer 1 PRO", color: "#4DA2FF", xp: 60, tooltip: "Successfully refer 1 PRO member" },
    { name: "Refer 5 PRO", color: "#4DA2FF", xp: 100, tooltip: "Successfully refer 5 PRO members" },
    { name: "Refer 10 PRO", color: "#4DA2FF", xp: 150, tooltip: "Successfully refer 10 PRO members" },
    { name: "Refer 1 ROYAL", color: "#FFD700", xp: 70, tooltip: "Successfully refer 1 ROYAL member" },
    { name: "Refer 3 ROYAL", color: "#FFD700", xp: 120, tooltip: "Successfully refer 3 ROYAL members" },
    { name: "Refer 5 ROYAL", color: "#FFD700", xp: 200, tooltip: "Successfully refer 5 ROYAL members" }
  ]

  // Function to check if achievement should be unlocked based on profile data
  const checkAchievementUnlocked = (achievementName: string): boolean => {
    switch (achievementName) {
      case "Profile Picture":
        return !!profile?.profile_image_blob_id
      case "KYC Verification":
        return profile?.kyc_status === 'verified'
      case "Reach Level 5":
        return (profile?.profile_level || 1) >= 5
      case "Connect Discord":
        return profile?.social_links?.some((link: any) => link.platform === 'Discord') || false
      case "Connect Telegram":
        return profile?.social_links?.some((link: any) => link.platform === 'Telegram') || false
      case "Connect X":
        return profile?.social_links?.some((link: any) => link.platform === 'X') || false
      case "Upgrade to PRO":
        return profile?.role_tier === 'PRO' || profile?.role_tier === 'ROYAL'
      case "Upgrade to ROYAL":
        return profile?.role_tier === 'ROYAL'
      // For other achievements, assume unlocked if they exist in database
      default:
        return achievementsData?.some((dbAchievement: any) => dbAchievement.name === achievementName && dbAchievement.unlocked) || false
    }
  }

  // Create achievements with proper unlock status and merge with database data
  return baseAchievements.map((baseAchievement: any) => {
    const savedAchievement = achievementsData?.find((saved: any) => saved.name === baseAchievement.name)
    return {
      ...baseAchievement,
      unlocked: checkAchievementUnlocked(baseAchievement.name),
      claimed: savedAchievement?.claimed || false,
      claimed_at: savedAchievement?.claimed_at
    }
  })
}

// Helper function to convert database social links to UI format
const convertSocialMedia = (socialLinks: any[]): SocialMedia[] => {
  if (!Array.isArray(socialLinks)) return []
  
  const defaultSocials: SocialMedia[] = [
    {
      platform: "Discord",
      image: socialImages.Discord,
      url: "https://discord.gg/aionet",
      connected: false,
      username: "",
      color: "#5865F2"
    },
    {
      platform: "Telegram", 
      image: socialImages.Telegram,
      url: "https://t.me/aionet",
      connected: false,
      username: "",
      color: "#0088CC"
    },
    {
      platform: "X",
      image: socialImages.X,
      url: "https://x.com/aionet", 
      connected: false,
      username: "",
      color: "#000000"
    }
  ]

  // Update default socials with actual data
  socialLinks.forEach(link => {
    const social = defaultSocials.find(s => s.platform.toLowerCase() === link.platform?.toLowerCase())
    if (social && link.username) {
      social.connected = true
      social.username = link.username
      if (link.url) social.url = link.url
    }
  })

  return defaultSocials
}

// Helper function to convert database profile to User format
const convertProfileToUser = async (profile: DecryptedProfile): Promise<User> => {
  const avatarUrl = profile.profile_image_blob_id 
    ? await getAvatarUrl(profile.profile_image_blob_id)
    : undefined

  return {
    id: profile.address, // Use wallet address as unique ID
    name: profile.username || `User ${profile.address.slice(0, 6)}`,
    username: profile.username ? `@${profile.username.toLowerCase().replace(/\s+/g, '_')}` : `@${profile.address.slice(0, 8)}`,
    email: profile.email || `${profile.address.slice(0, 8)}@example.com`,
    avatar: avatarUrl,
    role: profile.role_tier || 'NOMAD',
    status: getUserStatus(),
    joinDate: profile.join_date ? new Date(profile.join_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    lastActive: profile.last_active ? getLastActiveTime(profile.last_active) : 'Unknown',
    kycStatus: profile.kyc_status || 'not_verified',
    totalPoints: profile.points || 0,
    level: profile.profile_level || 1,
    activity: 'AIONET member',
    location: profile.location || 'Unknown',
    bio: 'AIONET community member',
    achievements: convertAchievements(profile.achievements_data || [], profile),
    socialMedia: convertSocialMedia(profile.social_links || [])
  }
}

export function useCommunityUsers(): CommunityUsersState & CommunityUsersActions {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load users from database using existing working methods
  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 Loading community users from database...')

      // First, get all user addresses using a simple query
      const { data: addressData, error: addressError } = await encryptedStorage.supabase
        .from('user_profiles')
        .select('address')
        .order('updated_at', { ascending: false })
        .limit(100)

      if (addressError) {
        console.error('❌ Failed to get user addresses:', addressError)
        throw new Error(`Database query failed: ${addressError.message}`)
      }

      console.log(`📊 Found ${addressData?.length || 0} user addresses in database`)

      if (!addressData || addressData.length === 0) {
        console.log('ℹ️ No profiles found in database')
        setUsers([])
        return
      }

      // Now get each profile using the working getDecryptedProfile method
      const convertedUsers: User[] = []
      for (const { address } of addressData) {
        try {
          console.log(`🔍 Loading profile for: ${address}`)
          const profile = await encryptedStorage.getDecryptedProfile(address)

          if (profile) {
            const user = await convertProfileToUser(profile)
            convertedUsers.push(user)
            console.log(`✅ Successfully loaded profile for: ${address}`)
          } else {
            console.warn(`⚠️ No profile data found for: ${address}`)
          }
        } catch (error) {
          console.warn(`⚠️ Failed to load profile ${address}:`, error)
          // Continue with other profiles
        }
      }

      console.log(`✅ Successfully converted ${convertedUsers.length} users`)
      setUsers(convertedUsers)

    } catch (error) {
      console.error('❌ Failed to load community users:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Failed to load community users: ${errorMessage}`)
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [])

  // Refresh users
  const refreshUsers = useCallback(async () => {
    await loadUsers()
  }, [loadUsers])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  return {
    users,
    isLoading,
    error,
    isInitialized,
    refreshUsers,
    clearError
  }
}
