import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ApiProvider } from './contexts/ApiContext';

// Client routes (priority)
import OnboardingFlow from './pages/OnboardingFlow';
import Auth from './pages/Auth';
import Connections from './pages/Connections';
import Index from './pages/Index';

// Trakt routes
import UserWatchlist from './pages/UserWatchlist';
import ProfileSelect from './pages/ProfileSelect';

// Spotify routes
import SpotifyProfile from './pages/SpotifyProfile';

// Unified callback component
import ApiCallback from './components/ApiCallback';

import './global.css';
import './App.css';

const queryClient = new QueryClient();

function App() {
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ApiProvider>
          <BrowserRouter>
            <Routes>
              {/* Always redirect / to /intro for animation start */}
              <Route path="/" element={<Navigate to="/intro" replace />} />
              {/* Animation/Intro screen loads first */}
              <Route path="/intro" element={<OnboardingFlow />} />
              {/* Auth screen after intro */}
              <Route path="/auth" element={<Auth />} />
              {/* Connections screen after auth */}
              <Route path="/connections" element={<Connections />} />
              {/* Dashboard (main app) */}
              <Route path="/dashboard" element={<Index />} />
              {/* /home also shows dashboard */}
              <Route path="/home" element={<Index />} />

              {/* Trakt routes */}
              <Route path="/trakt/connect" element={<ProfileSelect />} />
              <Route path="/callback" element={<ApiCallback service="trakt" />} />
              <Route path="/trakt/watchlist" element={<UserWatchlist />} />

              {/* Spotify routes */}
              <Route path="/spotify/callback" element={<ApiCallback service="spotify" />} />
              <Route path="/spotify/profile" element={<SpotifyProfile />} />
            </Routes>
          </BrowserRouter>
        </ApiProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
