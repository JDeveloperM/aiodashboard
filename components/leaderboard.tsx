"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LeaderboardTable } from '@/components/leaderboard-table'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import {
  LEADERBOARD_CATEGORIES,
  LeaderboardUser
} from '@/lib/leaderboard-service'
import {
  Trophy,
  Users,
  TrendingUp,
  Award,
  Brain,
  Video,
  RefreshCw,
  Calendar,
  Filter,
  BarChart3,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Icon mapping for categories
const CATEGORY_ICONS = {
  Users,
  TrendingUp,
  Award,
  Brain,
  Video,
  Trophy,
  Zap
}

interface LeaderboardStats {
  totalUsers: number
  tierDistribution: {
    NOMAD: number
    PRO: number
    ROYAL: number
  }
  averageLevel: number
  totalXP: number
  totalReferrals: number
}

export function Leaderboard() {
  const [activeCategory, setActiveCategory] = useState('overall')
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly' | 'all-time'>('all-time')

  const {
    data: leaderboardData,
    stats,
    isLoading,
    currentPage,
    totalPages,
    refresh,
    setPage,
    preloadNext
  } = useLeaderboard({
    category: activeCategory,
    timePeriod,
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000 // 5 minutes
  })

  const currentCategory = useMemo(() =>
    LEADERBOARD_CATEGORIES.find(cat => cat.id === activeCategory) || LEADERBOARD_CATEGORIES[0],
    [activeCategory]
  )

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  const handleTimePeriodChange = (period: string) => {
    setTimePeriod(period as 'weekly' | 'monthly' | 'all-time')
  }

  const handlePageChange = (page: number) => {
    setPage(page)
    // Preload next page for better UX
    setTimeout(() => preloadNext(), 100)
  }

  const handleRefresh = async () => {
    await refresh()
    toast.success('Leaderboard refreshed!')
  }

  const handleUserClick = (user: LeaderboardUser) => {
    // Navigate to user profile or show user details
    window.open(`/profile/${user.address}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Leaderboard
          </h1>
          <p className="text-[#C0E6FF] mt-1">
            Compete with the community across different activities and achievements
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Period Filter */}
          <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
            <SelectTrigger className="w-32 bg-[#1a2f51] border-[#1a2f51] text-white">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2f51] border-[#1a2f51]">
              <SelectItem value="weekly" className="text-white hover:bg-[#2a3f61]">Weekly</SelectItem>
              <SelectItem value="monthly" className="text-white hover:bg-[#2a3f61]">Monthly</SelectItem>
              <SelectItem value="all-time" className="text-white hover:bg-[#2a3f61]">All Time</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="bg-[#1a2f51] border-[#1a2f51] text-white hover:bg-[#2a3f61]"
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>



      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 bg-[#1a2f51] p-1">
          {LEADERBOARD_CATEGORIES.map((category) => {
            const IconComponent = CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS] || Trophy
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-2 text-xs lg:text-sm data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white text-[#C0E6FF]"
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden lg:inline">{category.name.replace('Top ', '')}</span>
                <span className="lg:hidden">{category.name.split(' ')[1] || category.name}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {LEADERBOARD_CATEGORIES.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <LeaderboardTable
              users={leaderboardData?.users || []}
              category={category}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onUserClick={handleUserClick}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Last Updated */}
      {leaderboardData?.lastUpdated && (
        <div className="text-center text-xs text-[#C0E6FF]">
          Last updated: {new Date(leaderboardData.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  )
}
