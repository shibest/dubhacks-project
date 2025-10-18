import express, { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;
const TRAKT_CLIENT_SECRET = process.env.TRAKT_CLIENT_SECRET;
const TRAKT_REDIRECT_URI = 'http://localhost:5173/callback';
const TRAKT_API_BASE = 'https://api.trakt.tv';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:5173/spotify/callback';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

interface TokenRequestBody {
  code?: string;
  refresh_token?: string;
}

interface TraktTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

// Exchange authorization code for access token
app.post('/api/auth/token', async (req: Request<{}, {}, TokenRequestBody>, res: Response) => {
  const { code } = req.body;

  try {
    const response = await axios.post<TraktTokenResponse>(`${TRAKT_API_BASE}/oauth/token`, {
      code,
      client_id: TRAKT_CLIENT_ID,
      client_secret: TRAKT_CLIENT_SECRET,
      redirect_uri: TRAKT_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    res.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Token exchange failed:', axiosError.response?.data || axiosError.message);
    res.status(500).json({
      error: 'Token exchange failed',
      details: axiosError.response?.data || axiosError.message
    });
  }
});

// Refresh access token
app.post('/api/auth/refresh', async (req: Request<{}, {}, TokenRequestBody>, res: Response) => {
  const { refresh_token } = req.body;

  try {
    const response = await axios.post<TraktTokenResponse>(`${TRAKT_API_BASE}/oauth/token`, {
      refresh_token,
      client_id: TRAKT_CLIENT_ID,
      client_secret: TRAKT_CLIENT_SECRET,
      redirect_uri: TRAKT_REDIRECT_URI,
      grant_type: 'refresh_token'
    });

    res.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Token refresh failed:', axiosError.response?.data || axiosError.message);
    res.status(500).json({
      error: 'Token refresh failed',
      details: axiosError.response?.data || axiosError.message
    });
  }
});

// Proxy endpoint for authenticated Trakt API calls
app.use('/api/trakt', async (req: Request, res: Response) => {
  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  const path = req.url; // This will contain everything after /api/trakt

  console.log('Trakt API request:', path, 'Token:', accessToken ? 'present' : 'missing');

  try {
    const response = await axios.get(`${TRAKT_API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': TRAKT_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    res.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Trakt API error:', axiosError.response?.data || axiosError.message);
    res.status(axiosError.response?.status || 500).json({
      error: axiosError.response?.data || 'API request failed'
    });
  }
});

// ===== SPOTIFY ROUTES =====

// Exchange Spotify authorization code for access token
app.post('/api/spotify/auth/token', async (req: Request<{}, {}, TokenRequestBody>, res: Response) => {
  const { code } = req.body;

  try {
    const authBuffer = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

    const response = await axios.post<SpotifyTokenResponse>(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        code: code || '',
        redirect_uri: SPOTIFY_REDIRECT_URI,
        grant_type: 'authorization_code'
      }),
      {
        headers: {
          'Authorization': `Basic ${authBuffer}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Spotify token exchange failed:', axiosError.response?.data || axiosError.message);
    res.status(500).json({
      error: 'Spotify token exchange failed',
      details: axiosError.response?.data || axiosError.message
    });
  }
});

// Refresh Spotify access token
app.post('/api/spotify/auth/refresh', async (req: Request<{}, {}, TokenRequestBody>, res: Response) => {
  const { refresh_token } = req.body;

  try {
    const authBuffer = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

    const response = await axios.post<SpotifyTokenResponse>(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        refresh_token: refresh_token || '',
        grant_type: 'refresh_token'
      }),
      {
        headers: {
          'Authorization': `Basic ${authBuffer}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Spotify token refresh failed:', axiosError.response?.data || axiosError.message);
    res.status(500).json({
      error: 'Spotify token refresh failed',
      details: axiosError.response?.data || axiosError.message
    });
  }
});

// Proxy endpoint for authenticated Spotify API calls
app.use('/api/spotify', async (req: Request, res: Response) => {
  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  const path = req.url; // This will contain everything after /api/spotify

  console.log('Spotify API request:', path, 'Token:', accessToken ? 'present' : 'missing');

  try {
    const response = await axios.get(`${SPOTIFY_API_BASE}${path}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Spotify API error:', axiosError.response?.data || axiosError.message);
    res.status(axiosError.response?.status || 500).json({
      error: axiosError.response?.data || 'API request failed'
    });
  }
});

app.listen(5000, () => {
  console.log('Backend server running on port 5000');
});
