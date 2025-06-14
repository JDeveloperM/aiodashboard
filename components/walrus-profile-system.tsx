"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WalrusProfileImage } from './walrus-profile-image'
import { WalrusStatusIndicator } from './walrus-provider'
import { useWalrus } from '@/hooks/use-walrus'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { toast } from 'sonner'
import { 
  Save, 
  Upload, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Database,
  HardDrive
} from 'lucide-react'

// Enhanced profile data interface with Walrus blob IDs
interface WalrusProfileData {
  name: string
  username: string
  profileImage: string
  profileImageBlobId?: string
  kycStatus: 'verified' | 'pending' | 'not_verified'
  socialMedia: Array<{
    platform: string
    image: string
    url: string
    connected: boolean
    username: string
    color: string
  }>
  levelInfo: {
    currentLevel: number
    nextLevel: number
    currentXP: number
    nextLevelXP: number
    totalXP: number
  }
  achievements: Array<{
    name: string
    icon: any
    color: string
    unlocked: boolean
    claimed: boolean
    xp: number
    tooltip: string
  }>
  // Walrus-specific metadata
  walrusMetadata?: {
    profileDataBlobId?: string
    lastSyncedAt?: string
    storageEpochs?: number
  }
}

interface WalrusProfileSystemProps {
  initialData?: Partial<WalrusProfileData>
  onDataChange?: (data: WalrusProfileData) => void
  enableWalrusSync?: boolean
}

