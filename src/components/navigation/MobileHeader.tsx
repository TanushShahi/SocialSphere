import React from 'react';
import { Heart, Send, Sparkles, Sun, Moon, Search, Download } from 'lucide-react';
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
    setIsInstallModalOpen,
    theme,
    toggleTheme
  } = useApp();

  return (
    <header className="md:hidden sticky top-0 z-30 spatial-dock px-3.5 py-2.5 flex items-center justify-between border-x-0 border-t-0 rounded-b-2xl select-none backdrop-blur-xl">
      {/* Brand logo & Tagline matching mockup */}
      <div 
        onClick={() => setActiveTab('feed')}
        className="cursor-pointer flex items-center gap-2.5"
      >
        <div className="w-8 h-8 rounded-xl p-[1.5px] bg-gradient-cosmic shadow-[0_0_15px_rgba(236,72,153,0.4)] flex-shrink-0 overflow-hidden">
          <img src="./icon-192.png" alt="SocialSphere" className="w-full h-full object-cover rounded-xl" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-tight text-white flex items-center gap-1">
            Social<span className="text-transparent bg-clip-text bg-gradient-cosmic">Sphere</span>
          </span>
          <span className="text-[8px] font-medium text-zinc-400 tracking-wider">
            People • Moments • Worlds
          </span>
        </div>
      </div>

      {/* Action buttons matching mockup */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Download App / Install PWA */}
        <button
          onClick={() => setIsInstallModalOpen(true)}
          className="p-1.5 text-cyan-400 hover:text-cyan-300 rounded-xl hover:bg-white/5 transition-colors active:scale-95"
          aria-label="Download App"
          title="Download & Install App"
        >
          <Download className="w-4 h-4 stroke-[2]" />
        </button>

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