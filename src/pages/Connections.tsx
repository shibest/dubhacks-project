import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyceliumLogo from "@/components/MyceliumLogo";
import { Music, Gamepad2, Plus, X } from "lucide-react";

interface Connection {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  connected: boolean;
}

export default function Connections() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
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
    setIsVisible(true);
  }, []);

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
      navigate("/home");
    }, 500);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-[hsl(260,40%,15%)] via-[hsl(210,14%,11%)] to-[hsl(260,30%,12%)] flex items-center justify-center px-4 py-8 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
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

        {/* Services Section */}
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

        {/* Interests Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-4">
            Add Your Interests
          </h2>

          {/* Current Interests */}
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

          {/* Custom Interest Input */}
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

          {/* Suggested Interests */}
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

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full py-4 px-4 bg-gradient-to-r from-[hsl(260,80%,60%)] to-[hsl(280,90%,70%)] hover:from-[hsl(260,80%,55%)] hover:to-[hsl(280,90%,65%)] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Start Exploring
        </button>

        {/* Skip Button */}
        <button
          onClick={handleContinue}
          className="w-full py-3 px-4 mt-3 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] font-medium transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
