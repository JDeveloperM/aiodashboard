"use client"

import { useSuiAuth } from '@/contexts/sui-auth-context'
import { useFriendRequests } from '@/hooks/use-friend-requests'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function FriendRequestDebug() {
  const { user, formatAddress } = useSuiAuth()

  const {
    friendRequests,
    friendships,
    isLoading,
    error,
    initialized,
    friendshipMap,
    requestMap,
    reload
  } = useFriendRequests({
    userId: user?.id || '',
    userName: user?.username || formatAddress(user?.address || '') || 'Anonymous',
    userAvatar: user?.profileImage,
    enabled: !!user
  })

  if (!user) {
    return (
      <Card className="bg-[#030f1c] border-[#2a4f71]/30 text-white">
        <CardHeader>
          <CardTitle>Friend Request Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User not authenticated</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#030f1c] border-[#2a4f71]/30 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Friend Request Debug
          <Button onClick={reload} size="sm" variant="outline">
            Reload
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Status</h4>
          <div className="flex gap-2 flex-wrap">
            <Badge variant={initialized ? "default" : "secondary"}>
              {initialized ? "Initialized" : "Not Initialized"}
            </Badge>
            <Badge variant={isLoading ? "secondary" : "default"}>
              {isLoading ? "Loading" : "Ready"}
            </Badge>
            {error && <Badge variant="destructive">Error</Badge>}
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <div>
          <h4 className="font-semibold mb-2">Current User</h4>
          <p className="text-sm text-[#C0E6FF]/70">
            ID: {user.id}<br/>
            Name: {user.username || formatAddress(user.address)}
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Friend Requests ({friendRequests.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {friendRequests.length === 0 ? (
              <p className="text-[#C0E6FF]/50 text-sm">No friend requests</p>
            ) : (
              friendRequests.map(request => (
                <div key={request.id} className="p-2 bg-[#1a2f51]/30 rounded text-sm">
                  <div className="flex justify-between items-center">
                    <span>
                      {request.sender_id === user.id ? 'To' : 'From'}: {' '}
                      {request.sender_id === user.id ? request.receiver_name : request.sender_name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-[#C0E6FF]/50 text-xs mt-1">
                    {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Friendships ({friendships.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {friendships.length === 0 ? (
              <p className="text-[#C0E6FF]/50 text-sm">No friendships</p>
            ) : (
              friendships.map(friendship => (
                <div key={friendship.id} className="p-2 bg-[#1a2f51]/30 rounded text-sm">
                  <span>
                    {friendship.user1_id === user.id ? friendship.user2_name : friendship.user1_name}
                  </span>
                  <p className="text-[#C0E6FF]/50 text-xs mt-1">
                    {new Date(friendship.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Maps Debug</h4>
          <p className="text-sm text-[#C0E6FF]/70">
            Friendship Map Size: {friendshipMap.size}<br/>
            Request Map Size: {requestMap.size}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
