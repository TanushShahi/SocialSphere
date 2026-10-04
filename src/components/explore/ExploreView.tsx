import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Search, 
  Sparkles, 
  Compass, 
  Plus, 
  Music, 
  Film, 
  Play, 
  Pause, 
  Send, 
  Volume2, 
  VolumeX, 
  X, 
  Bookmark, 
  ExternalLink, 
  Flame,
  UserPlus,
  Check,
  Lock,
  Globe,
  Phone,
  Video,
  Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { Post, Reel, User } from '../../types';
import { TRENDING_INSTAGRAM_REELS } from '../reels/trendingReels';
import { CURATED_SONGS } from '../music/curatedTracks';

export const EXPLORE_CATEGORIES = [
  'All Universe',
  '📸 Instagram Reels',
  '🎥 All Reels',
  'Photos',
  'Soundtracks',
  'Travel',
  'Aesthetic',
  'Cyber & Tech'
];

export const VISUAL_EXPLORE_DISKS = [
  {
    id: 'Travel',
    name: 'Travel',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    borderColor: 'border-cyan-400 shadow-cyan-500/30'
  },
  {
    id: 'Music',
    name: 'Music',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
    borderColor: 'border-purple-400 shadow-purple-500/30'
  },
  {
    id: 'Tech',
    name: 'Tech',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80',
    borderColor: 'border-blue-400 shadow-blue-500/30'
  },
  {
    id: 'Nature',
    name: 'Nature',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&auto=format&fit=crop&q=80',
    borderColor: 'border-emerald-400 shadow-emerald-500/30'
  },
  {
    id: 'Art',
    name: 'Art',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80',
    borderColor: 'border-pink-400 shadow-pink-500/30'
  },
  {
    id: 'Anime',
    name: 'Anime',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80',
    borderColor: 'border-orange-400 shadow-orange-500/30'
  },
  {
    id: 'Food',
    name: 'Food',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
    borderColor: 'border-amber-400 shadow-amber-500/30'
  },
  {
    id: 'Fitness',
    name: 'Fitness',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80',
    borderColor: 'border-rose-400 shadow-rose-500/30'
  },
  {
    id: 'Fashion',
    name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&auto=format&fit=crop&q=80',
    borderColor: 'border-fuchsia-400 shadow-fuchsia-500/30'
  }
];

type ExploreItem = 
  | { kind: 'post'; data: Post }
  | { kind: 'reel'; data: Reel };

const resolveAudioUrl = (reel: Reel): string => {
  if (reel.audioUrl) return reel.audioUrl;
  const match = CURATED_SONGS.find(s => 
    reel.audioTitle.toLowerCase().includes(s.title.toLowerCase()) ||
    s.title.toLowerCase().includes(reel.audioTitle.toLowerCase()) ||
    reel.audioTitle.toLowerCase().includes(s.artist.toLowerCase())
  );
  return match?.audioUrl || CURATED_SONGS[0]?.audioUrl || '';
};

