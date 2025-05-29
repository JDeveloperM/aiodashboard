"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Reply, Smile } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  user: {
    name: string
    avatar: string
    role?: string
    isBot?: boolean
  }
  content: string
  timestamp: string
  reactions?: { emoji: string; count: number; users: string[] }[]
  attachments?: { type: string; url: string; name: string }[]
}

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  const [showActions, setShowActions] = useState(false)

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

  const getRoleBadge = (role?: string) => {
    if (!role) return null
    
    const badgeColors = {
      Admin: "bg-red-500/20 text-red-400 border-red-500/30",
      Moderator: "bg-green-500/20 text-green-400 border-green-500/30",
      VIP: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      Premium: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }

    return (
      <span className={cn(
        "px-1.5 py-0.5 text-xs font-medium rounded border ml-2",
        badgeColors[role as keyof typeof badgeColors] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
      )}>
        {role}
      </span>
    )
  }

  return (
    <div 
      className="group flex gap-3 hover:bg-[#1A3C6D]/10 p-2 rounded-lg transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4DA2FF] to-[#00B8E6] flex items-center justify-center overflow-hidden">
          {message.user.avatar ? (
            <img 
              src={message.user.avatar} 
              alt={message.user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {message.user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("font-semibold text-sm", getRoleColor(message.user.role))}>
            {message.user.name}
          </span>
          {getRoleBadge(message.user.role)}
          {message.user.isBot && (
            <span className="bg-[#4DA2FF]/20 text-[#4DA2FF] px-1.5 py-0.5 text-xs font-medium rounded border border-[#4DA2FF]/30">
              BOT
            </span>
          )}
          <span className="text-[#C0E6FF]/50 text-xs">
            {message.timestamp}
          </span>
        </div>

        {/* Message Text */}
        <div className="text-[#C0E6FF] text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="bg-[#1A3C6D]/30 rounded-lg p-3 border border-[#1A3C6D]/50">
                <div className="text-[#4DA2FF] text-sm font-medium">{attachment.name}</div>
                <div className="text-[#C0E6FF]/70 text-xs">{attachment.type}</div>
              </div>
            ))}
          </div>
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-2">
            {message.reactions.map((reaction, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="h-6 px-2 bg-[#1A3C6D]/30 hover:bg-[#1A3C6D]/50 border border-[#1A3C6D]/50 rounded-full"
              >
                <span className="text-sm mr-1">{reaction.emoji}</span>
                <span className="text-[#C0E6FF] text-xs">{reaction.count}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Message Actions */}
      {showActions && (
        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-[#1A3C6D]/50 hover:bg-[#1A3C6D]/70 text-[#C0E6FF] hover:text-white"
          >
            <Smile className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-[#1A3C6D]/50 hover:bg-[#1A3C6D]/70 text-[#C0E6FF] hover:text-white"
          >
            <Reply className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-[#1A3C6D]/50 hover:bg-[#1A3C6D]/70 text-[#C0E6FF] hover:text-white"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
