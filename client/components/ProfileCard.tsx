import { UserPlus } from "lucide-react";
import { useState } from "react";

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
  onAddFriend: (profileId: string) => void;
}

export default function ProfileCard({
  profile,
  onAddFriend,
}: ProfileCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddFriend = () => {
    setIsAdded(true);
    onAddFriend(profile.id);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="bg-[hsl(var(--card))] rounded-2xl md:rounded-3xl p-4 md:p-6 border border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] transition-all duration-300 hover:shadow-xl shadow-md">
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
        disabled={isAdded}
        className={`w-full py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base ${
          isAdded
            ? "bg-green-600/20 text-green-400 border border-green-600/30"
            : "bg-gradient-to-r from-[hsl(260,80%,60%)] to-[hsl(280,90%,70%)] hover:from-[hsl(260,80%,55%)] hover:to-[hsl(280,90%,65%)] text-white"
        }`}
      >
        <UserPlus size={18} className="md:hidden" />
        <UserPlus size={20} className="hidden md:block" />
        {isAdded ? "Added!" : "Add Friend"}
      </button>
    </div>
  );
}
