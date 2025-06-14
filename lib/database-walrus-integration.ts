/**
 * Database + Walrus Integration
 * Best of both worlds: Fast queries + Decentralized storage
 */

// Example using Supabase (you can adapt to any database)
import { createClient } from '@supabase/supabase-js'
import { walrusService } from './walrus-client'

// Database schema (SQL)
/*
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  profile_image_blob_id TEXT, -- Walrus blob ID
  banner_image_blob_id TEXT,  -- Walrus blob ID
  bio TEXT,
  social_links JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_address ON user_profiles(address);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
*/

interface DatabaseProfile {
  id: string
  address: string
  username?: string
  email?: string
  profile_image_blob_id?: string
  banner_image_blob_id?: string
  bio?: string
  social_links: SocialLink[]
  created_at: string
  updated_at: string
}

interface SocialLink {
  platform: string
  username: string
  verified: boolean
}

class DatabaseWalrusIntegration {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  /**
   * Create or update user profile with Walrus image storage
   */
  async upsertProfileWithImage(
    address: string,
    profileData: Partial<DatabaseProfile>,
    imageFile?: File,
    signer?: any
  ): Promise<DatabaseProfile> {
    try {
      let imageBlobId: string | undefined

      // Store image in Walrus if provided
      if (imageFile) {
        const imageData = new Uint8Array(await imageFile.arrayBuffer())
        const imageResult = await walrusService.storeBlob(imageData, 'avatar', {
          epochs: 365, // Store for 1 year
          deletable: true,
          originalName: imageFile.name,
          mimeType: imageFile.type,
          signer
        })
        imageBlobId = imageResult.blobId
        console.log(`Image stored in Walrus: ${imageBlobId}`)
      }

      // Upsert profile in database
      const { data, error } = await this.supabase
        .from('user_profiles')
        .upsert({
          address,
          ...profileData,
          ...(imageBlobId && { profile_image_blob_id: imageBlobId }),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'address'
        })
        .select()
        .single()

      if (error) throw error

      console.log(`Profile updated in database for ${address}`)
      return data
    } catch (error) {
      console.error('Failed to upsert profile:', error)
      throw error
    }
  }

  /**
   * Get user profile by address
   */
  async getProfile(address: string): Promise<DatabaseProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('address', address)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
      return data
    } catch (error) {
      console.error('Failed to get profile:', error)
      return null
    }
  }

  /**
   * Get avatar image URL from Walrus
   */
  async getAvatarUrl(address: string): Promise<string | null> {
    try {
      const profile = await this.getProfile(address)
      if (!profile?.profile_image_blob_id) return null

      // Return Walrus aggregator URL
      return `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${profile.profile_image_blob_id}`
    } catch (error) {
      console.error('Failed to get avatar URL:', error)
      return null
    }
  }

  /**
   * Search profiles by username
   */
  async searchProfiles(query: string, limit = 20): Promise<DatabaseProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to search profiles:', error)
      return []
    }
  }

  /**
   * Get profiles with avatars (for user grids)
   */
  async getProfilesWithAvatars(limit = 50): Promise<DatabaseProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .not('profile_image_blob_id', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get profiles with avatars:', error)
      return []
    }
  }

  /**
   * Update only the avatar blob ID
   */
  async updateAvatarBlobId(address: string, blobId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          profile_image_blob_id: blobId,
          updated_at: new Date().toISOString()
        })
        .eq('address', address)

      if (error) throw error
      console.log(`Avatar blob ID updated for ${address}: ${blobId}`)
    } catch (error) {
      console.error('Failed to update avatar blob ID:', error)
      throw error
    }
  }

  /**
   * Backup profile data to Walrus (for redundancy)
   */
  async backupProfileToWalrus(address: string, signer?: any): Promise<string> {
    try {
      const profile = await this.getProfile(address)
      if (!profile) throw new Error('Profile not found')

      // Store profile JSON in Walrus as backup
      const profileJson = JSON.stringify(profile, null, 2)
      const result = await walrusService.storeBlob(
        new TextEncoder().encode(profileJson),
        'user-profile',
        {
          epochs: 365,
          deletable: true,
          originalName: `profile-backup-${address}.json`,
          mimeType: 'application/json',
          signer
        }
      )

      console.log(`Profile backup stored in Walrus: ${result.blobId}`)
      return result.blobId
    } catch (error) {
      console.error('Failed to backup profile to Walrus:', error)
      throw error
    }
  }
}

// Export singleton
export const dbWalrusIntegration = new DatabaseWalrusIntegration()

// Helper functions for React components
export async function updateUserAvatar(
  address: string,
  imageFile: File,
  signer?: any
): Promise<string> {
  const result = await dbWalrusIntegration.upsertProfileWithImage(
    address,
    {},
    imageFile,
    signer
  )
  return result.profile_image_blob_id!
}

export async function getUserAvatarUrl(address: string): Promise<string | null> {
  return dbWalrusIntegration.getAvatarUrl(address)
}
