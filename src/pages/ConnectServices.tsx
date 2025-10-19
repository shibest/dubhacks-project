import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import { extractSteamId } from '../utils/steamId';
import { getPlayerSummary } from '../api/steam';

interface ServiceStatus {
  connected: boolean;
  data?: any;
  error?: string;
}

function ConnectServices() {
  const navigate = useNavigate();
  const { spotifyAuth, traktAuth } = useApi();

  // Service connection states
  const [spotify, setSpotify] = useState<ServiceStatus>({
    connected: spotifyAuth.isAuthenticated
  });
  const [trakt, setTrakt] = useState<ServiceStatus>({
    connected: traktAuth.isAuthenticated
  });
  const [steam, setSteam] = useState<ServiceStatus>({
    connected: !!localStorage.getItem('steam_id')
  });

  // Steam input state
  const [steamInput, setSteamInput] = useState('');
  const [steamLoading, setSteamLoading] = useState(false);

  const handleSpotifyConnect = () => {
    spotifyAuth.login();
  };

  const handleTraktConnect = () => {
    traktAuth.login();
  };

  const handleSteamConnect = async () => {
    if (!steamInput.trim()) {
      setSteam({ connected: false, error: 'Please enter a Steam ID or profile URL' });
      return;
    }

    setSteamLoading(true);
    setSteam({ connected: false, error: undefined });

    try {
      // Extract Steam ID from URL or validate direct ID
      const result = await extractSteamId(steamInput.trim());

      if (result.error || !result.id) {
        setSteam({ connected: false, error: result.error || 'Invalid Steam ID or URL' });
        setSteamLoading(false);
        return;
      }

      // Verify the Steam profile exists and is public
      const profileData = await getPlayerSummary(result.id);

      if (profileData.response?.players?.[0]) {
        localStorage.setItem('steam_id', result.id);
        setSteam({
          connected: true,
          data: profileData.response.players[0]
        });
        setSteamInput('');
      } else {
        setSteam({
          connected: false,
          error: 'Steam profile not found or is set to PRIVATE. Please set your profile to PUBLIC.'
        });
      }
    } catch (error) {
      setSteam({
        connected: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Steam'
      });
    } finally {
      setSteamLoading(false);
    }
  };

  const handleSteamDisconnect = () => {
    localStorage.removeItem('steam_id');
    setSteam({ connected: false });
    setSteamInput('');
  };

  const handleSpotifyDisconnect = () => {
    spotifyAuth.logout();
    setSpotify({ connected: false });
  };

  const handleTraktDisconnect = () => {
    traktAuth.logout();
    setTrakt({ connected: false });
  };

  const handleContinue = () => {
    // Navigate to dashboard or next step
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
        maxWidth: '800px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
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
          Connect Your Services
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '40px',
          fontSize: '16px'
        }}>
          Link your accounts to get personalized recommendations and stats
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Spotify Service */}
          <ServiceCard
            icon="🎵"
            name="Spotify"
            description="Connect to see your music taste and listening stats"
            color="#1DB954"
            connected={spotify.connected}
            onConnect={handleSpotifyConnect}
            onDisconnect={handleSpotifyDisconnect}
            connectedText={spotifyAuth.isAuthenticated ? "Connected" : undefined}
          />

          {/* Trakt Service */}
          <ServiceCard
            icon="📺"
            name="Trakt"
            description="Connect to track your movies and TV shows"
            color="#ED1C24"
            connected={trakt.connected}
            onConnect={handleTraktConnect}
            onDisconnect={handleTraktDisconnect}
            connectedText={traktAuth.isAuthenticated ? "Connected" : undefined}
          />

          {/* Steam Service */}
          <div style={{
            border: `2px solid ${steam.connected ? '#00adee' : '#ddd'}`,
            borderRadius: '12px',
            padding: '20px',
            backgroundColor: steam.connected ? '#f0f9ff' : 'white',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{
                fontSize: '32px',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                backgroundColor: steam.connected ? '#00adee' : '#f0f0f0'
              }}>
                🎮
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                  Steam
                </h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                  Connect to showcase your gaming library and stats
                </p>
              </div>
              {steam.connected && steam.data && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#00adee', fontWeight: 'bold' }}>
                    ✓ Connected
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                    {steam.data.personaname}
                  </p>
                </div>
              )}
            </div>

            {!steam.connected ? (
              <>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={steamInput}
                    onChange={(e) => setSteamInput(e.target.value)}
                    placeholder="Paste Steam profile URL or Steam ID..."
                    style={{
                      flex: 1,
                      padding: '10px 15px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      outline: 'none'
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
                      opacity: steamLoading ? 0.6 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    {steamLoading ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
                {steam.error && (
                  <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#dc3545' }}>
                    {steam.error}
                  </p>
                )}
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
                  💡 Paste your Steam profile URL or enter your Steam ID64
                </p>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => navigate('/steam/profile')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#00adee',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  View Profile
                </button>
                <button
                  onClick={handleSteamDisconnect}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    backgroundColor: '#f0f0f0',
                    color: '#666',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button
            onClick={handleContinue}
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
            Continue to Dashboard
          </button>
          <p style={{ marginTop: '15px', fontSize: '14px', color: '#999' }}>
            You can connect services later from your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable Service Card Component
interface ServiceCardProps {
  icon: string;
  name: string;
  description: string;
  color: string;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  connectedText?: string;
}

function ServiceCard({
  icon,
  name,
  description,
  color,
  connected,
  onConnect,
  onDisconnect,
  connectedText
}: ServiceCardProps) {
  return (
    <div style={{
      border: `2px solid ${connected ? color : '#ddd'}`,
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      backgroundColor: connected ? `${color}10` : 'white',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        fontSize: '32px',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        backgroundColor: connected ? color : '#f0f0f0'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
          {name}
        </h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
          {description}
        </p>
      </div>
      {connected ? (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: color, fontWeight: 'bold' }}>
            ✓ {connectedText || 'Connected'}
          </span>
          <button
            onClick={onDisconnect}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#f0f0f0',
              color: '#666',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Disconnect
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
}

export default ConnectServices;
