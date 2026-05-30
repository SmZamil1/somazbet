import { createClient } from '@supabase/supabase-js'

// ⚠️ REPLACE THESE WITH YOUR SUPABASE CREDENTIALS
// Found in: Supabase Dashboard → Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nzxifezbmsxlhfknfiat.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGlmZXpibXN4bGhma25maWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTc5ODgsImV4cCI6MjA5NTY5Mzk4OH0.iEeQCZI4qKcf9WLN07O5cZRmJK3HUkQUMnVCEiUMyJc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Helper: get current user profile
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('*').eq('auth_id', user.id).single()
  return data
}

// Helper: get current admin profile
export async function getCurrentAdmin() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('admin_users').select('*').eq('auth_id', user.id).single()
  return data
}
