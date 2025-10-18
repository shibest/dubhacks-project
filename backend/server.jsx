// backend/server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;
const TRAKT_CLIENT_SECRET = process.env.TRAKT_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/callback';
const TRAKT_API_BASE = 'https://api.trakt.tv';

// Exchange authorization code for access token
app.post('/api/auth/token', async (req, res) => {
  const { code } = req.body;

  try {
    const response = await axios.post(`${TRAKT_API_BASE}/oauth/token`, {
      code,
      client_id: TRAKT_CLIENT_ID,
      client_secret: TRAKT_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

// Refresh access token
app.post('/api/auth/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  try {
    const response = await axios.post(`${TRAKT_API_BASE}/oauth/token`, {
      refresh_token,
      client_id: TRAKT_CLIENT_ID,
      client_secret: TRAKT_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'refresh_token'
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Proxy endpoint for authenticated Trakt API calls
app.get('/api/trakt/*', async (req, res) => {
  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  const path = req.originalUrl.replace('/api/trakt', '');

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
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data || 'API request failed' 
    });
  }
});

app.listen(5000, () => {
  console.log('Backend server running on port 5000');
});