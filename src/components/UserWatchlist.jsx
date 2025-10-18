// Edit and redesign based on preferences

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserWatchlist } from '../api/trakt';

function UserWatchlist() {
  const { accessToken, refreshAccessToken, isAuthenticated, login } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchWatchlist = async () => {
      try {
        const data = await getUserWatchlist(accessToken);
        setWatchlist(data);
      } catch (err) {
        if (err.message === 'TOKEN_EXPIRED') {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            // Retry the request
            const data = await getUserWatchlist(accessToken);
            setWatchlist(data);
          }
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [accessToken, isAuthenticated, refreshAccessToken]);

  if (!isAuthenticated) {
    return (
      <div>
        <h2>Please login to view your watchlist</h2>
        <button onClick={login}>Login with Trakt</button>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Your Watchlist</h2>
      {watchlist.map(item => (
        <div key={item.id}>
          <h3>{item.show.title}</h3>
          <p>{item.show.overview}</p>
        </div>
      ))}
    </div>
  );
}

export default UserWatchlist;