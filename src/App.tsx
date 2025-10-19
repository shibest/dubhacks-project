import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ApiProvider } from './contexts/ApiContext';

// Client routes (priority)
import OnboardingFlow from './pages/OnboardingFlow';
import Auth from './pages/Auth';
import Login from './pages/Login';
import Connections from './pages/Connections';
import Profile from './pages/Profile';
import Index from './pages/Index';
import Friends from './pages/Friends';
import Games from './pages/Games';
import Settings from './pages/Settings';
import Leaderboard from './pages/Leaderboard';
import GameAnim from './pages/GameAnim';
import Chat from './pages/Chat';
import HotTakesAnim from './pages/games/HotTakesAnim';
import HotTakesChat from './pages/games/HotTakesChat';
import EmojiStoryAnim from './pages/games/EmojiStoryAnim';
import EmojiStoryChat from './pages/games/EmojiStoryChat';
import GuiltyPleasureAnim from './pages/games/GuiltyPleasureAnim';
import GuiltyPleasureChat from './pages/games/GuiltyPleasureChat';
import KillMyVibeAnim from './pages/games/KillMyVibeAnim';
import KillMyVibeChat from './pages/games/KillMyVibeChat';
import TwoTruthsVibeAnim from './pages/games/TwoTruthsVibeAnim';
import TwoTruthsVibeChat from './pages/games/TwoTruthsVibeChat';
import FightClubAnim from './pages/games/FightClubAnim';
import FightClubChat from './pages/games/FightClubChat';
import PatchNotesAnim from './pages/games/PatchNotesAnim';
import PatchNotesChat from './pages/games/PatchNotesChat';
import FirstBestForeverAnim from './pages/games/FirstBestForeverAnim';
import FirstBestForeverChat from './pages/games/FirstBestForeverChat';
import HotTakesFmAnim from './pages/games/HotTakesFmAnim';
import HotTakesFmChat from './pages/games/HotTakesFmChat';
import InventoryDropAnim from './pages/games/InventoryDropAnim';
import InventoryDropChat from './pages/games/InventoryDropChat';

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
              {/* Login screen */}
              <Route path="/login" element={<Login />} />
              {/* Connections screen after auth */}
              <Route path="/connections" element={<Connections />} />
              {/* Profile screen */}
              <Route path="/profile" element={<Profile />} />
              {/* Dashboard (main app) */}
              <Route path="/dashboard" element={<Index />} />
              {/* /home also shows dashboard */}
              <Route path="/home" element={<Index />} />
              {/* Friends screen */}
              <Route path="/friends" element={<Friends />} />
              {/* Games screen */}
              <Route path="/games" element={<Games />} />
              {/* Settings screen */}
              <Route path="/settings" element={<Settings />} />
              {/* Leaderboard screen */}
              <Route path="/leaderboard" element={<Leaderboard />} />
              {/* Game animation screen */}
              <Route path="/gameanim" element={<GameAnim />} />
              {/* Chat screen */}
              <Route path="/chat" element={<Chat />} />
              {/* Hot Takes Game */}
              <Route path="/games/hottakes/anim" element={<HotTakesAnim />} />
              <Route path="/games/hottakes/chat" element={<HotTakesChat />} />
              {/* Emoji Story Game */}
              <Route path="/games/emojistory/anim" element={<EmojiStoryAnim />} />
              <Route path="/games/emojistory/chat" element={<EmojiStoryChat />} />
              {/* Guilty Pleasure Game */}
              <Route path="/games/guiltypleasure/anim" element={<GuiltyPleasureAnim />} />
              <Route path="/games/guiltypleasure/chat" element={<GuiltyPleasureChat />} />
              {/* Kill My Vibe Game */}
              <Route path="/games/killmyvibe/anim" element={<KillMyVibeAnim />} />
              <Route path="/games/killmyvibe/chat" element={<KillMyVibeChat />} />
              {/* Two Truths & A Vibe Game */}
              <Route path="/games/twotruthsvibe/anim" element={<TwoTruthsVibeAnim />} />
              <Route path="/games/twotruthsvibe/chat" element={<TwoTruthsVibeChat />} />
              {/* Fight Club Game */}
              <Route path="/games/fightclub/anim" element={<FightClubAnim />} />
              <Route path="/games/fightclub/chat" element={<FightClubChat />} />
              {/* Patch Notes Game */}
              <Route path="/games/patchnotes/anim" element={<PatchNotesAnim />} />
              <Route path="/games/patchnotes/chat" element={<PatchNotesChat />} />
              {/* First, Best, Forever Game */}
              <Route path="/games/firstbestforever/anim" element={<FirstBestForeverAnim />} />
              <Route path="/games/firstbestforever/chat" element={<FirstBestForeverChat />} />
              {/* Hot Takes FM Game */}
              <Route path="/games/hottakesfm/anim" element={<HotTakesFmAnim />} />
              <Route path="/games/hottakesfm/chat" element={<HotTakesFmChat />} />
              {/* Inventory Drop Game */}
              <Route path="/games/inventorydrop/anim" element={<InventoryDropAnim />} />
              <Route path="/games/inventorydrop/chat" element={<InventoryDropChat />} />

              {/* Trakt routes */}
              <Route path="/callback" element={<ApiCallback service="trakt" />} />

              {/* Spotify routes */}
              <Route path="/spotify/callback" element={<ApiCallback service="spotify" />} />
            </Routes>
          </BrowserRouter>
        </ApiProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
