"use client"

import { useEffect } from 'react'
import { useSuiClientContext } from '@mysten/dapp-kit'
import { registerEnokiWallets, isEnokiNetwork } from '@mysten/enoki'

export function EnokiWalletRegistration() {
  const { client, network } = useSuiClientContext()

  useEffect(() => {
    // Only register on supported networks
    if (!isEnokiNetwork(network)) {
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_ENOKI_API_KEY
    if (!apiKey) {
      console.error('NEXT_PUBLIC_ENOKI_API_KEY is not configured')
      return
    }

    // Use the same Google Client ID as legacy zkLogin for consistency
    const enokiGoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

    try {
      const { unregister } = registerEnokiWallets({
        apiKey,
        providers: {
          google: {
            clientId: enokiGoogleClientId,
          },
          // Add other providers when you have their client IDs
          // facebook: {
          //   clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || '',
          // },
          // twitch: {
          //   clientId: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || '',
          // },
        },
        client: client as any, // Type cast to handle version mismatch between @mysten/sui versions
        network,
      })

      return unregister
    } catch (error) {
      console.error('❌ Failed to register Enoki wallets:', error)
      console.error('Error details:', error)
      return () => {} // Return empty cleanup function
    }
  }, [client, network])

  return null // This component doesn't render anything
}
