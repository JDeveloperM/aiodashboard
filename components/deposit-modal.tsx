"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import QRCode from 'qrcode'
import {
  Copy,
  Download,
  QrCode,
  Wallet,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Coins
} from 'lucide-react'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  walletAddress: string | null
  suiBalance: number
  usdcBalance: number
}

export function DepositModal({
  isOpen,
  onClose,
  walletAddress,
  suiBalance,
  usdcBalance
}: DepositModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && walletAddress) {
      generateQRCode()
    }
  }, [isOpen, walletAddress])

  const generateQRCode = async () => {
    if (!walletAddress) return

    try {
      setIsGeneratingQR(true)
      const qrDataUrl = await QRCode.toDataURL(walletAddress, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeDataUrl(qrDataUrl)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      toast.error('Failed to generate QR code')
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const copyAddress = async () => {
    if (!walletAddress) return

    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopiedAddress(true)
      toast.success('Address copied to clipboard!')
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return

    const link = document.createElement('a')
    link.download = 'wallet-address-qr.png'
    link.href = qrCodeDataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code downloaded!')
  }

  const formatBalance = (balance: number) => {
    return balance.toFixed(6)
  }

  if (!walletAddress) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#0c1b36] border-[#1e3a8a] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#4DA2FF]" />
            Deposit Funds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code */}
          <div className="bg-[#1a2f51] border border-[#C0E6FF]/30 rounded-lg p-4">
            <div className="text-[#C0E6FF] text-sm mb-3 flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              QR Code
            </div>
            <div className="text-center">
              {isGeneratingQR ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#4DA2FF]" />
                </div>
              ) : qrCodeDataUrl ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="bg-white p-3 rounded-lg">
                    <img
                      src={qrCodeDataUrl}
                      alt="Wallet Address QR Code"
                      className="w-32 h-32"
                    />
                  </div>
                  <Button
                    onClick={downloadQRCode}
                    variant="outline"
                    size="sm"
                    className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR
                  </Button>
                </div>
              ) : (
                <div className="text-gray-400 py-8">
                  QR Code not available
                </div>
              )}
            </div>
          </div>

          {/* Wallet Address */}
          <div className="bg-[#1a2f51] border border-[#C0E6FF]/30 rounded-lg p-4">
            <div className="text-[#C0E6FF] text-sm mb-3">Wallet Address</div>
            <div className="bg-[#030f1c] p-3 rounded border border-[#C0E6FF]/20 mb-3">
              <code className="text-xs text-[#C0E6FF] break-all">
                {walletAddress}
              </code>
            </div>
            <Button
              onClick={copyAddress}
              className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
              disabled={copiedAddress}
            >
              {copiedAddress ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Address
                </>
              )}
            </Button>
          </div>

          {/* Important Notice */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-orange-400 font-medium text-sm">Important</p>
                <p className="text-orange-300 text-xs mt-1">
                  Only send SUI, WAL, or USDC tokens to this address on SUI testnet. pAION tokens are managed internally. Double-check before sending.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
