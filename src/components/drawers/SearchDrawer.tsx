import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Clock, 
  Loader2, 
  Globe, 
  Radio, 
  MessageCircle, 
  Phone, 
  Video, 
  UserPlus, 
  Check, 
  Lock,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { User } from '../../types';

const MOCK_BLACKLIST = new Set([
  'alex_creator', 'sophia_celestial', 'liam_sound', 
  'usr_alex', 'usr_sophia', 'usr_liam',
  'tanush', 'usr_tanush'
]);

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
    connectFriend,
    openUserProfile
  } = useApp();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sphere_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load suggested real users when drawer opens
  useEffect(() => {
    if (isSearchOpen) {
      api.users.suggested().then(res => {
        const clean = (res.users || []).filter(
          u => u && !MOCK_BLACKLIST.has(u.username.toLowerCase()) && !MOCK_BLACKLIST.has(u.id.toLowerCase())
        );
        setSuggestedUsers(clean);
      }).catch(() => {});
    }
  }, [isSearchOpen]);

  // Live debounced search across local and cloud registry
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
        const clean = (res.users || []).filter(
          u => u && !MOCK_BLACKLIST.has(u.username.toLowerCase()) && !MOCK_BLACKLIST.has(u.id.toLowerCase())
        );
        setResults(clean);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  if (!isSearchOpen) return null;

  const cleanQuery = query.trim().replace(/^@+/, '');

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
    try {
      const convId = await startConversationWithUser(user);
      try {
        sessionStorage.setItem('sphere_active_conv_id', convId);
      } catch {}
      setActiveTab('messages');
    } catch (err) {
      console.error('Failed to open conversation:', err);
      setActiveTab('feed');
    }
  };

  const handleToggleFollow = async (userId: string) => {
    const nextState = await toggleFollowUser(userId);
    setResults(prev => prev.map(u => u.id === userId ? { ...u, isFollowing: nextState } : u));
    setSuggestedUsers(prev => prev.map(u => u.id === userId ? { ...u, isFollowing: nextState } : u));
  };

  const handleAddAndFollow = async (target: string) => {
    const clean = target.trim().replace(/^@+/, '');
    if (!clean) return;
    setConnecting(true);
    try {
      const friend = await connectFriend(clean);
      if (friend) {
        saveRecent(friend.username);
        const res = await api.users.search(clean);
        const matched = (res.users || []).filter(
          u => u && !MOCK_BLACKLIST.has(u.username.toLowerCase()) && !MOCK_BLACKLIST.has(u.id.toLowerCase())
        );
        setResults(matched.length > 0 ? matched : [{ ...friend, isFollowing: true }]);
      }
    } catch (err) {
      console.error('Failed to add and follow:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleAddAndChat = async (target: string) => {
    const clean = target.trim().replace(/^@+/, '');
    if (!clean) return;
    setConnecting(true);
    try {
      const friend = await connectFriend(clean);
      if (friend) {
        saveRecent(friend.username);
        setIsSearchOpen(false);
        try {
          const convId = await startConversationWithUser(friend);
          try {
            sessionStorage.setItem('sphere_active_conv_id', convId);
          } catch {}
          setActiveTab('messages');
        } catch {
          setActiveTab('feed');
        }
      }
    } catch (err) {
      console.error('Failed to add and chat:', err);
    } finally {
      setConnecting(false);
    }
  };

  const exactMatch = results.find(
    u => u && (
      (u.username && u.username.toLowerCase() === cleanQuery.toLowerCase()) || 
      (u.id && u.id.toLowerCase() === cleanQuery.toLowerCase())
    )
  );

  const renderUserRow = (user: User) => {
    const isOnline = onlineUserIds.includes(user.id);
    const isSelf = currentUser?.id === user.id;

    return (
      <div
        key={user.id}
        onClick={() => openUserProfile(user)}
        className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 cursor-pointer transition-all gap-3 group shadow-sm"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar with gradient ring */}
          <div className="relative w-11 h-11 rounded-full bg-gradient-cosmic p-[1.5px] flex-shrink-0">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-full h-full rounded-full object-cover border border-black"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white truncate">@{user.username}</span>
              {user.isVerified && <span className="text-cyan-400 text-xs font-bold">✓</span>}
              
              {/* Instagram-style Privacy Badge */}
              {user.isPrivate ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Private</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  <Globe className="w-2.5 h-2.5" />
                  <span>Public</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 truncate">{user.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono text-cyan-400/90 truncate max-w-[120px]" title={user.id}>
                {user.id}
              </span>
              <span className="text-[10px] text-zinc-600">•</span>
              <span className="text-[10px] text-zinc-500">
                {isOnline ? 'Active now' : 'Connected'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions: Instagram Style Chat & Follow Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end flex-shrink-0">
          {!isSelf && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectUser(user);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                title="Chat with Friend"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFollow(user.id);
                }}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-sm ${
                  user.isFollowing
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-white/10'
                    : 'bg-gradient-cosmic text-white shadow-pink-500/20 hover:opacity-95'
                }`}
              >
                {user.isFollowing ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </>
                )}
              </button>

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
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-y-0 left-0 md:left-[84px] z-30 w-full md:w-[420px] spatial-dock border-l-0 rounded-r-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col animate-fade-in text-white select-none overflow-hidden"
    >
      {/* Top Header */}
      <div className="p-6 border-b border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Search Friends</h2>
              <p className="text-[10px] text-zinc-400">Find accounts by username, name or ID</p>
            </div>
          </div>

          <button 
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instagram-style Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search username (e.g. @priya)..."
            autoFocus
            className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 text-pink-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {cleanQuery.length > 0 ? (
          <div className="space-y-3">
            {/* Instagram-Style Direct Add / Connect Card when friend handle searched */}
            {!exactMatch && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-zinc-900/90 to-pink-950/40 border border-pink-500/30 shadow-xl space-y-3.5 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-cosmic p-[2px] flex-shrink-0 shadow-lg shadow-pink-500/20">
                    <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center font-extrabold text-white text-base">
                      @{cleanQuery.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">@{cleanQuery}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 font-semibold border border-pink-500/30">
                        Friend
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">
                      Connect & follow @{cleanQuery} directly across devices
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleAddAndFollow(cleanQuery)}
                    disabled={connecting}
                    className="py-2.5 px-3 bg-gradient-cosmic hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    {connecting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>➕ Follow</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleAddAndChat(cleanQuery)}
                    disabled={connecting}
                    className="py-2.5 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    {connecting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>💬 Chat</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Results List */}
            {results.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2">
                  {exactMatch ? `Found Accounts (${results.length})` : `Other Matches (${results.length})`}
                </h3>
                <div className="space-y-1.5">
                  {results.map(user => renderUserRow(user))}
                </div>
              </div>
            ) : !loading && !exactMatch ? (
              <div className="text-center py-4 text-zinc-400 text-xs space-y-1">
                <p>Use the buttons above to instantly follow or message <span className="text-white font-bold">@{cleanQuery}</span>.</p>
              </div>
            ) : null}
          </div>
        ) : (
          /* When Query is Empty: Recent Searches & Suggested For You */
          <div className="space-y-5">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Recent Searches</span>
                  <button
                    onClick={clearAllRecent}
                    className="text-xs text-pink-400 hover:text-pink-300 font-semibold"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-1">
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
                        <span className="text-xs font-medium text-zinc-200">@{item.replace(/^@+/, '')}</span>
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
              </div>
            )}

            {/* Suggested For You (Instagram Style) */}
            {suggestedUsers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Suggested For You</span>
                </div>
                <div className="space-y-1.5">
                  {suggestedUsers.map(user => renderUserRow(user))}
                </div>
              </div>
            )}

            {/* Cross-Device ID Tip */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 mt-4">
              <div className="flex items-center gap-2 text-zinc-300">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold">Connect with Any Friend</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Type your friend&apos;s <span className="text-pink-300 font-bold">@username</span> in the search bar above to instantly follow them and start chatting across all phones and devices!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
