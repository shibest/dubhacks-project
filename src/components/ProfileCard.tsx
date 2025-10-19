import { UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { getCurrentUserId, areFriends, addFriend } from "../lib/friends";

export interface Profile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  mutualFriends: number;
}

interface ProfileCardProps {
  profile: Profile;
  onAddFriend?: (profileId: string) => void;
}

export default function ProfileCard({
  profile,
  onAddFriend,
}: ProfileCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFriendship = async () => {
      const currentUserId = getCurrentUserId();
      if (currentUserId && currentUserId !== profile.id) {
        const friendStatus = await areFriends(currentUserId, profile.id);
        setIsFriend(friendStatus);
      } else {
        // If no current user, assume not friends
        setIsFriend(false);
      }
    };
    checkFriendship();
  }, [profile.id]);

  const handleAddFriend = async () => {
    const currentUserId = getCurrentUserId();
    console.log('Current user ID:', currentUserId);
    console.log('Adding friend:', profile.id);

    if (!currentUserId || loading) {
      console.log('Cannot add friend: no current user or loading');
      return;
    }

    setLoading(true);
    console.log('Calling addFriend...');
    const success = await addFriend(currentUserId, profile.id);
    console.log('Add friend result:', success);

    if (success) {
      console.log('Friend added successfully');
      setIsAdded(true);
      setIsFriend(true);
      onAddFriend?.(profile.id);
      // Keep the "Friend Added!" state permanently
    } else {
      console.log('Failed to add friend');
    }
    setLoading(false);
  };

  return (
    <div className="bg-[hsl(var(--card))] rounded-2xl md:rounded-3xl p-4 md:p-6 border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-all duration-300 hover:shadow-xl shadow-md">
      {/* Avatar and Content Container */}
      <div className="flex gap-3 md:gap-5 mb-4 md:mb-5">
        {/* Avatar - Left */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[hsl(260,80%,60%)] to-[hsl(280,90%,50%)] flex items-center justify-center text-lg md:text-2xl font-bold text-white shadow-lg">
            {profile.avatar}
          </div>
        </div>

        {/* Content - Right */}
        <div className="flex-1 min-w-0">
          {/* Name and Username */}
          <h3 className="text-base md:text-lg font-bold text-[hsl(var(--foreground))] mb-0.5">
            {profile.name}
          </h3>
          <p className="text-xs md:text-sm text-[hsl(var(--muted-foreground))] mb-2">
            @{profile.username}
          </p>

          {/* Bio */}
          <p className="text-xs md:text-sm text-[hsl(var(--foreground))] leading-relaxed mb-2 line-clamp-2">
            {profile.bio}
          </p>

          {/* Mutual Friends */}
          {profile.mutualFriends > 0 && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {profile.mutualFriends} mutual friend{profile.mutualFriends !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Add Friend Button - Full Width Below */}
      <button
        onClick={handleAddFriend}
        disabled={isFriend || loading}
        className={`w-full py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base ${
          isFriend
            ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30"
            : "bg-gradient-to-r from-[hsl(280,95%,52%)] to-[hsl(180,85%,48%)] hover:from-[hsl(280,95%,47%)] hover:to-[hsl(180,85%,43%)] text-white"
        }`}
      >
        <UserPlus size={18} className="md:hidden" />
        <UserPlus size={20} className="hidden md:block" />
        {loading ? "Adding..." : isFriend ? "Friend Added!" : "Add Friend"}
      </button>
    </div>
  );
}
