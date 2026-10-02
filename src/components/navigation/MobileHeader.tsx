import React from 'react';
import { Heart, Send, Sparkles, Sun, Moon, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileHeader: React.FC = () => {
  const { 
    setActiveTab, 
    unreadNotificationsCount, 
    unreadMessagesCount,
    isNotificationsOpen,
    setIsNotificationsOpen,
    isSearchOpen,
    setIsSearchOpen,
    theme,
    toggleTheme
  } = useApp();

  return (
    <header className="md:hidden sticky top-0 z-30 spatial-dock px-3.5 py-2.5 flex items-center justify-between border-x-0 border-t-0 rounded-b-2xl select-none backdrop-blur-xl">
      {/* Brand logo */}
      <div 
        onClick={() => setActiveTab('feed')}
        className="cursor-pointer flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-cosmic p-[1.5px] shadow-[0_0_12px_rgba(236,72,153,0.35)] flex-shrink-0">
          <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full border border-white/90 flex items-center justify-center">
              <div className="w-1 h-1 bg-gradient-to-r from-pink-400 to-cyan-400 rounded-full"></div>
            </div>
          </div>
        </div>
        <span className="text-sm font-extrabold tracking-tight text-gradient-cosmic flex items-center gap-1">
          Social Sphere
          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Search */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="p-1.5 text-zinc-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors active:scale-95"
          aria-label="Search"
          title="Global Radar Search"
        >
          <Search className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors active:scale-95"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className="relative p-1.5 text-zinc-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors active:scale-95"
          aria-label="Notifications"
        >
          <Heart className="w-4 h-4 stroke-[2]" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[8px] font-extrabold w-3 h-3 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/50">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Direct Messages */}
        <button
          onClick={() => setActiveTab('messages')}
          className="relative p-1.5 text-zinc-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors active:scale-95"
          aria-label="Messages"
        >
          <Send className="w-4 h-4 stroke-[2]" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[8px] font-extrabold w-3 h-3 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/50">
              {unreadMessagesCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};