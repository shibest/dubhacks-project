import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../contexts/ApiContext";
import { extractSteamId } from "../utils/steamId";
import { getPlayerSummary, getOwnedGames } from "../api/steam";
import { getUserTopArtists, getUserTopTracks } from "../api/spotify";
import { getUserWatchlist } from "../api/trakt";
import MyceliumLogo from "@/components/MyceliumLogo";
import { Music, Gamepad2, Plus, Tv, User, Camera } from "lucide-react";

interface ProfileData {
  username: string;
  profilePicture: string;
  musicGenres: string[];
  favoriteGames: string[];
  favoriteShows: string[];
  connectedServices: {
    spotify: boolean;
    steam: boolean;
    trakt: boolean;
  };
}

const MUSIC_GENRES = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Dance', 'Indie',
  'Alternative', 'Jazz', 'Classical', 'Country', 'Metal', 'Punk',
  'Folk', 'Blues', 'Soul', 'Funk', 'Reggae', 'Latin', 'K-Pop'
];

const POPULAR_GAMES = [
  'Counter-Strike', 'Dota 2', 'League of Legends', 'Valorant', 'Fortnite',
  'Minecraft', 'Grand Theft Auto V', 'Apex Legends', 'Overwatch',
  'Call of Duty', 'Rocket League', 'Among Us', 'Fall Guys',
  'Stardew Valley', 'Terraria', 'Elden Ring', 'Cyberpunk 2077'
];

const POPULAR_SHOWS = [
  'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'The Office',
  'Friends', 'The Mandalorian', 'Attack on Titan', 'Demon Slayer',
  'One Piece', 'Naruto', 'Death Note', 'The Witcher', 'House of the Dragon',
  'The Last of Us', 'Wednesday', 'Avatar: The Last Airbender', 'Rick and Morty'
];

