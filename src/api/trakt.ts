const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const getTraktData = async <T = any>(endpoint: string, accessToken: string | null): Promise<T> => {
  const response = await fetch(`${BACKEND_URL}/api/trakt${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (response.status === 401) {
    // Token expired, trigger refresh
    throw new Error('TOKEN_EXPIRED');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
};

// Get user's watchlist shows
export const getUserWatchlistShows = (accessToken: string | null) => {
  return getTraktData('/sync/watchlist/shows', accessToken);
};

// Get user's watchlist movies
export const getUserWatchlistMovies = (accessToken: string | null) => {
  return getTraktData('/sync/watchlist/movies', accessToken);
};

// Get complete watchlist (shows + movies)
export const getUserWatchlist = async (accessToken: string | null) => {
  const [shows, movies] = await Promise.all([
    getUserWatchlistShows(accessToken),
    getUserWatchlistMovies(accessToken)
  ]);
  return { shows, movies };
};

// Example: Get user's watched history
export const getUserHistory = (accessToken: string | null) => {
  return getTraktData('/sync/history', accessToken);
};
