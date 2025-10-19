import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';

interface ApiCallbackProps {
  service: 'spotify' | 'trakt';
  successRoute?: string;
  failureRoute?: string;
}

function ApiCallback({ service, successRoute, failureRoute = '/' }: ApiCallbackProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { spotifyAuth, traktAuth } = useApi();
  const hasProcessed = useRef(false);

  // Determine which auth handler to use based on service
  const auth = service === 'spotify' ? spotifyAuth : traktAuth;

  // Default success routes based on service
  const defaultSuccessRoute = service === 'spotify' ? '/profile' : '/profile';
  const finalSuccessRoute = successRoute || defaultSuccessRoute;

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasProcessed.current) {
      return;
    }

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error(`${service} OAuth error:`, error);
      hasProcessed.current = true;
      navigate(failureRoute);
      return;
    }

    if (!code) {
      console.error(`No authorization code received for ${service}`);
      hasProcessed.current = true;
      navigate(failureRoute);
      return;
    }

    // Mark as processed before async operation
    hasProcessed.current = true;

    console.log(`Processing ${service} callback with code:`, code);

    auth.handleCallback(code)
      .then((success) => {
        if (success) {
          console.log(`${service} authentication successful!`);
          navigate(finalSuccessRoute);
        } else {
          console.error(`${service} authentication failed`);
          navigate(failureRoute);
        }
      })
      .catch((error) => {
        console.error(`${service} callback error:`, error);
        navigate(failureRoute);
      });
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <h2>Authenticating with {service === 'spotify' ? 'Spotify' : 'Trakt'}...</h2>
      <p>Please wait while we complete the authentication process.</p>
    </div>
  );
}

export default ApiCallback;
