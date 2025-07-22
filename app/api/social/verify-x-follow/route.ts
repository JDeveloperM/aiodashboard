import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/social/verify-x-follow
 * Verify if a user is following @AIONET_Official on X (Twitter)
 */
export async function POST(request: NextRequest) {
  try {
    const { userAddress, xUsername } = await request.json()

    if (!userAddress || !xUsername) {
      return NextResponse.json(
        { error: 'Missing required fields: userAddress, xUsername' },
        { status: 400 }
      )
    }

    console.log('🔍 Verifying X follow for:', { userAddress, xUsername })

    // In a real implementation, you would:
    // 1. Use X API v2 to check if the user follows @AIONET_Official
    // 2. Verify the user owns the X account (OAuth or other verification)
    // 3. Update the user's social links with verification status

    // Mock verification logic for demo purposes
    const isFollowing = await mockVerifyXFollow(xUsername)

    if (isFollowing) {
      // Update user's social links in the database
      const success = await updateUserSocialLinks(userAddress, xUsername, true)
      
      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Successfully verified X follow',
          following: true
        })
      } else {
        return NextResponse.json(
          { error: 'Failed to update user profile' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json({
        success: false,
        message: 'User is not following @AIONET_Official',
        following: false
      })
    }

  } catch (error) {
    console.error('Error verifying X follow:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Mock function to simulate X API follow verification
 * In production, replace this with actual X API calls
 */
async function mockVerifyXFollow(xUsername: string): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // For demo purposes, return true for any username
  // In production, this would make actual API calls to X
  console.log(`📱 Mock: Checking if ${xUsername} follows @AIONET_Official`)
  
  // You could implement actual X API verification here:
  /*
  const twitterApi = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  })

  try {
    const user = await twitterApi.v2.userByUsername(xUsername.replace('@', ''))
    if (!user.data) return false

    const following = await twitterApi.v2.following(user.data.id, {
      'user.fields': ['username']
    })
    
    return following.data?.some(followedUser => 
      followedUser.username.toLowerCase() === 'aionet_official'
    ) || false
  } catch (error) {
    console.error('X API error:', error)
    return false
  }
  */

  // For demo, return true
  return true
}

/**
 * Update user's social links in the database
 */
async function updateUserSocialLinks(
  userAddress: string, 
  xUsername: string, 
  isFollowing: boolean
): Promise<boolean> {
  try {
    // Get current user profile
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('social_links')
      .eq('address', userAddress)
      .single()

    if (fetchError) {
      console.error('Error fetching user profile:', fetchError)
      return false
    }

    // Update or add X social link
    const currentSocialLinks = profile?.social_links || []
    const updatedSocialLinks = currentSocialLinks.map((link: any) => {
      if (link.platform === 'X') {
        return {
          ...link,
          username: xUsername,
          verified: true,
          following_aionet: isFollowing,
          profile_url: `https://twitter.com/${xUsername.replace('@', '')}`
        }
      }
      return link
    })

    // If no X link exists, add one
    const hasXLink = currentSocialLinks.some((link: any) =>
      link.platform === 'X'
    )

    if (!hasXLink) {
      updatedSocialLinks.push({
        platform: 'X',
        username: xUsername,
        verified: true,
        following_aionet: isFollowing,
        profile_url: `https://twitter.com/${xUsername.replace('@', '')}`
      })
    }

    // Update the profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        social_links: updatedSocialLinks,
        updated_at: new Date().toISOString()
      })
      .eq('address', userAddress)

    if (updateError) {
      console.error('Error updating social links:', updateError)
      return false
    }

    console.log('✅ Successfully updated social links for:', userAddress)
    return true

  } catch (error) {
    console.error('Error updating user social links:', error)
    return false
  }
}

/**
 * GET /api/social/verify-x-follow
 * Get verification status for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')

    if (!userAddress) {
      return NextResponse.json(
        { error: 'Missing userAddress parameter' },
        { status: 400 }
      )
    }

    // Get user's social links
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('social_links')
      .eq('address', userAddress)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const xLink = profile?.social_links?.find((link: any) =>
      link.platform === 'X'
    )

    return NextResponse.json({
      hasXAccount: !!xLink,
      isVerified: xLink?.verified || false,
      isFollowing: xLink?.following_aionet || false,
      username: xLink?.username || null
    })

  } catch (error) {
    console.error('Error getting verification status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
