import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import toast from 'react-hot-toast'
import { defaultCategories } from '../utils/helpers'

export function useAuth() {
  const { user, profile, setUser, setProfile } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Failsafe timeout: paksa loading berhenti setelah 3 detik jika Supabase nyangkut
    const failsafe = setTimeout(() => setLoading(false), 3000)

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error)
      }
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
    }).catch(err => {
      console.error('Failed to get session:', err)
    }).finally(() => {
      clearTimeout(failsafe)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          if (event === 'SIGNED_IN') {
            await ensureProfile(session.user)
          }
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data)
      if (data.currency) {
        useStore.getState().setCurrency(data.currency)
      }
    }
  }

  const ensureProfile = async (user) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!data) {
        // Create profile
        await supabase.from('profiles').insert({
          id: user.id,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || null,
          currency: 'IDR',
        })

        // Insert default categories
        const cats = defaultCategories.map(c => ({
          user_id: user.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          type: c.type,
          is_default: true,
        }))
        await supabase.from('categories').insert(cats)
      }
    } catch (err) {
      console.error('Failed to ensure profile', err)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    })
    if (error) throw error
    
    if (data.session) {
      await ensureProfile(data.user)
    }
    
    return data
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    })
    if (error) throw error
    return data
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Logout error', err)
    } finally {
      // Forcefully clear all Supabase local storage keys as a fallback
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key)
        }
      })
      setUser(null)
      setProfile(null)
    }
  }

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) throw error
    setProfile(data)
    return data
  }

  const uploadAvatar = async (file) => {
    const ext = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${ext}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })
    
    if (uploadError) throw uploadError
    
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    await updateProfile({ avatar_url: urlData.publicUrl })
    return urlData.publicUrl
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
    fetchProfile,
  }
}
