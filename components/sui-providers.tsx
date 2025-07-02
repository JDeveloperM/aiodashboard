"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { ZkLoginProvider } from './zklogin-provider'
import { SuiAuthProvider } from '@/contexts/sui-auth-context'
import { WalletReconnection } from './wallet-reconnection'
import { WalrusProvider } from './walrus-provider'
import { AvatarProvider } from '@/contexts/avatar-context'
import '@mysten/dapp-kit/dist/index.css'
import { useState } from 'react'

// Create networks configuration
const networks = {
  devnet: { url: getFullnodeUrl('devnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  testnet: { url: getFullnodeUrl('testnet') },
}

export function SuiProviders({ children }: { children: React.ReactNode }) {
  // Create a stable QueryClient instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))

  // Create SuiClient for zkLogin
  const [suiClient] = useState(() => new SuiClient({ url: getFullnodeUrl('testnet') }))

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider
          autoConnect={true}
          enableUnsafeBurner={false}
          storageKey="sui-wallet-connection"
        >
          <ZkLoginProvider suiClient={suiClient}>
            <SuiAuthProvider>
              <WalrusProvider enableToasts={true} autoRetry={true}>
                <AvatarProvider>
                  <WalletReconnection />
                  {children}
                </AvatarProvider>
              </WalrusProvider>
            </SuiAuthProvider>
          </ZkLoginProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
