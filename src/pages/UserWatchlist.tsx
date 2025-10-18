import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserWatchlist } from '../api/trakt';

interface Show {
  title: string;
  overview?: string;
  year?: number;
}

interface Movie {
  title: string;
  overview?: string;
  year?: number;
}

interface ShowWatchlistItem {
  id: number;
  listed_at: string;
  show: Show;
}

interface MovieWatchlistItem {
  id: number;
  listed_at: string;
  movie: Movie;
}

interface WatchlistData {
  shows: ShowWatchlistItem[];
  movies: MovieWatchlistItem[];
}

function UserWatchlist() {
  const { accessToken, refreshAccessToken, isAuthenticated, login } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistData>({ shows: [], movies: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

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
  }, [accessToken, isAuthenticated, refreshAccessToken]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleRefresh = () => {
    fetchWatchlist();
  };

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

  const totalItems = watchlist.shows.length + watchlist.movies.length;

  return (
    <div style={{ margin: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Your Watchlist ({totalItems} items)</h2>
        <button onClick={handleRefresh} style={{ cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      {watchlist.shows.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3>TV Shows ({watchlist.shows.length})</h3>
          {watchlist.shows.map(item => (
            <div key={item.id} style={{ marginBottom: '15px', border: '1px solid #ccc', borderRadius: '5px', padding: '8px 0' }}>
              <h4>{item.show.title} {item.show.year && `(${item.show.year})`}</h4>
              {item.show.overview && <p>{item.show.overview}</p>}
            </div>
          ))}
        </div>
      )}

      {watchlist.movies.length > 0 && (
        <div>
          <h3>Movies ({watchlist.movies.length})</h3>
          {watchlist.movies.map(item => (
            <div key={item.id} style={{ marginBottom: '15px', border: '1px solid #ccc', borderRadius: '5px', padding: '8px 0' }}>
              <h4>{item.movie.title} {item.movie.year && `(${item.movie.year})`}</h4>
              {item.movie.overview && <p>{item.movie.overview}</p>}
            </div>
          ))}
        </div>
      )}

      {totalItems === 0 && (
        <p>Your watchlist is empty. Add some shows or movies on Trakt!</p>
      )}
    </div>
  );
}

export default UserWatchlist;
