import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserWatchlist } from '../api/trakt';

interface Show {
  title: string;
  overview: string;
}

interface WatchlistItem {
  id: number;
  show: Show;
}

function UserWatchlist() {
  const { accessToken, refreshAccessToken, isAuthenticated, login } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchWatchlist = async () => {
      try {
        const data = await getUserWatchlist(accessToken);
        setWatchlist(data);
      } catch (err) {
        if (err instanceof Error && err.message === 'TOKEN_EXPIRED') {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            // Retry the request
            const data = await getUserWatchlist(accessToken);
            setWatchlist(data);
          }
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
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
