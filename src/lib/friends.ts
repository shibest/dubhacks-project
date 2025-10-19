import { supabase, isSupabaseConfigured, User, Friend, getLocalStorageUsers, getLocalStorageFriends, saveUsersToLocalStorage, saveFriendsToLocalStorage, generateId } from './supabase'

// Get current user ID from sessionStorage
export const getCurrentUserId = (): string | null => {
  // For demo purposes, return a default user ID if none exists
  let userId = sessionStorage.getItem('activeUserId')
  if (!userId) {
    userId = 'user-current' // Default user for demo
    sessionStorage.setItem('activeUserId', userId)
  }
  return userId
}

// Initialize sample users if localStorage is empty
const initializeSampleUsers = () => {
  const users = getLocalStorageUsers()
  if (users.length === 0) {
    const sampleUsers: User[] = [
      {
        id: 'user-1',
        username: 'alexrivera',
        email: 'alex@example.com',
        interests: ['Music', 'Gaming', 'Nature']
      },
      {
        id: 'user-2',
        username: 'jordanchen',
        email: 'jordan@example.com',
        interests: ['Art', 'Technology', 'Design']
      },
      {
        id: 'user-3',
        username: 'samtaylor',
        email: 'sam@example.com',
        interests: ['Coffee', 'Programming', 'Reading']
      },
      {
        id: 'user-4',
        username: 'morganlee',
        email: 'morgan@example.com',
        interests: ['Gaming', 'Development', 'Streaming']
      },
      {
        id: 'user-5',
        username: 'caseykim',
        email: 'casey@example.com',
        interests: ['Environment', 'Science', 'Sustainability']
      }
    ]
    saveUsersToLocalStorage(sampleUsers)
    return sampleUsers
  }
  return users
}

// Get all users (for discovery)
export const getAllUsers = async (): Promise<User[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')

    if (error) {
      console.error('Error fetching users:', error)
      return initializeSampleUsers()
    }

    return data || []
  }

  return initializeSampleUsers()
}

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return getLocalStorageUsers().find((u: User) => u.id === userId) || null
    }

    return data
  }

  return getLocalStorageUsers().find((u: User) => u.id === userId) || null
}

// Add friend
export const addFriend = async (currentUserId: string, friendUserId: string): Promise<boolean> => {
  if (currentUserId === friendUserId) return false

  // Check if already friends
  const existingFriends = await getFriends(currentUserId)
  if (existingFriends.some(f => f.id === friendUserId)) return false

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('friends')
      .insert({
        user_id: currentUserId,
        friend_id: friendUserId
      })

    if (error) {
      console.error('Error adding friend:', error)
      return false
    }

    return true
  }

  // localStorage fallback
  const newFriend: Friend = {
    id: generateId(),
    user_id: currentUserId,
    friend_id: friendUserId
  }

  const updatedFriends = [...getLocalStorageFriends(), newFriend]
  saveFriendsToLocalStorage(updatedFriends)
  return true
}

// Remove friend
export const removeFriend = async (currentUserId: string, friendUserId: string): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${currentUserId},friend_id.eq.${friendUserId}),and(user_id.eq.${friendUserId},friend_id.eq.${currentUserId})`)

    if (error) {
      console.error('Error removing friend:', error)
      return false
    }

    return true
  }

  // localStorage fallback
  const updatedFriends = getLocalStorageFriends().filter((f: Friend) =>
    !(f.user_id === currentUserId && f.friend_id === friendUserId) &&
    !(f.user_id === friendUserId && f.friend_id === currentUserId)
  )
  saveFriendsToLocalStorage(updatedFriends)
  return true
}

// Get friends for a user
export const getFriends = async (userId: string): Promise<User[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        friend:friend_id (
          id,
          username,
          email,
          interests
        )
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching friends:', error)
      // Fallback to localStorage
      const friendIds = getLocalStorageFriends()
        .filter((f: Friend) => f.user_id === userId)
        .map((f: Friend) => f.friend_id)

      return getLocalStorageUsers().filter((u: User) => friendIds.includes(u.id))
    }

    return (data?.map((item: any) => item.friend).filter(Boolean) as User[]) || []
  }

  // localStorage fallback
  const friendIds = getLocalStorageFriends()
    .filter((f: Friend) => f.user_id === userId)
    .map((f: Friend) => f.friend_id)

  return getLocalStorageUsers().filter((u: User) => friendIds.includes(u.id))
}

// Check if two users are friends
export const areFriends = async (userId1: string, userId2: string): Promise<boolean> => {
  const friends = await getFriends(userId1)
  return friends.some(friend => friend.id === userId2)
}

// Create or update user profile
export const upsertUser = async (user: Partial<User>): Promise<User | null> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Error upserting user:', error)
      return null
    }

    return data
  }

  // localStorage fallback
  const users = getLocalStorageUsers()
  let existingUserIndex = users.findIndex((u: User) => u.id === user.id)
  if (existingUserIndex >= 0) {
    users[existingUserIndex] = { ...users[existingUserIndex], ...user }
  } else {
    const newUser: User = {
      id: user.id || generateId(),
      username: user.username || '',
      email: user.email || '',
      interests: user.interests || []
    }
    users.push(newUser)
    existingUserIndex = users.length - 1
  }

  saveUsersToLocalStorage(users)
  return users[existingUserIndex]
}