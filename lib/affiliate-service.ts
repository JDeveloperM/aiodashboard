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
  affiliateLevel: number // Affiliate level in the system (1-5)
  address: string
  sponsorAddress?: string // Address of the person who invited them
  sponsorUsername?: string // Username of the person who invited them
  referralCode?: string // The referral code used to join
  isDirect: boolean // True if this is a direct referral (Level 1)
  avatarBlobId?: string // Avatar blob ID for displaying user avatar
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

export interface NetworkMetrics {
  // Personal (direct referrals)
  personalNomadUsers: number
  personalProUsers: number
  personalRoyalUsers: number

  // Network (second-level referrals)
  networkNomadUsers: number
  networkProUsers: number
  networkRoyalUsers: number

  // Profile levels across entire network
  networkLevel5Users: number
  networkLevel6Users: number
  networkLevel7Users: number
  networkLevel8Users: number
  networkLevel9Users: number
  networkLevel10Users: number
}

export interface UserProfileLevel {
  profileLevel: number
  roleTier: string
  totalXP: number
}

export interface AffiliateFilters {
  searchTerm?: string
  roleFilter?: 'ALL' | 'NOMAD' | 'PRO' | 'ROYAL'
  levelFilter?: 'ALL' | 'Lv. 1' | 'Lv. 2' | 'Lv. 3' | 'Lv. 4' | 'Lv. 5'
  limit?: number
  offset?: number
  includeNetwork?: boolean // New option to include multi-level referrals
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

export interface ReferralCode {
  id: string
  code: string
  isActive: boolean
  isDefault: boolean
  usageLimit?: number
  usageCount: number
  successfulConversions: number
  totalClicks: number
  conversionRate: number
  description?: string
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export interface ReferralSession {
  id: string
  sessionId: string
  referralCode: string
  referrerAddress: string
  visitedAt: string
  converted: boolean
  convertedAt?: string
  convertedUserAddress?: string
}

class AffiliateService {
  /**
   * Calculate affiliate level based on profile level only
   * Separate system from profile levels with 5 maximum levels
   * Direct 1:1 mapping for Profile Levels 1-5, then capped at 5
   */
  private calculateAffiliateLevel(totalXp: number, profileLevel: number, roleTier: string): number {
    // Direct 1:1 mapping with Profile Levels 1-5
    // Profile Levels 6-10 remain at Affiliate Level 5 (no further increase)
    // Role tiers (NOMAD, PRO, ROYAL) have NO impact on affiliate level

    if (profileLevel >= 5) return 5  // Profile Level 5+ → Affiliate Level 5 (max)
    if (profileLevel >= 4) return 4  // Profile Level 4 → Affiliate Level 4
    if (profileLevel >= 3) return 3  // Profile Level 3 → Affiliate Level 3
    if (profileLevel >= 2) return 2  // Profile Level 2 → Affiliate Level 2
    if (profileLevel >= 1) return 1  // Profile Level 1 → Affiliate Level 1
    return 1  // Default/fallback (new users start at Affiliate Level 1)
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

      let allRefereeAddresses: string[] = []
      let relationshipData: {
        referee_address: string,
        created_at: string,
        level: number,
        referrer_address: string,
        referral_code?: string
      }[] = []

      if (filters.includeNetwork) {
        // Get multi-level network (up to 5 levels)
        console.log('📊 Fetching multi-level network...')

        // Start with direct referrals (Level 1)
        const { data: directRelationships, error: directError } = await supabase
          .from('affiliate_relationships')
          .select('referee_address, created_at, referrer_address, referral_code')
          .eq('referrer_address', referrerAddress)
          .eq('relationship_status', 'active')

        if (directError) {
          console.error('Error fetching direct relationships:', directError)
          throw directError
        }

        if (directRelationships) {
          directRelationships.forEach(rel => {
            allRefereeAddresses.push(rel.referee_address)
            relationshipData.push({
              referee_address: rel.referee_address,
              created_at: rel.created_at,
              level: 1,
              referrer_address: rel.referrer_address,
              referral_code: rel.referral_code
            })
          })

          // Get network referrals (Levels 2-5)
          let currentLevelAddresses = directRelationships.map(rel => rel.referee_address)

          for (let level = 2; level <= 5; level++) {
            if (currentLevelAddresses.length === 0) break

            const { data: levelRelationships, error: levelError } = await supabase
              .from('affiliate_relationships')
              .select('referee_address, created_at, referrer_address, referral_code')
              .in('referrer_address', currentLevelAddresses)
              .eq('relationship_status', 'active')

            if (levelError) {
              console.error(`Error fetching level ${level} relationships:`, levelError)
              break
            }

            if (levelRelationships) {
              levelRelationships.forEach(rel => {
                allRefereeAddresses.push(rel.referee_address)
                relationshipData.push({
                  referee_address: rel.referee_address,
                  created_at: rel.created_at,
                  level: level,
                  referrer_address: rel.referrer_address,
                  referral_code: rel.referral_code
                })
              })
              currentLevelAddresses = levelRelationships.map(rel => rel.referee_address)
              console.log(`Found ${levelRelationships.length} referrals at level ${level}`)
            }
          }
        }
      } else {
        // Get only direct relationships (original behavior)
        const { data: relationships, error: relError } = await supabase
          .from('affiliate_relationships')
          .select('id, referee_address, created_at, referrer_address, referral_code')
          .eq('referrer_address', referrerAddress)
          .eq('relationship_status', 'active')
          .order('created_at', { ascending: false })

        if (relError) {
          console.error('Error fetching relationships:', relError)
          throw relError
        }

        if (relationships) {
          relationships.forEach(rel => {
            allRefereeAddresses.push(rel.referee_address)
            relationshipData.push({
              referee_address: rel.referee_address,
              created_at: rel.created_at,
              level: 1,
              referrer_address: rel.referrer_address,
              referral_code: rel.referral_code
            })
          })
        }
      }

      if (allRefereeAddresses.length === 0) {
        console.log('No affiliate relationships found')
        return { users: [], totalCount: 0 }
      }

      console.log(`Found ${allRefereeAddresses.length} total affiliate relationships`)

      // Step 2: Get user profiles for these addresses AND their sponsors
      const allSponsorAddresses = relationshipData.map(rel => rel.referrer_address)
      const allAddresses = [...allRefereeAddresses, ...allSponsorAddresses]

      let profileQuery = supabase
        .from('user_profiles')
        .select('address, username_encrypted, email_encrypted, role_tier, profile_level, kyc_status, join_date, total_xp, profile_image_blob_id')
        .in('address', allAddresses)

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

      // Step 3: Get commissions for these relationships (only for direct relationships)
      let commissions: any[] = []
      if (!filters.includeNetwork) {
        // Only get commissions for direct relationships when not including network
        const relationshipIds = relationshipData.filter(rel => rel.level === 1).map(rel => rel.referee_address)
        if (relationshipIds.length > 0) {
          const { data: commissionData, error: commError } = await supabase
            .from('affiliate_commissions')
            .select('referrer_address, referee_address, commission_amount')
            .in('referee_address', relationshipIds)
            .in('status', ['confirmed', 'paid'])

          if (commError) {
            console.error('Error fetching commissions:', commError)
          } else {
            commissions = commissionData || []
          }
        }
      }

      console.log(`Found ${commissions?.length || 0} commissions`)

      // Step 4: Combine the data
      const users: AffiliateUser[] = []

      for (const relationshipInfo of relationshipData) {
        const profile = profiles.find(p => p.address === relationshipInfo.referee_address)
        if (!profile) continue // Skip if profile not found or filtered out

        // Get sponsor information
        const sponsorProfile = profiles.find(p => p.address === relationshipInfo.referrer_address)
        const sponsorUsername = sponsorProfile
          ? (this.decrypt(sponsorProfile.username_encrypted, sponsorProfile.address) || `User_${sponsorProfile.address.slice(0, 8)}`)
          : `User_${relationshipInfo.referrer_address.slice(0, 8)}`

        // Calculate total commission for this relationship
        const relationshipCommissions = commissions?.filter(c => c.referee_address === relationshipInfo.referee_address) || []
        const totalCommission = relationshipCommissions.reduce((sum, comm) =>
          sum + parseFloat(comm.commission_amount.toString()), 0
        )

        const username = this.decrypt(profile.username_encrypted, profile.address) || `User_${profile.address.slice(0, 8)}`
        const email = this.decrypt(profile.email_encrypted, profile.address) || `${profile.address.slice(0, 8)}@example.com`

        // Use the relationship level as affiliate level (1-5)
        const profileLevel = profile.profile_level || 1
        const affiliateLevel = relationshipInfo.level
        const isDirect = relationshipInfo.level === 1

        console.log(`Processing user ${profile.address}: username="${username}", email="${email}", profileLevel=${profileLevel}, affiliateLevel=${affiliateLevel}, sponsor="${sponsorUsername}", isDirect=${isDirect}`)

        users.push({
          id: `${relationshipInfo.referee_address}_${relationshipInfo.level}`,
          address: profile.address,
          username,
          email,
          joinDate: profile.join_date || relationshipInfo.created_at,
          status: profile.role_tier as 'NOMAD' | 'PRO' | 'ROYAL',
          commission: Math.round(totalCommission),
          kycStatus: profile.kyc_status as 'verified' | 'pending' | 'not_verified',
          profileLevel,
          affiliateLevel,
          sponsorAddress: relationshipInfo.referrer_address,
          sponsorUsername,
          referralCode: relationshipInfo.referral_code,
          isDirect,
          avatarBlobId: profile.profile_image_blob_id
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

      // Note: Affiliate level filtering is done client-side since affiliate levels are calculated dynamically
      // No database filtering needed for affiliate levels

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
   * Check if user already has a referral relationship (as referee)
   */
  async checkExistingReferralRelationship(userAddress: string): Promise<boolean> {
    try {
      const { data: relationship, error } = await supabase
        .from('affiliate_relationships')
        .select('id')
        .eq('referee_address', userAddress)
        .eq('relationship_status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking referral relationship:', error)
        return false
      }

      return !!relationship
    } catch (error) {
      console.error('Failed to check referral relationship:', error)
      return false
    }
  }

  /**
   * Get referral relationship data for a user
   */
  async getReferralRelationshipData(userAddress: string): Promise<{ referral_code?: string } | null> {
    try {
      const { data: relationship, error } = await supabase
        .from('affiliate_relationships')
        .select('referral_code')
        .eq('referee_address', userAddress)
        .eq('relationship_status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error getting referral relationship data:', error)
        return null
      }

      return relationship
    } catch (error) {
      console.error('Failed to get referral relationship data:', error)
      return null
    }
  }

  /**
   * Process referral from session (when user came from referral link)
   */
  async processReferralFromSession(sessionId: string, userAddress: string): Promise<boolean> {
    try {
      console.log('🔗 Processing referral from session:', sessionId, 'for user:', userAddress)

      // Find the referral session
      const { data: session, error: sessionError } = await supabase
        .from('referral_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('converted', false)
        .single()

      if (sessionError || !session) {
        console.log('❌ No valid referral session found')
        return false
      }

      // Check if user already has a referral relationship
      const hasExisting = await this.checkExistingReferralRelationship(userAddress)
      if (hasExisting) {
        console.log('❌ User already has a referral relationship')
        return false
      }

      // Create the affiliate relationship
      const relationshipSuccess = await this.createAffiliateRelationship(
        session.referrer_address,
        userAddress,
        session.referral_code
      )

      if (!relationshipSuccess) {
        console.log('❌ Failed to create affiliate relationship from session')
        return false
      }

      // Mark session as converted
      const { error: updateError } = await supabase
        .from('referral_sessions')
        .update({
          converted: true,
          converted_at: new Date().toISOString(),
          converted_user_address: userAddress
        })
        .eq('id', session.id)

      if (updateError) {
        console.error('⚠️ Failed to update session conversion status:', updateError)
      }

      // Update successful conversions count
      const { error: conversionError } = await supabase
        .rpc('increment_referral_conversions', {
          referral_code: session.referral_code
        })

      if (conversionError) {
        console.error('⚠️ Failed to update conversion count:', conversionError)
      }

      console.log('✅ Referral processed successfully from session')
      return true
    } catch (error) {
      console.error('Failed to process referral from session:', error)
      return false
    }
  }

  /**
   * Get referral session data for a session ID
   */
  async getReferralSession(sessionId: string): Promise<ReferralSession | null> {
    try {
      const { data, error } = await supabase
        .from('referral_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      if (error || !data) {
        return null
      }

      return {
        id: data.id,
        sessionId: data.session_id,
        referralCode: data.referral_code,
        referrerAddress: data.referrer_address,
        visitedAt: data.visited_at,
        converted: data.converted,
        convertedAt: data.converted_at,
        convertedUserAddress: data.converted_user_address
      }
    } catch (error) {
      console.error('Failed to get referral session:', error)
      return null
    }
  }

  /**
   * Process admin default referral code (special handling for admin codes)
   */
  async processAdminDefaultReferral(referralCode: string, userAddress: string): Promise<boolean> {
    try {
      console.log('🔍 Processing admin default referral:', referralCode, 'for user:', userAddress)

      // Step 1: Validate the admin referral code exists
      const { data: adminCode, error: adminError } = await supabase
        .from('extra_codes')
        .select('owner_address, usage_limit, usage_count, is_active, expires_at')
        .eq('code', referralCode)
        .eq('is_active', true)
        .single()

      let codeData = adminCode

      if (!adminCode) {
        // Try personal referral codes as fallback
        const { data: personalCode, error: personalError } = await supabase
          .from('referral_codes')
          .select('owner_address, usage_limit, usage_count, is_active, expires_at')
          .eq('code', referralCode)
          .eq('is_active', true)
          .single()

        if (personalCode) {
          codeData = personalCode
        }
      }

      if (!codeData) {
        console.log('❌ Admin referral code not found or inactive')
        return false
      }

      // Step 2: Check if user already has a referral relationship
      const hasExisting = await this.checkExistingReferralRelationship(userAddress)

      if (hasExisting) {
        console.log('⚠️ User already has referral relationship - admin default will be stored in profile only')
        // For admin default, we don't create duplicate relationships
        // The referral_data is already stored in the profile
        return true
      }

      // Step 3: No existing relationship, create new admin relationship
      const relationshipSuccess = await this.createAffiliateRelationship(
        codeData.owner_address,
        userAddress,
        referralCode
      )

      if (!relationshipSuccess) {
        console.log('❌ Failed to create admin affiliate relationship')
        return false
      }

      // Step 4: Update code usage count
      if (adminCode) {
        // Update admin extra code
        const { error: updateError } = await supabase
          .from('extra_codes')
          .update({
            usage_count: codeData.usage_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('code', referralCode)

        if (updateError) {
          console.error('⚠️ Failed to update admin code usage count:', updateError)
        }
      } else {
        // Update personal referral code
        const { error: updateError } = await supabase
          .rpc('increment_referral_usage', {
            referral_code: referralCode,
            increment_conversions: true
          })

        if (updateError) {
          console.error('⚠️ Failed to update referral code usage count:', updateError)
        }
      }

      console.log('✅ Admin default referral processed successfully')
      return true

    } catch (error) {
      console.error('❌ Error processing admin default referral:', error)
      return false
    }
  }

  /**
   * Process and validate a referral code, creating the relationship if valid
   */
  async processReferralCode(referralCode: string, userAddress: string): Promise<boolean> {
    try {
      console.log('🔍 Processing referral code:', referralCode, 'for user:', userAddress)

      // Step 1: Check if user already has a referral relationship
      const hasExisting = await this.checkExistingReferralRelationship(userAddress)
      if (hasExisting) {
        console.log('❌ User already has a referral relationship')
        return false
      }

      // Step 2: Validate the referral code exists and is active
      // First try referral_codes table (personal codes), then extra_codes (admin codes)
      let codeData: any = null
      let codeError: any = null

      // Try personal referral codes first
      const { data: personalCode, error: personalError } = await supabase
        .from('referral_codes')
        .select('owner_address, usage_limit, usage_count, is_active, expires_at')
        .eq('code', referralCode)
        .eq('is_active', true)
        .single()

      if (personalCode) {
        codeData = personalCode
      } else {
        // Try admin extra codes (renamed from affiliate_codes)
        const { data: adminCode, error: adminError } = await supabase
          .from('extra_codes')
          .select('owner_address, usage_limit, usage_count, is_active, expires_at')
          .eq('code', referralCode)
          .eq('is_active', true)
          .single()

        if (adminCode) {
          codeData = adminCode
        } else {
          codeError = adminError
        }
      }

      if (!codeData) {
        console.log('❌ Invalid or inactive referral code')
        return false
      }

      // Step 3: Check if code has expired
      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        console.log('❌ Referral code has expired')
        return false
      }

      // Step 4: Check usage limit
      if (codeData.usage_limit && codeData.usage_count >= codeData.usage_limit) {
        console.log('❌ Referral code usage limit reached')
        return false
      }

      // Step 5: Prevent self-referral
      if (codeData.owner_address === userAddress) {
        console.log('❌ Cannot use your own referral code')
        return false
      }

      // Step 6: Create the affiliate relationship
      const relationshipSuccess = await this.createAffiliateRelationship(
        codeData.owner_address,
        userAddress,
        referralCode
      )

      if (!relationshipSuccess) {
        console.log('❌ Failed to create affiliate relationship')
        return false
      }

      // Step 7: Update code usage count in the appropriate table
      if (personalCode) {
        // Update personal referral code
        const { error: updateError } = await supabase
          .rpc('increment_referral_usage', {
            referral_code: referralCode,
            increment_conversions: true
          })

        if (updateError) {
          console.error('⚠️ Failed to update referral code usage count:', updateError)
        }
      } else {
        // Update admin extra code (renamed from affiliate_codes)
        const { error: updateError } = await supabase
          .from('extra_codes')
          .update({
            usage_count: codeData.usage_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('code', referralCode)

        if (updateError) {
          console.error('⚠️ Failed to update extra code usage count:', updateError)
        }
      }

      console.log('✅ Referral code processed successfully')
      return true

    } catch (error) {
      console.error('Failed to process referral code:', error)
      return false
    }
  }

  /**
   * Generate a unique referral code for a user based on their username
   */
  async generateReferralCode(userAddress: string, username: string): Promise<string | null> {
    try {
      console.log('🔧 Generating referral code for:', username, userAddress)

      // Call the database function to generate unique code
      const { data, error } = await supabase
        .rpc('generate_referral_code', {
          p_username: username,
          p_owner_address: userAddress
        })

      if (error) {
        console.error('Error generating referral code:', error)
        return null
      }

      return data as string
    } catch (error) {
      console.error('Failed to generate referral code:', error)
      return null
    }
  }

  /**
   * Check if user already has referral codes
   */
  async userHasReferralCodes(userAddress: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('user_has_referral_codes', {
          p_owner_address: userAddress
        })

      if (error) {
        console.error('Error checking user referral codes:', error)
        return false
      }

      return data as boolean
    } catch (error) {
      console.error('Failed to check user referral codes:', error)
      return false
    }
  }

  /**
   * Get user's default referral code
   */
  async getUserDefaultReferralCode(userAddress: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_default_referral_code', {
          p_owner_address: userAddress
        })

      if (error) {
        console.error('Error getting user default referral code:', error)
        return null
      }

      return data as string | null
    } catch (error) {
      console.error('Failed to get user default referral code:', error)
      return null
    }
  }

  /**
   * Create a default referral code for a user (duplicate-safe)
   */
  async createDefaultReferralCode(userAddress: string, username: string): Promise<boolean> {
    try {
      console.log('🆕 Creating default referral code for:', username, userAddress)

      // Check if user already has a referral code
      const existingCode = await this.getUserDefaultReferralCode(userAddress)
      if (existingCode) {
        console.log('✅ User already has referral code:', existingCode)
        return true // Return success since user has a code
      }

      // Use the safe creation function from database
      const { data: code, error } = await supabase
        .rpc('create_referral_code_safe', {
          p_username: username,
          p_owner_address: userAddress,
          p_force_create: false
        })

      if (error) {
        console.error('Error creating default referral code:', error)
        return false
      }

      if (!code) {
        console.error('No referral code returned from safe creation function')
        return false
      }

      console.log('✅ Default referral code created/retrieved:', code)
      return true
    } catch (error) {
      console.error('Failed to create default referral code:', error)
      return false
    }
  }

  /**
   * Validate that referral code operations maintain immutability rules
   */
  async validateReferralCodeImmutability(userAddress: string, operation: 'create' | 'update' | 'delete'): Promise<{ valid: boolean; message?: string }> {
    try {
      const hasExistingCodes = await this.userHasReferralCodes(userAddress)

      switch (operation) {
        case 'create':
          if (hasExistingCodes) {
            return {
              valid: false,
              message: 'User already has a referral code. Each user can only have one referral code.'
            }
          }
          break

        case 'update':
          return {
            valid: false,
            message: 'Referral codes cannot be modified once created to maintain system integrity.'
          }

        case 'delete':
          return {
            valid: false,
            message: 'Referral codes cannot be deleted once created to maintain referral relationships.'
          }
      }

      return { valid: true }
    } catch (error) {
      console.error('Failed to validate referral code immutability:', error)
      return {
        valid: false,
        message: 'Failed to validate referral code operation'
      }
    }
  }

  /**
   * Sync referral code statistics with actual affiliate data using database function
   */
  async syncReferralCodeStatistics(userAddress: string, referralCode: string): Promise<void> {
    try {
      console.log('🔄 Syncing referral code statistics for:', referralCode)

      // Use the database function to sync statistics
      const { error } = await supabase
        .rpc('sync_referral_code_statistics', {
          p_owner_address: userAddress,
          p_referral_code: referralCode
        })

      if (error) {
        console.error('Error syncing referral code statistics:', error)
      } else {
        console.log('✅ Referral code statistics synced successfully')
      }
    } catch (error) {
      console.error('Failed to sync referral code statistics:', error)
    }
  }

  /**
   * Sync all referral code statistics for a user
   */
  async syncAllUserReferralStatistics(userAddress: string): Promise<void> {
    try {
      console.log('🔄 Syncing all referral code statistics for user:', userAddress)

      // Use the database function to sync all user's referral codes
      const { error } = await supabase
        .rpc('sync_all_user_referral_statistics', {
          p_owner_address: userAddress
        })

      if (error) {
        console.error('Error syncing all user referral statistics:', error)
      } else {
        console.log('✅ All referral code statistics synced successfully')
      }
    } catch (error) {
      console.error('Failed to sync all user referral statistics:', error)
    }
  }

  /**
   * Get all referral codes for a user with synced statistics
   */
  async getUserReferralCodes(userAddress: string): Promise<ReferralCode[]> {
    try {
      // First sync all statistics for this user
      await this.syncAllUserReferralStatistics(userAddress)

      // Then fetch the updated data
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('owner_address', userAddress)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user referral codes:', error)
        return []
      }

      return (data || []).map(code => ({
        id: code.id,
        code: code.code,
        isActive: code.is_active,
        isDefault: code.is_default,
        usageLimit: code.usage_limit,
        usageCount: code.usage_count,
        successfulConversions: code.successful_conversions,
        totalClicks: code.total_clicks,
        conversionRate: code.conversion_rate,
        description: code.description,
        createdAt: code.created_at,
        updatedAt: code.updated_at,
        expiresAt: code.expires_at
      }))
    } catch (error) {
      console.error('Failed to get user referral codes:', error)
      return []
    }
  }

  /**
   * Track a referral link click
   */
  async trackReferralClick(referralCode: string, sessionId: string, ipAddress?: string, userAgent?: string, referrerUrl?: string): Promise<boolean> {
    try {
      console.log('📊 Tracking referral click for code:', referralCode)

      // First, get the referrer address from the referral code
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('owner_address')
        .eq('code', referralCode)
        .eq('is_active', true)
        .single()

      if (codeError || !codeData) {
        console.log('❌ Invalid referral code for tracking:', referralCode)
        return false
      }

      // Create referral session
      const { error: sessionError } = await supabase
        .from('referral_sessions')
        .insert({
          session_id: sessionId,
          referral_code: referralCode,
          referrer_address: codeData.owner_address,
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer_url: referrerUrl
        })

      if (sessionError) {
        console.error('Error creating referral session:', sessionError)
        return false
      }

      // Update click count
      const { error: updateError } = await supabase
        .rpc('increment_referral_clicks', {
          referral_code: referralCode
        })

      if (updateError) {
        console.error('Error updating click count:', updateError)
        // Don't fail the whole process for this
      }

      console.log('✅ Referral click tracked successfully')
      return true
    } catch (error) {
      console.error('Failed to track referral click:', error)
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
        affiliateLevel,
        sponsorAddress: undefined, // Sponsor doesn't have a sponsor in this context
        sponsorUsername: undefined,
        referralCode: undefined,
        isDirect: false // This is not a direct referral context
      }

      console.log('✅ Sponsor info retrieved successfully:', sponsorInfo)
      return sponsorInfo

    } catch (error) {
      console.error('Failed to get sponsor info:', error)
      return null
    }
  }



