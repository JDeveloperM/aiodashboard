"use client"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

import { Textarea } from "@/components/ui/textarea"


import { usePersistentProfile } from "@/hooks/use-persistent-profile"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { EnhancedAvatar } from "@/components/enhanced-avatar"
import { toast } from "sonner"
import {
  User,
  Mail,
  Wallet,
  Shield,
  Camera,
  CheckCircle,
  AlertCircle,

  MapPin,
  FileText
} from "lucide-react"

interface ProfileData {
  firstName: string
  lastName: string
  username: string
  email: string
  bio: string
  location: string
  walletAddress: string
  kycStatus: 'pending' | 'verified' | 'rejected' | 'not-started'
  notifications: boolean
}



export function DashboardProfiles() {
  const { user } = useSuiAuth()
  const { profile, isLoading, updateProfile, updateKYCStatus } = usePersistentProfile()

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    walletAddress: "",
    kycStatus: 'not-started',
    notifications: true
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load profile data from persistent profile
  useEffect(() => {
    if (profile) {
      const fullName = profile.real_name || ""
      const [firstName = "", lastName = ""] = fullName.split(" ")

      setProfileData({
        firstName,
        lastName: lastName || "",
        username: profile.username || "",
        email: profile.email || "",
        bio: profile.bio || "",
        location: profile.location || "",
        walletAddress: user?.address || "",
        kycStatus: profile.kyc_status === 'verified' ? 'verified' :
                  profile.kyc_status === 'pending' ? 'pending' : 'not-started',
        notifications: profile.display_preferences?.email_notifications !== false
      })
    } else if (user?.address) {
      // Set wallet address if user is connected but no profile exists
      setProfileData(prev => ({
        ...prev,
        walletAddress: user.address
      }))
    }
  }, [profile, user?.address])



  const handleSave = async () => {
    if (!user?.address) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsSaving(true)

    try {
      console.log('💾 Saving profile data to database and Walrus...')

      // Prepare profile data for database
      const profileUpdateData = {
        username: profileData.username,
        email: profileData.email,
        bio: profileData.bio,
        real_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        location: profileData.location,
        display_preferences: {
          ...profile?.display_preferences,
          email_notifications: profileData.notifications
        }
      }

      console.log('📋 Profile update data:', profileUpdateData)

      // Update profile in database and Walrus
      const success = await updateProfile(profileUpdateData)

      if (success) {
        // Update KYC status if it changed
        if (profile?.kyc_status !== profileData.kycStatus) {
          const kycStatus = profileData.kycStatus === 'verified' ? 'verified' :
                           profileData.kycStatus === 'pending' ? 'pending' : 'not_verified'
          await updateKYCStatus(kycStatus)
        }

        toast.success('✅ Profile saved successfully to database and Walrus!')
        setIsEditing(false)
      } else {
        toast.error('❌ Failed to save profile')
      }
    } catch (error) {
      console.error('💥 Error saving profile:', error)
      toast.error(`Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    setIsSaving(false)
  }

  // Avatar is now handled by the EnhancedAvatar component

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500 text-white'
      case 'pending':
        return 'bg-yellow-500 text-white'
      case 'rejected':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getKycStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <AlertCircle className="w-4 h-4" />
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Account Information</h3>
          <p className="text-[#C0E6FF] text-sm">🇬🇷 Manage your Greek community profile and Sui wallet integration</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="border-[#C0E6FF] text-[#C0E6FF]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="bg-gradient-to-r from-[#4DA2FF] to-[#011829] text-white"
              >
                {isSaving ? "Saving to Database & Walrus..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-[#4da2ff] hover:bg-[#3d8ae6] text-white transition-colors duration-200"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Profile Picture */}
        <div className="enhanced-card relative overflow-hidden">
          <div className="enhanced-card-content p-0 relative">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-white bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
              <Camera className="w-5 h-5 text-[#4DA2FF]" />
              <h3 className="font-semibold">Profile Picture</h3>
            </div>
            <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
              <EnhancedAvatar
                size="2xl"
                editable={isEditing}
                showStorageInfo={true}
                className="!w-full !h-full !min-h-[300px] rounded-lg"
              />
              {isEditing && (
                <div className="absolute bottom-4 left-4 right-4 text-center bg-black/50 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-xs text-[#C0E6FF]/70">
                    Click avatar to upload new image
                  </p>
                  <p className="text-xs text-[#C0E6FF]/50">
                    Images are stored on Walrus for decentralized access
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="enhanced-card lg:col-span-2">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <User className="w-5 h-5 text-[#4DA2FF]" />
              <h3 className="font-semibold">Personal Information</h3>
            </div>
            <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#C0E6FF]">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-[#030F1C] border-[#C0E6FF]/30 text-white"
                  placeholder="Enter your first name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#C0E6FF]">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-[#030F1C] border-[#C0E6FF]/30 text-white"
                  placeholder="Enter your last name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#C0E6FF]">Username</Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-[#030F1C] border-[#C0E6FF]/30 text-white"
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#C0E6FF]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-[#030F1C] border-[#C0E6FF]/30 text-white"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-[#C0E6FF]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </div>
                </Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-[#030F1C] border-[#C0E6FF]/30 text-white"
                  placeholder="Enter your location"
                />
              </div>
            </div>

            {/* Bio Section */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-[#C0E6FF]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Bio
                </div>
              </Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
                className="bg-[#030F1C] border-[#C0E6FF]/30 text-white min-h-[100px]"
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
              <div className="text-right">
                <span className="text-xs text-[#C0E6FF]/70">
                  {profileData.bio.length}/500 characters
                </span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Section */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-white mb-4">
            <Shield className="w-5 h-5 text-[#4DA2FF]" />
            <h3 className="font-semibold">KYC Verification</h3>
          </div>
          <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getKycStatusColor(profileData.kycStatus)}>
                {getKycStatusIcon(profileData.kycStatus)}
                <span className="ml-2 capitalize">{profileData.kycStatus.replace('-', ' ')}</span>
              </Badge>
              <span className="text-[#C0E6FF]">
                {profileData.kycStatus === 'verified'
                  ? 'Your identity has been verified for DEWhale security'
                  : 'Complete KYC verification for enhanced security'
                }
              </span>
            </div>

            {profileData.kycStatus !== 'verified' && (
              <Button
                className="bg-gradient-to-r from-[#4DA2FF] to-[#011829] text-white"
              >
                {profileData.kycStatus === 'not-started' ? 'Start KYC' : 'Continue KYC'}
              </Button>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Wallet Information */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-white mb-4">
            <Wallet className="w-5 h-5 text-[#4DA2FF]" />
            <h3 className="font-semibold">Wallet & Preferences</h3>
          </div>
          <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="walletAddress" className="text-[#C0E6FF]">Sui Wallet Address</Label>
            <Input
              id="walletAddress"
              value={profileData.walletAddress}
              onChange={(e) => setProfileData(prev => ({ ...prev, walletAddress: e.target.value }))}
              disabled={!isEditing}
              className="bg-[#030F1C] border-[#C0E6FF]/30 text-white font-mono"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#4DA2FF]" />
              <span className="text-[#C0E6FF]">Email Notifications</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProfileData(prev => ({ ...prev, notifications: !prev.notifications }))}
              disabled={!isEditing}
              className={`border-[#C0E6FF] ${
                profileData.notifications
                  ? 'bg-[#4DA2FF] text-white'
                  : 'text-[#C0E6FF]'
              }`}
            >
              {profileData.notifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          </div>
        </div>
      </div>


    </div>
  )
}
