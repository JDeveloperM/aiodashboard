"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { affiliateService } from '@/lib/affiliate-service'
import { createClient } from '@supabase/supabase-js'
import { Search, Users, ArrowRight } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RelationshipChain {
  level: number
  referrer: string
  referee: string
  referralCode?: string
  username?: string
  createdAt: string
}

export function AffiliateDebugTool() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [relationshipChains, setRelationshipChains] = useState<RelationshipChain[]>([])
  const [networkMetrics, setNetworkMetrics] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const debugAffiliateNetwork = async () => {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address')
      return
    }

    setIsLoading(true)
    setError(null)
    setRelationshipChains([])
    setNetworkMetrics(null)

    try {
      console.log('🔍 Debugging affiliate network for:', walletAddress)

      // Step 1: Get all direct relationships
      const { data: directRelationships, error: directError } = await supabase
        .from('affiliate_relationships')
        .select('*')
        .eq('referrer_address', walletAddress)
        .eq('relationship_status', 'active')
        .order('created_at', { ascending: false })

      if (directError) {
        throw directError
      }

      console.log('Direct relationships found:', directRelationships?.length || 0)

      // Step 2: Get usernames for all addresses
      const allAddresses = new Set<string>([walletAddress])
      directRelationships?.forEach(rel => {
        allAddresses.add(rel.referrer_address)
        allAddresses.add(rel.referee_address)
      })

      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('address, username_encrypted')
        .in('address', Array.from(allAddresses))

      const addressToUsername: Record<string, string> = {}
      profiles?.forEach(profile => {
        if (profile.username_encrypted) {
          // For debugging, we'll show encrypted usernames as-is
          addressToUsername[profile.address] = profile.username_encrypted.slice(0, 20) + '...'
        } else {
          addressToUsername[profile.address] = `User ${profile.address.slice(0, 6)}`
        }
      })

      // Step 3: Build relationship chains
      const chains: RelationshipChain[] = []

      // Add direct relationships (Level 1)
      directRelationships?.forEach(rel => {
        chains.push({
          level: 1,
          referrer: rel.referrer_address,
          referee: rel.referee_address,
          referralCode: rel.referral_code,
          username: addressToUsername[rel.referee_address],
          createdAt: rel.created_at
        })
      })

      // Step 4: Get second-level relationships
      if (directRelationships && directRelationships.length > 0) {
        const level1Referees = directRelationships.map(rel => rel.referee_address)

        const { data: level2Relationships } = await supabase
          .from('affiliate_relationships')
          .select('*')
          .in('referrer_address', level1Referees)
          .eq('relationship_status', 'active')
          .order('created_at', { ascending: false })

        console.log('Level 2 relationships found:', level2Relationships?.length || 0)

        level2Relationships?.forEach(rel => {
          chains.push({
            level: 2,
            referrer: rel.referrer_address,
            referee: rel.referee_address,
            referralCode: rel.referral_code,
            username: addressToUsername[rel.referee_address] || `User ${rel.referee_address.slice(0, 6)}`,
            createdAt: rel.created_at
          })
        })

        // Add usernames for level 2 addresses
        level2Relationships?.forEach(rel => {
          allAddresses.add(rel.referee_address)
        })
      }

      setRelationshipChains(chains)

      // Step 5: Get network metrics using the service
      const metrics = await affiliateService.getNetworkMetrics(walletAddress)
      setNetworkMetrics(metrics)

      console.log('✅ Debug complete. Found', chains.length, 'total relationships')

    } catch (error) {
      console.error('❌ Debug failed:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card className="bg-[#030f1c] border-[#C0E6FF]/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-[#4DA2FF]" />
          Affiliate Network Debug Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter wallet address to debug..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="bg-[#030F1C] border-[#C0E6FF]/30 text-white"
          />
          <Button
            onClick={debugAffiliateNetwork}
            disabled={isLoading}
            className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
          >
            {isLoading ? 'Debugging...' : 'Debug Network'}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Network Metrics */}
        {networkMetrics && (
          <div className="bg-[#1a2f51]/30 rounded-lg p-4 border border-[#C0E6FF]/10">
            <h3 className="text-white font-semibold mb-3">Network Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-[#C0E6FF]">Personal NOMAD:</span>
                <span className="text-white ml-2">{networkMetrics.personalNomadUsers}</span>
              </div>
              <div>
                <span className="text-[#C0E6FF]">Personal PRO:</span>
                <span className="text-white ml-2">{networkMetrics.personalProUsers}</span>
              </div>
              <div>
                <span className="text-[#C0E6FF]">Personal ROYAL:</span>
                <span className="text-white ml-2">{networkMetrics.personalRoyalUsers}</span>
              </div>
              <div>
                <span className="text-[#C0E6FF]">Network NOMAD:</span>
                <span className="text-white ml-2">{networkMetrics.networkNomadUsers}</span>
              </div>
              <div>
                <span className="text-[#C0E6FF]">Network PRO:</span>
                <span className="text-white ml-2">{networkMetrics.networkProUsers}</span>
              </div>
              <div>
                <span className="text-[#C0E6FF]">Network ROYAL:</span>
                <span className="text-white ml-2">{networkMetrics.networkRoyalUsers}</span>
              </div>
            </div>
          </div>
        )}

        {/* Relationship Chains */}
        {relationshipChains.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4DA2FF]" />
              Relationship Chains ({relationshipChains.length} total)
            </h3>
            
            {/* Group by level */}
            {[1, 2, 3, 4, 5].map(level => {
              const levelChains = relationshipChains.filter(chain => chain.level === level)
              if (levelChains.length === 0) return null

              return (
                <div key={level} className="bg-[#1a2f51]/20 rounded-lg p-3 border border-[#C0E6FF]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-[#4DA2FF]/20 text-[#4DA2FF] border-[#4DA2FF]/30">
                      Level {level}
                    </Badge>
                    <span className="text-[#C0E6FF] text-sm">({levelChains.length} relationships)</span>
                  </div>
                  
                  <div className="space-y-2">
                    {levelChains.map((chain, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="text-[#C0E6FF]">{formatAddress(chain.referrer)}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className="text-white">{chain.username || formatAddress(chain.referee)}</span>
                        {chain.referralCode && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            {chain.referralCode}
                          </Badge>
                        )}
                        <span className="text-[#C0E6FF]/70 text-xs ml-auto">
                          {formatDate(chain.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* No Data Message */}
        {!isLoading && relationshipChains.length === 0 && walletAddress && !error && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Relationships Found</h3>
            <p className="text-[#C0E6FF]">
              This wallet address has no affiliate relationships in the database.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
