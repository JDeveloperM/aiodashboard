"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Copy,
  Download,
  ExternalLink,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  QrCode,
  MessageCircle
} from 'lucide-react'
import {
  copyToClipboard,
  downloadQRCode,
  generateAccessInstructions,
  createTelegramBotLink,
  type SubscriptionSummary
} from '@/lib/telegram-access'

interface TelegramAccessModalProps {
  isOpen: boolean
  onClose: () => void
  subscriptionSummary: SubscriptionSummary | null
  isLoading?: boolean
}

export function TelegramAccessModal({
  isOpen,
  onClose,
  subscriptionSummary,
  isLoading = false
}: TelegramAccessModalProps) {
  const [copied, setCopied] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  const handleCopyLink = async () => {
    if (!subscriptionSummary?.accessUrl) return
    
    const success = await copyToClipboard(subscriptionSummary.accessUrl)
    if (success) {
      setCopied(true)
      toast.success('Access link copied to clipboard!')
    } else {
      toast.error('Failed to copy link')
    }
  }

  const handleCopyInstructions = async () => {
    if (!subscriptionSummary) return
    
    const instructions = generateAccessInstructions(
      subscriptionSummary.channelName,
      subscriptionSummary.creatorName
    )
    
    const fullText = `${instructions}\n\n🔗 Access Link:\n${subscriptionSummary.accessUrl}`
    
    const success = await copyToClipboard(fullText)
    if (success) {
      toast.success('Instructions copied to clipboard!')
    } else {
      toast.error('Failed to copy instructions')
    }
  }

  const handleDownloadQR = () => {
    if (!subscriptionSummary?.qrCodeDataUrl) return
    
    const filename = `${subscriptionSummary.channelName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_access_qr.png`
    downloadQRCode(subscriptionSummary.qrCodeDataUrl, filename)
    toast.success('QR code downloaded!')
  }

  const handleOpenLink = () => {
    if (!subscriptionSummary?.accessUrl) return
    window.open(subscriptionSummary.accessUrl, '_blank')
  }

  const handleOpenBot = () => {
    const botLink = createTelegramBotLink('aio_premium_bot') // Replace with actual bot username
    window.open(botLink, '_blank')
  }

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-[#C0E6FF]">Generating access link...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!subscriptionSummary) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center p-6">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
            <p className="text-[#C0E6FF] mb-4">Failed to generate access link. Please try again.</p>
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Premium Channel Access Generated
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Details */}
          <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
            <CardHeader>
              <CardTitle className="text-[#C0E6FF] text-lg">Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Channel:</span>
                <span className="text-white font-medium">{subscriptionSummary.channelName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Creator:</span>
                <span className="text-white">{subscriptionSummary.creatorName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">{subscriptionSummary.duration}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Valid Until:</span>
                <span className="text-white">{subscriptionSummary.endDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Days Remaining:</span>
                <Badge variant={subscriptionSummary.daysRemaining > 7 ? "default" : "destructive"}>
                  <Clock className="w-3 h-3 mr-1" />
                  {subscriptionSummary.daysRemaining} days
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tier:</span>
                <Badge variant="outline" className="text-[#C0E6FF]">
                  {subscriptionSummary.tier}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount Paid:</span>
                <span className="text-white font-medium">{subscriptionSummary.paymentAmount} SUI</span>
              </div>
            </CardContent>
          </Card>

          {/* Access Link and QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QR Code */}
            <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
              <CardHeader>
                <CardTitle className="text-[#C0E6FF] text-lg flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code Access
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {subscriptionSummary.qrCodeDataUrl ? (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img
                        src={subscriptionSummary.qrCodeDataUrl}
                        alt="Access QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    <Button
                      onClick={handleDownloadQR}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download QR Code
                    </Button>
                  </div>
                ) : (
                  <div className="text-gray-400 py-8">
                    QR Code not available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Access Link */}
            <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
              <CardHeader>
                <CardTitle className="text-[#C0E6FF] text-lg">One-Time Access Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-[#030f1c] p-3 rounded border border-[#C0E6FF]/20">
                  <code className="text-xs text-[#C0E6FF] break-all">
                    {subscriptionSummary.accessUrl}
                  </code>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleOpenLink}
                    variant="default"
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Access Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Notice */}
          <Card className="bg-orange-500/10 border-orange-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-orange-500 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-200">Important Security Notice</h4>
                  <ul className="text-sm text-orange-100 space-y-1">
                    <li>• This access link can only be used ONCE</li>
                    <li>• Do not share this link with anyone else</li>
                    <li>• The link will expire when your subscription ends</li>
                    <li>• Keep this information secure</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
            <CardHeader>
              <CardTitle className="text-[#C0E6FF] text-lg">How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                  <p>Click the access link above or scan the QR code with your phone</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                  <p>This will activate your subscription and verify your access</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                  <p>Join the Telegram channel using the link provided on the access page</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</div>
                  <p>The Telegram bot will automatically verify your subscription</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowInstructions(!showInstructions)}
                  variant="outline"
                  size="sm"
                >
                  {showInstructions ? 'Hide' : 'Show'} Full Instructions
                </Button>
                <Button
                  onClick={handleCopyInstructions}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Instructions
                </Button>
                <Button
                  onClick={handleOpenBot}
                  variant="outline"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Open Bot
                </Button>
              </div>

              {showInstructions && (
                <div className="mt-4 p-4 bg-[#030f1c] rounded border border-[#C0E6FF]/20">
                  <pre className="text-xs text-[#C0E6FF] whitespace-pre-wrap">
                    {generateAccessInstructions(subscriptionSummary.channelName, subscriptionSummary.creatorName)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
            <Button
              onClick={handleOpenLink}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Activate Access Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
