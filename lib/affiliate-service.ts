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
  level: number
  address: string
}

export interface AffiliateMetrics {
  totalInvites: number
  newUsers: number
  totalCommission: number
  conversionRate: number
}

export interface AffiliateFilters {
  searchTerm?: string
  roleFilter?: 'ALL' | 'NOMAD' | 'PRO' | 'ROYAL'
  levelFilter?: 'ALL' | '1-3' | '4-6' | '7-10'
  limit?: number
  offset?: number
}

class AffiliateService {
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
   * Get affiliate metrics for a specific referrer
   */
  async getAffiliateMetrics(referrerAddress: string): Promise<AffiliateMetrics> {
    try {
      console.log('🔍 Fetching affiliate metrics for:', referrerAddress)

      // Get total invites (relationships)
      const { data: relationships, error: relationshipsError } = await supabase
        .from('affiliate_relationships')
        .select('id, created_at')
        .eq('referrer_address', referrerAddress)
        .eq('relationship_status', 'active')

      if (relationshipsError) {
        console.error('Error fetching relationships:', relationshipsError)
        throw relationshipsError
      }

      const totalInvites = relationships?.length || 0
      console.log(`Found ${totalInvites} total invites`)

      // Get new users (users who actually signed up)
      // First get the referee addresses from relationships
      const refereeAddresses = relationships?.map(rel => rel.referee_address) || []

      let newUsers = 0
      if (refereeAddresses.length > 0) {
        const { data: newUsersData, error: newUsersError } = await supabase
          .from('user_profiles')
          .select('address')
          .in('address', refereeAddresses)

        if (newUsersError) {
          console.error('Error fetching new users:', newUsersError)
          throw newUsersError
        }

        newUsers = newUsersData?.length || 0
      }

      // Get total commission
      const { data: commissions, error: commissionsError } = await supabase
        .from('affiliate_commissions')
        .select('commission_amount')
        .eq('referrer_address', referrerAddress)
        .in('status', ['confirmed', 'paid'])

      if (commissionsError) {
        console.error('Error fetching commissions:', commissionsError)
        throw commissionsError
      }

      const totalCommission = commissions?.reduce((sum, commission) => 
        sum + parseFloat(commission.commission_amount.toString()), 0
      ) || 0

      // Calculate conversion rate
      const conversionRate = totalInvites > 0 ? Math.round((newUsers / totalInvites) * 100) : 0

      const metrics: AffiliateMetrics = {
        totalInvites,
        newUsers,
        totalCommission: Math.round(totalCommission),
        conversionRate
      }

      console.log('📊 Affiliate metrics:', metrics)
      return metrics

    } catch (error) {
      console.error('Failed to get affiliate metrics:', error)
      return {
        totalInvites: 0,
        newUsers: 0,
        totalCommission: 0,
        conversionRate: 0
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
        .select('address, username_encrypted, email_encrypted, role_tier, profile_level, kyc_status, join_date')
        .in('address', refereeAddresses)

      // Apply role filter
      if (filters.roleFilter && filters.roleFilter !== 'ALL') {
        profileQuery = profileQuery.eq('role_tier', filters.roleFilter)
      }

      // Apply level filter
      if (filters.levelFilter && filters.levelFilter !== 'ALL') {
        const [minLevel, maxLevel] = filters.levelFilter.split('-').map(Number)
        profileQuery = profileQuery.gte('profile_level', minLevel)
        profileQuery = profileQuery.lte('profile_level', maxLevel)
      }

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

        console.log(`Processing user ${profile.address}: username="${username}", email="${email}"`)

        users.push({
          id: relationship.id,
          address: profile.address,
          username,
          email,
          joinDate: profile.join_date || relationship.created_at,
          status: profile.role_tier as 'NOMAD' | 'PRO' | 'ROYAL',
          commission: Math.round(totalCommission),
          kycStatus: profile.kyc_status as 'verified' | 'pending' | 'not_verified',
          level: profile.profile_level || 1
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
        .select('address, username_encrypted, email_encrypted, role_tier, profile_level, kyc_status, join_date')
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

      const sponsorInfo: AffiliateUser = {
        id: relationship.referrer_address,
        address: sponsorProfile.address,
        username,
        email,
        joinDate: sponsorProfile.join_date,
        status: sponsorProfile.role_tier as 'NOMAD' | 'PRO' | 'ROYAL',
        commission: 0, // Not relevant for sponsor info
        kycStatus: sponsorProfile.kyc_status as 'verified' | 'pending' | 'not_verified',
        level: sponsorProfile.profile_level || 1
      }

      console.log('✅ Sponsor info retrieved successfully:', sponsorInfo)
      return sponsorInfo

    } catch (error) {
      console.error('Failed to get sponsor info:', error)
      return null
    }
  }
}

// Export singleton instance
export const affiliateService = new AffiliateService()
