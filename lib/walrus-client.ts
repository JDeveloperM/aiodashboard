"use client"

import { WalrusClient } from '@mysten/walrus'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { RetryableWalrusClientError } from '@mysten/walrus'

// Walrus configuration for different networks (Updated for Testnet v3)
const WALRUS_CONFIG = {
  testnet: {
    network: 'testnet' as const,
    suiNetwork: 'testnet' as const,
    // Default storage duration in epochs (1 epoch = 1 day on testnet)
    defaultEpochs: 30, // ~30 days
    // Storage costs (approximate, in SUI)
    costPerEpochPerKB: 0.0001,
    // Testnet v3 configuration (operational after 2025-04-03T15:00:00Z)
    systemObjectId: '0x6c2547cbbc38025cf3adac45f63cb0a8d12ecf777cdc75a4971612bf97fdf6af',
    stakingObjectId: '0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3',
    subsidiesObjectId: '0xda799d85db0429765c8291c594d334349ef5bc09220e79ad397b30106161a0af',
    exchangeObjects: [
      '0xf4d164ea2def5fe07dc573992a029e010dba09b1a8dcbc44c5c2e79567f39073',
      '0x19825121c52080bb1073662231cfea5c0e4d905fd13e95f21e9a018f2ef41862',
      '0x83b454e524c71f30803f4d6c302a86fb6a39e96cdfb873c2d1e93bc1c26a3bc5',
      '0x8d63209cf8589ce7aef8f262437163c67577ed09f3e636a9d8e0813843fb8bf1'
    ]
  },
  devnet: {
    network: 'testnet' as const, // Walrus uses testnet for devnet
    suiNetwork: 'devnet' as const,
    defaultEpochs: 7, // ~7 days for development
    costPerEpochPerKB: 0.0001,
    // Using testnet v3 config for devnet as well
    systemObjectId: '0x6c2547cbbc38025cf3adac45f63cb0a8d12ecf777cdc75a4971612bf97fdf6af',
    stakingObjectId: '0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3',
    subsidiesObjectId: '0xda799d85db0429765c8291c594d334349ef5bc09220e79ad397b30106161a0af',
    exchangeObjects: [
      '0xf4d164ea2def5fe07dc573992a029e010dba09b1a8dcbc44c5c2e79567f39073',
      '0x19825121c52080bb1073662231cfea5c0e4d905fd13e95f21e9a018f2ef41862',
      '0x83b454e524c71f30803f4d6c302a86fb6a39e96cdfb873c2d1e93bc1c26a3bc5',
      '0x8d63209cf8589ce7aef8f262437163c67577ed09f3e636a9d8e0813843fb8bf1'
    ]
  }
}

// Storage duration presets
const STORAGE_DURATIONS = {
  SHORT: 7,    // ~1 week
  MEDIUM: 30,  // ~1 month
  LONG: 90,    // ~3 months
  PERMANENT: 365, // ~1 year
} as const

// Content type definitions
export type WalrusContentType = 
  | 'profile-image'
  | 'channel-banner' 
  | 'achievement-icon'
  | 'user-profile'
  | 'channel-description'
  | 'achievement-data'
  | 'settings-data'

// Storage metadata interface
export interface WalrusStorageMetadata {
  contentType: WalrusContentType
  originalName?: string
  mimeType?: string
  size: number
  uploadedAt: string
  expiresAt: string
  deletable: boolean
}

// Walrus blob reference
export interface WalrusBlobReference {
  blobId: string
  metadata: WalrusStorageMetadata
}

class WalrusService {
  private client: WalrusClient | null = null
  private suiClient: SuiClient | null = null
  private currentNetwork: 'testnet' | 'devnet' = 'testnet'
  private isInitialized = false

  constructor() {
    // Initialize will be called when needed
  }

  /**
   * Initialize the Walrus client with the current network configuration
   * Using SDK for wallet transactions with testnet tokens
   */
  async initialize(network: 'testnet' | 'devnet' = 'testnet', customSuiClient?: SuiClient) {
    try {
      this.currentNetwork = network
      const config = WALRUS_CONFIG[network]

      // Store the custom client if provided
      if (customSuiClient) {
        this.suiClient = customSuiClient
      }

      // Due to transaction compatibility issues between Walrus SDK and dApp kit,
      // we'll use HTTP API for storage but handle WAL token payments separately
      this.client = null

      // Store the SUI client for potential future use
      this.suiClient = customSuiClient || new SuiClient({ url: getFullnodeUrl(config.suiNetwork) })

      this.isInitialized = true
      console.log(`Walrus SDK initialized for ${network} with wallet transactions`)
    } catch (error) {
      console.error('Failed to initialize Walrus client:', error)
      throw error
    }
  }

