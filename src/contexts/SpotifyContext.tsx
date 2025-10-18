import { createContext, useContext, useState, ReactNode } from 'react';

interface SpotifyContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string) => Promise<boolean>;
  refreshAccessToken: () => Promise<boolean>;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
};

interface SpotifyProviderProps {
  children: ReactNode;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
}

export const SpotifyProvider = ({ children }: SpotifyProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('spotify_access_token')
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem('spotify_refresh_token')
  );
  const [isAuthenticated, setIsAuthenticated] = useState(!!accessToken);

  const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const REDIRECT_URI = 'http://127.0.0.1:5173/spotify/callback';
  const BACKEND_URL = 'http://127.0.0.1:5000';

  // Spotify scopes - request permissions for user data
  const SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played',
    'user-library-read',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-follow-read',
    'user-read-currently-playing',
    'user-read-playback-state'
  ].join(' ');

  // Initiate OAuth flow
  const login = () => {
    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      show_dialog: 'true'
    })}`;
    window.location.href = authUrl;
  };

  // Exchange code for tokens
  const handleCallback = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/spotify/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Spotify token exchange failed:', errorData);
        return false;
      }

      const data: TokenResponse = await response.json();

      if (!data.access_token) {
        console.error('Invalid Spotify token response:', data);
        return false;
      }

      console.log('Spotify tokens received successfully');
      setAccessToken(data.access_token);

      if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
      }

      setIsAuthenticated(true);
      localStorage.setItem('spotify_access_token', data.access_token);

      return true;
    } catch (error) {
      console.error('Spotify authentication failed:', error);
      return false;
    }
  };

  // Refresh access token
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken) {
      console.error('No Spotify refresh token available');
      logout();
      return false;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/spotify/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Spotify token refresh failed:', errorData);
        logout();
        return false;
      }

      const data: TokenResponse = await response.json();

      setAccessToken(data.access_token);
      localStorage.setItem('spotify_access_token', data.access_token);

      return true;
    } catch (error) {
      console.error('Spotify token refresh failed:', error);
      logout();
      return false;
    }
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
  };

  return (
    <SpotifyContext.Provider value={{
      isAuthenticated,
      accessToken,
      login,
      logout,
      handleCallback,
      refreshAccessToken
    }}>
      {children}
    </SpotifyContext.Provider>
  );
};
