import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [adminUser, setAdminUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadProfile(session.user)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) loadProfile(session.user)
      else {
        setUser(null)
        setAdminUser(null)
        setProfile(null)
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(authUser) {
    setUser(authUser)
    // Try user profile first
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single()
    if (userProfile) {
      setProfile(userProfile)
    } else {
      // Try admin profile
      const { data: adminProfile } = await supabase
        .from('admin_users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single()
      if (adminProfile) setAdminUser(adminProfile)
    }
    setLoading(false)
  }

  async function signIn(phone, password) {
    // Users sign in with phone as email
    const email = `${phone}@somazbet.com`
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function adminSignIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signUp(phone, password, username) {
    const email = `${phone}@somazbet.com`
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (!error && data.user) {
      // Create user profile
      await supabase.from('users').insert({
        auth_id: data.user.id,
        username,
        phone,
        email
      })
    }
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshProfile() {
    if (!user) return
    const { data } = await supabase.from('users').select('*').eq('auth_id', user.id).single()
    if (data) setProfile(data)
  }

  const isAdmin = !!adminUser
  const isUser = !!profile

  return (
    <AuthContext.Provider value={{
      user, profile, adminUser, loading,
      isAdmin, isUser,
      signIn, adminSignIn, signUp, signOut, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
