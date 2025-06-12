"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { SuiClient } from '@mysten/sui/client'
import {
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
  jwtToAddress,
  getZkLoginSignature,
  genAddressSeed
} from '@mysten/sui/zklogin'
import {
  saveZkLoginSession,
  getZkLoginSession,
  clearZkLoginSession,
  type ZkLoginSession
} from '@/lib/auth-cookies'

interface ZkLoginContextType {
  currentEpoch: number | null
  nonce: string | null
  ephemeralKeyPair: Ed25519Keypair | null
  userSalt: string | null
  zkLoginUserAddress: string | null
  jwt: string | null
  maxEpoch: number | null
  randomness: string | null
  isLoading: boolean
  error: string | null
  initiateZkLogin: () => Promise<void>
  handleCallback: (jwt: string) => Promise<void>
  reset: () => void
}

const ZkLoginContext = createContext<ZkLoginContextType | null>(null)

export function useZkLogin() {
  const context = useContext(ZkLoginContext)
  if (!context) {
    throw new Error('useZkLogin must be used within a ZkLoginProvider')
  }
  return context
}

interface ZkLoginProviderProps {
  children: React.ReactNode
  suiClient: SuiClient
}

export function ZkLoginProvider({ children, suiClient }: ZkLoginProviderProps) {
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null)
  const [nonce, setNonce] = useState<string | null>(null)
  const [ephemeralKeyPair, setEphemeralKeyPair] = useState<Ed25519Keypair | null>(null)
  const [userSalt, setUserSalt] = useState<string | null>(null)
  const [zkLoginUserAddress, setZkLoginUserAddress] = useState<string | null>(null)
  const [jwt, setJwt] = useState<string | null>(null)
  const [maxEpoch, setMaxEpoch] = useState<number | null>(null)
  const [randomness, setRandomness] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize epoch data
  useEffect(() => {
    const initializeEpoch = async () => {
      try {
        const { epoch } = await suiClient.getLatestSuiSystemState()
        setCurrentEpoch(Number(epoch))
      } catch (err) {
        console.error('Failed to get epoch:', err)
        setError('Failed to initialize epoch data')
      }
    }

    initializeEpoch()
  }, [suiClient])

  const initiateZkLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!currentEpoch) {
        throw new Error('Epoch not initialized')
      }

      // Generate ephemeral key pair
      const keyPair = new Ed25519Keypair()
      setEphemeralKeyPair(keyPair)

      // Set max epoch (valid for 2 epochs)
      const maxEpochValue = currentEpoch + 2
      setMaxEpoch(maxEpochValue)

      // Generate randomness and nonce
      const randomnessValue = generateRandomness()
      setRandomness(randomnessValue)

      const nonceValue = generateNonce(keyPair.getPublicKey(), maxEpochValue, randomnessValue)
      setNonce(nonceValue)

      // Store values in localStorage for persistence (fallback)
      localStorage.setItem('zklogin_ephemeral_key', keyPair.getSecretKey())
      localStorage.setItem('zklogin_max_epoch', maxEpochValue.toString())
      localStorage.setItem('zklogin_randomness', randomnessValue)
      localStorage.setItem('zklogin_nonce', nonceValue)

    } catch (err) {
      console.error('Failed to initiate zkLogin:', err)
      setError(err instanceof Error ? err.message : 'Failed to initiate zkLogin')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCallback = async (jwtToken: string) => {
    try {
      setIsLoading(true)
      setError(null)
      setJwt(jwtToken)

      // Get user salt from Mysten Labs salt server
      const saltResponse = await fetch('https://salt.api.mystenlabs.com/get_salt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: jwtToken }),
      })

      if (!saltResponse.ok) {
        throw new Error('Failed to get user salt')
      }

      const saltData = await saltResponse.json()
      const salt = saltData.salt
      setUserSalt(salt)

      // Generate zkLogin address
      const address = jwtToAddress(jwtToken, salt)
      setZkLoginUserAddress(address)

      // Store in cookies and localStorage
      const zkLoginSessionData = {
        jwt: jwtToken,
        userSalt: salt,
        address: address,
        nonce: nonce || '',
        maxEpoch: maxEpoch || 0,
        randomness: randomness || '',
        ephemeralKey: ephemeralKeyPair?.getSecretKey() || ''
      }

      saveZkLoginSession(zkLoginSessionData)

      // Also store in localStorage as fallback
      localStorage.setItem('zklogin_jwt', jwtToken)
      localStorage.setItem('zklogin_user_salt', salt)
      localStorage.setItem('zklogin_address', address)

    } catch (err) {
      console.error('Failed to handle callback:', err)
      setError(err instanceof Error ? err.message : 'Failed to process authentication')
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setNonce(null)
    setEphemeralKeyPair(null)
    setUserSalt(null)
    setZkLoginUserAddress(null)
    setJwt(null)
    setMaxEpoch(null)
    setRandomness(null)
    setError(null)

    // Clear cookies and localStorage
    clearZkLoginSession()

    // Clear localStorage as fallback
    localStorage.removeItem('zklogin_ephemeral_key')
    localStorage.removeItem('zklogin_max_epoch')
    localStorage.removeItem('zklogin_randomness')
    localStorage.removeItem('zklogin_nonce')
    localStorage.removeItem('zklogin_jwt')
    localStorage.removeItem('zklogin_user_salt')
    localStorage.removeItem('zklogin_address')
  }

  // Restore from cookies and localStorage on mount
  useEffect(() => {
    // Try to restore from cookies first
    const zkLoginSession = getZkLoginSession()

    if (zkLoginSession) {
      setJwt(zkLoginSession.jwt)
      setUserSalt(zkLoginSession.userSalt)
      setZkLoginUserAddress(zkLoginSession.address)
      setNonce(zkLoginSession.nonce)
      setMaxEpoch(zkLoginSession.maxEpoch)
      setRandomness(zkLoginSession.randomness)

      if (zkLoginSession.ephemeralKey) {
        try {
          const keyPair = Ed25519Keypair.fromSecretKey(zkLoginSession.ephemeralKey)
          setEphemeralKeyPair(keyPair)
        } catch (err) {
          console.error('Failed to restore ephemeral key from cookie:', err)
        }
      }

      console.log('zkLogin session restored from cookies')
      return
    }

    // Fallback to localStorage
    const storedJwt = localStorage.getItem('zklogin_jwt')
    const storedSalt = localStorage.getItem('zklogin_user_salt')
    const storedAddress = localStorage.getItem('zklogin_address')
    const storedNonce = localStorage.getItem('zklogin_nonce')
    const storedMaxEpoch = localStorage.getItem('zklogin_max_epoch')
    const storedRandomness = localStorage.getItem('zklogin_randomness')
    const storedEphemeralKey = localStorage.getItem('zklogin_ephemeral_key')

    if (storedJwt && storedSalt && storedAddress) {
      setJwt(storedJwt)
      setUserSalt(storedSalt)
      setZkLoginUserAddress(storedAddress)

      // Migrate to cookies
      const zkLoginSessionData = {
        jwt: storedJwt,
        userSalt: storedSalt,
        address: storedAddress,
        nonce: storedNonce || '',
        maxEpoch: storedMaxEpoch ? Number(storedMaxEpoch) : 0,
        randomness: storedRandomness || '',
        ephemeralKey: storedEphemeralKey || ''
      }

      saveZkLoginSession(zkLoginSessionData)
      console.log('zkLogin session migrated from localStorage to cookies')
    }

    if (storedNonce) setNonce(storedNonce)
    if (storedMaxEpoch) setMaxEpoch(Number(storedMaxEpoch))
    if (storedRandomness) setRandomness(storedRandomness)
    if (storedEphemeralKey) {
      try {
        const keyPair = Ed25519Keypair.fromSecretKey(storedEphemeralKey)
        setEphemeralKeyPair(keyPair)
      } catch (err) {
        console.error('Failed to restore ephemeral key:', err)
      }
    }
  }, [])

  const value: ZkLoginContextType = {
    currentEpoch,
    nonce,
    ephemeralKeyPair,
    userSalt,
    zkLoginUserAddress,
    jwt,
    maxEpoch,
    randomness,
    isLoading,
    error,
    initiateZkLogin,
    handleCallback,
    reset,
  }

  return (
    <ZkLoginContext.Provider value={value}>
      {children}
    </ZkLoginContext.Provider>
  )
}
