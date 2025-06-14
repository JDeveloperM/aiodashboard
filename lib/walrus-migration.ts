"use client"

import { walrusService, type WalrusContentType } from './walrus-client'
import { storeImage, storeJsonData, cacheBlobReference } from './walrus-utils'
import { toast } from 'sonner'

interface MigrationResult {
  success: boolean
  blobId?: string
  error?: string
  cost?: number
  fallback?: boolean
}

interface MigrationProgress {
  total: number
  completed: number
  failed: number
  current?: string
}

export class WalrusMigrationService {
  private onProgress?: (progress: MigrationProgress) => void

  constructor(onProgress?: (progress: MigrationProgress) => void) {
    this.onProgress = onProgress
  }

  /**
   * Migrate profile images from localStorage to Walrus
   */
  async migrateProfileImages(userAddress: string, signer: any): Promise<MigrationResult[]> {
    const results: MigrationResult[] = []
    const imagesToMigrate: Array<{ key: string; data: string; contentType: WalrusContentType }> = []

    // Collect profile images from localStorage
    const profileImage = localStorage.getItem('user-profile-image')
    if (profileImage && profileImage.startsWith('data:')) {
      imagesToMigrate.push({
        key: 'user-profile-image',
        data: profileImage,
        contentType: 'profile-image'
      })
    }

    // Collect creator profile images
    const creatorKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('creator_profile_') && localStorage.getItem(key)?.startsWith('data:')
    )
    
    creatorKeys.forEach(key => {
      const data = localStorage.getItem(key)
      if (data) {
        imagesToMigrate.push({
          key,
          data,
          contentType: 'profile-image'
        })
      }
    })

