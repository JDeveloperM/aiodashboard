"use client"

import { useState, useEffect } from "react"
import { CreatorCards } from "./creator-cards"
import { useCreators } from "@/contexts/creators-context"
import { Search, Filter, Users, TrendingUp, BookOpen, FileText, Coins, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { Creator, Channel } from "@/contexts/creators-context"



export function AIOCreatorsInterface() {
  const { creators } = useCreators()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<'subscribers' | 'name' | 'category'>('subscribers')

  const categories = [
    { value: "all", label: "All Categories", icon: Users },
    { value: "trading", label: "Trading", icon: TrendingUp },
    { value: "defi", label: "DeFi", icon: Coins },
    { value: "analysis", label: "Analysis", icon: FileText },
    { value: "education", label: "Education", icon: BookOpen },
    { value: "nfts", label: "NFTs", icon: Play }
  ]

  // Filter and sort creators
  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || 
                           creator.category.toLowerCase() === selectedCategory.toLowerCase()

    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'category':
        return a.category.localeCompare(b.category)
      case 'subscribers':
      default:
        return b.subscribers - a.subscribers
    }
  })

  const handleAccessChannel = (creatorId: string, channelId: string) => {
    const creator = creators.find(c => c.id === creatorId)
    const channel = creator?.channels.find(ch => ch.id === channelId)

    if (creator && channel) {
      toast.success(`Accessing ${channel.name} by ${creator.name}`)
      // Redirect to Telegram channel
      if (channel.telegramUrl) {
        window.open(channel.telegramUrl, '_blank')
      }
    }
  }

  const getTotalStats = () => {
    const totalCreators = filteredCreators.length
    // Fixed values as requested
    const totalSubscribers = 340
    const totalChannels = 8
    const freeChannels = filteredCreators.reduce((sum, creator) =>
      sum + creator.channels.filter(ch => ch.type === 'free').length, 0)

    return { totalCreators, totalSubscribers, totalChannels, freeChannels }
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#C0E6FF]" />
              <Input
                placeholder="Search creators, categories, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF] placeholder:text-[#C0E6FF]/60"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48 bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2f51] border-[#C0E6FF]/30">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <SelectItem key={category.value} value={category.value} className="text-[#FFFFFF]">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full lg:w-40 bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2f51] border-[#C0E6FF]/30">
                <SelectItem value="subscribers" className="text-[#FFFFFF]">Subscribers</SelectItem>
                <SelectItem value="name" className="text-[#FFFFFF]">Name</SelectItem>
                <SelectItem value="category" className="text-[#FFFFFF]">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Summary */}
          <div className="pt-4 border-t border-[#C0E6FF]/20 mt-4">
            {/* Mobile: Stack vertically */}
            <div className="flex flex-col gap-3 md:hidden">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4DA2FF]" />
                <span className="text-[#C0E6FF] text-sm">
                  {stats.totalCreators} creator{stats.totalCreators !== 1 ? 's' : ''} found
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                  {stats.freeChannels} Free Channels
                </Badge>
                <Badge variant="outline" className="border-[#4DA2FF] text-[#4DA2FF] text-xs">
                  {stats.totalChannels} Total Channels
                </Badge>
                <Badge variant="outline" className="border-orange-400 text-orange-400 text-xs">
                  {stats.totalSubscribers.toLocaleString()} Subscribers
                </Badge>
              </div>
            </div>

            {/* Desktop: Side by side */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4DA2FF]" />
                <span className="text-[#C0E6FF] text-sm">
                  {stats.totalCreators} creator{stats.totalCreators !== 1 ? 's' : ''} found
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-green-400 text-green-400">
                  {stats.freeChannels} Free Channels
                </Badge>
                <Badge variant="outline" className="border-[#4DA2FF] text-[#4DA2FF]">
                  {stats.totalChannels} Total Channels
                </Badge>
                <Badge variant="outline" className="border-orange-400 text-orange-400">
                  {stats.totalSubscribers.toLocaleString()} Subscribers
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creators Grid */}
      {filteredCreators.length === 0 ? (
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-[#C0E6FF]/50 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">
                No creators found
              </h3>
              <p className="text-[#C0E6FF] max-w-md mx-auto">
                Try adjusting your search criteria or filters to find more creators.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <CreatorCards 
          creators={filteredCreators}
          onAccessChannel={handleAccessChannel}
        />
      )}
    </div>
  )
}
