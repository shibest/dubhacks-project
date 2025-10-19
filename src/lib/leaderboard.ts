// Utility functions for managing leaderboard stats

export interface LeaderboardStats {
  totalPoints: number;
  gamesPlayed: number;
  hotTakesScore: number;
  friendsCount: number;
  winRate: number;
  streak: number;
}

// Get current user's stats
export const getUserStats = (): LeaderboardStats => {
  const saved = localStorage.getItem('user_leaderboard_stats');
  if (saved) {
    return JSON.parse(saved);
  }
  // Default stats for new users
  const defaultStats: LeaderboardStats = {
    totalPoints: 1250,
    gamesPlayed: 12,
    hotTakesScore: 850,
    friendsCount: 3,
    winRate: 65,
    streak: 5
  };
  localStorage.setItem('user_leaderboard_stats', JSON.stringify(defaultStats));
  return defaultStats;
};

// Save user stats
export const saveUserStats = (stats: LeaderboardStats): void => {
  localStorage.setItem('user_leaderboard_stats', JSON.stringify(stats));
};

// Update specific stat fields
export const updateUserStats = (updates: Partial<LeaderboardStats>): LeaderboardStats => {
  const currentStats = getUserStats();
  const newStats = { ...currentStats, ...updates };
  saveUserStats(newStats);
  return newStats;
};

// Add points to total
export const addPoints = (points: number): void => {
  const stats = getUserStats();
  stats.totalPoints += points;
  saveUserStats(stats);
};

// Increment games played
export const incrementGamesPlayed = (): void => {
  const stats = getUserStats();
  stats.gamesPlayed += 1;
  saveUserStats(stats);
};

// Update hot takes score
export const updateHotTakesScore = (score: number): void => {
  const stats = getUserStats();
  stats.hotTakesScore += score;
  saveUserStats(stats);
};

// Update win rate (pass true for win, false for loss)
export const updateWinRate = (won: boolean): void => {
  const stats = getUserStats();
  const totalGames = stats.gamesPlayed;
  const currentWins = Math.round((stats.winRate / 100) * totalGames);
  const newWins = won ? currentWins + 1 : currentWins;
  const newGames = totalGames + 1;
  stats.winRate = Math.round((newWins / newGames) * 100);
  saveUserStats(stats);
};

// Update streak
export const updateStreak = (won: boolean): void => {
  const stats = getUserStats();
  if (won) {
    stats.streak += 1;
  } else {
    stats.streak = 0;
  }
  saveUserStats(stats);
};

// Complete a game (increments games played, updates win/loss, updates streak)
export const completeGame = (won: boolean, pointsEarned: number): void => {
  const stats = getUserStats();

  // Increment games played
  stats.gamesPlayed += 1;

  // Add points
  stats.totalPoints += pointsEarned;

  // Update win rate
  const totalGames = stats.gamesPlayed;
  const previousWins = Math.round((stats.winRate / 100) * (totalGames - 1));
  const newWins = won ? previousWins + 1 : previousWins;
  stats.winRate = Math.round((newWins / totalGames) * 100);

  // Update streak
  if (won) {
    stats.streak += 1;
  } else {
    stats.streak = 0;
  }

  saveUserStats(stats);
};

// Complete a hot takes game specifically
export const completeHotTakesGame = (won: boolean, score: number): void => {
  const stats = getUserStats();

  // Increment games played
  stats.gamesPlayed += 1;

  // Add to hot takes score
  stats.hotTakesScore += score;

  // Add points (hot takes games give score as points)
  stats.totalPoints += score;

  // Update win rate
  const totalGames = stats.gamesPlayed;
  const previousWins = Math.round((stats.winRate / 100) * (totalGames - 1));
  const newWins = won ? previousWins + 1 : previousWins;
  stats.winRate = Math.round((newWins / totalGames) * 100);

  // Update streak
  if (won) {
    stats.streak += 1;
  } else {
    stats.streak = 0;
  }

  saveUserStats(stats);
};

// Update friends count (called when adding/removing friends)
export const updateFriendsCount = (count: number): void => {
  const stats = getUserStats();
  stats.friendsCount = count;
  saveUserStats(stats);
};
