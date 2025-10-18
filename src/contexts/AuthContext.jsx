// Edit and redesign based on preferences

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('trakt_access_token')
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem('trakt_refresh_token')
  );
  const [isAuthenticated, setIsAuthenticated] = useState(!!accessToken);

  const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;
  const REDIRECT_URI = 'http://localhost:3000/callback';
  const BACKEND_URL = 'http://localhost:5000';

  // Initiate OAuth flow
  const login = () => {
    const authUrl = `https://trakt.tv/oauth/authorize?response_type=code&client_id=${TRAKT_CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
    window.location.href = authUrl;
  };

  // Exchange code for tokens
  const handleCallback = async (code) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      
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
  const refreshAccessToken = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      const data = await response.json();
      
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