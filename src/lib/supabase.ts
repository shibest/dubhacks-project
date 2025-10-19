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
  personality?: string
  created_at?: string
}

export interface Friend {
  id: string
  user_id: string
  friend_id: string
  created_at?: string
}

// localStorage fallback functions - use getters to always get fresh data
export const getLocalStorageUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('mycelius_users') || '[]')
}

export const getLocalStorageFriends = (): Friend[] => {
  return JSON.parse(localStorage.getItem('mycelius_friends') || '[]')
}

// For backwards compatibility - but these now call the getters
export const localStorageUsers = new Proxy({} as User[], {
  get(_target, prop) {
    const users = getLocalStorageUsers()
    return users[prop as any]
  },
  has(_target, prop) {
    const users = getLocalStorageUsers()
    return prop in users
  },
  ownKeys() {
    const users = getLocalStorageUsers()
    return Reflect.ownKeys(users)
  },
  getOwnPropertyDescriptor(_target, prop) {
    const users = getLocalStorageUsers()
    return Object.getOwnPropertyDescriptor(users, prop)
  }
})

export const localStorageFriends = new Proxy({} as Friend[], {
  get(_target, prop) {
    const friends = getLocalStorageFriends()
    return friends[prop as any]
  },
  has(_target, prop) {
    const friends = getLocalStorageFriends()
    return prop in friends
  },
  ownKeys() {
    const friends = getLocalStorageFriends()
    return Reflect.ownKeys(friends)
  },
  getOwnPropertyDescriptor(_target, prop) {
    const friends = getLocalStorageFriends()
    return Object.getOwnPropertyDescriptor(friends, prop)
  }
})

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