  /**
   * Get user's own profile level and tier information
   */
  async getUserProfileLevel(userAddress: string): Promise<UserProfileLevel | null> {
    try {
      console.log('🔍 Fetching user profile level for:', userAddress)

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('profile_level, role_tier, total_xp')
        .eq('address', userAddress)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No profile found for user')
          return null
        }
        console.error('Error fetching user profile:', error)
        throw error
      }

      return {
        profileLevel: profile.profile_level || 1,
        roleTier: profile.role_tier || 'NOMAD',
        totalXP: profile.total_xp || 0
      }
    } catch (error) {
      console.error('Failed to get user profile level:', error)
      return null
    }
  }

  /**
   * Get network-level affiliate metrics including second-level referrals
   */
  async getNetworkMetrics(referrerAddress: string): Promise<NetworkMetrics> {
    try {
      console.log('🔍 Fetching network metrics for:', referrerAddress)

      // Step 1: Get direct referrals (first level)
      const { data: directRelationships, error: directError } = await supabase
        .from('affiliate_relationships')
        .select('referee_address')
        .eq('referrer_address', referrerAddress)
        .eq('relationship_status', 'active')

      if (directError) {
        console.error('Error fetching direct relationships:', directError)
        throw directError
      }

      const directRefereeAddresses = directRelationships?.map(rel => rel.referee_address) || []
      console.log(`Found ${directRefereeAddresses.length} direct referrals`)

      // Step 2: Get network referrals from all 5 levels (excluding direct referrals)
      let allNetworkRefereeAddresses: string[] = []
      let currentLevelAddresses = directRefereeAddresses

      // Traverse up to 5 levels deep
      for (let level = 2; level <= 5; level++) {
        if (currentLevelAddresses.length === 0) break

        const { data: levelRelationships, error: levelError } = await supabase
          .from('affiliate_relationships')
          .select('referee_address')
          .in('referrer_address', currentLevelAddresses)
          .eq('relationship_status', 'active')

        if (levelError) {
          console.error(`Error fetching level ${level} relationships:`, levelError)
          throw levelError
        }

        const levelAddresses = levelRelationships?.map(rel => rel.referee_address) || []
        allNetworkRefereeAddresses.push(...levelAddresses)
        currentLevelAddresses = levelAddresses

        console.log(`Found ${levelAddresses.length} referrals at level ${level}`)
      }

      console.log(`Total network referrals across all levels: ${allNetworkRefereeAddresses.length}`)

      // Step 3: Get profiles for direct referrals
      let directProfiles: any[] = []
      if (directRefereeAddresses.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('address, role_tier, profile_level')
          .in('address', directRefereeAddresses)

        if (profilesError) {
          console.error('Error fetching direct profiles:', profilesError)
          throw profilesError
        }

        directProfiles = profiles || []
      }

      // Step 4: Get profiles for network referrals (all levels)
      let networkProfiles: any[] = []
      if (allNetworkRefereeAddresses.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('address, role_tier, profile_level')
          .in('address', allNetworkRefereeAddresses)

        if (profilesError) {
          console.error('Error fetching network profiles:', profilesError)
          throw profilesError
        }

        networkProfiles = profiles || []
      }

      // Step 5: Calculate metrics
      const personalNomadUsers = directProfiles.filter(user => user.role_tier === 'NOMAD').length
      const personalProUsers = directProfiles.filter(user => user.role_tier === 'PRO').length
      const personalRoyalUsers = directProfiles.filter(user => user.role_tier === 'ROYAL').length

      const networkNomadUsers = networkProfiles.filter(user => user.role_tier === 'NOMAD').length
      const networkProUsers = networkProfiles.filter(user => user.role_tier === 'PRO').length
      const networkRoyalUsers = networkProfiles.filter(user => user.role_tier === 'ROYAL').length

      // Combine all profiles for level counting (entire network)
      const allNetworkProfiles = [...directProfiles, ...networkProfiles]
      const networkLevel5Users = allNetworkProfiles.filter(user => user.profile_level === 5).length
      const networkLevel6Users = allNetworkProfiles.filter(user => user.profile_level === 6).length
      const networkLevel7Users = allNetworkProfiles.filter(user => user.profile_level === 7).length
      const networkLevel8Users = allNetworkProfiles.filter(user => user.profile_level === 8).length
      const networkLevel9Users = allNetworkProfiles.filter(user => user.profile_level === 9).length
      const networkLevel10Users = allNetworkProfiles.filter(user => user.profile_level === 10).length

      const networkMetrics: NetworkMetrics = {
        personalNomadUsers,
        personalProUsers,
        personalRoyalUsers,
        networkNomadUsers,
        networkProUsers,
        networkRoyalUsers,
        networkLevel5Users,
        networkLevel6Users,
        networkLevel7Users,
        networkLevel8Users,
        networkLevel9Users,
        networkLevel10Users
      }

      console.log('📊 Network metrics:', networkMetrics)
      return networkMetrics

    } catch (error) {
      console.error('Failed to get network metrics:', error)
      return {
        personalNomadUsers: 0,
        personalProUsers: 0,
        personalRoyalUsers: 0,
        networkNomadUsers: 0,
        networkProUsers: 0,
        networkRoyalUsers: 0,
        networkLevel5Users: 0,
        networkLevel6Users: 0,
        networkLevel7Users: 0,
        networkLevel8Users: 0,
        networkLevel9Users: 0,
        networkLevel10Users: 0
      }
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
