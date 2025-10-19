import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomTaskbar from "@/components/BottomTaskbar";
import { Flame, Zap, Trophy, Target, Users, Gamepad2, Music, Tv, Award, Star } from "lucide-react";

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
    } else if (tab === "settings") {
      navigate("/settings");
    } else {
      console.log("Navigate to:", tab);
    }
  };

  const handleHotTake = () => {
    navigate("/gameanim");
  };

  const gameCategories = [
    {
      id: "normal",
      title: "General Games",
      theme: "default",
      color: "from-[hsl(280,95%,52%)] to-[hsl(180,85%,48%)]",
      textColor: "text-white",
      games: [
        {
          id: "debate",
          title: "Hot Takes",
          description: "Share controversial opinions about shared interests and react with 🔥/❄️",
          icon: "🔥",
          action: () => navigate("/games/hottakes/anim")
        },
        {
          id: "emoji-story",
          title: "Emoji Story",
          description: "Describe your week with 3 emojis, other person guesses what happened",
          icon: "😊",
          action: () => navigate("/games/emojistory/anim")
        }
      ]
    },
    {
      id: "spotify",
      title: "Spotify Games",
      theme: "spotify",
      color: "from-green-500 to-green-600",
      textColor: "text-white",
      games: [
        {
          id: "guilty-pleasure",
          title: "Guilty Pleasure Guess",
          description: "Reveal that song nobody knows you listen to",
          icon: "🤫",
          action: () => navigate("/games/guiltypleasure/anim")
        },
        {
          id: "kill-my-vibe",
          title: "Kill My Vibe",
          description: "Share top genres/artists to find matches or get roasted",
          icon: "🥀",
          action: () => navigate("/games/killmyvibe/anim")
        },
        {
          id: "hot-takes-fm",
          title: "Hot Takes FM",
          description: "React to generated music opinions with ❤️/💀",
          icon: "📻🔥",
          action: () => navigate("/games/hottakesfm/anim")
        },
        {
          id: "two-truths-vibe",
          title: "Two Truths and a Vibe",
          description: "Guess which fact about their music taste is fake",
          icon: "✅🎵",
          action: () => navigate("/games/twotruthsvibe/anim")
        }
      ]
    },
    {
      id: "steam",
      title: "Steam Games",
      theme: "steam",
      color: "from-blue-500 to-blue-600",
      textColor: "text-white",
      games: [
        {
          id: "first-best-forever",
          title: "First, Best, Forever",
          description: "Share stories about games from your Steam library",
          icon: "1️⃣⭐♾️",
          action: () => navigate("/games/firstbestforever/anim")
        },
        {
          id: "patch-notes",
          title: "Patch Notes",
          description: "Propose funny patch notes for favorite games",
          icon: "📝",
          action: () => navigate("/games/patchnotes/anim")
        },
        {
          id: "fight-club",
          title: "Fight Club",
          description: "Debate who would win between characters from shared series",
          icon: "🥊👊",
          action: () => navigate("/games/fightclub/anim")
        },
        {
          id: "inventory-drop",
          title: "Inventory Drop",
          description: "Drop random imaginary items for others to pick up",
          icon: "🎒",
          action: () => navigate("/games/inventorydrop/anim")
        }
      ]
    },
    {
      id: "trakt",
      title: "Trakt Games",
      theme: "trakt",
      color: "from-red-500 to-red-600",
      textColor: "text-white",
      games: [
        {
          id: "rate-it-together",
          title: "Rate It Together",
          description: "Rate characters from shared movies/shows 1-10",
          icon: "⭐",
          action: () => console.log("Rate It Together clicked")
        },
        {
          id: "ship-it",
          title: "Ship It",
          description: "Discuss shipping favorite movie characters",
          icon: "🚢",
          action: () => console.log("Ship It clicked")
        },
        {
          id: "main-character-energy",
          title: "Main Character Energy",
          description: "Describe what main character you'd be in favorite worlds",
          icon: "🎭",
          action: () => console.log("Main Character Energy clicked")
        },
        {
          id: "movie-mount-rushmore",
          title: "Movie Mount Rushmore",
          description: "Pick 4 titles for your personal film Mount Rushmore",
          icon: "🏔️",
          action: () => console.log("Movie Mount Rushmore clicked")
        }
      ]
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
              {/* Top Section - Leaderboards and Quests */}
              <div className="mb-8">
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div
                    onClick={() => console.log("Leaderboards clicked")}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl md:rounded-3xl p-6 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Trophy size={28} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold mb-1">Leaderboards</h3>
                        <p className="text-sm opacity-90">See your ranking</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => console.log("Quests clicked")}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl md:rounded-3xl p-6 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Target size={28} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold mb-1">Quests</h3>
                        <p className="text-sm opacity-90">Daily challenges</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Categories */}
              <div className="space-y-8">
                {gameCategories.map((category) => (
                  <div key={category.id}>
                    <h2 className={`text-xl font-bold mb-4 text-center bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                      {category.title}
                    </h2>

                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                      {category.games.map((game) => {
                        return (
                          <div
                            key={game.id}
                            onClick={game.action}
                            className={`bg-gradient-to-br ${category.color} rounded-2xl md:rounded-3xl p-4 md:p-6 ${category.textColor} cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 shadow-lg`}
                          >
                            <div className="text-center">
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                                {typeof game.icon === 'string' ? (
                                  <span className="text-2xl md:text-3xl">{game.icon}</span>
                                ) : (
                                  <game.icon size={24} className="text-white" />
                                )}
                              </div>
                              <h3 className="text-sm md:text-lg font-bold mb-1">
                                {game.title}
                              </h3>
                              <p className="text-xs md:text-sm opacity-90 leading-tight">
                                {game.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
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
