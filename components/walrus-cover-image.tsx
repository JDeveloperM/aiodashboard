"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Camera, Upload, Trash2, X } from 'lucide-react'
import { useWalrus } from '@/hooks/use-walrus'
import { StorageDurationSelector, WalrusStatusIndicator } from './walrus-provider'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface WalrusCoverImageProps {
  currentImage?: string
  currentBlobId?: string
  onImageUpdate?: (imageUrl: string, blobId?: string) => void
  onImageRemove?: () => void
  editable?: boolean
  className?: string
  height?: string
}

export function WalrusCoverImage({
  currentImage,
  currentBlobId,
  onImageUpdate,
  onImageRemove,
  editable = true,
  className,
  height = "h-32"
}: WalrusCoverImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [storageEpochs, setStorageEpochs] = useState(30) // Default to 1 month
  const [useWalrusStorage, setUseWalrusStorage] = useState(true)
  
  const {
    storeImage,
    isLoading,
    error,
    isInitialized,
    calculateCost,
    clearError
  } = useWalrus()

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
        'creator-banner',
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
            ? 'Cover image saved locally (Walrus unavailable)'
            : `Cover image stored on Walrus testnet${result.cost ? ` (${result.cost.toFixed(6)} SUI)` : ' (free via public publisher)'}`
        )

        // Reset state
        setSelectedFile(null)
        setPreviewUrl('')
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload cover image')
    }
  }

  const handleRemove = () => {
    if (onImageRemove) {
      onImageRemove()
    }
    toast.success('Cover image removed')
  }

  const handleQuickUpload = () => {
    fileInputRef.current?.click()
  }

  const estimatedCost = selectedFile && useWalrusStorage 
    ? calculateCost(selectedFile.size, storageEpochs) 
    : 0

  return (
    <>
      <div className={cn("space-y-2", className)}>
        {currentImage ? (
          <div className="relative group">
            <div className={cn("w-full rounded-lg overflow-hidden border-2 border-[#4DA2FF]", height)}>
              <img src={currentImage} alt="Cover" className="w-full h-full object-cover" />
            </div>
            
            {editable && (
              <>
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                     onClick={handleQuickUpload}>
                  <Camera className="w-8 h-8 text-white" />
                </div>

                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div 
            className={cn(
              "w-full border-2 border-dashed border-[#C0E6FF]/30 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#4DA2FF] transition-colors duration-200",
              height,
              !editable && "cursor-default"
            )}
            onClick={editable ? handleQuickUpload : undefined}
          >
            <div className="text-center">
              <Upload className="w-8 h-8 text-[#C0E6FF] mx-auto mb-2" />
              <p className="text-sm text-[#C0E6FF]">
                {editable ? 'Click to upload cover image' : 'No cover image'}
              </p>
            </div>
          </div>
        )}
        
        {editable && (
          <Button
            type="button"
            variant="outline"
            onClick={handleQuickUpload}
            className="border-[#C0E6FF] text-[#C0E6FF] hover:bg-[#4DA2FF]/20"
          >
            <Upload className="w-4 h-4 mr-2" />
            {currentImage ? 'Change Cover Image' : 'Upload Cover Image'}
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a1628] border-[#C0E6FF]/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#C0E6FF]">Upload Cover Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Preview */}
            {previewUrl && (
              <div className="w-full h-32 rounded-lg overflow-hidden border border-[#C0E6FF]/20">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Storage Options */}
            <div className="space-y-3">
              <StorageDurationSelector
                value={storageEpochs}
                onChange={setStorageEpochs}
                useWalrus={useWalrusStorage}
                onUseWalrusChange={setUseWalrusStorage}
                estimatedCost={estimatedCost}
              />
            </div>

            {/* Status */}
            <WalrusStatusIndicator />

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className="flex-1 bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white"
              >
                {isLoading ? 'Uploading...' : 'Upload'}
              </Button>
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="outline"
                className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#4DA2FF]/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
