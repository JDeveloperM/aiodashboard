"use client"

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Debug function to check user profile in database
 */
export async function debugUserProfile(address: string) {
  try {
    console.log(`🔍 Debugging user profile for: ${address}`)
    
    // Check if user profile exists
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('address', address)
      .single()
    
    if (error) {
      console.log('❌ Profile query error:', error)
      if (error.code === 'PGRST116') {
        console.log('📝 Profile does not exist')
        return { exists: false, profile: null, error }
      }
      return { exists: false, profile: null, error }
    }
    
    console.log('✅ Profile found:', profile)
    console.log(`🎯 Current tier in DB: ${profile.role_tier}`)
    
    return { exists: true, profile, error: null }
    
  } catch (error) {
    console.error('❌ Debug error:', error)
    return { exists: false, profile: null, error }
  }
}

/**
 * Debug function to manually update tier
 */
export async function debugUpdateTier(address: string, tier: 'NOMAD' | 'PRO' | 'ROYAL') {
  try {
    console.log(`🔧 Manually updating tier for ${address} to ${tier}`)
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        role_tier: tier,
        updated_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      })
      .eq('address', address)
      .select()
    
    if (error) {
      console.error('❌ Manual tier update failed:', error)
      return { success: false, error }
    }
    
    console.log('✅ Manual tier update successful:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('❌ Manual tier update error:', error)
    return { success: false, error }
  }
}

/**
 * Debug function to create user profile
 */
export async function debugCreateProfile(address: string) {
  try {
    console.log(`➕ Creating profile for: ${address}`)
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        address,
        role_tier: 'NOMAD',
        current_xp: 0,
        total_xp: 0,
        profile_level: 1,
        points: 0,
        kyc_status: 'not_verified',
        achievements_data: [],
        referral_data: {},
        display_preferences: {},
        walrus_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Profile creation failed:', error)
      return { success: false, error }
    }
    
    console.log('✅ Profile created successfully:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('❌ Profile creation error:', error)
    return { success: false, error }
  }
}
