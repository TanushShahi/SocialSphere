import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Search, 
  Sparkles, 
  Compass, 
  Film, 
  Play, 
  Pause, 
  Send, 
  Volume2, 
  VolumeX, 
  X, 
  UserPlus, 
  Check, 
  Lock, 
  Globe, 
  Phone, 
  Video, 
  Loader2,
  Database,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Post, Reel, User } from '../../types';
import { TRENDING_INSTAGRAM_REELS } from '../reels/trendingReels';
import { CURATED_SONGS } from '../music/curatedTracks';
import { supabaseService } from '../../api/supabaseClient';
import { SupabaseConfigModal } from '../database/SupabaseConfigModal';

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
    setActiveTab,
    currentUser,
    openUserProfile,
    startConversationWithUser,
    toggleFollowUser,
    initiateCall,
    onlineUserIds
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Universe');
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [isReelMuted, setIsReelMuted] = useState(false);
  const [isModalPlaying, setIsModalPlaying] = useState(true);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Search accounts state
  const [userResults, setUserResults] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [followProcessingId, setFollowProcessingId] = useState<string | null>(null);

  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const modalAudioRef = useRef<HTMLAudioElement | null>(null);

  // Instant debounced search for user accounts in Supabase
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
        const found = await supabaseService.searchUsers(q, currentUser?.id);
        // Check following status for each user against current user's following list
        const currentFollowingSet = new Set(currentUser?.following || []);
        const enriched = found.map(u => ({
          ...u,
          isFollowing: currentFollowingSet.has(u.id) || Boolean(u.isFollowing)
        }));
        setUserResults(enriched);
      } catch (err) {
        console.error('Supabase search users error:', err);
        setUserResults([]);
      } finally {
        setUserLoading(false);
      }
    }, 180);

    return () => clearTimeout(timeout);
  }, [searchQuery, currentUser]);

  const handleToggleFollow = async (targetUser: User, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    setFollowProcessingId(targetUser.id);
    try {
      const nextState = await toggleFollowUser(targetUser.id);
      setUserResults(prev => prev.map(u => {
        if (u.id === targetUser.id) {
          const countDiff = nextState ? 1 : -1;
          return {
            ...u,
            isFollowing: nextState,
            followersCount: Math.max(0, (u.followersCount || 0) + countDiff)
          };
        }
        return u;
      }));
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setFollowProcessingId(null);
    }
  };

  const handleStartChat = async (targetUser: User, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const convId = await startConversationWithUser(targetUser);
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

    if (action === 'follow' && currentUser) {
      await toggleFollowUser(friend.id);
    }

    if (action === 'chat') {
      const convId = await startConversationWithUser(friend);
      if (convId) {
        try { sessionStorage.setItem('sphere_active_conv_id', convId); } catch {}
        setActiveTab('messages');
      }
    } else {
      setUserResults([friend]);
    }
  };

  const handleAudioCall = (targetUser: User, e: React.MouseEvent) => {
    e.stopPropagation();
    initiateCall({
      id: targetUser.id,
      username: targetUser.username,
      name: targetUser.name,
      avatar: targetUser.avatar
    }, 'audio');
  };

  const handleVideoCall = (targetUser: User, e: React.MouseEvent) => {
    e.stopPropagation();
    initiateCall({
      id: targetUser.id,
      username: targetUser.username,
      name: targetUser.name,
      avatar: targetUser.avatar
    }, 'video');
  };

  // Combine media items for explore view
  const exploreItems: ExploreItem[] = useMemo(() => {
    const combined: ExploreItem[] = [];
    const allReels = [...TRENDING_INSTAGRAM_REELS, ...reels];

    if (selectedCategory === '📸 Instagram Reels') {
      return TRENDING_INSTAGRAM_REELS.map(r => ({ kind: 'reel', data: r }));
    }
    if (selectedCategory === '🎥 All Reels') {
      return allReels.map(r => ({ kind: 'reel', data: r }));
    }
    if (selectedCategory === 'Photos') {
      return posts.map(p => ({ kind: 'post', data: p }));
    }

    let pIdx = 0;
    let rIdx = 0;
    while (pIdx < posts.length || rIdx < allReels.length) {
      if (pIdx < posts.length) {
        combined.push({ kind: 'post', data: posts[pIdx++] });
      }
      if (rIdx < allReels.length) {
        combined.push({ kind: 'reel', data: allReels[rIdx++] });
      }
      if (pIdx < posts.length) {
        combined.push({ kind: 'post', data: posts[pIdx++] });
      }
    }
    return combined;
  }, [posts, reels, selectedCategory]);

  const cleanQuery = searchQuery.trim().replace(/^@+/, '');

  return (
    <div className="min-h-screen pb-24 md:pb-12 text-white">
      {/* Search Header Bar */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-3.5 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {/* Instagram Search Input Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search friends, @username, or reels..."
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-900/90 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/40 transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Database Setup Button */}
          <button
            onClick={() => setIsDbModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold transition-all group"
            title="Database Connection & Supabase Settings"
          >
            <div className={`w-2 h-2 rounded-full ${supabaseService.isConfigured() ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'}`} />
            <span className="hidden sm:inline text-zinc-300 group-hover:text-white">Database</span>
            <Database className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
        {/* ======================================================== */}
        {/* SEARCH MODE: Display Real Accounts Matching Query */}
        {/* ======================================================== */}
        {searchQuery.trim().length > 0 ? (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <span>Account Results for &ldquo;{searchQuery}&rdquo;</span>
                {userLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" />}
              </h2>
              <span className="text-xs text-zinc-400 font-medium">
                {userResults.length} {userResults.length === 1 ? 'account' : 'accounts'} found
              </span>
            </div>

            {/* Loading Skeleton */}
            {userLoading && userResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-7 h-7 text-pink-400 animate-spin" />
                <p className="text-xs text-zinc-400">Searching cloud database...</p>
              </div>
            )}

            {/* Results List */}
            {userResults.length > 0 && (
              <div className="space-y-2.5">
                {userResults.map(user => {
                  const isOnline = onlineUserIds.includes(user.id);
                  const isProcessing = followProcessingId === user.id;

                  return (
                    <div
                      key={user.id}
                      onClick={() => openUserProfile(user)}
                      className="group cursor-pointer flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-pink-500/30 transition-all shadow-lg"
                    >
                      {/* Avatar & User Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative">
                          <img
                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform"
                          />
                          {isOnline && (
                            <span 
                              className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-black rounded-full shadow-[0_0_6px_#34d399]" 
                              title="Online now"
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                              @{user.username}
                            </span>
                            {user.isVerified && (
                              <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 flex items-center justify-center text-[9px] font-bold text-white" title="Verified">
                                ✓
                              </span>
                            )}
                            {user.isPrivate ? (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-800 text-[10px] text-zinc-400 font-medium">
                                <Lock className="w-2.5 h-2.5" /> Private
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-800 text-[10px] text-zinc-400 font-medium">
                                <Globe className="w-2.5 h-2.5" /> Public
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-300 truncate font-medium mt-0.5">{user.name}</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            <span className="text-zinc-300 font-semibold">{user.followersCount ?? 0}</span> followers
                            {user.bio ? <span className="ml-2 text-zinc-400 truncate">• {user.bio}</span> : null}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        {/* Follow Button */}
                        <button
                          onClick={e => handleToggleFollow(user, e)}
                          disabled={isProcessing}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            user.isFollowing
                              ? 'bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-zinc-300 border border-white/10'
                              : 'bg-gradient-cosmic text-white hover:opacity-90 shadow-md shadow-pink-500/20'
                          }`}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : user.isFollowing ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-pink-400" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>

                        {/* Direct Chat Button */}
                        <button
                          onClick={e => handleStartChat(user, e)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all"
                          title="Message"
                        >
                          <MessageCircle className="w-4 h-4 text-cyan-400" />
                        </button>

                        {/* Audio Call */}
                        <button
                          onClick={e => handleAudioCall(user, e)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 border border-white/10 text-zinc-300 transition-all hidden sm:flex"
                          title="Audio Call"
                        >
                          <Phone className="w-4 h-4" />
                        </button>

                        {/* Video Call */}
                        <button
                          onClick={e => handleVideoCall(user, e)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-violet-500/20 hover:text-violet-300 border border-white/10 text-zinc-300 transition-all hidden sm:flex"
                          title="Video Call"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

                        {/* Direct Connect / Add Friend Card when query has no cloud match */}
            {!userLoading && userResults.length === 0 && (
              <div className="py-10 px-6 text-center rounded-3xl bg-zinc-900/60 border border-white/10 shadow-2xl max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Connect with @{cleanQuery}</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    Not found in the cloud cache yet? You can still follow and message <strong className="text-white">@{cleanQuery}</strong> directly right now!
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleAddDirectFriend(cleanQuery, 'follow')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-cosmic text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Follow @{cleanQuery}
                  </button>
                  <button
                    onClick={() => handleAddDirectFriend(cleanQuery, 'chat')}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-cyan-300 text-xs font-bold border border-white/10 transition-all flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* DEFAULT MODE: Instagram Explore Disks, Categories & Media Grid */
          /* ======================================================== */
          <div className="space-y-6">
            {/* Visual Topic Circles */}
            <div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {VISUAL_EXPLORE_DISKS.map(disk => (
                  <button
                    key={disk.id}
                    onClick={() => setSelectedCategory(disk.name)}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
                  >
                    <div className={`w-16 h-16 rounded-full p-[2px] border-2 transition-all duration-300 group-hover:scale-105 ${
                      selectedCategory === disk.name
                        ? disk.borderColor
                        : 'border-white/10 group-hover:border-white/30'
                    }`}>
                      <img
                        src={disk.image}
                        alt={disk.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <span className={`text-xs font-medium transition-colors ${
                      selectedCategory === disk.name ? 'text-white font-bold' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}>
                      {disk.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {EXPLORE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-white text-black shadow-md'
                      : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Explore Media Grid */}
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {exploreItems.map((item, idx) => {
                if (item.kind === 'post') {
                  const p = item.data;
                  const firstMedia = p.media[0];
                  return (
                    <div
                      key={`post_${p.id}_${idx}`}
                      onClick={() => openPostDetail(p)}
                      className="group relative aspect-square bg-zinc-900 rounded-lg overflow-hidden cursor-pointer"
                    >
                      {firstMedia?.type === 'video' ? (
                        <video
                          src={firstMedia.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={firstMedia?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'}
                          alt={p.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      {/* Multiple photos indicator */}
                      {p.media.length > 1 && (
                        <div className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white text-[10px]">
                          ❐
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4 fill-white" />
                          <span>{p.likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 fill-white" />
                          <span>{p.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Reel item
                const r = item.data;
                return (
                  <div
                    key={`reel_${r.id}_${idx}`}
                    onClick={() => {
                      setSelectedReel(r);
                      setIsModalPlaying(true);
                    }}
                    className="group relative aspect-[9/16] row-span-2 bg-zinc-900 rounded-lg overflow-hidden cursor-pointer"
                  >
                    <video
                      src={r.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                    <div className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white">
                      <Film className="w-3.5 h-3.5" />
                    </div>

                    {/* Gradient bottom bar with user and title */}
                    <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                      <p className="text-[11px] font-bold text-white truncate">@{r.user.username}</p>
                      <p className="text-[10px] text-zinc-300 truncate mt-0.5">{r.caption}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-300">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> {r.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {r.commentsCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reel Modal */}
      {selectedReel && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedReel(null)}
        >
          <div 
            className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <video
              ref={modalVideoRef}
              src={selectedReel.videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              loop
              playsInline
              muted={isReelMuted}
            />

            {/* Separate audio track */}
            <audio
              ref={modalAudioRef}
              src={resolveAudioUrl(selectedReel)}
              autoPlay
              loop
              muted={isReelMuted}
            />

            {/* Close button */}
            <button
              onClick={() => setSelectedReel(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sound toggle */}
            <button
              onClick={() => setIsReelMuted(!isReelMuted)}
              className="absolute top-4 left-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all"
            >
              {isReelMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Bottom Info */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              <div 
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => {
                  setSelectedReel(null);
                  openUserProfile(selectedReel.user);
                }}
              >
                <img
                  src={selectedReel.user.avatar}
                  alt={selectedReel.user.username}
                  className="w-9 h-9 rounded-full object-cover border border-white/20"
                />
                <div>
                  <p className="text-xs font-bold text-white">@{selectedReel.user.username}</p>
                  <p className="text-[10px] text-zinc-300">{selectedReel.audioTitle}</p>
                </div>
              </div>
              <p className="text-xs text-white mt-2">{selectedReel.caption}</p>
            </div>
          </div>
        </div>
      )}

      {/* Database Setup Modal */}
      <SupabaseConfigModal 
        isOpen={isDbModalOpen} 
        onClose={() => setIsDbModalOpen(false)} 
      />
    </div>
  );
};
