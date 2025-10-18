import { User } from "lucide-react";
import MyceliumLogo from "./MyceliumLogo";

interface HeaderProps {
  onCommunityClick?: () => void;
  onProfileClick?: () => void;
}

export default function Header({
  onCommunityClick,
  onProfileClick,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 h-16 md:px-8 md:py-4 md:h-20">
        {/* Community Button - Left */}
        <button
          onClick={onCommunityClick}
          className="px-4 py-2 md:px-7 md:py-3 bg-[hsl(var(--secondary))] hover:bg-[hsl(210,12%,26%)] text-[hsl(var(--foreground))] font-semibold rounded-lg md:rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
        >
          Community
        </button>

        {/* Mycelius Title with Logo - Center */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-6 h-6 md:w-8 md:h-8">
            <MyceliumLogo />
          </div>
          <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-[hsl(260,80%,60%)] to-[hsl(280,90%,70%)] bg-clip-text text-transparent">
            Mycelius
          </h1>
        </div>

        {/* Profile Button - Right */}
        <button
          onClick={onProfileClick}
          className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-[hsl(var(--secondary))] hover:bg-[hsl(210,12%,26%)] flex items-center justify-center text-[hsl(var(--foreground))] transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <User size={20} className="md:hidden" />
          <User size={22} className="hidden md:block" />
        </button>
      </div>
    </header>
  );
}