export function WalrusProfileSystem({ 
  initialData, 
  onDataChange,
  enableWalrusSync = true 
}: WalrusProfileSystemProps) {
  const { user } = useSuiAuth()
  const {
    storeData,
    retrieveData,
    storeImage,
    retrieveImage,
    isLoading,
    error,
    isInitialized,
    isConnected,
    clearError
  } = useWalrus()

  const [profileData, setProfileData] = useState<WalrusProfileData>({
    name: user?.username || "Affiliate User",
    username: user?.username || "@affiliate_user",
    profileImage: "",
    kycStatus: "verified",
    socialMedia: [
      {
        platform: "Discord",
        image: "/images/social/discord.png",
        url: "https://discord.gg/aionet",
        connected: true,
        username: "Affiliate#1234",
        color: "#5865F2"
      },
      {
        platform: "Telegram",
        image: "/images/social/telegram.png",
        url: "https://t.me/aionet",
        connected: true,
        username: "@affiliate_tg",
        color: "#0088CC"
      },
      {
        platform: "X",
        image: "/images/social/x.png",
        url: "https://x.com/aionet",
        connected: false,
        username: "",
        color: "#000000"
      }
    ],
    levelInfo: {
      currentLevel: 5,
      nextLevel: 6,
      currentXP: 330,
      nextLevelXP: 480,
      totalXP: 330
    },
    achievements: [],
    ...initialData
  })

  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncStatus, setLastSyncStatus] = useState<'success' | 'error' | 'pending' | null>(null)

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData()
  }, [user?.address])

  // Auto-sync when Walrus becomes available
  useEffect(() => {
    if (isInitialized && isConnected && enableWalrusSync && profileData.walrusMetadata?.profileDataBlobId) {
      syncFromWalrus()
    }
  }, [isInitialized, isConnected])

  const loadProfileData = async () => {
    if (!user?.address) return

    try {
      // First, try to load from localStorage (immediate)
      const localData = localStorage.getItem(`profile_data_${user.address}`)
      if (localData) {
        const parsed = JSON.parse(localData)
        setProfileData(prev => ({ ...prev, ...parsed }))
      }

      // Then, try to load from Walrus if we have a blob ID
      const walrusMetadata = localStorage.getItem(`profile_walrus_metadata_${user.address}`)
      if (walrusMetadata && isInitialized) {
        const metadata = JSON.parse(walrusMetadata)
        if (metadata.profileDataBlobId) {
          try {
            const walrusData = await retrieveData<WalrusProfileData>(
              metadata.profileDataBlobId,
              'user-profile'
            )
            if (walrusData) {
              setProfileData(prev => ({ ...prev, ...walrusData }))
              setLastSyncStatus('success')
            }
          } catch (error) {
            console.warn('Failed to load from Walrus, using local data:', error)
            setLastSyncStatus('error')
          }
        }
      }
    } catch (error) {
      console.error('Failed to load profile data:', error)
      toast.error('Failed to load profile data')
    }
  }

  const saveProfileData = async (data: WalrusProfileData, shouldSyncToWalrus = enableWalrusSync) => {
    if (!user?.address) return

    try {
      // Always save to localStorage first (immediate)
      localStorage.setItem(`profile_data_${user.address}`, JSON.stringify(data))

      // Notify parent component
      if (onDataChange) {
        onDataChange(data)
      }

      // Sync to Walrus if enabled and available
      if (shouldSyncToWalrus && isInitialized && isConnected) {
        await syncToWalrus(data)
      }

      toast.success('Profile data saved')
    } catch (error) {
      console.error('Failed to save profile data:', error)
      toast.error('Failed to save profile data')
    }
  }

  const syncToWalrus = async (data?: WalrusProfileData) => {
    if (!user?.address || !isInitialized || !isConnected) return

    const dataToSync = data || profileData
    setIsSyncing(true)
    setLastSyncStatus('pending')

    try {
      // Store profile data on Walrus
      const result = await storeData(
        dataToSync,
        'user-profile',
        {
          epochs: 90, // 3 months
          deletable: true,
          useWalrus: true
        }
      )

      if (result.success && result.blobId) {
        // Update metadata
        const metadata = {
          profileDataBlobId: result.blobId,
          lastSyncedAt: new Date().toISOString(),
          storageEpochs: 90
        }

        // Save metadata locally
        localStorage.setItem(`profile_walrus_metadata_${user.address}`, JSON.stringify(metadata))

        // Update profile data with metadata
        const updatedData = {
          ...dataToSync,
          walrusMetadata: metadata
        }

        setProfileData(updatedData)
        localStorage.setItem(`profile_data_${user.address}`, JSON.stringify(updatedData))

        setLastSyncStatus('success')
        toast.success(
          result.fallback 
            ? 'Profile synced locally (Walrus unavailable)' 
            : `Profile synced to Walrus${result.cost ? ` (${result.cost.toFixed(6)} SUI)` : ''}`
        )
      }
    } catch (error) {
      console.error('Failed to sync to Walrus:', error)
      setLastSyncStatus('error')
      toast.error('Failed to sync to Walrus')
    } finally {
      setIsSyncing(false)
    }
  }

  const syncFromWalrus = async () => {
    if (!user?.address || !profileData.walrusMetadata?.profileDataBlobId) return

    setIsSyncing(true)

    try {
      const walrusData = await retrieveData<WalrusProfileData>(
        profileData.walrusMetadata.profileDataBlobId,
        'user-profile'
      )

      if (walrusData) {
        setProfileData(walrusData)
        localStorage.setItem(`profile_data_${user.address}`, JSON.stringify(walrusData))
        setLastSyncStatus('success')
        toast.success('Profile synced from Walrus')
      }
    } catch (error) {
      console.error('Failed to sync from Walrus:', error)
      setLastSyncStatus('error')
      toast.error('Failed to sync from Walrus')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleProfileImageUpdate = async (imageUrl: string, blobId?: string) => {
    const updatedData = {
      ...profileData,
      profileImage: imageUrl,
      profileImageBlobId: blobId
    }
    
    setProfileData(updatedData)
    await saveProfileData(updatedData)
  }

  const handleProfileImageRemove = async () => {
    const updatedData = {
      ...profileData,
      profileImage: '',
      profileImageBlobId: undefined
    }
    
    setProfileData(updatedData)
    await saveProfileData(updatedData)
  }

  const getSyncStatusIcon = () => {
    switch (lastSyncStatus) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
      default:
        return <Database className="w-4 h-4 text-gray-500" />
    }
  }

  const getSyncStatusText = () => {
    if (isSyncing) return 'Syncing...'
    
    switch (lastSyncStatus) {
      case 'success':
        return profileData.walrusMetadata?.lastSyncedAt 
          ? `Last synced: ${new Date(profileData.walrusMetadata.lastSyncedAt).toLocaleString()}`
          : 'Synced successfully'
      case 'error':
        return 'Sync failed'
      case 'pending':
        return 'Syncing...'
      default:
        return 'Not synced'
    }
  }

  return (
    <div className="space-y-6">
      {/* Walrus Status Card */}
      <Card className="bg-[#0A1628] border-[#C0E6FF]/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#C0E6FF] text-lg">Decentralized Storage</CardTitle>
            <WalrusStatusIndicator />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#C0E6FF]/70">
              {getSyncStatusIcon()}
              <span>{getSyncStatusText()}</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={syncFromWalrus}
                disabled={isSyncing || !profileData.walrusMetadata?.profileDataBlobId}
                className="border-[#C0E6FF]/20 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
              >
                <Download className="w-4 h-4 mr-1" />
                Pull
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncToWalrus()}
                disabled={isSyncing || !isInitialized || !isConnected}
                className="border-[#C0E6FF]/20 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
              >
                <Upload className="w-4 h-4 mr-1" />
                Push
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Section with Walrus Image Component */}
      <Card className="bg-[#0A1628] border-[#C0E6FF]/20">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <WalrusProfileImage
              currentImage={profileData.profileImage}
              currentBlobId={profileData.profileImageBlobId}
              fallbackText={profileData.name.charAt(0)}
              size="2xl"
              onImageUpdate={handleProfileImageUpdate}
              onImageRemove={handleProfileImageRemove}
              editable={true}
            />

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#C0E6FF]">{profileData.name}</h2>
              <p className="text-[#C0E6FF]/70">{profileData.username}</p>
              
              <Badge 
                variant="outline" 
                className={`${
                  profileData.kycStatus === 'verified' 
                    ? 'border-green-500/50 text-green-400' 
                    : profileData.kycStatus === 'pending'
                    ? 'border-yellow-500/50 text-yellow-400'
                    : 'border-red-500/50 text-red-400'
                }`}
              >
                KYC: {profileData.kycStatus.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {/* Level Info */}
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-sm text-[#C0E6FF]/70">
                <span>Level {profileData.levelInfo.currentLevel}</span>
                <span>{profileData.levelInfo.currentXP} / {profileData.levelInfo.nextLevelXP} XP</span>
              </div>
              <div className="w-full bg-[#030f1c] rounded-full h-2">
                <div 
                  className="bg-[#4DA2FF] h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(profileData.levelInfo.currentXP / profileData.levelInfo.nextLevelXP) * 100}%` 
                  }}
                />
              </div>
            </div>

            {/* Storage Info */}
            {profileData.walrusMetadata && (
              <div className="text-xs text-[#C0E6FF]/50 space-y-1">
                <div className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  <span>Stored on Walrus for {profileData.walrusMetadata.storageEpochs} epochs</span>
                </div>
                {profileData.profileImageBlobId && (
                  <div>Profile image: {profileData.profileImageBlobId.slice(0, 8)}...</div>
                )}
                {profileData.walrusMetadata.profileDataBlobId && (
                  <div>Profile data: {profileData.walrusMetadata.profileDataBlobId.slice(0, 8)}...</div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