    // Collect channel banners
    const bannerKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('channel_banner_') && localStorage.getItem(key)?.startsWith('data:')
    )
    
    bannerKeys.forEach(key => {
      const data = localStorage.getItem(key)
      if (data) {
        imagesToMigrate.push({
          key,
          data,
          contentType: 'channel-banner'
        })
      }
    })

    const progress: MigrationProgress = {
      total: imagesToMigrate.length,
      completed: 0,
      failed: 0
    }

    for (const item of imagesToMigrate) {
      progress.current = item.key
      this.onProgress?.(progress)

      try {
        const blobReference = await storeImage(
          item.data,
          item.contentType,
          signer,
          {
            epochs: 90, // 3 months
            deletable: true
          }
        )

        // Store blob reference for future use
        localStorage.setItem(`${item.key}_walrus_blob_id`, blobReference.blobId)
        localStorage.setItem(`${item.key}_walrus_metadata`, JSON.stringify(blobReference.metadata))

        results.push({
          success: true,
          blobId: blobReference.blobId,
          cost: walrusService.calculateStorageCost(
            item.data.length * 0.75, // Estimate binary size from base64
            90
          )
        })

        progress.completed++
      } catch (error) {
        console.error(`Failed to migrate ${item.key}:`, error)
        
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        progress.failed++
      }
    }

    progress.current = undefined
    this.onProgress?.(progress)

    return results
  }

  /**
   * Migrate user profile data to Walrus
   */
  async migrateUserProfiles(userAddress: string, signer: any): Promise<MigrationResult[]> {
    const results: MigrationResult[] = []
    const dataToMigrate: Array<{ key: string; data: any; contentType: WalrusContentType }> = []

    // Collect user profile data
    const profileData = localStorage.getItem(`sui_user_${userAddress}`)
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData)
        dataToMigrate.push({
          key: `sui_user_${userAddress}`,
          data: parsed,
          contentType: 'user-profile'
        })
      } catch (error) {
        console.warn('Failed to parse profile data:', error)
      }
    }

    // Collect achievement data
    const achievementData = localStorage.getItem('user-achievements')
    if (achievementData) {
      try {
        const parsed = JSON.parse(achievementData)
        dataToMigrate.push({
          key: 'user-achievements',
          data: parsed,
          contentType: 'achievement-data'
        })
      } catch (error) {
        console.warn('Failed to parse achievement data:', error)
      }
    }

    // Collect settings data
    const settingsKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('settings_') || key.startsWith('user_preferences_')
    )
    
    settingsKeys.forEach(key => {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          dataToMigrate.push({
            key,
            data: parsed,
            contentType: 'settings-data'
          })
        } catch (error) {
          console.warn(`Failed to parse ${key}:`, error)
        }
      }
    })

    const progress: MigrationProgress = {
      total: dataToMigrate.length,
      completed: 0,
      failed: 0
    }

    for (const item of dataToMigrate) {
      progress.current = item.key
      this.onProgress?.(progress)

      try {
        const blobReference = await storeJsonData(
          item.data,
          item.contentType,
          signer,
          {
            epochs: 90, // 3 months
            deletable: true
          }
        )

        // Store blob reference for future use
        localStorage.setItem(`${item.key}_walrus_blob_id`, blobReference.blobId)
        localStorage.setItem(`${item.key}_walrus_metadata`, JSON.stringify(blobReference.metadata))

        const jsonString = JSON.stringify(item.data)
        const sizeInBytes = new TextEncoder().encode(jsonString).length

        results.push({
          success: true,
          blobId: blobReference.blobId,
          cost: walrusService.calculateStorageCost(sizeInBytes, 90)
        })

        progress.completed++
      } catch (error) {
        console.error(`Failed to migrate ${item.key}:`, error)
        
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        progress.failed++
      }
    }

    progress.current = undefined
    this.onProgress?.(progress)

    return results
  }

  /**
   * Perform complete migration for a user
   */
  async migrateUserData(userAddress: string, signer: any): Promise<{
    images: MigrationResult[]
    profiles: MigrationResult[]
    totalCost: number
    summary: {
      totalItems: number
      successful: number
      failed: number
    }
  }> {
    if (!walrusService.isAvailable()) {
      throw new Error('Walrus service is not available')
    }

    toast.info('Starting data migration to Walrus...')

    const images = await this.migrateProfileImages(userAddress, signer)
    const profiles = await this.migrateUserProfiles(userAddress, signer)

    const allResults = [...images, ...profiles]
    const successful = allResults.filter(r => r.success)
    const failed = allResults.filter(r => !r.success)
    const totalCost = successful.reduce((sum, r) => sum + (r.cost || 0), 0)

    const summary = {
      totalItems: allResults.length,
      successful: successful.length,
      failed: failed.length
    }

    if (summary.successful > 0) {
      toast.success(
        `Migration completed: ${summary.successful}/${summary.totalItems} items migrated (${totalCost.toFixed(6)} SUI)`
      )
    }

    if (summary.failed > 0) {
      toast.warning(`${summary.failed} items failed to migrate`)
    }

    return {
      images,
      profiles,
      totalCost,
      summary
    }
  }

  /**
   * Check what data is available for migration
   */
  static scanForMigratableData(userAddress: string): {
    images: string[]
    profiles: string[]
    settings: string[]
    totalEstimatedSize: number
  } {
    const images: string[] = []
    const profiles: string[] = []
    const settings: string[] = []
    let totalEstimatedSize = 0

    // Scan localStorage for migratable data
    Object.keys(localStorage).forEach(key => {
      const data = localStorage.getItem(key)
      if (!data) return

      if (key.includes('profile-image') || key.includes('banner') || key.includes('avatar')) {
        if (data.startsWith('data:')) {
          images.push(key)
          totalEstimatedSize += data.length * 0.75 // Estimate binary size
        }
      } else if (key.includes('user_') || key.includes('profile_') || key.includes('achievement')) {
        try {
          JSON.parse(data) // Validate JSON
          profiles.push(key)
          totalEstimatedSize += new TextEncoder().encode(data).length
        } catch {
          // Not valid JSON, skip
        }
      } else if (key.includes('settings_') || key.includes('preferences_')) {
        try {
          JSON.parse(data) // Validate JSON
          settings.push(key)
          totalEstimatedSize += new TextEncoder().encode(data).length
        } catch {
          // Not valid JSON, skip
        }
      }
    })

    return {
      images,
      profiles,
      settings,
      totalEstimatedSize
    }
  }

  /**
   * Estimate migration cost
   */
  static estimateMigrationCost(userAddress: string, epochs: number = 90): number {
    const scan = this.scanForMigratableData(userAddress)
    return walrusService.calculateStorageCost(scan.totalEstimatedSize, epochs)
  }
}

// Utility function to create a migration service instance
export function createMigrationService(onProgress?: (progress: MigrationProgress) => void) {
  return new WalrusMigrationService(onProgress)
}

// Export types
export type { MigrationResult, MigrationProgress }
