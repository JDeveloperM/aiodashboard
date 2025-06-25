/**
 * Leaderboard Service for Database Integration
 * Handles all leaderboard-related database operations with Supabase
 */

import { createClient } from '@supabase/supabase-js'
import CryptoJS from 'crypto-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    },
  }
)

// Types
export interface LeaderboardUser {
  address: string
  username: string
  profileImageUrl: string | null
  roleTier: 'NOMAD' | 'PRO' | 'ROYAL'
  profileLevel: number
  currentXp: number
  totalXp: number
  points: number
  location: string | null
  kycStatus: string
  joinDate: string
  lastActive: string
  rank: number
  score: number
  metrics: Record<string, any>
}

export interface CountryStats {
  code: string
  name: string
  flag: string
  rank: number
  members: number
  totalVolume: number
  totalActivity: number
  avgLevel: number
  topTier: 'NOMAD' | 'PRO' | 'ROYAL'
  metrics: {
    members: number
    volume: number
    activity: number
    avg_level: number
    top_tier: string
  }
}

export interface LeaderboardCategory {
  id: string
  name: string
  description: string
  icon: string
  scoreField: string
  additionalMetrics: string[]
}

export interface LeaderboardFilters {
  category: string
  timePeriod: 'weekly' | 'monthly' | 'all-time'
  limit: number
  offset: number
  locationFilter?: string
}

export interface LeaderboardResponse {
  users: LeaderboardUser[]
  countries?: CountryStats[]
  totalCount: number
  hasMore: boolean
  lastUpdated: string
  isCountryView?: boolean
}

// Leaderboard categories configuration
export const LEADERBOARD_CATEGORIES: LeaderboardCategory[] = [
  {
    id: 'affiliates',
    name: 'Top Affiliates',
    description: 'Based on referral count and commission earnings',
    icon: 'Users',
    scoreField: 'affiliate_score',
    additionalMetrics: ['referral_count', 'total_commissions', 'conversion_rate']
  },
  {
    id: 'traders',
    name: 'Top Traders',
    description: 'Based on trading volume and activity',
    icon: 'TrendingUp',
    scoreField: 'trading_score',
    additionalMetrics: ['trading_volume', 'trades_count', 'win_rate']
  },

  {
    id: 'xp',
    name: 'Top XP',
    description: 'Based on total experience points earned',
    icon: 'Zap',
    scoreField: 'total_xp',
    additionalMetrics: ['current_xp', 'profile_level', 'achievements_count']
  },
  {
    id: 'quiz',
    name: 'Quiz Champions',
    description: 'Based on RaffleQuiz participation and success',
    icon: 'Brain',
    scoreField: 'quiz_score',
    additionalMetrics: ['correct_answers', 'quiz_participation', 'tickets_minted']
  },
  {
    id: 'creators',
    name: 'Top Channel Creators',
    description: 'Based on channel creation and engagement',
    icon: 'Video',
    scoreField: 'creator_score',
    additionalMetrics: ['channels_created', 'subscribers', 'engagement_rate']
  },

]

