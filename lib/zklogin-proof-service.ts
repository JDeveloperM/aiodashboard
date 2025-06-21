/**
 * zkLogin Proof Generation Service
 * Handles ZK proof generation using Mysten Labs proving service
 */

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { SuiClient } from '@mysten/sui/client'

export interface ZkProofRequest {
  jwt: string
  extendedEphemeralPublicKey: string
  maxEpoch: number
  jwtRandomness: string
  salt: string
  keyClaimName: string
}

export interface ZkProofResponse {
  proofPoints: {
    a: string[]
    b: string[][]
    c: string[]
  }
  issBase64Details: {
    value: string
    indexMod4: number
  }
  headerBase64: string
}

export interface ZkLoginInputs {
  proofPoints: {
    a: string[]
    b: string[][]
    c: string[]
  }
  issBase64Details: {
    value: string
    indexMod4: number
  }
  headerBase64: string
  addressSeed: string
}

/**
 * zkLogin Proof Service
 * Manages ZK proof generation and caching
 */
export class ZkLoginProofService {
  private static instance: ZkLoginProofService
  private proofCache = new Map<string, { proof: ZkProofResponse; timestamp: number }>()
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
  private readonly PROVING_SERVICE_URL = process.env.NEXT_PUBLIC_ZKLOGIN_PROVING_SERVICE_URL || 'https://prover-dev.mystenlabs.com/v1'

  private constructor() {}

  static getInstance(): ZkLoginProofService {
    if (!ZkLoginProofService.instance) {
      ZkLoginProofService.instance = new ZkLoginProofService()
    }
    return ZkLoginProofService.instance
  }

  /**
   * Generate ZK proof for zkLogin transaction
   */
  async generateProof(request: ZkProofRequest): Promise<ZkProofResponse> {
    try {
      // Create cache key
      const cacheKey = this.createCacheKey(request)
      
      // Check cache first
      const cached = this.proofCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('Using cached ZK proof')
        return cached.proof
      }

      console.log('Generating new ZK proof...')

      // Call Mysten Labs proving service
      const response = await fetch(`${this.PROVING_SERVICE_URL}/prove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jwt: request.jwt,
          extendedEphemeralPublicKey: request.extendedEphemeralPublicKey,
          maxEpoch: request.maxEpoch.toString(),
          jwtRandomness: request.jwtRandomness,
          salt: request.salt,
          keyClaimName: request.keyClaimName,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Proof generation failed: ${response.status} ${errorText}`)
      }

      const proof: ZkProofResponse = await response.json()

      // Cache the proof
      this.proofCache.set(cacheKey, {
        proof,
        timestamp: Date.now()
      })

      console.log('ZK proof generated successfully')
      return proof

    } catch (error) {
      console.error('Failed to generate ZK proof:', error)
      throw new Error(`ZK proof generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Prepare zkLogin inputs for transaction signing
   */
  async prepareZkLoginInputs(
    jwt: string,
    ephemeralKeyPair: Ed25519Keypair,
    userSalt: string,
    maxEpoch: number,
    randomness: string
  ): Promise<ZkLoginInputs> {
    try {
      // Import required functions
      const { getExtendedEphemeralPublicKey, genAddressSeed } = await import('@mysten/sui/zklogin')

      // Get extended ephemeral public key
      const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(ephemeralKeyPair.getPublicKey())

      // Generate ZK proof
      const proof = await this.generateProof({
        jwt,
        extendedEphemeralPublicKey: Array.from(extendedEphemeralPublicKey).join(','),
        maxEpoch,
        jwtRandomness: randomness,
        salt: userSalt,
        keyClaimName: 'sub', // Using 'sub' as the key claim
      })

      // Generate address seed
      const addressSeed = genAddressSeed(
        userSalt,
        'sub', // key claim name
        this.extractSubFromJWT(jwt), // key claim value
        this.extractAudFromJWT(jwt) // audience
      ).toString()

      return {
        proofPoints: proof.proofPoints,
        issBase64Details: proof.issBase64Details,
        headerBase64: proof.headerBase64,
        addressSeed,
      }

    } catch (error) {
      console.error('Failed to prepare zkLogin inputs:', error)
      throw new Error(`Failed to prepare zkLogin inputs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Extract 'sub' claim from JWT
   */
  private extractSubFromJWT(jwt: string): string {
    try {
      const payload = jwt.split('.')[1]
      const decodedPayload = JSON.parse(atob(payload))
      return decodedPayload.sub
    } catch (error) {
      throw new Error('Failed to extract sub from JWT')
    }
  }

  /**
   * Extract 'aud' claim from JWT
   */
  private extractAudFromJWT(jwt: string): string {
    try {
      const payload = jwt.split('.')[1]
      const decodedPayload = JSON.parse(atob(payload))
      return decodedPayload.aud
    } catch (error) {
      throw new Error('Failed to extract aud from JWT')
    }
  }

  /**
   * Create cache key for proof caching
   */
  private createCacheKey(request: ZkProofRequest): string {
    return `${request.jwt.slice(-10)}_${request.maxEpoch}_${request.jwtRandomness.slice(-5)}`
  }

  /**
   * Clear expired proofs from cache
   */
  clearExpiredCache(): void {
    const now = Date.now()
    for (const [key, value] of this.proofCache.entries()) {
      if (now - value.timestamp >= this.CACHE_DURATION) {
        this.proofCache.delete(key)
      }
    }
  }

  /**
   * Clear all cached proofs
   */
  clearCache(): void {
    this.proofCache.clear()
  }
}

// Export singleton instance
export const zkProofService = ZkLoginProofService.getInstance()
