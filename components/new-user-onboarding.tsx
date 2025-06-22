"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  User,
  Mail,
  Shield,
  CheckCircle,
  ArrowRight,
  Wallet,
  Star,
  Gift,
  Trophy,
  Users
} from 'lucide-react'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { usePersistentProfile } from '@/hooks/use-persistent-profile'
import { useReferralTracking } from '@/hooks/use-referral-tracking'
import { useReferralCodes } from '@/hooks/use-referral-codes'
import { affiliateService } from '@/lib/affiliate-service'
import { toast } from 'sonner'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  completed: boolean
  required: boolean
}

export function NewUserOnboarding() {
  const { user, isNewUser, completeOnboarding, completeProfileSetup, completeKYC, refreshUserState } = useSuiAuth()
  const { profile, updateProfile, updateKYCStatus } = usePersistentProfile()
  const { referralCode: trackedReferralCode, processReferralOnSignup } = useReferralTracking()
  const { createDefaultCode } = useReferralCodes()

  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    referralCode: ''
  })

  // Check if user is zkLogin and extract email
  const [isZkLoginUser, setIsZkLoginUser] = useState(false)
  const [zkLoginEmail, setZkLoginEmail] = useState("")

  useEffect(() => {
    if (user?.connectionType === 'zklogin') {
      setIsZkLoginUser(true)

      // Extract email from JWT if available
      const jwt = localStorage.getItem('zklogin_jwt')
      if (jwt) {
        try {
          const payload = jwt.split('.')[1]
          const decodedPayload = JSON.parse(atob(payload))
          if (decodedPayload.email) {
            setZkLoginEmail(decodedPayload.email)
            setFormData(prev => ({ ...prev, email: decodedPayload.email }))
          }
        } catch (error) {
          console.error('Failed to decode JWT for email:', error)
        }
      }
    } else {
      setIsZkLoginUser(false)
      setZkLoginEmail("")
    }
  }, [user?.connectionType])

  // Referral options
  const [skipReferral, setSkipReferral] = useState(false)

  // Form validation
  const isFormValid = formData.username.trim().length >= 3 &&
    (formData.referralCode.trim().length > 0 || skipReferral)

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to AIONET',
      description: 'Your wallet is connected and ready to get started',
      icon: Star,
      completed: currentStep > 0,
      required: true
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your basic information and referral code',
      icon: User,
      completed: currentStep > 1,
      required: true
    },
    {
      id: 'kyc',
      title: 'Verify Your Identity',
      description: 'Complete KYC verification for enhanced security and features',
      icon: Shield,
      completed: currentStep > 2,
      required: false
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Welcome to the AIONET community',
      icon: Trophy,
      completed: currentStep >= 3,
      required: true
    }
  ]

  // Calculate progress based on current step, not completed steps
  const progress = ((currentStep + 1) / steps.length) * 100

  // Load existing profile data and auto-populate referral code
  useEffect(() => {
    if (profile) {
      console.log('📋 Loading existing profile data:', profile)
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        referralCode: trackedReferralCode || ''
      })
    } else if (user?.address) {
      // Initialize with default username if no profile exists
      console.log('📝 Initializing default form data for new user')
      setFormData({
        username: `User ${user.address.slice(0, 6)}`,
        email: '',
        referralCode: trackedReferralCode || ''
      })
    }

    // Auto-populate referral code if user came from referral link
    if (trackedReferralCode && !formData.referralCode) {
      console.log('🔗 Auto-populating referral code from URL:', trackedReferralCode)
      setFormData(prev => ({ ...prev, referralCode: trackedReferralCode }))
      setSkipReferral(false) // Ensure referral is not skipped if we have a code
    }
  }, [profile, user?.address, trackedReferralCode])

  // Auto-refresh user state when profile changes
  useEffect(() => {
    if (profile?.username && profile.username !== `User ${user?.address.slice(0, 6)}`) {
      refreshUserState()
    }
  }, [profile?.username, user?.address, refreshUserState])

  const handleProfileSubmit = async () => {
    if (!isFormValid) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsCompleting(true)
    try {
      console.log('🔄 Submitting profile data:', formData)

      // Prepare profile data with referral code
      const profileData: any = {
        username: formData.username.trim(),
        // Handle email based on authentication method
        email: isZkLoginUser ? zkLoginEmail : (formData.email.trim() || undefined),
        // Ensure we don't lose existing data
        role_tier: profile?.role_tier || 'NOMAD',
        profile_level: profile?.profile_level || 1,
        current_xp: profile?.current_xp || 0,
        total_xp: profile?.total_xp || 0,
        points: profile?.points || 0,
        kyc_status: profile?.kyc_status || 'not_verified'
      }

      // Add referral code to referral_data if provided
      if (formData.referralCode.trim() && !skipReferral) {
        profileData.referral_data = {
          ...profile?.referral_data,
          referral_code: formData.referralCode.trim(),
          referred_by: formData.referralCode.trim(),
          referral_date: new Date().toISOString()
        }
      }

      // Update profile with form data
      const success = await updateProfile(profileData)

      if (success) {
        console.log('✅ Profile updated successfully')

        // Process referral if user came from referral link
        if (trackedReferralCode && user?.address) {
          console.log('🔗 Processing referral from session...')
          const referralSuccess = await processReferralOnSignup(user.address)
          if (referralSuccess) {
            toast.success('✅ Referral processed successfully!')
          }
        }

        // Create default referral code for the user (only if they don't have one)
        if (formData.username.trim() && user?.address) {
          console.log('🔍 Checking if user needs a referral code...')

          // Check if user already has referral codes to prevent duplicates
          const hasExistingCodes = await affiliateService.userHasReferralCodes(user.address)

          if (!hasExistingCodes) {
            console.log('🆕 Creating default referral code...')
            const codeSuccess = await createDefaultCode(formData.username.trim())
            if (codeSuccess) {
              console.log('✅ Default referral code created')
            } else {
              console.warn('⚠️ Failed to create referral code, but continuing onboarding')
            }
          } else {
            console.log('✅ User already has referral code, skipping creation')
          }
        }

        await completeProfileSetup()

        // Refresh user state to update isNewUser status
        await refreshUserState()

        toast.success('Profile completed successfully!')
        setCurrentStep(currentStep + 1)
      } else {
        console.error('❌ Profile update failed')
        toast.error('Failed to save profile')
      }
    } catch (error) {
      console.error('❌ Profile setup error:', error)
      toast.error('Failed to complete profile setup')
    }
    setIsCompleting(false)
  }

  const handleKYCStart = async () => {
    setIsCompleting(true)
    try {
      console.log('🔄 Starting KYC verification...')

      // In a real implementation, this would redirect to KYC provider
      // For demo, we'll simulate the process
      await updateKYCStatus('pending')
      toast.info('KYC verification started...')

      // Simulate KYC completion after a delay
      setTimeout(async () => {
        try {
          await updateKYCStatus('verified')
          await completeKYC()
          console.log('✅ KYC verification completed')
          toast.success('KYC verification completed!')
          setCurrentStep(currentStep + 1)
        } catch (error) {
          console.error('❌ KYC completion error:', error)
          toast.error('KYC verification failed')
        }
      }, 2000)

    } catch (error) {
      console.error('❌ KYC start error:', error)
      toast.error('Failed to start KYC verification')
    }
    setIsCompleting(false)
  }

  const handleSkipKYC = () => {
    console.log('⏭️ Skipping KYC verification')
    toast.info('KYC verification skipped - you can complete it later in settings')
    setCurrentStep(currentStep + 1)
  }

  const handleCompleteOnboarding = async () => {
    setIsCompleting(true)
    try {
      // Mark onboarding as completed in the database
      const success = await updateProfile({
        ...profile,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      })

      if (success) {
        await completeOnboarding()
        await refreshUserState()

        toast.success('Welcome to AIONET! Your account is now fully set up.')

        // Force a page refresh to ensure the onboarding doesn't show again
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        toast.error('Failed to complete onboarding')
      }
    } catch (error) {
      console.error('Onboarding completion error:', error)
      toast.error('Failed to complete onboarding')
    }
    setIsCompleting(false)
  }

  const renderStepContent = () => {
    const step = steps[currentStep]
    
    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-[#4DA2FF] to-[#00D4AA] rounded-full flex items-center justify-center mx-auto">
              <Star className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to AIONET!</h2>
              <p className="text-[#C0E6FF] mb-4">
                Your wallet is connected and ready. Let's complete your profile to unlock all features.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-[#C0E6FF]">
                <Wallet className="w-4 h-4" />
                <span>Connected: {user?.address.slice(0, 6)}...{user?.address.slice(-4)}</span>
              </div>
            </div>
            <Button 
              onClick={() => setCurrentStep(1)}
              className="bg-gradient-to-r from-[#4DA2FF] to-[#00D4AA] text-white px-8"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-12 h-12 text-[#4DA2FF] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Complete Your Profile</h2>
              <p className="text-[#C0E6FF]">
                Add your information to personalize your AIONET experience
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-white">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username"
                  className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white"
                  required
                />
                {!formData.username.trim() && (
                  <p className="text-red-400 text-sm mt-1">Username is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-white">
                  Email {isZkLoginUser ? "(From Google)" : "(Optional - Can only be set once)"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={isZkLoginUser ? "Email from Google account" : "Enter your email (can only be set once)"}
                  className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white"
                  disabled={isZkLoginUser}
                />
                {isZkLoginUser && (
                  <p className="text-[#C0E6FF]/70 text-sm mt-1">
                    🔒 Email is automatically bound from your Google account
                  </p>
                )}
                {!isZkLoginUser && (
                  <p className="text-[#C0E6FF]/70 text-sm mt-1">
                    ⚠️ Email can only be set once and cannot be changed later
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="referralCode" className="text-white flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Referral Code
                  {trackedReferralCode && (
                    <Badge className="bg-green-500/20 text-green-400 text-xs">
                      Auto-filled
                    </Badge>
                  )}
                </Label>
                <Input
                  id="referralCode"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  placeholder={trackedReferralCode ? "Referral code from link" : "Enter referral code (if you have one)"}
                  className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white"
                  disabled={skipReferral}
                />
                {trackedReferralCode && (
                  <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Referral code automatically applied from your link
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="skipReferral"
                    checked={skipReferral}
                    onCheckedChange={(checked) => {
                      setSkipReferral(checked as boolean)
                      if (checked) {
                        setFormData({ ...formData, referralCode: '' })
                      }
                    }}
                    disabled={!!trackedReferralCode} // Disable if we have a tracked referral
                  />
                  <Label htmlFor="skipReferral" className="text-sm text-[#C0E6FF]">
                    Continue without referral code
                  </Label>
                </div>
                {!formData.referralCode.trim() && !skipReferral && !trackedReferralCode && (
                  <p className="text-yellow-400 text-sm mt-1">
                    Enter a referral code or check the box to continue
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(0)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleProfileSubmit}
                disabled={isCompleting || !isFormValid}
                className="flex-1 bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white"
              >
                {isCompleting ? 'Saving Profile...' : 'Save & Continue'}
                {!isCompleting && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        )

      case 'kyc':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-12 h-12 text-[#4DA2FF] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Verify Your Identity</h2>
              <p className="text-[#C0E6FF]">
                Complete KYC verification to unlock premium features and enhanced security
              </p>
            </div>
            
            <div className="bg-[#1a2f51] rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-white">Benefits of KYC Verification:</h3>
              <ul className="space-y-2 text-[#C0E6FF] text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Higher transaction limits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Access to premium features
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Enhanced account security
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Priority customer support
                </li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSkipKYC}
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button
                onClick={handleKYCStart}
                disabled={isCompleting}
                className="flex-1 bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white"
              >
                {isCompleting ? 'Starting...' : 'Start KYC'}
                <Shield className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">You're All Set!</h2>
              <p className="text-[#C0E6FF] mb-4">
                Welcome to the AIONET community! Your account is now fully configured.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Profile Complete
                </Badge>
                {profile?.kyc_status === 'verified' && (
                  <Badge className="bg-blue-500 text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    KYC Verified
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              onClick={handleCompleteOnboarding}
              disabled={isCompleting}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8"
            >
              {isCompleting ? 'Completing...' : 'Enter Dashboard'}
              <Gift className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  // Check if onboarding is completed in database
  const isOnboardingCompleted = profile?.onboarding_completed === true

  // Don't show onboarding if user has completed onboarding or has no profile yet
  if (!profile || isOnboardingCompleted) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#0A1628] border-[#C0E6FF]/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-[#C0E6FF]">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="text-sm text-[#C0E6FF]">
              {Math.round(progress)}% Complete
            </div>
          </div>
          <div className="w-full bg-[#1a2f51] rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-[#4DA2FF] to-[#00D4AA] h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-[#C0E6FF]/70">
            {steps[currentStep]?.title}
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  )
}
