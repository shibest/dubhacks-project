import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotify } from '../contexts/SpotifyContext';

function SpotifyCallback() {
  const navigate = useNavigate();
  const { handleCallback } = useSpotify();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasProcessed.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      hasProcessed.current = true;

      handleCallback(code).then(success => {
        if (success) {
          navigate('/spotify/profile');
        } else {
          navigate('/');
        }
      });
    }
  }, []); // Empty dependency array - only run once

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Connecting to Spotify...</h2>
      <p>Please wait while we authenticate your account.</p>
    </div>
  );
}

export default SpotifyCallback;
