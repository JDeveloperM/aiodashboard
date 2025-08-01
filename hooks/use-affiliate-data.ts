"use client"

import { useState, useEffect, useCallback } from 'react'
import { useCurrentAccount } from "@mysten/dapp-kit"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { affiliateService, AffiliateUser, NetworkMetrics, CommissionData, UserProfileLevel } from "@/lib/affiliate-service"
import { affiliateSubscriptionService, SubscriptionStatus } from "@/lib/affiliate-subscription-service"

export interface AffiliateData {
  affiliateUsers: AffiliateUser[]
  networkMetrics: NetworkMetrics
  commissionData: CommissionData
  userProfileLevel: UserProfileLevel | null
  userAffiliateLevel: number
  subscriptionStatus: SubscriptionStatus | null
  totalCount: number
  totalAllUsers: number
  loading: boolean
  error: string | null
}

export function useAffiliateData() {
  const account = useCurrentAccount()
  const { user } = useSuiAuth()
  
  // State
  const [affiliateUsers, setAffiliateUsers] = useState<AffiliateUser[]>([])
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics>({
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
    networkLevel10Users: 0,
  })
  const [commissionData, setCommissionData] = useState<CommissionData>({
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
  })
  const [userProfileLevel, setUserProfileLevel] = useState<UserProfileLevel | null>(null)
  const [userAffiliateLevel, setUserAffiliateLevel] = useState<number>(1)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalAllUsers, setTotalAllUsers] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get user address
  const userAddress = user?.address || account?.address

  // Calculate affiliate level based on profile level
  const calculateAffiliateLevel = (profileLevel: number): number => {
    return Math.min(profileLevel, 5) // Affiliate levels are capped at 5
  }

  // Load affiliate data
  const loadAffiliateData = useCallback(async () => {
    if (!userAddress) return

    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Loading affiliate data for address:', userAddress)

      // Load subscription status
      const subStatus = await affiliateSubscriptionService.getSubscriptionStatus(userAddress)
      setSubscriptionStatus(subStatus)

      // Load user's own profile level
      const profileLevel = await affiliateService.getUserProfileLevel(userAddress)
      setUserProfileLevel(profileLevel)

      // Calculate user's affiliate level based on profile level
      const affiliateLevel = profileLevel ? calculateAffiliateLevel(profileLevel.profileLevel) : 1
      setUserAffiliateLevel(affiliateLevel)

      // Load network metrics
      const networkData = await affiliateService.getNetworkMetrics(userAddress)
      setNetworkMetrics(networkData)

      // Calculate total users from network metrics
      const totalUsers = networkData.personalNomadUsers + networkData.personalProUsers + networkData.personalRoyalUsers +
                        networkData.networkNomadUsers + networkData.networkProUsers + networkData.networkRoyalUsers
      setTotalAllUsers(totalUsers)

      // Load affiliate users
      const { users, totalCount: count } = await affiliateService.getAffiliateUsers(userAddress, {
        roleFilter: 'ALL',
        levelFilter: 'ALL',
        limit: 50,
        includeNetwork: true
      })

      setAffiliateUsers(users)
      setTotalCount(count)

      // Load commission data
      const commissionInfo = await affiliateService.getCommissionData(userAddress)
      setCommissionData(commissionInfo)

      console.log('✅ Affiliate data loaded successfully')
    } catch (err) {
      console.error('❌ Failed to load affiliate data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load affiliate data')
    } finally {
      setLoading(false)
    }
  }, [userAddress])

  // Load data on mount and when user changes
  useEffect(() => {
    if (userAddress) {
      loadAffiliateData()
    }
  }, [userAddress, loadAffiliateData])

  // Prepare data for AI analysis - USER-SPECIFIC DATA
  const getAIAnalysisData = useCallback(() => {
    if (!userAddress || loading) return null

    // Transform affiliate users data for AI analysis (these are YOUR referrals)
    const myAffiliates = affiliateUsers.map(user => ({
      id: user.address,
      username: user.username,
      totalReferrals: 0, // These are your direct affiliates, so we set their referral count to 0 for AI analysis
      affiliateLevel: user.affiliateLevel || 1,
      profileLevel: user.profileLevel || 1,
      tier: user.status || 'NOMAD', // Use status field from AffiliateUser interface
      joinedDate: user.joinDate, // Use joinDate field from AffiliateUser interface
      lastActivity: user.joinDate, // Use joinDate as lastActivity since AffiliateUser doesn't have lastActivity
      commissionEarned: user.commission || 0,
      isActive: user.joinDate ? new Date(user.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : false
    }))

    // Calculate YOUR total referrals (sum of all your affiliates' referrals)
    const myTotalReferrals = myAffiliates.reduce((sum, affiliate) => sum + affiliate.totalReferrals, 0)

    // Calculate YOUR estimated revenue from referrals
    const myEstimatedRevenue = myTotalReferrals * 25 // $25 per referral

    // Calculate YOUR network size
    const myNetworkSize = totalAllUsers // This is your total network from networkMetrics

    return {
      // YOUR affiliates (people you referred who became affiliates)
      affiliates: myAffiliates,

      // YOUR network metrics
      networkMetrics,

      // YOUR commission data
      commissionData,

      // YOUR personal stats
      userStats: {
        profileLevel: userProfileLevel?.profileLevel || 1,
        affiliateLevel: userAffiliateLevel,
        totalNetworkUsers: myNetworkSize, // Total users in YOUR network
        totalAffiliates: myAffiliates.length, // Total affiliates in YOUR network
        totalReferrals: myTotalReferrals, // Total referrals generated by YOUR network
        estimatedRevenue: myEstimatedRevenue, // Revenue generated by YOUR network
        subscriptionActive: subscriptionStatus?.isActive || false,

        // Breakdown by tier (YOUR network)
        tierBreakdown: {
          NOMAD: networkMetrics.personalNomadUsers + networkMetrics.networkNomadUsers,
          PRO: networkMetrics.personalProUsers + networkMetrics.networkProUsers,
          ROYAL: networkMetrics.personalRoyalUsers + networkMetrics.networkRoyalUsers
        }
      }
    }
  }, [affiliateUsers, networkMetrics, commissionData, userProfileLevel, userAffiliateLevel, totalAllUsers, subscriptionStatus, userAddress, loading])

  return {
    // Raw data
    affiliateUsers,
    networkMetrics,
    commissionData,
    userProfileLevel,
    userAffiliateLevel,
    subscriptionStatus,
    totalCount,
    totalAllUsers,
    loading,
    error,
    
    // Functions
    loadAffiliateData,
    getAIAnalysisData,
    
    // Computed values
    userAddress
  }
}
