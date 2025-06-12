"use client"

import { useState, useRef, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2, AlertCircle } from 'lucide-react'
import { ChatMessageItem } from './chat-message'
import { useRealtimeChat } from '@/hooks/use-realtime-chat'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import { cn } from '@/lib/utils'

interface RealtimeChatProps {
  roomName: string
  userId: string
  userName: string
  userAvatar?: string
  className?: string
  onMessage?: (messages: any[]) => void
  messages?: any[]
}

export function RealtimeChat({
  roomName,
  userId,
  userName,
  userAvatar,
  className,
  onMessage,
  messages: initialMessages
}: RealtimeChatProps) {
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    messages,
    sendMessage,
    isLoading,
    error,
    isConnected
  } = useRealtimeChat({
    roomName,
    userId,
    userName,
    userAvatar,
    onMessage,
    messages: initialMessages
  })

  const messagesEndRef = useChatScroll(messages)

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return

    setIsSending(true)
    try {
      await sendMessage(inputValue)
      setInputValue('')
      inputRef.current?.focus()
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const shouldShowHeader = (index: number) => {
    if (index === 0) return true
    
    const currentMessage = messages[index]
    const previousMessage = messages[index - 1]
    
    // Show header if different user or more than 5 minutes apart
    if (currentMessage.user.id !== previousMessage.user.id) return true
    
    const timeDiff = new Date(currentMessage.createdAt).getTime() - new Date(previousMessage.createdAt).getTime()
    return timeDiff > 5 * 60 * 1000 // 5 minutes
  }

  return (
    <div className={cn('flex flex-col h-full bg-[#030f1c] border border-[#2a4f71]/30 rounded-lg', className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2a4f71]/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-semibold text-[#C0E6FF]">Global Chat</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#C0E6FF]/60">
          {isConnected ? (
            <span className="text-green-400">Connected</span>
          ) : (
            <span className="text-orange-400">Connecting...</span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-3">
        <div ref={messagesEndRef} className="space-y-1">
          {isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#4DA2FF]" />
              <span className="ml-2 text-[#C0E6FF]/60">Loading messages...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {messages.length === 0 && !isLoading && !error && (
            <div className="text-center py-8 text-[#C0E6FF]/60">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              isOwnMessage={message.user.id === userId}
              showHeader={shouldShowHeader(index)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-3 border-t border-[#2a4f71]/30">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending || !isConnected}
            className="flex-1 bg-[#1a2f51] border-[#2a4f71]/30 text-[#C0E6FF] placeholder:text-[#C0E6FF]/40 focus:border-[#4DA2FF] focus:ring-[#4DA2FF]/20"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isSending || !isConnected}
            size="sm"
            className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
