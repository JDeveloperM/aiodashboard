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
  kycStatus: string
  joinDate: string
  lastActive: string
  rank: number
  score: number
  metrics: Record<string, any>
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
}

export interface LeaderboardResponse {
  users: LeaderboardUser[]
  totalCount: number
  hasMore: boolean
  lastUpdated: string
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
    id: 'community',
    name: 'Top Community Members',
    description: 'Based on XP and achievement points',
    icon: 'Award',
    scoreField: 'total_xp',
    additionalMetrics: ['achievements_count', 'level_rewards', 'community_engagement']
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
  {
    id: 'overall',
    name: 'Overall Rankings',
    description: 'Combined scoring across all activities',
    icon: 'Trophy',
    scoreField: 'overall_score',
    additionalMetrics: ['total_xp', 'referral_count', 'trading_volume', 'achievements_count']
  }
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
      const { category, timePeriod, limit, offset } = filters

      // Generate cache key
      const cacheKey = `leaderboard:${category}:${timePeriod}:${limit}:${offset}`

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

      // Process and score users based on category
      const processedUsers: LeaderboardUser[] = (users || []).map((user, index) => {
        const username = this.decrypt(user.username_encrypted, user.address)
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

      const result: LeaderboardResponse = {
        users: sortedUsers,
        totalCount: count || 0,
        hasMore: (count || 0) > offset + limit,
        lastUpdated: new Date().toISOString()
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
