"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ForumPost, forumService } from "@/lib/forum-service"
import {
  Pin,
  Clock,
  Crown,
  Star,
  Lock
} from "lucide-react"

interface ForumPostCardProps {
  post: ForumPost
  onClick?: () => void
  showActions?: boolean
  currentUserAddress?: string
}

export function ForumPostCard({
  post,
  onClick,
  showActions = false,
  currentUserAddress
}: ForumPostCardProps) {


  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'ROYAL': return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 'PRO': return 'bg-gradient-to-r from-purple-400 to-purple-600'
      case 'NOMAD': return 'bg-gradient-to-r from-blue-400 to-blue-600'
      default: return 'bg-gray-500'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'ROYAL': return <Crown className="w-3 h-3" />
      case 'PRO': return <Star className="w-3 h-3" />
      default: return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }



  return (
    <Card 
      className="bg-[#1a2f51] border-[#C0E6FF]/10 hover:border-[#C0E6FF]/30 transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Post Header */}
            <div className="flex items-center gap-2 mb-2">
              {post.is_pinned && (
                <Pin className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              )}
              {post.is_locked && (
                <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <h3 className="text-white font-semibold hover:text-[#4DA2FF] transition-colors truncate group-hover:text-[#4DA2FF]">
                {post.title}
              </h3>
            </div>

            {/* Author and Meta Info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={post.author_avatar} />
                  <AvatarFallback className="bg-[#4DA2FF] text-white text-xs">
                    {post.author_username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Badge className={`${getTierBadgeColor(post.author_tier || 'NOMAD')} text-white text-xs px-2 py-1 flex items-center gap-1`}>
                  {getTierIcon(post.author_tier || 'NOMAD')}
                  {post.author_username || `User ${post.author_address.slice(0, 6)}`}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-[#C0E6FF]/70">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                {post.category_name && (
                  <Badge variant="outline" className="text-xs border-[#C0E6FF]/30 text-[#C0E6FF]/70">
                    {post.category_name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Post Content Preview */}
            <div className="text-[#C0E6FF]/80 text-sm mb-3 line-clamp-2">
              {post.content.length > 150 
                ? `${post.content.substring(0, 150)}...` 
                : post.content
              }
            </div>
          </div>


        </div>


      </CardContent>
    </Card>
  )
}
