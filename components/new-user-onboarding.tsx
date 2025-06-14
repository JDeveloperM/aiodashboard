"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  Wallet,
  Star,
  Gift,
  Trophy
} from 'lucide-react'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { usePersistentProfile } from '@/hooks/use-persistent-profile'
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
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: ''
  })

  // Form validation
  const isFormValid = formData.username.trim().length >= 3

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to AIONET',
      description: 'Let\'s get your account set up with everything you need',
      icon: Star,
      completed: currentStep > 0,
      required: true
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your basic information to personalize your experience',
      icon: User,
      completed: currentStep > 1 && !!profile?.username && profile.username !== `User ${user?.address.slice(0, 6)}`,
      required: true
    },
    {
      id: 'kyc',
      title: 'Verify Your Identity',
      description: 'Complete KYC verification for enhanced security and features',
      icon: Shield,
      completed: currentStep > 2 && profile?.kyc_status === 'verified',
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

  // Load existing profile data
  useEffect(() => {
    if (profile) {
      console.log('📋 Loading existing profile data:', profile)
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        bio: profile.bio || ''
      })
    } else if (user?.address) {
      // Initialize with default username if no profile exists
      console.log('📝 Initializing default form data for new user')
      setFormData({
        username: `User ${user.address.slice(0, 6)}`,
        email: '',
        bio: ''
      })
    }
  }, [profile, user?.address])

  // Auto-refresh user state when profile changes
  useEffect(() => {
    if (profile?.username && profile.username !== `User ${user?.address.slice(0, 6)}`) {
      console.log('🔄 Profile has custom username, refreshing user state...')
      refreshUserState()
    }
  }, [profile?.username, user?.address, refreshUserState])

  const handleProfileSubmit = async () => {
    if (!formData.username.trim()) {
      toast.error('Please enter a username')
      return
    }

    setIsCompleting(true)
    try {
      console.log('🔄 Submitting profile data:', formData)

      // Update profile with form data
      const success = await updateProfile({
        username: formData.username.trim(),
        email: formData.email.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        // Ensure we don't lose existing data
        role_tier: profile?.role_tier || 'NOMAD',
        profile_level: profile?.profile_level || 1,
        current_xp: profile?.current_xp || 0,
        total_xp: profile?.total_xp || 0,
        points: profile?.points || 100,
        kyc_status: profile?.kyc_status || 'not_verified'
      })

      if (success) {
        console.log('✅ Profile updated successfully')
        await completeProfileSetup()

        // Set localStorage flag to prevent onboarding from showing again
        if (user?.address) {
          localStorage.setItem(`onboarding_completed_${user.address}`, 'true')
          console.log('🏁 Onboarding completion flag set in localStorage')
        }

        // Refresh user state to update isNewUser status
        await refreshUserState()

        // If this is the last required step, complete onboarding
        if (currentStep === 1) { // Profile step
          setTimeout(async () => {
            await completeOnboarding()
            await refreshUserState()
            toast.success('Profile setup complete! Welcome to AIONET!')

            // Force component re-render by updating a state
            window.location.reload()
          }, 1500)
        }

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
      await completeOnboarding()

      // Set localStorage flag to prevent onboarding from showing again
      if (user?.address) {
        localStorage.setItem(`onboarding_completed_${user.address}`, 'true')
        console.log('🏁 Final onboarding completion flag set')
      }

      toast.success('Welcome to AIONET! Your account is now fully set up.')

      // Force a page refresh to ensure the onboarding doesn't show again
      setTimeout(() => {
        window.location.reload()
      }, 2000)
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
                <Label htmlFor="email" className="text-white">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="bio" className="text-white">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself"
                  className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white"
                  rows={3}
                />
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
                disabled={isCompleting || !formData.username.trim()}
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

  // Debug logging
  console.log('🔍 Onboarding component state:', {
    isNewUser,
    userOnboardingCompleted: user?.onboardingCompleted,
    currentStep,
    profileExists: !!profile,
    userAddress: user?.address
  })

  // Simple check: if profile exists in database, don't show onboarding
  const hasProfileInDatabase = !!profile

  console.log('🔍 Onboarding visibility check:', {
    hasProfileInDatabase,
    profileExists: !!profile,
    profileId: profile?.id,
    userAddress: user?.address,
    shouldShowOnboarding: !hasProfileInDatabase
  })

  // Don't show onboarding if user already has a profile record in database
  if (hasProfileInDatabase) {
    console.log('⏭️ Skipping onboarding - user has database record')
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
