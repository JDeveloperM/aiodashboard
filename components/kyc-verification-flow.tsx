"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  FileText,
  Camera,
  User,
  CreditCard,
  ArrowRight,
  X
} from 'lucide-react'
import { useProfile } from '@/contexts/profile-context'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { toast } from 'sonner'

interface KYCStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  completed: boolean
  required: boolean
}

interface KYCVerificationFlowProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
}

export function KYCVerificationFlow({ isOpen, onClose, onComplete }: KYCVerificationFlowProps) {
  const { user, completeKYC } = useSuiAuth()
  const { profile, updateKYCStatus } = useProfile()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [kycStatus, setKycStatus] = useState<'not_started' | 'in_progress' | 'pending' | 'verified' | 'rejected'>(
    profile?.kyc_status === 'verified' ? 'verified' : 'not_started'
  )

  const steps: KYCStep[] = [
    {
      id: 'intro',
      title: 'Identity Verification',
      description: 'Secure your account with KYC verification',
      icon: Shield,
      completed: false,
      required: true
    },
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Provide your basic personal details',
      icon: User,
      completed: false,
      required: true
    },
    {
      id: 'documents',
      title: 'Document Upload',
      description: 'Upload government-issued ID',
      icon: FileText,
      completed: false,
      required: true
    },
    {
      id: 'verification',
      title: 'Identity Verification',
      description: 'Take a selfie for verification',
      icon: Camera,
      completed: false,
      required: true
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review your information and submit',
      icon: CheckCircle,
      completed: false,
      required: true
    }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleStartKYC = async () => {
    setIsProcessing(true)
    try {
      await updateKYCStatus('pending')
      setKycStatus('in_progress')
      setCurrentStep(1)
      toast.info('KYC verification started')
    } catch (error) {
      console.error('Failed to start KYC:', error)
      toast.error('Failed to start KYC verification')
    }
    setIsProcessing(false)
  }

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmitKYC = async () => {
    setIsProcessing(true)
    try {
      // Simulate KYC processing
      await updateKYCStatus('pending')
      setKycStatus('pending')
      
      // Simulate approval after delay (in real app, this would be handled by KYC provider)
      setTimeout(async () => {
        await updateKYCStatus('verified')
        await completeKYC()
        setKycStatus('verified')
        toast.success('KYC verification completed successfully!')
        onComplete?.()
        onClose()
      }, 3000)
      
      toast.info('KYC submitted for review. This may take a few minutes.')
    } catch (error) {
      console.error('Failed to submit KYC:', error)
      toast.error('Failed to submit KYC verification')
    }
    setIsProcessing(false)
  }

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'verified':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-500 text-white">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge className="bg-blue-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-500 text-white">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Not Started
          </Badge>
        )
    }
  }

  const renderStepContent = () => {
    const step = steps[currentStep]
    
    switch (step.id) {
      case 'intro':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-[#4DA2FF]/20 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-[#4DA2FF]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Identity Verification</h3>
              <p className="text-[#C0E6FF] mb-4">
                Complete KYC verification to unlock premium features and enhance your account security.
              </p>
              <div className="text-left bg-[#1a2f51] rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-white">What you'll need:</h4>
                <ul className="space-y-1 text-[#C0E6FF] text-sm">
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Government-issued photo ID
                  </li>
                  <li className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Camera for selfie verification
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    5-10 minutes of your time
                  </li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={handleStartKYC}
              disabled={isProcessing}
              className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white px-8"
            >
              {isProcessing ? 'Starting...' : 'Start Verification'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )

      case 'personal':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-12 h-12 text-[#4DA2FF] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Personal Information</h3>
              <p className="text-[#C0E6FF]">
                Please provide your personal details as they appear on your ID
              </p>
            </div>
            
            <div className="bg-[#1a2f51] rounded-lg p-4 text-center">
              <p className="text-[#C0E6FF] text-sm">
                📝 In a real implementation, this would include form fields for:
                <br />
                Full name, Date of birth, Address, Phone number, etc.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handlePreviousStep}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleNextStep}
                className="flex-1 bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )

      case 'documents':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="w-12 h-12 text-[#4DA2FF] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Document Upload</h3>
              <p className="text-[#C0E6FF]">
                Upload a clear photo of your government-issued ID
              </p>
            </div>
            
            <div className="bg-[#1a2f51] rounded-lg p-4 text-center">
              <p className="text-[#C0E6FF] text-sm">
                📄 In a real implementation, this would include:
                <br />
                File upload component for ID documents
                <br />
                Image quality validation and preview
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handlePreviousStep}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleNextStep}
                className="flex-1 bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )

      case 'verification':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Camera className="w-12 h-12 text-[#4DA2FF] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Identity Verification</h3>
              <p className="text-[#C0E6FF]">
                Take a selfie to verify your identity
              </p>
            </div>
            
            <div className="bg-[#1a2f51] rounded-lg p-4 text-center">
              <p className="text-[#C0E6FF] text-sm">
                📸 In a real implementation, this would include:
                <br />
                Camera component for selfie capture
                <br />
                Face detection and liveness verification
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handlePreviousStep}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleNextStep}
                className="flex-1 bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-[#4DA2FF] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Review & Submit</h3>
              <p className="text-[#C0E6FF]">
                Please review your information before submitting
              </p>
            </div>
            
            <div className="bg-[#1a2f51] rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-white">Verification Summary:</h4>
              <div className="space-y-2 text-[#C0E6FF] text-sm">
                <div className="flex items-center justify-between">
                  <span>Personal Information</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Document Upload</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Identity Verification</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handlePreviousStep}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmitKYC}
                disabled={isProcessing}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                {isProcessing ? 'Submitting...' : 'Submit for Review'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#0A1628] border-[#C0E6FF]/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-white">KYC Verification</CardTitle>
              {getStatusBadge()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-[#C0E6FF] hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-[#C0E6FF]">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#4DA2FF] to-[#00D4AA] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  )
}
