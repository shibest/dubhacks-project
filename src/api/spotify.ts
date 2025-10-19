const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const getSpotifyData = async <T = any>(endpoint: string, accessToken: string | null): Promise<T> => {
  const response = await fetch(`${BACKEND_URL}/api/spotify${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (response.status === 401) {
    // Token expired, trigger refresh
    throw new Error('TOKEN_EXPIRED');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch Spotify data');
  }

  return response.json();
};

// Get current user's profile
export const getUserProfile = (accessToken: string | null) => {
  return getSpotifyData('/me', accessToken);
};

// Get user's top artists
export const getUserTopArtists = (accessToken: string | null, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20) => {
  return getSpotifyData(`/me/top/artists?time_range=${timeRange}&limit=${limit}`, accessToken);
};

// Get user's top tracks
export const getUserTopTracks = (accessToken: string | null, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20) => {
  return getSpotifyData(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`, accessToken);
};

// Get user's recently played tracks
export const getRecentlyPlayed = (accessToken: string | null, limit: number = 50) => {
  return getSpotifyData(`/me/player/recently-played?limit=${limit}`, accessToken);
};

// Get user's saved tracks (liked songs)
export const getUserSavedTracks = (accessToken: string | null, limit: number = 50, offset: number = 0) => {
  return getSpotifyData(`/me/tracks?limit=${limit}&offset=${offset}`, accessToken);
};

// Get user's playlists
export const getUserPlaylists = (accessToken: string | null, limit: number = 50, offset: number = 0) => {
  return getSpotifyData(`/me/playlists?limit=${limit}&offset=${offset}`, accessToken);
};

// Get user's currently playing track
export const getCurrentlyPlaying = (accessToken: string | null) => {
  return getSpotifyData('/me/player/currently-playing', accessToken);
};

// Get user's followed artists
export const getFollowedArtists = (accessToken: string | null, limit: number = 50) => {
  return getSpotifyData(`/me/following?type=artist&limit=${limit}`, accessToken);
};
