import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomTaskbar from "@/components/BottomTaskbar";
import { Flame, Zap, Trophy, Target } from "lucide-react";

export default function Games() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleCommunityClick = () => {
    console.log("Community clicked");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleNavigate = (tab: string) => {
    if (tab === "games") {
      // Already on games
    } else if (tab === "home") {
      navigate("/home");
    } else if (tab === "friends") {
      navigate("/friends");
    } else {
      console.log("Navigate to:", tab);
    }
  };

  const handleHotTake = () => {
    navigate("/gameanim");
  };

  const games = [
    {
      id: "debate",
      title: "Hot Takes",
      description: "Share controversial opinions and debate with friends",
      icon: Flame,
      color: "from-red-500 to-orange-500",
      action: handleHotTake
    },
    {
      id: "trivia",
      title: "Trivia Challenge",
      description: "Test your knowledge across various topics",
      icon: Zap,
      color: "from-yellow-400 to-orange-500",
      action: () => console.log("Trivia clicked")
    },
    {
      id: "leaderboard",
      title: "Leaderboards",
      description: "See how you rank against other players",
      icon: Trophy,
      color: "from-purple-500 to-pink-500",
      action: () => console.log("Leaderboard clicked")
    },
    {
      id: "challenges",
      title: "Daily Challenges",
      description: "Complete fun challenges to earn points",
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      action: () => console.log("Challenges clicked")
    }
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
            <div className="max-w-2xl mx-auto px-3 md:px-4">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-[hsl(280,95%,52%)] via-[hsl(180,85%,48%)] to-[hsl(90,80%,48%)] bg-clip-text text-transparent">
                  Games & Challenges
                </h1>
                <p className="text-center text-[hsl(var(--muted-foreground))] text-sm">
                  Play games, share opinions, and compete with friends
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {games.map((game) => {
                  const Icon = game.icon;
                  return (
                    <div
                      key={game.id}
                      onClick={game.action}
                      className="bg-[hsl(var(--card))] rounded-2xl md:rounded-3xl p-6 border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-all duration-300 hover:shadow-xl shadow-md cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon size={28} className="text-white" />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-bold text-[hsl(var(--foreground))] mb-1">
                            {game.title}
                          </h3>
                          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                            {game.description}
                          </p>
                        </div>

                        <div className="text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats Section */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
                  Your Stats
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))]">
                    <div className="text-2xl font-bold text-[hsl(var(--primary))]">0</div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">Games Played</div>
                  </div>
                  <div className="bg-[hsl(var(--card))] rounded-xl p-4 border border-[hsl(var(--border))]">
                    <div className="text-2xl font-bold text-[hsl(var(--primary))]">0</div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">Points Earned</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomTaskbar onNavigate={handleNavigate} activeTab="games" />
    </div>
  );
}
