"use client"

import { TelegramAdminDashboard } from '@/components/telegram-admin-dashboard'
import { useSubscription } from '@/contexts/subscription-context'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, AlertTriangle } from 'lucide-react'

export default function TelegramAdminPage() {
  const { tier } = useSubscription()
  const { isSignedIn } = useSuiAuth()

  // Simple access control - in production, implement proper admin authentication
  const isAdmin = (tier === 'PRO' || tier === 'ROYAL') && isSignedIn

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto bg-[#1a2f51] border-[#C0E6FF]/30">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
            <p className="text-[#C0E6FF]">Please sign in to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto bg-[#1a2f51] border-[#C0E6FF]/30">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-[#C0E6FF] mb-4">
              Admin access is restricted to PRO and ROYAL tier users only.
            </p>
            <p className="text-sm text-gray-400">
              Current tier: <span className="text-white font-medium">{tier}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TelegramAdminDashboard />
    </div>
  )
}
