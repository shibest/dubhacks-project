import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Feed from "@/components/Feed";
import BottomTaskbar from "@/components/BottomTaskbar";

export default function Index() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [friends, setFriends] = useState<Set<string>>(new Set());

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleAddFriend = (profileId: string) => {
    setFriends((prev) => new Set([...prev, profileId]));
  };

  const handleCommunityClick = () => {
    // Community button action
    console.log("Community clicked");
  };

  const handleProfileClick = () => {
    navigate("/connect");
  };

  const handleNavigate = (tab: string) => {
    // Taskbar navigation
    console.log("Navigate to:", tab);
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
          <Feed onAddFriend={handleAddFriend} />
        </div>
      </main>

      <BottomTaskbar onNavigate={handleNavigate} />
    </div>
  );
}
