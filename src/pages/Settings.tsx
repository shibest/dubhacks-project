import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomTaskbar from "@/components/BottomTaskbar";
import {
  Moon,
  Sun,
  Globe,
  Lock,
  Bell,
  Volume2,
  Eye,
  EyeOff,
  Trash2,
  LogOut,
  Shield
} from "lucide-react";

interface SettingsData {
  theme: 'light' | 'dark';
  profileVisibility: 'public' | 'private';
  notifications: boolean;
  soundEffects: boolean;
  showOnlineStatus: boolean;
}

export default function Settings() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  // Load settings from localStorage
  const loadSettings = (): SettingsData => {
    const saved = localStorage.getItem('user_settings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      theme: 'dark',
      profileVisibility: 'public',
      notifications: true,
      soundEffects: true,
      showOnlineStatus: true
    };
  };

  const [settings, setSettings] = useState<SettingsData>(loadSettings());

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('user_settings', JSON.stringify(settings));

    // Apply theme change to document
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const handleNavigate = (tab: string) => {
    if (tab === "friends") {
      navigate("/friends");
    } else if (tab === "games") {
      navigate("/games");
    } else if (tab === "home") {
      navigate("/home");
    } else if (tab === "settings") {
      // Already on settings
    } else {
      console.log("Navigate to:", tab);
    }
  };

  const handleCommunityClick = () => {
    navigate("/dashboard");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  const toggleProfileVisibility = () => {
    setSettings(prev => ({
      ...prev,
      profileVisibility: prev.profileVisibility === 'public' ? 'private' : 'public'
    }));
  };

  const toggleNotifications = () => {
    setSettings(prev => ({
      ...prev,
      notifications: !prev.notifications
    }));
  };

  const toggleSoundEffects = () => {
    setSettings(prev => ({
      ...prev,
      soundEffects: !prev.soundEffects
    }));
  };

  const toggleOnlineStatus = () => {
    setSettings(prev => ({
      ...prev,
      showOnlineStatus: !prev.showOnlineStatus
    }));
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all app data? This will delete your profile, friends, and settings.')) {
      // Clear all localStorage except for auth tokens
      const keysToKeep = ['spotify_access_token', 'spotify_refresh_token', 'trakt_access_token', 'trakt_refresh_token'];
      const toKeep: Record<string, string | null> = {};

      keysToKeep.forEach(key => {
        toKeep[key] = localStorage.getItem(key);
      });

      localStorage.clear();

      keysToKeep.forEach(key => {
        if (toKeep[key]) {
          localStorage.setItem(key, toKeep[key]!);
        }
      });

      // Reset to default settings
      const defaultSettings = {
        theme: 'dark',
        profileVisibility: 'public',
        notifications: true,
        soundEffects: true,
        showOnlineStatus: true
      };
      setSettings(defaultSettings);
      localStorage.setItem('user_settings', JSON.stringify(defaultSettings));

      alert('App data cleared successfully!');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      // Clear auth tokens
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('trakt_access_token');
      localStorage.removeItem('trakt_refresh_token');
      sessionStorage.clear();

      navigate('/auth');
    }
  };

  return (
    <div
      className={`flex flex-col min-h-screen bg-[hsl(var(--background))] transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ paddingTop: 0 }}
    >
      <Header
        onCommunityClick={handleCommunityClick}
        onProfileClick={handleProfileClick}
      />

      <main className="flex-1 overflow-hidden pb-20">
        <div className="h-full overflow-y-auto">
          <div className="pb-4 pt-4 md:pt-6">
            <div className="max-w-2xl mx-auto px-3 md:px-4">
              {/* Page Title */}
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[hsl(280,95%,52%)] via-[hsl(180,85%,48%)] to-[hsl(90,80%,48%)] bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-center text-[hsl(var(--muted-foreground))] text-sm">
                  Customize your Mycelius experience
                </p>
              </div>

              {/* Settings Sections */}
              <div className="space-y-4">
                {/* Appearance */}
                <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-4">
                  <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                    {settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    Appearance
                  </h2>

                  <div className="space-y-3">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[hsl(var(--foreground))]">Theme</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {settings.theme === 'dark' ? 'Dark mode' : 'Light mode'}
                        </p>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.theme === 'dark'
                            ? 'bg-[hsl(var(--primary))]'
                            : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Privacy */}
                <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-4">
                  <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy & Security
                  </h2>

                  <div className="space-y-3">
                    {/* Profile Visibility */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[hsl(var(--foreground))] flex items-center gap-2">
                          {settings.profileVisibility === 'public' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          Profile Visibility
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {settings.profileVisibility === 'public'
                            ? 'Visible to everyone'
                            : 'Visible to friends only'}
                        </p>
                      </div>
                      <button
                        onClick={toggleProfileVisibility}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.profileVisibility === 'public'
                            ? 'bg-[hsl(var(--primary))]'
                            : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            settings.profileVisibility === 'public' ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Show Online Status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[hsl(var(--foreground))] flex items-center gap-2">
                          {settings.showOnlineStatus ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          Online Status
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {settings.showOnlineStatus ? 'Visible to friends' : 'Hidden from everyone'}
                        </p>
                      </div>
                      <button
                        onClick={toggleOnlineStatus}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.showOnlineStatus
                            ? 'bg-[hsl(var(--primary))]'
                            : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            settings.showOnlineStatus ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-4">
                  <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications & Sounds
                  </h2>

                  <div className="space-y-3">
                    {/* Notifications Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[hsl(var(--foreground))]">Push Notifications</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          Receive notifications for messages and updates
                        </p>
                      </div>
                      <button
                        onClick={toggleNotifications}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.notifications
                            ? 'bg-[hsl(var(--primary))]'
                            : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            settings.notifications ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Sound Effects Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[hsl(var(--foreground))] flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          Sound Effects
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          Play sounds for interactions and notifications
                        </p>
                      </div>
                      <button
                        onClick={toggleSoundEffects}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.soundEffects
                            ? 'bg-[hsl(var(--primary))]'
                            : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            settings.soundEffects ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data & Account */}
                <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] p-4">
                  <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Data & Account
                  </h2>

                  <div className="space-y-3">
                    {/* Clear Data */}
                    <button
                      onClick={handleClearData}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 transition-colors"
                    >
                      <div className="text-left">
                        <p className="font-medium text-orange-600 dark:text-orange-400 flex items-center gap-2">
                          <Trash2 className="w-4 h-4" />
                          Clear App Data
                        </p>
                        <p className="text-sm text-orange-600/70 dark:text-orange-400/70">
                          Delete profile, friends, and settings
                        </p>
                      </div>
                    </button>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                    >
                      <div className="text-left">
                        <p className="font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </p>
                        <p className="text-sm text-red-600/70 dark:text-red-400/70">
                          Sign out of your account
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* App Info */}
                <div className="text-center text-sm text-[hsl(var(--muted-foreground))] py-4">
                  <p>Mycelius v1.0.0</p>
                  <p className="mt-1">Made with connections in mind</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomTaskbar onNavigate={handleNavigate} activeTab="settings" />
    </div>
  );
}
