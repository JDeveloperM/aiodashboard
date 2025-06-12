"use client"

import { Crown, Shield, Star, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface User {
  id: string
  name: string
  avatar?: string
  status: "online" | "idle" | "dnd" | "offline"
  role?: "Admin" | "Moderator" | "VIP" | "Premium"
  activity?: string
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "donG",
    avatar: "/placeholder-user.jpg",
    status: "online",
    role: "Admin",
    activity: "Managing server"
  },
  {
    id: "2",
    name: "Zealot",
    avatar: "/placeholder-user.jpg",
    status: "online",
    role: "Moderator",
    activity: "Moderating chat"
  },
  {
    id: "3",
    name: "TauCee",
    avatar: "/placeholder-user.jpg",
    status: "online"
  },
  {
    id: "4",
    name: "CryptoTrader",
    status: "online",
    role: "VIP",
    activity: "Trading crypto"
  },
  {
    id: "5",
    name: "NFTCollector",
    status: "idle",
    role: "Premium"
  },
  {
    id: "6",
    name: "AffiliateUser1",
    status: "online"
  },
  {
    id: "7",
    name: "AffiliateUser2",
    status: "dnd",
    activity: "In a meeting"
  },
  {
    id: "8",
    name: "AffiliateUser3",
    status: "idle"
  }
]

export function UserList() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "idle":
        return "bg-yellow-500"
      case "dnd":
        return "bg-red-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "Admin":
        return <Crown className="w-3 h-3 text-red-400" />
      case "Moderator":
        return <Shield className="w-3 h-3 text-green-400" />
      case "VIP":
        return <Star className="w-3 h-3 text-purple-400" />
      case "Premium":
        return <Circle className="w-3 h-3 text-blue-400" />
      default:
        return null
    }
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "Admin":
        return "text-red-400"
      case "Moderator":
        return "text-green-400"
      case "VIP":
        return "text-purple-400"
      case "Premium":
        return "text-blue-400"
      default:
        return "text-[#C0E6FF]"
    }
  }

  // Group users by role and status
  const admins = mockUsers.filter(user => user.role === "Admin")
  const moderators = mockUsers.filter(user => user.role === "Moderator")
  const vips = mockUsers.filter(user => user.role === "VIP")
  const premiums = mockUsers.filter(user => user.role === "Premium")
  const members = mockUsers.filter(user => !user.role)

  const onlineCount = mockUsers.filter(user => user.status === "online").length

  const UserItem = ({ user }: { user: User }) => (
    <div className="flex items-center gap-2 p-1.5 rounded hover:bg-[#1A3C6D]/20 cursor-pointer group">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4DA2FF] to-[#00B8E6] flex items-center justify-center overflow-hidden">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-xs">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {/* Status Indicator */}
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0c1b36]",
          getStatusColor(user.status)
        )} />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className={cn("text-sm font-medium truncate", getRoleColor(user.role))}>
            {user.name}
          </span>
          {getRoleIcon(user.role)}
        </div>
        {user.activity && (
          <div className="text-[#C0E6FF]/50 text-xs truncate">
            {user.activity}
          </div>
        )}
      </div>
    </div>
  )

  const UserGroup = ({ title, users, count }: { title: string; users: User[]; count?: number }) => {
    if (users.length === 0) return null

    return (
      <div className="mb-4">
        <div className="text-[#C0E6FF]/70 text-xs font-semibold uppercase tracking-wide mb-2 px-2">
          {title} {count !== undefined && `— ${count}`}
        </div>
        <div className="space-y-0.5">
          {users.map(user => (
            <UserItem key={user.id} user={user} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#0c1b36]/30 p-3 overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-white font-semibold text-sm mb-1">Members</h3>
        <div className="text-[#C0E6FF]/70 text-xs">
          {onlineCount} online • {mockUsers.length} members
        </div>
      </div>

      {/* User Groups */}
      <div className="space-y-2">
        <UserGroup title="Admins" users={admins} />
        <UserGroup title="Moderators" users={moderators} />
        <UserGroup title="VIP Members" users={vips} />
        <UserGroup title="Premium Members" users={premiums} />
        <UserGroup title="Members" users={members} count={members.filter(u => u.status === "online").length} />
      </div>
    </div>
  )
}
