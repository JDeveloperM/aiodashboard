"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { ZkLoginProvider } from './zklogin-provider'
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
  const [suiClient] = useState(() => new SuiClient({ url: getFullnodeUrl('devnet') }))

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="devnet">
        <WalletProvider>
          <ZkLoginProvider suiClient={suiClient}>
            {children}
          </ZkLoginProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
