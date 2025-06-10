"use client"

import { Hash, Lock, Volume2, ChevronDown, ChevronRight, X, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ChannelSidebarProps {
  selectedChannel: string
  onChannelSelect: (channel: string) => void
  isMobile?: boolean
  onClose?: () => void
}

interface Channel {
  id: string
  name: string
  type: "text" | "voice"
  locked?: boolean
  category?: string
}

interface DirectMessage {
  id: string
  userId: string
  username: string
  avatar?: string
  status: "online" | "idle" | "dnd" | "offline"
  lastMessage?: string
  timestamp?: string
  unread?: boolean
}

const channels: Channel[] = [
  // MAIN
  { id: "announcements", name: "Announcements", type: "text", category: "MAIN" },
  { id: "community-rules", name: "AIO Connect Rules", type: "text", category: "MAIN" },
  { id: "community-updates", name: "AIO Connect Updates", type: "text", category: "MAIN" },

  // AIO CONNECT CHANNELS
  { id: "market-daily", name: "Market Daily", type: "text", category: "AIO CONNECT CHANNELS" },
  { id: "market-updates", name: "Market Updates", type: "text", category: "AIO CONNECT CHANNELS" },
  { id: "market-thoughts", name: "Market Thoughts", type: "text", category: "AIO CONNECT CHANNELS" },

  // AIO CONNECT CHATS
  { id: "general-chat", name: "General Chat", type: "text", category: "AIO CONNECT CHATS" },
  { id: "farming-chat", name: "Farming Chat", type: "text", category: "AIO CONNECT CHATS" },
  { id: "charting-chat", name: "Charting Chat", type: "text", category: "AIO CONNECT CHATS" },
  { id: "gaming-chat", name: "Gaming Chat", type: "text", category: "AIO CONNECT CHATS" },
  { id: "ai-chat", name: "AI Chat", type: "text", category: "AIO CONNECT CHATS" },
]

// Mock direct messages data
const directMessages: DirectMessage[] = [
  {
    id: "dm-1",
    userId: "user-1",
    username: "Trou",
    avatar: "/placeholder-user.jpg",
    status: "online",
    lastMessage: "Hey, how's the trading going?",
    timestamp: "2m ago",
    unread: true
  },
  {
    id: "dm-2",
    userId: "user-2",
    username: "CryptoKing",
    status: "online",
    lastMessage: "Check out this new strategy",
    timestamp: "5m ago"
  },
  {
    id: "dm-3",
    userId: "user-3",
    username: "NFTTrader",
    avatar: "/placeholder-user.jpg",
    status: "idle",
    lastMessage: "Thanks for the tip!",
    timestamp: "1h ago"
  },
  {
    id: "dm-4",
    userId: "user-4",
    username: "MetaGamer",
    status: "dnd",
    lastMessage: "Let's discuss the new update",
    timestamp: "3h ago"
  },
  {
    id: "dm-5",
    userId: "user-5",
    username: "BlockchainDev",
    status: "offline",
    lastMessage: "Good night!",
    timestamp: "1d ago"
  }
]

const categories = [
  "MAIN",
  "COMMUNITY CHANNELS",
  "COMMUNITY CHATS"
]

export function ChannelSidebar({ selectedChannel, onChannelSelect, isMobile, onClose }: ChannelSidebarProps) {
  const [expandedDirectMessages, setExpandedDirectMessages] = useState(true)

  const toggleDirectMessages = () => {
    setExpandedDirectMessages(prev => !prev)
  }

  const getChannelsByCategory = (category: string) => {
    return channels.filter(channel => channel.category === category)
  }

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

  return (
    <div className="flex flex-col h-full">
      {/* Server Header */}
      <div className="p-4 border-b border-[#1A3C6D]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#4DA2FF] to-[#00B8E6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">MetadudesX</h3>
            </div>
          </div>
          {/* Close Button for Mobile */}
          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-[#C0E6FF] hover:text-white hover:bg-[#1A3C6D]/30 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {categories.map(category => {
          const categoryChannels = getChannelsByCategory(category)

          return (
            <div key={category}>
              {/* Category Header */}
              <div className="w-full justify-start text-[#C0E6FF]/70 text-xs font-semibold uppercase tracking-wide mb-1 h-6 px-2 flex items-center">
                {category}
              </div>

              {/* Category Channels */}
              <div className="space-y-0.5 ml-2">
                {categoryChannels.map(channel => (
                  <Button
                    key={channel.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onChannelSelect(channel.id)}
                    className={cn(
                      "w-full justify-start text-[#C0E6FF]/70 hover:text-white hover:bg-[#1A3C6D]/30 h-8 px-2 rounded-md",
                      selectedChannel === channel.id && "bg-[#1A3C6D]/50 text-white"
                    )}
                  >
                    {channel.type === "text" ? (
                      <Hash className="w-4 h-4 mr-2" />
                    ) : (
                      <Volume2 className="w-4 h-4 mr-2" />
                    )}
                    <span className="text-sm">{channel.name}</span>
                    {channel.locked && (
                      <Lock className="w-3 h-3 ml-auto" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Direct Messages Section */}
      <div className="px-2 pb-2">
        {/* Direct Messages Header */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDirectMessages}
          className="w-full justify-start text-[#C0E6FF]/70 hover:text-white text-xs font-semibold uppercase tracking-wide mb-1 h-6 px-2"
        >
          {expandedDirectMessages ? (
            <ChevronDown className="w-3 h-3 mr-1" />
          ) : (
            <ChevronRight className="w-3 h-3 mr-1" />
          )}
          Direct Messages
        </Button>

        {/* Direct Messages List */}
        {expandedDirectMessages && (
          <div className="space-y-0.5 ml-2 max-h-48 overflow-y-auto">
            {directMessages.map(dm => (
              <Button
                key={dm.id}
                variant="ghost"
                size="sm"
                onClick={() => onChannelSelect(`dm-${dm.userId}`)}
                className={cn(
                  "w-full justify-start text-[#C0E6FF]/70 hover:text-white hover:bg-[#1A3C6D]/30 h-10 px-2 rounded-md",
                  selectedChannel === `dm-${dm.userId}` && "bg-[#1A3C6D]/50 text-white"
                )}
              >
                {/* User Avatar */}
                <div className="relative flex-shrink-0 mr-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4DA2FF] to-[#00B8E6] flex items-center justify-center overflow-hidden">
                    {dm.avatar ? (
                      <img
                        src={dm.avatar}
                        alt={dm.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-xs">
                        {dm.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {/* Status Indicator */}
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0c1b36]",
                    getStatusColor(dm.status)
                  )} />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{dm.username}</span>
                    {dm.unread && (
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  {dm.lastMessage && (
                    <div className="text-[#C0E6FF]/50 text-xs truncate">
                      {dm.lastMessage}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="p-3 border-t border-[#1A3C6D]/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#4DA2FF] to-[#00B8E6] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">User</div>
            <div className="text-[#C0E6FF]/70 text-xs">Online</div>
          </div>
        </div>
      </div>
    </div>
  )
}
