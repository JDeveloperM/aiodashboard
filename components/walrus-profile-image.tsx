"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Camera, Upload, Trash2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useWalrus } from '@/hooks/use-walrus'
import { StorageDurationSelector, WalrusStatusIndicator } from './walrus-provider'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface WalrusProfileImageProps {
  currentImage?: string
  currentBlobId?: string
  fallbackText: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  onImageUpdate?: (imageUrl: string, blobId?: string) => void
  onImageRemove?: () => void
  editable?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
  '2xl': 'h-44 w-44'
}

export function WalrusProfileImage({
  currentImage,
  currentBlobId,
  fallbackText,
  size = 'xl',
  onImageUpdate,
  onImageRemove,
  editable = true,
  className
}: WalrusProfileImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [storageEpochs, setStorageEpochs] = useState(30) // Default to 1 month
  const [useWalrusStorage, setUseWalrusStorage] = useState(true)
  
  const {
    storeImage,
    retrieveImage,
    isLoading,
    error,
    isInitialized,
    isConnected,
    calculateCost,
    clearError
  } = useWalrus()

  // Load image from Walrus if we have a blob ID but no current image
  useEffect(() => {
    const loadImageFromWalrus = async () => {
      if (currentBlobId && !currentImage && isInitialized) {
        try {
          const imageUrl = await retrieveImage(currentBlobId, 'profile-image')
          if (imageUrl && onImageUpdate) {
            onImageUpdate(imageUrl, currentBlobId)
          }
        } catch (error) {
          console.warn('Failed to load image from Walrus:', error)
        }
      }
    }

    loadImageFromWalrus()
  }, [currentBlobId, currentImage, isInitialized, retrieveImage, onImageUpdate])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
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

    clearError()

    try {
      const result = await storeImage(
        selectedFile,
        'profile-image',
        {
          epochs: useWalrusStorage ? storageEpochs : undefined,
          deletable: true,
          useWalrus: useWalrusStorage
        }
      )

      if (result.success) {
        // Update the parent component
        if (onImageUpdate) {
          onImageUpdate(previewUrl, result.blobId)
        }

        toast.success(
          result.fallback
            ? 'Image saved locally (Walrus unavailable)'
            : `Image stored on Walrus testnet${result.cost ? ` (${result.cost.toFixed(6)} SUI)` : ' (free via public publisher)'}`
        )

        // Reset state
        setSelectedFile(null)
        setPreviewUrl('')
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload image')
    }
  }

  const handleRemove = () => {
    if (onImageRemove) {
      onImageRemove()
    }
    toast.success('Profile image removed')
  }

  const handleQuickUpload = () => {
    fileInputRef.current?.click()
  }

  const estimatedCost = selectedFile && useWalrusStorage 
    ? calculateCost(selectedFile.size, storageEpochs) 
    : 0

  return (
    <>
      <div className={cn("relative group", className)}>
        <Avatar className={cn(sizeClasses[size], "bg-blue-100")}>
          <AvatarImage src={currentImage} alt="Profile" />
          <AvatarFallback className="bg-[#4DA2FF] text-white text-lg font-semibold">
            {fallbackText}
          </AvatarFallback>
        </Avatar>

        {editable && (
          <>
            {/* Upload overlay */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              onClick={handleQuickUpload}
            >
              <Camera className="w-6 h-6 text-white" />
            </div>

            {/* Remove button (only show if image exists) */}
            {currentImage && (
              <button
                onClick={handleRemove}
                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors duration-200"
                title="Remove image"
              >
                ×
              </button>
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
            <DialogTitle className="text-[#C0E6FF]">Upload Profile Image</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview */}
            {previewUrl && (
              <div className="flex justify-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={previewUrl} alt="Preview" />
                  <AvatarFallback>{fallbackText}</AvatarFallback>
                </Avatar>
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
                    checked={useWalrusStorage && isInitialized}
                    onChange={(e) => setUseWalrusStorage(e.target.checked)}
                    disabled={!isInitialized}
                    className="rounded"
                  />
                </div>

                {/* Storage duration selector */}
                {useWalrusStorage && isInitialized && (
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
                {(!useWalrusStorage || !isInitialized) && (
                  <div className="p-3 bg-yellow-500/10 rounded border border-yellow-500/20">
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>Image will be stored locally</span>
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
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
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
