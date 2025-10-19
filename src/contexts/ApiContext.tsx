import { createContext, useContext, useState, ReactNode } from 'react';

type ServiceType = 'spotify' | 'trakt';

interface ServiceConfig {
  clientId: string;
  redirectUri: string;
  backendUrl: string;
  scopes?: string[];
  authUrl: string;
}

interface ApiContextType {
  // Spotify
  spotifyAuth: {
    isAuthenticated: boolean;
    accessToken: string | null;
    login: () => void;
    logout: () => void;
    handleCallback: (code: string) => Promise<boolean>;
    refreshAccessToken: () => Promise<boolean>;
  };
  // Trakt
  traktAuth: {
    isAuthenticated: boolean;
    accessToken: string | null;
    login: () => void;
    logout: () => void;
    handleCallback: (code: string) => Promise<boolean>;
    refreshAccessToken: () => Promise<boolean>;
  };
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// For backwards compatibility
export const useSpotify = () => {
  const context = useApi();
  return context.spotifyAuth;
};

export const useAuth = () => {
  const context = useApi();
  return context.traktAuth;
};

interface ApiProviderProps {
  children: ReactNode;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
}

export const ApiProvider = ({ children }: ApiProviderProps) => {
  // Get URLs from environment variables
  const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Service configurations
  const services: Record<ServiceType, ServiceConfig> = {
    spotify: {
      clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      redirectUri: `${APP_URL}/spotify/callback`,
      backendUrl: BACKEND_URL,
      authUrl: 'https://accounts.spotify.com/authorize',
      scopes: [
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
      ]
    },
    trakt: {
      clientId: import.meta.env.VITE_TRAKT_CLIENT_ID,
      redirectUri: `${APP_URL}/callback`,
      backendUrl: BACKEND_URL,
      authUrl: 'https://trakt.tv/oauth/authorize'
    }
  };

  // Spotify state
  const [spotifyAccessToken, setSpotifyAccessToken] = useState<string | null>(
    localStorage.getItem('spotify_access_token')
  );
  const [spotifyRefreshToken, setSpotifyRefreshToken] = useState<string | null>(
    localStorage.getItem('spotify_refresh_token')
  );
  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(!!spotifyAccessToken);

  // Trakt state
  const [traktAccessToken, setTraktAccessToken] = useState<string | null>(
    localStorage.getItem('trakt_access_token')
  );
  const [traktRefreshToken, setTraktRefreshToken] = useState<string | null>(
    localStorage.getItem('trakt_refresh_token')
  );
  const [traktAuthenticated, setTraktAuthenticated] = useState(!!traktAccessToken);

  // Generic login function
  const createLogin = (service: ServiceType) => () => {
    const config = services[service];
    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
    });

    if (service === 'spotify' && config.scopes) {
      params.append('scope', config.scopes.join(' '));
      params.append('show_dialog', 'true');
    }

    window.location.href = `${config.authUrl}?${params}`;
  };

  // Generic callback handler
  const createCallbackHandler = (service: ServiceType) => async (code: string): Promise<boolean> => {
    const config = services[service];
    const endpoint = service === 'spotify' ? '/spotify/auth/token' : '/trakt/auth/token';

    try {
      const response = await fetch(`${config.backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`${service} token exchange failed:`, errorData);
        return false;
      }

      const data: TokenResponse = await response.json();

      if (!data.access_token) {
        console.error(`Invalid ${service} token response:`, data);
        return false;
      }

      console.log(`${service} tokens received successfully`);

      // Update state based on service
      if (service === 'spotify') {
        setSpotifyAccessToken(data.access_token);
        setSpotifyAuthenticated(true);
        localStorage.setItem('spotify_access_token', data.access_token);

        if (data.refresh_token) {
          setSpotifyRefreshToken(data.refresh_token);
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }
      } else {
        setTraktAccessToken(data.access_token);
        setTraktAuthenticated(true);
        localStorage.setItem('trakt_access_token', data.access_token);

        if (data.refresh_token) {
          setTraktRefreshToken(data.refresh_token);
          localStorage.setItem('trakt_refresh_token', data.refresh_token);
        }
      }

      return true;
    } catch (error) {
      console.error(`${service} authentication failed:`, error);
      return false;
    }
  };

  // Generic refresh token handler
  const createRefreshHandler = (service: ServiceType) => async (): Promise<boolean> => {
    const config = services[service];
    const refreshToken = service === 'spotify' ? spotifyRefreshToken : traktRefreshToken;
    const endpoint = service === 'spotify' ? '/spotify/auth/refresh' : '/trakt/auth/refresh';

    if (!refreshToken) {
      console.error(`No ${service} refresh token available`);
      if (service === 'spotify') {
        logoutSpotify();
      } else {
        logoutTrakt();
      }
      return false;
    }

    try {
      const response = await fetch(`${config.backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`${service} token refresh failed:`, errorData);
        if (service === 'spotify') {
          logoutSpotify();
        } else {
          logoutTrakt();
        }
        return false;
      }

      const data: TokenResponse = await response.json();

      if (service === 'spotify') {
        setSpotifyAccessToken(data.access_token);
        localStorage.setItem('spotify_access_token', data.access_token);
      } else {
        setTraktAccessToken(data.access_token);
        localStorage.setItem('trakt_access_token', data.access_token);
      }

      return true;
    } catch (error) {
      console.error(`${service} token refresh failed:`, error);
      if (service === 'spotify') {
        logoutSpotify();
      } else {
        logoutTrakt();
      }
      return false;
    }
  };

  // Logout functions
  const logoutSpotify = () => {
    setSpotifyAccessToken(null);
    setSpotifyRefreshToken(null);
    setSpotifyAuthenticated(false);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
  };

  const logoutTrakt = () => {
    setTraktAccessToken(null);
    setTraktRefreshToken(null);
    setTraktAuthenticated(false);
    localStorage.removeItem('trakt_access_token');
    localStorage.removeItem('trakt_refresh_token');
  };

  const contextValue: ApiContextType = {
    spotifyAuth: {
      isAuthenticated: spotifyAuthenticated,
      accessToken: spotifyAccessToken,
      login: createLogin('spotify'),
      logout: logoutSpotify,
      handleCallback: createCallbackHandler('spotify'),
      refreshAccessToken: createRefreshHandler('spotify')
    },
    traktAuth: {
      isAuthenticated: traktAuthenticated,
      accessToken: traktAccessToken,
      login: createLogin('trakt'),
      logout: logoutTrakt,
      handleCallback: createCallbackHandler('trakt'),
      refreshAccessToken: createRefreshHandler('trakt')
    }
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
};
