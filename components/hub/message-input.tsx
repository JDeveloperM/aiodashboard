"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Smile, Gift, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageInputProps {
  channel: string
}

export function MessageInput({ channel }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = () => {
    if (message.trim()) {
      // In a real app, this would send the message to the server
      console.log(`Sending message to ${channel}:`, message)
      setMessage("")
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    setIsTyping(e.target.value.length > 0)
  }

  return (
    <div className="p-4 border-t border-[#1A3C6D]/30 bg-[#0c1b36]/50">
      {/* Typing Indicator */}
      {isTyping && (
        <div className="mb-2 text-[#C0E6FF]/70 text-xs">
          <span className="italic">You are typing...</span>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-3">
        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 bg-[#1A3C6D]/30 hover:bg-[#1A3C6D]/50 text-[#C0E6FF] hover:text-white rounded-full"
        >
          <Plus className="w-5 h-5" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={`Message #${channel}`}
            className={cn(
              "bg-[#1A3C6D]/30 border-[#1A3C6D]/50 text-white placeholder:text-[#C0E6FF]/50",
              "focus:border-[#4DA2FF]/50 focus:ring-[#4DA2FF]/20",
              "rounded-lg h-10 pr-20"
            )}
          />
          
          {/* Input Actions */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-[#C0E6FF]/70 hover:text-white"
            >
              <Gift className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-[#C0E6FF]/70 hover:text-white"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          className={cn(
            "h-10 w-10 p-0 rounded-full",
            message.trim() 
              ? "bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white" 
              : "bg-[#1A3C6D]/30 text-[#C0E6FF]/50 cursor-not-allowed"
          )}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Channel Info */}
      <div className="mt-2 text-[#C0E6FF]/50 text-xs">
        {channel === "general-chat" && "Use /help for available commands"}
        {channel === "verify" && "Please follow the verification process"}
        {channel === "rules" && "Read-only channel for community guidelines"}
      </div>
    </div>
  )
}