export const ExploreView: React.FC = () => {
  const { 
    openPostDetail, 
    posts, 
    reels, 
    setIsCreatePostOpen, 
    openShareModal, 
    toggleLikeReel, 
    toggleSaveReel, 
    setActiveTab,
    currentUser,
    openUserProfile,
    connectFriend,
    startConversationWithUser,
    toggleFollowUser,
    onlineUserIds
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('All Universe');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [isReelMuted, setIsReelMuted] = useState(false);
  const [isModalPlaying, setIsModalPlaying] = useState(true);
  const [needsGesture, setNeedsGesture] = useState(false);

  // Instagram-style account & friend search state
  const [userResults, setUserResults] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [searchMode, setSearchMode] = useState<'accounts' | 'media'>('accounts');

  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const modalAudioRef = useRef<HTMLAudioElement | null>(null);

  // Debounced search for user accounts across local & cloud registry
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setUserResults([]);
      setUserLoading(false);
      return;
    }

    setUserLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await api.users.search(q);
        const MOCK_BLACKLIST = new Set([
          'alex_creator', 'sophia_celestial', 'liam_sound', 
          'usr_alex', 'usr_sophia', 'usr_liam', 'tanush', 'usr_tanush'
        ]);
        const clean = (res.users || []).filter(
          u => u && !MOCK_BLACKLIST.has((u.username || '').toLowerCase()) && !MOCK_BLACKLIST.has((u.id || '').toLowerCase())
        );
        setUserResults(clean);
      } catch (err) {
        console.error('Explore user search error:', err);
        setUserResults([]);
      } finally {
        setUserLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const cleanQuery = searchQuery.trim().replace(/^@+/, '');

  const handleAddAndFollow = async (target: string) => {
    const clean = target.trim().replace(/^@+/, '');
    if (!clean) return;
    setConnecting(true);
    try {
      const friend = await connectFriend(clean);
      if (friend) {
        const res = await api.users.search(clean);
        const MOCK_BLACKLIST = new Set([
          'alex_creator', 'sophia_celestial', 'liam_sound', 
          'usr_alex', 'usr_sophia', 'usr_liam', 'tanush', 'usr_tanush'
        ]);
        const cleanUsers = (res.users || []).filter(
          u => u && !MOCK_BLACKLIST.has((u.username || '').toLowerCase())
        );
        setUserResults(cleanUsers.length > 0 ? cleanUsers : [{ ...friend, isFollowing: true }]);
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
        const convId = await startConversationWithUser(friend);
        try {
          sessionStorage.setItem('sphere_active_conv_id', convId);
        } catch {}
        setActiveTab('messages');
      }
    } catch (err) {
      console.error('Failed to add and chat:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleSelectUser = async (user: User) => {
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
    setUserResults(prev => prev.map(u => u.id === userId ? { ...u, isFollowing: nextState } : u));
  };

  const exactMatch = userResults.find(
    u => u && (
      (u.username && u.username.toLowerCase() === cleanQuery.toLowerCase()) || 
      (u.id && u.id.toLowerCase() === cleanQuery.toLowerCase())
    )
  );

  // Combine user reels and trending Instagram reels
  const allReels = useMemo(() => {
    const existingIds = new Set(reels.map(r => r.id));
    const trendingFiltered = TRENDING_INSTAGRAM_REELS.filter(tr => !existingIds.has(tr.id));
    return [...reels, ...trendingFiltered];
  }, [reels]);

  // Combine posts and reels into a unified explore stream
  const unifiedItems: ExploreItem[] = useMemo(() => {
    const postItems: ExploreItem[] = posts.map(p => ({ kind: 'post', data: p }));
    const reelItems: ExploreItem[] = allReels.map(r => ({ kind: 'reel', data: r }));

    if (selectedCategory === '📸 Instagram Reels') {
      return allReels.filter(r => r.id.startsWith('reel_ig')).map(r => ({ kind: 'reel', data: r }));
    }
    if (selectedCategory === '🎥 All Reels') {
      return reelItems;
    }
    if (selectedCategory === 'Photos') {
      return postItems;
    }
    if (selectedCategory === 'Soundtracks') {
      return [
        ...postItems.filter(p => (p.data as Post).songTitle),
        ...reelItems.filter(r => (r.data as Reel).audioTitle)
      ];
    }

    // Default 'All Universe' or theme tags: interleave posts and reels
    const mixed: ExploreItem[] = [];
    const maxLen = Math.max(postItems.length, reelItems.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < postItems.length) mixed.push(postItems[i]);
      if (i < reelItems.length) mixed.push(reelItems[i]);
    }

    const lowerCat = selectedCategory.toLowerCase();
    const diskMatch = VISUAL_EXPLORE_DISKS.find(d => d.id.toLowerCase() === lowerCat || d.name.toLowerCase() === lowerCat);
    if (diskMatch) {
      const tag = diskMatch.id.toLowerCase();
      const matched = [
        ...postItems.filter(p => {
          const post = p.data as Post;
          return post.caption?.toLowerCase().includes(tag) || post.location?.toLowerCase().includes(tag);
        }),
        ...reelItems.filter(r => {
          const reel = r.data as Reel;
          return reel.caption?.toLowerCase().includes(tag) || reel.audioTitle?.toLowerCase().includes(tag);
        })
      ];
      if (matched.length > 0) return matched;
    }

    return mixed;
  }, [posts, allReels, selectedCategory]);

  // Filter based on search query
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return unifiedItems;

    return unifiedItems.filter(item => {
      if (item.kind === 'post') {
        const post = item.data;
        return (
          post.caption?.toLowerCase().includes(q) ||
          post.user.username.toLowerCase().includes(q) ||
          post.user.name.toLowerCase().includes(q) ||
          post.songTitle?.toLowerCase().includes(q) ||
          post.songArtist?.toLowerCase().includes(q)
        );
      } else {
        const reel = item.data;
        return (
          reel.caption?.toLowerCase().includes(q) ||
          reel.user.username.toLowerCase().includes(q) ||
          reel.user.name.toLowerCase().includes(q) ||
          reel.audioTitle?.toLowerCase().includes(q)
        );
      }
    });
  }, [unifiedItems, searchQuery]);

  // When selectedReel is opened in modal: automatically play video AND music with sound!
  useEffect(() => {
    if (!selectedReel) {
      if (modalAudioRef.current) modalAudioRef.current.pause();
      if (modalVideoRef.current) modalVideoRef.current.pause();
      return;
    }

    setIsModalPlaying(true);
    const video = modalVideoRef.current;
    const audio = modalAudioRef.current;

    if (video) {
      video.muted = isReelMuted;
      video.play().catch(() => {});
    }

    if (audio) {
      audio.muted = isReelMuted;
      audio.currentTime = 0;
      audio.play().then(() => {
        setNeedsGesture(false);
      }).catch(() => {
        setNeedsGesture(true);
      });
    }
  }, [selectedReel]);

  // Sync mute state in modal
  useEffect(() => {
    if (modalVideoRef.current) modalVideoRef.current.muted = isReelMuted;
    if (modalAudioRef.current) {
      modalAudioRef.current.muted = isReelMuted;
      if (!isReelMuted && isModalPlaying && selectedReel) {
        modalAudioRef.current.play().catch(() => setNeedsGesture(true));
      }
    }
  }, [isReelMuted, isModalPlaying, selectedReel]);

  const toggleModalPlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = modalVideoRef.current;
    const audio = modalAudioRef.current;

    if (isModalPlaying) {
      if (video) video.pause();
      if (audio) audio.pause();
      setIsModalPlaying(false);
    } else {
      if (video) video.play().catch(() => {});
      if (audio) audio.play().catch(() => setNeedsGesture(true));
      setIsModalPlaying(true);
    }
  };

  const toggleModalMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isReelMuted;
    setIsReelMuted(nextMuted);

    if (!nextMuted && modalAudioRef.current && isModalPlaying) {
      modalAudioRef.current.play().then(() => setNeedsGesture(false)).catch(() => setNeedsGesture(true));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-cosmic p-[1.5px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/25">
            <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
              <Compass className="w-5 h-5 text-pink-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold flex items-center gap-2">
              Explore & Search Friends
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500 text-white font-extrabold uppercase animate-pulse">
                Live
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400">
              Discover friends, search usernames, and explore trending reels
            </p>
          </div>
        </div>

        <button 
          onClick={() => setSelectedCategory('📸 Instagram Reels')}
          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1 transition-colors border border-white/10"
        >
          <span>Watch Reels</span>
          <Play className="w-3 h-3 fill-white" />
        </button>
      </div>

      {/* Top Instagram-Style Search Bar */}
      <div className="relative max-w-lg mx-auto">
        <div className="absolute inset-0 bg-gradient-cosmic rounded-2xl opacity-20 blur-md pointer-events-none"></div>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search username (e.g. @golu_2007), friends, reels..."
            className="w-full bg-zinc-950/80 border border-white/15 rounded-2xl pl-11 pr-10 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 backdrop-blur-xl transition-all shadow-xl"
          />
          {userLoading ? (
            <Loader2 className="w-4 h-4 text-pink-400 absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />
          ) : searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* When Search Query is Active: Instagram Search Mode */}
      {searchQuery.trim().length > 0 ? (
        <div className="space-y-4 max-w-lg mx-auto animate-fade-in">
          {/* Instagram Search Tabs: Accounts | Reels & Posts */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setSearchMode('accounts')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                searchMode === 'accounts'
                  ? 'bg-gradient-cosmic text-white shadow-md shadow-pink-500/25'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Accounts {userResults.length > 0 ? `(${userResults.length})` : ''}</span>
            </button>

            <button
              onClick={() => setSearchMode('media')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                searchMode === 'media'
                  ? 'bg-gradient-cosmic text-white shadow-md shadow-pink-500/25'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Reels & Posts {filteredItems.length > 0 ? `(${filteredItems.length})` : ''}</span>
            </button>
          </div>

          {searchMode === 'accounts' ? (
            <div className="space-y-3">
              {/* Instagram Direct Connect & Add Card when no exact local match yet */}
              {!exactMatch && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-zinc-900/90 to-pink-950/40 border border-pink-500/30 shadow-xl space-y-3.5">
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

              {/* User Results List */}
              {userResults.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2">
                    {exactMatch ? `Matching Friends (${userResults.length})` : `Other Accounts (${userResults.length})`}
                  </h4>
                  <div className="space-y-1.5">
                    {userResults.map(user => {
                      const isOnline = onlineUserIds.includes(user.id);
                      const isSelf = currentUser?.id === user.id;

                      return (
                        <div
                          key={user.id}
                          onClick={() => openUserProfile(user)}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 cursor-pointer transition-all gap-3 group shadow-sm"
                        >
                          <div className="flex items-center gap-3 min-w-0">
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
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : !userLoading && !exactMatch ? (
                <div className="text-center py-6 text-zinc-400 text-xs space-y-1">
                  <p>Tap above to follow or message <span className="text-white font-bold">@{cleanQuery}</span> directly.</p>
                </div>
              ) : null}
            </div>
          ) : (
            /* Media Search Mode (Posts & Reels) */
            <div className="space-y-3">
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
                  {filteredItems.map((item) => {
                    const isReel = item.kind === 'reel';
                    if (isReel) {
                      const reel = item.data as Reel;
                      return (
                        <div
                          key={reel.id}
                          onClick={() => setSelectedReel(reel)}
                          className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/10 hover:border-pink-500/50 transition-all hover:scale-[1.02]"
                        >
                          <img
                            src={reel.thumbnailUrl}
                            alt={reel.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-pink-400 font-bold flex items-center gap-1 border border-pink-500/30">
                            <Film className="w-3 h-3" />
                            <span>Reel</span>
                          </div>
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left space-y-1">
                            <p className="text-[11px] text-white font-semibold line-clamp-1">@{reel.user.username}</p>
                            <p className="text-[10px] text-zinc-300 line-clamp-1">{reel.caption}</p>
                          </div>
                        </div>
                      );
                    } else {
                      const post = item.data as Post;
                      return (
                        <div
                          key={post.id}
                          onClick={() => openPostDetail(post)}
                          className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/10 hover:border-pink-500/50 transition-all hover:scale-[1.02]"
                        >
                          <img
                            src={post.media[0]?.url}
                            alt={post.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                            <p className="text-[11px] text-white font-semibold line-clamp-1">@{post.user.username}</p>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-400 text-xs">
                  No reels or posts match &ldquo;{searchQuery}&rdquo;.
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* When Search Query is Empty: Keep Original Cosmic Explore UI */
        <>
          {/* 3x3 Circular Visual Category Disks Grid */}
          <div className="pt-2 select-none">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Explore Worlds & Categories
              </span>
              {selectedCategory !== 'All Universe' && (
                <button
                  onClick={() => setSelectedCategory('All Universe')}
                  className="text-[11px] font-bold text-pink-400 hover:text-pink-300 transition-colors"
                >
                  Reset filter ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-9 gap-3 sm:gap-2.5">
              {VISUAL_EXPLORE_DISKS.map((disk) => {
                const isSelected = selectedCategory.toLowerCase().includes(disk.id.toLowerCase());
                return (
                  <button
                    key={disk.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCategory('All Universe');
                      } else {
                        setSelectedCategory(disk.id);
                      }
                    }}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer transition-transform active:scale-95"
                  >
                    <div
                      className={`relative w-16 h-16 sm:w-14 sm:h-14 rounded-full p-[2px] transition-all duration-300 ${
                        isSelected
                          ? `border-2 ${disk.borderColor} scale-110 shadow-lg ring-2 ring-pink-500/50`
                          : 'border border-white/20 group-hover:border-white/50 group-hover:scale-105'
                      }`}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden relative bg-black">
                        <img
                          src={disk.image}
                          alt={disk.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors" />
                      </div>
                    </div>

                    <span
                      className={`text-[11px] sm:text-[10px] font-bold truncate max-w-full transition-colors ${
                        isSelected ? 'text-pink-400' : 'text-zinc-300 group-hover:text-white'
                      }`}
                    >
                      {disk.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Pills Slider */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {EXPLORE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-cosmic text-white shadow-[0_0_20px_rgba(236,72,153,0.35)] scale-105'
                    : 'bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat === 'All Universe' ? (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {cat}
                  </span>
                ) : cat === 'Soundtracks' ? (
                  <span className="flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-pink-400" />
                    {cat}
                  </span>
                ) : cat}
              </button>
            ))}
          </div>

          {/* Holographic Mosaic Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
              {filteredItems.map((item) => {
                const isReel = item.kind === 'reel';

                if (isReel) {
                  const reel = item.data as Reel;
                  return (
                    <div
                      key={reel.id}
                      onClick={() => setSelectedReel(reel)}
                      className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/10 hover:border-pink-500/50 transition-all hover:scale-[1.02]"
                    >
                      <img
                        src={reel.thumbnailUrl}
                        alt={reel.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-pink-400 font-bold flex items-center gap-1 border border-pink-500/30">
                        <Film className="w-3 h-3" />
                        <span>Reel</span>
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left space-y-1">
                        <p className="text-[11px] text-white font-semibold line-clamp-1">@{reel.user.username}</p>
                        <p className="text-[10px] text-zinc-300 line-clamp-1">{reel.caption}</p>
                      </div>
                    </div>
                  );
                } else {
                  const post = item.data as Post;
                  return (
                    <div
                      key={post.id}
                      onClick={() => openPostDetail(post)}
                      className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/10 hover:border-pink-500/50 transition-all hover:scale-[1.02]"
                    >
                      <img
                        src={post.media[0]?.url}
                        alt={post.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                        <p className="text-[11px] text-white font-semibold line-clamp-1">@{post.user.username}</p>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="py-24 text-center space-y-4 max-w-md mx-auto aerogel-card rounded-3xl p-8">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-xl shadow-cyan-500/10">
                <Compass className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">No Transmissions in this Sector</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Explore new posts and Instagram reels as creators share transmissions.
                </p>
              </div>
              <button
                onClick={() => setIsCreatePostOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-cosmic text-white text-xs font-bold rounded-2xl shadow-lg shadow-pink-500/30 hover:opacity-90 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create First Transmission</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Full-Screen Reel Modal Preview when a Reel is clicked in Explore */}
      {selectedReel && (
        <div 
          onClick={() => setSelectedReel(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 animate-fadeIn"
        >
          <button
            onClick={() => setSelectedReel(null)}
            className="absolute top-4 right-4 z-60 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-md"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-[420px] h-[85vh] max-h-[760px] bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col"
          >
            <audio
              ref={modalAudioRef}
              src={resolveAudioUrl(selectedReel)}
              loop
            />

            <div 
              onClick={toggleModalPlayback}
              className="relative flex-1 bg-black flex items-center justify-center overflow-hidden cursor-pointer"
            >
              <video
                ref={modalVideoRef}
                src={selectedReel.videoUrl}
                poster={selectedReel.thumbnailUrl}
                loop
                playsInline
                className="w-full h-full object-cover"
              />

              {!isModalPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Play className="w-7 h-7 fill-white translate-x-0.5" />
                  </div>
                </div>
              )}

              <button
                onClick={toggleModalMute}
                className="absolute top-4 left-4 p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10"
              >
                {isReelMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <div className="absolute bottom-4 left-4 right-4 text-left space-y-2 pointer-events-none">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedReel.user.avatar}
                    alt={selectedReel.user.username}
                    className="w-8 h-8 rounded-full border border-pink-500 object-cover"
                  />
                  <span className="text-xs font-bold text-white">@{selectedReel.user.username}</span>
                </div>
                <p className="text-xs text-white/90 line-clamp-2">{selectedReel.caption}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-pink-400 font-medium">
                  <Music className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>{selectedReel.audioTitle}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
