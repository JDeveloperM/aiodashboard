"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { MIST_PER_SUI } from "@mysten/sui/utils"
import { affiliateSubscriptionService, PriceQuote } from "@/lib/affiliate-subscription-service"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { 
  CreditCard, 
  Clock, 
  DollarSign, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

interface AffiliateSubscriptionPaymentProps {
  userAddress: string
  onPaymentSuccess?: () => void
  trigger?: React.ReactNode
}

export function AffiliateSubscriptionPayment({ 
  userAddress, 
  onPaymentSuccess,
  trigger 
}: AffiliateSubscriptionPaymentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'duration' | 'quote' | 'confirm' | 'processing' | 'success' | 'error'>('duration')
  const [priceQuote, setPriceQuote] = useState<PriceQuote | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number>(30) // Default to 30 days

  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const { isSignedIn } = useSuiAuth()

  // Get SUI balance
  const [suiBalance, setSuiBalance] = useState<number>(0)

  // Duration options (days) with pricing
  const durationOptions = [
    { days: 30, label: "1 Month", price: 15 },
    { days: 60, label: "2 Months", price: 30 },
    { days: 90, label: "3 Months", price: 45 },
    { days: 180, label: "6 Months", price: 90 },
    { days: 365, label: "1 Year", price: 180 }
  ]

  // Calculate price based on selected duration
  const calculatePrice = (days: number) => {
    return (days / 30) * 15 // $15 per 30 days
  }

  const selectedOption = durationOptions.find(opt => opt.days === selectedDuration)
  const calculatedPrice = calculatePrice(selectedDuration)

  useEffect(() => {
    const addressToUse = userAddress || account?.address
    if (addressToUse) {
      fetchSuiBalance()
    }
  }, [userAddress, account?.address])

  const fetchSuiBalance = async () => {
    const addressToUse = userAddress || account?.address
    if (!addressToUse) return

    try {
      const balance = await suiClient.getBalance({
        owner: addressToUse,
        coinType: '0x2::sui::SUI'
      })
      setSuiBalance(parseInt(balance.totalBalance) / Number(MIST_PER_SUI))
    } catch (error) {
      console.error('Error fetching SUI balance:', error)
    }
  }

  const fetchPriceQuote = async () => {
    try {
      setIsProcessing(true)
      setError(null)

      // Create a custom quote based on selected duration
      const quote = await affiliateSubscriptionService.getPriceQuote()

      // Override the quote with our calculated values
      const customQuote: PriceQuote = {
        ...quote,
        usdcPrice: calculatedPrice,
        suiPrice: calculatedPrice / quote.suiUsdRate, // Convert to SUI using current rate
      }

      setPriceQuote(customQuote)
      setPaymentStep('confirm')
    } catch (error) {
      console.error('Error fetching price quote:', error)
      setError('Failed to get current pricing. Please try again.')
      setPaymentStep('error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = async () => {
    if (!priceQuote || !account?.address) return

    try {
      setIsProcessing(true)
      setPaymentStep('processing')
      setError(null)

      // Check if user has sufficient balance
      if (suiBalance < priceQuote.suiPrice) {
        throw new Error(`Insufficient SUI balance. You need ${priceQuote.suiPrice.toFixed(4)} SUI but only have ${suiBalance.toFixed(4)} SUI.`)
      }

      // Create transaction to send SUI to the platform wallet
      const tx = new Transaction()
      
      // In production, replace with your actual platform wallet address
      const platformWallet = '0x311479200d45ef0243b92dbcf9849b8f6b931d27ae885197ea73066724f2bcf4'
      const amountInMist = Math.floor(priceQuote.suiPrice * Number(MIST_PER_SUI))

      tx.transferObjects(
        [tx.splitCoins(tx.gas, [amountInMist])],
        platformWallet
      )

      // Execute transaction
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: async (result) => {
            console.log('✅ Payment transaction successful:', result)
            const txHash = result.digest

            try {
              // Create subscription record
              await affiliateSubscriptionService.createSubscription(
                userAddress,
                priceQuote,
                txHash
              )

              // Verify and activate subscription
              const verified = await affiliateSubscriptionService.verifyAndActivateSubscription(txHash)
              
              if (verified) {
                setTransactionHash(txHash)
                setPaymentStep('success')
                toast.success('🎉 Affiliate subscription activated successfully!')
                onPaymentSuccess?.()
              } else {
                throw new Error('Payment verification failed')
              }
            } catch (error) {
              console.error('Error processing subscription:', error)
              setError('Payment sent but subscription activation failed. Please contact support.')
              setPaymentStep('error')
            }
          },
          onError: (error) => {
            console.error('❌ Payment transaction failed:', error)
            setError(`Payment failed: ${error.message}`)
            setPaymentStep('error')
          },
        }
      )
    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'Payment failed. Please try again.')
      setPaymentStep('error')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetPayment = () => {
    setPaymentStep('duration')
    setPriceQuote(null)
    setError(null)
    setTransactionHash(null)
    setIsProcessing(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setPaymentStep('duration')
    } else {
      resetPayment()
    }
  }

  // Check if user is authenticated with either method
  const isAuthenticated = isSignedIn || !!account
  const currentUserAddress = userAddress || account?.address

  if (!isAuthenticated || !currentUserAddress) {
    return null
  }

  const defaultTrigger = (
    <Button className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white">
      <CreditCard className="w-4 h-4 mr-2" />
      Renew Subscription
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0a1628] border-[#C0E6FF]/20">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#4DA2FF]" />
            Affiliate Subscription Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Duration Selection Step */}
          {paymentStep === 'duration' && (
            <div className="space-y-6">
              <div className="text-center">
                <Clock className="w-12 h-12 text-[#4DA2FF] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Select Subscription Duration</h3>
                <p className="text-[#C0E6FF] text-sm">Choose how many days to add to your subscription</p>
              </div>

              {/* Duration Options */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-[#C0E6FF]">Duration</label>
                <Select value={selectedDuration.toString()} onValueChange={(value) => setSelectedDuration(parseInt(value))}>
                  <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2f51] border-[#C0E6FF]/30">
                    {durationOptions.map((option) => (
                      <SelectItem
                        key={option.days}
                        value={option.days.toString()}
                        className="text-white hover:bg-[#C0E6FF]/10"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span>{option.label} ({option.days} days)</span>
                          <span className="ml-4 text-[#4DA2FF] font-semibold">${option.price}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Preview */}
              <div className="bg-[#1a2f51]/30 rounded-lg p-4 border border-[#C0E6FF]/10">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[#C0E6FF] text-sm">Selected Duration</p>
                    <p className="text-white font-semibold">{selectedOption?.label || `${selectedDuration} days`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#C0E6FF] text-sm">Total Price</p>
                    <p className="text-white font-bold text-lg">${calculatedPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <Button
                onClick={fetchPriceQuote}
                className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
                disabled={!selectedDuration}
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {/* Quote Step */}
          {paymentStep === 'quote' && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#4DA2FF] mx-auto mb-4" />
              <p className="text-[#C0E6FF]">Getting current pricing...</p>
            </div>
          )}

          {/* Confirm Step */}
          {paymentStep === 'confirm' && priceQuote && (
            <div className="space-y-4">
              {/* Pricing Card */}
              <Card className="bg-[#1a2f51]/30 border-[#C0E6FF]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Subscription Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#C0E6FF]">Duration:</span>
                    <Badge className="bg-[#4DA2FF]/20 text-[#4DA2FF] border-[#4DA2FF]/30">
                      {selectedOption?.label || `${selectedDuration} days`}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#C0E6FF]">USDC Equivalent:</span>
                    <span className="text-white font-semibold">${priceQuote.usdcPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#C0E6FF]">SUI Price:</span>
                    <span className="text-white font-semibold">{priceQuote.suiPrice.toFixed(4)} SUI</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#C0E6FF]/70">Exchange Rate:</span>
                    <span className="text-[#C0E6FF]/70">${priceQuote.suiUsdRate.toFixed(2)} per SUI</span>
                  </div>
                  <Separator className="bg-[#C0E6FF]/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-[#C0E6FF]">Your SUI Balance:</span>
                    <span className={`font-semibold ${suiBalance >= priceQuote.suiPrice ? 'text-green-400' : 'text-red-400'}`}>
                      {suiBalance.toFixed(4)} SUI
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Balance Warning */}
              {suiBalance < priceQuote.suiPrice && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Insufficient Balance</span>
                  </div>
                  <p className="text-red-300 text-sm mt-1">
                    You need {(priceQuote.suiPrice - suiBalance).toFixed(4)} more SUI to complete this purchase.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setPaymentStep('duration')}
                  variant="outline"
                  className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                  disabled={isProcessing}
                >
                  Back
                </Button>
                <Button
                  onClick={() => fetchPriceQuote()}
                  variant="outline"
                  className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                  disabled={isProcessing}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={handlePayment}
                  className="flex-1 bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
                  disabled={isProcessing || suiBalance < priceQuote.suiPrice}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay {priceQuote.suiPrice.toFixed(4)} SUI
                </Button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#4DA2FF] mx-auto mb-4" />
              <p className="text-white font-medium mb-2">Processing Payment...</p>
              <p className="text-[#C0E6FF] text-sm">Please confirm the transaction in your wallet</p>
            </div>
          )}

          {/* Success Step */}
          {paymentStep === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">Payment Successful!</p>
              <p className="text-[#C0E6FF] text-sm mb-4">Your affiliate subscription has been activated for 30 days.</p>
              {transactionHash && (
                <p className="text-xs text-[#C0E6FF]/70 break-all">
                  Transaction: {transactionHash}
                </p>
              )}
              <Button
                onClick={() => setIsOpen(false)}
                className="mt-4 bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Error Step */}
          {paymentStep === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">Payment Failed</p>
              <p className="text-red-300 text-sm mb-4">{error}</p>
              <div className="flex gap-3">
                <Button
                  onClick={resetPayment}
                  variant="outline"
                  className="flex-1 border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
