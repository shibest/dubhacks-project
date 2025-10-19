import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Check if Supabase is configured
export const isSupabaseConfigured = () => !!supabase

// Types for our database schema
export interface User {
  id: string
  username: string
  email?: string
  interests: string[]
  created_at?: string
}

export interface Friend {
  id: string
  user_id: string
  friend_id: string
  created_at?: string
}

// localStorage fallback functions
export const localStorageUsers: User[] = JSON.parse(localStorage.getItem('mycelius_users') || '[]')
export const localStorageFriends: Friend[] = JSON.parse(localStorage.getItem('mycelius_friends') || '[]')

// Save to localStorage
export const saveUsersToLocalStorage = (users: User[]) => {
  localStorage.setItem('mycelius_users', JSON.stringify(users))
}

export const saveFriendsToLocalStorage = (friends: Friend[]) => {
  localStorage.setItem('mycelius_friends', JSON.stringify(friends))
}

// Generate UUID for localStorage fallback
export const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}