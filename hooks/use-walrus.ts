"use client"

import { useState, useEffect, useCallback } from 'react'
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { walrusService, type WalrusContentType, type WalrusBlobReference, STORAGE_DURATIONS } from '@/lib/walrus-client'
import {
  storeWithFallback,
  retrieveWithFallback,
  storeImage as storeImageUtil,
  storeJsonData as storeJsonDataUtil,
  retrieveImageAsDataUrl,
  retrieveJsonData
} from '@/lib/walrus-utils'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { createWalrusSigner } from '@/lib/walrus-signer-adapter'
import { useWalrusContext } from '@/components/walrus-provider'
import { useZkLogin } from '@/components/zklogin-provider'
import { useZkLoginWallet } from '@/hooks/use-zklogin-wallet'

interface WalrusHookState {
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  network: string
}

interface StorageOptions {
  epochs?: number
  deletable?: boolean
  useWalrus?: boolean // Allow disabling Walrus for testing
}

interface StorageResult {
  blobId?: string
  success: boolean
  fallback: boolean
  cost?: number
}

export function useWalrus() {
  const suiClient = useSuiClient()
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const { user } = useSuiAuth()
  const { zkLoginUserAddress } = useZkLogin()
  const { wallet: zkWallet, signAndExecuteTransaction: zkSignAndExecute } = useZkLoginWallet()

  // Use WalrusProvider state instead of managing our own
  const { isInitialized, isLoading, error, network } = useWalrusContext()

  const [localLoading, setLocalLoading] = useState(false)

  // Check if we have any wallet connection (traditional or zkLogin)
  const isConnected = !!(user?.address)
  const userAddress = user?.address

  // Calculate storage cost
  const calculateCost = useCallback((sizeInBytes: number, epochs?: number) => {
    if (!isInitialized) return 0

    const actualEpochs = epochs || STORAGE_DURATIONS.MEDIUM
    return walrusService.calculateStorageCost(sizeInBytes, actualEpochs)
  }, [isInitialized])

  // Get storage duration options
  const getStorageOptions = useCallback((sizeInBytes: number) => {
    if (!isInitialized) return []

    return walrusService.getStorageOptions(sizeInBytes)
  }, [isInitialized])

  // Store image (File or data URL)
  const storeImage = useCallback(async (
    image: File | string,
    contentType: WalrusContentType,
    options: StorageOptions = {}
  ): Promise<StorageResult> => {
    if (!isConnected) {
      throw new Error('Authentication required - please connect your wallet or sign in with zkLogin')
    }

    if (!isInitialized || !options.useWalrus) {
      // Fallback mode - store in localStorage only
      console.log('🔄 Using fallback storage mode (Walrus disabled or not initialized)')
      const identifier = userAddress || 'anonymous'
      const walrusSigner = currentAccount
        ? createWalrusSigner(currentAccount, signAndExecute)
        : null // zkLogin users don't need signer for fallback storage
      const result = await storeWithFallback(image, contentType, identifier, walrusSigner, options)
      console.log('✅ Fallback storage completed:', result)
      return {
        blobId: result.blobId,
        success: true,
        fallback: result.fallback
      }
    }

    setLocalLoading(true)

    try {
      // Calculate cost for user information
      let sizeInBytes = 0
      if (image instanceof File) {
        sizeInBytes = image.size
      } else {
        // Estimate size from data URL
        sizeInBytes = Math.ceil(image.length * 0.75) // Base64 is ~33% larger than binary
      }

      const cost = calculateCost(sizeInBytes, options.epochs)

      // Create Walrus-compatible signer (use zkLogin wallet if available)
      console.log('🔍 Wallet signer debug:', {
        currentAccount: !!currentAccount,
        zkWallet: !!zkWallet,
        zkSignAndExecute: !!zkSignAndExecute,
        userAddress
      })

      let walrusSigner = null

      if (currentAccount) {
        walrusSigner = createWalrusSigner(currentAccount, signAndExecute)
      } else if (zkWallet && zkSignAndExecute) {
        // For zkLogin, create a compatible account object
        const zkAccount = {
          address: userAddress, // Use the known user address
          publicKey: null, // zkLogin doesn't expose publicKey directly
          chains: [] // zkLogin doesn't expose chains directly
        }
        console.log('🔧 Creating zkLogin account object:', zkAccount)
        walrusSigner = createWalrusSigner(zkAccount, zkSignAndExecute)
      }

      if (!walrusSigner) {
        console.log('❌ Failed to create wallet signer, falling back to local storage')
        throw new Error('Unable to create wallet signer')
      }

      const blobReference = await storeImageUtil(image, contentType, walrusSigner, options)
      
      setLocalLoading(false)
      
      return {
        blobId: blobReference.blobId,
        success: true,
        fallback: false,
        cost
      }
    } catch (error) {
      console.error('Failed to store image:', error)
      console.log('🔄 Attempting fallback storage for zkLogin user...')

      // Try fallback storage
      const identifier = userAddress || 'anonymous'
      const walrusSigner = currentAccount
        ? createWalrusSigner(currentAccount, signAndExecute)
        : null // zkLogin users don't need signer for fallback storage

      console.log('📦 Fallback storage params:', {
        identifier,
        hasWalrusSigner: !!walrusSigner,
        contentType,
        isZkLoginUser: !currentAccount && !!zkLoginUserAddress
      })

      const result = await storeWithFallback(image, contentType, identifier, walrusSigner, options)

      console.log('✅ Fallback storage result:', result)

      setLocalLoading(false)

      return {
        blobId: result.blobId,
        success: true,
        fallback: result.fallback
      }
    }
  }, [currentAccount, signAndExecute, zkWallet, zkSignAndExecute, isInitialized, userAddress, calculateCost, isConnected])

  // Store JSON data
  const storeData = useCallback(async (
    data: any,
    contentType: WalrusContentType,
    options: StorageOptions = {}
  ): Promise<StorageResult> => {
    if (!isConnected) {
      throw new Error('Authentication required - please connect your wallet or sign in with zkLogin')
    }

    if (!isInitialized || !options.useWalrus) {
      // Fallback mode
      const identifier = userAddress || 'anonymous'
      const walrusSigner = currentAccount
        ? createWalrusSigner(currentAccount, signAndExecute)
        : null // zkLogin users don't need signer for fallback storage
      const result = await storeWithFallback(data, contentType, identifier, walrusSigner, options)
      return {
        blobId: result.blobId,
        success: true,
        fallback: result.fallback
      }
    }

    setLocalLoading(true)

    try {
      const jsonString = JSON.stringify(data)
      const sizeInBytes = new TextEncoder().encode(jsonString).length
      const cost = calculateCost(sizeInBytes, options.epochs)

      // Create Walrus-compatible signer (use zkLogin wallet if available)
      const walrusSigner = currentAccount
        ? createWalrusSigner(currentAccount, signAndExecute)
        : zkWallet && zkSignAndExecute
        ? createWalrusSigner(zkWallet, zkSignAndExecute)
        : null

      if (!walrusSigner) {
        throw new Error('Unable to create wallet signer')
      }

      const blobReference = await storeJsonDataUtil(data, contentType, walrusSigner, options)
      
      setLocalLoading(false)
      
      return {
        blobId: blobReference.blobId,
        success: true,
        fallback: false,
        cost
      }
    } catch (error) {
      console.error('Failed to store data:', error)
      
      // Try fallback storage
      const identifier = userAddress || 'anonymous'
      const walrusSigner = currentAccount
        ? createWalrusSigner(currentAccount, signAndExecute)
        : null // zkLogin users don't need signer for fallback storage
      const result = await storeWithFallback(data, contentType, identifier, walrusSigner, options)
      
      setLocalLoading(false)
      
      return {
        blobId: result.blobId,
        success: true,
        fallback: result.fallback
      }
    }
  }, [currentAccount, signAndExecute, zkWallet, zkSignAndExecute, isInitialized, userAddress, calculateCost, isConnected])

  // Retrieve image as data URL
  const retrieveImage = useCallback(async (
    blobId: string | null,
    contentType: WalrusContentType,
    mimeType?: string
  ): Promise<string | null> => {
    if (!blobId) {
      // Try fallback retrieval
      const identifier = userAddress || 'anonymous'
      return await retrieveWithFallback<string>(null, contentType, identifier)
    }

    setLocalLoading(true)

    try {
      const dataUrl = await retrieveImageAsDataUrl(blobId, mimeType)
      setLocalLoading(false)
      return dataUrl
    } catch (error) {
      console.error('Failed to retrieve image:', error)
      
      // Try fallback retrieval
      const identifier = userAddress || 'anonymous'
      const fallbackData = await retrieveWithFallback<string>(null, contentType, identifier)
      
      setLocalLoading(false)
      
      return fallbackData
    }
  }, [userAddress])

  // Retrieve JSON data
  const retrieveData = useCallback(async <T = any>(
    blobId: string | null,
    contentType: WalrusContentType
  ): Promise<T | null> => {
    if (!blobId) {
      // Try fallback retrieval
      const identifier = userAddress || 'anonymous'
      return await retrieveWithFallback<T>(null, contentType, identifier)
    }

    setLocalLoading(true)

    try {
      const data = await retrieveJsonData<T>(blobId)
      setLocalLoading(false)
      return data
    } catch (error) {
      console.error('Failed to retrieve data:', error)
      
      // Try fallback retrieval
      const identifier = userAddress || 'anonymous'
      const fallbackData = await retrieveWithFallback<T>(null, contentType, identifier)
      
      setLocalLoading(false)
      
      return fallbackData
    }
  }, [userAddress])

  // Clear error (handled by WalrusProvider)
  const clearError = useCallback(() => {
    // Error clearing is handled by WalrusProvider
  }, [])

  // Reset Walrus client (for handling retryable errors)
  const resetClient = useCallback(async () => {
    if (isInitialized) {
      await walrusService.reset()
    }
  }, [isInitialized])

  return {
    // State (from WalrusProvider)
    isInitialized,
    isLoading: isLoading || localLoading,
    error,
    network,
    isConnected,

    // Methods
    storeImage,
    storeData,
    retrieveImage,
    retrieveData,
    calculateCost,
    getStorageOptions,
    clearError,
    resetClient,

    // Utilities
    storageOptions: STORAGE_DURATIONS
  }
}
