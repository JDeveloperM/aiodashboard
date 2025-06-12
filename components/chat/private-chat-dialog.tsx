"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { X, MessageCircle, UserCheck, Loader2, Clock } from 'lucide-react'
import { RealtimeChat } from './realtime-chat'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { useFriendRequests } from '@/hooks/use-friend-requests'
import { User } from '@/components/user-search-interface'
import { toast } from 'sonner'

interface PrivateChatDialogProps {
  isOpen: boolean
  onClose: () => void
  targetUser: User | null
}

export function PrivateChatDialog({ isOpen, onClose, targetUser }: PrivateChatDialogProps) {
  const { user, formatAddress } = useSuiAuth()
  const [isRequestSent, setIsRequestSent] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Temporarily simplified - will re-enable friend requests later
  const sendFriendRequest = async (receiverId: string, receiverName: string, receiverAvatar?: string, message?: string) => false
  const areFriends = (otherUserId: string) => false
  const getFriendRequestStatus = (otherUserId: string) => null
  const getPrivateChatRoom = (otherUserId: string) => `private_${[user?.id, otherUserId].sort().join('_')}`
  const isLoading = false
  const initialized = true
  const error = null

  // Reset state when dialog opens/closes or target user changes
  useEffect(() => {
    if (!isOpen || !targetUser) {
      setIsRequestSent(false)
      setIsSending(false)
    }
  }, [isOpen, targetUser])

  if (!user || !targetUser) return null

  const isFriend = areFriends(targetUser.id)
  const requestStatus = getFriendRequestStatus(targetUser.id)
  const chatRoomName = getPrivateChatRoom(targetUser.id)

  const handleSendFriendRequest = async () => {
    if (isSending) return

    setIsSending(true)

    // Simulate friend request for now
    setTimeout(() => {
      setIsRequestSent(true)
      setIsSending(false)
      toast.success(`Friend request sent to ${targetUser.name}!`)
    }, 1000)
  }

  const renderChatContent = () => {
    // Show loading state while initializing
    if (!initialized && isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#4DA2FF]" />
          <p className="text-[#C0E6FF]/70">Loading...</p>
        </div>
      )
    }

    // For now, always show friend request form
    // Will re-enable private chat after fixing authentication issues

    if (requestStatus === 'pending' || isRequestSent) {
      // Friend request is pending
      return (
        <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Friend Request Pending</h3>
            <p className="text-[#C0E6FF]/70 text-sm max-w-sm">
              Your friend request to {targetUser.name} is pending. You'll be able to chat once they accept your request.
            </p>
          </div>
          <Badge variant="outline" className="border-orange-400/30 text-orange-400">
            Waiting for response
          </Badge>
        </div>
      )
    }

    if (requestStatus === 'declined') {
      // Friend request was declined
      return (
        <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Request Declined</h3>
            <p className="text-[#C0E6FF]/70 text-sm max-w-sm">
              Your friend request to {targetUser.name} was declined. You can try sending another request later.
            </p>
          </div>
          <Button
            onClick={handleSendFriendRequest}
            disabled={isSending}
            className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4 mr-2" />
            )}
            Send Another Request
          </Button>
        </div>
      )
    }

    // No friend request sent yet - show friend request form
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-6">
        <Avatar className="w-20 h-20">
          <AvatarImage src={targetUser.avatar} />
          <AvatarFallback className="bg-[#4DA2FF] text-white text-xl">
            {targetUser.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <h3 className="text-white font-semibold mb-2">Connect with {targetUser.name}</h3>
          <p className="text-[#C0E6FF]/70 text-sm max-w-sm mb-4">
            Send a friend request to start chatting privately with {targetUser.name}.
          </p>
        </div>

        <Button
          onClick={handleSendFriendRequest}
          disabled={isSending}
          className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <MessageCircle className="w-4 h-4 mr-2" />
          )}
          Send Friend Request
        </Button>

        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#030f1c] border-[#2a4f71]/30 text-white max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={targetUser.avatar} />
              <AvatarFallback className="bg-[#4DA2FF] text-white text-sm">
                {targetUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span>{targetUser.name}</span>
                {isFriend && (
                  <Badge variant="outline" className="border-green-400/30 text-green-400 text-xs">
                    Friend
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {renderChatContent()}
      </DialogContent>
    </Dialog>
  )
}
