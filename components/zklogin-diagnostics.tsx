"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useZkLoginWallet } from '@/hooks/use-zklogin-wallet'
import { useZkLogin } from '@/components/zklogin-provider'
import { useSuiClient } from '@mysten/dapp-kit'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Wallet, 
  Network, 
  Clock,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

export function ZkLoginDiagnostics() {
  const { wallet, isConnected, balance, sessionInfo, refreshBalance } = useZkLoginWallet()
  const zkLogin = useZkLogin()
  const suiClient = useSuiClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [networkInfo, setNetworkInfo] = useState<any>(null)

  // Get network info
  useEffect(() => {
    const getNetworkInfo = async () => {
      try {
        const chainId = await suiClient.getChainIdentifier()
        // Get the latest checkpoint using the correct method
        const latestCheckpoint = await suiClient.getLatestSuiSystemState()
        setNetworkInfo({
          chainId,
          epoch: latestCheckpoint.epoch,
          timestamp: Date.now() // Use current timestamp as fallback
        })
      } catch (error) {
        console.error('Failed to get network info:', error)
      }
    }
    getNetworkInfo()
  }, [suiClient])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshBalance()
      toast.success('Balance refreshed!')
    } catch (error) {
      toast.error('Failed to refresh balance')
    } finally {
      setIsRefreshing(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const formatBalance = (balance: string | null) => {
    if (!balance) return '0'
    const balanceNum = parseFloat(balance) / 1_000_000_000 // Convert from MIST to SUI
    return balanceNum.toFixed(4)
  }

  const getStatusIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#030F1C] border-[#1a2f51]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Network className="w-5 h-5" />
            Network Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Network</p>
              <Badge variant="outline" className="text-white">
                {process.env.NEXT_PUBLIC_SUI_NETWORK || 'devnet'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-400">RPC URL</p>
              <p className="text-xs text-white truncate">
                {process.env.NEXT_PUBLIC_SUI_RPC_URL || 'https://fullnode.devnet.sui.io'}
              </p>
            </div>
          </div>
          
          {networkInfo && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Chain ID</p>
                <p className="text-sm text-white">{networkInfo.chainId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Current Epoch</p>
                <p className="text-sm text-white">{networkInfo.epoch}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#030F1C] border-[#1a2f51]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Wallet className="w-5 h-5" />
            zkLogin Wallet Status
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="ml-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Connection Status</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(isConnected)}
              <span className="text-white">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {sessionInfo.address && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-[#1a2f51] px-2 py-1 rounded text-white truncate flex-1">
                  {sessionInfo.address}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(sessionInfo.address!, 'Address')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://suiscan.xyz/${process.env.NEXT_PUBLIC_SUI_NETWORK}/account/${sessionInfo.address}`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-gray-400">SUI Balance</span>
            <span className="text-white font-mono">
              {formatBalance(balance)} SUI
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Session Valid</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(sessionInfo.isValid)}
              <span className="text-white">
                {sessionInfo.isValid ? 'Valid' : 'Invalid/Expired'}
              </span>
            </div>
          </div>

          {sessionInfo.maxEpoch && sessionInfo.currentEpoch && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Session Expires</span>
                <span className="text-white">
                  Epoch {sessionInfo.maxEpoch}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Epochs Remaining</span>
                <span className="text-white">
                  {sessionInfo.expiresIn || 0}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#030F1C] border-[#1a2f51]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Clock className="w-5 h-5" />
            zkLogin Session Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">JWT Available</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(!!zkLogin.jwt)}
              <span className="text-white">
                {zkLogin.jwt ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Ephemeral Key</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(!!zkLogin.ephemeralKeyPair)}
              <span className="text-white">
                {zkLogin.ephemeralKeyPair ? 'Generated' : 'Missing'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">User Salt</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(!!zkLogin.userSalt)}
              <span className="text-white">
                {zkLogin.userSalt ? 'Available' : 'Missing'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Can Sign Transactions</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(zkLogin.canSignTransactions())}
              <span className="text-white">
                {zkLogin.canSignTransactions() ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isConnected && (
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">zkLogin Wallet Not Connected</p>
            </div>
            <p className="text-sm text-yellow-300 mt-2">
              Please sign in with your social account to connect your zkLogin wallet.
            </p>
          </CardContent>
        </Card>
      )}

      {parseFloat(formatBalance(balance)) < 0.1 && isConnected && (
        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-400">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Low Balance</p>
            </div>
            <p className="text-sm text-orange-300 mt-2">
              You need more SUI tokens to perform transactions. Get {process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet'} tokens from the Sui Discord faucet:
            </p>
            <code className="text-xs bg-orange-500/20 px-2 py-1 rounded mt-2 block">
              !faucet {process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet'} {sessionInfo.address}
            </code>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
