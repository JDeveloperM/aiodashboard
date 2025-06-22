/**
 * Unified Wallet Connect Component
 * Combines traditional wallet connection with zkLogin social authentication
 */

"use client"

import { ConnectButton, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit'
import { useZkLogin } from './zklogin-provider'
import { ZkLoginSocialLogin } from './zklogin-social-login'
import { ZkLoginWalletDisplay } from './zklogin-wallet-display'
import { TraditionalWalletDisplay } from './traditional-wallet-display'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Wallet,
  Users,
  Shield,
  Zap
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useSuiAuth } from '@/contexts/sui-auth-context'

export function UnifiedWalletConnect() {
  const suiAccount = useCurrentAccount()
  const { zkLoginUserAddress, initiateZkLogin } = useZkLogin()
  const [isOpen, setIsOpen] = useState(false)
  const isConnectingRef = useRef(false)

  // Determine connection state and display
  const getConnectionState = () => {
    if (suiAccount) {
      return {
        isConnected: true,
        address: suiAccount.address,
        type: 'Crypto Wallet',
        icon: <Wallet className="w-4 h-4 text-green-400" />,
        color: 'text-green-400'
      }
    }
    
    if (zkLoginUserAddress) {
      return {
        isConnected: true,
        address: zkLoginUserAddress,
        type: 'zkLogin',
        icon: <Shield className="w-4 h-4 text-orange-400" />,
        color: 'text-orange-400'
      }
    }

    return {
      isConnected: false,
      address: null,
      type: null,
      icon: <Wallet className="w-4 h-4 text-white" />,
      color: 'text-white'
    }
  }

  const connectionState = getConnectionState()

  // Auto-close dialog when wallet connects successfully (only during connection process)
  useEffect(() => {
    if (suiAccount && isConnectingRef.current) {
      // We just connected during a connection process
      isConnectingRef.current = false

      // Small delay to let the user see the connection success
      const timeoutId = setTimeout(() => {
        setIsOpen(false)
        toast.success('Wallet connected successfully!')
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [suiAccount])

  // Connected state - show appropriate wallet display
  if (connectionState.isConnected) {
    // For zkLogin users, use the zkLogin wallet display
    if (zkLoginUserAddress && !suiAccount) {
      return <ZkLoginWalletDisplay />
    }

    // For traditional wallet users, use the traditional wallet display
    if (suiAccount) {
      return <TraditionalWalletDisplay />
    }
  }

  // Not connected - show connect dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#4DA2FF]/25"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#0c1b36] border-[#1e3a8a] text-white max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold text-white">
            Login to your account
          </DialogTitle>
          <p className="text-[#C0E6FF] text-sm">
            Own your game. Trade securely on AIONET.
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Google Login Button */}
          <Button
            onClick={async () => {
              try {
                // First initiate zkLogin to get nonce
                await initiateZkLogin()

                // Wait a bit for nonce to be set
                setTimeout(() => {
                  const currentNonce = localStorage.getItem('zklogin_nonce')
                  if (!currentNonce) {
                    toast.error('Failed to generate nonce')
                    return
                  }

                  const redirectUri = window.location.origin + '/zklogin/callback'
                  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

                  // Build OAuth URL
                  const params = new URLSearchParams({
                    client_id: clientId,
                    redirect_uri: redirectUri,
                    response_type: 'id_token',
                    scope: 'openid email profile',
                    nonce: currentNonce,
                    prompt: 'select_account'
                  })

                  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

                  // Redirect to Google OAuth
                  window.location.href = authUrl
                }, 100)
              } catch (error) {
                console.error('Google login failed:', error)
                toast.error('Failed to initiate Google login')
              }
            }}
            className="w-full bg-transparent border border-[#C0E6FF]/30 text-white hover:bg-[#C0E6FF]/10 py-3 rounded-lg flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Login with Google
          </Button>

          {/* Separator */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#C0E6FF]/20"></div>
            <span className="text-[#C0E6FF]/60 text-sm">Or continue with</span>
            <div className="flex-1 h-px bg-[#C0E6FF]/20"></div>
          </div>

          {/* Wallet Connect Button */}
          <div
            className="w-full"
            onClick={() => {
              // Mark that we're in a connection process
              if (!suiAccount) {
                isConnectingRef.current = true
              }
            }}
          >
            <ConnectButton
              connectText="Connect Wallet"
              className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white py-3 rounded-lg font-medium"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
