"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Camera, Upload, Trash2, AlertCircle, CheckCircle, Loader2, Database, HardDrive, Image } from 'lucide-react'
import { StorageDurationSelector, WalrusStatusIndicator } from './walrus-provider'
import { useWalrus } from '@/hooks/use-walrus'
import { usePersistentProfile } from '@/hooks/use-persistent-profile'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useZkLogin } from '@/components/zklogin-provider'
import { encryptedStorage } from '@/lib/encrypted-database-storage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface EnhancedBannerProps {
  className?: string
  editable?: boolean
  showStorageInfo?: boolean
  showDeleteButton?: boolean
}

export function EnhancedBanner({
  className,
  editable = true,
  showStorageInfo = false,
  showDeleteButton = true
}: EnhancedBannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [storageEpochs, setStorageEpochs] = useState(90) // Default to 3 months
  const [useWalrusStorage, setUseWalrusStorage] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    profile,
    refreshProfile,
    isLoading: profileLoading
  } = usePersistentProfile()

  const { user } = useSuiAuth()
  const currentAccount = useCurrentAccount()
  const { zkLoginUserAddress } = useZkLogin()

  const {
    storeImage,
    calculateCost,
    isInitialized: walrusInitialized
  } = useWalrus()

  // Get user address (same logic as avatar) - include zkLogin support
  const getUserAddress = () => {
    return currentAccount?.address || user?.address || zkLoginUserAddress
  }

  const clearError = () => setError(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (10MB limit for banners)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Banner image size should be less than 10MB')
      return
    }

    setSelectedFile(file)
    
    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    
    setIsDialogOpen(true)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    const address = getUserAddress()
    if (!address) {
      setError('No wallet connected - please connect your wallet or sign in with zkLogin')
      return
    }

    clearError()
    setIsUploading(true)

    try {
      // Store on Walrus (exactly like avatar)
      const result = await storeImage(
        selectedFile,
        'channel-banner',
        {
          epochs: useWalrusStorage ? storageEpochs : 90, // Default to 3 months
          deletable: true,
          useWalrus: useWalrusStorage
        }
      )

      if (result.success && result.blobId) {
        // Save to database (exactly like avatar)
        try {
          // Update banner blob ID directly (simpler approach)
          await encryptedStorage.updateBannerBlobId(address, result.blobId)
        } catch (dbError) {
          console.error('Failed to save banner to database:', dbError)
          throw new Error(`Failed to save banner to database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`)
        }

        // Refresh profile to get updated data
        await refreshProfile()

        // Force a second refresh after a short delay to ensure data is loaded
        setTimeout(async () => {
          await refreshProfile()
        }, 1000)

        toast.success(
          result.fallback
            ? 'Banner saved locally (Walrus unavailable)'
            : `Banner stored on Walrus testnet${result.cost ? ` (${result.cost.toFixed(6)} SUI)` : ' (free via public publisher)'}`
        )

        // Reset state
        setSelectedFile(null)
        setPreviewUrl('')
        setIsDialogOpen(false)
      } else {
        throw new Error('Walrus storage failed: Unknown error')
      }
    } catch (error) {
      console.error('Banner upload failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload banner')
      toast.error('Failed to upload banner image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    const address = getUserAddress()
    if (!address) {
      setError('No wallet connected - please connect your wallet or sign in with zkLogin')
      return
    }

    try {
      setIsUploading(true)

      // Remove from database (exactly like avatar)
      await encryptedStorage.updateBannerBlobId(address, null)

      // Refresh profile to get updated data
      await refreshProfile()

      toast.success('Banner image removed')
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to remove banner:', error)
      toast.error('Failed to remove banner image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleQuickUpload = () => {
    fileInputRef.current?.click()
  }

  const estimatedCost = selectedFile && useWalrusStorage 
    ? calculateCost(selectedFile.size, storageEpochs) 
    : 0

  const currentBannerUrl = profile?.banner_image_blob_id
    ? `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${profile.banner_image_blob_id}`
    : null

  // Component state ready

  const isLoading = profileLoading || isUploading

  return (
    <>
      <div className={cn("relative group w-full h-64 rounded-lg overflow-hidden", className)}>
        {/* Banner Image or Placeholder */}
        {currentBannerUrl ? (
          <img
            src={currentBannerUrl}
            alt="Profile Banner"
            className="w-full h-full object-cover"
            onLoad={() => {}}
            onError={() => {}}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#1a2f51] to-[#0a1628] flex items-center justify-center">
            <div className="text-center text-[#C0E6FF]/50">
              <Image className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm">No banner image</span>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        {editable && (
          <>
            {/* Upload overlay */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              onClick={handleQuickUpload}
            >
              <div className="text-center text-white">
                <Camera className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">Update Banner</span>
              </div>
            </div>

            {/* Remove button (only show if banner exists and showDeleteButton is true) */}
            {currentBannerUrl && showDeleteButton && (
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors duration-200"
                title="Remove banner"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Test Buttons (disabled for production-ready interface) */}
            {false && process.env.NODE_ENV === 'development' && (
              <>
                <button
                  onClick={async () => {
                    const address = getUserAddress()
                    if (!address) {
                      toast.error('No wallet connected')
                      return
                    }

                    try {
                      console.log('🧪 Testing banner database update...')
                      const testBlobId = 'test-blob-id-' + Date.now()
                      await encryptedStorage.updateBannerBlobId(address, testBlobId)
                      console.log('✅ Test banner update successful')
                      toast.success('Banner database test successful!')
                      await refreshProfile()
                    } catch (error) {
                      console.error('❌ Test banner update failed:', error)
                      toast.error(`Banner database test failed: ${error}`)
                    }
                  }}
                  className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs transition-colors duration-200"
                  title="Test Banner DB"
                >
                  🧪
                </button>

                <button
                  onClick={async () => {
                    try {
                      console.log('☁️ Testing Walrus connection...')
                      console.log('🔧 Walrus initialized:', walrusInitialized)
                      console.log('⚙️ Walrus hook state:', {
                        isInitialized: walrusInitialized,
                        storeImage: typeof storeImage,
                        calculateCost: typeof calculateCost
                      })

                      if (!walrusInitialized) {
                        toast.error('Walrus not initialized')
                        return
                      }

                      // Test with a small dummy file
                      const dummyFile = new File(['test'], 'test.txt', { type: 'text/plain' })
                      const testCost = calculateCost(dummyFile.size, 30)
                      console.log('💰 Test cost calculation:', testCost)

                      toast.success(`Walrus test successful! Cost: ${testCost.toFixed(6)} SUI`)
                    } catch (error) {
                      console.error('❌ Walrus test failed:', error)
                      toast.error(`Walrus test failed: ${error}`)
                    }
                  }}
                  className="absolute top-2 left-12 bg-purple-500 hover:bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs transition-colors duration-200"
                  title="Test Walrus"
                >
                  ☁️
                </button>
              </>
            )}

            {/* Storage indicator */}
            {showStorageInfo && profile?.banner_image_blob_id && (
              <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center" title="Stored on Walrus">
                <Database className="w-3 h-3" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden file input for quick upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#0A1628] border-[#C0E6FF]/20">
          <DialogHeader>
            <DialogTitle className="text-[#C0E6FF]">Update Banner Image</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview */}
            {previewUrl && (
              <div className="w-full h-32 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Current storage info */}
            {profile?.banner_image_blob_id && (
              <div className="p-3 bg-[#030f1c] rounded border border-[#C0E6FF]/20">
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-3 h-3 text-green-400" />
                    <span className="text-[#C0E6FF]">Currently stored on Walrus</span>
                  </div>
                  <div className="text-[#C0E6FF]/70">Blob ID: {profile.banner_image_blob_id.slice(0, 16)}...</div>
                </div>
              </div>
            )}

            {/* Walrus status */}
            <WalrusStatusIndicator />

            {/* Storage options */}
            {selectedFile && (
              <div className="space-y-4">
                {/* Use Walrus toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#C0E6FF]">
                    Use Walrus Storage
                  </label>
                  <input
                    type="checkbox"
                    checked={useWalrusStorage && walrusInitialized}
                    onChange={(e) => setUseWalrusStorage(e.target.checked)}
                    disabled={!walrusInitialized}
                    className="rounded"
                  />
                </div>

                {/* Storage duration selector */}
                {useWalrusStorage && walrusInitialized && (
                  <StorageDurationSelector
                    sizeInBytes={selectedFile.size}
                    selectedEpochs={storageEpochs}
                    onEpochsChange={setStorageEpochs}
                  />
                )}

                {/* Cost estimate */}
                {useWalrusStorage && estimatedCost > 0 && (
                  <div className="p-3 bg-[#030f1c] rounded border border-[#C0E6FF]/20">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-[#C0E6FF]">
                        Estimated cost: {estimatedCost.toFixed(6)} SUI
                      </span>
                    </div>
                  </div>
                )}

                {/* Fallback notice */}
                {(!useWalrusStorage || !walrusInitialized) && (
                  <div className="p-3 bg-yellow-500/10 rounded border border-yellow-500/20">
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <HardDrive className="w-4 h-4" />
                      <span>Banner will be stored locally</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="p-3 bg-red-500/10 rounded border border-red-500/20">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setSelectedFile(null)
                  setPreviewUrl('')
                  clearError()
                }}
                className="border-[#C0E6FF]/20 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Update Banner
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
