import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Callback() {
  const navigate = useNavigate();
  const { handleCallback } = useAuth();
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
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      });
    }
  }, []); // Empty dependency array - only run once

  return <div>Authenticating...</div>;
}

export default Callback;
