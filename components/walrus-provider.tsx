"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSuiClient } from '@mysten/dapp-kit'
import { walrusService } from '@/lib/walrus-client'
import { toast } from 'sonner'

interface WalrusContextType {
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  network: string
  retryInitialization: () => void
}

const WalrusContext = createContext<WalrusContextType | undefined>(undefined)

interface WalrusProviderProps {
  children: React.ReactNode
  enableToasts?: boolean
  autoRetry?: boolean
}

export function WalrusProvider({ 
  children, 
  enableToasts = true,
  autoRetry = true 
}: WalrusProviderProps) {
  const suiClient = useSuiClient()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [network, setNetwork] = useState<string>('testnet')
  const [retryCount, setRetryCount] = useState(0)

  const initializeWalrus = async (showToast = true) => {
    if (!suiClient) {
      setError('SUI client not available')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Default to testnet for Walrus (since Walrus primarily runs on testnet)
      const detectedNetwork = 'testnet'



      await walrusService.initialize(detectedNetwork)

      setIsInitialized(true)
      setNetwork(detectedNetwork)
      setRetryCount(0)

      if (enableToasts && showToast) {
        toast.success(`Walrus storage initialized (${detectedNetwork})`, {
          description: 'Decentralized storage is now available'
        })
      }


    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Walrus'
      setError(errorMessage)
      
      if (enableToasts && showToast) {
        toast.error('Walrus initialization failed', {
          description: 'Falling back to local storage',
          action: autoRetry ? {
            label: 'Retry',
            onClick: () => retryInitialization()
          } : undefined
        })
      }
      
      console.error('Walrus initialization failed:', err)
      
      // Auto-retry logic
      if (autoRetry && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 2000 // Exponential backoff: 2s, 4s, 8s
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          initializeWalrus(false) // Don't show toast for retries
        }, delay)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const retryInitialization = () => {
    setRetryCount(0)
    initializeWalrus(true)
  }

  // Initialize when SUI client becomes available
  useEffect(() => {
    if (suiClient && !isInitialized && !isLoading) {
      initializeWalrus(true)
    }
  }, [suiClient, isInitialized, isLoading])

  // Handle SUI client changes (network switching)
  // Note: Since Walrus primarily runs on testnet, we'll stick with testnet
  // If you need to support multiple networks, you can add network detection logic here
  useEffect(() => {
    // For now, we don't need to reinitialize on network changes
    // since Walrus uses testnet regardless of SUI network
  }, [suiClient, network, isInitialized])

  const value: WalrusContextType = {
    isInitialized,
    isLoading,
    error,
    network,
    retryInitialization
  }

  return (
    <WalrusContext.Provider value={value}>
      {children}
    </WalrusContext.Provider>
  )
}

export function useWalrusContext() {
  const context = useContext(WalrusContext)
  if (context === undefined) {
    throw new Error('useWalrusContext must be used within a WalrusProvider')
  }
  return context
}

// Status indicator component
export function WalrusStatusIndicator() {
  const { isInitialized, isLoading, error, network } = useWalrusContext()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-yellow-600">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        Initializing Walrus...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <div className="w-2 h-2 bg-red-500 rounded-full" />
        Walrus unavailable (using local storage)
      </div>
    )
  }

  if (isInitialized) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        Walrus ready ({network})
      </div>
    )
  }

  return null
}

// Storage cost estimator component
interface StorageCostEstimatorProps {
  sizeInBytes: number
  className?: string
}

export function StorageCostEstimator({ sizeInBytes, className }: StorageCostEstimatorProps) {
  const { isInitialized } = useWalrusContext()
  
  if (!isInitialized || sizeInBytes === 0) {
    return null
  }

  const options = walrusService.getStorageOptions(sizeInBytes)

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-[#C0E6FF]">Storage Cost Estimates</h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {options.map((option) => (
          <div key={option.name} className="flex justify-between p-2 bg-[#030f1c] rounded border border-[#C0E6FF]/20">
            <span>{option.duration}</span>
            <span>{option.cost.toFixed(6)} SUI</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Storage duration selector component
interface StorageDurationSelectorProps {
  sizeInBytes: number
  selectedEpochs: number
  onEpochsChange: (epochs: number) => void
  className?: string
}

export function StorageDurationSelector({ 
  sizeInBytes, 
  selectedEpochs, 
  onEpochsChange, 
  className 
}: StorageDurationSelectorProps) {
  const { isInitialized } = useWalrusContext()
  
  if (!isInitialized) {
    return null
  }

  const options = walrusService.getStorageOptions(sizeInBytes)
  const selectedOption = options.find(opt => opt.epochs === selectedEpochs) || options[1] // Default to MEDIUM

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-[#C0E6FF]">Storage Duration</label>
      <select
        value={selectedEpochs}
        onChange={(e) => onEpochsChange(Number(e.target.value))}
        className="w-full p-2 bg-[#030f1c] border border-[#C0E6FF]/20 rounded text-[#C0E6FF] text-sm"
      >
        {options.map((option) => (
          <option key={option.name} value={option.epochs}>
            {option.duration} - {option.cost.toFixed(6)} SUI
          </option>
        ))}
      </select>
      {selectedOption && (
        <p className="text-xs text-[#C0E6FF]/70">
          Cost: {selectedOption.cost.toFixed(6)} SUI for {selectedOption.duration}
        </p>
      )}
    </div>
  )
}
