import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomTaskbar from "@/components/BottomTaskbar";
import { Trophy, Flame, MessageCircle, Users, TrendingUp, Award, Crown } from "lucide-react";
import { getLocalStorageUsers } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/friends";

interface UserStats {
  id: string;
  username: string;
  avatar: string;
  totalPoints: number;
  gamesPlayed: number;
  hotTakesScore: number;
  friendsCount: number;
  winRate: number;
  streak: number;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<UserStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'total' | 'games' | 'hotTakes' | 'friends'>('total');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = () => {
    const users = getLocalStorageUsers();
    const userId = getCurrentUserId();
    setCurrentUserId(userId);

    // Load or initialize current user stats from localStorage
    const getCurrentUserStats = () => {
      const saved = localStorage.getItem('user_leaderboard_stats');
      if (saved) {
        return JSON.parse(saved);
      }
      // Default stats for new users
      return {
        totalPoints: 1250,
        gamesPlayed: 12,
        hotTakesScore: 850,
        friendsCount: 3,
        winRate: 65,
        streak: 5
      };
    };

    const currentUserStats = getCurrentUserStats();

    // Load or generate stats for other users
    const getOtherUserStats = (userId: string) => {
      const saved = localStorage.getItem(`leaderboard_stats_${userId}`);
      if (saved) {
        return JSON.parse(saved);
      }
      // Generate and save new stats for this user
      const newStats = {
        totalPoints: Math.floor(Math.random() * 3000) + 500,
        gamesPlayed: Math.floor(Math.random() * 50) + 5,
        hotTakesScore: Math.floor(Math.random() * 1500) + 200,
        friendsCount: Math.floor(Math.random() * 20) + 1,
        winRate: Math.floor(Math.random() * 40) + 40,
        streak: Math.floor(Math.random() * 15)
      };
      localStorage.setItem(`leaderboard_stats_${userId}`, JSON.stringify(newStats));
      return newStats;
    };

    // Generate stats for each user
    const stats: UserStats[] = users.map((user) => {
      const isCurrentUser = user.id === userId;
      const userStats = isCurrentUser ? currentUserStats : getOtherUserStats(user.id);

      return {
        id: user.id,
        username: user.username,
        avatar: user.username.substring(0, 2).toUpperCase(),
        totalPoints: userStats.totalPoints,
        gamesPlayed: userStats.gamesPlayed,
        hotTakesScore: userStats.hotTakesScore,
        friendsCount: userStats.friendsCount,
        winRate: userStats.winRate,
        streak: userStats.streak
      };
    });

    // Sort by total points initially
    stats.sort((a, b) => b.totalPoints - a.totalPoints);
    setLeaderboardData(stats);
  };

