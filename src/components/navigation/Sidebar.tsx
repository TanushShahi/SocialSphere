import React from 'react';
import { 
  Home, 
  Search, 
  Compass, 
  Film, 
  Send, 
  Heart, 
  Plus, 
  Sun, 
  Moon,
  Sparkles,
  LogOut,
  Radio,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    unreadNotificationsCount, 
    unreadMessagesCount,
    isSearchOpen,
    setIsSearchOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    setIsCreatePostOpen,
    setIsInstallModalOpen,
    theme,
    toggleTheme,
    logout
  } = useApp();

  if (!currentUser) return null;

  const isDrawerOpen = isSearchOpen || isNotificationsOpen;

  const handleTabClick = (tab: typeof activeTab) => {
    setIsSearchOpen(false);
    setIsNotificationsOpen(false);
    setActiveTab(tab);
  };

  const toggleSearch = () => {
    setIsNotificationsOpen(false);
    setIsSearchOpen(!isSearchOpen);
  };

  const toggleNotifications = () => {
    setIsSearchOpen(false);
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  return (
    <aside 
      className={`hidden md:flex flex-col justify-between h-screen sticky top-0 z-40 transition-all duration-300 select-none ${
        isDrawerOpen ? 'w-[84px] px-3 py-5' : 'w-[84px] xl:w-[250px] px-3 xl:px-4 py-5'
      }`}
    >
      {/* Aerogel Floating Dock Container */}
      <div className="h-full w-full spatial-dock rounded-[32px] p-3.5 flex flex-col justify-between">
        {/* Top Header & Logo */}
        <div className="space-y-6">
          <div 
            onClick={() => handleTabClick('feed')}
            className="cursor-pointer flex items-center gap-3 px-2 py-2 group rounded-2xl hover:bg-white/5 transition-all"
          >
            {/* Holographic Sphere Glyph with revolving aura */}
            <div className="relative w-10 h-10 rounded-2xl p-[1px] bg-gradient-cosmic flex-shrink-0 shadow-[0_0_20px_rgba(236,72,153,0.35)] group-hover:scale-105 transition-transform overflow-hidden">
              <img src="./icon-192.png" alt="Social Sphere" className="w-full h-full object-cover rounded-2xl" />
            </div>
            
            {/* Logo Typography with Cosmic Shimmer */}
            <div className={`overflow-hidden transition-all ${isDrawerOpen ? 'hidden' : 'hidden xl:block'}`}>
              <h1 className="text-lg font-black tracking-tight text-gradient-cosmic flex items-center gap-1.5">
                Social Sphere
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              </h1>
              <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Spatial Network</p>
            </div>
          </div>

          {/* Navigation Pods */}
          <nav className="space-y-1.5">
            {/* Home / Feed */}
            <button
              onClick={() => handleTabClick('feed')}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all group ${
                activeTab === 'feed' && !isDrawerOpen
                  ? 'font-bold text-white bg-gradient-to-r from-violet-600/30 to-pink-600/20 border border-violet-500/40 shadow-[0_0_20px_rgba(139,92,246,0.25)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-transform group-hover:scale-110 ${activeTab === 'feed' && !isDrawerOpen ? 'text-violet-400' : ''}`}>
                <Home className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className={`${isDrawerOpen ? 'hidden' : 'hidden xl:inline text-xs font-semibold'}`}>Feed</span>
            </button>

            {/* Global Radar Search */}
            <button
              onClick={toggleSearch}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all group ${
                isSearchOpen
                  ? 'font-bold text-white bg-gradient-to-r from-cyan-600/30 to-blue-600/20 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-transform group-hover:scale-110 ${isSearchOpen ? 'text-cyan-400' : ''}`}>
                <Search className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className={`${isDrawerOpen ? 'hidden' : 'hidden xl:inline text-xs font-semibold'}`}>Global Radar</span>
            </button>

            {/* Explore / World */}
            <button
              onClick={() => handleTabClick('explore')}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all group ${
                activeTab === 'explore' && !isDrawerOpen
                  ? 'font-bold text-white bg-gradient-to-r from-amber-600/30 to-orange-600/20 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-transform group-hover:scale-110 ${activeTab === 'explore' && !isDrawerOpen ? 'text-amber-400' : ''}`}>
                <Compass className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className={`${isDrawerOpen ? 'hidden' : 'hidden xl:inline text-xs font-semibold'}`}>Explore</span>
            </button>

            {/* Reels */}
            <button
              onClick={() => handleTabClick('reels')}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all group ${
                activeTab === 'reels' && !isDrawerOpen
                  ? 'font-bold text-white bg-gradient-to-r from-emerald-600/30 to-cyan-600/20 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-transform group-hover:scale-110 ${activeTab === 'reels' && !isDrawerOpen ? 'text-emerald-400' : ''}`}>
                <Film className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className={`${isDrawerOpen ? 'hidden' : 'hidden xl:inline text-xs font-semibold'}`}>Reels</span>
            </button>

            {/* Messages / Live Chat */}
            <button
              onClick={() => handleTabClick('messages')}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all group relative ${
                activeTab === 'messages' && !isDrawerOpen
                  ? 'font-bold text-white bg-gradient-to-r from-rose-600/30 to-pink-600/20 border border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-transform group-hover:scale-110 ${activeTab === 'messages' && !isDrawerOpen ? 'text-rose-400' : ''}`}>
                <Send className="w-5 h-5 stroke-[2.2]" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/50">
                    {unreadMessagesCount}
                  </span>
                )}
              </div>
              <span className={`${isDrawerOpen ? 'hidden' : 'hidden xl:inline text-xs font-semibold'}`}>Messages</span>
            </button>

            {/* Notifications */}
            <button
              onClick={toggleNotifications}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all group relative ${
                isNotificationsOpen
                  ? 'font-bold text-white bg-gradient-to-r from-pink-600/30 to-purple-600/20 border border-pink-500/40 shadow-[0_0_20px_rgba(236,72,153,0.25)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-transform group-hover:scale-110 ${isNotificationsOpen ? 'text-pink-400' : ''}`}>
                <Heart className="w-5 h-5 stroke-[2.2]" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute 1 1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-black animate-ping" />
                )}
              </div>
              <span className={`${isDrawerOpen ? 'hidden' : 'hidden xl:inline text-xs font-semibold'}`}>Alerts</span>
            </button>

            {/* Central Prism Create Button */}
            <div className="pt-2 space-y-1.5">
              <button
                onClick={() => setIsCreatePostOpen(true)}
                className="w-full flex items-center justify-center xl:justify-start gap-3.5 p-3 rounded-2xl bg-gradient-cosmic text-white font-bold shadow-[0_0_25px_rgba(236,72,153,0.35)] hover:opacity-95 active:scale-95 transition-all group"
              >
                <div className="p-1 rounded-lg bg-white/20">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <span className={`${isDrawerOpen ? 'hidden' : 'hidden xl:inline text-xs font-extrabold tracking-wide'}`}>
                  Create Orbit
                </span>
              </button>

              {/* Download / Install App */}
              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="w-full flex items-center justify-center xl:justify-start gap-3.5 px-3 py-2.5 rounded-2xl transition-all group text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/20"
                title="Download & Install App"
              >
                <div className="p-1.5 rounded-xl bg-cyan-500/15 group-hover:scale-110 transition-transform">
                  <Download className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className={`${isDrawerOpen ? 'hidden' : 'hidden xl:inline text-xs font-bold'}`}>
                  Download App
                </span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Actions & User Profile Orb */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          {/* User Profile Trigger */}
          <button
            onClick={() => handleTabClick('profile')}
            className={`w-full flex items-center gap-3.5 p-2 rounded-2xl transition-all group ${
              activeTab === 'profile' && !isDrawerOpen
                ? 'bg-white/10 border border-white/20'
                : 'hover:bg-white/5'
            }`}
          >
            <div className="relative w-9 h-9 rounded-full bg-gradient-cosmic p-[1.5px] flex-shrink-0">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.username} 
                className="w-full h-full rounded-full object-cover border border-black"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </div>
            
            <div className={`text-left overflow-hidden ${isDrawerOpen ? 'hidden' : 'hidden xl:block'}`}>
              <p className="text-xs font-bold text-white truncate">{currentUser.username}</p>
              <p className="text-[10px] text-zinc-400 truncate">{currentUser.name}</p>
            </div>
          </button>

          {/* Logout & Theme Toggle */}
          <div className="flex items-center justify-between px-2 pt-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={logout}
              className="p-2 text-zinc-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};