import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY

// Check if environment variables are set
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_KEY')
}

// Create client with service role key and explicit auth configuration
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'apikey': supabaseServiceKey || 'placeholder-key',
        'Authorization': `Bearer ${supabaseServiceKey || 'placeholder-key'}`
      }
    }
  }
)

// Export a helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseServiceKey)
}
