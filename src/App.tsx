import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ApiProvider } from './contexts/ApiContext';

// Client routes (priority)
import OnboardingFlow from './pages/OnboardingFlow';
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
        <Toaster />
        <Sonner />
        <ApiProvider>
          <BrowserRouter>
            <Routes>
              {/* Client routes have priority */}
              <Route path="/" element={<OnboardingFlow />} />
              <Route path="/dashboard" element={<Index />} />

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
