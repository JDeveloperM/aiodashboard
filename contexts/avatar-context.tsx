"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSuiAuth } from './sui-auth-context'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useZkLogin } from '@/components/zklogin-provider'
import { useWalrus } from '@/hooks/use-walrus'
import { toast } from 'sonner'
import { encryptedStorage } from '@/lib/encrypted-database-storage'

interface AvatarData {
  blobId?: string
  lastUpdated?: string
}

interface AvatarContextType {
  // Current avatar data
  avatarData: AvatarData
  isLoading: boolean
  error: string | null

  // Methods
  updateAvatar: (file: File | string, options?: { epochs?: number; deletable?: boolean }) => Promise<boolean>
  removeAvatar: () => Promise<boolean>
  clearError: () => void

  // Utilities
  getAvatarUrl: () => string | undefined
  getFallbackText: () => string
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined)

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const { user, updateProfile } = useSuiAuth()
  const currentAccount = useCurrentAccount()
  const { zkLoginUserAddress } = useZkLogin()
  const {
    storeImage,
    retrieveImage,
    isInitialized: walrusInitialized
  } = useWalrus()

  const [avatarData, setAvatarData] = useState<AvatarData>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cachedImageUrl, setCachedImageUrl] = useState<string | undefined>()

  // Get user address with fallback to wallet address or zkLogin address
  const getUserAddress = () => user?.address || currentAccount?.address || zkLoginUserAddress

  // Load avatar data on mount and when user changes
  useEffect(() => {
    const address = getUserAddress()
    if (address) {
      loadAvatarFromDatabase(address)
    }
  }, [currentAccount?.address, zkLoginUserAddress, user?.address])

  // Also trigger loading when walrus is initialized (in case wallet connects after walrus)
  useEffect(() => {
    if (walrusInitialized) {
      const address = getUserAddress()
      console.log('🔄 Walrus initialized, checking for avatar', { address })
      if (address && !cachedImageUrl) {
        loadAvatarFromDatabase(address)
      }
    }
  }, [walrusInitialized])

  // Load avatar from database (primary) or fallback to cookies
  const loadAvatarFromDatabase = async (address: string) => {
    console.log('🔍 Loading avatar for address:', address)
    setIsLoading(true)
    setError(null)

    try {
      // Try to get avatar URL from database first
      console.log('🔄 Checking database for avatar...')
      const avatarUrl = await encryptedStorage.getAvatarUrl(address)
      console.log('📡 Database response:', avatarUrl)

      if (avatarUrl) {
        // Check if it's a default avatar path or Walrus URL
        if (avatarUrl.startsWith('/images/animepfp/')) {
          // It's a default avatar path
          setAvatarData({ blobId: avatarUrl, lastUpdated: new Date().toISOString() })
          setCachedImageUrl(avatarUrl)
          console.log('✅ Default avatar loaded from database:', avatarUrl)
          setIsLoading(false)
          return
        } else {
          // Extract blob ID from Walrus URL
          const blobId = avatarUrl.split('/').pop()
          if (blobId) {
            setAvatarData({ blobId, lastUpdated: new Date().toISOString() })
            setCachedImageUrl(avatarUrl)
            console.log('✅ Walrus avatar loaded from database:', blobId)
            setIsLoading(false)
            return
          }
        }
      }

      // Fallback to cookies if database doesn't have avatar
      console.log('🍪 Falling back to cookies...')
      const blobId = user?.profileImageBlobId
      if (blobId) {
        setAvatarData({ blobId, lastUpdated: new Date().toISOString() })
        // Check if it's a default avatar or Walrus blob
        if (blobId.startsWith('/images/animepfp/')) {
          setCachedImageUrl(blobId) // Use path directly for default avatars
          console.log('✅ Default avatar loaded from cookies:', blobId)
        } else {
          // Construct Walrus URL for uploaded images
          const walrusUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`
          setCachedImageUrl(walrusUrl)
          console.log('✅ Walrus avatar loaded from cookies (fallback):', blobId)
        }
      } else {
        console.log('❌ No avatar found in database or cookies')
        setAvatarData({})
        setCachedImageUrl(undefined)
      }
    } catch (error) {
      console.error('❌ Failed to load avatar from database:', error)
      setError('Failed to load avatar')
      // Fallback to cookies
      const blobId = user?.profileImageBlobId
      if (blobId) {
        setAvatarData({ blobId, lastUpdated: new Date().toISOString() })
        if (blobId.startsWith('/images/animepfp/')) {
          setCachedImageUrl(blobId) // Use path directly for default avatars
        } else {
          const walrusUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`
          setCachedImageUrl(walrusUrl)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Load image from Walrus using blob ID
  const loadImageFromWalrus = async (blobId: string) => {
    if (!walrusInitialized) return

    setIsLoading(true)
    setError(null)

    try {
      const imageUrl = await retrieveImage(blobId, 'profile-image')
      if (imageUrl) {
        setCachedImageUrl(imageUrl)
        console.log('Avatar loaded from Walrus:', blobId)
      } else {
        setError('Failed to load avatar from Walrus')
      }
    } catch (error) {
      console.error('Failed to load avatar from Walrus:', error)
      setError('Failed to load avatar from Walrus')
    } finally {
      setIsLoading(false)
    }
  }

  // Update avatar (store on Walrus like the demo)
  const updateAvatar = async (
    file: File | string,
    options: { epochs?: number; deletable?: boolean } = {}
  ): Promise<boolean> => {
    const address = getUserAddress()
    if (!address) {
      setError('No wallet connected - please connect your wallet or sign in with zkLogin')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Store on Walrus (exactly like the demo)
      // Use Walrus for both wallet and zkLogin users (if zkLogin session is valid)
      const useWalrusStorage = true // Try Walrus first, fallback will handle failures
      console.log('🔍 Avatar storage method:', {
        hasCurrentAccount: !!currentAccount,
        hasZkLoginAddress: !!zkLoginUserAddress,
        useWalrusStorage,
        storageMethod: 'Walrus (with fallback)'
      })

      const result = await storeImage(file, 'profile-image', {
        epochs: options.epochs || 90, // 3 months default
        deletable: options.deletable ?? true,
        useWalrus: useWalrusStorage
      })

      if (result.success && result.blobId) {
        // Update avatar data with blob ID only
        const newAvatarData: AvatarData = {
          blobId: result.blobId,
          lastUpdated: new Date().toISOString()
        }

        setAvatarData(newAvatarData)

        // Save to database (primary storage) - ONLY UPDATE AVATAR BLOB ID
        console.log('🔄 Attempting to save avatar to database...', { address, blobId: result.blobId })
        try {
          // Use updateAvatarBlobId to ONLY update the avatar, not overwrite the entire profile
          await encryptedStorage.updateAvatarBlobId(address, result.blobId)
          console.log('✅ Avatar blob ID saved to database successfully')
        } catch (dbError) {
          console.error('❌ Failed to save to database, using cookies fallback:', dbError)
          console.error('Database error details:', dbError)
        }

        // Also update user profile in auth context (cookies fallback)
        await updateProfile({
          profileImageBlobId: result.blobId
        })

        // Set the avatar URL directly (no need to load from Walrus again)
        const avatarUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${result.blobId}`
        setCachedImageUrl(avatarUrl)

        // Refresh avatar from database to ensure consistency
        setTimeout(() => {
          loadAvatarFromDatabase(address)
        }, 1000)

        toast.success(
          result.fallback
            ? 'Avatar saved locally (Walrus unavailable)'
            : `Avatar stored on Walrus testnet${result.cost ? ` (${result.cost.toFixed(6)} SUI)` : ' (free via public publisher)'}`
        )

        return true
      } else {
        setError('Failed to store avatar')
        toast.error('Failed to store avatar')
        return false
      }
    } catch (error) {
      console.error('Failed to update avatar:', error)
      setError('Failed to update avatar')
      toast.error('Failed to update avatar')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Remove avatar
  const removeAvatar = async (): Promise<boolean> => {
    const address = getUserAddress()
    if (!address) return false

    setIsLoading(true)
    setError(null)

    try {
      // Clear avatar data
      setAvatarData({})
      setCachedImageUrl(undefined)

      // Update user profile in auth context (this saves to cookies)
      await updateProfile({
        profileImageBlobId: undefined
      })

      toast.success('Avatar removed')
      return true
    } catch (error) {
      console.error('Failed to remove avatar:', error)
      setError('Failed to remove avatar')
      toast.error('Failed to remove avatar')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Get current avatar URL
  const getAvatarUrl = (): string | undefined => {
    if (cachedImageUrl) {
      return cachedImageUrl
    }

    if (avatarData.blobId) {
      // Check if it's a default avatar path (starts with /images/animepfp/)
      if (avatarData.blobId.startsWith('/images/animepfp/')) {
        return avatarData.blobId // Return the path directly for default avatars
      }
      // Otherwise it's a Walrus blob ID
      return `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${avatarData.blobId}`
    }

    return undefined
  }

  // Get fallback text for avatar
  const getFallbackText = (): string => {
    const address = getUserAddress()
    return user?.username?.charAt(0)?.toUpperCase() || address?.charAt(2)?.toUpperCase() || 'U'
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  const value: AvatarContextType = {
    avatarData,
    isLoading,
    error,
    updateAvatar,
    removeAvatar,
    clearError,
    getAvatarUrl,
    getFallbackText
  }

  return (
    <AvatarContext.Provider value={value}>
      {children}
    </AvatarContext.Provider>
  )
}

export function useAvatar() {
  const context = useContext(AvatarContext)
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider')
  }
  return context
}
