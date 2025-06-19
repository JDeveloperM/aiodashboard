"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoleImage } from "@/components/ui/role-image"
import { affiliateService, AffiliateUser, AffiliateMetrics, CommissionData, NetworkMetrics, UserProfileLevel } from "@/lib/affiliate-service"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { CommissionTracking } from "@/components/commission-tracking"
import { ContactSponsorModal } from "@/components/contact-sponsor-modal"
import {
  Users,
  Search,
  Filter,
  Award,
  Trophy,
  Calendar,
  Mail,
  MessageCircle,
  Bell,
  MoreHorizontal,
  DollarSign,
  Gift,
  Loader2
} from "lucide-react"

export function AffiliateControls() {
  const account = useCurrentAccount()

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'NOMAD' | 'PRO' | 'ROYAL'>('ALL')
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'ALL' | 'Lv. 1' | 'Lv. 2' | 'Lv. 3' | 'Lv. 4' | 'Lv. 5'>('ALL')
  const [selectedProfileLevelFilter, setSelectedProfileLevelFilter] = useState<'ALL' | 'PL. 1' | 'PL. 2' | 'PL. 3' | 'PL. 4' | 'PL. 5' | 'PL. 6' | 'PL. 7' | 'PL. 8' | 'PL. 9' | 'PL. 10'>('ALL')
  const [showLatestOnly, setShowLatestOnly] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(5)

  // State for new redesigned data
  const [userProfileLevel, setUserProfileLevel] = useState<UserProfileLevel | null>(null)
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
    networkLevel10Users: 0
  })
  const [totalDirectUsers, setTotalDirectUsers] = useState(0)

  // State for affiliate users list
  const [affiliateUsers, setAffiliateUsers] = useState<AffiliateUser[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const [hoveredUsers, setHoveredUsers] = useState<Set<string>>(new Set())

  // Commission tracking state (keeping this at the bottom)
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

  const [loading, setLoading] = useState(true)
  const [commissionLoading, setCommissionLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data on component mount and when wallet changes
  useEffect(() => {
    if (account?.address) {
      loadAffiliateData()
    }
  }, [account?.address, selectedRoleFilter, selectedLevelFilter, selectedProfileLevelFilter])

  // Load affiliate data from database
  const loadAffiliateData = async () => {
    if (!account?.address) {
      setError('Wallet not connected')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setCommissionLoading(true)
      setError(null)

      console.log('🔄 Loading affiliate data for wallet:', account.address)

      // Load user's own profile level
      const profileLevel = await affiliateService.getUserProfileLevel(account.address)
      setUserProfileLevel(profileLevel)

      // Load network metrics (personal + network breakdown)
      const networkData = await affiliateService.getNetworkMetrics(account.address)
      setNetworkMetrics(networkData)

      // Calculate total direct users
      const totalDirect = networkData.personalNomadUsers + networkData.personalProUsers + networkData.personalRoyalUsers
      setTotalDirectUsers(totalDirect)

      // Load affiliate users with current filters
      const { users, totalCount: count } = await affiliateService.getAffiliateUsers(account.address, {
        roleFilter: selectedRoleFilter,
        levelFilter: selectedLevelFilter,
        limit: 50 // Load more initially for filtering
      })

      setAffiliateUsers(users)
      setTotalCount(count)

      // Load commission data
      const commissionInfo = await affiliateService.getCommissionData(account.address)
      setCommissionData(commissionInfo)
      setCommissionLoading(false)

      console.log('✅ Affiliate data loaded successfully')
      console.log('👤 User profile level:', profileLevel)
      console.log('📊 Network metrics:', networkData)
      console.log('💰 Commission data:', commissionInfo)

      // If no data found, try with admin address for testing
      if (totalDirect === 0 && !profileLevel) {
        console.log('🧪 No data found for current wallet, trying admin address for testing...')
        const adminAddress = '0x311479200d45ef0243b92dbcf9849b8f6b931d27ae885197ea73066724f2bcf4'

        const adminProfileLevel = await affiliateService.getUserProfileLevel(adminAddress)
        const adminNetworkData = await affiliateService.getNetworkMetrics(adminAddress)
        const { users: adminUsers } = await affiliateService.getAffiliateUsers(adminAddress, {
          roleFilter: selectedRoleFilter,
          levelFilter: selectedLevelFilter,
          limit: 50
        })
        const adminCommissionData = await affiliateService.getCommissionData(adminAddress)

        if (adminProfileLevel || adminNetworkData.personalNomadUsers > 0) {
          console.log('🧪 Using admin test data')
          setUserProfileLevel(adminProfileLevel)
          setNetworkMetrics(adminNetworkData)
          setTotalDirectUsers(adminNetworkData.personalNomadUsers + adminNetworkData.personalProUsers + adminNetworkData.personalRoyalUsers)
          setAffiliateUsers(adminUsers)
          setTotalCount(adminUsers.length)
          setCommissionData(adminCommissionData)
        }
      }

    } catch (error) {
      console.error('❌ Failed to load affiliate data:', error)
      setError('Failed to load affiliate data')
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOMAD': return 'bg-gray-600 text-white'
      case 'PRO': return 'bg-blue-600 text-white'
      case 'ROYAL': return 'bg-yellow-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'not_verified': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getKycStatusText = (status: string) => {
    switch (status) {
      case 'verified': return '✓'
      case 'pending': return '⏳'
      case 'not_verified': return '✗'
      default: return '?'
    }
  }

  // Helper function to format SUI amounts with USD conversion
  const formatSuiAmount = (amount: number) => {
    const suiPrice = 3.45 // Mock SUI price in USD - in production, fetch from API
    const usdValue = amount * suiPrice
    return {
      sui: amount.toLocaleString(),
      usd: usdValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    }
  }

  // Filter users based on search term and affiliate level
  const filteredUsers = affiliateUsers.filter(user => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = user.username.toLowerCase().includes(searchLower) ||
                           user.email.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Affiliate level filter
    if (selectedLevelFilter !== 'ALL') {
      const targetLevel = parseInt(selectedLevelFilter.replace('Lv. ', ''))
      if (user.affiliateLevel !== targetLevel) return false
    }

    // Profile level filter
    if (selectedProfileLevelFilter !== 'ALL') {
      const targetProfileLevel = parseInt(selectedProfileLevelFilter.replace('PL. ', ''))
      if (user.profileLevel !== targetProfileLevel) return false
    }

    return true
  })

  // Sort by join date (newest first) and get latest 5 or paginated results
  const sortedUsers = [...filteredUsers].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())

  // Get latest 5 affiliates for the "Latest Affiliates" section
  const latestAffiliates = sortedUsers.slice(0, 5)

  // Get displayed users based on pagination
  const displayedUsers = showLatestOnly ? latestAffiliates : sortedUsers.slice(0, displayedCount)

  // Show more functionality
  const handleShowMore = () => {
    setDisplayedCount(prev => prev + 5)
  }

  // Handle user expansion
  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  // Handle user hover
  const handleUserHover = (userId: string, isHovering: boolean) => {
    setHoveredUsers(prev => {
      const newSet = new Set(prev)
      if (isHovering) {
        newSet.add(userId)
      } else {
        newSet.delete(userId)
      }
      return newSet
    })
  }

  const handleToggleLatest = () => {
    setShowLatestOnly(!showLatestOnly)
    setDisplayedCount(5) // Reset pagination when switching views
  }

  // Handle filter changes
  const handleRoleFilterChange = (value: 'ALL' | 'NOMAD' | 'PRO' | 'ROYAL') => {
    setSelectedRoleFilter(value)
    setDisplayedCount(5) // Reset pagination
  }

  const handleLevelFilterChange = (value: 'ALL' | 'Lv. 1' | 'Lv. 2' | 'Lv. 3' | 'Lv. 4' | 'Lv. 5') => {
    setSelectedLevelFilter(value)
    setDisplayedCount(5) // Reset pagination
  }

  const handleProfileLevelFilterChange = (value: 'ALL' | 'PL. 1' | 'PL. 2' | 'PL. 3' | 'PL. 4' | 'PL. 5' | 'PL. 6' | 'PL. 7' | 'PL. 8' | 'PL. 9' | 'PL. 10') => {
    setSelectedProfileLevelFilter(value)
    setDisplayedCount(5) // Reset pagination
  }

  // Action handlers
  const handleDirectMessage = (user: AffiliateUser) => {
    console.log('Direct message to:', user.username)
  }

  const handleSendEmail = (user: AffiliateUser) => {
    console.log('Send email to:', user.email)
  }

  const handleSubscriptionReminder = (user: AffiliateUser) => {
    console.log('Send subscription reminder to:', user.username)
  }

  const handleSpecialBonusOffer = (user: AffiliateUser) => {
    console.log('Send special bonus offer to:', user.username)
  }

  // Show wallet connection requirement
  if (!account?.address) {
    return (
      <div className="space-y-6">
        <div className="enhanced-card">
          <div className="enhanced-card-content text-center py-12">
            <Users className="w-16 h-16 text-[#4DA2FF] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-[#C0E6FF] mb-4">
              Please connect your wallet to view your affiliate dashboard and manage your affiliates.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="enhanced-card">
          <div className="enhanced-card-content text-center py-12">
            <Loader2 className="w-16 h-16 text-[#4DA2FF] mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-white mb-2">Loading Affiliate Data</h3>
            <p className="text-[#C0E6FF]">
              Fetching your affiliate metrics and user data...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="enhanced-card">
          <div className="enhanced-card-content text-center py-12">
            <Users className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Data</h3>
            <p className="text-[#C0E6FF] mb-4">{error}</p>
            <Button
              onClick={loadAffiliateData}
              className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Section - Summary Cards (3 cards in a row) */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Total Users Card */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">TOTAL USERS</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">{totalDirectUsers}</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* My Profile Level Card */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">MY PROFILE LEVEL</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">Level {userProfileLevel?.profileLevel || 1}</p>
              </div>
              <div className="bg-purple-600/20 p-3 rounded-full">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Total Commissions Card */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">TOTAL COMMISSIONS</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">{formatSuiAmount(commissionData.totalCommissions).sui}</p>
              </div>
              <img src="/images/logo-sui.png" alt="SUI" className="w-12 h-12 object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Two-Column Table Layout */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Left Column - Affiliate Overview Table */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4DA2FF]" />
              Affiliate Overview
            </h3>
            <div className="space-y-3">
              {/* Personal Members */}
              <div className="border-b border-[#C0E6FF]/10 pb-3">
                <h4 className="text-sm font-medium text-[#C0E6FF] mb-2">Personal Members</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <RoleImage role="NOMAD" size="sm" />
                      <span className="text-white text-sm">Personal Nomad Members</span>
                    </div>
                    <span className="text-white font-semibold">{networkMetrics.personalNomadUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <RoleImage role="PRO" size="sm" />
                      <span className="text-white text-sm">Personal Pro Members</span>
                    </div>
                    <span className="text-white font-semibold">{networkMetrics.personalProUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <RoleImage role="ROYAL" size="sm" />
                      <span className="text-white text-sm">Personal Royal Members</span>
                    </div>
                    <span className="text-white font-semibold">{networkMetrics.personalRoyalUsers}</span>
                  </div>
                </div>
              </div>

              {/* Network Members */}
              <div>
                <h4 className="text-sm font-medium text-[#C0E6FF] mb-2">Total Network Members</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <RoleImage role="NOMAD" size="sm" />
                      <span className="text-white text-sm">Network Nomad Members</span>
                    </div>
                    <span className="text-white font-semibold">{networkMetrics.networkNomadUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <RoleImage role="PRO" size="sm" />
                      <span className="text-white text-sm">Network Pro Members</span>
                    </div>
                    <span className="text-white font-semibold">{networkMetrics.networkProUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <RoleImage role="ROYAL" size="sm" />
                      <span className="text-white text-sm">Network Royal Members</span>
                    </div>
                    <span className="text-white font-semibold">{networkMetrics.networkRoyalUsers}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Network Overview Table (Profile Levels) */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#4DA2FF]" />
              Network Overview (Profile Levels)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-600/20 p-2 rounded-full">
                    <Award className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-white text-sm">Profile Level 5+</span>
                </div>
                <span className="text-white font-semibold">{networkMetrics.networkLevel5Users}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-600/20 p-2 rounded-full">
                    <Award className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-white text-sm">Profile Level 6+</span>
                </div>
                <span className="text-white font-semibold">{networkMetrics.networkLevel6Users}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-pink-600/20 p-2 rounded-full">
                    <Award className="w-4 h-4 text-pink-400" />
                  </div>
                  <span className="text-white text-sm">Profile Level 7+</span>
                </div>
                <span className="text-white font-semibold">{networkMetrics.networkLevel7Users}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-600/20 p-2 rounded-full">
                    <Award className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-white text-sm">Profile Level 8+</span>
                </div>
                <span className="text-white font-semibold">{networkMetrics.networkLevel8Users}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-orange-600/20 p-2 rounded-full">
                    <Award className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="text-white text-sm">Profile Level 9+</span>
                </div>
                <span className="text-white font-semibold">{networkMetrics.networkLevel9Users}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-red-600/20 p-2 rounded-full">
                    <Award className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-white text-sm">Profile Level 10</span>
                </div>
                <span className="text-white font-semibold">{networkMetrics.networkLevel10Users}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Tracking */}
      <CommissionTracking
        commissionData={commissionData}
        loading={commissionLoading}
      />

      {/* Affiliate Users Table */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          {/* Header with Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            {/* Title and View Toggle */}
            <div className="flex items-center gap-4 text-[#FFFFFF]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4DA2FF]" />
                <h3 className="text-xl font-semibold">Affiliates</h3>
              </div>

              {/* View Toggle Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleToggleLatest}
                  size="sm"
                  variant={showLatestOnly ? "default" : "outline"}
                  className={showLatestOnly
                    ? "bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white text-xs h-7 px-3"
                    : "border-[#C0E6FF]/50 text-[#C0E6FF] hover:bg-[#C0E6FF]/10 text-xs h-7 px-3"
                  }
                >
                  Latest 5
                </Button>
                <Button
                  onClick={handleToggleLatest}
                  size="sm"
                  variant={!showLatestOnly ? "default" : "outline"}
                  className={!showLatestOnly
                    ? "bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white text-xs h-7 px-3"
                    : "border-[#C0E6FF]/50 text-[#C0E6FF] hover:bg-[#C0E6FF]/10 text-xs h-7 px-3"
                  }
                >
                  All Affiliates
                </Button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#C0E6FF]" />
                <Input
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF] placeholder:text-[#C0E6FF]/60"
                />
              </div>

              {/* Role Filter */}
              <div className="w-full sm:w-48">
                <Select value={selectedRoleFilter} onValueChange={handleRoleFilterChange}>
                  <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF]">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-[#C0E6FF]" />
                      <SelectValue placeholder="Filter by role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2f51] border-[#C0E6FF]/30">
                    <SelectItem value="ALL" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">All Roles</SelectItem>
                    <SelectItem value="NOMAD" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <RoleImage role="NOMAD" size="sm" />
                        NOMAD
                      </div>
                    </SelectItem>
                    <SelectItem value="PRO" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <RoleImage role="PRO" size="sm" />
                        PRO
                      </div>
                    </SelectItem>
                    <SelectItem value="ROYAL" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <RoleImage role="ROYAL" size="sm" />
                        ROYAL
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Affiliate Level Filter */}
              <div className="w-full sm:w-48">
                <Select value={selectedLevelFilter} onValueChange={handleLevelFilterChange}>
                  <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF]">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#C0E6FF]" />
                      <SelectValue placeholder="Affiliate Levels" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2f51] border-[#C0E6FF]/30">
                    <SelectItem value="ALL" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">All Affiliate Levels</SelectItem>
                    <SelectItem value="Lv. 1" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Award className="w-3 h-3 text-gray-400" />
                        Affiliate Level 1
                      </div>
                    </SelectItem>
                    <SelectItem value="Lv. 2" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Award className="w-3 h-3 text-blue-400" />
                        Affiliate Level 2
                      </div>
                    </SelectItem>
                    <SelectItem value="Lv. 3" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Award className="w-3 h-3 text-green-400" />
                        Affiliate Level 3
                      </div>
                    </SelectItem>
                    <SelectItem value="Lv. 4" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Award className="w-3 h-3 text-yellow-400" />
                        Affiliate Level 4
                      </div>
                    </SelectItem>
                    <SelectItem value="Lv. 5" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Award className="w-3 h-3 text-purple-400" />
                        Affiliate Level 5 (Max)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Profile Level Filter */}
              <div className="w-full sm:w-48">
                <Select value={selectedProfileLevelFilter} onValueChange={handleProfileLevelFilterChange}>
                  <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF]">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#C0E6FF]" />
                      <SelectValue placeholder="Profile Levels" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2f51] border-[#C0E6FF]/30">
                    <SelectItem value="ALL" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">All Profile Levels</SelectItem>
                    <SelectItem value="PL. 1" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-gray-400" />
                        Profile Level 1
                      </div>
                    </SelectItem>
                    <SelectItem value="PL. 2" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-blue-400" />
                        Profile Level 2
                      </div>
                    </SelectItem>
                    <SelectItem value="PL. 3" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-green-400" />
                        Profile Level 3
                      </div>
                    </SelectItem>
                    <SelectItem value="PL. 4" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        Profile Level 4
                      </div>
                    </SelectItem>
                    <SelectItem value="PL. 5" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-orange-400" />
                        Profile Level 5
                      </div>
                    </SelectItem>
                    <SelectItem value="PL. 6" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-red-400" />
                        Profile Level 6
                      </div>
                    </SelectItem>
                    <SelectItem value="PL. 7" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-purple-400" />
                        Profile Level 7
                      </div>
                    </SelectItem>
                    <SelectItem value="PL. 8" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-pink-400" />
                        Profile Level 8
                      </div>
                    </SelectItem>
                    <SelectItem value="PL. 9" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-indigo-400" />
                        Profile Level 9
                      </div>
                    </SelectItem>
                    <SelectItem value="PL. 10" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-emerald-400" />
                        Profile Level 10
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {displayedUsers.length > 0 ? (
              displayedUsers.map((user) => {
                const isExpanded = expandedUsers.has(user.id)

                return (
                  <div key={user.id} className="bg-[#030f1c] border border-[#C0E6FF]/20 rounded-lg overflow-hidden">
                    {/* Main User Info */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => toggleUserExpansion(user.id)}
                    >
                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold text-base">{user.username}</span>
                          <Badge className={`${getKycStatusColor(user.kycStatus)} bg-transparent border-0 text-xs font-semibold px-1 py-0`}>
                            {getKycStatusText(user.kycStatus)}
                          </Badge>
                        </div>
                        <MoreHorizontal className={`w-4 h-4 text-[#C0E6FF] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="w-3 h-3 text-[#C0E6FF]" />
                        <span className="text-[#C0E6FF] text-sm">{user.email}</span>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="w-3 h-3 text-[#4DA2FF]" />
                            <span className="text-[#C0E6FF] text-sm">Profile Lv. {user.profileLevel}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="w-3 h-3 text-[#C0E6FF]" />
                            <span className="text-[#C0E6FF] text-sm">Affiliate Lv. {user.affiliateLevel}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-[#C0E6FF]" />
                            <span className="text-[#C0E6FF] text-xs">{new Date(user.joinDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(user.status)} mb-2`}>
                            <div className="flex items-center gap-1">
                              <RoleImage role={user.status as "NOMAD" | "PRO" | "ROYAL"} size="sm" />
                              <span className="text-xs">{user.status}</span>
                            </div>
                          </Badge>
                          <div className="text-[#4DA2FF] font-bold text-lg">
                            {user.commission.toLocaleString()}
                            <span className="text-xs ml-1">SUI</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Action Buttons */}
                    {isExpanded && (
                      <div className="bg-[#0a1628] p-4 border-t border-[#C0E6FF]/20">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Direct Message Button */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDirectMessage(user)
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-10 w-full"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>

                          {/* Send Email Button */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSendEmail(user)
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-sm h-10 w-full"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </Button>

                          {/* Subscription Reminder Button */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSubscriptionReminder(user)
                            }}
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white text-sm h-10 w-full"
                          >
                            <Bell className="w-4 h-4 mr-2" />
                            Remind
                          </Button>

                          {/* Special Bonus Offer Button */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSpecialBonusOffer(user)
                            }}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white text-sm h-10 w-full"
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            Bonus
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="bg-[#030f1c] border border-[#C0E6FF]/20 rounded-lg p-8 text-center">
                <Search className="w-8 h-8 text-[#C0E6FF]/50 mx-auto mb-2" />
                <p className="text-sm text-[#C0E6FF]">No affiliates found matching your criteria</p>
                <p className="text-xs text-[#C0E6FF]/70">Try adjusting your search or filter settings</p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#C0E6FF]/20">
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[140px]">Username</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[180px]">Email</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[100px]">Join Date</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[80px]">Profile Lv.</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[80px]">Affiliate Lv.</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[100px]">Status</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[80px]">SUI</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.length > 0 ? (
                  displayedUsers.map((user) => {
                    const isHovered = hoveredUsers.has(user.id)

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-[#C0E6FF]/10 hover:bg-[#4DA2FF]/5 transition-colors cursor-pointer"
                        onMouseEnter={() => handleUserHover(user.id, true)}
                        onMouseLeave={() => handleUserHover(user.id, false)}
                      >
                        {!isHovered ? (
                          // Normal row content
                          <>
                            <td className="py-3 px-2 text-left text-[#FFFFFF] text-sm">
                              <div className="flex items-center gap-2">
                                <span className="truncate">{user.username}</span>
                                <Badge className={`${getKycStatusColor(user.kycStatus)} bg-transparent border-0 text-xs font-semibold px-1 py-0`}>
                                  {getKycStatusText(user.kycStatus)}
                                </Badge>
                                <MoreHorizontal className="w-3 h-3 text-[#C0E6FF]/60 ml-auto" />
                              </div>
                            </td>
                            <td className="py-3 px-2 text-left text-[#C0E6FF] text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-left text-[#C0E6FF] text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                <span className="text-xs">{new Date(user.joinDate).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-left text-[#FFFFFF] text-sm">
                              <div className="flex items-center gap-2">
                                <Award className="w-3 h-3 flex-shrink-0 text-[#4DA2FF]" />
                                <span className="font-semibold">{user.profileLevel}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-left text-[#FFFFFF] text-sm">
                              <div className="flex items-center gap-2">
                                <Award className="w-3 h-3 flex-shrink-0 text-[#C0E6FF]" />
                                <span className="font-semibold">{user.affiliateLevel}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-left">
                              <Badge className={getStatusColor(user.status)}>
                                <div className="flex items-center gap-1">
                                  <RoleImage role={user.status as "NOMAD" | "PRO" | "ROYAL"} size="sm" />
                                  <span className="text-xs">{user.status}</span>
                                </div>
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-left text-[#FFFFFF] text-sm font-semibold">
                              {user.commission.toLocaleString()}
                            </td>
                          </>
                        ) : (
                          // Action buttons row spanning all columns
                          <td colSpan={7} className="py-3 px-4 bg-[#0a1628] border border-[#C0E6FF]/30">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                              <div className="flex items-center gap-3">
                                <div className="text-left">
                                  <p className="text-white font-semibold text-sm">{user.username}</p>
                                  <p className="text-[#C0E6FF] text-xs">{user.email}</p>
                                </div>
                              </div>

                              <div className="flex gap-2 flex-wrap">
                                {/* Direct Message Button */}
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDirectMessage(user)
                                  }}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-2 lg:px-3"
                                >
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  <span className="hidden lg:inline">Message</span>
                                  <span className="lg:hidden">Msg</span>
                                </Button>

                                {/* Send Email Button */}
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSendEmail(user)
                                  }}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 px-2 lg:px-3"
                                >
                                  <Mail className="w-3 h-3 mr-1" />
                                  <span className="hidden lg:inline">Email</span>
                                  <span className="lg:hidden">Mail</span>
                                </Button>

                                {/* Subscription Reminder Button */}
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSubscriptionReminder(user)
                                  }}
                                  size="sm"
                                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-8 px-2 lg:px-3"
                                >
                                  <Bell className="w-3 h-3 mr-1" />
                                  <span className="hidden lg:inline">Remind</span>
                                  <span className="lg:hidden">Rem</span>
                                </Button>

                                {/* Special Bonus Offer Button */}
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSpecialBonusOffer(user)
                                  }}
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 px-2 lg:px-3"
                                >
                                  <Gift className="w-3 h-3 mr-1" />
                                  <span className="hidden lg:inline">Bonus</span>
                                  <span className="lg:hidden">Bon</span>
                                </Button>
                              </div>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#C0E6FF]">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-[#C0E6FF]/50" />
                        <p className="text-sm">No affiliates found matching your criteria</p>
                        <p className="text-xs text-[#C0E6FF]/70">Try adjusting your search or filter settings</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Show More Button and Results Count */}
          <div className="mt-4 space-y-3">
            {/* Show More Button */}
            {!showLatestOnly && displayedUsers.length < filteredUsers.length && (
              <div className="text-center">
                <Button
                  onClick={handleShowMore}
                  variant="outline"
                  size="sm"
                  className="border-[#C0E6FF]/50 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                >
                  Show More ({Math.min(5, filteredUsers.length - displayedUsers.length)} more)
                </Button>
              </div>
            )}

            {/* Results Count */}
            <div className="text-center">
              <p className="text-[#C0E6FF] text-sm">
                {showLatestOnly ? (
                  <>Showing latest {displayedUsers.length} of {filteredUsers.length} affiliates</>
                ) : (
                  <>Showing {displayedUsers.length} of {filteredUsers.length} affiliates</>
                )}
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedRoleFilter !== 'ALL' && ` with ${selectedRoleFilter} role`}
                {selectedLevelFilter !== 'ALL' && ` at affiliate ${selectedLevelFilter}`}
                {selectedProfileLevelFilter !== 'ALL' && ` at profile ${selectedProfileLevelFilter}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
