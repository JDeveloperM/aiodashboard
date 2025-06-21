/**
 * zkLogin Debug Component
 * Shows current zkLogin state for debugging
 */

"use client"

import { useZkLogin } from './zklogin-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export function ZkLoginDebug() {
  const zkLogin = useZkLogin()
  const [showSensitive, setShowSensitive] = useState(false)

  const formatValue = (value: any, isSensitive = false) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-500">null</span>
    }
    
    if (typeof value === 'string' && value.length > 50 && isSensitive && !showSensitive) {
      return <span className="text-yellow-400">{value.substring(0, 20)}...***HIDDEN***</span>
    }
    
    if (typeof value === 'string' && value.length > 100 && !isSensitive) {
      return <span className="text-blue-400">{value.substring(0, 50)}...{value.substring(value.length - 10)}</span>
    }
    
    return <span className="text-green-400">{String(value)}</span>
  }

  const getStatusColor = (hasValue: boolean) => {
    return hasValue ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  return (
    <Card className="bg-[#0c1b36] border-[#1e3a8a] mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">zkLogin Debug Info</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSensitive(!showSensitive)}
              className="text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
            >
              {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showSensitive ? 'Hide' : 'Show'} Sensitive
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.location.reload()}
              className="text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Badge className={getStatusColor(!!zkLogin.zkLoginUserAddress)}>
            Address: {zkLogin.zkLoginUserAddress ? 'Set' : 'None'}
          </Badge>
          <Badge className={getStatusColor(!!zkLogin.jwt)}>
            JWT: {zkLogin.jwt ? 'Set' : 'None'}
          </Badge>
          <Badge className={getStatusColor(!!zkLogin.userSalt)}>
            Salt: {zkLogin.userSalt ? 'Set' : 'None'}
          </Badge>
          <Badge className={getStatusColor(!!zkLogin.ephemeralKeyPair)}>
            Key: {zkLogin.ephemeralKeyPair ? 'Set' : 'None'}
          </Badge>
        </div>

        {/* Detailed State */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[#C0E6FF] font-medium mb-2">Connection State:</div>
              <div className="space-y-1 font-mono text-xs">
                <div>isLoading: {formatValue(zkLogin.isLoading)}</div>
                <div>error: {formatValue(zkLogin.error)}</div>
                <div>currentEpoch: {formatValue(zkLogin.currentEpoch)}</div>
                <div>maxEpoch: {formatValue(zkLogin.maxEpoch)}</div>
                <div>canSignTransactions: {formatValue(zkLogin.canSignTransactions())}</div>
                <div>isSessionValid: {formatValue(zkLogin.isSessionValid())}</div>
              </div>
            </div>

            <div>
              <div className="text-[#C0E6FF] font-medium mb-2">zkLogin Data:</div>
              <div className="space-y-1 font-mono text-xs">
                <div>nonce: {formatValue(zkLogin.nonce)}</div>
                <div>randomness: {formatValue(zkLogin.randomness, true)}</div>
                <div>userSalt: {formatValue(zkLogin.userSalt, true)}</div>
                <div>address: {formatValue(zkLogin.zkLoginUserAddress)}</div>
              </div>
            </div>
          </div>

          {/* JWT Details */}
          {zkLogin.jwt && (
            <div>
              <div className="text-[#C0E6FF] font-medium mb-2">JWT Details:</div>
              <div className="bg-[#030F1C] border border-[#C0E6FF]/30 rounded-lg p-3">
                <div className="font-mono text-xs space-y-1">
                  <div>JWT: {formatValue(zkLogin.jwt, true)}</div>
                  {showSensitive && zkLogin.jwt && (
                    <div className="mt-2">
                      <div className="text-[#C0E6FF] text-xs mb-1">Decoded Payload:</div>
                      <pre className="text-xs text-green-400 whitespace-pre-wrap">
                        {JSON.stringify(
                          JSON.parse(atob(zkLogin.jwt.split('.')[1])), 
                          null, 
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Local Storage Debug */}
          <div>
            <div className="text-[#C0E6FF] font-medium mb-2">Local Storage:</div>
            <div className="bg-[#030F1C] border border-[#C0E6FF]/30 rounded-lg p-3">
              <div className="font-mono text-xs space-y-1">
                <div>zklogin_jwt: {formatValue(localStorage.getItem('zklogin_jwt'), true)}</div>
                <div>zklogin_address: {formatValue(localStorage.getItem('zklogin_address'))}</div>
                <div>zklogin_user_salt: {formatValue(localStorage.getItem('zklogin_user_salt'), true)}</div>
                <div>zklogin_nonce: {formatValue(localStorage.getItem('zklogin_nonce'))}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                localStorage.removeItem('zklogin_jwt')
                localStorage.removeItem('zklogin_address')
                localStorage.removeItem('zklogin_user_salt')
                localStorage.removeItem('zklogin_nonce')
                localStorage.removeItem('zklogin_ephemeral_key')
                localStorage.removeItem('zklogin_max_epoch')
                localStorage.removeItem('zklogin_randomness')
                window.location.reload()
              }}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Clear All Data
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => zkLogin.reset()}
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              Reset zkLogin
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
