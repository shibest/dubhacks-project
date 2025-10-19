import { useState, useEffect, useCallback } from 'react';
import {
  getPlayerSummary,
  getOwnedGames,
  getRecentlyPlayedGames,
  getFriendList
} from '../api/steam';
import { extractSteamId } from '../utils/steamId';

interface SteamPlayer {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
  communityvisibilitystate: number;
  profilestate: number;
  lastlogoff: number;
  timecreated: number;
  realname?: string;
  loccountrycode?: string;
}

interface Game {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url: string;
  img_logo_url: string;
}

interface RecentGame {
  appid: number;
  name: string;
  playtime_2weeks: number;
  playtime_forever: number;
  img_icon_url: string;
  img_logo_url: string;
}

interface Friend {
  steamid: string;
  relationship: string;
  friend_since: number;
}

function SteamProfile() {
  const [steamId, setSteamId] = useState<string>(localStorage.getItem('steam_id') || '');
  const [profile, setProfile] = useState<SteamPlayer | null>(null);
  const [ownedGames, setOwnedGames] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputSteamId, setInputSteamId] = useState(steamId);

  const fetchSteamData = useCallback(async (id: string) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const [profileData, gamesData, recentData, friendsData] = await Promise.all([
        getPlayerSummary(id),
        getOwnedGames(id, true, true),
        getRecentlyPlayedGames(id, 10),
        getFriendList(id).catch(() => ({ friendslist: { friends: [] } })) // Friends list might be private
      ]);

      // Extract player from response
      if (profileData.response?.players?.[0]) {
        setProfile(profileData.response.players[0]);
      } else {
        setError('Steam profile not found or is set to PRIVATE. Please set your Steam profile to PUBLIC in Privacy Settings and try again.');
        return;
      }

      // Extract games
      if (gamesData.response?.games) {
        // Sort by playtime
        const sortedGames = [...gamesData.response.games].sort(
          (a, b) => b.playtime_forever - a.playtime_forever
        );
        setOwnedGames(sortedGames.slice(0, 20)); // Top 20 games
      }

      // Extract recent games
      if (recentData.response?.games) {
        setRecentGames(recentData.response.games);
      }

      // Extract friends
      if (friendsData.friendslist?.friends) {
        setFriends(friendsData.friendslist.friends.slice(0, 10)); // First 10 friends
      }

      // Save Steam ID to localStorage
      localStorage.setItem('steam_id', id);
      setSteamId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Steam API error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (steamId) {
      fetchSteamData(steamId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSteamId.trim()) return;

    setLoading(true);
    setError(null);

    // Extract Steam ID from URL or validate direct ID
    const result = await extractSteamId(inputSteamId.trim());

    if (result.error || !result.id) {
      setError(result.error || 'Invalid Steam ID or URL');
      setLoading(false);
      return;
    }

    // Fetch data with the extracted Steam ID
    fetchSteamData(result.id);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('steam_id');
    setSteamId('');
    setProfile(null);
    setOwnedGames([]);
    setRecentGames([]);
    setFriends([]);
    setInputSteamId('');
  };

  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours.toLocaleString()} hours`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getPersonaState = (state: number) => {
    const states: Record<number, string> = {
      0: 'Offline',
      1: 'Online',
      2: 'Busy',
      3: 'Away',
      4: 'Snooze',
      5: 'Looking to trade',
      6: 'Looking to play'
    };
    return states[state] || 'Unknown';
  };

  if (!steamId || !profile) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <h2>Connect Your Steam Account</h2>
        <p style={{ marginBottom: '20px' }}>
          Enter your Steam profile URL or Steam ID to view your gaming profile and statistics.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={inputSteamId}
            onChange={(e) => setInputSteamId(e.target.value)}
            placeholder="Paste Steam profile URL or Steam ID..."
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#171a21',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Connect'}
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px', textAlign: 'left', border: '1px solid #ffc107' }}>
          <h3 style={{ marginTop: 0, color: '#856404' }}>⚠️ Privacy Notice</h3>
          <p style={{ margin: '10px 0', color: '#856404' }}>
            <strong>Your Steam profile must be set to PUBLIC</strong> for this app to access your data.
          </p>
          <p style={{ margin: '10px 0', fontSize: '14px', color: '#856404' }}>
            To make your profile public:
          </p>
          <ol style={{ paddingLeft: '20px', fontSize: '14px', color: '#856404' }}>
            <li>Open Steam and go to your Profile</li>
            <li>Click "Edit Profile" → "Privacy Settings"</li>
            <li>Set <strong>"Game details"</strong> to <strong>Public</strong></li>
            <li>Set <strong>"Friends List"</strong> to <strong>Public</strong> (optional)</li>
            <li>Click "Save"</li>
          </ol>
          <p style={{ margin: '10px 0', fontSize: '12px', color: '#856404', fontStyle: 'italic' }}>
            Note: Private profiles cannot be accessed by third-party apps due to Steam privacy policies.
          </p>
        </div>
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px', textAlign: 'left' }}>
          <h3 style={{ marginTop: 0 }}>Easy ways to connect:</h3>
          <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Option 1: Paste your profile URL (easiest)</p>
          <ol style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Go to your Steam profile page</li>
            <li>Copy the URL from your browser (e.g., steamcommunity.com/id/yourname)</li>
            <li>Paste it in the box above and click Connect</li>
          </ol>
          <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Option 2: Use your Steam ID64</p>
          <ol style={{ paddingLeft: '20px' }}>
            <li>Visit <a href="https://steamid.io/" target="_blank" rel="noopener noreferrer">steamid.io</a></li>
            <li>Enter your profile URL</li>
            <li>Copy your steamID64 (17 digits)</li>
            <li>Paste it above</li>
          </ol>
          <p style={{ fontSize: '14px', marginTop: '10px', color: '#666', fontStyle: 'italic' }}>
            💡 Tip: We automatically extract your Steam ID from profile URLs!
          </p>
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading your Steam data...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Profile Header */}
      {profile && (
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <img
            src={profile.avatarfull}
            alt={profile.personaname}
            style={{ width: '150px', height: '150px', borderRadius: '5px', marginBottom: '20px' }}
          />
          <h1>{profile.personaname}</h1>
          {profile.realname && <p style={{ fontSize: '18px', color: '#666' }}>{profile.realname}</p>}
          <p style={{ color: '#888' }}>
            Status: <strong>{getPersonaState(profile.personastate)}</strong>
          </p>
          {profile.timecreated && (
            <p style={{ color: '#888' }}>Member since: {formatDate(profile.timecreated)}</p>
          )}
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={handleDisconnect}
              style={{
                padding: '8px 16px',
                marginRight: '10px',
                cursor: 'pointer',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px'
              }}
            >
              Disconnect
            </button>
            <a
              href={profile.profileurl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                backgroundColor: '#171a21',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                display: 'inline-block'
              }}
            >
              View Steam Profile
            </a>
          </div>
        </div>
      )}

      {/* Game Statistics */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Game Library ({ownedGames.length} games)</h2>
        {ownedGames.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {ownedGames.slice(0, 12).map((game) => (
              <div
                key={game.appid}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  padding: '15px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <img
                  src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_logo_url}.jpg`}
                  alt={game.name}
                  style={{ width: '100%', height: 'auto', borderRadius: '5px', marginBottom: '10px' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <h3 style={{ fontSize: '16px', margin: '10px 0' }}>{game.name}</h3>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  Playtime: {formatPlaytime(game.playtime_forever)}
                </p>
                {game.playtime_2weeks && (
                  <p style={{ margin: '5px 0', color: '#888', fontSize: '14px' }}>
                    Last 2 weeks: {formatPlaytime(game.playtime_2weeks)}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#888' }}>No games found or game library is private.</p>
        )}
      </div>

      {/* Recently Played Games */}
      {recentGames.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2>Recently Played</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {recentGames.map((game) => (
              <div
                key={game.appid}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  padding: '10px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <h3 style={{ fontSize: '14px', margin: '10px 0' }}>{game.name}</h3>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                  Last 2 weeks: {formatPlaytime(game.playtime_2weeks)}
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#888' }}>
                  Total: {formatPlaytime(game.playtime_forever)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends */}
      {friends.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2>Friends ({friends.length})</h2>
          <p style={{ color: '#888' }}>
            You have {friends.length} friends on your Steam friends list.
          </p>
        </div>
      )}
    </div>
  );
}

export default SteamProfile;
