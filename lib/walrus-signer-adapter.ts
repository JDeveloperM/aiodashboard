"use client"

import { Transaction } from '@mysten/sui/transactions'
import { fromB64, toB64 } from '@mysten/sui/utils'
import { Signer, SignatureScheme } from '@mysten/sui/cryptography'

/**
 * Adapter to make dApp kit account work with Walrus SDK
 * The Walrus SDK expects a Signer interface from @mysten/sui/cryptography,
 * but dApp kit provides account objects and separate signing hooks.
 */
export class WalrusSignerAdapter implements Signer {
  private account: any
  private signAndExecute: any

  constructor(account: any, signAndExecute: any) {
    this.account = account
    this.signAndExecute = signAndExecute
  }

  /**
   * Get the Sui address - required by Signer interface
   */
  toSuiAddress(): string {
    if (!this.account?.address) {
      throw new Error('No account address available')
    }
    return this.account.address
  }

  /**
   * Get the address - alias for toSuiAddress
   */
  get address() {
    return this.toSuiAddress()
  }

  /**
   * Get SUI address (alternative method name)
   */
  getAddress() {
    return this.toSuiAddress()
  }

  /**
   * Sign and execute a transaction - required by Signer interface
   * This is the main method used by Walrus SDK
   */
  async signAndExecuteTransaction({ transaction, client }: { transaction: Transaction; client?: any }): Promise<any> {
    if (!this.signAndExecute) {
      throw new Error('No signing function available')
    }

    console.log('WalrusSignerAdapter: Signing transaction...', transaction)
    console.log('Transaction type:', transaction.constructor.name)
    console.log('Transaction methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(transaction)))
    console.log('Available methods on transaction:', Object.keys(transaction))

    try {
      // Check if this is actually a Walrus transaction object with different structure
      let actualTransaction = transaction

      // If it's a Walrus transaction wrapper, extract the actual transaction
      if ((transaction as any).transaction) {
        console.log('Found nested transaction object')
        actualTransaction = (transaction as any).transaction
      }

      // Create a transaction wrapper that has the toJSON method
      const transactionWrapper = {
        ...actualTransaction,
        toJSON: () => {
          console.log('toJSON called on transaction wrapper')
          // Try different serialization methods
          if (typeof actualTransaction.serialize === 'function') {
            console.log('Using serialize method')
            return actualTransaction.serialize()
          }
          if (typeof actualTransaction.getData === 'function') {
            console.log('Using getData method')
            return actualTransaction.getData()
          }
          if (typeof actualTransaction.build === 'function') {
            console.log('Using build method')
            return actualTransaction.build()
          }
          if (typeof actualTransaction.toJSON === 'function') {
            console.log('Using existing toJSON method')
            return actualTransaction.toJSON()
          }
          // Fallback to the transaction object itself
          console.log('Using fallback - returning transaction object')
          return actualTransaction
        }
      }

      // The dApp kit's signAndExecute expects this format
      const result = await Promise.race([
        new Promise((resolve, reject) => {
          console.log('Calling signAndExecute with transaction wrapper')
          this.signAndExecute(
            {
              transaction: transactionWrapper,
              account: this.account,
            },
            {
              onSuccess: (result: any) => {
                console.log('WalrusSignerAdapter: Transaction signed successfully:', result)
                resolve(result)
              },
              onError: (error: any) => {
                console.error('WalrusSignerAdapter: Transaction signing failed:', error)
                reject(error)
              }
            }
          )
        }),
        // Add timeout to prevent infinite loading
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Transaction signing timeout after 30 seconds'))
          }, 30000)
        })
      ])

      return result
    } catch (error) {
      console.error('WalrusSignerAdapter: Error in signAndExecuteTransaction:', error)
      throw error
    }
  }

  /**
   * Alternative method name that some versions might use
   */
  async signAndExecuteTransactionBlock(transaction: Transaction) {
    return this.signAndExecuteTransaction({ transaction })
  }

  /**
   * Sign transaction without executing
   * Note: In a dApp environment, we typically need to execute transactions
   * to pay for storage, so this delegates to signAndExecuteTransaction
   */
  async signTransaction(bytes: Uint8Array): Promise<any> {
    throw new Error('Direct transaction signing not supported in dApp environment')
  }

  /**
   * Sign data (required by Signer interface)
   * This is typically used for signing arbitrary data
   */
  async sign(data: Uint8Array): Promise<any> {
    throw new Error('Direct data signing not supported in dApp environment')
  }

  /**
   * Get the signature scheme (required by Signer interface)
   */
  getKeyScheme(): SignatureScheme {
    return 'ED25519' // Default scheme, actual scheme depends on wallet
  }

  /**
   * Sign with intent (required by Signer interface)
   */
  async signWithIntent(bytes: Uint8Array, intent: any): Promise<any> {
    throw new Error('signWithIntent not supported in dApp environment')
  }

  /**
   * Sign personal message (required by Signer interface)
   */
  async signPersonalMessage(message: Uint8Array): Promise<any> {
    throw new Error('signPersonalMessage not supported in dApp environment')
  }

  /**
   * Get public key (required by Signer interface)
   */
  getPublicKey(): any {
    throw new Error('getPublicKey not supported in dApp environment')
  }
}

/**
 * Create a Walrus-compatible signer from dApp kit account and signing function
 */
export function createWalrusSigner(account: any, signAndExecute: any) {
  if (!account) {
    throw new Error('No account provided - wallet must be connected')
  }

  if (!account.address) {
    throw new Error('Account has no address - invalid account object')
  }

  if (!signAndExecute) {
    throw new Error('No signing function provided')
  }

  return new WalrusSignerAdapter(account, signAndExecute)
}
