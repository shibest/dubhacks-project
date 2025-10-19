import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Feed from "@/components/Feed";
import BottomTaskbar from "@/components/BottomTaskbar";
import { getAllUsers, getCurrentUserId, getFriends } from "@/lib/friends";
import ProfileCard, { Profile } from "@/components/ProfileCard";
import { updateFriendsCount } from "@/lib/leaderboard";
import { calculateBatchProfileSimilarity } from "@/api/gemini";
import { User } from "@/lib/supabase";
import { UserPlus } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [friends, setFriends] = useState<Set<string>>(new Set());
  const [allUsers, setAllUsers] = useState<Profile[]>([]); // All users without community filter
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("All Communities");
  const [profileComplete, setProfileComplete] = useState(true);

  // Force re-render when friends are added/removed to update UI immediately
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerUpdate = () => setRefreshTrigger(prev => prev + 1);

  // Check if user profile is complete
  const checkProfileCompleteness = () => {
    const saved = localStorage.getItem('user_profile');
    if (!saved) return false;

    const profile = JSON.parse(saved);
    // Profile is complete if they have at least username, hobbies, and one interest category filled
    return !!(
      profile.username &&
      profile.hobbies &&
      (profile.musicGenres?.length > 0 ||
       profile.favoriteGames?.length > 0 ||
       profile.favoriteShows?.length > 0)
    );
  };

  useEffect(() => {
    setIsVisible(true);
    const isComplete = checkProfileCompleteness();
    setProfileComplete(isComplete);
    if (isComplete) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [refreshTrigger]);

  const loadUsers = async () => {
    try {
      const users = await getAllUsers();
      const currentUserId = getCurrentUserId();
      const friends = currentUserId ? await getFriends(currentUserId) : [];
      const friendIds = new Set(friends.map(friend => friend.id));

      // Get user profile for similarity calculation
      const saved = localStorage.getItem('user_profile');
      const userProfile = saved ? JSON.parse(saved) : null;

      console.log('Current user ID:', currentUserId);
      console.log('All users:', users);
      console.log('Current friends:', friendIds);

      // Filter users and calculate similarity scores
      const filteredUsers = users.filter(user => user.id !== currentUserId && !friendIds.has(user.id));

      // OPTIMIZED: Calculate ALL similarity scores in a single API call
      let similarityScores = new Map<string, number>();

      if (userProfile && filteredUsers.some(user => user.personality)) {
        try {
          const candidatesWithPersonality = filteredUsers.filter(user => user.personality);

          similarityScores = await calculateBatchProfileSimilarity(
            {
              hobbies: userProfile.hobbies || '',
              musicGenres: userProfile.musicGenres || [],
              favoriteGames: userProfile.favoriteGames || [],
              favoriteShows: userProfile.favoriteShows || []
            },
            candidatesWithPersonality.map(user => ({
              username: user.username,
              personality: user.personality!,
              interests: user.interests
            }))
          );
        } catch (error) {
          console.error('Error calculating batch similarity:', error);
        }
      }

      // Map users with their scores
      const usersWithScores = filteredUsers.map(user => ({
        user,
        similarityScore: similarityScores.get(user.username) || 50
      }));

      // Sort by similarity score (highest first)
      usersWithScores.sort((a, b) => b.similarityScore - a.similarityScore);

      // Convert to Profile format
      const profiles: Profile[] = usersWithScores.map(({ user, similarityScore }) => ({
        id: user.id,
        name: user.username,
        username: user.username,
        avatar: user.username.substring(0, 2).toUpperCase(),
        bio: `Interests: ${user.interests.join(', ')}`,
        mutualFriends: 0,
        communities: user.communities || [],
        similarityScore // Store the score
      }));

      // Apply community filter after similarity calculation
      const filteredProfiles = profiles.filter(user => {
        if (selectedCommunity === "All Communities") return true;
        // Filter by community - users have communities array
        return user.communities?.includes(selectedCommunity);
      });

      console.log('Loaded and sorted profiles by similarity:', filteredProfiles);
      setAllUsers(filteredProfiles);
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setLoading(false);
  };

  const handleAddFriend = async (profileId: string) => {
    // Keep the user in the dashboard list but mark as added
    // The ProfileCard component will handle showing "Friend Added!" state
    triggerUpdate();

    // Update friends count in leaderboard
    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      const updatedFriends = await getFriends(currentUserId);
      updateFriendsCount(updatedFriends.length);
    }
  };

  const handleCommunityChange = (community: string) => {
    setSelectedCommunity(community);
    // Force reload users with new community filter
    setRefreshTrigger(prev => prev + 1);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleNavigate = (tab: string) => {
    if (tab === "friends") {
      navigate("/friends");
    } else if (tab === "games") {
      navigate("/games");
    } else if (tab === "settings") {
      navigate("/settings");
    } else if (tab === "leaderboard") {
      navigate("/leaderboard");
    } else if (tab === "home") {
      // Already on home
    } else {
      console.log("Navigate to:", tab);
    }
  };

  return (
    <div
      className={`flex flex-col min-h-screen bg-[hsl(var(--background))] transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ paddingTop: 0 }}
    >
      <Header
        selectedCommunity={selectedCommunity}
        onCommunityChange={handleCommunityChange}
        onProfileClick={handleProfileClick}
      />

      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="pb-24 pt-4 md:pt-6">
            <div className="max-w-2xl mx-auto px-3 md:px-4">
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-[hsl(280,95%,52%)] via-[hsl(180,85%,48%)] to-[hsl(90,80%,48%)] bg-clip-text text-transparent">
                  Discover Friends
                </h1>
                <p className="text-center text-[hsl(var(--muted-foreground))] text-sm">
                  Find and connect with people who share your interests
                </p>

                {/* Search Bar */}
                <div className="mt-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username or interests..."
                    className="w-full px-4 py-2 text-sm rounded-lg bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center text-[hsl(var(--muted-foreground))] py-8">
                  Loading users...
                </div>
              ) : !profileComplete ? (
                <div className="text-center py-12 px-4">
                  <UserPlus className="w-16 h-16 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
                  <h2 className="text-xl font-bold mb-2 text-[hsl(var(--foreground))]">Complete Your Profile</h2>
                  <p className="text-[hsl(var(--muted-foreground))] mb-4 max-w-md mx-auto">
                    Build out your profile with hobbies and interests to find better connections and get personalized recommendations!
                  </p>
                  <button
                    onClick={() => navigate("/profile")}
                    className="px-6 py-3 bg-gradient-to-r from-[hsl(280,95%,52%)] to-[hsl(180,85%,48%)] text-white rounded-lg hover:from-[hsl(280,95%,47%)] hover:to-[hsl(180,85%,43%)] transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                  >
                    Go to Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {allUsers
                    .filter(user =>
                      searchQuery === "" ||
                      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.bio.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 50)
                    .map((user) => (
                      <ProfileCard
                        key={user.id}
                        profile={user}
                        onAddFriend={handleAddFriend}
                      />
                    ))}
                  {allUsers.filter(user => {
                      if (selectedCommunity !== "All Communities") {
                        const userCommunities = (user as any).communities || [];
                        if (!userCommunities.includes(selectedCommunity)) {
                          return false;
                        }
                      }
                      if (searchQuery !== "") {
                        const query = searchQuery.toLowerCase();
                        return user.username.toLowerCase().includes(query) ||
                               user.bio.toLowerCase().includes(query);
                      }
                      return true;
                    }).length === 0 && (
                    <div className="text-center text-[hsl(var(--muted-foreground))] py-8">
                      <p>No users found matching your filters.</p>
                      <p className="text-sm mt-2">Try changing your community or search query.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <BottomTaskbar onNavigate={handleNavigate} activeTab="home" />
    </div>
  );
}
