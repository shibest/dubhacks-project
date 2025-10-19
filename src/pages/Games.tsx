import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomTaskbar from "@/components/BottomTaskbar";
import { Sparkles, Music, Gamepad2, Tv } from "lucide-react";

interface Game {
  name: string;
  description: string;
}

interface GameCategory {
  title: string;
  icon: React.ReactNode;
  games: Game[];
}

const gameCategories: GameCategory[] = [
  {
    title: "General",
    icon: <Sparkles className="w-4 h-4" />,
    games: [
      { name: "Hot Takes", description: "" },
      { name: "Emoji Story", description: "" },
      { name: "Two Truths and a Vibe", description: "" },
    ],
  },
  {
    title: "Music",
    icon: <Music className="w-4 h-4" />,
    games: [
      { name: "Guilty Pleasure Guess", description: "" },
      { name: "Spicy Statements", description: "" },
    ],
  },
  {
    title: "Gaming",
    icon: <Gamepad2 className="w-4 h-4" />,
    games: [
      { name: "First, Best, Forever", description: "" },
    ],
  },
  {
    title: "Movies & Shows",
    icon: <Tv className="w-4 h-4" />,
    games: [
      { name: "Let's Rate It", description: "" },
    ],
  },
];

export default function Games() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGameClick = (gameName: string) => {
    console.log(`Selected game: ${gameName}`);
    // TODO: Navigate to game page or start game
  };

  const handleNavigate = (tab: string) => {
    if (tab === "friends") {
      navigate("/friends");
    } else if (tab === "games") {
      // Already on games
    } else if (tab === "home") {
      navigate("/home");
    } else {
      console.log("Navigate to:", tab);
    }
  };

  const handleCommunityClick = () => {
    navigate("/dashboard");
  };

  const handleProfileClick = () => {
    navigate("/profile");
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

      <main className="flex-1 overflow-hidden pb-20">
        <div className="h-full overflow-y-auto">
          <div className="pb-4 pt-4 md:pt-6">
            <div className="max-w-2xl mx-auto px-3 md:px-4">
              {/* Page Title */}
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[hsl(280,95%,52%)] via-[hsl(180,85%,48%)] to-[hsl(90,80%,48%)] bg-clip-text text-transparent">
                  Connection Games
                </h1>
                <p className="text-center text-[hsl(var(--muted-foreground))] text-sm">
                  Pick a game to play with your friends and discover shared interests
                </p>
              </div>

              {/* Game Categories */}
              <div className="space-y-6 md:space-y-8">
                {gameCategories.map((category, categoryIndex) => (
                  <div
                    key={category.title}
                    className={`transition-all duration-700 ease-out delay-${categoryIndex * 100} ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                  >
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-md bg-[hsl(var(--accent))]">
                        {category.icon}
                      </div>
                      <h2 className="text-lg md:text-xl font-semibold text-[hsl(var(--foreground))]">
                        {category.title}
                      </h2>
                    </div>

                    {/* Game Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {category.games.map((game) => (
                        <button
                          key={game.name}
                          onClick={() => handleGameClick(game.name)}
                          className={`group relative p-4 md:p-5 rounded-lg bg-[hsl(var(--card))]
                            border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]
                            transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg
                            text-left ${
                              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            }`}
                        >
                          {/* Game Name */}
                          <h3 className="text-base md:text-lg font-semibold text-[hsl(var(--foreground))] mb-2 group-hover:text-[hsl(var(--primary))] transition-colors">
                            {game.name}
                          </h3>

                          {/* Description Space */}
                          <div className="min-h-[48px] md:min-h-[60px]">
                            <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                              {game.description || ""}
                            </p>
                          </div>

                          {/* Play indicator */}
                          <div className="mt-3 flex items-center gap-2 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                            <span className="text-xs md:text-sm font-medium">Play Now</span>
                            <svg
                              className="w-3 h-3 md:w-4 md:h-4 transform group-hover:translate-x-1 transition-transform"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomTaskbar onNavigate={handleNavigate} activeTab="games" />
    </div>
  );
}
