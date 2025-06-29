"use client"

import React, { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { useSubscription } from '@/contexts/subscription-context'
import { useCreatorsDatabase } from '@/contexts/creators-database-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createOrUpdateCreator, type DecryptedCreator } from '@/lib/creator-storage'

export function CreatorDebugPanel() {
  const currentAccount = useCurrentAccount()
  const { user } = useSuiAuth()
  const { tier } = useSubscription()
  const { creators, addCreator, isLoading, error } = useCreatorsDatabase()
  const [testResult, setTestResult] = useState<string>('')
  const [isTestingDatabase, setIsTestingDatabase] = useState(false)
  const [isTestingCreator, setIsTestingCreator] = useState(false)

  const testDatabaseConnection = async () => {
    setIsTestingDatabase(true)
    setTestResult('Testing database connection...')
    
    try {
      const testCreatorData: Partial<DecryptedCreator> = {
        creator_address: currentAccount?.address || 'test-address',
        channel_name: 'Test Channel',
        channel_description: 'Test Description',
        creator_role: 'Test Role',
        channel_language: 'English',
        channel_categories: ['Testing'],
        tier: 'PRO',
        max_subscribers: 100,
        is_premium: false,
        subscription_packages: [],
        tip_pricing: {},
        subscribers_count: 0,
        verified: false,
        banner_color: '#4DA2FF',
        social_links: {},
        channels_data: []
      }

      console.log('🧪 Testing database with data:', testCreatorData)
      
      const result = await createOrUpdateCreator(
        currentAccount?.address || 'test-address',
        testCreatorData
      )
      
      setTestResult(`✅ Database test successful! Created creator with ID: ${result.id}`)
      console.log('✅ Database test result:', result)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setTestResult(`❌ Database test failed: ${errorMessage}`)
      console.error('❌ Database test error:', error)
    } finally {
      setIsTestingDatabase(false)
    }
  }

  const testCreatorCreation = async () => {
    setIsTestingCreator(true)
    setTestResult('Testing creator creation through context...')
    
    try {
      const testCreator = {
        id: `test-${Date.now()}`,
        creatorAddress: currentAccount?.address || '0x0000000000000000000000000000000000000000', // Add required creatorAddress field
        name: 'Test Creator Channel',
        username: 'test_creator',
        avatar: '/api/placeholder/64/64',
        role: 'Test Expert',
        tier: 'PRO' as const,
        subscribers: 0,
        category: 'Testing',
        categories: ['Testing', 'Development'],
        channels: [{
          id: 'test-channel-1',
          name: 'Test Channel',
          type: 'free' as const,
          price: 0,
          description: 'Test channel description',
          subscribers: 0,

        }],
        contentTypes: ['Testing'],
        verified: false,
        languages: ['English'],
        availability: {
          hasLimit: false,
          status: 'available' as const
        },
        socialLinks: {},
        bannerColor: '#4DA2FF'
      }

      console.log('🧪 Testing creator creation with:', testCreator)
      
      await addCreator(testCreator)
      
      setTestResult(`✅ Creator creation test successful!`)
      console.log('✅ Creator creation test completed')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setTestResult(`❌ Creator creation test failed: ${errorMessage}`)
      console.error('❌ Creator creation test error:', error)
    } finally {
      setIsTestingCreator(false)
    }
  }

  return (
    <Card className="enhanced-card mb-6">
      <CardHeader>
        <CardTitle className="text-white">🔧 Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-[#C0E6FF] mb-2">Wallet Status</h4>
            <Badge variant={currentAccount ? "default" : "destructive"}>
              {currentAccount ? `Connected: ${currentAccount.address.slice(0, 8)}...` : 'Not Connected'}
            </Badge>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#C0E6FF] mb-2">User Tier</h4>
            <Badge variant="outline" className="text-white">
              {tier}
            </Badge>
          </div>
        </div>

        {/* Database Status */}
        <div>
          <h4 className="text-sm font-medium text-[#C0E6FF] mb-2">Database Status</h4>
          <div className="flex items-center gap-2">
            <Badge variant={error ? "destructive" : "default"}>
              {isLoading ? 'Loading...' : error ? 'Error' : `${creators.length} creators loaded`}
            </Badge>
            {error && (
              <span className="text-red-400 text-xs">{error}</span>
            )}
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={testDatabaseConnection}
            disabled={isTestingDatabase || !currentAccount}
            size="sm"
            variant="outline"
            className="border-[#C0E6FF] text-[#C0E6FF] hover:bg-[#4DA2FF]/20"
          >
            {isTestingDatabase ? 'Testing DB...' : 'Test Database'}
          </Button>
          
          <Button
            onClick={testCreatorCreation}
            disabled={isTestingCreator || !currentAccount}
            size="sm"
            variant="outline"
            className="border-[#C0E6FF] text-[#C0E6FF] hover:bg-[#4DA2FF]/20"
          >
            {isTestingCreator ? 'Testing Creator...' : 'Test Creator'}
          </Button>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="mt-4 p-3 bg-[#1a2f51] rounded-lg">
            <h4 className="text-sm font-medium text-[#C0E6FF] mb-1">Test Result:</h4>
            <p className="text-xs text-white font-mono">{testResult}</p>
          </div>
        )}

        {/* Environment Check */}
        <div className="mt-4 p-3 bg-[#1a2f51] rounded-lg">
          <h4 className="text-sm font-medium text-[#C0E6FF] mb-2">Environment Check:</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Supabase URL:</span>
              <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? "default" : "destructive"} className="text-xs">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Supabase Key:</span>
              <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "default" : "destructive"} className="text-xs">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Encryption Salt:</span>
              <Badge variant={process.env.NEXT_PUBLIC_ENCRYPTION_SALT ? "default" : "destructive"} className="text-xs">
                {process.env.NEXT_PUBLIC_ENCRYPTION_SALT ? 'Set' : 'Missing'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
