import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Clock, 
  Loader2, 
  MessageCircle, 
  Phone, 
  Video, 
  UserPlus, 
  UserCheck, 
  Lock,
  Globe,
  Sparkles,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { supabaseService } from '../../api/supabaseClient';
import { SupabaseConfigModal } from '../database/SupabaseConfigModal';

export const SearchDrawer: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    setActiveTab, 
    startConversationWithUser, 
    toggleFollowUser,
    onlineUserIds,
    initiateCall,
    currentUser,
    openUserProfile
  } = useApp();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [followProcessingId, setFollowProcessingId] = useState<string | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sphere_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Debounced search querying Supabase cloud database
  useEffect(() => {
    const q = query.trim().replace(/^@+/, '');
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const found = await supabaseService.searchUsers(q, currentUser?.id);
        const currentFollowingSet = new Set(currentUser?.following || []);
        const enriched = found.map(u => ({
          ...u,
          isFollowing: currentFollowingSet.has(u.id) || Boolean(u.isFollowing)
        }));
        setResults(enriched);
      } catch (err) {
        console.error('[SearchDrawer] search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timeout);
  }, [query, currentUser]);

  if (!isSearchOpen) return null;

  const saveRecent = (username: string) => {
    const updated = [username, ...recentSearches.filter(s => s !== username)].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('sphere_recent_searches', JSON.stringify(updated));
    } catch {}
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

  const handleSelectUser = async (user: User) => {
    saveRecent(user.username);
    setIsSearchOpen(false);
    openUserProfile(user);
  };

  const handleToggleFollow = async (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    setFollowProcessingId(user.id);
    try {
      const nextState = await toggleFollowUser(user.id);
      setResults(prev => prev.map(u => {
        if (u.id === user.id) {
          const diff = nextState ? 1 : -1;
          return {
            ...u,
            isFollowing: nextState,
            followersCount: Math.max(0, (u.followersCount || 0) + diff)
          };
        }
        return u;
      }));
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowProcessingId(null);
    }
  };

  const handleStartChat = async (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    saveRecent(user.username);
    setIsSearchOpen(false);
    try {
      const convId = await startConversationWithUser(user);
      if (convId) {
        try { sessionStorage.setItem('sphere_active_conv_id', convId); } catch {}
        setActiveTab('messages');
      }
    } catch (err) {
      console.error('Start chat error:', err);
    }
  };

  const handleAddDirectFriend = async (targetUsername: string, action: 'follow' | 'chat') => {
    const clean = targetUsername.trim().replace(/^@+/, '').toLowerCase();
    if (!clean) return;
    
    // Create friend object
    const friend: User = {
      id: `usr_${clean}`,
      username: clean,
      name: clean.charAt(0).toUpperCase() + clean.slice(1),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${clean}`,
      followersCount: 1,
      followingCount: 0,
      postsCount: 0,
      isPrivate: false,
      isVerified: false,
      isFollowing: action === 'follow'
    };

    saveRecent(clean);
    
    // Follow if requested
    if (action === 'follow' && currentUser) {
      await toggleFollowUser(friend.id);
    }

    if (action === 'chat') {
      setIsSearchOpen(false);
      const convId = await startConversationWithUser(friend);
      if (convId) {
        try { sessionStorage.setItem('sphere_active_conv_id', convId); } catch {}
        setActiveTab('messages');
      }
    } else {
      // Re-populate results with this newly connected friend
      setResults([friend]);
    }
  };

  const handleCall = (user: User, type: 'audio' | 'video', e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSearchOpen(false);
    initiateCall({
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar
    }, type);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div 
        className="fixed top-0 left-0 md:left-[84px] xl:left-[250px] bottom-0 w-full sm:w-[420px] bg-zinc-950/95 border-r border-white/10 z-50 flex flex-col shadow-2xl backdrop-blur-2xl animate-in slide-in-from-left duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-white/10">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Search Friends</h2>
              <button
                onClick={() => setIsDbModalOpen(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-zinc-400 hover:text-white border border-white/10 transition-colors"
                title="Database Settings"
              >
                <Database className="w-2.5 h-2.5 text-emerald-400" />
                <span>Supabase</span>
              </button>
            </div>
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by username or name..."
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-900/90 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all font-medium"
            />
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : loading ? (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 animate-spin" />
            ) : null}
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {query.trim().length > 0 ? (
            /* Results View */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span className="font-semibold text-zinc-300">Results</span>
                <span>{results.length} found</span>
              </div>

              {loading && results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-400">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  <span className="text-xs">Searching Supabase cloud...</span>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map(user => {
                    const isOnline = onlineUserIds.includes(user.id);
                    const isProcessing = followProcessingId === user.id;

                    return (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="group cursor-pointer flex items-center justify-between p-3 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/5 hover:border-cyan-500/30 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative">
                            <img
                              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                              alt={user.name}
                              className="w-11 h-11 rounded-full object-cover border border-white/10"
                            />
                            {isOnline && (
                              <span 
                                className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-black rounded-full shadow-[0_0_6px_#34d399]" 
                                title="Online"
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                                @{user.username}
                              </span>
                              {user.isVerified && (
                                <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 flex items-center justify-center text-[9px] font-bold text-white">
                                  ✓
                                </span>
                              )}
                              {user.isPrivate ? (
                                <Lock className="w-2.5 h-2.5 text-zinc-400" />
                              ) : (
                                <Globe className="w-2.5 h-2.5 text-zinc-400" />
                              )}
                            </div>
                            <p className="text-xs text-zinc-300 truncate">{user.name}</p>
                            <p className="text-[10px] text-zinc-500">
                              {user.followersCount ?? 0} followers
                            </p>
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={e => handleToggleFollow(user, e)}
                            disabled={isProcessing}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                              user.isFollowing
                                ? 'bg-white/10 hover:bg-rose-500/20 text-zinc-300 border border-white/10'
                                : 'bg-gradient-cosmic text-white hover:opacity-90'
                            }`}
                          >
                            {isProcessing ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : user.isFollowing ? (
                              <>
                                <UserCheck className="w-3 h-3 text-pink-400" />
                                <span className="hidden sm:inline text-[11px]">Following</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span className="text-[11px]">Follow</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={e => handleStartChat(user, e)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-cyan-400 transition-colors"
                            title="Message"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : !loading && (
                <div className="py-7 px-4 text-center rounded-2xl bg-zinc-900/70 border border-white/10 space-y-3.5 shadow-xl">
                  <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Connect with @{query.trim().replace(/^@+/, '')}</h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                      Account not indexed yet? You can still follow and message @{query.trim().replace(/^@+/, '')} directly!
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => handleAddDirectFriend(query, 'follow')}
                      className="px-3.5 py-2 rounded-xl bg-gradient-cosmic text-white text-xs font-semibold shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Follow @{query.trim().replace(/^@+/, '')}
                    </button>
                    <button
                      onClick={() => handleAddDirectFriend(query, 'chat')}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-cyan-300 text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Recent Searches View */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Recent Searches
                </span>
                {recentSearches.length > 0 && (
                  <button 
                    onClick={clearAllRecent}
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {recentSearches.length > 0 ? (
                <div className="space-y-1">
                  {recentSearches.map(username => (
                    <div
                      key={username}
                      onClick={() => setQuery(username)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer text-xs text-zinc-300 transition-colors group"
                    >
                      <span className="font-semibold group-hover:text-white">@{username}</span>
                      <button
                        onClick={e => removeRecent(username, e)}
                        className="p-1 rounded-full text-zinc-500 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  <Sparkles className="w-5 h-5 mx-auto mb-2 text-zinc-600" />
                  Search for any registered friend by @username
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SupabaseConfigModal 
        isOpen={isDbModalOpen} 
        onClose={() => setIsDbModalOpen(false)} 
      />
    </>
  );
};
