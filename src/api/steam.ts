const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const getSteamData = async <T = any>(endpoint: string): Promise<T> => {
  const response = await fetch(`${BACKEND_URL}/steam${endpoint}`);

  if (!response.ok) {
    throw new Error('Failed to fetch Steam data');
  }

  return response.json();
};

// Get player profile/summary
export const getPlayerSummary = (steamId: string) => {
  return getSteamData(`/player/summaries/${steamId}`);
};

// Get owned games
export const getOwnedGames = (steamId: string, includeAppInfo: boolean = true, includeFreegames: boolean = true) => {
  const params = new URLSearchParams({
    include_appinfo: includeAppInfo ? '1' : '0',
    include_played_free_games: includeFreegames ? '1' : '0'
  });
  return getSteamData(`/player/games/${steamId}?${params}`);
};

// Get recently played games
export const getRecentlyPlayedGames = (steamId: string, count: number = 10) => {
  return getSteamData(`/player/recent/${steamId}?count=${count}`);
};

// Get player achievements for a specific game
export const getPlayerAchievements = (steamId: string, appId: string) => {
  return getSteamData(`/player/achievements/${steamId}/${appId}`);
};

// Get user stats for a specific game
export const getUserStatsForGame = (steamId: string, appId: string) => {
  return getSteamData(`/player/stats/${steamId}/${appId}`);
};

// Get friend list
export const getFriendList = (steamId: string) => {
  return getSteamData(`/player/friends/${steamId}`);
};
