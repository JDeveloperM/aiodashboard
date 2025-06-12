"use client"

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ChatMessage } from '@/hooks/use-realtime-chat'

interface ChatMessageItemProps {
  message: ChatMessage
  isOwnMessage: boolean
  showHeader: boolean
}

export const ChatMessageItem = ({ message, isOwnMessage, showHeader }: ChatMessageItemProps) => {
  return (
    <div className={`flex mt-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={cn('max-w-[75%] w-fit flex gap-2', {
          'flex-row-reverse': isOwnMessage,
        })}
      >
        {/* Avatar - only show for other users and when showing header */}
        {!isOwnMessage && showHeader && (
          <Avatar className="w-6 h-6 mt-1">
            <AvatarImage src={message.user.avatar} />
            <AvatarFallback className="text-xs bg-[#1a2f51] text-[#C0E6FF]">
              {message.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn('flex flex-col gap-1', {
          'items-end': isOwnMessage,
        })}>
          {/* Message header with name and time */}
          {showHeader && (
            <div
              className={cn('flex items-center gap-2 text-xs px-3', {
                'justify-end flex-row-reverse': isOwnMessage,
              })}
            >
              <span className="font-medium text-[#C0E6FF]">{message.user.name}</span>
              <span className="text-[#C0E6FF]/50 text-xs">
                {new Date(message.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          )}
          
          {/* Message content */}
          <div
            className={cn(
              'py-2 px-3 rounded-xl text-sm w-fit max-w-full break-words',
              isOwnMessage 
                ? 'bg-[#4DA2FF] text-white' 
                : 'bg-[#1a2f51] text-[#C0E6FF] border border-[#2a4f71]/30'
            )}
          >
            {message.content}
          </div>
        </div>
      </div>
    </div>
  )
}
