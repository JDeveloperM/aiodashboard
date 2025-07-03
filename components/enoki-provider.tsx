"use client"

import { useEffect } from 'react'
import { useSuiClientContext } from '@mysten/dapp-kit'
import { registerEnokiWallets, isEnokiNetwork } from '@mysten/enoki'

export function EnokiWalletRegistration() {
  const { client, network } = useSuiClientContext()

  useEffect(() => {
    // Only register on supported networks
    if (!isEnokiNetwork(network)) {
      console.log(`Enoki not supported on ${network}`)
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_ENOKI_API_KEY
    if (!apiKey) {
      console.error('NEXT_PUBLIC_ENOKI_API_KEY is not configured')
      return
    }

    // Use the same Google Client ID as legacy zkLogin for consistency
    const enokiGoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

    console.log(`=== Enoki Registration Debug ===`)
    console.log(`Network: ${network}`)
    console.log(`API Key: ${apiKey}`)
    console.log(`Legacy zkLogin Client ID: ${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`)
    console.log(`Enoki-specific Client ID: ${process.env.NEXT_PUBLIC_ENOKI_GOOGLE_CLIENT_ID}`)
    console.log(`Using Client ID for Enoki: ${enokiGoogleClientId} (same as legacy)`)
    console.log(`Registering Enoki wallets for ${network}...`)

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

      console.log('✅ Enoki wallets registered successfully')

      // Add event listeners to debug authentication issues
      window.addEventListener('message', (event) => {
        if (event.origin === 'https://accounts.google.com' || event.origin === 'https://api.enoki.mystenlabs.com') {
          console.log('🔍 Enoki authentication message:', event.data)
        }
      })

      // Debug: Log what redirect URI Enoki might be using
      console.log('🔍 Possible Enoki redirect URIs:')
      console.log('  - Root:', window.location.origin + '/')
      console.log('  - Auth callback:', window.location.origin + '/auth/callback')
      console.log('  - OAuth callback:', window.location.origin + '/oauth/callback')
      console.log('  - Enoki callback:', window.location.origin + '/enoki/callback')
      console.log('  - Legacy zkLogin:', window.location.origin + '/zklogin/callback')

      return unregister
    } catch (error) {
      console.error('❌ Failed to register Enoki wallets:', error)
      console.error('Error details:', error)
      return () => {} // Return empty cleanup function
    }
  }, [client, network])

  return null // This component doesn't render anything
}
