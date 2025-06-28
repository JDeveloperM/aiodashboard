import { createClient } from '@supabase/supabase-js'
import { encryptedStorage } from './encrypted-database-storage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface ForumUserData {
  address: string
  name: string // Display name (same as community page)
  username: string // @handle (same as community page)
  avatar?: string
  tier?: string
  level?: number
  kycStatus?: string
  location?: string
  socialMedia?: Array<{
    platform: string
    username?: string
    connected: boolean
    image: string
  }>
  achievements?: Array<{
    name: string
    unlocked: boolean
    image?: string
    color?: string
    tooltip?: string
  }>
  postCount: number
  replyCount: number
}

class ForumUserService {
  private userCache = new Map<string, ForumUserData>()
  private cacheExpiry = new Map<string, number>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  async getUserData(userAddress: string): Promise<ForumUserData> {
    // Check cache first
    const cached = this.userCache.get(userAddress)
    const expiry = this.cacheExpiry.get(userAddress)
    
    if (cached && expiry && Date.now() < expiry) {
      return cached
    }

    try {
      // Fetch user profile data (decrypted)
      const profile = await encryptedStorage.getDecryptedProfile(userAddress)

      // Also fetch public data for tier, level, etc.
      const { data: publicData } = await supabase
        .from('user_profiles')
        .select('role_tier, profile_level, kyc_status, profile_image_blob_id, achievements_data')
        .eq('address', userAddress)
        .single()

      // Fetch forum post count (standalone posts, not replies)
      const { count: postCount } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_address', userAddress)
        .eq('is_deleted', false)
        .not('title', 'like', 'Re:%')

      // Fetch forum reply count (posts that start with "Re:")
      const { count: replyCount } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_address', userAddress)
        .eq('is_deleted', false)
        .like('title', 'Re:%')

      // Get achievements from the public data (achievements_data JSONB column)
      const achievements = publicData?.achievements_data || []

      // Format social media data from decrypted profile
      const socialMedia: Array<{
        platform: string
        username: string
        connected: boolean
        image: string
      }> = []
      if (profile?.social_links && Array.isArray(profile.social_links)) {
        profile.social_links.forEach((link: any) => {
          if (link.platform === 'x' && link.username) {
            socialMedia.push({
              platform: 'X',
              username: link.username,
              connected: true,
              image: '/images/social/x.png'
            })
          }
          if (link.platform === 'discord' && link.username) {
            socialMedia.push({
              platform: 'Discord',
              username: link.username,
              connected: true,
              image: '/images/social/discord.png'
            })
          }
          if (link.platform === 'telegram' && link.username) {
            socialMedia.push({
              platform: 'Telegram',
              username: link.username,
              connected: true,
              image: '/images/social/telegram.png'
            })
          }
        })
      }

      // Format achievements data from JSONB (match profile page structure)
      const formattedAchievements = achievements
        .filter((ach: any) => ach.unlocked) // Show all unlocked achievements (claimed or not)
        .map((ach: any) => ({
          name: ach.name,
          unlocked: ach.unlocked,
          image: ach.image, // Some achievements have image paths
          icon: ach.icon,   // Some achievements have icon components
          color: ach.color,
          tooltip: ach.tooltip
        })) || []

      // Get avatar URL
      const avatarUrl = profile?.profile_image_blob_id
        ? await encryptedStorage.getAvatarUrl(userAddress)
        : null

      const userData: ForumUserData = {
        address: userAddress,
        name: profile?.username || `User ${userAddress.slice(0, 6)}`, // Display name
        username: profile?.username ? `@${profile.username.toLowerCase().replace(/\s+/g, '_')}` : `@${userAddress.slice(0, 8)}`, // @handle
        avatar: avatarUrl || undefined,
        tier: publicData?.role_tier || 'NOMAD',
        level: publicData?.profile_level || 1,
        kycStatus: publicData?.kyc_status || 'not_verified',
        location: profile?.location,
        socialMedia,
        achievements: formattedAchievements,
        postCount: postCount || 0,
        replyCount: replyCount || 0
      }

      // Cache the result
      this.userCache.set(userAddress, userData)
      this.cacheExpiry.set(userAddress, Date.now() + this.CACHE_DURATION)

      return userData

    } catch (error) {
      console.error('Error fetching user data for tooltip:', error)
      
      // Return minimal data on error
      return {
        address: userAddress,
        name: `User ${userAddress.slice(0, 6)}`,
        username: `@${userAddress.slice(0, 8)}`,
        avatar: undefined,
        tier: 'NOMAD',
        level: 1,
        kycStatus: 'not_verified',
        socialMedia: [],
        achievements: [],
        postCount: 0,
        replyCount: 0
      }
    }
  }

  // Preload user data for multiple users (for performance)
  async preloadUsers(userAddresses: string[]): Promise<void> {
    // For now, we'll skip preloading since it requires individual decryption
    // The tooltip will load data on-demand when hovered
    console.log(`📋 Skipping preload for ${userAddresses.length} users (will load on-demand)`)
  }

  // Clear cache for a specific user (useful when user data is updated)
  clearUserCache(userAddress: string): void {
    this.userCache.delete(userAddress)
    this.cacheExpiry.delete(userAddress)
  }

  // Clear all cache
  clearAllCache(): void {
    this.userCache.clear()
    this.cacheExpiry.clear()
  }
}

export const forumUserService = new ForumUserService()
