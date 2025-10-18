import { useState, useEffect, useCallback } from 'react';
import { useSpotify } from '../contexts/SpotifyContext';
import {
  getUserProfile,
  getUserTopArtists,
  getUserTopTracks,
  getRecentlyPlayed,
  getUserPlaylists
} from '../api/spotify';

interface SpotifyUser {
  display_name: string;
  email: string;
  images: { url: string }[];
  followers: { total: number };
  external_urls: { spotify: string };
}

interface Artist {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
}

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
}

function SpotifyProfile() {
  const { accessToken, refreshAccessToken, isAuthenticated, login, logout } = useSpotify();
  const [profile, setProfile] = useState<SpotifyUser | null>(null);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');

  const fetchSpotifyData = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const [profileData, artistsData, tracksData, recentData, playlistsData] = await Promise.all([
        getUserProfile(accessToken),
        getUserTopArtists(accessToken, timeRange, 10),
        getUserTopTracks(accessToken, timeRange, 10),
        getRecentlyPlayed(accessToken, 10),
        getUserPlaylists(accessToken, 10)
      ]);

      setProfile(profileData);
      setTopArtists(artistsData.items);
      setTopTracks(tracksData.items);
      setRecentTracks(recentData.items);
      setPlaylists(playlistsData.items);
    } catch (err) {
      if (err instanceof Error && err.message === 'TOKEN_EXPIRED') {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry
          fetchSpotifyData();
        }
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAuthenticated, refreshAccessToken, timeRange]);

  useEffect(() => {
    fetchSpotifyData();
  }, [fetchSpotifyData]);

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Connect Your Spotify Account</h2>
        <p>Link your Spotify account to see your listening stats and preferences.</p>
        <button
          onClick={login}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#1DB954',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Connect Spotify
        </button>
      </div>
    );
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading your Spotify data...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Profile Header */}
      {profile && (
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          {profile.images[0] && (
            <img
              src={profile.images[0].url}
              alt={profile.display_name}
              style={{ width: '150px', height: '150px', borderRadius: '50%', marginBottom: '20px' }}
            />
          )}
          <h1>{profile.display_name}</h1>
          <p>{profile.email}</p>
          <p>{profile.followers.total} followers</p>
          <div style={{ marginTop: '10px' }}>
            <button onClick={logout} style={{ padding: '8px 16px', marginRight: '10px', cursor: 'pointer' }}>
              Disconnect Spotify
            </button>
            <button onClick={fetchSpotifyData} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              Refresh Data
            </button>
          </div>
        </div>
      )}

      {/* Time Range Selector */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <label>Time Range: </label>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          style={{ padding: '8px', marginLeft: '10px' }}
        >
          <option value="short_term">Last 4 Weeks</option>
          <option value="medium_term">Last 6 Months</option>
          <option value="long_term">All Time</option>
        </select>
      </div>

      {/* Top Artists */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Your Top Artists</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
          {topArtists.map((artist, idx) => (
            <div key={artist.id} style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  top: '5px',
                  left: '5px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '50%',
                  fontWeight: 'bold'
                }}>
                  {idx + 1}
                </span>
                {artist.images[0] && (
                  <img
                    src={artist.images[0].url}
                    alt={artist.name}
                    style={{ width: '100%', aspectRatio: '1', borderRadius: '50%', objectFit: 'cover' }}
                  />
                )}
              </div>
              <h4 style={{ marginTop: '10px' }}>{artist.name}</h4>
              <p style={{ fontSize: '12px', color: '#888' }}>
                {artist.genres.slice(0, 2).join(', ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Tracks */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Your Top Tracks</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {topTracks.map((track, idx) => (
            <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', border: '1px solid #333', borderRadius: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px', minWidth: '30px' }}>{idx + 1}</span>
              {track.album.images[0] && (
                <img
                  src={track.album.images[0].url}
                  alt={track.name}
                  style={{ width: '60px', height: '60px', borderRadius: '4px' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0 }}>{track.name}</h4>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#888' }}>
                  {track.artists.map(a => a.name).join(', ')}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{track.album.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Played */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Recently Played</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recentTracks.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '8px' }}>
              {item.track.album.images[0] && (
                <img
                  src={item.track.album.images[0].url}
                  alt={item.track.name}
                  style={{ width: '50px', height: '50px', borderRadius: '4px' }}
                />
              )}
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{item.track.name}</p>
                <p style={{ margin: '2px 0', fontSize: '12px', color: '#888' }}>
                  {item.track.artists.map((a: any) => a.name).join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Playlists */}
      <section>
        <h2>Your Playlists</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {playlists.map((playlist) => (
            <div key={playlist.id} style={{ border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
              {playlist.images[0] && (
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                />
              )}
              <div style={{ padding: '10px' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>{playlist.name}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                  {playlist.tracks.total} tracks
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SpotifyProfile;
