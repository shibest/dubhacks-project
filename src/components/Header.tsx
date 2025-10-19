import { User, ChevronDown } from "lucide-react";
import MyceliumLogo from "./MyceliumLogo";
import { useState, useEffect } from "react";

interface HeaderProps {
  onCommunityClick?: () => void;
  onProfileClick?: () => void;
  selectedCommunity?: string;
  onCommunityChange?: (community: string) => void;
}

export default function Header({
  onCommunityClick,
  onProfileClick,
  selectedCommunity = "All Communities",
  onCommunityChange,
}: HeaderProps) {
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const communities = ["All Communities", "UW", "Microsoft", "Seattle"];

  useEffect(() => {
    // Load profile picture from localStorage
    const loadProfilePicture = () => {
      const saved = localStorage.getItem('user_profile');
      if (saved) {
        const profile = JSON.parse(saved);
        setProfilePicture(profile.profilePicture || "");
      }
    };

    loadProfilePicture();

    // Listen for storage changes (when profile is updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_profile') {
        loadProfilePicture();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event when profile is updated in the same tab
    const handleProfileUpdate = () => {
      loadProfilePicture();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element).closest('.community-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleCommunitySelect = (community: string) => {
    onCommunityChange?.(community);
    setIsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 h-16 md:px-8 md:py-4 md:h-20">
        {/* Community Dropdown - Left */}
        <div className="relative community-dropdown">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 md:px-7 md:py-3 bg-gradient-to-r from-[hsl(280,95%,52%)] to-[hsl(180,85%,48%)] hover:from-[hsl(280,95%,47%)] hover:to-[hsl(180,85%,43%)] text-white font-semibold rounded-lg md:rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base flex items-center gap-2"
          >
            <span>{selectedCommunity}</span>
            <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-lg z-50">
              {communities.map((community) => (
                <button
                  key={community}
                  onClick={() => handleCommunitySelect(community)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[hsl(var(--accent))] first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  {community}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mycelius Title with Logo - Center */}
        <div className="flex items-center gap-2 md:gap-3 absolute left-1/2 transform -translate-x-1/2">
          <div className="w-10 h-10 md:w-12 md:h-12">
            <MyceliumLogo />
          </div>
          <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-[hsl(260,80%,60%)] to-[hsl(280,90%,70%)] bg-clip-text text-transparent">
            Mycelius
          </h1>
        </div>

        {/* Profile Button - Right */}
        <button
          onClick={onProfileClick}
          className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-md hover:shadow-lg overflow-hidden ${
            profilePicture
              ? 'bg-gray-200 dark:bg-gray-700 p-0'
              : 'bg-gradient-to-r from-[hsl(280,95%,52%)] to-[hsl(180,85%,48%)] hover:from-[hsl(280,95%,47%)] hover:to-[hsl(180,85%,43%)]'
          }`}
        >
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <>
              <User size={20} className="md:hidden" />
              <User size={22} className="hidden md:block" />
            </>
          )}
        </button>
      </div>
    </header>
  );
}