class LeaderboardService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private readonly CACHE_TTL = {
    leaderboard: 5 * 60 * 1000, // 5 minutes
    stats: 10 * 60 * 1000,      // 10 minutes
  }

  /**
   * Generate encryption key from user's wallet address
   */
  private generateEncryptionKey(address: string): string {
    const appSecret = process.env.NEXT_PUBLIC_ENCRYPTION_SALT || 'your-app-secret-salt'
    return CryptoJS.SHA256(address + appSecret).toString()
  }

  /**
   * Get cached data if available and not expired
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  /**
   * Set data in cache with TTL
   */
  private setCachedData(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Clear cache for specific key or all cache
   */
  public clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  /**
   * Decrypt encrypted field
   */
  private decrypt(encryptedData: string, address: string): string {
    try {
      const key = this.generateEncryptionKey(address)
      const bytes = CryptoJS.AES.decrypt(encryptedData, key)
      return bytes.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('Decryption failed:', error)
      return ''
    }
  }

  /**
   * Get Walrus image URL from blob ID
   */
  private getWalrusImageUrl(blobId: string | null): string | null {
    if (!blobId) return null
    return `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`
  }

  /**
   * Calculate affiliate score based on referrals and commissions
   */
  private calculateAffiliateScore(referralData: any): number {
    const referralCount = referralData?.referral_count || 0
    const totalCommissions = referralData?.total_commissions || 0
    const conversionRate = referralData?.conversion_rate || 0
    
    // Weighted scoring: referrals (40%) + commissions (40%) + conversion rate (20%)
    return Math.round(
      (referralCount * 10) + 
      (totalCommissions * 5) + 
      (conversionRate * 100)
    )
  }

  /**
   * Calculate trading score (placeholder - would need actual trading data)
   */
  private calculateTradingScore(userData: any): number {
    // Placeholder calculation - would integrate with actual trading data
    const level = userData.profile_level || 1
    const xp = userData.total_xp || 0
    return Math.round((level * 50) + (xp * 0.1))
  }

  /**
   * Calculate quiz score based on RaffleQuiz participation
   */
  private calculateQuizScore(userData: any): number {
    // This would integrate with the quiz_questions and user_quiz_attempts tables
    const level = userData.profile_level || 1
    const xp = userData.total_xp || 0
    return Math.round((level * 30) + (xp * 0.05))
  }

  /**
   * Calculate creator score (placeholder - would need creator data)
   */
  private calculateCreatorScore(userData: any): number {
    // Placeholder - would integrate with creators table
    const level = userData.profile_level || 1
    const xp = userData.total_xp || 0
    return Math.round((level * 40) + (xp * 0.08))
  }

  /**
   * Calculate overall score combining all activities
   */
  private calculateOverallScore(userData: any, affiliateScore: number, tradingScore: number, quizScore: number, creatorScore: number): number {
    const xp = userData.total_xp || 0
    const level = userData.profile_level || 1
    
    return Math.round(
      (xp * 0.3) + 
      (level * 100) + 
      (affiliateScore * 0.2) + 
      (tradingScore * 0.2) + 
      (quizScore * 0.15) + 
      (creatorScore * 0.15)
    )
  }

  /**
   * Get leaderboard data for a specific category
   */
  async getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardResponse> {
    try {
      const { category, timePeriod, limit, offset, locationFilter = 'all' } = filters

      // Always fetch country stats for sidebar (top 10)
      const normalizedCategory = category === 'all' ? 'overall' : category
      const countryStatsPromise = this.getCountryStats(normalizedCategory, timePeriod, 0, 10)

      // If locationFilter is 'all', show all users (no location filtering)
      // Countries will be shown in the sidebar only

      // Generate cache key
      const cacheKey = `leaderboard:${category}:${timePeriod}:${limit}:${offset}:${locationFilter}`

      // Check cache first
      const cachedData = this.getCachedData<LeaderboardResponse>(cacheKey)
      if (cachedData) {
        return cachedData
      }
      
      // Base query for user profiles with referral data
      let query = supabase
        .from('user_profiles')
        .select(`
          address,
          username_encrypted,
          profile_image_blob_id,
          role_tier,
          profile_level,
          current_xp,
          total_xp,
          points,
          location_encrypted,
          kyc_status,
          join_date,
          last_active,
          referral_data,
          achievements_data
        `)
        .not('username_encrypted', 'is', null)

      // Apply initial ordering based on category
      if (category === 'xp' || category === 'community') {
        query = query.order('total_xp', { ascending: false })
      } else if (category === 'affiliates') {
        query = query.order('total_xp', { ascending: false }) // Will be re-sorted by affiliate score
      } else {
        query = query.order('total_xp', { ascending: false }) // Default ordering, will be re-sorted
      }

      // Apply time period filtering if needed
      if (timePeriod !== 'all-time') {
        const now = new Date()
        let startDate: Date
        
        if (timePeriod === 'weekly') {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        } else { // monthly
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
        
        query = query.gte('last_active', startDate.toISOString())
      }

      const { data: users, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Filter users by location if specific location is selected
      let filteredUsers = users || []
      if (locationFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => {
          if (!user.location_encrypted) return false
          try {
            const userLocation = this.decrypt(user.location_encrypted, user.address)
            // Match by location code or name
            return userLocation && (
              userLocation.toLowerCase() === locationFilter.toLowerCase() ||
              userLocation.toLowerCase().includes(locationFilter.toLowerCase())
            )
          } catch (error) {
            return false
          }
        })
      }

      // Process and score users based on category
      const processedUsers: LeaderboardUser[] = filteredUsers.map((user, index) => {
        const username = this.decrypt(user.username_encrypted, user.address)
        const location = user.location_encrypted ? this.decrypt(user.location_encrypted, user.address) : null
        const profileImageUrl = this.getWalrusImageUrl(user.profile_image_blob_id)
        
        // Calculate scores based on category
        const affiliateScore = this.calculateAffiliateScore(user.referral_data)
        const tradingScore = this.calculateTradingScore(user)
        const quizScore = this.calculateQuizScore(user)
        const creatorScore = this.calculateCreatorScore(user)
        const overallScore = this.calculateOverallScore(user, affiliateScore, tradingScore, quizScore, creatorScore)
        
        let score: number
        let metrics: Record<string, any> = {}
        
        switch (category) {
          case 'affiliates':
            score = affiliateScore
            metrics = {
              referral_count: user.referral_data?.referral_count || 0,
              total_commissions: user.referral_data?.total_commissions || 0,
              conversion_rate: user.referral_data?.conversion_rate || 0
            }
            break
          case 'traders':
            score = tradingScore
            metrics = {
              trading_volume: 0, // Placeholder
              trades_count: 0,   // Placeholder
              win_rate: 0        // Placeholder
            }
            break
          case 'community':
            score = user.total_xp
            metrics = {
              achievements_count: user.achievements_data?.length || 0,
              level_rewards: user.profile_level * 100,
              community_engagement: user.total_xp
            }
            break
          case 'xp':
            score = user.total_xp
            metrics = {
              current_xp: user.current_xp,
              profile_level: user.profile_level,
              achievements_count: user.achievements_data?.length || 0
            }
            break
          case 'quiz':
            score = quizScore
            metrics = {
              correct_answers: 0,     // Would need quiz data
              quiz_participation: 0,  // Would need quiz data
              tickets_minted: 0       // Would need raffle data
            }
            break
          case 'creators':
            score = creatorScore
            metrics = {
              channels_created: 0,  // Would need creator data
              subscribers: 0,       // Would need creator data
              engagement_rate: 0    // Would need creator data
            }
            break
          case 'overall':
          default:
            score = overallScore
            metrics = {
              total_xp: user.total_xp,
              referral_count: user.referral_data?.referral_count || 0,
              trading_volume: 0,
              achievements_count: user.achievements_data?.length || 0
            }
            break
        }
        
        return {
          address: user.address,
          username: username || 'Anonymous',
          profileImageUrl,
          roleTier: user.role_tier,
          profileLevel: user.profile_level,
          currentXp: user.current_xp,
          totalXp: user.total_xp,
          points: user.points || 0,
          location,
          kycStatus: user.kyc_status,
          joinDate: user.join_date,
          lastActive: user.last_active,
          rank: offset + index + 1,
          score,
          metrics
        }
      })

      // Sort by score (descending) and reassign ranks
      const sortedUsers = processedUsers
        .sort((a, b) => b.score - a.score)
        .map((user, index) => ({
          ...user,
          rank: offset + index + 1
        }))

      // Get country stats for sidebar
      const countryStats = await countryStatsPromise

      const result: LeaderboardResponse = {
        users: sortedUsers,
        countries: countryStats.countries,
        totalCount: count || 0,
        hasMore: (count || 0) > offset + limit,
        lastUpdated: new Date().toISOString(),
        isCountryView: false
      }

      // Cache the result
      this.setCachedData(cacheKey, result, this.CACHE_TTL.leaderboard)

      return result
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      throw error
    }
  }

  /**
   * Get leaderboard statistics
   */
  async getLeaderboardStats(): Promise<Record<string, any>> {
    try {
      // Check cache first
      const cacheKey = 'leaderboard:stats'
      const cachedStats = this.getCachedData<Record<string, any>>(cacheKey)
      if (cachedStats) {
        return cachedStats
      }
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role_tier, profile_level, total_xp, referral_data')
        .not('username_encrypted', 'is', null)

      if (error) throw error

      const stats = {
        totalUsers: data?.length || 0,
        tierDistribution: {
          NOMAD: 0,
          PRO: 0,
          ROYAL: 0
        },
        averageLevel: 0,
        totalXP: 0,
        totalReferrals: 0
      }

      data?.forEach(user => {
        stats.tierDistribution[user.role_tier as keyof typeof stats.tierDistribution]++
        stats.totalXP += user.total_xp || 0
        stats.totalReferrals += user.referral_data?.referral_count || 0
      })

      stats.averageLevel = data?.reduce((sum, user) => sum + (user.profile_level || 0), 0) / (data?.length || 1)

      // Cache the stats
      this.setCachedData(cacheKey, stats, this.CACHE_TTL.stats)

      return stats
    } catch (error) {
      console.error('Failed to fetch leaderboard stats:', error)
      return {}
    }
  }

  /**
   * Get country statistics for country-level leaderboard
   */
  async getCountryStats(
    category: string = 'overall',
    timePeriod: 'weekly' | 'monthly' | 'all-time' = 'all-time',
    offset: number = 0,
    limit: number = 20
  ): Promise<LeaderboardResponse> {
    try {
      // Get all users with their locations and metrics
      let query = supabase
        .from('user_profiles')
        .select(`
          address,
          username_encrypted,
          profile_image_blob_id,
          role_tier,
          profile_level,
          current_xp,
          total_xp,
          points,
          location_encrypted,
          kyc_status,
          join_date,
          last_active,
          referral_data,
          achievements_data
        `)
        .not('username_encrypted', 'is', null)
        .not('location_encrypted', 'is', null)

      const { data: users, error } = await query

      if (error) throw error



      // Group users by country and calculate statistics
      const countryMap = new Map<string, {
        users: any[]
        totalVolume: number
        totalActivity: number
        totalXp: number
        totalPoints: number
        tierCounts: Record<string, number>
      }>()

      users?.forEach(user => {
        if (user.location_encrypted) {
          try {
            const location = this.decrypt(user.location_encrypted, user.address)
            if (location) {
              if (!countryMap.has(location)) {
                countryMap.set(location, {
                  users: [],
                  totalVolume: 0,
                  totalActivity: 0,
                  totalXp: 0,
                  totalPoints: 0,
                  tierCounts: { NOMAD: 0, PRO: 0, ROYAL: 0 }
                })
              }

              const countryData = countryMap.get(location)!
              countryData.users.push(user)
              countryData.totalXp += user.total_xp || 0
              countryData.totalPoints += user.points || 0
              countryData.tierCounts[user.role_tier] = (countryData.tierCounts[user.role_tier] || 0) + 1

              // Calculate volume and activity based on user data
              const referralData = user.referral_data ? JSON.parse(user.referral_data) : {}
              const achievementsData = user.achievements_data ? JSON.parse(user.achievements_data) : {}

              // Volume calculation (based on category)
              switch (category) {
                case 'affiliates':
                  countryData.totalVolume += (referralData.total_commissions || 0)
                  break
                case 'traders':
                  countryData.totalVolume += (user.points || 0) // Use points as trading volume proxy
                  break
                case 'xp':
                  countryData.totalVolume += (user.total_xp || 0)
                  break
                case 'quiz':
                  countryData.totalVolume += (achievementsData.quiz_score || user.current_xp || 0)
                  break
                case 'creators':
                  countryData.totalVolume += (achievementsData.channels_created || 0) * 1000
                  break
                default:
                  countryData.totalVolume += (user.total_xp || 0) + (referralData.total_commissions || 0) * 10
              }

              // Activity calculation
              countryData.totalActivity += (achievementsData.achievements_count || 0) + (user.current_xp || 0) / 100
            }
          } catch (error) {
            // Skip if decryption fails
          }
        }
      })

      // Import locations data for flags
      const { LOCATIONS, getLocationByCode } = await import('./locations')

      // Convert to CountryStats array
      const countries: CountryStats[] = Array.from(countryMap.entries()).map(([locationName, data], index) => {
        // Find matching location for flag
        const location = LOCATIONS.find(l =>
          l.name.toLowerCase() === locationName.toLowerCase() ||
          locationName.toLowerCase().includes(l.name.toLowerCase()) ||
          l.name.toLowerCase().includes(locationName.toLowerCase())
        )

        // Determine top tier
        const topTier = data.tierCounts.ROYAL > 0 ? 'ROYAL' :
                      data.tierCounts.PRO > 0 ? 'PRO' : 'NOMAD'

        return {
          code: location?.code || locationName.toLowerCase().replace(/\s+/g, '_'),
          name: locationName,
          flag: location?.flag || '🌍',
          rank: index + 1,
          members: data.users.length,
          totalVolume: Math.round(data.totalVolume),
          totalActivity: Math.round(data.totalActivity),
          avgLevel: data.users.length > 0 ? Math.round(data.totalXp / data.users.length / 1000) : 0,
          topTier,
          metrics: {
            members: data.users.length,
            volume: Math.round(data.totalVolume),
            activity: Math.round(data.totalActivity),
            avg_level: data.users.length > 0 ? Math.round(data.totalXp / data.users.length / 1000) : 0,
            top_tier: topTier
          }
        }
      })

      // Sort countries based on category
      countries.sort((a, b) => {
        switch (category) {
          case 'affiliates':
            return b.totalVolume - a.totalVolume
          case 'traders':
            return b.totalActivity - a.totalActivity
          case 'xp':
            return b.avgLevel - a.avgLevel
          case 'quiz':
            return b.totalActivity - a.totalActivity
          case 'creators':
            return b.totalVolume - a.totalVolume
          case 'all':
          default:
            return b.members - a.members // Default: sort by member count
        }
      })

      // Reassign ranks after sorting
      countries.forEach((country, index) => {
        country.rank = index + 1
      })

      // Apply pagination
      const paginatedCountries = countries.slice(offset, offset + limit)

      return {
        users: [], // Empty for country view
        countries: paginatedCountries,
        totalCount: countries.length,
        hasMore: countries.length > offset + limit,
        lastUpdated: new Date().toISOString(),
        isCountryView: true
      }

    } catch (error) {
      console.error('Failed to fetch country stats:', error)
      throw error
    }
  }

  /**
   * Get available locations from database (based on user locations)
   */
  async getAvailableLocations(): Promise<Array<{code: string, name: string, flag: string, count: number}>> {
    try {
      // Get all unique encrypted locations from user profiles
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('location_encrypted, address')
        .not('location_encrypted', 'is', null)
        .not('username_encrypted', 'is', null)

      if (error) throw error

      // Decrypt locations and count occurrences
      const locationCounts = new Map<string, number>()

      users?.forEach(user => {
        if (user.location_encrypted) {
          try {
            const decryptedLocation = this.decrypt(user.location_encrypted, user.address)
            if (decryptedLocation) {
              const currentCount = locationCounts.get(decryptedLocation) || 0
              locationCounts.set(decryptedLocation, currentCount + 1)
            }
          } catch (error) {
            // Skip if decryption fails
            console.warn('Failed to decrypt location for user:', user.address)
          }
        }
      })

      // Import locations data and match with database locations
      const { LOCATIONS, getLocationByCode } = await import('./locations')

      const availableLocations: Array<{code: string, name: string, flag: string, count: number}> = []

      locationCounts.forEach((count, locationName) => {
        // Try to find matching location by name (fuzzy matching)
        const location = LOCATIONS.find(l =>
          l.name.toLowerCase() === locationName.toLowerCase() ||
          l.code.toLowerCase() === locationName.toLowerCase() ||
          locationName.toLowerCase().includes(l.name.toLowerCase()) ||
          l.name.toLowerCase().includes(locationName.toLowerCase())
        )

        if (location) {
          availableLocations.push({
            code: location.code,
            name: location.name,
            flag: location.flag,
            count
          })
        } else {
          // If no match found, create a generic entry
          availableLocations.push({
            code: locationName.toLowerCase().replace(/\s+/g, '_'),
            name: locationName,
            flag: '🌍',
            count
          })
        }
      })

      // Sort by count (descending) then by name
      return availableLocations.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count
        return a.name.localeCompare(b.name)
      })

    } catch (error) {
      console.error('Failed to fetch available locations:', error)
      return []
    }
  }

  /**
   * Preload leaderboard data for better performance
   */
  async preloadLeaderboards(): Promise<void> {
    const categories = ['overall', 'community', 'xp', 'affiliates']
    const timePeriods: Array<'weekly' | 'monthly' | 'all-time'> = ['all-time', 'monthly']

    const preloadPromises = categories.flatMap(category =>
      timePeriods.map(timePeriod =>
        this.getLeaderboard({
          category,
          timePeriod,
          limit: 20,
          offset: 0
        }).catch(error => {
          console.warn(`Failed to preload ${category}:${timePeriod}:`, error)
        })
      )
    )

    await Promise.allSettled(preloadPromises)
  }

  /**
   * Get optimized user count for pagination
   */
  async getUserCount(category: string, timePeriod: string): Promise<number> {
    try {
      const cacheKey = `usercount:${category}:${timePeriod}`
      const cachedCount = this.getCachedData<number>(cacheKey)
      if (cachedCount !== null) {
        return cachedCount
      }

      let query = supabase
        .from('user_profiles')
        .select('address', { count: 'exact', head: true })
        .not('username_encrypted', 'is', null)

      // Apply time period filtering
      if (timePeriod !== 'all-time') {
        const now = new Date()
        let startDate: Date

        if (timePeriod === 'weekly') {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        } else {
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }

        query = query.gte('last_active', startDate.toISOString())
      }

      const { count, error } = await query

      if (error) throw error

      const userCount = count || 0
      this.setCachedData(cacheKey, userCount, this.CACHE_TTL.leaderboard)

      return userCount
    } catch (error) {
      console.error('Failed to get user count:', error)
      return 0
    }
  }
}

export const leaderboardService = new LeaderboardService()
