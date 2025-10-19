import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Feed from "@/components/Feed";
import BottomTaskbar from "@/components/BottomTaskbar";
import { getAllUsers, getCurrentUserId, getFriends } from "@/lib/friends";
import ProfileCard, { Profile } from "@/components/ProfileCard";

export default function Index() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [friends, setFriends] = useState<Set<string>>(new Set());
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Force re-render when friends are added/removed to update UI immediately
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerUpdate = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    setIsVisible(true);
    loadUsers();
  }, [refreshTrigger]);

  const loadUsers = async () => {
    try {
      const users = await getAllUsers();
      const currentUserId = getCurrentUserId();

      console.log('Current user ID:', currentUserId);
      console.log('All users:', users);

      // Convert User[] to Profile[] and exclude current user
      // Don't filter out friends - let ProfileCard handle the friend status display
      const profiles: Profile[] = users
        .filter(user => user.id !== currentUserId)
        .map(user => ({
          id: user.id,
          name: user.username,
          username: user.username,
          avatar: user.username.substring(0, 2).toUpperCase(),
          bio: `Interests: ${user.interests.join(', ')}`,
          mutualFriends: 0
        }));

      console.log('All profiles (including potential friends):', profiles);
      setAllUsers(profiles);
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setLoading(false);
  };

  const handleAddFriend = async (profileId: string) => {
    // Keep the user in the dashboard list but mark as added
    // The ProfileCard component will handle showing "Friend Added!" state
    triggerUpdate();
  };

  const handleCommunityClick = () => {
    // Community button action
    console.log("Community clicked");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleNavigate = (tab: string) => {
    if (tab === "friends") {
      navigate("/friends");
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
        onCommunityClick={handleCommunityClick}
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
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {allUsers
                    .filter(user =>
                      searchQuery === "" ||
                      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.bio.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 10)
                    .map((user) => (
                      <ProfileCard
                        key={user.id}
                        profile={user}
                        onAddFriend={handleAddFriend}
                      />
                    ))}
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
