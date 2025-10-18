// src/api/trakt.js
const BACKEND_URL = 'http://localhost:5000';

export const getTraktData = async (endpoint, accessToken) => {
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

// Example: Get user's watchlist
export const getUserWatchlist = (accessToken) => {
  return getTraktData('/sync/watchlist/shows', accessToken);
};

// Example: Get user's watched history
export const getUserHistory = (accessToken) => {
  return getTraktData('/sync/history', accessToken);
};