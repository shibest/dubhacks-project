// Edit and redesign based on preferences

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Callback() {
  const navigate = useNavigate();
  const { handleCallback } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleCallback(code).then(success => {
        if (success) {
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      });
    }
  }, [handleCallback, navigate]);

  return <div>Authenticating...</div>;
}

export default Callback;