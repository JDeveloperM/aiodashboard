"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Users,
  MessageCircle,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Search,
  RefreshCw,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

interface AccessToken {
  token: string
  userId: string
  creatorId: string
  channelId: string
  channelName: string
  creatorName: string
  subscriptionDuration: number
  subscriptionStartDate: string
  subscriptionEndDate: string
  tier: string
  paymentAmount: number
  used: boolean
  createdAt: string
  usedAt?: string
  telegramUserId?: string
  telegramUsername?: string
}

interface AdminStats {
  totalTokens: number
  usedTokens: number
  activeSubscriptions: number
  expiredSubscriptions: number
  totalRevenue: number
}

export function TelegramAdminDashboard() {
  const [tokens, setTokens] = useState<AccessToken[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalTokens: 0,
    usedTokens: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    totalRevenue: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showTokens, setShowTokens] = useState(false)

  const fetchTokens = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would be an admin-only API endpoint
      const response = await fetch('/api/telegram/admin/tokens', {
        headers: {
          'Authorization': 'Bearer admin-token' // Add proper admin authentication
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTokens(data.tokens || [])
        calculateStats(data.tokens || [])
      } else {
        toast.error('Failed to fetch tokens')
      }
    } catch (error) {
      console.error('Error fetching tokens:', error)
      toast.error('Error fetching data')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (tokenList: AccessToken[]) => {
    const now = new Date()
    let activeCount = 0
    let expiredCount = 0
    let totalRevenue = 0

    tokenList.forEach(token => {
      totalRevenue += token.paymentAmount
      
      if (token.used) {
        const endDate = new Date(token.subscriptionEndDate)
        if (now <= endDate) {
          activeCount++
        } else {
          expiredCount++
        }
      }
    })

    setStats({
      totalTokens: tokenList.length,
      usedTokens: tokenList.filter(t => t.used).length,
      activeSubscriptions: activeCount,
      expiredSubscriptions: expiredCount,
      totalRevenue
    })
  }

  const filteredTokens = tokens.filter(token => 
    token.channelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (token.telegramUsername && token.telegramUsername.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getDaysRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const isActive = (endDate: string) => {
    return new Date() <= new Date(endDate)
  }

  useEffect(() => {
    fetchTokens()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Telegram Controls</h2>
          <p className="text-[#C0E6FF]">Monitor and manage premium channel access tokens</p>
        </div>
        <Button onClick={fetchTokens} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Tokens</p>
                <p className="text-xl font-bold text-white">{stats.totalTokens}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Used Tokens</p>
                <p className="text-xl font-bold text-white">{stats.usedTokens}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Active Subs</p>
                <p className="text-xl font-bold text-white">{stats.activeSubscriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Expired</p>
                <p className="text-xl font-bold text-white">{stats.expiredSubscriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Revenue</p>
                <p className="text-xl font-bold text-white">{stats.totalRevenue.toFixed(2)} SUI</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by channel, creator, user ID, or Telegram username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1a2f51] border-[#C0E6FF]/30 text-white"
            />
          </div>
        </div>
        <Button
          onClick={() => setShowTokens(!showTokens)}
          variant="outline"
          size="sm"
        >
          {showTokens ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showTokens ? 'Hide' : 'Show'} Tokens
        </Button>
      </div>

      {/* Tokens Table */}
      <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
        <CardHeader>
          <CardTitle className="text-[#C0E6FF]">Access Tokens ({filteredTokens.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTokens.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {isLoading ? 'Loading...' : 'No tokens found'}
              </div>
            ) : (
              filteredTokens.map((token) => (
                <div key={token.token} className="border border-[#C0E6FF]/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white">{token.channelName}</h4>
                      <p className="text-sm text-gray-400">by {token.creatorName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={token.used ? "default" : "outline"}>
                        {token.used ? 'Used' : 'Unused'}
                      </Badge>
                      {token.used && (
                        <Badge variant={isActive(token.subscriptionEndDate) ? "default" : "destructive"}>
                          {isActive(token.subscriptionEndDate) ? 'Active' : 'Expired'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="text-white">{token.subscriptionDuration} days</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Amount</p>
                      <p className="text-white">{token.paymentAmount} SUI</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Tier</p>
                      <p className="text-white">{token.tier}</p>
                    </div>
                    {token.used && token.subscriptionEndDate && (
                      <div>
                        <p className="text-gray-400">Days Left</p>
                        <p className="text-white">{getDaysRemaining(token.subscriptionEndDate)}</p>
                      </div>
                    )}
                  </div>

                  {token.telegramUserId && (
                    <div className="bg-[#030f1c] p-3 rounded border border-[#C0E6FF]/20">
                      <p className="text-sm text-gray-400 mb-1">Telegram User</p>
                      <p className="text-white">
                        {token.telegramUsername ? `@${token.telegramUsername}` : `ID: ${token.telegramUserId}`}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 text-xs text-gray-400">
                    <span>Created: {formatDate(token.createdAt)}</span>
                    {token.usedAt && <span>• Used: {formatDate(token.usedAt)}</span>}
                    {token.subscriptionEndDate && <span>• Expires: {formatDate(token.subscriptionEndDate)}</span>}
                  </div>

                  {showTokens && (
                    <div className="bg-[#030f1c] p-3 rounded border border-[#C0E6FF]/20">
                      <div className="flex items-center justify-between">
                        <code className="text-xs text-[#C0E6FF] break-all">{token.token}</code>
                        <Button
                          onClick={() => copyToClipboard(token.token)}
                          size="sm"
                          variant="outline"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
