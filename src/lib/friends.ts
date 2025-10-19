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

// Initialize sample users if localStorage is empty or has old users without personalities
const initializeSampleUsers = () => {
  const users = getLocalStorageUsers()

  // Check if we need to reinitialize (empty or old format without personalities/communities)
  const needsUpdate = users.length === 0 || users.length < 25 || !users[0].personality || !users[0].communities;

  if (needsUpdate) {
    const sampleUsers: User[] = [
      {
        id: 'user-1',
        username: 'alexrivera',
        email: 'alex@example.com',
        interests: ['Music', 'Gaming', 'Nature'],
        personality: 'Adventurous and spontaneous, always up for trying new experiences. Has an infectious energy that draws people in.',
        communities: ['Seattle', 'UW']
      },
      {
        id: 'user-2',
        username: 'jordanchen',
        email: 'jordan@example.com',
        interests: ['Art', 'Technology', 'Design'],
        personality: 'Creative perfectionist with an eye for detail. Thoughtful and introspective, loves deep conversations about aesthetics.',
        communities: ['Microsoft', 'Seattle']
      },
      {
        id: 'user-3',
        username: 'samtaylor',
        email: 'sam@example.com',
        interests: ['Coffee', 'Programming', 'Reading'],
        personality: 'Analytical and curious, always learning something new. Calm and methodical, but has a dry sense of humor.',
        communities: ['Microsoft', 'Seattle']
      },
      {
        id: 'user-4',
        username: 'morganlee',
        email: 'morgan@example.com',
        interests: ['Gaming', 'Development', 'Streaming'],
        personality: 'Charismatic entertainer who thrives in the spotlight. Quick-witted and competitive, but supportive of others.',
        communities: ['Microsoft', 'UW']
      },
      {
        id: 'user-5',
        username: 'caseykim',
        email: 'casey@example.com',
        interests: ['Environment', 'Science', 'Sustainability'],
        personality: 'Passionate activist with a gentle soul. Patient teacher who genuinely cares about making the world better.',
        communities: ['UW', 'Seattle']
      },
      {
        id: 'user-6',
        username: 'skylarmorgan',
        email: 'skylar@example.com',
        interests: ['Photography', 'Travel', 'Hiking'],
        personality: 'Free-spirited wanderer who finds beauty everywhere. Optimistic and easygoing, lives in the moment.',
        communities: ['Seattle']
      },
      {
        id: 'user-7',
        username: 'ethanpatel',
        email: 'ethan@example.com',
        interests: ['AI', 'Startups', 'Innovation'],
        personality: 'Ambitious visionary with big ideas. Talks fast, thinks faster, and always three steps ahead.',
        communities: ['Microsoft', 'UW']
      },
      {
        id: 'user-8',
        username: 'mayarobinson',
        email: 'maya@example.com',
        interests: ['Singing', 'Piano', 'Songwriting'],
        personality: 'Emotional and expressive artist. Wears heart on sleeve and connects through vulnerability.',
        communities: ['Seattle', 'UW']
      },
      {
        id: 'user-9',
        username: 'marcuslee',
        email: 'marcus@example.com',
        interests: ['Fitness', 'Nutrition', 'Yoga'],
        personality: 'Disciplined go-getter with unwavering dedication. Motivational and encouraging, but knows when to rest.',
        communities: ['Seattle']
      },
      {
        id: 'user-10',
        username: 'emmawilliams',
        email: 'emma@example.com',
        interests: ['Literature', 'Writing', 'Poetry'],
        personality: 'Quiet intellectual who sees magic in words. Empathetic listener with a rich inner world.',
        communities: ['UW', 'Seattle']
      },
      {
        id: 'user-11',
        username: 'oliverbrown',
        email: 'oliver@example.com',
        interests: ['Cooking', 'Food', 'Restaurants'],
        personality: 'Passionate foodie who loves sharing culinary adventures. Warm and welcoming, treats friends like family.',
        communities: ['Seattle']
      },
      {
        id: 'user-12',
        username: 'lunawilson',
        email: 'luna@example.com',
        interests: ['Astronomy', 'Philosophy', 'Meditation'],
        personality: 'Spiritual seeker fascinated by life\'s big questions. Calm presence that makes others feel grounded.',
        communities: ['UW']
      },
      {
        id: 'user-13',
        username: 'jakeanderson',
        email: 'jake@example.com',
        interests: ['Stand-up', 'Movies', 'Memes'],
        personality: 'Class clown who finds humor in everything. Uses laughter to connect and lighten the mood.',
        communities: ['Seattle', 'UW']
      },
      {
        id: 'user-14',
        username: 'zoethomas',
        email: 'zoe@example.com',
        interests: ['Animals', 'Veterinary', 'Wildlife'],
        personality: 'Nurturing caretaker with endless patience. Compassionate soul who sees the good in everyone.',
        communities: ['UW', 'Seattle']
      },
      {
        id: 'user-15',
        username: 'diegomartinez',
        email: 'diego@example.com',
        interests: ['Dancing', 'Festivals', 'EDM'],
        personality: 'Energetic party-starter who lives for the beat. Uninhibited and joyful, brings people together.',
        communities: ['Seattle']
      },
      {
        id: 'user-16',
        username: 'sophiagarcia',
        email: 'sophia@example.com',
        interests: ['Psychology', 'Therapy', 'Self-help'],
        personality: 'Reflective empath who loves understanding people. Great listener with wisdom beyond their years.',
        communities: ['UW', 'Microsoft']
      },
      {
        id: 'user-17',
        username: 'isaiahmoore',
        email: 'isaiah@example.com',
        interests: ['Fashion', 'Streetwear', 'Thrifting'],
        personality: 'Trendsetter with bold personal style. Confident and expressive, not afraid to stand out.',
        communities: ['Seattle']
      },
      {
        id: 'user-18',
        username: 'liamjackson',
        email: 'liam@example.com',
        interests: ['Hacking', 'Open Source', 'Linux'],
        personality: 'Problem-solver who lives for complex challenges. Introverted but loyal, shows care through actions.',
        communities: ['Microsoft', 'UW']
      },
      {
        id: 'user-19',
        username: 'avathompson',
        email: 'ava@example.com',
        interests: ['Board Games', 'Strategy', 'D&D'],
        personality: 'Strategic thinker who enjoys collaborative fun. Inclusive host who makes everyone feel welcome.',
        communities: ['UW', 'Seattle']
      },
      {
        id: 'user-20',
        username: 'noahwhite',
        email: 'noah@example.com',
        interests: ['Architecture', 'Urbex', 'History'],
        personality: 'Curious adventurer fascinated by hidden stories. Respectful risk-taker with a sense of wonder.',
        communities: ['Seattle', 'UW']
      },
      {
        id: 'user-21',
        username: 'miajohnson',
        email: 'mia@example.com',
        interests: ['Gardening', 'Botany', 'Sustainability'],
        personality: 'Patient nurturer who finds peace in growth. Gentle and grounded, radiates calm energy.',
        communities: ['Seattle', 'UW']
      },
      {
        id: 'user-22',
        username: 'ryanharris',
        email: 'ryan@example.com',
        interests: ['Motorcycles', 'Adventure', 'Vlogging'],
        personality: 'Thrill-seeker with a need for speed. Independent spirit who documents every journey.',
        communities: ['Seattle']
      },
      {
        id: 'user-23',
        username: 'claramartin',
        email: 'clara@example.com',
        interests: ['Vinyl', 'Jazz', 'Audio'],
        personality: 'Nostalgic audiophile who appreciates authenticity. Particular about quality, generous with knowledge.',
        communities: ['Seattle']
      },
      {
        id: 'user-24',
        username: 'aidendavis',
        email: 'aiden@example.com',
        interests: ['Rock Climbing', 'Bouldering', 'Outdoors'],
        personality: 'Determined athlete who loves overcoming obstacles. Supportive team player, celebrates others\' wins.',
        communities: ['Seattle', 'UW']
      },
      {
        id: 'user-25',
        username: 'harperrodriguez',
        email: 'harper@example.com',
        interests: ['Remote Work', 'Travel', 'Minimalism'],
        personality: 'Adaptable free spirit who thrives on change. Practical dreamer making location-independent life work.',
        communities: ['Microsoft', 'Seattle']
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