export default function Connections() {
  const navigate = useNavigate();
  const { spotifyAuth, traktAuth } = useApi();
  const [isVisible, setIsVisible] = useState(false);

  // Load saved data from localStorage
  const loadProfile = (): ProfileData => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      username: '',
      profilePicture: '',
      musicGenres: [],
      favoriteGames: [],
      favoriteShows: [],
      connectedServices: {
        spotify: spotifyAuth.isAuthenticated,
        steam: !!localStorage.getItem('steam_id'),
        trakt: traktAuth.isAuthenticated
      }
    };
  };

  const [profile, setProfile] = useState<ProfileData>(loadProfile());

  // Input states
  const [customGenreInput, setCustomGenreInput] = useState("");
  const [customGameInput, setCustomGameInput] = useState("");
  const [customShowInput, setCustomShowInput] = useState("");
  const [steamInput, setSteamInput] = useState("");
  const [steamLoading, setSteamLoading] = useState(false);
  const [steamError, setSteamError] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
    // Update connection states when auth changes
    setProfile(prev => ({
      ...prev,
      connectedServices: {
        spotify: spotifyAuth.isAuthenticated,
        steam: !!localStorage.getItem('steam_id'),
        trakt: traktAuth.isAuthenticated
      }
    }));
  }, [spotifyAuth.isAuthenticated, traktAuth.isAuthenticated]);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }, [profile]);

  // Profile picture upload
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({
          ...profile,
          profilePicture: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Service connection handlers
  const handleSpotifyConnect = () => {
    spotifyAuth.login();
  };

  const handleSpotifyDisconnect = () => {
    spotifyAuth.logout();
    setProfile(prev => ({
      ...prev,
      connectedServices: { ...prev.connectedServices, spotify: false }
    }));
  };

  const handleTraktConnect = () => {
    traktAuth.login();
  };

  const handleTraktDisconnect = () => {
    traktAuth.logout();
    setProfile(prev => ({
      ...prev,
      connectedServices: { ...prev.connectedServices, trakt: false }
    }));
  };

  const handleSteamConnect = async () => {
    if (!steamInput.trim()) {
      setSteamError('Please enter a Steam ID or profile URL');
      return;
    }

    setSteamLoading(true);
    setSteamError(null);

    try {
      const result = await extractSteamId(steamInput.trim());

      if (result.error || !result.id) {
        setSteamError(result.error || 'Invalid Steam ID or URL');
        setSteamLoading(false);
        return;
      }

      const profileData = await getPlayerSummary(result.id);

      if (profileData.response?.players?.[0]) {
        localStorage.setItem('steam_id', result.id);
        setProfile(prev => ({
          ...prev,
          connectedServices: { ...prev.connectedServices, steam: true }
        }));
        setSteamInput('');
        setSteamError(null);
      } else {
        setSteamError('Steam profile not found or is PRIVATE');
      }
    } catch (error) {
      setSteamError('Failed to connect to Steam');
    } finally {
      setSteamLoading(false);
    }
  };

  const handleSteamDisconnect = () => {
    localStorage.removeItem('steam_id');
    setProfile(prev => ({
      ...prev,
      connectedServices: { ...prev.connectedServices, steam: false }
    }));
    setSteamInput('');
    setSteamError(null);
  };

  // Music Genre Functions
  const addGenre = (genre: string) => {
    if (!profile.musicGenres.includes(genre)) {
      setProfile({
        ...profile,
        musicGenres: [...profile.musicGenres, genre]
      });
    }
    setCustomGenreInput('');
  };

  const removeGenre = (genre: string) => {
    setProfile({
      ...profile,
      musicGenres: profile.musicGenres.filter(g => g !== genre)
    });
  };

  // Game Functions
  const addGame = (game: string) => {
    if (!profile.favoriteGames.includes(game)) {
      setProfile({
        ...profile,
        favoriteGames: [...profile.favoriteGames, game]
      });
    }
    setCustomGameInput('');
  };

  const removeGame = (game: string) => {
    setProfile({
      ...profile,
      favoriteGames: profile.favoriteGames.filter(g => g !== game)
    });
  };

  // Show Functions
  const addShow = (show: string) => {
    if (!profile.favoriteShows.includes(show)) {
      setProfile({
        ...profile,
        favoriteShows: [...profile.favoriteShows, show]
      });
    }
    setCustomShowInput('');
  };

  const removeShow = (show: string) => {
    setProfile({
      ...profile,
      favoriteShows: profile.favoriteShows.filter(s => s !== show)
    });
  };

  const handleContinue = () => {
    setIsVisible(false);
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div
      className={`h-screen bg-gradient-to-br from-[hsl(260,30%,8%)] via-[hsl(265,35%,12%)] to-[hsl(270,40%,10%)] flex items-start justify-center px-4 pt-16 transition-opacity duration-500 overflow-y-auto ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="w-full max-w-2xl py-4">
        {/* Header */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20">
            <MyceliumLogo />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-1 bg-gradient-to-r from-[hsl(280,95%,52%)] via-[hsl(180,85%,48%)] to-[hsl(90,80%,48%)] bg-clip-text text-transparent">
          Build Your Profile
        </h1>
        <p className="text-center text-[hsl(var(--muted-foreground))] mb-4 text-sm">
          Set up your profile and connect your accounts
        </p>

        {/* Profile Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
            Profile Info
          </h2>

          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 mb-3">
            {/* Profile Picture */}
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center overflow-hidden border-2 border-[hsl(var(--primary))]">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
                  )}
                </div>
                <label
                  htmlFor="profile-pic-upload"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center cursor-pointer hover:bg-[hsl(260,80%,55%)] transition-colors"
                >
                  <Camera className="w-3 h-3 text-white" />
                </label>
                <input
                  id="profile-pic-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>

              {/* Username */}
              <div className="flex-1">
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  placeholder="Enter your username"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
            Connect Services
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {/* Spotify */}
            <div className={`p-3 rounded-xl border transition-all duration-300 ${
              profile.connectedServices.spotify
                ? "border-[hsl(var(--primary))] bg-gradient-to-r from-green-500 to-green-600 bg-opacity-10"
                : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music className="w-6 h-6 text-white" />
                  <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                    Spotify
                  </span>
                </div>
                {profile.connectedServices.spotify ? (
                  <button
                    onClick={handleSpotifyDisconnect}
                    className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleSpotifyConnect}
                    className="px-3 py-1 text-xs rounded-lg bg-[hsl(var(--primary))] text-white hover:bg-[hsl(260,80%,55%)]"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>

            {/* Trakt */}
            <div className={`p-3 rounded-xl border transition-all duration-300 ${
              profile.connectedServices.trakt
                ? "border-[hsl(var(--primary))] bg-gradient-to-r from-red-500 to-red-600 bg-opacity-10"
                : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tv className="w-6 h-6 text-white" />
                  <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                    Trakt
                  </span>
                </div>
                {profile.connectedServices.trakt ? (
                  <button
                    onClick={handleTraktDisconnect}
                    className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleTraktConnect}
                    className="px-3 py-1 text-xs rounded-lg bg-[hsl(var(--primary))] text-white hover:bg-[hsl(260,80%,55%)]"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>

            {/* Steam */}
            <div className={`p-3 rounded-xl border transition-all duration-300 ${
              profile.connectedServices.steam
                ? "border-[hsl(var(--primary))] bg-gradient-to-r from-blue-500 to-blue-600 bg-opacity-10"
                : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="w-6 h-6 text-white" />
                  <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                    Steam
                  </span>
                </div>
                {profile.connectedServices.steam && (
                  <button
                    onClick={handleSteamDisconnect}
                    className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    Disconnect
                  </button>
                )}
              </div>
              {!profile.connectedServices.steam && (
                <div className="mt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={steamInput}
                      onChange={(e) => setSteamInput(e.target.value)}
                      placeholder="Steam profile URL or ID..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))]"
                      onKeyPress={(e) => e.key === 'Enter' && handleSteamConnect()}
                    />
                    <button
                      onClick={handleSteamConnect}
                      disabled={steamLoading}
                      className="px-3 py-1.5 text-xs rounded-lg bg-[hsl(var(--primary))] text-white hover:bg-[hsl(260,80%,55%)] disabled:opacity-50"
                    >
                      {steamLoading ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                  {steamError && (
                    <p className="text-xs text-red-500 mt-1">{steamError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Music Interests */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
            Music Genres
          </h2>

          {/* Selected Genres */}
          {profile.musicGenres.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {profile.musicGenres.map((genre) => (
                <div
                  key={genre}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[hsl(280,95%,52%)] to-[hsl(180,85%,48%)] text-white text-xs font-medium"
                >
                  {genre}
                  <button
                    onClick={() => removeGenre(genre)}
                    className="ml-1 opacity-70 hover:opacity-100 transition-opacity text-sm leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Custom Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={customGenreInput}
              onChange={(e) => setCustomGenreInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && customGenreInput.trim()) {
                  addGenre(customGenreInput.trim());
                }
              }}
              placeholder="Add a music genre..."
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all"
            />
            <button
              onClick={() => customGenreInput.trim() && addGenre(customGenreInput.trim())}
              className="px-3 py-2 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(260,80%,55%)] text-[hsl(var(--primary-foreground))] font-semibold transition-all flex items-center gap-1.5 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>

          {/* Suggested Genres */}
          <div className="space-y-2">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Popular genres:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {MUSIC_GENRES.filter(g => !profile.musicGenres.includes(g)).slice(0, 9).map((genre) => (
                <button
                  key={genre}
                  onClick={() => addGenre(genre)}
                  className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gaming Interests */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
            Favorite Games
          </h2>

          {/* Selected Games */}
          {profile.favoriteGames.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {profile.favoriteGames.map((game) => (
                <div
                  key={game}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[hsl(280,95%,52%)] to-[hsl(180,85%,48%)] text-white text-xs font-medium"
                >
                  {game}
                  <button
                    onClick={() => removeGame(game)}
                    className="ml-1 opacity-70 hover:opacity-100 transition-opacity text-sm leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Custom Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={customGameInput}
              onChange={(e) => setCustomGameInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && customGameInput.trim()) {
                  addGame(customGameInput.trim());
                }
              }}
              placeholder="Add a game..."
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all"
            />
            <button
              onClick={() => customGameInput.trim() && addGame(customGameInput.trim())}
              className="px-3 py-2 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(260,80%,55%)] text-[hsl(var(--primary-foreground))] font-semibold transition-all flex items-center gap-1.5 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>

          {/* Suggested Games */}
          <div className="space-y-2">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Popular games:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {POPULAR_GAMES.filter(g => !profile.favoriteGames.includes(g)).slice(0, 9).map((game) => (
                <button
                  key={game}
                  onClick={() => addGame(game)}
                  className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                >
                  {game}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shows & Movies Interests */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
            Favorite Shows & Movies
          </h2>

          {/* Selected Shows */}
          {profile.favoriteShows.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {profile.favoriteShows.map((show) => (
                <div
                  key={show}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[hsl(280,95%,52%)] to-[hsl(180,85%,48%)] text-white text-xs font-medium"
                >
                  {show}
                  <button
                    onClick={() => removeShow(show)}
                    className="ml-1 opacity-70 hover:opacity-100 transition-opacity text-sm leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Custom Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={customShowInput}
              onChange={(e) => setCustomShowInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && customShowInput.trim()) {
                  addShow(customShowInput.trim());
                }
              }}
              placeholder="Add a show or movie..."
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all"
            />
            <button
              onClick={() => customShowInput.trim() && addShow(customShowInput.trim())}
              className="px-3 py-2 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(260,80%,55%)] text-[hsl(var(--primary-foreground))] font-semibold transition-all flex items-center gap-1.5 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>

          {/* Suggested Shows */}
          <div className="space-y-2">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Popular shows:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {POPULAR_SHOWS.filter(s => !profile.favoriteShows.includes(s)).slice(0, 9).map((show) => (
                <button
                  key={show}
                  onClick={() => addShow(show)}
                  className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                >
                  {show}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-[hsl(280,95%,52%)] to-[hsl(180,85%,48%)] hover:from-[hsl(280,95%,47%)] hover:to-[hsl(180,85%,43%)] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-base"
        >
          Start Exploring
        </button>

        {/* Skip Button */}
        <button
          onClick={handleContinue}
          className="w-full py-2 px-4 mt-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] font-medium transition-colors text-sm"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
