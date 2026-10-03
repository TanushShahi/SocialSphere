import React from 'react';
import { Home, Compass, Plus, Film, Globe, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    setIsCreatePostOpen,
    setIsSearchOpen,
    setIsNotificationsOpen,
    unreadMessagesCount
  } = useApp();

  if (!currentUser) return null;

  const handleTab = (tab: typeof activeTab) => {
    setIsSearchOpen(false);
    setIsNotificationsOpen(false);
    setActiveTab(tab);
  };

  return (
    <div className="md:hidden fixed bottom-2.5 sm:bottom-3 left-3 right-3 sm:left-4 sm:right-4 z-40 select-none pb-[env(safe-area-inset-bottom)]">
      <nav className="spatial-dock rounded-full px-3.5 sm:px-4 py-2 flex items-center justify-between shadow-2xl backdrop-blur-xl border border-white/10 bg-zinc-950/80">
        {/* Feed */}
        <button
          onClick={() => handleTab('feed')}
          className={`p-2 transition-all active:scale-90 ${
            activeTab === 'feed' 
              ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]' 
              : 'text-zinc-400 hover:text-white'
          }`}
          aria-label="Feed"
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Explore */}
        <button
          onClick={() => handleTab('explore')}
          className={`p-2 transition-all active:scale-90 ${
            activeTab === 'explore' 
              ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]' 
              : 'text-zinc-400 hover:text-white'
          }`}
          aria-label="Explore"
        >
          <Compass className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Central Glowing Create Button matching mockup */}
        <button
          onClick={() => setIsCreatePostOpen(true)}
          className="p-2.5 rounded-full bg-gradient-cosmic text-white shadow-xl shadow-pink-500/35 transition-transform active:scale-90 hover:scale-105"
          aria-label="Create Post"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Worlds Communities */}
        <button
          onClick={() => handleTab('worlds')}
          className={`p-2 transition-all active:scale-90 ${
            activeTab === 'worlds' 
              ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]' 
              : 'text-zinc-400 hover:text-white'
          }`}
          aria-label="Worlds"
        >
          <Globe className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Reels */}
        <button
          onClick={() => handleTab('reels')}
          className={`p-2 transition-all active:scale-90 ${
            activeTab === 'reels' 
              ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]' 
              : 'text-zinc-400 hover:text-white'
          }`}
          aria-label="Reels"
        >
          <Film className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Messages */}
        <button
          onClick={() => handleTab('messages')}
          className={`p-2 transition-all active:scale-90 relative ${
            activeTab === 'messages' 
              ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
              : 'text-zinc-400 hover:text-white'
          }`}
          aria-label="Messages"
        >
          <Send className="w-5 h-5 stroke-[2.2]" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          )}
        </button>

        {/* Profile */}
        <button
          onClick={() => handleTab('profile')}
          className="p-1 transition-transform active:scale-90"
          aria-label="Profile"
        >
          <div className={`p-[1.5px] rounded-full ${
            activeTab === 'profile' 
              ? 'bg-gradient-cosmic shadow-[0_0_10px_rgba(236,72,153,0.6)]' 
              : 'border border-white/20'
          }`}>
            <img 
              src={currentUser.avatar} 
              alt={currentUser.username} 
              className="w-5 h-5 rounded-full object-cover"
            />
          </div>
        </button>
      </nav>
    </div>
  );
};