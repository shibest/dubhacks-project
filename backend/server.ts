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
const REDIRECT_URI = 'http://localhost:5173/callback';
const TRAKT_API_BASE = 'https://api.trakt.tv';

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

// Exchange authorization code for access token
app.post('/api/auth/token', async (req: Request<{}, {}, TokenRequestBody>, res: Response) => {
  const { code } = req.body;

  try {
    const response = await axios.post<TraktTokenResponse>(`${TRAKT_API_BASE}/oauth/token`, {
      code,
      client_id: TRAKT_CLIENT_ID,
      client_secret: TRAKT_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
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
      redirect_uri: REDIRECT_URI,
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

app.listen(5000, () => {
  console.log('Backend server running on port 5000');
});
