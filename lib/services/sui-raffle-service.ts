// Client-side SUI Blockchain Integration for RaffleCraft
// React hook for handling SUI transactions in the browser
"use client"

import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { useZkLoginWallet } from '@/hooks/use-zklogin-wallet'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { toast } from 'sonner'
import { SuiRaffleServerService } from './sui-raffle-server'
import { BlockchainError } from '@/lib/types/rafflecraft-types'

/**
 * React Hook for SUI Raffle Transactions
 */
export function useSuiRaffleTransactions() {
  const suiClient = useSuiClient()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const { wallet: zkWallet, isConnected: isZkConnected } = useZkLoginWallet()
  const { user } = useSuiAuth()

  const raffleService = new SuiRaffleServerService(suiClient)
  const isZkLogin = user?.connectionType === 'zklogin'

  /**
   * Purchase a raffle ticket
   */
  const purchaseTicket = async (
    ticketPriceSui: number
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> => {
    try {
      if (!user?.address) {
        throw new BlockchainError('Wallet not connected')
      }

      // Check user balance
      const balance = await raffleService.getUserBalance(user.address)
      const estimatedGas = await raffleService.estimateGasFees(ticketPriceSui, user.address)
      const totalRequired = ticketPriceSui + estimatedGas

      if (balance < totalRequired) {
        throw new BlockchainError(
          `Insufficient balance. Required: ${totalRequired.toFixed(4)} SUI, Available: ${balance.toFixed(4)} SUI`
        )
      }

      // Create transaction
      const transaction = raffleService.createTicketPurchaseTransaction(ticketPriceSui, user.address)

      let transactionHash: string

      if (isZkLogin && zkWallet && isZkConnected) {
        // zkLogin transaction
        const result = await zkWallet.signAndExecuteTransaction(transaction)
        transactionHash = result.digest
      } else {
        // Traditional wallet transaction
        const result = await new Promise<{ digest: string }>((resolve, reject) => {
          signAndExecute(
            { transaction },
            {
              onSuccess: (result) => resolve({ digest: result.digest }),
              onError: (error) => reject(error)
            }
          )
        })
        transactionHash = result.digest
      }

      // Validate the transaction
      await raffleService.validateTicketTransaction(transactionHash)

      toast.success('Ticket purchased successfully!')
      return { success: true, transactionHash }
    } catch (error) {
      console.error('Error purchasing ticket:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to purchase ticket: ${errorMessage}`)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Get user balance
   */
  const getUserBalance = async (): Promise<number> => {
    if (!user?.address) return 0
    return raffleService.getUserBalance(user.address)
  }

  /**
   * Estimate transaction fees
   */
  const estimateGasFees = async (ticketPriceSui: number): Promise<number> => {
    if (!user?.address) return 0.01
    return raffleService.estimateGasFees(ticketPriceSui, user.address)
  }

  return {
    purchaseTicket,
    getUserBalance,
    estimateGasFees,
    validateTransaction: raffleService.validateTicketTransaction.bind(raffleService),
    isConnected: !!user?.address,
    userAddress: user?.address
  }
}
