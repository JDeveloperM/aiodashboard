/**
 * Affiliate Service for Database Integration
 * Handles all affiliate-related database operations with Supabase and Walrus storage
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

// Types for affiliate system
export interface AffiliateUser {
  id: string
  username: string
  email: string
  joinDate: string
  status: 'NOMAD' | 'PRO' | 'ROYAL'
  commission: number
  kycStatus: 'verified' | 'pending' | 'not_verified'
  profileLevel: number // Profile/Account level based on XP
  affiliateLevel: number // Affiliate level in the system
  address: string
}

export interface AffiliateMetrics {
  totalUsers: number
  nomadUsers: number
  proUsers: number
  royalUsers: number
  level5Users: number
  level6Users: number
  level7Users: number
  level8Users: number
  level9Users: number
  level10Users: number
}

export interface AffiliateFilters {
  searchTerm?: string
  roleFilter?: 'ALL' | 'NOMAD' | 'PRO' | 'ROYAL'
  levelFilter?: 'ALL' | 'Lv. 5' | 'Lv. 6' | 'Lv. 7' | 'Lv. 8' | 'Lv. 9' | 'Lv. 10'
  limit?: number
  offset?: number
}

export interface CommissionData {
  totalCommissions: number
  tierBreakdown: {
    nomadCommissions: number
    proCommissions: number
    royalCommissions: number
  }
  typeBreakdown: {
    signupCommissions: number
    subscriptionCommissions: number
    purchaseCommissions: number
    tradingFeeCommissions: number
    otherCommissions: number
  }
  recentTransactions: CommissionTransaction[]
}

export interface CommissionTransaction {
  id: string
  amount: number
  commissionType: 'signup' | 'subscription' | 'purchase' | 'trading_fee' | 'other'
  earnedAt: string
  affiliateUsername: string
  affiliateAddress: string
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled'
}

class AffiliateService {
  /**
   * Calculate affiliate level based on user criteria
   * This can be customized based on your business logic
   */
  private calculateAffiliateLevel(totalXp: number, profileLevel: number, roleTier: string): number {
    // Example logic - you can customize this based on your requirements
    if (roleTier === 'ROYAL' && profileLevel >= 8) return 10
    if (roleTier === 'ROYAL' && profileLevel >= 6) return 9
    if (roleTier === 'PRO' && profileLevel >= 7) return 8
    if (roleTier === 'PRO' && profileLevel >= 5) return 7
    if (profileLevel >= 6) return 6
    if (profileLevel >= 4) return 5
    if (profileLevel >= 3) return 4
    if (profileLevel >= 2) return 3
    if (profileLevel >= 1) return 2
    return 1
  }

  /**
   * Generate encryption key from user's wallet address
   */
  private generateEncryptionKey(address: string): string {
    const appSecret = process.env.NEXT_PUBLIC_ENCRYPTION_SALT || 'your-app-secret-salt'
    return CryptoJS.SHA256(address + appSecret).toString()
  }

  /**
   * Decrypt encrypted field or return plain text if not encrypted
   */
  private decrypt(encryptedData: string | null, address: string): string {
    if (!encryptedData) return ''

    // Check if the data looks like it's encrypted (contains special characters typical of encrypted data)
    // If it looks like plain text, return it as-is
    if (!encryptedData.includes('U2FsdGVkX1') && !encryptedData.includes('=') && encryptedData.length < 100) {
      return encryptedData // Return plain text as-is
    }

    try {
      const key = this.generateEncryptionKey(address)
      const bytes = CryptoJS.AES.decrypt(encryptedData, key)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)

      // If decryption results in empty string, the data might be plain text
      if (!decrypted) {
        return encryptedData
      }

      return decrypted
    } catch (error) {
      console.error('Decryption failed, treating as plain text:', error)
      return encryptedData // Return original data if decryption fails
    }
  }

  /**
   * Get affiliate metrics for a specific referrer (user counts by tier)
   */
  async getAffiliateMetrics(referrerAddress: string): Promise<AffiliateMetrics> {
    try {
      console.log('🔍 Fetching affiliate metrics for:', referrerAddress)

      // Step 1: Get all affiliate relationships for this referrer
      const { data: relationships, error: relationshipsError } = await supabase
        .from('affiliate_relationships')
        .select('referee_address')
        .eq('referrer_address', referrerAddress)
        .eq('relationship_status', 'active')

      if (relationshipsError) {
        console.error('Error fetching relationships:', relationshipsError)
        throw relationshipsError
      }

      if (!relationships || relationships.length === 0) {
        console.log('No affiliate relationships found')
        return {
          totalUsers: 0,
          nomadUsers: 0,
          proUsers: 0,
          royalUsers: 0,
          level5Users: 0,
          level6Users: 0,
          level7Users: 0,
          level8Users: 0,
          level9Users: 0,
          level10Users: 0
        }
      }

      // Step 2: Get user profiles for all referred users
      const refereeAddresses = relationships.map(rel => rel.referee_address)
      console.log(`Found ${refereeAddresses.length} affiliate relationships`)

      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('address, role_tier, profile_level')
        .in('address', refereeAddresses)

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError)
        throw profilesError
      }

      if (!userProfiles || userProfiles.length === 0) {
        console.log('No user profiles found for affiliate relationships')
        return {
          totalUsers: 0,
          nomadUsers: 0,
          proUsers: 0,
          royalUsers: 0,
          level5Users: 0,
          level6Users: 0,
          level7Users: 0,
          level8Users: 0,
          level9Users: 0,
          level10Users: 0
        }
      }

      // Step 3: Count users by tier and level
      const totalUsers = userProfiles.length
      const nomadUsers = userProfiles.filter(user => user.role_tier === 'NOMAD').length
      const proUsers = userProfiles.filter(user => user.role_tier === 'PRO').length
      const royalUsers = userProfiles.filter(user => user.role_tier === 'ROYAL').length

      // Count users by specific levels (5-10)
      const level5Users = userProfiles.filter(user => user.profile_level === 5).length
      const level6Users = userProfiles.filter(user => user.profile_level === 6).length
      const level7Users = userProfiles.filter(user => user.profile_level === 7).length
      const level8Users = userProfiles.filter(user => user.profile_level === 8).length
      const level9Users = userProfiles.filter(user => user.profile_level === 9).length
      const level10Users = userProfiles.filter(user => user.profile_level === 10).length

      const metrics: AffiliateMetrics = {
        totalUsers,
        nomadUsers,
        proUsers,
        royalUsers,
        level5Users,
        level6Users,
        level7Users,
        level8Users,
        level9Users,
        level10Users
      }

      console.log('📊 Affiliate metrics by tier:', metrics)
      return metrics

    } catch (error) {
      console.error('Failed to get affiliate metrics:', error)
      return {
        totalUsers: 0,
        nomadUsers: 0,
        proUsers: 0,
        royalUsers: 0,
        level5Users: 0,
        level6Users: 0,
        level7Users: 0,
        level8Users: 0,
        level9Users: 0,
        level10Users: 0
      }
    }
  }

  /**
   * Get affiliate users with filtering and pagination
   */
  async getAffiliateUsers(
    referrerAddress: string,
    filters: AffiliateFilters = {}
  ): Promise<{ users: AffiliateUser[], totalCount: number }> {
    try {
      console.log('🔍 Fetching affiliate users for:', referrerAddress, 'with filters:', filters)

      // Step 1: Get affiliate relationships
      const { data: relationships, error: relError } = await supabase
        .from('affiliate_relationships')
        .select('id, referee_address, created_at')
        .eq('referrer_address', referrerAddress)
        .eq('relationship_status', 'active')
        .order('created_at', { ascending: false })

      if (relError) {
        console.error('Error fetching relationships:', relError)
        throw relError
      }

      if (!relationships || relationships.length === 0) {
        console.log('No affiliate relationships found')
        return { users: [], totalCount: 0 }
      }

      console.log(`Found ${relationships.length} affiliate relationships`)

      // Step 2: Get user profiles for these addresses
      const refereeAddresses = relationships.map(rel => rel.referee_address)

      let profileQuery = supabase
        .from('user_profiles')
        .select('address, username_encrypted, email_encrypted, role_tier, profile_level, kyc_status, join_date, total_xp')
        .in('address', refereeAddresses)

      // Apply role filter
      if (filters.roleFilter && filters.roleFilter !== 'ALL') {
        profileQuery = profileQuery.eq('role_tier', filters.roleFilter)
      }

      // Note: Level filtering is now done client-side based on affiliate levels
      // No database filtering needed for affiliate levels since they're calculated dynamically

      const { data: profiles, error: profileError } = await profileQuery

      if (profileError) {
        console.error('Error fetching profiles:', profileError)
        throw profileError
      }

      console.log(`Found ${profiles?.length || 0} user profiles`)

      if (!profiles || profiles.length === 0) {
        return { users: [], totalCount: 0 }
      }

      // Step 3: Get commissions for these relationships
      const relationshipIds = relationships.map(rel => rel.id)
      const { data: commissions, error: commError } = await supabase
        .from('affiliate_commissions')
        .select('affiliate_relationship_id, commission_amount')
        .in('affiliate_relationship_id', relationshipIds)
        .in('status', ['confirmed', 'paid'])

      if (commError) {
        console.error('Error fetching commissions:', commError)
        // Don't throw error, just continue without commission data
      }

      console.log(`Found ${commissions?.length || 0} commissions`)

      // Step 4: Combine the data
      const users: AffiliateUser[] = []

      for (const relationship of relationships) {
        const profile = profiles.find(p => p.address === relationship.referee_address)
        if (!profile) continue // Skip if profile not found or filtered out

        // Calculate total commission for this relationship
        const relationshipCommissions = commissions?.filter(c => c.affiliate_relationship_id === relationship.id) || []
        const totalCommission = relationshipCommissions.reduce((sum, comm) =>
          sum + parseFloat(comm.commission_amount.toString()), 0
        )

        const username = this.decrypt(profile.username_encrypted, profile.address) || `User_${profile.address.slice(0, 8)}`
        const email = this.decrypt(profile.email_encrypted, profile.address) || `${profile.address.slice(0, 8)}@example.com`

        // Calculate affiliate level based on user criteria
        const profileLevel = profile.profile_level || 1
        const affiliateLevel = this.calculateAffiliateLevel(
          profile.total_xp || 0,
          profileLevel,
          profile.role_tier
        )

        console.log(`Processing user ${profile.address}: username="${username}", email="${email}", profileLevel=${profileLevel}, affiliateLevel=${affiliateLevel}`)

        users.push({
          id: relationship.id,
          address: profile.address,
          username,
          email,
          joinDate: profile.join_date || relationship.created_at,
          status: profile.role_tier as 'NOMAD' | 'PRO' | 'ROYAL',
          commission: Math.round(totalCommission),
          kycStatus: profile.kyc_status as 'verified' | 'pending' | 'not_verified',
          profileLevel,
          affiliateLevel
        })
      }

      // Apply search filter on decrypted data
      let filteredUsers = users
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        filteredUsers = users.filter(user =>
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        )
      }

      // Apply pagination
      let paginatedUsers = filteredUsers
      if (filters.limit) {
        const start = filters.offset || 0
        paginatedUsers = filteredUsers.slice(start, start + filters.limit)
      }

      console.log(`Returning ${paginatedUsers.length} users out of ${filteredUsers.length} total`)

      return {
        users: paginatedUsers,
        totalCount: filteredUsers.length
      }

    } catch (error) {
      console.error('Failed to get affiliate users:', error)
      return { users: [], totalCount: 0 }
    }
  }

  /**
   * Get total count of affiliate users for pagination
   */
  async getAffiliateUsersCount(referrerAddress: string, filters: AffiliateFilters = {}): Promise<number> {
    try {
      let query = supabase
        .from('affiliate_relationships')
        .select('id', { count: 'exact', head: true })
        .eq('referrer_address', referrerAddress)
        .eq('relationship_status', 'active')

      // Apply role filter
      if (filters.roleFilter && filters.roleFilter !== 'ALL') {
        query = query.eq('user_profiles.role_tier', filters.roleFilter)
      }

      // Apply level filter  
      if (filters.levelFilter && filters.levelFilter !== 'ALL') {
        const [minLevel, maxLevel] = filters.levelFilter.split('-').map(Number)
        query = query.gte('user_profiles.profile_level', minLevel)
        query = query.lte('user_profiles.profile_level', maxLevel)
      }

      const { count, error } = await query

      if (error) {
        console.error('Error getting affiliate users count:', error)
        return 0
      }

      return count || 0

    } catch (error) {
      console.error('Failed to get affiliate users count:', error)
      return 0
    }
  }

  /**
   * Create a new affiliate relationship
   */
  async createAffiliateRelationship(
    referrerAddress: string,
    refereeAddress: string,
    referralCode?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('affiliate_relationships')
        .insert({
          referrer_address: referrerAddress,
          referee_address: refereeAddress,
          referral_code: referralCode,
          relationship_status: 'active',
          referral_source: 'referral_link'
        })

      if (error) {
        console.error('Error creating affiliate relationship:', error)
        return false
      }

      return true

    } catch (error) {
      console.error('Failed to create affiliate relationship:', error)
      return false
    }
  }

  /**
   * Record a commission for an affiliate
   */
  async recordCommission(
    referrerAddress: string,
    refereeAddress: string,
    amount: number,
    type: string = 'subscription',
    transactionId?: string
  ): Promise<boolean> {
    try {
      // First get the relationship ID
      const { data: relationship, error: relationshipError } = await supabase
        .from('affiliate_relationships')
        .select('id')
        .eq('referrer_address', referrerAddress)
        .eq('referee_address', refereeAddress)
        .single()

      if (relationshipError || !relationship) {
        console.error('Affiliate relationship not found:', relationshipError)
        return false
      }

      const { error } = await supabase
        .from('affiliate_commissions')
        .insert({
          affiliate_relationship_id: relationship.id,
          referrer_address: referrerAddress,
          referee_address: refereeAddress,
          commission_amount: amount,
          commission_type: type,
          commission_rate: 0.25, // 25%
          transaction_id: transactionId,
          status: 'confirmed'
        })

      if (error) {
        console.error('Error recording commission:', error)
        return false
      }

      return true

    } catch (error) {
      console.error('Failed to record commission:', error)
      return false
    }
  }

  /**
   * Get sponsor information for a user (the person who referred them)
   */
  async getSponsorInfo(userAddress: string): Promise<AffiliateUser | null> {
    try {
      console.log('🔍 Fetching sponsor info for user:', userAddress)

      // Step 1: Find the relationship where this user is the referee
      const { data: relationship, error: relError } = await supabase
        .from('affiliate_relationships')
        .select('referrer_address, created_at')
        .eq('referee_address', userAddress)
        .eq('relationship_status', 'active')
        .single()

      if (relError || !relationship) {
        console.log('No sponsor relationship found for user')
        return null
      }

      console.log('Found sponsor relationship:', relationship.referrer_address)

      // Step 2: Get the sponsor's profile
      const { data: sponsorProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('address, username_encrypted, email_encrypted, role_tier, profile_level, kyc_status, join_date, total_xp')
        .eq('address', relationship.referrer_address)
        .single()

      if (profileError || !sponsorProfile) {
        console.error('Error fetching sponsor profile:', profileError)
        return null
      }

      console.log('Found sponsor profile')

      // Step 3: Decrypt sponsor data
      const username = this.decrypt(sponsorProfile.username_encrypted, sponsorProfile.address) || `Sponsor_${sponsorProfile.address.slice(0, 8)}`
      const email = this.decrypt(sponsorProfile.email_encrypted, sponsorProfile.address) || `${sponsorProfile.address.slice(0, 8)}@example.com`

      // Calculate sponsor's affiliate level
      const profileLevel = sponsorProfile.profile_level || 1
      const affiliateLevel = this.calculateAffiliateLevel(
        sponsorProfile.total_xp || 0,
        profileLevel,
        sponsorProfile.role_tier
      )

      const sponsorInfo: AffiliateUser = {
        id: relationship.referrer_address,
        address: sponsorProfile.address,
        username,
        email,
        joinDate: sponsorProfile.join_date,
        status: sponsorProfile.role_tier as 'NOMAD' | 'PRO' | 'ROYAL',
        commission: 0, // Not relevant for sponsor info
        kycStatus: sponsorProfile.kyc_status as 'verified' | 'pending' | 'not_verified',
        profileLevel,
        affiliateLevel
      }

      console.log('✅ Sponsor info retrieved successfully:', sponsorInfo)
      return sponsorInfo

    } catch (error) {
      console.error('Failed to get sponsor info:', error)
      return null
    }
  }

  /**
   * Get commission data for a specific referrer
   */
  async getCommissionData(referrerAddress: string): Promise<CommissionData> {
    try {
      console.log('🔍 Fetching commission data for:', referrerAddress)

      // Step 1: Get all commissions for this referrer
      const { data: commissions, error: commissionsError } = await supabase
        .from('affiliate_commissions')
        .select('id, commission_amount, commission_type, earned_at, referee_address, status')
        .eq('referrer_address', referrerAddress)
        .in('status', ['confirmed', 'paid'])
        .order('earned_at', { ascending: false })

      if (commissionsError) {
        console.error('Error fetching commissions:', commissionsError)
        throw commissionsError
      }

      if (!commissions || commissions.length === 0) {
        console.log('No commissions found')
        return {
          totalCommissions: 0,
          tierBreakdown: {
            nomadCommissions: 0,
            proCommissions: 0,
            royalCommissions: 0
          },
          typeBreakdown: {
            signupCommissions: 0,
            subscriptionCommissions: 0,
            purchaseCommissions: 0,
            tradingFeeCommissions: 0,
            otherCommissions: 0
          },
          recentTransactions: []
        }
      }

      console.log(`Found ${commissions.length} commissions`)

      // Step 2: Get user profiles for affiliate usernames
      const refereeAddresses = [...new Set(commissions.map(c => c.referee_address))]
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('address, username_encrypted, role_tier')
        .in('address', refereeAddresses)

      if (profilesError) {
        console.error('Error fetching user profiles for commissions:', profilesError)
        // Continue without usernames if profiles fail
      }

      // Step 3: Calculate total commissions
      const totalCommissions = commissions.reduce((sum, commission) =>
        sum + parseFloat(commission.commission_amount.toString()), 0
      )

      // Step 4: Calculate tier breakdown
      const tierBreakdown = {
        nomadCommissions: 0,
        proCommissions: 0,
        royalCommissions: 0
      }

      commissions.forEach(commission => {
        const userProfile = userProfiles?.find(p => p.address === commission.referee_address)
        const amount = parseFloat(commission.commission_amount.toString())

        if (userProfile) {
          switch (userProfile.role_tier) {
            case 'NOMAD':
              tierBreakdown.nomadCommissions += amount
              break
            case 'PRO':
              tierBreakdown.proCommissions += amount
              break
            case 'ROYAL':
              tierBreakdown.royalCommissions += amount
              break
          }
        }
      })

      // Step 5: Calculate type breakdown
      const typeBreakdown = {
        signupCommissions: 0,
        subscriptionCommissions: 0,
        purchaseCommissions: 0,
        tradingFeeCommissions: 0,
        otherCommissions: 0
      }

      commissions.forEach(commission => {
        const amount = parseFloat(commission.commission_amount.toString())

        switch (commission.commission_type) {
          case 'signup':
            typeBreakdown.signupCommissions += amount
            break
          case 'subscription':
            typeBreakdown.subscriptionCommissions += amount
            break
          case 'purchase':
            typeBreakdown.purchaseCommissions += amount
            break
          case 'trading_fee':
            typeBreakdown.tradingFeeCommissions += amount
            break
          default:
            typeBreakdown.otherCommissions += amount
            break
        }
      })

      // Step 6: Prepare recent transactions (last 10)
      const recentTransactions: CommissionTransaction[] = commissions.slice(0, 10).map(commission => {
        const userProfile = userProfiles?.find(p => p.address === commission.referee_address)
        const username = userProfile
          ? this.decrypt(userProfile.username_encrypted, userProfile.address) || `User_${userProfile.address.slice(0, 8)}`
          : `User_${commission.referee_address.slice(0, 8)}`

        return {
          id: commission.id,
          amount: parseFloat(commission.commission_amount.toString()),
          commissionType: commission.commission_type as 'signup' | 'subscription' | 'purchase' | 'trading_fee' | 'other',
          earnedAt: commission.earned_at,
          affiliateUsername: username,
          affiliateAddress: commission.referee_address,
          status: commission.status as 'pending' | 'confirmed' | 'paid' | 'cancelled'
        }
      })

      const commissionData: CommissionData = {
        totalCommissions: Math.round(totalCommissions),
        tierBreakdown: {
          nomadCommissions: Math.round(tierBreakdown.nomadCommissions),
          proCommissions: Math.round(tierBreakdown.proCommissions),
          royalCommissions: Math.round(tierBreakdown.royalCommissions)
        },
        typeBreakdown: {
          signupCommissions: Math.round(typeBreakdown.signupCommissions),
          subscriptionCommissions: Math.round(typeBreakdown.subscriptionCommissions),
          purchaseCommissions: Math.round(typeBreakdown.purchaseCommissions),
          tradingFeeCommissions: Math.round(typeBreakdown.tradingFeeCommissions),
          otherCommissions: Math.round(typeBreakdown.otherCommissions)
        },
        recentTransactions
      }

      console.log('📊 Commission data:', commissionData)
      return commissionData

    } catch (error) {
      console.error('Failed to get commission data:', error)
      return {
        totalCommissions: 0,
        tierBreakdown: {
          nomadCommissions: 0,
          proCommissions: 0,
          royalCommissions: 0
        },
        typeBreakdown: {
          signupCommissions: 0,
          subscriptionCommissions: 0,
          purchaseCommissions: 0,
          tradingFeeCommissions: 0,
          otherCommissions: 0
        },
        recentTransactions: []
      }
    }
  }
}

// Export singleton instance
export const affiliateService = new AffiliateService()
