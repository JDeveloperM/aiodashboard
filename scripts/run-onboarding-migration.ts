/**
 * Run the onboarding completion migration
 * This adds the onboarding_completed and onboarding_completed_at fields to the user_profiles table
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function runMigration() {
  console.log('🔧 Running onboarding completion migration...')
  
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/add_onboarding_completed.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📋 Migration SQL:')
    console.log(migrationSQL)
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      return false
    }
    
    console.log('✅ Migration completed successfully')
    
    // Test the new columns
    console.log('\n🧪 Testing new columns...')
    const { data, error: testError } = await supabase
      .from('user_profiles')
      .select('address, onboarding_completed, onboarding_completed_at, points')
      .limit(1)
    
    if (testError) {
      console.error('❌ Test query failed:', testError)
      return false
    }
    
    console.log('✅ New columns are working correctly')
    console.log('📊 Sample data:', data)
    
    return true
  } catch (error) {
    console.error('❌ Migration error:', error)
    return false
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  async function main() {
    console.log('🚀 Starting onboarding migration...')
    
    const success = await runMigration()
    if (!success) {
      console.log('\n❌ Migration failed. Please check your database connection and permissions.')
      process.exit(1)
    }
    
    console.log('\n🎉 Migration completed successfully!')
    console.log('📝 The onboarding system now uses database-only tracking.')
    process.exit(0)
  }
  
  main().catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
}

export { runMigration }
