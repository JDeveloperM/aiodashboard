"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { WalrusProfileImage } from './walrus-profile-image'
import { useSuiWalrusIntegration } from '@/lib/sui-walrus-integration'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { toast } from 'sonner'
import {
  Save,
  Upload,
  Download,
  Database,
  Link,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react'

interface SuiWalrusProfileData {
  objectId?: string
  profileImage?: string
  profileImageBlobId?: string
  profileDataBlobId?: string
  username?: string
  bio?: string
  metadata?: {
    createdAt: number
    updatedAt: number
    owner: string
  }
}

export function SuiWalrusProfile() {
  const { user, isSignedIn } = useSuiAuth()
  const {
    storeMediaWithContract,
    getUserProfile,
    isLoading,
    error
  } = useSuiWalrusIntegration()

  const [profileData, setProfileData] = useState<SuiWalrusProfileData>({})
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    username: '',
    bio: ''
  })

  // Load profile data on mount
  useEffect(() => {
    if (user?.address) {
      loadProfile()
    }
  }, [user?.address])

  const loadProfile = async () => {
    if (!user?.address) return

    try {
      const profile = await getUserProfile(user.address)
      if (profile) {
        setProfileData({
          objectId: profile.objectId,
          profileImage: profile.profileImage || undefined,
          profileImageBlobId: profile.profileData?.profileImageBlobId,
          profileDataBlobId: profile.profileData?.profileDataBlobId,
          username: profile.profileData?.username,
          bio: profile.profileData?.bio,
          metadata: profile.metadata
        })

        setEditForm({
          username: profile.profileData?.username || '',
          bio: profile.profileData?.bio || ''
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      // Profile doesn't exist yet, that's okay
    }
  }

  const handleCreateProfile = async () => {
    if (!user?.address) return

    setIsSaving(true)
    try {
      const result = await storeMediaWithContract(
        '', // No initial image
        'user-profile',
        'create_profile'
      )

      toast.success('Profile created on SUI blockchain!')
      await loadProfile() // Reload to get the new object ID
    } catch (error) {
      console.error('Failed to create profile:', error)
      toast.error('Failed to create profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpdate = async (imageUrl: string, blobId?: string) => {
    if (!profileData.objectId) {
      toast.error('Please create a profile first')
      return
    }

    try {
      // Store image on Walrus and update SUI contract
      const result = await storeMediaWithContract(
        imageUrl,
        'profile-image',
        'update_profile_image'
      )

      setProfileData(prev => ({
        ...prev,
        profileImage: imageUrl,
        profileImageBlobId: blobId
      }))

      toast.success('Profile image updated on blockchain!')
    } catch (error) {
      console.error('Failed to update profile image:', error)
      toast.error('Failed to update profile image')
    }
  }

  const handleSaveProfile = async () => {
    if (!profileData.objectId) {
      toast.error('Please create a profile first')
      return
    }

    setIsSaving(true)
    try {
      // Create profile data object
      const profileDataToStore = {
        username: editForm.username,
        bio: editForm.bio,
        profileImageBlobId: profileData.profileImageBlobId,
        updatedAt: Date.now()
      }

      // Store profile data on Walrus and update SUI contract
      const result = await storeMediaWithContract(
        JSON.stringify(profileDataToStore),
        'user-profile',
        'update_profile_data' as any // You'd need to add this function to the contract
      )

      setProfileData(prev => ({
        ...prev,
        username: editForm.username,
        bio: editForm.bio,
        profileDataBlobId: result.walrusBlobId
      }))

      setIsEditing(false)
      toast.success('Profile updated on blockchain!')
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isSignedIn) {
    return (
      <Card className="bg-[#0A1628] border-[#C0E6FF]/20">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#C0E6FF] mb-2">Wallet Connection Required</h2>
          <p className="text-[#C0E6FF]/70">
            Please connect your SUI wallet to access blockchain-based profile storage.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="bg-[#0A1628] border-[#C0E6FF]/20">
        <CardHeader>
          <CardTitle className="text-[#C0E6FF] flex items-center gap-2">
            <Link className="w-5 h-5" />
            SUI + Walrus Profile Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${user?.address ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-[#C0E6FF]">
                Wallet: {user?.address ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${profileData.objectId ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm text-[#C0E6FF]">
                Profile: {profileData.objectId ? 'On-Chain' : 'Not Created'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${profileData.profileImageBlobId ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-sm text-[#C0E6FF]">
                Storage: {profileData.profileImageBlobId ? 'Walrus' : 'None'}
              </span>
            </div>
          </div>

          {profileData.objectId && (
            <div className="mt-4 p-3 bg-[#030f1c] rounded border border-[#C0E6FF]/20">
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <Database className="w-3 h-3 text-blue-400" />
                  <span className="text-[#C0E6FF]">SUI Object ID:</span>
                </div>
                <div className="font-mono text-[#C0E6FF]/70 break-all">
                  {profileData.objectId}
                </div>
                {profileData.profileImageBlobId && (
                  <>
                    <div className="flex items-center gap-2 mt-2">
                      <Database className="w-3 h-3 text-green-400" />
                      <span className="text-[#C0E6FF]">Walrus Blob ID:</span>
                    </div>
                    <div className="font-mono text-[#C0E6FF]/70 break-all">
                      {profileData.profileImageBlobId}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Card */}
      <Card className="bg-[#0A1628] border-[#C0E6FF]/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#C0E6FF]">Blockchain Profile</CardTitle>
            {!profileData.objectId ? (
              <Button
                onClick={handleCreateProfile}
                disabled={isSaving}
                className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4 mr-2" />
                    Create Profile
                  </>
                )}
              </Button>
            ) : (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-[#C0E6FF]/20 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save to Blockchain
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="border-[#C0E6FF]/20 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!profileData.objectId ? (
            <div className="text-center py-8">
              <Link className="w-16 h-16 text-[#C0E6FF]/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#C0E6FF] mb-2">No Profile Found</h3>
              <p className="text-[#C0E6FF]/70 mb-4">
                Create your profile on the SUI blockchain to get started with decentralized storage.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="flex justify-center">
                <WalrusProfileImage
                  currentImage={profileData.profileImage}
                  currentBlobId={profileData.profileImageBlobId}
                  fallbackText={profileData.username?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  size="2xl"
                  onImageUpdate={handleImageUpdate}
                  editable={true}
                />
              </div>

              {/* Profile Info */}
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#C0E6FF]">Username</label>
                      <Input
                        value={editForm.username}
                        onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Enter username"
                        className="bg-[#030f1c] border-[#C0E6FF]/20 text-[#C0E6FF]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#C0E6FF]">Bio</label>
                      <Textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself"
                        className="bg-[#030f1c] border-[#C0E6FF]/20 text-[#C0E6FF]"
                        rows={3}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-[#C0E6FF]">
                      {profileData.username || 'Anonymous User'}
                    </h2>
                    {profileData.bio && (
                      <p className="text-[#C0E6FF]/70">{profileData.bio}</p>
                    )}
                    
                    <div className="flex justify-center gap-2">
                      <Badge variant="outline" className="border-green-500/50 text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        On-Chain
                      </Badge>
                      {profileData.profileImageBlobId && (
                        <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                          <Database className="w-3 h-3 mr-1" />
                          Walrus Storage
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata */}
              {profileData.metadata && (
                <div className="pt-4 border-t border-[#C0E6FF]/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#C0E6FF]/70">Created:</span>
                      <div className="text-[#C0E6FF]">
                        {new Date(profileData.metadata.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#C0E6FF]/70">Updated:</span>
                      <div className="text-[#C0E6FF]">
                        {new Date(profileData.metadata.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
