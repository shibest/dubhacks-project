import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../contexts/ApiContext';
import { extractSteamId } from '../../utils/steamId';
import { getPlayerSummary, getOwnedGames } from '../../api/steam';
import { getUserTopArtists, getUserTopTracks } from '../../api/spotify';
import { getUserWatchlist } from '../../api/trakt';
import { X, User, Sparkles } from 'lucide-react';

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

function ProfilePage() {
  const navigate = useNavigate();
  const { spotifyAuth, traktAuth } = useApi();

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
  const [activeTab, setActiveTab] = useState<'profile' | 'music' | 'gaming' | 'shows' | 'summary'>('profile');
  const [profileSummary, setProfileSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Input states
  const [customGenre, setCustomGenre] = useState('');
  const [customGame, setCustomGame] = useState('');
  const [customShow, setCustomShow] = useState('');
  const [steamInput, setSteamInput] = useState('');
  const [steamLoading, setSteamLoading] = useState(false);
  const [steamError, setSteamError] = useState<string | null>(null);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }, [profile]);

  // Music Genre Functions
  const addGenre = (genre: string) => {
    if (!profile.musicGenres.includes(genre)) {
      setProfile({
        ...profile,
        musicGenres: [...profile.musicGenres, genre]
      });
    }
    setCustomGenre('');
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
    setCustomGame('');
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
    setCustomShow('');
  };

  const removeShow = (show: string) => {
    setProfile({
      ...profile,
      favoriteShows: profile.favoriteShows.filter(s => s !== show)
    });
  };

  // Service Connection Handlers
  const handleSpotifyConnect = () => {
    spotifyAuth.login();
  };

  const handleSpotifyDisconnect = () => {
    spotifyAuth.logout();
    setProfile({
      ...profile,
      connectedServices: { ...profile.connectedServices, spotify: false }
    });
  };

  const handleTraktConnect = () => {
    traktAuth.login();
  };

  const handleTraktDisconnect = () => {
    traktAuth.logout();
    setProfile({
      ...profile,
      connectedServices: { ...profile.connectedServices, trakt: false }
    });
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
        setProfile({
          ...profile,
          connectedServices: { ...profile.connectedServices, steam: true }
        });
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
    setProfile({
      ...profile,
      connectedServices: { ...profile.connectedServices, steam: false }
    });
    setSteamInput('');
    setSteamError(null);
  };

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

  // Generate profile summary
  const generateSummary = async () => {
    setSummaryLoading(true);

    try {
      let summaryParts: string[] = [];

      // Music section
      if (profile.connectedServices.spotify && spotifyAuth.isAuthenticated) {
        try {
          const accessToken = spotifyAuth.accessToken;
          const [topArtists, topTracks] = await Promise.all([
            getUserTopArtists(accessToken, 'short_term', 5),
            getUserTopTracks(accessToken, 'short_term', 5)
          ]);

          const artistNames = topArtists.items?.map((a: any) => a.name).join(', ') || '';
          const trackNames = topTracks.items?.map((t: any) => `${t.name} by ${t.artists[0].name}`).join(', ') || '';

          if (artistNames) {
            summaryParts.push(`🎵 Music lover who's been vibing to ${artistNames}. Recent favorites include ${trackNames}.`);
          }
        } catch (error) {
          console.error('Error fetching Spotify data:', error);
        }
      } else if (profile.musicGenres.length > 0) {
        summaryParts.push(`🎵 Music enthusiast who loves ${profile.musicGenres.join(', ')}.`);
      }

      // Gaming section
      if (profile.connectedServices.steam) {
        try {
          const steamId = localStorage.getItem('steam_id');
          if (steamId) {
            const gamesData = await getOwnedGames(steamId);
            const games = gamesData.response?.games || [];
            const topGames = games
              .sort((a: any, b: any) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
              .slice(0, 5);

            if (topGames.length > 0) {
              const gamesList = topGames.map((g: any) =>
                `${g.name} (${Math.round((g.playtime_forever || 0) / 60)}h)`
              ).join(', ');
              summaryParts.push(`🎮 Gamer with ${games.length} games in library. Most played: ${gamesList}.`);
            }
          }
        } catch (error) {
          console.error('Error fetching Steam data:', error);
        }
      } else if (profile.favoriteGames.length > 0) {
        summaryParts.push(`🎮 Gamer who enjoys ${profile.favoriteGames.join(', ')}.`);
      }

      // Shows/Movies section
      if (profile.connectedServices.trakt && traktAuth.isAuthenticated) {
        try {
          const accessToken = traktAuth.accessToken;
          const watchlist = await getUserWatchlist(accessToken);
          const shows = watchlist.shows || [];
          const movies = watchlist.movies || [];

          const showTitles = shows.slice(0, 5).map((item: any) => item.show?.title).filter(Boolean);
          const movieTitles = movies.slice(0, 5).map((item: any) => item.movie?.title).filter(Boolean);

          if (showTitles.length > 0 || movieTitles.length > 0) {
            const watchingText = showTitles.length > 0 ? `Currently tracking shows like ${showTitles.join(', ')}` : '';
            const moviesText = movieTitles.length > 0 ? `and movies like ${movieTitles.join(', ')}` : '';
            summaryParts.push(`📺 Binge-watcher ${watchingText} ${moviesText}.`);
          }
        } catch (error) {
          console.error('Error fetching Trakt data:', error);
        }
      } else if (profile.favoriteShows.length > 0) {
        summaryParts.push(`📺 TV/Movie fan who loves ${profile.favoriteShows.join(', ')}.`);
      }

      const finalSummary = summaryParts.length > 0
        ? summaryParts.join('\n\n')
        : "Complete your profile by adding your interests or connecting your accounts to generate a personalized summary!";

      setProfileSummary(finalSummary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setProfileSummary('Unable to generate summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Auto-generate summary when tab is opened
  useEffect(() => {
    if (activeTab === 'summary' && !profileSummary) {
      generateSummary();
    }
  }, [activeTab]);

  const handleSave = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Build Your Profile
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '30px',
          fontSize: '16px'
        }}>
          Tell us about your interests or connect your accounts
        </p>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          borderBottom: '2px solid #f0f0f0',
          flexWrap: 'wrap'
        }}>
          <TabButton
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
            icon="👤"
            label="Profile"
          />
          <TabButton
            active={activeTab === 'music'}
            onClick={() => setActiveTab('music')}
            icon="🎵"
            label="Music"
          />
          <TabButton
            active={activeTab === 'gaming'}
            onClick={() => setActiveTab('gaming')}
            icon="🎮"
            label="Gaming"
          />
          <TabButton
            active={activeTab === 'shows'}
            onClick={() => setActiveTab('shows')}
            icon="📺"
            label="Shows"
          />
          <TabButton
            active={activeTab === 'summary'}
            onClick={() => setActiveTab('summary')}
            icon="✨"
            label="Summary"
          />
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              {/* Profile Picture */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '4px solid #667eea',
                  margin: '0 auto'
                }}>
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={48} color="#999" />
                  )}
                </div>
                <label
                  htmlFor="profile-pic-upload"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 'calc(50% - 70px)',
                    backgroundColor: '#667eea',
                    color: 'white',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '3px solid white',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                >
                  📷
                </label>
                <input
                  id="profile-pic-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Username */}
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '8px',
                  textAlign: 'left'
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  placeholder="Enter your username"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    textAlign: 'center',
                    fontWeight: '500'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px',
              marginTop: '30px'
            }}>
              <div style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎵</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                  {profile.musicGenres.length}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Music Genres
                </div>
              </div>
              <div style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎮</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                  {profile.favoriteGames.length}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Favorite Games
                </div>
              </div>
              <div style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📺</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                  {profile.favoriteShows.length}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Shows & Movies
                </div>
              </div>
            </div>

            {/* Connected Services */}
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                Connected Services
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <ServiceBadge
                  name="Spotify"
                  icon="🎵"
                  connected={profile.connectedServices.spotify}
                  color="#1DB954"
                />
                <ServiceBadge
                  name="Steam"
                  icon="🎮"
                  connected={profile.connectedServices.steam}
                  color="#00adee"
                />
                <ServiceBadge
                  name="Trakt"
                  icon="📺"
                  connected={profile.connectedServices.trakt}
                  color="#ED1C24"
                />
              </div>
            </div>
          </div>
        )}

        {/* Music Tab */}
        {activeTab === 'music' && (
          <div>
            <ServiceConnectBanner
              connected={profile.connectedServices.spotify}
              serviceName="Spotify"
              icon="🎵"
              color="#1DB954"
              description="Auto-import your music taste"
              onConnect={handleSpotifyConnect}
              onDisconnect={handleSpotifyDisconnect}
              onViewProfile={() => navigate('/spotify/profile')}
            />

            <div style={{ marginTop: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                Favorite Music Genres
              </h3>

              {/* Selected Genres */}
              {profile.musicGenres.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                  {profile.musicGenres.map(genre => (
                    <Tag key={genre} label={genre} onRemove={() => removeGenre(genre)} />
                  ))}
                </div>
              )}

              {/* Popular Genres */}
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                Popular genres:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                {MUSIC_GENRES.filter(g => !profile.musicGenres.includes(g)).slice(0, 10).map(genre => (
                  <button
                    key={genre}
                    onClick={() => addGenre(genre)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '14px',
                      backgroundColor: '#f0f0f0',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  >
                    + {genre}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="Add custom genre..."
                  style={{
                    flex: 1,
                    padding: '10px 15px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && customGenre.trim() && addGenre(customGenre.trim())}
                />
                <button
                  onClick={() => customGenre.trim() && addGenre(customGenre.trim())}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#1DB954',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gaming Tab */}
        {activeTab === 'gaming' && (
          <div>
            {/* Steam Connection */}
            {!profile.connectedServices.steam ? (
              <div style={{
                padding: '20px',
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                border: '2px solid #00adee',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <span style={{ fontSize: '24px' }}>🎮</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Connect Steam</h4>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                      Auto-import your game library
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={steamInput}
                    onChange={(e) => setSteamInput(e.target.value)}
                    placeholder="Paste Steam profile URL or ID..."
                    style={{
                      flex: 1,
                      padding: '10px 15px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSteamConnect()}
                  />
                  <button
                    onClick={handleSteamConnect}
                    disabled={steamLoading}
                    style={{
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      backgroundColor: '#00adee',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: steamLoading ? 'not-allowed' : 'pointer',
                      opacity: steamLoading ? 0.6 : 1
                    }}
                  >
                    {steamLoading ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
                {steamError && (
                  <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#dc3545' }}>
                    {steamError}
                  </p>
                )}
              </div>
            ) : (
              <div style={{
                padding: '15px',
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                border: '2px solid #00adee',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🎮</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#00adee' }}>
                      ✓ Steam Connected
                    </h4>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                      Your game library is synced
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => navigate('/steam/profile')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      backgroundColor: '#00adee',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    View Profile
                  </button>
                  <button
                    onClick={handleSteamDisconnect}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      backgroundColor: '#f0f0f0',
                      color: '#666',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                Favorite Games
              </h3>

              {/* Selected Games */}
              {profile.favoriteGames.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                  {profile.favoriteGames.map(game => (
                    <Tag key={game} label={game} onRemove={() => removeGame(game)} color="#00adee" />
                  ))}
                </div>
              )}

              {/* Popular Games */}
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                Popular games:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                {POPULAR_GAMES.filter(g => !profile.favoriteGames.includes(g)).slice(0, 10).map(game => (
                  <button
                    key={game}
                    onClick={() => addGame(game)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '14px',
                      backgroundColor: '#f0f0f0',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  >
                    + {game}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={customGame}
                  onChange={(e) => setCustomGame(e.target.value)}
                  placeholder="Add custom game..."
                  style={{
                    flex: 1,
                    padding: '10px 15px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && customGame.trim() && addGame(customGame.trim())}
                />
                <button
                  onClick={() => customGame.trim() && addGame(customGame.trim())}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#00adee',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shows Tab */}
        {activeTab === 'shows' && (
          <div>
            <ServiceConnectBanner
              connected={profile.connectedServices.trakt}
              serviceName="Trakt"
              icon="📺"
              color="#ED1C24"
              description="Auto-import your watchlist"
              onConnect={handleTraktConnect}
              onDisconnect={handleTraktDisconnect}
              onViewProfile={() => navigate('/trakt/watchlist')}
            />

            <div style={{ marginTop: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                Favorite Shows & Movies
              </h3>

              {/* Selected Shows */}
              {profile.favoriteShows.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                  {profile.favoriteShows.map(show => (
                    <Tag key={show} label={show} onRemove={() => removeShow(show)} color="#ED1C24" />
                  ))}
                </div>
              )}

              {/* Popular Shows */}
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                Popular shows:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                {POPULAR_SHOWS.filter(s => !profile.favoriteShows.includes(s)).slice(0, 10).map(show => (
                  <button
                    key={show}
                    onClick={() => addShow(show)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '14px',
                      backgroundColor: '#f0f0f0',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  >
                    + {show}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={customShow}
                  onChange={(e) => setCustomShow(e.target.value)}
                  placeholder="Add custom show or movie..."
                  style={{
                    flex: 1,
                    padding: '10px 15px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && customShow.trim() && addShow(customShow.trim())}
                />
                <button
                  onClick={() => customShow.trim() && addShow(customShow.trim())}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#ED1C24',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div>
            <div style={{
              padding: '30px',
              backgroundColor: '#f8f9fa',
              borderRadius: '16px',
              border: '2px solid #667eea20',
              minHeight: '300px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <Sparkles size={24} color="#667eea" />
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#333',
                  margin: 0
                }}>
                  Your Profile Summary
                </h3>
              </div>

              {summaryLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{
                    display: 'inline-block',
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f0f0f0',
                    borderTop: '4px solid #667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <p style={{ marginTop: '20px', color: '#666' }}>
                    Generating your personalized summary...
                  </p>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : (
                <>
                  <div style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: '#444',
                    whiteSpace: 'pre-line',
                    marginBottom: '20px'
                  }}>
                    {profileSummary || "Complete your profile by adding your interests or connecting your accounts to generate a personalized summary!"}
                  </div>

                  <button
                    onClick={generateSummary}
                    style={{
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 auto',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Sparkles size={16} />
                    Regenerate Summary
                  </button>
                </>
              )}
            </div>

            {/* Preview Card */}
            <div style={{
              marginTop: '30px',
              padding: '20px',
              backgroundColor: 'white',
              border: '2px solid #e0e0e0',
              borderRadius: '12px'
            }}>
              <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Profile Preview
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '3px solid #667eea'
                }}>
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={28} color="#999" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 5px 0' }}>
                    {profile.username || 'Your Username'}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                    {profile.musicGenres.length + profile.favoriteGames.length + profile.favoriteShows.length} interests • {
                      [profile.connectedServices.spotify, profile.connectedServices.steam, profile.connectedServices.trakt]
                        .filter(Boolean).length
                    } connected services
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '15px 40px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            Save & Continue
          </button>
          <p style={{ marginTop: '15px', fontSize: '14px', color: '#999' }}>
            Your preferences are saved automatically
          </p>
        </div>
      </div>
    </div>
  );
}

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '15px',
        fontSize: '16px',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
        color: active ? '#667eea' : '#999',
        border: 'none',
        borderBottom: active ? '3px solid #667eea' : '3px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      <span style={{ fontSize: '20px' }}>{icon}</span>
      {label}
    </button>
  );
}

// Tag Component
interface TagProps {
  label: string;
  onRemove: () => void;
  color?: string;
}

function Tag({ label, onRemove, color = '#667eea' }: TagProps) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: `${color}20`,
      color: color,
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500'
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          color: color,
          opacity: 0.7
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Service Connect Banner Component
interface ServiceConnectBannerProps {
  connected: boolean;
  serviceName: string;
  icon: string;
  color: string;
  description: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onViewProfile: () => void;
}

function ServiceConnectBanner({
  connected,
  serviceName,
  icon,
  color,
  description,
  onConnect,
  onDisconnect,
  onViewProfile
}: ServiceConnectBannerProps) {
  if (connected) {
    return (
      <div style={{
        padding: '15px',
        backgroundColor: `${color}10`,
        borderRadius: '12px',
        border: `2px solid ${color}`,
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>{icon}</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color }}>
              ✓ {serviceName} Connected
            </h4>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
              Your data is synced
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onViewProfile}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: color,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            View Profile
          </button>
          <button
            onClick={onDisconnect}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#f0f0f0',
              color: '#666',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: `${color}10`,
      borderRadius: '12px',
      border: `2px solid ${color}`,
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>{icon}</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
              Connect {serviceName}
            </h4>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
              {description}
            </p>
          </div>
        </div>
        <button
          onClick={onConnect}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            backgroundColor: color,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Connect
        </button>
      </div>
    </div>
  );
}

// Service Badge Component
interface ServiceBadgeProps {
  name: string;
  icon: string;
  connected: boolean;
  color: string;
}

function ServiceBadge({ name, icon, connected, color }: ServiceBadgeProps) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      backgroundColor: connected ? `${color}20` : '#f0f0f0',
      border: `2px solid ${connected ? color : '#ddd'}`,
      borderRadius: '25px',
      fontSize: '14px',
      fontWeight: '500',
      color: connected ? color : '#999'
    }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      {name}
      {connected && (
        <span style={{ marginLeft: '4px', fontSize: '12px' }}>✓</span>
      )}
    </div>
  );
}

export default ProfilePage;
