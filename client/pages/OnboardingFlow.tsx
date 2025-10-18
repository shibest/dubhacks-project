import { useState, useEffect } from "react";
import MyceliumLogo from "@/components/MyceliumLogo";
import Header from "@/components/Header";
import Feed from "@/components/Feed";
import BottomTaskbar from "@/components/BottomTaskbar";
import { Mail, Lock, User, Music, Gamepad2, Plus, X } from "lucide-react";

export type ScreenType = "intro" | "auth" | "connections" | "home";

interface Connection {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  connected: boolean;
}

export default function OnboardingFlow() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("intro");

  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  return (
    <>
      <div className="relative w-full min-h-screen overflow-hidden bg-[hsl(var(--background))] pl-[200px]">
        {/* Intro Screen */}
        <IntroScreen
          isActive={currentScreen === "intro"}
          onNavigate={handleNavigate}
        />

        {/* Auth Screen */}
        <AuthScreen
          isActive={currentScreen === "auth"}
          onNavigate={handleNavigate}
        />

        {/* Connections Screen */}
        <ConnectionsScreen
          isActive={currentScreen === "connections"}
          onNavigate={handleNavigate}
        />

        {/* Home Screen */}
        <HomeScreen
          isActive={currentScreen === "home"}
          onNavigate={handleNavigate}
        />
      </div>
    </>
  );
}

