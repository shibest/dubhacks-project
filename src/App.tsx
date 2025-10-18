import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './contexts/AuthContext';

// Client routes (priority)
import OnboardingFlow from './pages/OnboardingFlow';
import Index from './pages/Index';

// Existing routes
import Callback from './components/Callback';
import UserWatchlist from './pages/UserWatchlist';
import ProfileSelect from './pages/ProfileSelect';

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
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Client routes have priority */}
              <Route path="/" element={<OnboardingFlow />} />
              <Route path="/dashboard" element={<Index />} />

              {/* Existing routes */}
              <Route path="/trakt/connect" element={<ProfileSelect />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/trakt/watchlist" element={<UserWatchlist />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
