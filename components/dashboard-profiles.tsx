"use client"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"




import { usePersistentProfile } from "@/hooks/use-persistent-profile"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { EnhancedAvatar } from "@/components/enhanced-avatar"
import { ReferralCodeManagement } from "@/components/referral-code-management"
import { LOCATIONS } from "@/lib/locations"
import ReactCountryFlag from 'react-country-flag'
import { toast } from "sonner"
import { affiliateService } from "@/lib/affiliate-service"
import {
  User,
  Wallet,
  Shield,
  Camera,
  CheckCircle,
  AlertCircle,
  MapPin,
  Users,
  MessageSquare,
  Edit3,
  Save,
  X
} from "lucide-react"

interface ProfileData {
  firstName: string
  lastName: string
  username: string
  email: string
  location: string
  walletAddress: string
  kycStatus: 'pending' | 'verified' | 'rejected' | 'not-started'
  referralCode: string
}



export function DashboardProfiles() {
  const { user } = useSuiAuth()
  const { profile, isLoading, updateProfile, updateKYCStatus } = usePersistentProfile()

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    location: "unspecified",
    walletAddress: "",
    kycStatus: 'not-started',
    referralCode: ""
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasExistingReferralCode, setHasExistingReferralCode] = useState(false)
  const [isSocialAuthUser, setIsSocialAuthUser] = useState(false)
  const [socialAuthEmail, setSocialAuthEmail] = useState("")
  const [emailSetOnce, setEmailSetOnce] = useState(false)
  const [appliedReferralCode, setAppliedReferralCode] = useState("")

  // Check if user is zkLogin/Enoki and extract email
  useEffect(() => {
    if (user?.connectionType === 'zklogin') {
      setIsSocialAuthUser(true)

      // Try to extract email from different sources
      let extractedEmail = ""

      // Method 1: Legacy zkLogin JWT from localStorage
      const jwt = localStorage.getItem('zklogin_jwt')
      if (jwt) {
        try {
          const payload = jwt.split('.')[1]
          const decodedPayload = JSON.parse(atob(payload))
          if (decodedPayload.email) {
            extractedEmail = decodedPayload.email
          }
        } catch (error) {
          console.error('Failed to decode legacy zkLogin JWT for email:', error)
        }
      }

      // Method 2: Check for Enoki session data
      if (!extractedEmail) {
        try {
          const enokiSession = localStorage.getItem('enoki_session') || sessionStorage.getItem('enoki_session')
          if (enokiSession) {
            const sessionData = JSON.parse(enokiSession)
            if (sessionData.email) {
              extractedEmail = sessionData.email
            }
          }
        } catch (error) {
          console.error('Failed to extract email from Enoki session:', error)
        }
      }

      // Method 3: Check for any JWT-like tokens that might contain email
      if (!extractedEmail) {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.includes('jwt') || key.includes('token') || key.includes('auth'))) {
              const value = localStorage.getItem(key)
              if (value && value.includes('.')) {
                try {
                  const parts = value.split('.')
                  if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]))
                    if (payload.email) {
                      extractedEmail = payload.email
                      break
                    }
                  }
                } catch (e) {
                  // Skip invalid tokens
                }
              }
            }
          }
        } catch (error) {
          console.error('Failed to search for email in tokens:', error)
        }
      }

      if (extractedEmail) {
        setSocialAuthEmail(extractedEmail)
      }
    } else {
      setIsSocialAuthUser(false)
      setSocialAuthEmail("")
    }
  }, [user?.connectionType])

  // Load profile data from persistent profile
  useEffect(() => {
    if (profile) {
      const fullName = profile.real_name || ""
      const [firstName = "", lastName = ""] = fullName.split(" ")

      // Check if email was set once for traditional wallet users
      const hasEmailSet = !isSocialAuthUser && !!profile.email && profile.email.trim() !== ""
      setEmailSetOnce(hasEmailSet)

      setProfileData({
        firstName,
        lastName: lastName || "",
        username: profile.username || "",
        email: isSocialAuthUser ? socialAuthEmail : (profile.email || ""),
        location: profile.location || "unspecified",
        walletAddress: user?.address || "",
        kycStatus: profile.kyc_status === 'verified' ? 'verified' :
                  profile.kyc_status === 'pending' ? 'pending' : 'not-started',
        referralCode: ""
      })
    } else if (user?.address) {
      // Set wallet address if user is connected but no profile exists
      setProfileData(prev => ({
        ...prev,
        walletAddress: user.address,
        email: isSocialAuthUser ? socialAuthEmail : prev.email
      }))
    }
  }, [profile, user?.address, isSocialAuthUser, socialAuthEmail])

  // Check if username needs to be synced with referral code
  useEffect(() => {
    const syncUsernameWithReferralCode = async () => {
      if (!user?.address || !profile) return

      try {
        // Get user's default referral code
        const defaultCode = await affiliateService.getUserDefaultReferralCode(user.address)

        if (defaultCode && profile.username && profile.username.startsWith('User ')) {
          // If profile has a fallback username but user has a proper referral code,
          // update the username to match the referral code
          console.log('🔄 Syncing username with referral code:', defaultCode)

          const success = await updateProfile({ username: defaultCode })
          if (success) {
            console.log('✅ Username synced with referral code')
            // Update local state to reflect the change
            setProfileData(prev => ({
              ...prev,
              username: defaultCode
            }))
          }
        }
      } catch (error) {
        console.error('Failed to sync username with referral code:', error)
      }
    }

    syncUsernameWithReferralCode()
  }, [profile, user?.address, updateProfile])

  // Check for existing referral relationship
  useEffect(() => {
    const checkExistingReferralCode = async () => {
      if (!user?.address) return

      try {
        // Check if user already has a referral relationship (as referee)
        const hasReferral = await affiliateService.checkExistingReferralRelationship(user.address)
        setHasExistingReferralCode(hasReferral)

        if (hasReferral) {
          // Get the referral code used for this relationship
          const referralData = await affiliateService.getReferralRelationshipData(user.address)

          if (referralData?.referral_code) {
            setAppliedReferralCode(referralData.referral_code)
            setProfileData(prev => ({
              ...prev,
              referralCode: referralData.referral_code || ""
            }))
          } else {
            // Even if no referral code, we know there's a relationship
            setAppliedReferralCode("UNKNOWN")
          }
        }
      } catch (error) {
        console.error('Error checking referral relationship:', error)
      }
    }

    checkExistingReferralCode()
  }, [user?.address])



  const handleSave = async () => {
    if (!user?.address) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsSaving(true)

    try {
      console.log('💾 Saving profile data to database and Walrus...')

      // Handle referral code if provided and user doesn't have existing referral
      if (profileData.referralCode.trim() && !hasExistingReferralCode) {
        console.log('🔗 Processing referral code:', profileData.referralCode)

        // Validate referral code immutability
        const validation = await affiliateService.validateReferralCodeImmutability(user.address, 'create')
        if (!validation.valid) {
          toast.error(`❌ ${validation.message}`)
          setIsSaving(false)
          return
        }

        // Validate and process referral code
        const referralSuccess = await affiliateService.processReferralCode(
          profileData.referralCode.trim(),
          user.address
        )

        if (!referralSuccess) {
          toast.error('❌ Invalid or expired referral code')
          setIsSaving(false)
          return
        }

        // Mark that user now has a referral code
        setHasExistingReferralCode(true)
        toast.success('✅ Referral code applied successfully!')
      }

      // Prepare profile data for database - PRESERVE ALL EXISTING DATA
      const profileUpdateData: any = {
        // Preserve ALL existing profile data first
        ...profile,
        // Only update the specific fields that user can edit in this form
        username: profileData.username,
        real_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        location: profileData.location === 'unspecified' ? '' : profileData.location,
        display_preferences: {
          ...profile?.display_preferences
        },
        // Explicitly preserve critical profile data to prevent reset
        role_tier: profile?.role_tier || 'NOMAD',
        profile_level: profile?.profile_level || 1,
        current_xp: profile?.current_xp || 0,
        total_xp: profile?.total_xp || 0,
        points: profile?.points || 0,
        kyc_status: profile?.kyc_status || 'not_verified',
        onboarding_completed: profile?.onboarding_completed ?? false,
        onboarding_completed_at: profile?.onboarding_completed_at,
        // Preserve important data structures
        achievements_data: profile?.achievements_data,
        referral_data: profile?.referral_data,
        social_links: profile?.social_links,
        walrus_metadata: profile?.walrus_metadata,
        // Preserve image blob IDs
        profile_image_blob_id: profile?.profile_image_blob_id,
        banner_image_blob_id: profile?.banner_image_blob_id,
        // Preserve timestamps
        created_at: profile?.created_at,
        join_date: profile?.join_date,
        updated_at: new Date().toISOString()
      }

      // Handle email based on authentication method and immutability rules
      if (isSocialAuthUser) {
        // Social auth users: email is always from social login, cannot be changed
        profileUpdateData.email = socialAuthEmail
      } else {
        // Traditional wallet users: email can only be set once
        if (!emailSetOnce && profileData.email.trim()) {
          // First time setting email
          profileUpdateData.email = profileData.email.trim()
          setEmailSetOnce(true)
        } else if (emailSetOnce) {
          // Email already set, keep existing value
          profileUpdateData.email = profile?.email
        } else {
          // No email provided, keep existing or empty
          profileUpdateData.email = profile?.email || ""
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
        {/* Profile Picture, KYC & Wallet */}
        <div className="enhanced-card">
          <div className="enhanced-card-content space-y-6">
            {/* Profile Picture Section */}
            <div className="text-center">
              <div className="flex items-center gap-2 text-white mb-4 justify-center">
                <Camera className="w-5 h-5 text-[#4DA2FF]" />
                <h3 className="font-semibold">Profile Picture</h3>
              </div>
              <div className="relative flex items-center justify-center">
                <EnhancedAvatar
                  size="xl"
                  editable={isEditing}
                  showStorageInfo={false}
                  className="!w-56 !h-56 rounded-full"
                />
              </div>
              {isEditing && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-[#C0E6FF]/70">
                    Click avatar to upload new image
                  </p>
                  <p className="text-xs text-[#C0E6FF]/50">
                    Images stored on Walrus
                  </p>
                </div>
              )}
            </div>

            {/* KYC Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white justify-center">
                <Shield className="w-4 h-4 text-[#4DA2FF]" />
                <h4 className="font-semibold text-sm">KYC Verification</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <Badge className={getKycStatusColor(profileData.kycStatus)}>
                    {getKycStatusIcon(profileData.kycStatus)}
                    <span className="ml-2 capitalize text-xs">{profileData.kycStatus.replace('-', ' ')}</span>
                  </Badge>
                </div>
                <p className="text-[#C0E6FF] text-xs text-center">
                  {profileData.kycStatus === 'verified'
                    ? 'Identity verified for AIONET security'
                    : 'Complete KYC for enhanced security'
                  }
                </p>
                {profileData.kycStatus !== 'verified' && (
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-[#4DA2FF] to-[#011829] text-white text-xs"
                  >
                    {profileData.kycStatus === 'not-started' ? 'Start KYC' : 'Continue KYC'}
                  </Button>
                )}
              </div>
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
                <Label htmlFor="username" className="text-[#C0E6FF]">
                  Username {profileData.username && "(Cannot be changed)"}
                </Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  disabled={!isEditing || !!profileData.username}
                  className="bg-[#030F1C] border-[#C0E6FF]/30 text-white"
                  placeholder={profileData.username ? "Username is set and cannot be changed" : "Enter your username"}
                />
                {profileData.username && (
                  <p className="text-[#C0E6FF]/70 text-sm">
                    🔒 Username cannot be changed once set to maintain referral code consistency
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#C0E6FF]">
                  Email {isSocialAuthUser ? "(From Social Login - Cannot be changed)" : emailSetOnce ? "(Set once - Cannot be changed)" : "(Can be set once)"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing || isSocialAuthUser || emailSetOnce}
                  className="bg-[#030F1C] border-[#C0E6FF]/30 text-white"
                  placeholder={
                    isSocialAuthUser
                      ? "Email from social login account"
                      : emailSetOnce
                        ? "Email is set and cannot be changed"
                        : "Enter your email address (can only be set once)"
                  }
                />
                {isSocialAuthUser && (
                  <p className="text-[#C0E6FF]/70 text-sm">
                    🔒 Email is automatically bound from your social login account and cannot be changed
                  </p>
                )}
                {!isSocialAuthUser && emailSetOnce && (
                  <p className="text-[#C0E6FF]/70 text-sm">
                    🔒 Email can only be set once and cannot be changed for security
                  </p>
                )}
                {!isSocialAuthUser && !emailSetOnce && (
                  <p className="text-[#C0E6FF]/70 text-sm">
                    ⚠️ Email can only be set once. Choose carefully as it cannot be changed later
                  </p>
                )}
              </div>

              {/* Referral Code Section */}
              <div className="space-y-2">
                <Label htmlFor="referralCode" className="text-[#C0E6FF]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Referral Code {hasExistingReferralCode ? "(Applied)" : "(Optional)"}
                  </div>
                </Label>



                {/* Show applied referral code when not editing */}
                {!isEditing && hasExistingReferralCode ? (
                  <div className="bg-[#1a2f51]/30 rounded-lg p-3 border border-[#C0E6FF]/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-semibold">
                          {appliedReferralCode === "UNKNOWN"
                            ? "Applied (Code not found)"
                            : appliedReferralCode || profileData.referralCode || "Loading..."}
                        </span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          Applied
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-[#C0E6FF]/70 text-sm mt-2">
                      This referral code was used during your signup and cannot be changed
                    </p>
                  </div>
                ) : (
                  <>
                    <Input
                      id="referralCode"
                      value={profileData.referralCode}
                      onChange={(e) => setProfileData(prev => ({ ...prev, referralCode: e.target.value }))}
                      disabled={!isEditing || hasExistingReferralCode}
                      className="bg-[#030F1C] border-[#C0E6FF]/30 text-white"
                      placeholder={hasExistingReferralCode ? "Referral code already applied" : "Enter referral code (optional)"}
                    />
                    {hasExistingReferralCode && (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>You have successfully applied a referral code</span>
                      </div>
                    )}
                    {!hasExistingReferralCode && profileData.referralCode.trim() && (
                      <p className="text-[#C0E6FF]/70 text-sm">
                        💡 Referral codes can only be applied once and cannot be changed later
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-[#C0E6FF]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Country
                  </div>
                </Label>
                <Select
                  value={profileData.location}
                  onValueChange={(value) => setProfileData(prev => ({ ...prev, location: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="bg-[#030F1C] border-[#C0E6FF]/30 text-white">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2f51] border-[#1a2f51] max-h-60 overflow-y-auto">
                    <SelectItem value="unspecified" className="text-white hover:bg-[#2a3f61]">
                      🌍 Prefer not to say
                    </SelectItem>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location.code} value={location.name} className="text-white hover:bg-[#2a3f61]">
                        <div className="flex items-center gap-2">
                          <ReactCountryFlag
                            countryCode={location.code}
                            svg
                            style={{
                              width: '1.2em',
                              height: '1.2em',
                            }}
                            title={location.name}
                          />
                          {location.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Wallet Address Section */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="walletAddress" className="text-[#C0E6FF]">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Wallet Address (Cannot be changed)
                </div>
              </Label>
              <Input
                id="walletAddress"
                value={profileData.walletAddress}
                onChange={(e) => setProfileData(prev => ({ ...prev, walletAddress: e.target.value }))}
                disabled={true}
                className="bg-[#030F1C] border-[#C0E6FF]/30 text-white font-mono text-sm"
                placeholder="Sui wallet address"
              />
              <p className="text-[#C0E6FF]/70 text-sm">
                🔒 Wallet address is bound to your account and cannot be changed for security
              </p>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code Management Section */}
      <ReferralCodeManagement />

      {/* Social Media Management Section */}
      <SocialMediaSection />

    </div>
  )
}

// Simple Social Media Management Component
function SocialMediaSection() {
  const { profile, updateSocialLinks } = usePersistentProfile()
  const { user } = useSuiAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Simple state for each platform
  const [discord, setDiscord] = useState('')
  const [twitter, setTwitter] = useState('')

  // Load existing data when profile changes
  useEffect(() => {
    if (profile?.social_links && Array.isArray(profile.social_links)) {
      setDiscord('')
      setTwitter('')

      profile.social_links.forEach((link: any) => {
        if (link.platform === 'discord') setDiscord(link.username || '')
        if (link.platform === 'x') setTwitter(link.username || '')
      })
    }
  }, [profile?.social_links])

  const handleSave = async () => {
    if (!user?.address) {
      toast.error('User not authenticated')
      return
    }

    setIsSaving(true)

    try {
      const socialLinks = []

      if (discord.trim()) {
        socialLinks.push({
          platform: 'discord',
          username: discord.trim(),
          url: `https://discord.com/users/${discord.trim()}`
        })
      }



      if (twitter.trim()) {
        const twitterUsername = twitter.trim().startsWith('@') ? twitter.trim() : `@${twitter.trim()}`
        socialLinks.push({
          platform: 'x',
          username: twitterUsername,
          url: `https://x.com/${twitterUsername.slice(1)}`
        })
      }

      const success = await updateSocialLinks(socialLinks)

      if (success) {
        toast.success('Social media links saved!')
        setIsEditing(false)
      } else {
        toast.error('Failed to save social media links')
      }
    } catch (error) {
      console.error('Error saving social links:', error)
      toast.error('Failed to save social media links')
    }

    setIsSaving(false)
  }

  return (
    <div className="enhanced-card">
      <div className="enhanced-card-content">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-white mb-1">
              <MessageSquare className="w-5 h-5 text-[#4DA2FF]" />
              <h3 className="font-semibold">Social Media Links</h3>
            </div>
            <p className="text-[#C0E6FF] text-sm">
              Add your social media handles to display on your profile
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  size="sm"
                  className="border-[#C0E6FF]/50 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  size="sm"
                  className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white"
                >
                  {isSaving ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-4">
        {/* Discord */}
        <div className="p-4 bg-[#1a2f51]/30 rounded-lg border border-[#C0E6FF]/10">
          <label className="text-white font-medium block mb-2">Discord</label>
          {isEditing ? (
            <input
              type="text"
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder="YourUsername#1234"
              className="w-full px-3 py-2 bg-[#030F1C] border border-[#C0E6FF]/30 text-white rounded-md focus:ring-2 focus:ring-[#4DA2FF] focus:border-[#4DA2FF] focus:outline-none"
            />
          ) : (
            <div>
              {discord ? (
                <span className="text-[#C0E6FF]">{discord}</span>
              ) : (
                <span className="text-[#C0E6FF]/50 text-sm">Not connected</span>
              )}
            </div>
          )}
        </div>



        {/* X (Twitter) */}
        <div className="p-4 bg-[#1a2f51]/30 rounded-lg border border-[#C0E6FF]/10">
          <label className="text-white font-medium block mb-2">X (Twitter)</label>
          {isEditing ? (
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@yourusername"
              className="w-full px-3 py-2 bg-[#030F1C] border border-[#C0E6FF]/30 text-white rounded-md focus:ring-2 focus:ring-[#4DA2FF] focus:border-[#4DA2FF] focus:outline-none"
            />
          ) : (
            <div>
              {twitter ? (
                <span className="text-[#C0E6FF]">{twitter}</span>
              ) : (
                <span className="text-[#C0E6FF]/50 text-sm">Not connected</span>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
