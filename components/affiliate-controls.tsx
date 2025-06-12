"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoleImage } from "@/components/ui/role-image"
import { 
  Users, 
  CheckCircle, 
  Star, 
  Search, 
  Filter, 
  Award, 
  Mail, 
  Calendar, 
  MoreHorizontal,
  MessageCircle,
  Bell,
  Gift
} from "lucide-react"

interface InvitedUser {
  id: string
  username: string
  email: string
  joinDate: string
  status: 'NOMAD' | 'PRO' | 'ROYAL'
  commission: number
  kycStatus: 'verified' | 'pending' | 'not_verified'
  level: number
}

export function AffiliateControls() {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'NOMAD' | 'PRO' | 'ROYAL'>('ALL')
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'ALL' | '1-3' | '4-6' | '7-10'>('ALL')
  const [showLatestOnly, setShowLatestOnly] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(5)

  // Metrics data
  const metrics = {
    totalInvites: 247,
    newUsers: 168,
    totalCommission: 12450
  }

  // Sample invited users data
  const invitedUsers: InvitedUser[] = [
    {
      id: "1",
      username: "crypto_trader_01",
      email: "trader01@example.com",
      joinDate: "2024-01-15",
      status: "PRO",
      commission: 125,
      kycStatus: "verified",
      level: 5
    },
    {
      id: "2", 
      username: "defi_enthusiast",
      email: "defi@example.com",
      joinDate: "2024-01-10",
      status: "ROYAL",
      commission: 375,
      kycStatus: "verified",
      level: 8
    },
    {
      id: "3",
      username: "blockchain_newbie",
      email: "newbie@example.com", 
      joinDate: "2024-01-20",
      status: "NOMAD",
      commission: 25,
      kycStatus: "pending",
      level: 2
    },
    {
      id: "4",
      username: "nft_collector",
      email: "nft@example.com",
      joinDate: "2024-01-08",
      status: "PRO", 
      commission: 150,
      kycStatus: "verified",
      level: 6
    },
    {
      id: "5",
      username: "yield_farmer",
      email: "yield@example.com",
      joinDate: "2024-01-25",
      status: "ROYAL",
      commission: 400,
      kycStatus: "verified", 
      level: 9
    }
  ]

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

  // Filter users based on search term and filters
  const filteredUsers = invitedUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRoleFilter === 'ALL' || user.status === selectedRoleFilter
    
    const matchesLevel = selectedLevelFilter === 'ALL' || 
                        (selectedLevelFilter === '1-3' && user.level >= 1 && user.level <= 3) ||
                        (selectedLevelFilter === '4-6' && user.level >= 4 && user.level <= 6) ||
                        (selectedLevelFilter === '7-10' && user.level >= 7 && user.level <= 10)
    
    return matchesSearch && matchesRole && matchesLevel
  })

  // Sort by join date (newest first) and get latest 5 or paginated results
  const sortedUsers = [...filteredUsers].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())

  // Get latest 5 referrals for the "Latest Referrals" section
  const latestReferrals = sortedUsers.slice(0, 5)

  // Get displayed users based on pagination
  const displayedUsers = showLatestOnly ? latestReferrals : sortedUsers.slice(0, displayedCount)

  // Show more functionality
  const handleShowMore = () => {
    setDisplayedCount(prev => prev + 5)
  }

  const handleToggleLatest = () => {
    setShowLatestOnly(!showLatestOnly)
    setDisplayedCount(5) // Reset pagination when switching views
  }

  // Action handlers
  const handleDirectMessage = (user: InvitedUser) => {
    console.log('Direct message to:', user.username)
  }

  const handleSendEmail = (user: InvitedUser) => {
    console.log('Send email to:', user.email)
  }

  const handleSubscriptionReminder = (user: InvitedUser) => {
    console.log('Send subscription reminder to:', user.username)
  }

  const handleSpecialBonusOffer = (user: InvitedUser) => {
    console.log('Send special bonus offer to:', user.username)
  }

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">Total Invites</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">{metrics.totalInvites}</p>
                <p className="text-xs text-[#C0E6FF] mt-1">Users invited via your link</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">New Users</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">{metrics.newUsers}</p>
                <p className="text-xs text-[#C0E6FF] mt-1">Successfully joined</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">Total Points</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">{metrics.totalCommission.toLocaleString()}</p>
                <p className="text-xs text-[#C0E6FF] mt-1">Lifetime earnings</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">Conversion Rate</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">
                  {Math.round((metrics.newUsers / metrics.totalInvites) * 100)}%
                </p>
                <p className="text-xs text-[#C0E6FF] mt-1">Invite to signup rate</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <Badge className="bg-[#4DA2FF] text-white">68%</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invited Users Table */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          {/* Header with Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            {/* Title and View Toggle */}
            <div className="flex items-center gap-4 text-[#FFFFFF]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4DA2FF]" />
                <h3 className="text-xl font-semibold">Referrals</h3>
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
                  All Referrals
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
                <Select value={selectedRoleFilter} onValueChange={(value: 'ALL' | 'NOMAD' | 'PRO' | 'ROYAL') => setSelectedRoleFilter(value)}>
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

              {/* Level Filter */}
              <div className="w-full sm:w-48">
                <Select value={selectedLevelFilter} onValueChange={(value: 'ALL' | '1-3' | '4-6' | '7-10') => setSelectedLevelFilter(value)}>
                  <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF]">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#C0E6FF]" />
                      <SelectValue placeholder="Filter by level" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2f51] border-[#C0E6FF]/30">
                    <SelectItem value="ALL" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">All Levels</SelectItem>
                    <SelectItem value="1-3" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Award className="w-3 h-3 text-[#4DA2FF]" />
                        Level 1-3
                      </div>
                    </SelectItem>
                    <SelectItem value="4-6" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Award className="w-3 h-3 text-[#4DA2FF]" />
                        Level 4-6
                      </div>
                    </SelectItem>
                    <SelectItem value="7-10" className="text-[#FFFFFF] hover:bg-[#4DA2FF]/20">
                      <div className="flex items-center gap-2">
                        <Award className="w-3 h-3 text-[#4DA2FF]" />
                        Level 7-10
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
                const [isExpanded, setIsExpanded] = React.useState(false)

                return (
                  <div key={user.id} className="bg-[#030f1c] border border-[#C0E6FF]/20 rounded-lg overflow-hidden">
                    {/* Main User Info */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setIsExpanded(!isExpanded)}
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
                            <span className="text-[#C0E6FF] text-sm">Level {user.level}</span>
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
                <p className="text-sm text-[#C0E6FF]">No referrals found matching your criteria</p>
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
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[80px]">Level</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[100px]">Status</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium min-w-[80px]">SUI</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.length > 0 ? (
                  displayedUsers.map((user) => {
                    const [isHovered, setIsHovered] = React.useState(false)

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-[#C0E6FF]/10 hover:bg-[#4DA2FF]/5 transition-colors cursor-pointer"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
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
                                <span className="font-semibold">{user.level}</span>
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
                          <td colSpan={6} className="py-3 px-4 bg-[#0a1628] border border-[#C0E6FF]/30">
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
                    <td colSpan={6} className="py-8 text-center text-[#C0E6FF]">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-[#C0E6FF]/50" />
                        <p className="text-sm">No referrals found matching your criteria</p>
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
                  <>Showing latest {displayedUsers.length} of {filteredUsers.length} referrals</>
                ) : (
                  <>Showing {displayedUsers.length} of {filteredUsers.length} referrals</>
                )}
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedRoleFilter !== 'ALL' && ` with ${selectedRoleFilter} role`}
                {selectedLevelFilter !== 'ALL' && ` at level ${selectedLevelFilter}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