  const handleCommunityClick = () => {
    navigate("/dashboard");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleNavigate = (tab: string) => {
    if (tab === "friends") {
      navigate("/friends");
    } else if (tab === "games") {
      navigate("/games");
    } else if (tab === "home") {
      navigate("/home");
    } else if (tab === "settings") {
      navigate("/settings");
    }
  };

  const getSortedData = () => {
    const sorted = [...leaderboardData];
    switch (selectedCategory) {
      case 'games':
        sorted.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
        break;
      case 'hotTakes':
        sorted.sort((a, b) => b.hotTakesScore - a.hotTakesScore);
        break;
      case 'friends':
        sorted.sort((a, b) => b.friendsCount - a.friendsCount);
        break;
      default:
        sorted.sort((a, b) => b.totalPoints - a.totalPoints);
    }
    return sorted;
  };

  const getStatValue = (user: UserStats) => {
    switch (selectedCategory) {
      case 'games':
        return user.gamesPlayed;
      case 'hotTakes':
        return user.hotTakesScore;
      case 'friends':
        return user.friendsCount;
      default:
        return user.totalPoints;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Award className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-600" />;
    return null;
  };

  const categories = [
    { id: 'total', label: 'Total Points', icon: Trophy },
    { id: 'games', label: 'Games Played', icon: Flame },
    { id: 'hotTakes', label: 'Hot Takes', icon: MessageCircle },
    { id: 'friends', label: 'Friends', icon: Users }
  ];

  return (
    <div
      className={`flex flex-col min-h-screen bg-[hsl(var(--background))] transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ paddingTop: 0 }}
    >
      <Header
        onCommunityClick={handleCommunityClick}
        onProfileClick={handleProfileClick}
      />

      <main className="flex-1 overflow-hidden pb-20">
        <div className="h-full overflow-y-auto">
          <div className="pb-4 pt-4 md:pt-6">
            <div className="max-w-4xl mx-auto px-3 md:px-4">
              {/* Page Title */}
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[hsl(280,95%,52%)] via-[hsl(180,85%,48%)] to-[hsl(90,80%,48%)] bg-clip-text text-transparent flex items-center justify-center gap-2">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  Leaderboard
                </h1>
                <p className="text-center text-[hsl(var(--muted-foreground))] text-sm">
                  See how you rank among other players
                </p>
              </div>

              {/* Category Tabs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as any)}
                    className={`p-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-[hsl(280,95%,52%)] to-[hsl(180,85%,48%)] text-white shadow-lg'
                        : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]'
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                    <span className="sm:hidden">{category.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Top 3 Podium */}
              <div className="mb-8">
                <div className="flex items-end justify-center gap-4 mb-8">
                  {getSortedData().slice(0, 3).map((user, index) => {
                    const rank = index + 1;
                    // Heights: 2nd place (medium), 1st place (tallest), 3rd place (shortest)
                    const heights = ['h-40', 'h-32', 'h-28'];
                    // Order: 2nd (left), 1st (middle), 3rd (right)
                    const podiumOrder = [2, 1, 3][index]; // Maps: 0->2nd, 1->1st, 2->3rd

                    return (
                      <div
                        key={user.id}
                        className={`flex flex-col items-center ${
                          rank === 1 ? 'order-2' : // 1st place in middle
                          rank === 2 ? 'order-1' : // 2nd place on left
                          'order-3' // 3rd place on right
                        }`}
                        style={{ width: '120px' }}
                      >
                        <div className={`relative ${user.id === currentUserId ? 'scale-105' : ''}`}>
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                            rank === 1 ? 'from-yellow-400 to-yellow-600' :
                            rank === 2 ? 'from-gray-300 to-gray-500' :
                            'from-orange-400 to-orange-600'
                          } flex items-center justify-center text-white font-bold text-lg shadow-xl mb-2`}>
                            {user.avatar}
                          </div>
                          {getRankBadge(rank) && (
                            <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-lg">
                              {getRankBadge(rank)}
                            </div>
                          )}
                        </div>
                        <p className={`font-bold text-sm mb-1 text-center ${user.id === currentUserId ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>
                          {user.username}
                          {user.id === currentUserId && ' (You)'}
                        </p>
                        <div className={`${heights[index]} w-full bg-gradient-to-t ${
                          rank === 1 ? 'from-yellow-400 to-yellow-500' :
                          rank === 2 ? 'from-gray-300 to-gray-400' :
                          'from-orange-400 to-orange-500'
                        } rounded-t-lg flex flex-col items-center justify-center text-white font-bold shadow-lg`}>
                          <div className="text-2xl mb-1">{rank}</div>
                          <div className="text-sm">{getStatValue(user)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full Leaderboard List */}
              <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                <div className="p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                  <div className="grid grid-cols-12 gap-2 font-semibold text-sm text-[hsl(var(--foreground))]">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-5 md:col-span-4">Player</div>
                    <div className="col-span-3 md:col-span-2 text-center">Score</div>
                    <div className="col-span-3 md:col-span-3 text-center hidden md:block">Win Rate</div>
                    <div className="col-span-3 md:col-span-2 text-center">Streak</div>
                  </div>
                </div>

                <div className="divide-y divide-[hsl(var(--border))]">
                  {getSortedData().map((user, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user.id === currentUserId;

                    return (
                      <div
                        key={user.id}
                        className={`p-4 hover:bg-[hsl(var(--muted))] transition-colors ${
                          isCurrentUser ? 'bg-[hsl(var(--primary))]/10 border-l-4 border-l-[hsl(var(--primary))]' : ''
                        }`}
                      >
                        <div className="grid grid-cols-12 gap-2 items-center">
                          {/* Rank */}
                          <div className="col-span-1 text-center font-bold text-[hsl(var(--foreground))]">
                            {rank <= 3 ? getRankBadge(rank) : rank}
                          </div>

                          {/* Player */}
                          <div className="col-span-5 md:col-span-4 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {user.avatar}
                            </div>
                            <div className="min-w-0">
                              <p className={`font-semibold text-sm truncate ${isCurrentUser ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>
                                {user.username}
                                {isCurrentUser && <span className="ml-1 text-xs">(You)</span>}
                              </p>
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                {user.gamesPlayed} games
                              </p>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="col-span-3 md:col-span-2 text-center">
                            <p className="font-bold text-[hsl(var(--foreground))]">{getStatValue(user)}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                              {selectedCategory === 'total' ? 'pts' :
                               selectedCategory === 'games' ? 'played' :
                               selectedCategory === 'hotTakes' ? 'score' : 'friends'}
                            </p>
                          </div>

                          {/* Win Rate (hidden on mobile) */}
                          <div className="col-span-3 text-center hidden md:block">
                            <div className="flex items-center justify-center gap-1">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span className="font-semibold text-[hsl(var(--foreground))]">{user.winRate}%</span>
                            </div>
                          </div>

                          {/* Streak */}
                          <div className="col-span-3 md:col-span-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Flame className={`w-4 h-4 ${user.streak > 5 ? 'text-orange-500' : 'text-gray-400'}`} />
                              <span className="font-semibold text-[hsl(var(--foreground))]">{user.streak}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats Summary */}
              {currentUserId && (
                <div className="mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                  <h3 className="font-semibold text-[hsl(var(--foreground))] mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Your Stats Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((category) => {
                      const userData = leaderboardData.find(u => u.id === currentUserId);
                      if (!userData) return null;

                      let value = 0;
                      switch (category.id) {
                        case 'total': value = userData.totalPoints; break;
                        case 'games': value = userData.gamesPlayed; break;
                        case 'hotTakes': value = userData.hotTakesScore; break;
                        case 'friends': value = userData.friendsCount; break;
                      }

                      return (
                        <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                          <category.icon className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--primary))]" />
                          <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{value}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{category.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <BottomTaskbar onNavigate={handleNavigate} activeTab="leaderboard" />
    </div>
  );
}
