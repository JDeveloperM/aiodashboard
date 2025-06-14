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

  // Use WalrusProvider state instead of managing our own
  const { isInitialized, isLoading, error, network } = useWalrusContext()

  const [localLoading, setLocalLoading] = useState(false)

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
    if (!currentAccount) {
      throw new Error('No wallet connected')
    }

    if (!isInitialized || !options.useWalrus) {
      // Fallback mode - store in localStorage only
      const identifier = user?.address || 'anonymous'
      const walrusSigner = createWalrusSigner(currentAccount, signAndExecute)
      const result = await storeWithFallback(image, contentType, identifier, walrusSigner, options)
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

      // Create Walrus-compatible signer
      const walrusSigner = createWalrusSigner(currentAccount, signAndExecute)
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
      
      // Try fallback storage
      const identifier = user?.address || 'anonymous'
      const walrusSigner = createWalrusSigner(currentAccount, signAndExecute)
      const result = await storeWithFallback(image, contentType, identifier, walrusSigner, options)
      
      setLocalLoading(false)
      
      return {
        blobId: result.blobId,
        success: true,
        fallback: result.fallback
      }
    }
  }, [currentAccount, signAndExecute, isInitialized, user?.address, calculateCost])

  // Store JSON data
  const storeData = useCallback(async (
    data: any,
    contentType: WalrusContentType,
    options: StorageOptions = {}
  ): Promise<StorageResult> => {
    if (!currentAccount) {
      throw new Error('No wallet connected')
    }

    if (!isInitialized || !options.useWalrus) {
      // Fallback mode
      const identifier = user?.address || 'anonymous'
      const walrusSigner = createWalrusSigner(currentAccount, signAndExecute)
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

      // Create Walrus-compatible signer
      const walrusSigner = createWalrusSigner(currentAccount, signAndExecute)
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
      const identifier = user?.address || 'anonymous'
      const walrusSigner = createWalrusSigner(currentAccount, signAndExecute)
      const result = await storeWithFallback(data, contentType, identifier, walrusSigner, options)
      
      setLocalLoading(false)
      
      return {
        blobId: result.blobId,
        success: true,
        fallback: result.fallback
      }
    }
  }, [currentAccount, signAndExecute, isInitialized, user?.address, calculateCost])

  // Retrieve image as data URL
  const retrieveImage = useCallback(async (
    blobId: string | null,
    contentType: WalrusContentType,
    mimeType?: string
  ): Promise<string | null> => {
    if (!blobId) {
      // Try fallback retrieval
      const identifier = user?.address || 'anonymous'
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
      const identifier = user?.address || 'anonymous'
      const fallbackData = await retrieveWithFallback<string>(null, contentType, identifier)
      
      setLocalLoading(false)
      
      return fallbackData
    }
  }, [user?.address])

  // Retrieve JSON data
  const retrieveData = useCallback(async <T = any>(
    blobId: string | null,
    contentType: WalrusContentType
  ): Promise<T | null> => {
    if (!blobId) {
      // Try fallback retrieval
      const identifier = user?.address || 'anonymous'
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
      const identifier = user?.address || 'anonymous'
      const fallbackData = await retrieveWithFallback<T>(null, contentType, identifier)
      
      setLocalLoading(false)
      
      return fallbackData
    }
  }, [user?.address])

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
    isConnected: !!currentAccount,

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
