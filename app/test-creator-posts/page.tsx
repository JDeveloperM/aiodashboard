"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { forumService } from '@/lib/forum-service'

export default function TestCreatorPosts() {
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<string>('')

  const createTestPosts = async () => {
    setIsCreating(true)
    setResult('Creating test posts...\n')

    try {
      const testCreator = '0x123456789abcdef'
      const testChannelId = 'test_channel_123'
      const channelName = 'Crypto Trading Insights'

      // First, create a user profile for the test creator
      setResult(prev => prev + 'Creating test user profile...\n')
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        'https://cwhhtzbuwzigehpaokqi.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3aGh0emJ1d3ppZ2VocGFva3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE0NzQsImV4cCI6MjA1MDU0NzQ3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
      )

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          address: testCreator,
          username: 'CryptoTrader123',
          tier: 'PRO',
          avatar_url: '/images/animepfp/1.png',
          role_tier: 'PRO',
          profile_level: 5,
          current_xp: 1250,
          total_xp: 1250,
          points: 500,
          kyc_status: 'verified',
          onboarding_completed: true
        })
        .select()

      if (profileError) {
        setResult(prev => prev + `Profile error: ${profileError.message}\n`)
      } else {
        setResult(prev => prev + 'Profile created successfully!\n')
      }
      
      // Create first post
      setResult(prev => prev + 'Creating first post...\n')
      const post1 = await forumService.createCreatorChannelPost(
        testCreator,
        testChannelId,
        {
          title: 'Welcome to my Trading Channel!',
          content: 'Hey everyone! Welcome to my exclusive trading channel. Here I\'ll be sharing daily market analysis, trading strategies, and risk management tips. Make sure to turn on notifications!',
          isPinned: true,
          publishNow: true,
          channelName: channelName
        }
      )
      setResult(prev => prev + `Post 1 result: ${JSON.stringify(post1)}\n`)
      
      // Create second post
      setResult(prev => prev + 'Creating second post...\n')
      const post2 = await forumService.createCreatorChannelPost(
        testCreator,
        testChannelId,
        {
          title: 'SUI Token Analysis - Bullish Outlook',
          content: 'Based on my technical analysis of SUI token:\n\n📈 Key Levels:\n• Support: $2.80\n• Resistance: $3.50\n• Target: $4.20\n\n📊 Indicators:\n• RSI showing bullish divergence\n• Volume increasing steadily\n• Breaking above 50 MA\n\nWhat are your thoughts on SUI?',
          isPinned: false,
          publishNow: true,
          channelName: channelName
        }
      )
      setResult(prev => prev + `Post 2 result: ${JSON.stringify(post2)}\n`)
      
      // Create third post
      setResult(prev => prev + 'Creating third post...\n')
      const post3 = await forumService.createCreatorChannelPost(
        testCreator,
        testChannelId,
        {
          title: 'Weekly DeFi Opportunities',
          content: 'This week I\'m watching these DeFi protocols:\n\n🔥 Hot Picks:\n1. Uniswap (UNI) - V4 launch approaching\n2. Aave (AAVE) - Strong fundamentals\n3. Compound (COMP) - Undervalued\n\nRemember: DYOR (Do Your Own Research)!',
          isPinned: false,
          publishNow: true,
          channelName: channelName
        }
      )
      setResult(prev => prev + `Post 3 result: ${JSON.stringify(post3)}\n`)
      
      setResult(prev => prev + '\n🎉 All test posts created successfully!\n')
      setResult(prev => prev + 'You can now view them at: /forum?tab=creators&creatorId=0x123456789abcdef&channelId=test_channel_123&creatorName=CryptoTrader123&channelName=Crypto Trading Insights\n')
      
    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error}\n`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Creator Posts</h1>
      
      <Button 
        onClick={createTestPosts} 
        disabled={isCreating}
        className="mb-4"
      >
        {isCreating ? 'Creating...' : 'Create Test Creator Posts'}
      </Button>
      
      <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
        {result}
      </pre>
      
      <div className="mt-4">
        <a 
          href="/forum?tab=creators&creatorId=0x123456789abcdef&channelId=test_channel_123&creatorName=CryptoTrader123&channelName=Crypto%20Trading%20Insights"
          className="text-blue-500 hover:underline"
        >
          View Creator Channel
        </a>
      </div>
    </div>
  )
}
