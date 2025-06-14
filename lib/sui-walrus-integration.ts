"use client"

import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { useWalrus } from '@/hooks/use-walrus'
import { toast } from 'sonner'

// Smart contract integration for storing Walrus blob references on SUI
export interface WalrusBlobMetadata {
  blobId: string
  contentType: string
  size: number
  mimeType?: string
  uploadedAt: string
  expiresAt: string
  owner: string
}

export interface SuiWalrusResult {
  walrusBlobId: string
  suiTransactionDigest: string
  cost?: number
}

// Example SUI Move struct (for reference)
/*
module your_package::walrus_storage {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use std::string::String;

    struct UserProfile has key, store {
        id: UID,
        owner: address,
        profile_image_blob_id: Option<String>,
        profile_data_blob_id: Option<String>,
        created_at: u64,
        updated_at: u64,
    }

    struct MediaAsset has key, store {
        id: UID,
        owner: address,
        blob_id: String,
        content_type: String,
        size: u64,
        mime_type: Option<String>,
        uploaded_at: u64,
        expires_at: u64,
    }
}
*/

export function useSuiWalrusIntegration() {
  const suiClient = useSuiClient()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const walrus = useWalrus()

  // Your smart contract package ID (replace with actual)
  const PACKAGE_ID = "0x..." // Your deployed package ID
  
  /**
   * Store media on Walrus and register metadata on SUI
   */
  const storeMediaWithContract = async (
    file: File | string,
    contentType: string,
    contractFunction: 'create_profile' | 'update_profile_image' | 'create_media_asset' = 'create_media_asset'
  ): Promise<SuiWalrusResult> => {
    try {
      // Step 1: Store on Walrus
      toast.info('Uploading to Walrus...')
      const walrusResult = await walrus.storeImage(file, contentType as any, {
        epochs: 90,
        deletable: true,
        useWalrus: true
      })

      if (!walrusResult.success || !walrusResult.blobId) {
        throw new Error('Failed to store on Walrus')
      }

      // Step 2: Create SUI transaction to store metadata
      toast.info('Registering on SUI blockchain...')
      const tx = new Transaction()

      // Calculate file size
      const fileSize = file instanceof File ? file.size : file.length * 0.75
      const mimeType = file instanceof File ? file.type : 'image/jpeg'
      const expiresAt = Date.now() + (90 * 24 * 60 * 60 * 1000) // 90 days

      switch (contractFunction) {
        case 'create_profile':
          tx.moveCall({
            target: `${PACKAGE_ID}::walrus_storage::create_user_profile`,
            arguments: [
              tx.pure.string(walrusResult.blobId!), // profile_image_blob_id
              tx.pure.u64(Date.now()), // created_at
            ],
          })
          break

        case 'update_profile_image':
          // Note: This requires the profile object ID to be known
          // In a real implementation, you would need to:
          // 1. Query for the user's profile objects first
          // 2. Get the object ID from the query result
          // 3. Use that object ID here
          throw new Error('update_profile_image not fully implemented - requires profile object ID lookup')
          break

        case 'create_media_asset':
          tx.moveCall({
            target: `${PACKAGE_ID}::walrus_storage::create_media_asset`,
            arguments: [
              tx.pure.string(walrusResult.blobId!),
              tx.pure.string(contentType),
              tx.pure.u64(fileSize),
              tx.pure.string(mimeType || 'application/octet-stream'), // Default mime type if not provided
              tx.pure.u64(Date.now()), // uploaded_at
              tx.pure.u64(expiresAt), // expires_at
            ],
          })
          break
      }

      // Step 3: Execute transaction
      return new Promise<SuiWalrusResult>((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              toast.success('Successfully stored on Walrus and registered on SUI!')

              // Store transaction digest for reference
              // Note: To get object changes, you would need to query the transaction result separately
              console.log('Transaction successful:', result.digest)

              resolve({
                walrusBlobId: walrusResult.blobId!, // We already checked this is not null above
                suiTransactionDigest: result.digest,
                cost: walrusResult.cost
              })
            },
            onError: (error) => {
              toast.error('Failed to register on SUI blockchain')
              reject(error)
            }
          }
        )
      })
    } catch (error) {
      console.error('Store media with contract failed:', error)
      toast.error('Failed to store media')
      throw error
    }
  }

  /**
   * Retrieve media metadata from SUI and content from Walrus
   */
  const retrieveMediaWithContract = async (objectId: string) => {
    try {
      // Step 1: Get metadata from SUI
      const object = await suiClient.getObject({
        id: objectId,
        options: { showContent: true }
      })

      if (!object.data?.content || object.data.content.dataType !== 'moveObject') {
        throw new Error('Invalid object or content')
      }

      const fields = object.data.content.fields as any
      const blobId = fields.blob_id || fields.profile_image_blob_id

      if (!blobId) {
        throw new Error('No blob ID found in object')
      }

      // Step 2: Retrieve content from Walrus
      const contentType = fields.content_type || 'profile-image'
      const content = await walrus.retrieveImage(blobId, contentType)

      return {
        content,
        metadata: {
          blobId,
          contentType: fields.content_type,
          size: fields.size,
          mimeType: fields.mime_type,
          uploadedAt: fields.uploaded_at,
          expiresAt: fields.expires_at,
          owner: fields.owner || object.data.owner
        }
      }
    } catch (error) {
      console.error('Retrieve media with contract failed:', error)
      throw error
    }
  }

  /**
   * Get user's profile from SUI
   */
  const getUserProfile = async (userAddress: string) => {
    try {
      // Query for user's profile objects
      const objects = await suiClient.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${PACKAGE_ID}::walrus_storage::UserProfile`
        },
        options: { showContent: true }
      })

      if (objects.data.length === 0) {
        return null // No profile found
      }

      const profileObject = objects.data[0]
      if (!profileObject.data?.content || profileObject.data.content.dataType !== 'moveObject') {
        throw new Error('Invalid profile object')
      }

      const fields = profileObject.data.content.fields as any
      
      // Retrieve profile image if exists
      let profileImage = null
      if (fields.profile_image_blob_id) {
        try {
          profileImage = await walrus.retrieveImage(fields.profile_image_blob_id, 'profile-image')
        } catch (error) {
          console.warn('Failed to retrieve profile image:', error)
        }
      }

      // Retrieve profile data if exists
      let profileData = null
      if (fields.profile_data_blob_id) {
        try {
          profileData = await walrus.retrieveData(fields.profile_data_blob_id, 'user-profile')
        } catch (error) {
          console.warn('Failed to retrieve profile data:', error)
        }
      }

      return {
        objectId: profileObject.data.objectId,
        profileImage,
        profileData,
        metadata: {
          createdAt: fields.created_at,
          updatedAt: fields.updated_at,
          owner: fields.owner
        }
      }
    } catch (error) {
      console.error('Get user profile failed:', error)
      throw error
    }
  }

  /**
   * Get user's media assets from SUI
   */
  const getUserMediaAssets = async (userAddress: string) => {
    try {
      const objects = await suiClient.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${PACKAGE_ID}::walrus_storage::MediaAsset`
        },
        options: { showContent: true }
      })

      const assets = await Promise.all(
        objects.data.map(async (obj) => {
          if (!obj.data?.content || obj.data.content.dataType !== 'moveObject') {
            return null
          }

          const fields = obj.data.content.fields as any
          
          try {
            const content = await walrus.retrieveImage(fields.blob_id, fields.content_type)
            return {
              objectId: obj.data.objectId,
              content,
              metadata: {
                blobId: fields.blob_id,
                contentType: fields.content_type,
                size: fields.size,
                mimeType: fields.mime_type,
                uploadedAt: fields.uploaded_at,
                expiresAt: fields.expires_at
              }
            }
          } catch (error) {
            console.warn(`Failed to retrieve content for ${fields.blob_id}:`, error)
            return {
              objectId: obj.data.objectId,
              content: null,
              metadata: {
                blobId: fields.blob_id,
                contentType: fields.content_type,
                size: fields.size,
                mimeType: fields.mime_type,
                uploadedAt: fields.uploaded_at,
                expiresAt: fields.expires_at
              }
            }
          }
        })
      )

      return assets.filter(asset => asset !== null)
    } catch (error) {
      console.error('Get user media assets failed:', error)
      throw error
    }
  }

  return {
    storeMediaWithContract,
    retrieveMediaWithContract,
    getUserProfile,
    getUserMediaAssets,
    isLoading: walrus.isLoading,
    error: walrus.error
  }
}