  /**
   * Ensure the client is initialized
   */
  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize(this.currentNetwork)
    }
  }

  /**
   * Reset the client (useful for handling RetryableWalrusClientError)
   */
  async reset() {
    if (this.client) {
      this.client.reset()
    }
  }

  /**
   * Calculate estimated storage cost
   */
  calculateStorageCost(sizeInBytes: number, epochs: number): number {
    const config = WALRUS_CONFIG[this.currentNetwork]
    const sizeInKB = Math.ceil(sizeInBytes / 1024)
    return sizeInKB * epochs * config.costPerEpochPerKB
  }

  /**
   * Get storage duration options with costs
   */
  getStorageOptions(sizeInBytes: number) {
    return Object.entries(STORAGE_DURATIONS).map(([name, epochs]) => ({
      name,
      epochs,
      duration: `~${Math.ceil(epochs / 7)} week${epochs > 7 ? 's' : ''}`,
      cost: this.calculateStorageCost(sizeInBytes, epochs)
    }))
  }

  /**
   * Store a blob on Walrus - TEMPORARY SOLUTION
   *
   * The Walrus SDK has compatibility issues with dApp kit due to transaction format differences.
   * Until this is resolved, we have a few options:
   *
   * 1. Use HTTP API (free public service, no WAL tokens spent)
   * 2. Use CLI manually (spend WAL tokens, but not integrated)
   * 3. Wait for SDK compatibility fix
   * 4. Run your own publisher
   *
   * For now, using HTTP API for functionality, but noting the limitation.
   */
  async storeBlob(
    data: Uint8Array,
    contentType: WalrusContentType,
    options: {
      epochs?: number
      deletable?: boolean
      originalName?: string
      mimeType?: string
      signer?: any // Not used due to compatibility issues
    } = {}
  ): Promise<WalrusBlobReference> {
    const epochs = options.epochs || WALRUS_CONFIG[this.currentNetwork].defaultEpochs
    const deletable = options.deletable ?? false

    try {
      console.log(`⚠️  USING PUBLIC TESTNET PUBLISHER (FREE SERVICE)`)
      console.log(`⚠️  Your WAL tokens are NOT being spent due to SDK compatibility issues`)
      console.log(`⚠️  To spend WAL tokens, use: walrus --context testnet store <file> --epochs ${epochs}`)
      console.log(`Storing ${data.length} bytes on Walrus for ${epochs} epochs`)

      // Use public testnet publisher (free service)
      const publisherUrl = 'https://publisher.walrus-testnet.walrus.space'
      const url = new URL(`${publisherUrl}/v1/blobs`)

      url.searchParams.set('epochs', epochs.toString())
      if (deletable) {
        url.searchParams.set('deletable', 'true')
      }

      console.log('🌐 Making HTTP request to Walrus publisher...')
      console.log('📍 URL:', url.toString())
      console.log('📦 Data size:', data.length, 'bytes')

      const response = await fetch(url.toString(), {
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      })

      console.log('📡 HTTP Response Status:', response.status, response.statusText)
      console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ HTTP Error Response:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log('📄 HTTP Response Body:', result)

      const metadata: WalrusStorageMetadata = {
        contentType,
        originalName: options.originalName,
        mimeType: options.mimeType,
        size: data.length,
        uploadedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + epochs * 24 * 60 * 60 * 1000).toISOString(),
        deletable
      }

      let blobId: string
      if (result.newlyCreated) {
        blobId = result.newlyCreated.blobObject.blobId
        console.log(`✅ Blob stored successfully: ${blobId} (public testnet - no cost)`)
      } else if (result.alreadyCertified) {
        blobId = result.alreadyCertified.blobId
        console.log(`✅ Blob already exists: ${blobId} (already certified)`)
      } else {
        throw new Error('Unexpected response format from Walrus publisher')
      }

      return {
        blobId,
        metadata
      }

    } catch (error) {
      console.error('Failed to store blob on Walrus:', error)
      throw error
    }
  }

  /**
   * Retrieve a blob from Walrus using HTTP API
   */
  async retrieveBlob(blobId: string): Promise<Uint8Array> {
    try {
      console.log(`Retrieving blob: ${blobId}`)

      // Use public testnet aggregator
      const aggregatorUrl = 'https://aggregator.walrus-testnet.walrus.space'
      const url = `${aggregatorUrl}/v1/blobs/${blobId}`

      const response = await fetch(url)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const blob = new Uint8Array(await response.arrayBuffer())
      console.log(`Blob retrieved successfully: ${blob.length} bytes`)
      return blob
    } catch (error) {
      console.error('Failed to retrieve blob from Walrus:', error)
      throw error
    }
  }

  /**
   * Check if the service is available
   */
  isAvailable(): boolean {
    return this.isInitialized
  }

  /**
   * Get current network
   */
  getCurrentNetwork(): string {
    return this.currentNetwork
  }
}

// Export singleton instance
export const walrusService = new WalrusService()

// Export constants
export { STORAGE_DURATIONS }
