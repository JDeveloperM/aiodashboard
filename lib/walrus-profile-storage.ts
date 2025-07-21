/**
 * Walrus Profile Storage
 * Store user profiles as JSON metadata in Walrus itself
 * This creates a fully decentralized profile system
 */

import { walrusService, WalrusContentType } from './walrus-client'

export interface UserProfileMetadata {
  address: string
  username?: string
  email?: string
  profileImageBlobId?: string
  bannerImageBlobId?: string
  bio?: string

  createdAt: string
  updatedAt: string
  version: number
}



export interface ProfileStorageResult {
  profileBlobId: string
  profile: UserProfileMetadata
}

class WalrusProfileStorage {
  private readonly PROFILE_CONTENT_TYPE: WalrusContentType = 'user-profile'
  private readonly PROFILE_INDEX_TYPE: WalrusContentType = 'user-profile'

  /**
   * Store user profile metadata in Walrus
   */
  async storeProfile(
    profile: Omit<UserProfileMetadata, 'updatedAt' | 'version'>,
    signer?: any
  ): Promise<ProfileStorageResult> {
    const profileData: UserProfileMetadata = {
      ...profile,
      updatedAt: new Date().toISOString(),
      version: 1
    }

    try {
      // Store profile as JSON in Walrus
      const result = await walrusService.storeBlob(
        new TextEncoder().encode(JSON.stringify(profileData, null, 2)),
        this.PROFILE_CONTENT_TYPE,
        {
          epochs: 365, // Store for 1 year
          deletable: true,
          originalName: `profile-${profile.address}.json`,
          mimeType: 'application/json',
          signer
        }
      )

      console.log(`Profile stored in Walrus: ${result.blobId}`)

      return {
        profileBlobId: result.blobId,
        profile: profileData
      }
    } catch (error) {
      console.error('Failed to store profile in Walrus:', error)
      throw error
    }
  }

  /**
   * Retrieve user profile from Walrus
   */
  async retrieveProfile(profileBlobId: string): Promise<UserProfileMetadata> {
    try {
      const data = await walrusService.retrieveBlob(profileBlobId)
      const profileJson = new TextDecoder().decode(data)
      const profile = JSON.parse(profileJson) as UserProfileMetadata

      console.log(`Profile retrieved from Walrus: ${profile.address}`)
      return profile
    } catch (error) {
      console.error('Failed to retrieve profile from Walrus:', error)
      throw error
    }
  }

  /**
   * Update profile image blob ID
   */
  async updateProfileImage(
    currentProfileBlobId: string,
    newImageBlobId: string,
    signer?: any
  ): Promise<ProfileStorageResult> {
    try {
      // Retrieve current profile
      const currentProfile = await this.retrieveProfile(currentProfileBlobId)

      // Update image blob ID
      const updatedProfile: UserProfileMetadata = {
        ...currentProfile,
        profileImageBlobId: newImageBlobId,
        updatedAt: new Date().toISOString(),
        version: currentProfile.version + 1
      }

      // Store updated profile
      return await this.storeProfile(updatedProfile, signer)
    } catch (error) {
      console.error('Failed to update profile image:', error)
      throw error
    }
  }

  /**
   * Create a profile index for easy discovery
   * This stores a mapping of addresses to profile blob IDs
   */
  async updateProfileIndex(
    address: string,
    profileBlobId: string,
    signer?: any
  ): Promise<string> {
    try {
      // For simplicity, we'll store individual index entries
      // In production, you might want a more sophisticated indexing system
      const indexData = {
        address,
        profileBlobId,
        updatedAt: new Date().toISOString()
      }

      const result = await walrusService.storeBlob(
        new TextEncoder().encode(JSON.stringify(indexData)),
        this.PROFILE_INDEX_TYPE,
        {
          epochs: 365,
          deletable: true,
          originalName: `index-${address}.json`,
          mimeType: 'application/json',
          signer
        }
      )

      console.log(`Profile index updated: ${result.blobId}`)
      return result.blobId
    } catch (error) {
      console.error('Failed to update profile index:', error)
      throw error
    }
  }

  /**
   * Helper: Create a new profile with image
   */
  async createProfileWithImage(
    address: string,
    username: string,
    imageFile: File,
    signer?: any
  ): Promise<{
    profileBlobId: string
    imageBlobId: string
    profile: UserProfileMetadata
  }> {
    try {
      // First, store the image
      const imageData = new Uint8Array(await imageFile.arrayBuffer())
      const imageResult = await walrusService.storeBlob(imageData, 'profile-image', {
        epochs: 365,
        deletable: true,
        originalName: imageFile.name,
        mimeType: imageFile.type,
        signer
      })

      // Then, create profile with image blob ID
      const profileResult = await this.storeProfile({
        address,
        username,
        profileImageBlobId: imageResult.blobId,
        createdAt: new Date().toISOString()
      }, signer)

      // Update index
      await this.updateProfileIndex(address, profileResult.profileBlobId, signer)

      return {
        profileBlobId: profileResult.profileBlobId,
        imageBlobId: imageResult.blobId,
        profile: profileResult.profile
      }
    } catch (error) {
      console.error('Failed to create profile with image:', error)
      throw error
    }
  }
}

// Export singleton instance
export const walrusProfileStorage = new WalrusProfileStorage()

// Helper functions for React components
export async function storeUserProfile(
  profile: Omit<UserProfileMetadata, 'updatedAt' | 'version'>,
  signer?: any
): Promise<ProfileStorageResult> {
  return walrusProfileStorage.storeProfile(profile, signer)
}

export async function retrieveUserProfile(profileBlobId: string): Promise<UserProfileMetadata> {
  return walrusProfileStorage.retrieveProfile(profileBlobId)
}

export async function updateUserProfileImage(
  currentProfileBlobId: string,
  newImageBlobId: string,
  signer?: any
): Promise<ProfileStorageResult> {
  return walrusProfileStorage.updateProfileImage(currentProfileBlobId, newImageBlobId, signer)
}
