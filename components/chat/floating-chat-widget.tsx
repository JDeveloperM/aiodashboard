"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, X, Minus } from 'lucide-react'
import { RealtimeChat } from './realtime-chat'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { cn } from '@/lib/utils'

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, isSignedIn, formatAddress } = useSuiAuth()

  // Don't render if user is not signed in
  if (!isSignedIn || !user) {
    return null
  }

  const toggleChat = () => {
    if (isOpen) {
      setIsOpen(false)
      setIsMinimized(false)
    } else {
      setIsOpen(true)
      setIsMinimized(false)
      setUnreadCount(0) // Clear unread count when opening
    }
  }

  const minimizeChat = () => {
    setIsMinimized(true)
  }

  const restoreChat = () => {
    setIsMinimized(false)
    setUnreadCount(0) // Clear unread count when restoring
  }

  const handleNewMessage = (messages: any[]) => {
    // If chat is closed or minimized, increment unread count
    if (!isOpen || isMinimized) {
      setUnreadCount(prev => prev + 1)
    }
  }

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out',
            isMinimized 
              ? 'w-80 h-12' 
              : 'w-80 h-96 sm:w-96 sm:h-[500px]'
          )}
        >
          {isMinimized ? (
            /* Minimized State */
            <div 
              className="bg-[#030f1c] border border-[#2a4f71]/30 rounded-lg p-3 cursor-pointer hover:bg-[#0a1a2e] transition-colors"
              onClick={restoreChat}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#4DA2FF]" />
                  <span className="text-[#C0E6FF] font-medium">Global Chat</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(false)
                    setIsMinimized(false)
                  }}
                  className="h-6 w-6 p-0 text-[#C0E6FF]/60 hover:text-[#C0E6FF] hover:bg-[#1a2f51]"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            /* Expanded State */
            <div className="bg-[#030f1c] border border-[#2a4f71]/30 rounded-lg shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-3 border-b border-[#2a4f71]/30 bg-[#0a1a2e]">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#4DA2FF]" />
                  <span className="text-[#C0E6FF] font-medium">Global Chat</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={minimizeChat}
                    className="h-6 w-6 p-0 text-[#C0E6FF]/60 hover:text-[#C0E6FF] hover:bg-[#1a2f51]"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleChat}
                    className="h-6 w-6 p-0 text-[#C0E6FF]/60 hover:text-[#C0E6FF] hover:bg-[#1a2f51]"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Chat Content */}
              <div className="h-[calc(100%-60px)]">
                <RealtimeChat
                  roomName="global"
                  userId={user.id}
                  userName={user.username || formatAddress(user.address) || 'Anonymous'}
                  userAvatar={user.profileImage}
                  onMessage={handleNewMessage}
                  className="h-full border-none rounded-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      )}
    </>
  )
}
