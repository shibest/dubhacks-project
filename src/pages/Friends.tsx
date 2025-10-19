import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomTaskbar from "@/components/BottomTaskbar";
import { Profile } from "@/components/ProfileCard";
import { getCurrentUserId, getFriends, removeFriend } from "@/lib/friends";
import { updateFriendsCount } from "@/lib/leaderboard";

const SAMPLE_FRIENDS: Profile[] = [
  {
    id: "1",
    name: "Alex Rivera",
    username: "alexrivera",
    avatar: "AR",
    bio: "Mycology enthusiast and nature explorer. Always discovering new things.",
    mutualFriends: 3,
  },
  {
    id: "2",
    name: "Jordan Chen",
    username: "jordanchen",
    avatar: "JC",
    bio: "Digital artist and creative thinker. Building beautiful things online.",
    mutualFriends: 5,
  },
  {
    id: "3",
    name: "Sam Taylor",
    username: "samtaylor",
    avatar: "ST",
    bio: "Tech lover and lifelong learner. Coffee addict ☕",
    mutualFriends: 2,
  },
  {
    id: "4",
    name: "Morgan Lee",
    username: "morganlee",
    avatar: "ML",
    bio: "Game developer and streamer. Let's build something amazing!",
    mutualFriends: 8,
  },
  {
    id: "5",
    name: "Casey Kim",
    username: "caseykim",
    avatar: "CK",
    bio: "Environmental scientist passionate about sustainability.",
    mutualFriends: 1,
  },
];

export default function Friends() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState("All Communities");

  useEffect(() => {
    setIsVisible(true);
    loadFriends();
  }, []);

  const loadFriends = async () => {
    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      try {
        const friendsData = await getFriends(currentUserId);
        // Convert User[] to Profile[] format
        const profiles: Profile[] = friendsData
          .filter(user => {
            if (selectedCommunity === "All Communities") return true;
            // Filter by community - users are now assigned communities randomly
            return (user as any).community === selectedCommunity;
          })
          .map(user => ({
            id: user.id,
            name: user.username, // Using username as name for now
            username: user.username,
            avatar: user.username.substring(0, 2).toUpperCase(),
            bio: `Interests: ${user.interests.join(', ')}`,
            mutualFriends: 0 // Could be calculated later
          }));
        setFriends(profiles);

        // Update leaderboard friends count
        updateFriendsCount(profiles.length);
      } catch (error) {
        console.error('Error loading friends:', error);
      }
    }
    setLoading(false);
  };

  const handleCommunityChange = (community: string) => {
    setSelectedCommunity(community);
    // Reload friends with new community filter
    loadFriends();
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleNavigate = (tab: string) => {
    if (tab === "friends") {
      // Already on friends
    } else if (tab === "home") {
      navigate("/home");
    } else if (tab === "games") {
      navigate("/games");
    } else if (tab === "settings") {
      navigate("/settings");
    } else if (tab === "leaderboard") {
      navigate("/leaderboard");
    } else {
      console.log("Navigate to:", tab);
    }
  };

  const handleChat = (friendId: string) => {
    navigate(`/chat/${friendId}`);
  };

  const handleRemoveFriend = async (friendId: string) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    const success = await removeFriend(currentUserId, friendId);
    if (success) {
      // Immediately remove from friends list
      const newFriends = friends.filter(friend => friend.id !== friendId);
      setFriends(newFriends);

      // Update leaderboard friends count
      updateFriendsCount(newFriends.length);
      // The removed friend will now appear back in the dashboard when refreshed
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

      <main className="flex-1 overflow-hidden pb-20">
        <div className="h-full overflow-y-auto">
          <div className="pb-4 pt-4 md:pt-6">
            <div className="max-w-2xl mx-auto px-3 md:px-4">
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-[hsl(280,95%,52%)] via-[hsl(180,85%,48%)] to-[hsl(90,80%,48%)] bg-clip-text text-transparent">
                  Your Friends
                </h1>
                <p className="text-center text-[hsl(var(--muted-foreground))] text-sm">
                  Connect and chat with your friends
                </p>
              </div>

              <div className="space-y-3 md:space-y-4">
                {loading ? (
                  <div className="text-center text-[hsl(var(--muted-foreground))] py-8">
                    Loading friends...
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center text-[hsl(var(--muted-foreground))] py-8">
                    <p className="mb-4">No friends yet!</p>
                    <p className="text-sm">Add some friends from the home page.</p>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="bg-[hsl(var(--card))] rounded-2xl md:rounded-3xl p-4 md:p-6 border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-all duration-300 hover:shadow-xl shadow-md"
                    >
                      {/* Avatar and Content Container */}
                      <div className="flex gap-3 md:gap-5 mb-4 md:mb-5">
                        {/* Avatar - Left */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[hsl(260,80%,60%)] to-[hsl(280,90%,50%)] flex items-center justify-center text-lg md:text-2xl font-bold text-white shadow-lg">
                            {friend.avatar}
                          </div>
                        </div>

                        {/* Content - Right */}
                        <div className="flex-1 min-w-0">
                          {/* Name and Username */}
                          <h3 className="text-base md:text-lg font-bold text-[hsl(var(--foreground))] mb-0.5">
                            {friend.name}
                          </h3>
                          <p className="text-xs md:text-sm text-[hsl(var(--muted-foreground))] mb-2">
                            @{friend.username}
                          </p>

                          {/* Bio */}
                          <p className="text-xs md:text-sm text-[hsl(var(--foreground))] leading-relaxed mb-2 line-clamp-2">
                            {friend.bio}
                          </p>

                          {/* Mutual Friends */}
                          {friend.mutualFriends > 0 && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                              {friend.mutualFriends} mutual friend{friend.mutualFriends !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleChat(friend.id)}
                          className="flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-white"
                        >
                          <span className="text-lg">💬</span>
                          <span>Chat</span>
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold text-sm md:text-base bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomTaskbar onNavigate={handleNavigate} activeTab="friends" />
    </div>
  );
}