import React, { useState, useEffect } from 'react';
import { Search, X, Clock, Loader2, Globe, Radio, MessageCircle, Phone, Video, UserPlus, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { User } from '../../types';

export const SearchDrawer: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    setActiveTab, 
    startConversationWithUser, 
    toggleFollowUser,
    onlineUserIds,
    initiateCall,
    currentUser
  } = useApp();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sphere_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await api.users.search(query.trim());
        setResults(res.users || []);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  if (!isSearchOpen) return null;

  const saveRecent = (username: string) => {
    const updated = [username, ...recentSearches.filter(s => s !== username)].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('sphere_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const handleSelectUser = async (user: User) => {
    saveRecent(user.username);
    setIsSearchOpen(false);
    try {
      await startConversationWithUser(user);
      setActiveTab('messages');
    } catch (err) {
      console.error('Failed to open conversation:', err);
      setActiveTab('feed');
    }
  };

  const removeRecent = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== item);
    setRecentSearches(updated);
    try {
      localStorage.setItem('sphere_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('sphere_recent_searches');
    } catch {}
  };

  return (
    <div 
      className="fixed inset-y-0 left-0 md:left-[84px] z-30 w-full md:w-[400px] spatial-dock border-l-0 rounded-r-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col animate-fade-in text-white select-none overflow-hidden"
    >
      {/* Top Header */}
      <div className="p-6 border-b border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Global Radar</h2>
              <p className="text-[10px] text-zinc-400">Locate creators & friends worldwide</p>
            </div>
          </div>

          <button 
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search username, real name, or tags..."
            autoFocus
            className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl pl-10 pr-8 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 text-cyan-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Results */}
        {query.trim().length > 0 ? (
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2 mb-2">
              Found Creators ({results.length})
            </h3>

            {results.length > 0 ? (
              results.map((user) => {
                const isOnline = onlineUserIds.includes(user.id);
                const isSelf = currentUser?.id === user.id;

                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar with Live Pulse */}
                      <div className="relative w-11 h-11 rounded-full bg-gradient-cosmic p-[1.5px] flex-shrink-0">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover border border-black"
                        />
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate text-white">{user.username}</span>
                          {user.isVerified && <span className="text-cyan-400 text-xs font-bold">✓</span>}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">{user.name}</p>
                        <span className="text-[10px] text-zinc-500">
                          {isOnline ? 'Active in orbit now' : 'Orbit explorer'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {!isSelf && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              initiateCall(user, 'audio');
                            }}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors"
                            title="Start Audio Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              initiateCall(user, 'video');
                            }}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors"
                            title="Start Video Call"
                          >
                            <Video className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFollowUser(user.id);
                            }}
                            className={`px-3 py-1 text-[11px] font-bold rounded-xl transition-all ${
                              user.isFollowing
                                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                : 'bg-gradient-cosmic text-white shadow-md shadow-pink-500/20 hover:opacity-90'
                            }`}
                          >
                            {user.isFollowing ? 'Following' : 'Follow'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : !loading ? (
              <div className="py-12 text-center space-y-2">
                <Globe className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">No creators found for &ldquo;{query}&rdquo;</p>
              </div>
            ) : null}
          </div>
        ) : (
          /* Recent Radar History */
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Recent Searches</span>
              {recentSearches.length > 0 && (
                <button
                  onClick={clearAllRecent}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Clear all
                </button>
              )}
            </div>

            {recentSearches.length > 0 ? (
              <div className="space-y-1.5">
                {recentSearches.map((item) => (
                  <div
                    key={item}
                    onClick={() => setQuery(item)}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-zinc-200">{item}</span>
                    </div>

                    <button
                      onClick={(e) => removeRecent(item, e)}
                      className="text-zinc-500 hover:text-white p-1 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <Globe className="w-10 h-10 text-zinc-700 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-300">Worldwide Discovery</p>
                  <p className="text-[11px] text-zinc-500">Search any account across the globe</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};