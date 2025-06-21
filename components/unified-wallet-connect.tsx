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
  const { zkLoginUserAddress } = useZkLogin()
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

      <DialogContent className="bg-[#0c1b36] border-[#1e3a8a] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#4DA2FF]" />
            Connect to Sui
          </DialogTitle>
          <p className="text-[#C0E6FF] text-sm">
            Choose your preferred connection method
          </p>
        </DialogHeader>

        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#030F1C] border border-[#1e3a8a]">
            <TabsTrigger 
              value="wallet" 
              className="data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white text-[#C0E6FF]"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Crypto Wallet
            </TabsTrigger>
            <TabsTrigger 
              value="social" 
              className="data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white text-[#C0E6FF]"
            >
              <Shield className="w-4 h-4 mr-2" />
              zkLogin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="mt-4">
            <Card className="bg-[#030F1C] border-[#1e3a8a]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Crypto Wallet
                </CardTitle>
                <p className="text-[#C0E6FF] text-sm">
                  Connect using your existing Sui wallet extension
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-2">
                  {/* Use the ConnectButton directly with custom styling */}
                  <div
                    className="sui-connect-button-wrapper w-full"
                    onClick={() => {
                      // Mark that we're in a connection process
                      if (!suiAccount) {
                        isConnectingRef.current = true
                      }
                    }}
                  >
                    <ConnectButton
                      connectText="Connect Wallet"
                      className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-[#FFFFFF] font-medium text-sm">Supported Wallets:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      'Sui Wallet',
                      'Suiet Wallet', 
                      'Ethos Wallet',
                      'Martian Wallet'
                    ].map((wallet, index) => (
                      <div key={index} className="flex items-center gap-2 text-[#C0E6FF]">
                        <div className="w-1.5 h-1.5 bg-[#4DA2FF] rounded-full"></div>
                        {wallet}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <Card className="bg-[#030F1C] border-[#1e3a8a]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  zkLogin (Social)
                </CardTitle>
                <p className="text-[#C0E6FF] text-sm">
                  Use your social accounts - no private keys needed
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ZkLoginSocialLogin
                  onSuccess={(address) => {
                    setIsOpen(false)
                    // Let the zkLogin callback page handle the redirect logic
                    // based on whether the user is new or returning
                  }}
                />
                
                <div className="space-y-2">
                  <h4 className="text-[#FFFFFF] font-medium text-sm">Benefits:</h4>
                  <div className="space-y-1 text-xs">
                    {[
                      { icon: <Zap className="w-3 h-3" />, text: 'No private keys to manage' },
                      { icon: <Shield className="w-3 h-3" />, text: 'Zero-knowledge privacy' },
                      { icon: <Users className="w-3 h-3" />, text: 'Familiar social login' }
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-[#C0E6FF]">
                        {benefit.icon}
                        {benefit.text}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
