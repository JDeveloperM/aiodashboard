"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { RoleImage } from "@/components/ui/role-image"
import { useSubscription } from "@/contexts/subscription-context"
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
  Upload,
  MapPin,
  FileText,
  Crown,
  Star,
  Users
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

interface NFTData {
  id: string
  name: string
  type: 'NOMAD' | 'PRO' | 'ROYAL'
  owned: boolean
  benefits: string[]
  mintDate?: string
}

export function DashboardProfiles() {
  const { tier } = useSubscription()
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

  // NFT Data based on current tier
  const nftData: NFTData[] = [
    {
      id: 'nomad',
      name: 'MetadudesX NOMAD',
      type: 'NOMAD',
      owned: tier === 'NOMAD' || tier === 'PRO' || tier === 'ROYAL',
      benefits: ['Copy Trading Access', 'Community Access', 'Basic Support'],
      mintDate: tier !== 'NOMAD' ? undefined : '2024-01-01'
    },
    {
      id: 'pro',
      name: 'MetadudesX PRO',
      type: 'PRO',
      owned: tier === 'PRO' || tier === 'ROYAL',
      benefits: ['Crypto Trading Bots', 'Community Access', 'AIO Creators'],
      mintDate: tier === 'PRO' || tier === 'ROYAL' ? '2024-01-15' : undefined
    },
    {
      id: 'royal',
      name: 'MetadudesX ROYAL',
      type: 'ROYAL',
      owned: tier === 'ROYAL',
      benefits: ['All PRO Benefits', 'Forex Trading Bots', 'VIP Support', 'Exclusive Events'],
      mintDate: tier === 'ROYAL' ? '2024-02-20' : undefined
    }
  ]

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

  // NFT Helper Functions
  const getNFTIcon = (type: string) => {
    switch (type) {
      case 'NOMAD':
        return <Users className="w-6 h-6" />
      case 'PRO':
        return <Star className="w-6 h-6" />
      case 'ROYAL':
        return <Crown className="w-6 h-6" />
      default:
        return <Star className="w-6 h-6" />
    }
  }

  const getNFTColor = (type: string) => {
    switch (type) {
      case 'NOMAD':
        return 'from-gray-500 to-gray-700'
      case 'PRO':
        return 'from-[#4DA2FF] to-[#011829]'
      case 'ROYAL':
        return 'from-[#FFD700] to-[#FFA500]'
      default:
        return 'from-[#4DA2FF] to-[#011829]'
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

      {/* MetadudesX NFTs Owned */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-white mb-4">
            <Crown className="w-5 h-5 text-[#4DA2FF]" />
            <h3 className="font-semibold">MetadudesX NFTs</h3>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {nftData.map((nft) => (
                <div
                  key={nft.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    nft.owned
                      ? 'bg-gradient-to-br from-[#4DA2FF]/20 to-[#011829]/20 border-[#4DA2FF]/50'
                      : 'bg-[#030F1C] border-[#C0E6FF]/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-full bg-gradient-to-r ${getNFTColor(nft.type)}`}>
                      {getNFTIcon(nft.type)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{nft.name}</h4>
                      <div className="flex items-center gap-2">
                        {nft.owned ? (
                          <Badge className="bg-green-500 text-white text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Owned
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500 text-white text-xs">
                            Not Owned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {nft.owned && nft.mintDate && (
                    <div className="mb-3">
                      <span className="text-[#C0E6FF] text-sm">
                        Minted: {new Date(nft.mintDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-[#C0E6FF] text-sm">Benefits:</Label>
                    <ul className="space-y-1">
                      {nft.benefits.map((benefit, index) => (
                        <li key={index} className="text-white text-sm flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {nftData.filter(nft => nft.owned).length === 0 && (
              <div className="text-center py-6 text-[#C0E6FF]">
                <Crown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No NFTs owned</p>
                <p className="text-sm">Visit the subscriptions page to mint your NFT</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
