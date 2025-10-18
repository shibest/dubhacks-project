import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string) => Promise<boolean>;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('trakt_access_token')
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem('trakt_refresh_token')
  );
  const [isAuthenticated, setIsAuthenticated] = useState(!!accessToken);

  // For Vite, use import.meta.env instead of process.env
  const TRAKT_CLIENT_ID = import.meta.env.VITE_TRAKT_CLIENT_ID;
  const REDIRECT_URI = 'https://myceli.us/callback';
  const BACKEND_URL = 'https://myceli.us';

  // Initiate OAuth flow
  const login = () => {
    const authUrl = `https://trakt.tv/oauth/authorize?response_type=code&client_id=${TRAKT_CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
    window.location.href = authUrl;
  };

  // Exchange code for tokens
  const handleCallback = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token exchange failed:', errorData);
        return false;
      }

      const data: TokenResponse = await response.json();

      if (!data.access_token || !data.refresh_token) {
        console.error('Invalid token response:', data);
        return false;
      }

      console.log('Tokens received successfully');
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setIsAuthenticated(true);

      localStorage.setItem('trakt_access_token', data.access_token);
      localStorage.setItem('trakt_refresh_token', data.refresh_token);

      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  };

  // Refresh access token
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken) {
      console.error('No refresh token available');
      logout();
      return false;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token refresh failed:', errorData);
        logout();
        return false;
      }

      const data: TokenResponse = await response.json();

      setAccessToken(data.access_token);
      localStorage.setItem('trakt_access_token', data.access_token);

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('trakt_access_token');
    localStorage.removeItem('trakt_refresh_token');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      accessToken,
      login,
      logout,
      handleCallback,
      refreshAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};
