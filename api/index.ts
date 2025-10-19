import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const APP_URL = process.env.VITE_APP_URL || 'https://myceli.us';

// Trakt OAuth routes
const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;
const TRAKT_CLIENT_SECRET = process.env.TRAKT_CLIENT_SECRET;

app.post('/trakt/token', async (req, res) => {
  try {
    const { code } = req.body;
    const response = await axios.post('https://api.trakt.tv/oauth/token', {
      code,
      client_id: TRAKT_CLIENT_ID,
      client_secret: TRAKT_CLIENT_SECRET,
      redirect_uri: `${APP_URL}/callback`,
      grant_type: 'authorization_code',
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('Trakt token error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to get access token' });
  }
});

app.use('/trakt', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const response = await axios({
      method: req.method,
      url: `https://api.trakt.tv${req.path}`,
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': TRAKT_CLIENT_ID,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      data: req.body,
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: 'Trakt API error' });
  }
});

// Spotify OAuth routes
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

app.post('/spotify/token', async (req, res) => {
  try {
    const { code } = req.body;
    const authString = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        code,
        redirect_uri: `${APP_URL}/spotify/callback`,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    res.json(response.data);
  } catch (error: any) {
    console.error('Spotify token error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to get access token' });
  }
});

app.post('/spotify/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const authString = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }),
      {
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    res.json(response.data);
  } catch (error: any) {
    console.error('Spotify refresh error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to refresh token' });
  }
});

app.use('/spotify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const response = await axios({
      method: req.method,
      url: `https://api.spotify.com/v1${req.path}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: req.query,
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: 'Spotify API error' });
  }
});

// Steam API routes
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const STEAM_API_BASE = 'https://api.steampowered.com';

app.get('/steam/resolve/:vanityUrl', async (req, res) => {
  const { vanityUrl } = req.params;
  try {
    const response = await axios.get(`${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v0001/`, {
      params: { key: STEAM_API_KEY, vanityurl: vanityUrl }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to resolve vanity URL' });
  }
});

app.get('/steam/player/summaries/:steamId', async (req, res) => {
  const { steamId } = req.params;
  try {
    const response = await axios.get(`${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/`, {
      params: { key: STEAM_API_KEY, steamids: steamId }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch player summary' });
  }
});

app.get('/steam/player/games/:steamId', async (req, res) => {
  const { steamId } = req.params;
  try {
    const response = await axios.get(`${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v0001/`, {
      params: {
        key: STEAM_API_KEY,
        steamid: steamId,
        include_appinfo: req.query.include_appinfo || '1',
        include_played_free_games: '1'
      }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel serverless
export default async (req: VercelRequest, res: VercelResponse) => {
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) reject(err);
      else resolve(undefined);
    });
  });
};
