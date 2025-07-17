"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Transaction } from '@mysten/sui/transactions'
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { useZkLogin } from './zklogin-provider'
import { useZkLoginWallet } from '@/hooks/use-zklogin-wallet'
import { paionTokenService } from '@/lib/paion-token-service'
import { useTokens } from '@/contexts/points-context'
import {
  Send,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowRight,
  Coins
} from 'lucide-react'

interface SendModalProps {
  isOpen: boolean
  onClose: () => void
  walletAddress: string | null
  suiBalance: number
  usdcBalance: number
  walBalance: number
  paionBalance: number
  isZkLogin?: boolean
}

export function SendModal({
  isOpen,
  onClose,
  walletAddress,
  suiBalance,
  usdcBalance,
  walBalance,
  paionBalance,
  isZkLogin = false
}: SendModalProps) {
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState<'SUI' | 'USDC' | 'WAL' | 'pAION'>('SUI')
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'form' | 'confirm' | 'processing' | 'success'>('form')
  const [transactionDigest, setTransactionDigest] = useState('')

  // Traditional wallet hooks
  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

  // zkLogin wallet hooks
  const zkLogin = useZkLogin()
  const zkWallet = useZkLoginWallet()

  // pAION token hooks
  const { refreshBalance } = useTokens()

  // Token contract addresses on Sui testnet
  const USDC_COIN_TYPE = '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC'
  const WAL_COIN_TYPE = '0x2::sui::SUI' // Replace with actual WAL token contract when available

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRecipientAddress('')
      setAmount('')
      setSelectedToken('SUI')
      setStep('form')
      setTransactionDigest('')
    }
  }, [isOpen])

  const formatBalance = (balance: number) => {
    return balance.toFixed(6)
  }

  const validateForm = () => {
    if (!recipientAddress.trim()) {
      toast.error('Please enter recipient address')
      return false
    }

    if (!amount.trim() || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return false
    }

    const amountNum = parseFloat(amount)
    let maxBalance = 0

    switch (selectedToken) {
      case 'SUI':
        maxBalance = suiBalance
        break
      case 'USDC':
        maxBalance = usdcBalance
        break
      case 'WAL':
        maxBalance = walBalance
        break
      case 'pAION':
        maxBalance = paionBalance
        break
    }

    if (amountNum > maxBalance) {
      toast.error(`Insufficient ${selectedToken} balance`)
      return false
    }

    // Basic SUI address validation (starts with 0x and is 66 characters long)
    if (!recipientAddress.startsWith('0x') || recipientAddress.length !== 66) {
      toast.error('Invalid SUI address format')
      return false
    }

    return true
  }

  const handleSend = async () => {
    if (!validateForm()) return

    setStep('confirm')
  }

  const confirmSend = async () => {
    try {
      setStep('processing')
      setIsProcessing(true)

      const amountNum = parseFloat(amount)
      let digest: string

      if (isZkLogin) {
        // zkLogin transaction
        if (selectedToken === 'SUI') {
          // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
          const amountInMist = (amountNum * 1_000_000_000).toString()
          const result = await zkWallet.transferSui(recipientAddress, amountInMist)
          digest = result.digest
        } else if (selectedToken === 'pAION') {
          // pAION transfer (database-based)
          const result = await paionTokenService.spendTokens(
            walletAddress!,
            amountNum,
            `Transfer to ${recipientAddress.slice(0, 8)}...`,
            'transfer',
            recipientAddress
          )

          if (!result.success) {
            throw new Error(result.error || 'pAION transfer failed')
          }

          // Add tokens to recipient
          await paionTokenService.addTokens(
            recipientAddress,
            amountNum,
            `Transfer from ${walletAddress!.slice(0, 8)}...`,
            'transfer',
            walletAddress!
          )

          digest = 'paion-transfer-' + Date.now() // Mock digest for pAION transfers
        } else {
          // USDC/WAL transfers for zkLogin - simplified implementation
          toast.error(`${selectedToken} transfers for zkLogin wallets are not yet fully implemented`)
          throw new Error(`${selectedToken} transfers for zkLogin wallets are not yet fully implemented`)
        }
      } else {
        // Traditional wallet transaction
        if (!account) {
          throw new Error('Wallet not connected')
        }

        if (selectedToken === 'pAION') {
          // pAION transfer (database-based)
          const result = await paionTokenService.spendTokens(
            account.address,
            amountNum,
            `Transfer to ${recipientAddress.slice(0, 8)}...`,
            'transfer',
            recipientAddress
          )

          if (!result.success) {
            throw new Error(result.error || 'pAION transfer failed')
          }

          // Add tokens to recipient
          await paionTokenService.addTokens(
            recipientAddress,
            amountNum,
            `Transfer from ${account.address.slice(0, 8)}...`,
            'transfer',
            account.address
          )

          digest = 'paion-transfer-' + Date.now() // Mock digest for pAION transfers
        } else {
          // On-chain token transfers (SUI, USDC, WAL)
          const transaction = new Transaction()

          if (selectedToken === 'SUI') {
            // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
            const amountInMist = Math.floor(amountNum * 1_000_000_000)
            const [coin] = transaction.splitCoins(transaction.gas, [amountInMist])
            transaction.transferObjects([coin], recipientAddress)
          } else if (selectedToken === 'USDC') {
            // USDC transfer
            // Convert USDC to smallest unit (6 decimals)
            const amountInSmallestUnit = Math.floor(amountNum * 1_000_000)

            // Get USDC coins
            const coins = await suiClient.getCoins({
              owner: account.address,
              coinType: USDC_COIN_TYPE,
            })

            if (coins.data.length === 0) {
              throw new Error('No USDC coins found')
            }

            // Use the first available USDC coin
            const [coin] = transaction.splitCoins(coins.data[0].coinObjectId, [amountInSmallestUnit])
            transaction.transferObjects([coin], recipientAddress)
          } else if (selectedToken === 'WAL') {
            // WAL transfer (using SUI for now until actual WAL contract is available)
            // Convert WAL to smallest unit (9 decimals like SUI)
            const amountInSmallestUnit = Math.floor(amountNum * 1_000_000_000)

            // Get WAL coins
            const coins = await suiClient.getCoins({
              owner: account.address,
              coinType: WAL_COIN_TYPE,
            })

            if (coins.data.length === 0) {
              throw new Error('No WAL coins found')
            }

            // Use the first available WAL coin
            const [coin] = transaction.splitCoins(coins.data[0].coinObjectId, [amountInSmallestUnit])
            transaction.transferObjects([coin], recipientAddress)
          }

          // Execute transaction with traditional wallet
          const result = await new Promise<{digest: string}>((resolve, reject) => {
            signAndExecuteTransaction(
              { transaction: transaction as any },
              {
                onSuccess: (result) => resolve({ digest: result.digest }),
                onError: (error) => reject(error)
              }
            )
          })
          digest = result.digest
        }
      }

      setTransactionDigest(digest)
      setStep('success')
      toast.success('Transaction sent successfully!')

      // Refresh balances after successful transaction
      if (selectedToken === 'pAION') {
        await refreshBalance()
      } else if (isZkLogin) {
        await zkWallet.refreshBalance()
      }

    } catch (error) {
      console.error('Send transaction failed:', error)
      toast.error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setStep('form')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
    }
  }

  const getMaxAmount = () => {
    switch (selectedToken) {
      case 'SUI':
        return suiBalance
      case 'USDC':
        return usdcBalance
      case 'WAL':
        return walBalance
      case 'pAION':
        return paionBalance
      default:
        return 0
    }
  }

  const maxAmount = getMaxAmount()

  if (!walletAddress) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-[#0c1b36] border-[#1e3a8a] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-[#4DA2FF]" />
            Send Funds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'form' && (
            <>
              {/* Token Selection */}
              <div className="space-y-2">
                <div className="text-[#C0E6FF] text-sm">Select Token</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={selectedToken === 'SUI' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedToken('SUI')}
                    className={selectedToken === 'SUI'
                      ? 'bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white'
                      : 'border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10'
                    }
                  >
                    SUI
                  </Button>
                  <Button
                    variant={selectedToken === 'WAL' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedToken('WAL')}
                    className={selectedToken === 'WAL'
                      ? 'bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white'
                      : 'border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10'
                    }
                  >
                    WAL
                  </Button>
                  <Button
                    variant={selectedToken === 'USDC' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedToken('USDC')}
                    className={selectedToken === 'USDC'
                      ? 'bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white'
                      : 'border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10'
                    }
                  >
                    USDC
                  </Button>
                  <Button
                    variant={selectedToken === 'pAION' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedToken('pAION')}
                    className={selectedToken === 'pAION'
                      ? 'bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white'
                      : 'border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10'
                    }
                  >
                    pAION
                  </Button>
                </div>
                <div className="text-xs text-[#C0E6FF]">
                  Available: {formatBalance(maxAmount)} {selectedToken}
                </div>
              </div>

              {/* Recipient Address */}
              <div className="space-y-2">
                <div className="text-[#C0E6FF] text-sm">Recipient Address</div>
                <Input
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  className="bg-[#030f1c] border-[#C0E6FF]/30 text-white placeholder:text-gray-400"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <div className="text-[#C0E6FF] text-sm">Amount</div>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.000001"
                    min="0"
                    max={maxAmount}
                    className="bg-[#030f1c] border-[#C0E6FF]/30 text-white placeholder:text-gray-400 pr-16"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAmount(maxAmount.toString())}
                    className="absolute right-1 top-1 h-8 px-2 text-xs text-[#4DA2FF] hover:bg-[#4DA2FF]/10"
                  >
                    MAX
                  </Button>
                </div>
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
                disabled={!recipientAddress || !amount || parseFloat(amount) <= 0}
              >
                <Send className="w-4 h-4 mr-2" />
                Review Transaction
              </Button>
            </>
          )}

          {step === 'confirm' && (
            <>
              {/* Transaction Summary */}
              <div className="bg-[#1a2f51] border border-[#C0E6FF]/30 rounded-lg p-4 space-y-3">
                <div className="text-[#C0E6FF] text-sm font-medium">Transaction Summary</div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">From:</span>
                  <code className="text-xs text-[#C0E6FF]">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </code>
                </div>
                
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-[#4DA2FF]" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">To:</span>
                  <code className="text-xs text-[#C0E6FF]">
                    {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                  </code>
                </div>
                
                <Separator className="bg-[#C0E6FF]/20" />
                
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Amount:</span>
                  <div className="text-right">
                    <div className="text-white font-medium">{amount} {selectedToken}</div>
                  </div>
                </div>
              </div>

              {/* Confirm Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('form')}
                  className="flex-1 border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                >
                  Back
                </Button>
                <Button
                  onClick={confirmSend}
                  className="flex-1 bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
                >
                  Confirm Send
                </Button>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#4DA2FF]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Processing Transaction</h3>
              <p className="text-[#C0E6FF] text-sm">Please wait while your transaction is being processed...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Transaction Successful!</h3>
              <p className="text-[#C0E6FF] text-sm mb-4">
                Your {selectedToken} has been sent successfully.
              </p>
              {transactionDigest && (
                <div className="bg-[#1a2f51] border border-[#C0E6FF]/30 rounded-lg p-3 mb-4">
                  <div className="text-[#C0E6FF] text-xs mb-1">Transaction ID:</div>
                  <code className="text-xs text-white break-all">{transactionDigest}</code>
                </div>
              )}
              <Button
                onClick={handleClose}
                className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
              >
                Done
              </Button>
            </div>
          )}

          {/* Important Notice */}
          {step === 'form' && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-orange-400 font-medium text-sm">Important</p>
                  <p className="text-orange-300 text-xs mt-1">
                    Double-check the recipient address. Transactions are irreversible.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
