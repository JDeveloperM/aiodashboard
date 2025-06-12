import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          id: string
          content: string
          user_id: string
          user_name: string
          user_avatar?: string
          room_name: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          user_name: string
          user_avatar?: string
          room_name: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          user_name?: string
          user_avatar?: string
          room_name?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
