/**
 * zkLogin Demo Component
 * Demonstrates full zkLogin functionality including transaction signing
 */

"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Wallet, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { useZkLoginWallet } from '@/hooks/use-zklogin-wallet'
import { useZkLogin } from '@/components/zklogin-provider'
import { ZkLoginSocialLogin } from './zklogin-social-login'
import { toast } from 'sonner'

export function ZkLoginDemo() {
  const zkLogin = useZkLogin()
  const zkWallet = useZkLoginWallet()
  const [transferAmount, setTransferAmount] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address)
    toast.success('Address copied to clipboard!')
  }

  const handleTransfer = async () => {
    if (!transferAmount || !recipientAddress) {
      toast.error('Please enter amount and recipient address')
      return
    }

    try {
      setIsTransferring(true)
      
      // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const amountInMist = (parseFloat(transferAmount) * 1_000_000_000).toString()
      
      const result = await zkWallet.transferSui(recipientAddress, amountInMist)
      
      toast.success(`Transfer successful! Digest: ${result.digest}`)
      
      // Refresh balance after transfer
      await zkWallet.refreshBalance()
      
      // Clear form
      setTransferAmount('')
      setRecipientAddress('')
      
    } catch (error) {
      console.error('Transfer failed:', error)
      toast.error(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTransferring(false)
    }
  }

  const formatBalance = (balance: string | null): string => {
    if (!balance) return '0'
    const balanceInSui = parseInt(balance) / 1_000_000_000
    return balanceInSui.toFixed(6)
  }

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // If not connected, show login interface
  if (!zkLogin.zkLoginUserAddress) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-[#0c1b36] border-[#1e3a8a]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#4DA2FF]" />
            zkLogin Demo
          </CardTitle>
          <p className="text-[#C0E6FF] text-sm">
            Connect with your social account to test zkLogin functionality
          </p>
        </CardHeader>
        <CardContent>
          <ZkLoginSocialLogin />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Account Info Card */}
      <Card className="bg-[#0c1b36] border-[#1e3a8a]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            zkLogin Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Connected</span>
            </div>
            <Badge className="bg-[#4DA2FF] text-white">
              zkLogin
            </Badge>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-[#C0E6FF] text-sm">Wallet Address:</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-[#030F1C] border border-[#C0E6FF]/30 rounded-lg text-[#FFFFFF] text-sm font-mono">
                {zkLogin.zkLoginUserAddress}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyAddress(zkLogin.zkLoginUserAddress!)}
                className="text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(`https://suiexplorer.com/address/${zkLogin.zkLoginUserAddress}?network=devnet`, '_blank')}
                className="text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[#C0E6FF] text-sm">SUI Balance:</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={zkWallet.refreshBalance}
                disabled={zkWallet.isLoading}
                className="text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
              >
                {zkWallet.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="px-3 py-2 bg-[#030F1C] border border-[#C0E6FF]/30 rounded-lg">
              <span className="text-[#FFFFFF] text-lg font-mono">
                {formatBalance(zkWallet.balance)} SUI
              </span>
            </div>
          </div>

          {/* Session Info */}
          <div className="space-y-2">
            <label className="text-[#C0E6FF] text-sm">Session Status:</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="px-3 py-2 bg-[#030F1C] border border-[#C0E6FF]/30 rounded-lg">
                <div className="text-[#C0E6FF] text-xs">Max Epoch</div>
                <div className="text-[#FFFFFF] font-mono">{zkWallet.sessionInfo.maxEpoch}</div>
              </div>
              <div className="px-3 py-2 bg-[#030F1C] border border-[#C0E6FF]/30 rounded-lg">
                <div className="text-[#C0E6FF] text-xs">Expires In</div>
                <div className="text-[#FFFFFF] font-mono">
                  {zkWallet.sessionInfo.expiresIn} epochs
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Card */}
      <Card className="bg-[#0c1b36] border-[#1e3a8a]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-[#4DA2FF]" />
            Transfer SUI
          </CardTitle>
          <p className="text-[#C0E6FF] text-sm">
            Send SUI tokens to another address using zkLogin
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recipient Address */}
          <div className="space-y-2">
            <label className="text-[#C0E6FF] text-sm">Recipient Address:</label>
            <Input
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              className="bg-[#030F1C] border-[#C0E6FF]/30 text-[#FFFFFF]"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-[#C0E6FF] text-sm">Amount (SUI):</label>
            <Input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="0.1"
              step="0.000001"
              min="0"
              className="bg-[#030F1C] border-[#C0E6FF]/30 text-[#FFFFFF]"
            />
          </div>

          {/* Transfer Button */}
          <Button
            onClick={handleTransfer}
            disabled={!zkWallet.isConnected || isTransferring || !transferAmount || !recipientAddress}
            className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
          >
            {isTransferring ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Transfer SUI
              </>
            )}
          </Button>

          {/* Status Messages */}
          {!zkWallet.isConnected && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm">
                zkLogin session is not valid for transactions
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info Card */}
      <Card className="bg-[#0c1b36] border-[#1e3a8a]">
        <CardHeader>
          <CardTitle className="text-white text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs space-y-1">
            <div className="text-[#C0E6FF]">Can Sign Transactions: 
              <span className="text-[#FFFFFF] ml-2">
                {zkWallet.isConnected ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="text-[#C0E6FF]">Session Valid: 
              <span className="text-[#FFFFFF] ml-2">
                {zkWallet.sessionInfo.isValid ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="text-[#C0E6FF]">Current Epoch: 
              <span className="text-[#FFFFFF] ml-2">
                {zkWallet.sessionInfo.currentEpoch || 'Unknown'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
