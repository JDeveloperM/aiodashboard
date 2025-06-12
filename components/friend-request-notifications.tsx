"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { UserCheck, UserX, Clock, X } from 'lucide-react'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { useFriendRequests } from '@/hooks/use-friend-requests'
import { toast } from 'sonner'

export function FriendRequestNotifications() {
  const [isVisible, setIsVisible] = useState(false)
  const { user, formatAddress } = useSuiAuth()

  const {
    friendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    isLoading
  } = useFriendRequests({
    userId: user?.id || '',
    userName: user?.username || formatAddress(user?.address || '') || 'Anonymous',
    userAvatar: user?.profileImage,
    enabled: !!user
  })

  // Get pending friend requests received by current user
  const pendingRequests = friendRequests.filter(
    request => request.receiver_id === user?.id && request.status === 'pending'
  )

  // Show notification when there are pending requests
  useEffect(() => {
    if (pendingRequests.length > 0) {
      setIsVisible(true)
    }
  }, [pendingRequests.length])

  const handleAccept = async (requestId: string, senderName: string) => {
    const success = await acceptFriendRequest(requestId)
    if (success) {
      toast.success(`You are now friends with ${senderName}!`)
    }
  }

  const handleDecline = async (requestId: string, senderName: string) => {
    const success = await declineFriendRequest(requestId)
    if (success) {
      toast.info(`Declined friend request from ${senderName}`)
    }
  }

  if (!user || pendingRequests.length === 0 || !isVisible) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-40 max-w-sm">
      <Card className="bg-[#030f1c] border-[#2a4f71]/30 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#4DA2FF]" />
              <span className="text-white font-medium text-sm">Friend Requests</span>
              <Badge variant="outline" className="border-[#4DA2FF]/30 text-[#4DA2FF] text-xs">
                {pendingRequests.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 text-[#C0E6FF]/60 hover:text-[#C0E6FF]"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {pendingRequests.slice(0, 3).map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-3 p-3 bg-[#1a2f51]/30 rounded-lg border border-[#C0E6FF]/10"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={request.sender_avatar} />
                  <AvatarFallback className="bg-[#4DA2FF] text-white text-sm">
                    {request.sender_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {request.sender_name}
                  </p>
                  <p className="text-[#C0E6FF]/70 text-xs truncate">
                    {request.message || 'Wants to connect with you'}
                  </p>
                  <p className="text-[#C0E6FF]/50 text-xs">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(request.id, request.sender_name)}
                    disabled={isLoading}
                    className="h-6 px-2 bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    <UserCheck className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecline(request.id, request.sender_name)}
                    disabled={isLoading}
                    className="h-6 px-2 border-red-400/30 text-red-400 hover:bg-red-400/10 text-xs"
                  >
                    <UserX className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}

            {pendingRequests.length > 3 && (
              <div className="text-center">
                <p className="text-[#C0E6FF]/70 text-xs">
                  +{pendingRequests.length - 3} more requests
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