// Intro Screen Component
function IntroScreen({
  isActive,
  onNavigate,
}: {
  isActive: boolean;
  onNavigate: (screen: ScreenType) => void;
}) {
  const [isVisible, setIsVisible] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onNavigate("auth");
        }, 500);
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isActive, onNavigate]);

  return (
    <div
      className={`absolute inset-0 w-full h-screen transition-opacity duration-500 ${
        isActive ? "z-40 pointer-events-auto" : "z-0 pointer-events-none"
      } ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="bg-gradient-to-br from-[hsl(260,40%,15%)] via-[hsl(210,14%,11%)] to-[hsl(260,30%,12%)] flex items-center justify-center h-auto flex-grow">
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="w-32 h-32 md:w-48 md:h-48 pulse-glow">
            <MyceliumLogo className="text-[hsl(var(--primary))] drop-shadow-2xl" />
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-[hsl(260,80%,60%)] to-[hsl(280,90%,70%)] bg-clip-text text-transparent animate-pulse">
            Mycelius
          </h1>

          <p className="text-sm md:text-lg text-[hsl(var(--muted-foreground))] text-center max-w-xs md:max-w-md">
            Connect. Explore. Grow.
          </p>
        </div>
      </div>
    </div>
  );
}

// Auth Screen Component
function AuthScreen({
  isActive,
  onNavigate,
}: {
  isActive: boolean;
  onNavigate: (screen: ScreenType) => void;
}) {
  const [isVisible, setIsVisible] = useState(isActive);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsVisible(isActive);
  }, [isActive]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsVisible(false);
      setTimeout(() => {
        onNavigate("connections");
      }, 500);
    }
  };

  return (
    <div
      className={`absolute inset-0 w-full h-screen transition-opacity duration-500 ${
        isActive ? "z-40 pointer-events-auto" : "z-0 pointer-events-none"
      } ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="bg-gradient-to-br from-[hsl(260,40%,15%)] via-[hsl(210,14%,11%)] to-[hsl(260,30%,12%)] flex items-center justify-center px-4 h-auto flex-grow">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20">
              <MyceliumLogo />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-[hsl(260,80%,60%)] to-[hsl(280,90%,70%)] bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-center text-[hsl(var(--muted-foreground))] mb-8">
            Join the mycelium network
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all"
                  placeholder="Choose your username"
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all"
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-[hsl(260,80%,60%)] to-[hsl(280,90%,70%)] hover:from-[hsl(260,80%,55%)] hover:to-[hsl(280,90%,65%)] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Create Account
            </button>

            <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-4">
              Already have an account?{" "}
              <button
                type="button"
                className="text-[hsl(var(--primary))] hover:text-[hsl(260,80%,70%)] font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// Connections Screen Component
function ConnectionsScreen({
  isActive,
  onNavigate,
}: {
  isActive: boolean;
  onNavigate: (screen: ScreenType) => void;
}) {
  const [isVisible, setIsVisible] = useState(isActive);
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: "spotify",
      name: "Spotify",
      icon: <Music className="w-8 h-8" />,
      color: "from-green-500 to-green-600",
      connected: false,
    },
    {
      id: "steam",
      name: "Steam",
      icon: <Gamepad2 className="w-8 h-8" />,
      color: "from-blue-500 to-blue-600",
      connected: false,
    },
  ]);

  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");

  const availableInterests = [
    "Gaming",
    "Music",
    "Art",
    "Technology",
    "Science",
    "Sports",
    "Travel",
    "Food",
    "Books",
    "Movies",
    "Photography",
    "Fitness",
  ];

  useEffect(() => {
    setIsVisible(isActive);
  }, [isActive]);

  const toggleConnection = (id: string) => {
    setConnections(
      connections.map((conn) =>
        conn.id === id ? { ...conn, connected: !conn.connected } : conn
      )
    );
  };

  const addInterest = (interest: string) => {
    if (!interests.includes(interest)) {
      setInterests([...interests, interest]);
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const addCustomInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput)) {
      setInterests([...interests, interestInput]);
      setInterestInput("");
    }
  };

  const handleContinue = () => {
    setIsVisible(false);
    setTimeout(() => {
      onNavigate("home");
    }, 500);
  };

  return (
    <div
      className={`absolute inset-0 w-full h-screen transition-opacity duration-500 overflow-y-auto ${
        isActive ? "z-40 pointer-events-auto" : "z-0 pointer-events-none"
      } ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="bg-gradient-to-br from-[hsl(260,40%,15%)] via-[hsl(210,14%,11%)] to-[hsl(260,30%,12%)] flex items-center justify-center px-4 py-8 h-auto flex-grow">
        <div className="w-full max-w-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16">
              <MyceliumLogo />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-[hsl(260,80%,60%)] to-[hsl(280,90%,70%)] bg-clip-text text-transparent">
            Connect Your World
          </h1>
          <p className="text-center text-[hsl(var(--muted-foreground))] mb-10">
            Connect your accounts or tell us about your interests
          </p>

          <div className="mb-10">
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-4">
              Connect Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((connection) => (
                <button
                  key={connection.id}
                  onClick={() => toggleConnection(connection.id)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
                    connection.connected
                      ? `border-[hsl(var(--primary))] bg-gradient-to-r ${connection.color} bg-opacity-10`
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-white">{connection.icon}</div>
                    <span className="text-lg font-semibold text-[hsl(var(--foreground))]">
                      {connection.name}
                    </span>
                  </div>
                  {connection.connected ? (
                    <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white">
                      ✓
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-[hsl(var(--muted-foreground))]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-4">
              Add Your Interests
            </h2>

            {interests.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <div
                    key={interest}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[hsl(260,80%,60%)] to-[hsl(280,90%,70%)] text-white text-sm font-medium"
                  >
                    {interest}
                    <button
                      onClick={() => removeInterest(interest)}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addCustomInterest();
                  }
                }}
                placeholder="Add a custom interest..."
                className="flex-1 px-4 py-3 rounded-lg bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all"
              />
              <button
                onClick={addCustomInterest}
                className="px-4 py-3 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(260,80%,55%)] text-[hsl(var(--primary-foreground))] font-semibold transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Or select from suggestions:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableInterests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => addInterest(interest)}
                    disabled={interests.includes(interest)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      interests.includes(interest)
                        ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                        : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full py-4 px-4 bg-gradient-to-r from-[hsl(260,80%,60%)] to-[hsl(280,90%,70%)] hover:from-[hsl(260,80%,55%)] hover:to-[hsl(280,90%,65%)] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Exploring
          </button>

          <button
            onClick={handleContinue}
            className="w-full py-3 px-4 mt-3 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] font-medium transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

// Home Screen Component
function HomeScreen({
  isActive,
  onNavigate,
}: {
  isActive: boolean;
  onNavigate: (screen: ScreenType) => void;
}) {
  const [isVisible, setIsVisible] = useState(isActive);
  const [friends, setFriends] = useState<Set<string>>(new Set());

  useEffect(() => {
    setIsVisible(isActive);
  }, [isActive]);

  const handleAddFriend = (profileId: string) => {
    setFriends((prev) => new Set([...prev, profileId]));
  };

  return (
    <div
      className={`absolute inset-0 w-full h-screen transition-opacity duration-500 overflow-hidden ${
        isActive ? "z-40 pointer-events-auto" : "z-0 pointer-events-none"
      } ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="flex flex-col h-auto flex-grow bg-[hsl(var(--background))]">
        <Header
          onCommunityClick={() => {}}
          onProfileClick={() => {}}
        />

        <main className="flex-1 overflow-y-auto">
          <Feed onAddFriend={handleAddFriend} />
        </main>

        <BottomTaskbar onNavigate={() => {}} />
      </div>
    </div>
  );
}
