"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RoleImage } from "@/components/ui/role-image"

import { User } from "./user-search-interface"

import {
  Crown,
  Shield,
  Star,
  MapPin,
  Calendar,
  Clock,
  Award,
  Coins,
  CheckCircle,
  AlertCircle,
  XCircle,

  Trophy,
  ExternalLink,
  UserCheck,
  Loader2
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface UserCardProps {
  user: User
}

export function UserCard({ user }: UserCardProps) {
  const getKycStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-3 h-3 text-green-400" />
      case 'pending':
        return <AlertCircle className="w-3 h-3 text-yellow-400" />
      case 'not_verified':
        return <XCircle className="w-3 h-3 text-red-400" />
      default:
        return <XCircle className="w-3 h-3 text-red-400" />
    }
  }

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-400'
      case 'pending':
        return 'text-yellow-400'
      case 'not_verified':
        return 'text-red-400'
      default:
        return 'text-red-400'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ROYAL':
        return 'from-purple-600 to-pink-600'
      case 'PRO':
        return 'from-blue-600 to-cyan-600'
      case 'NOMAD':
        return 'from-gray-600 to-gray-700'
      default:
        return 'from-gray-600 to-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <TooltipProvider>
      <div className="enhanced-card group hover:border-[#4DA2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#4DA2FF]/10">
        <div className="enhanced-card-content">
          {/* Header with Role Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-6 h-6 flex items-center justify-center">
              <RoleImage role={user.role} size="md" />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  {getKycStatusIcon(user.kycStatus)}
                  <span className={cn("text-xs font-medium", getKycStatusColor(user.kycStatus))}>
                    KYC
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
                <p>KYC Status: {user.kycStatus.replace('_', ' ').toUpperCase()}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative mb-3">
              <Avatar className="h-20 w-20 bg-blue-100 ring-2 ring-[#4DA2FF]/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-[#4DA2FF] text-white text-xl font-semibold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className="text-center">
              <h3 className="text-white font-semibold text-lg mb-1">{user.name}</h3>
              <p className="text-[#C0E6FF] text-sm mb-2">{user.username}</p>
              {user.activity && (
                <p className="text-[#C0E6FF]/70 text-xs italic">{user.activity}</p>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 bg-[#1a2f51]/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Award className="w-3 h-3 text-[#4DA2FF]" />
                    <span className="text-[#4DA2FF] text-xs font-medium">Level</span>
                  </div>
                  <div className="text-white font-bold">{user.level}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
                <p>User Level: {user.level}/10</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 bg-[#1a2f51]/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Coins className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400 text-xs font-medium">Points</span>
                  </div>
                  <div className="text-white font-bold text-sm">
                    {user.totalPoints.toLocaleString()}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
                <p>Total Points: {user.totalPoints.toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Additional Info */}
          <div className="space-y-2 mb-4 text-xs">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-[#C0E6FF]/70">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {formatDate(user.joinDate)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Member since: {formatDate(user.joinDate)}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-[#C0E6FF]/70">
                  <Clock className="w-3 h-3" />
                  <span>Active {user.lastActive}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Last seen: {user.lastActive}</p>
              </TooltipContent>
            </Tooltip>

            {user.location && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-[#C0E6FF]/70">
                    <MapPin className="w-3 h-3" />
                    <span>{user.location}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
                  <p>Location: {user.location}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mb-4">
              <p className="text-[#C0E6FF]/80 text-xs leading-relaxed overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {user.bio}
              </p>
            </div>
          )}

          {/* KYC Info */}
          <div className="mb-4 p-3 bg-[#1a2f51]/30 rounded-lg border border-[#C0E6FF]/10">
            <div className="flex items-center justify-center text-xs">
              <div className="flex items-center gap-1">
                {getKycStatusIcon(user.kycStatus)}
                <span className={cn("font-medium", getKycStatusColor(user.kycStatus))}>
                  KYC {user.kycStatus.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Achievement Badges */}
          {user.achievements && user.achievements.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-3 h-3 text-[#4DA2FF]" />
                <span className="text-[#C0E6FF] text-xs font-medium">Achievements</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {user.achievements.slice(0, 6).map((achievement, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                        {achievement.image ? (
                          <Image
                            src={achievement.image}
                            alt={achievement.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain"
                          />
                        ) : achievement.icon ? (
                          <achievement.icon className="w-8 h-8" />
                        ) : (
                          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: achievement.color }} />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
                      <div className="text-center">
                        <p className="font-medium">{achievement.name}</p>
                        <p className="text-xs text-[#C0E6FF]/70">{achievement.tooltip}</p>
                        <p className="text-xs text-yellow-400">{achievement.xp} XP</p>
                        <p className="text-xs">
                          {achievement.unlocked
                            ? (achievement.claimed ? "✓ Claimed" : "🎁 Available")
                            : "🔒 Locked"
                          }
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {user.achievements.length > 6 && (
                  <div className="w-6 h-6 rounded-full bg-[#1a2f51]/50 border border-[#C0E6FF]/30 flex items-center justify-center text-xs text-[#C0E6FF]">
                    +{user.achievements.length - 6}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Media */}
          {user.socialMedia && user.socialMedia.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-3 h-3 text-[#4DA2FF]" />
                <span className="text-[#C0E6FF] text-xs font-medium">Social Media</span>
              </div>
              <div className="flex gap-2">
                {user.socialMedia.map((social, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-200",
                        social.connected
                          ? "bg-[#4DA2FF]/20 border-[#4DA2FF]/50 hover:bg-[#4DA2FF]/30"
                          : "bg-gray-600/20 border-gray-600/50 hover:bg-gray-600/30"
                      )}>
                        <Image
                          src={social.image}
                          alt={social.platform}
                          width={20}
                          height={20}
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
                      <div className="text-center">
                        <p className="font-medium">{social.platform}</p>
                        {social.connected ? (
                          <>
                            <p className="text-xs text-green-400">✓ Connected</p>
                            <p className="text-xs text-[#C0E6FF]/70">{social.username}</p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-400">Not connected</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}


        </div>
      </div>


    </TooltipProvider>
  )
}
