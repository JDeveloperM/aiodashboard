"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RoleImage } from "@/components/ui/role-image"
import { User } from "./user-search-interface"
import {
  MapPin,
  Calendar,
  Clock,
  Award,
  Coins,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageCircle,
  UserPlus,
  MoreHorizontal,
  Trophy,
  ExternalLink
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface UserListItemProps {
  user: User
}

// Achievement image mapping function
const getAchievementImage = (achievementName: string): string | null => {
  const imageMap: { [key: string]: string } = {
    "Profile Picture": "/images/achievements/profile.png",
    "KYC Verification": "/images/achievements/kyc.png",
    "Reach Level 5": "/images/achievements/level 5.png",
    "Connect Discord": "/images/achievements/dicord.png",
    "Connect Telegram": "/images/achievements/telegram.png",
    "Connect X": "/images/achievements/x.png",
    "Connect Bybit": "/images/achievements/bybit.png",
    "Follow Apollon Bot": "/images/achievements/apollon ai.png",
    "Follow Hermes Bot": "/images/achievements/hermes.png",
    "Make 3 Cycles": "/images/achievements/3 cyrcle.png",
    "Upgrade to PRO": "/images/achievements/upgrade to pro.png",
    "Upgrade to ROYAL": "/images/achievements/upgrade to royal.png",
    "Refer 10 NOMADs": "/images/achievements/refer nomad.png",
    "Refer 50 NOMADs": "/images/achievements/refer nomad.png",
    "Refer 100 NOMADs": "/images/achievements/refer nomad.png",
    "Refer 1 PRO": "/images/achievements/refer pro.png",
    "Refer 5 PRO": "/images/achievements/refer pro.png",
    "Refer 10 PRO": "/images/achievements/refer pro.png",
    "Refer 1 ROYAL": "/images/achievements/refer royal.png",
    "Refer 3 ROYAL": "/images/achievements/refer royal.png",
    "Refer 5 ROYAL": "/images/achievements/refer royal.png"
  }
  return imageMap[achievementName] || null
}

export function UserListItem({ user }: UserListItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'idle':
        return 'bg-yellow-500'
      case 'dnd':
        return 'bg-red-500'
      case 'offline':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4 p-4 bg-[#1a2f51]/30 rounded-lg border border-[#C0E6FF]/10 hover:border-[#4DA2FF]/30 hover:bg-[#1a2f51]/50 transition-all duration-200">
        {/* Avatar with Status */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-12 w-12 bg-blue-100">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-[#4DA2FF] text-white font-semibold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {/* Status Indicator */}
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#1a2f51] flex items-center justify-center",
            getStatusColor(user.status)
          )}>
            <div className="w-2 h-2 rounded-full bg-white/90" />
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold truncate">{user.name}</h3>
            <Badge className="bg-[#4DA2FF] text-white">
              <div className="flex items-center gap-1">
                <RoleImage role={user.role} size="sm" />
                {user.role}
              </div>
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  {getKycStatusIcon(user.kycStatus)}
                  <span className={cn("text-xs font-medium", getKycStatusColor(user.kycStatus))}>
                    KYC
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>KYC Status: {user.kycStatus.replace('_', ' ').toUpperCase()}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-[#C0E6FF]/70">
            <span>{user.username}</span>
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{user.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Joined {formatDate(user.joinDate)}</span>
            </div>
          </div>

          {user.activity && (
            <p className="text-[#C0E6FF]/60 text-xs mt-1 italic">{user.activity}</p>
          )}
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center">
                <div className="flex items-center gap-1 text-[#4DA2FF] mb-1">
                  <Award className="w-3 h-3" />
                  <span className="font-medium">Level</span>
                </div>
                <div className="text-white font-bold">{user.level}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>User Level: {user.level}/10</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center">
                <div className="flex items-center gap-1 text-yellow-400 mb-1">
                  <Coins className="w-3 h-3" />
                  <span className="font-medium">Points</span>
                </div>
                <div className="text-white font-bold">
                  {user.totalPoints.toLocaleString()}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
              <p>Total Points: {user.totalPoints.toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center">
                <div className="flex items-center gap-1 text-[#C0E6FF] mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">Active</span>
                </div>
                <div className="text-white font-bold text-xs">
                  {user.lastActive}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
              <p>Last seen: {user.lastActive}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Achievement Icons */}
        {user.achievements && user.achievements.length > 0 && (
          <div className="hidden lg:block text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
              <Trophy className="w-3 h-3" />
              <span className="font-medium text-xs">Achievements</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              {user.achievements
                .filter(achievement => achievement.unlocked)
                .slice(0, 5)
                .map((achievement, index) => {
                  const customImage = getAchievementImage(achievement.name)
                  return (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                          {customImage ? (
                            <Image
                              src={customImage}
                              alt={achievement.name}
                              width={20}
                              height={20}
                              className="w-5 h-5 object-contain"
                            />
                          ) : achievement.image ? (
                            <Image
                              src={achievement.image}
                              alt={achievement.name}
                              width={20}
                              height={20}
                              className="w-5 h-5 object-contain"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: achievement.color }} />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white text-xs">
                        <div className="font-medium">{achievement.name}</div>
                        <div className="text-[#C0E6FF]/70">{achievement.tooltip}</div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              {user.achievements.filter(achievement => achievement.unlocked).length > 5 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#4DA2FF] hover:text-[#4DA2FF]/80 text-xs h-5 px-1 ml-1"
                      onClick={() => {
                        // TODO: Navigate to user profile page
                        console.log('Navigate to profile:', user.id)
                      }}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white text-xs">
                    <p>View all achievements</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
              <p>Send a direct message</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#4DA2FF]/10"
              >
                <UserPlus className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
              <p>Add as friend</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#4DA2FF]/10"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
              <p>More options</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
