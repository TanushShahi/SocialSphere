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
  Flame
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Post, Reel } from '../../types';
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
    currentUser 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('All Universe');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [isReelMuted, setIsReelMuted] = useState(false);
  const [isModalPlaying, setIsModalPlaying] = useState(true);
  const [needsGesture, setNeedsGesture] = useState(false);

  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const modalAudioRef = useRef<HTMLAudioElement | null>(null);

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

  const toggleModalPlayPause = () => {
    if (needsGesture && modalAudioRef.current) {
      modalAudioRef.current.muted = isReelMuted;
      modalAudioRef.current.play().catch(() => {});
      setNeedsGesture(false);
      return;
    }

    setIsModalPlaying(prev => {
      const next = !prev;
      if (modalVideoRef.current) {
        if (next) modalVideoRef.current.play().catch(() => {});
        else modalVideoRef.current.pause();
      }
      if (modalAudioRef.current) {
        if (next) modalAudioRef.current.play().catch(() => {});
        else modalAudioRef.current.pause();
      }
      return next;
    });
  };

  const handleShareItem = (e: React.MouseEvent, item: ExploreItem) => {
    e.stopPropagation();
    if (item.kind === 'post') {
      const post = item.data;
      openShareModal({
        id: post.id,
        type: 'post',
        title: `Post by @${post.user.username}`,
        caption: post.caption,
        mediaUrl: post.media[0]?.url || '',
        author: {
          id: post.user.id,
          username: post.user.username,
          name: post.user.name,
          avatar: post.user.avatar
        }
      });
    } else {
      const reel = item.data;
      openShareModal({
        id: reel.id,
        type: 'reel',
        title: `Reel by @${reel.user.username}`,
        caption: reel.caption,
        mediaUrl: reel.videoUrl,
        author: {
          id: reel.user.id,
          username: reel.user.username,
          name: reel.user.name,
          avatar: reel.user.avatar
        }
      });
    }
  };

  return (
    <div className="max-w-[1050px] mx-auto py-5 px-3 sm:px-6 space-y-5 animate-fade-in text-white select-none">
      {/* Top Banner: Quick Jump to Live Instagram Reels Feed */}
      <div 
        onClick={() => setActiveTab('reels')}
        className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-amber-900/30 border border-pink-500/30 flex items-center justify-between cursor-pointer hover:border-pink-500/60 transition-all shadow-xl group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-cosmic flex items-center justify-center text-white shadow-lg shadow-pink-500/30 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold flex items-center gap-2">
              Trending Instagram Reels
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500 text-white font-extrabold uppercase animate-pulse">
                Live Sound
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400">
              Watch viral vertical transmissions with music playing automatically
            </p>
          </div>
        </div>

        <button className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1 transition-colors border border-white/10">
          <span>Watch Feed</span>
          <Play className="w-3 h-3 fill-white" />
        </button>
      </div>

      {/* Top Cosmic Search Bar */}
      <div className="relative max-w-lg mx-auto">
        <div className="absolute inset-0 bg-gradient-cosmic rounded-2xl opacity-20 blur-md pointer-events-none"></div>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Instagram reels, posts, creators, soundtracks..."
            className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 backdrop-blur-xl transition-all shadow-xl"
          />
        </div>
      </div>

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
                {/* Circular glowing disk */}
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

                {/* Name */}
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
            const isIgReel = isReel && item.data.id.startsWith('reel_ig');

            if (isReel) {
              const reel = item.data;
              return (
                <div
                  key={reel.id}
                  onClick={() => setSelectedReel(reel)}
                  className="relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer group select-none bg-zinc-950 border border-white/10 aspect-[9/16] shadow-lg hover:shadow-pink-500/20 transition-all hover:scale-[1.01]"
                >
                  {/* Video preview with muted autoplay on hover */}
                  <video
                    src={reel.videoUrl}
                    poster={reel.thumbnailUrl}
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Reel Type Badges */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1">
                    {isIgReel ? (
                      <span className="bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <span>📸</span> IG Reel
                      </span>
                    ) : (
                      <span className="bg-black/70 backdrop-blur-md text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                        <Film className="w-3 h-3 text-pink-400" /> Reel
                      </span>
                    )}
                  </div>

                  {/* Audio pill at top right */}
                  {reel.audioTitle && (
                    <div className="absolute top-2.5 right-2.5 z-10 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 text-[9px] text-white border border-white/10 max-w-[100px] truncate">
                      <Music className="w-2.5 h-2.5 text-pink-400 shrink-0 animate-pulse" />
                      <span className="truncate">{reel.audioTitle}</span>
                    </div>
                  )}

                  {/* Play Indicator on bottom */}
                  <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 text-white text-xs font-bold drop-shadow-md">
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{reel.likesCount >= 1000 ? `${(reel.likesCount / 1000).toFixed(0)}k` : reel.likesCount}</span>
                  </div>

                  {/* Direct Share Button Icon at bottom right */}
                  <button
                    onClick={(e) => handleShareItem(e, item)}
                    className="absolute bottom-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-pink-600 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-75 shadow-lg border border-white/20"
                    title="Share this reel"
                  >
                    <Send className="w-4 h-4" />
                  </button>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white backdrop-blur-[2px] p-4 text-center pointer-events-none">
                    <img 
                      src={reel.user.avatar} 
                      alt={reel.user.username} 
                      className="w-9 h-9 rounded-full object-cover border border-white/40"
                    />
                    <p className="text-xs font-bold truncate max-w-[90%]">@{reel.user.username}</p>
                    <p className="text-[11px] text-zinc-300 line-clamp-2">{reel.caption}</p>
                    <div className="flex items-center gap-4 font-bold text-xs mt-1">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                        <span>{reel.likesCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>{reel.commentsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Post Card
            const post = item.data;
            const primaryMedia = post.media[0]?.url || '';

            return (
              <div
                key={post.id}
                onClick={() => openPostDetail(post)}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer group select-none bg-zinc-950 border border-white/10 aspect-square shadow-lg hover:shadow-cyan-500/20 transition-all hover:scale-[1.01]"
              >
                <img
                  src={primaryMedia}
                  alt={`Post by ${post.user.username}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Floating Soundtrack Pill */}
                {post.songTitle && (
                  <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xl px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] text-white border border-white/10 shadow-lg max-w-[110px] truncate">
                    <Music className="w-2.5 h-2.5 text-pink-400 animate-pulse shrink-0" />
                    <span className="truncate">{post.songTitle}</span>
                  </div>
                )}

                {/* Direct Share Button on Post Card */}
                <button
                  onClick={(e) => handleShareItem(e, item)}
                  className="absolute bottom-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-pink-600 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-75 shadow-lg border border-white/20"
                  title="Share this post"
                >
                  <Send className="w-4 h-4" />
                </button>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 text-white backdrop-blur-[3px] p-4 text-center pointer-events-none">
                  <img 
                    src={post.user.avatar} 
                    alt={post.user.username} 
                    className="w-8 h-8 rounded-full object-cover border border-white/40"
                  />
                  <p className="text-xs font-bold truncate max-w-[80%]">@{post.user.username}</p>
                  <div className="flex items-center gap-5 font-bold text-xs">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      <span>{post.likesCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 fill-white text-white" />
                      <span>{post.comments.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-24 text-center space-y-4 max-w-md mx-auto aerogel-card rounded-3xl p-8">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-xl shadow-cyan-500/10">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">No Transmissions in this Sector</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {searchQuery
                ? `No transmissions matched "${searchQuery}". Try a different keyword or creator name.`
                : 'Explore new posts and Instagram reels as creators share transmissions.'}
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

      {/* Full-Screen Reel Modal Preview when a Reel is clicked in Explore */}
      {selectedReel && (
        <div 
          onClick={() => setSelectedReel(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 animate-fadeIn"
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedReel(null)}
            className="absolute top-4 right-4 z-60 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-md"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal Container */}
          <div 
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-[420px] h-[85vh] max-h-[760px] bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col"
          >
            {/* Dedicated Audio Element for Music Playback */}
            <audio
              ref={modalAudioRef}
              src={resolveAudioUrl(selectedReel)}
              loop
              preload="auto"
              muted={isReelMuted}
            />

            {/* Video Player */}
            <div 
              onClick={toggleModalPlayPause}
              className="relative flex-1 bg-black overflow-hidden flex items-center justify-center cursor-pointer group/modalvideo"
            >
              <video
                ref={modalVideoRef}
                src={selectedReel.videoUrl}
                poster={selectedReel.thumbnailUrl}
                loop
                autoPlay
                playsInline
                muted={isReelMuted}
                className="w-full h-full object-cover"
              />

              {/* Pause/Play Center Overlay when paused */}
              {!isModalPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30">
                  <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </div>
                </div>
              )}

              {/* Floating Tap for sound button if browser blocked autoplay sound */}
              {needsGesture && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (modalAudioRef.current) {
                      modalAudioRef.current.muted = false;
                      modalAudioRef.current.play().catch(() => {});
                    }
                    setIsReelMuted(false);
                    setNeedsGesture(false);
                  }}
                  className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs rounded-full shadow-2xl flex items-center gap-1.5 animate-bounce"
                >
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>Tap to Unmute Music 🔊</span>
                </button>
              )}

              {/* Sound Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReelMuted(prev => !prev);
                  setNeedsGesture(false);
                }}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-transform active:scale-95"
              >
                {isReelMuted ? <VolumeX className="w-5 h-5 text-zinc-300" /> : <Volume2 className="w-5 h-5 text-pink-400" />}
              </button>

              {/* Watch on Reels Feed Shortcut at top-left */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReel(null);
                  setActiveTab('reels');
                }}
                className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-black/60 hover:bg-pink-600 text-white text-[11px] font-bold backdrop-blur-md transition-all flex items-center gap-1 shadow-md border border-white/10"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Open in Reels Tab</span>
              </button>

              {/* Overlay Actions Stack on right */}
              <div className="absolute right-3 bottom-14 z-20 flex flex-col items-center gap-4 text-white">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLikeReel(selectedReel.id);
                  }}
                  className="p-2 rounded-full hover:bg-black/40 transition-transform active:scale-75"
                >
                  <Heart className={`w-7 h-7 drop-shadow-md ${selectedReel.isLiked ? 'text-rose-500 fill-rose-500' : 'stroke-[2]'}`} />
                </button>
                <span className="text-[11px] font-bold drop-shadow-md -mt-2">
                  {selectedReel.likesCount.toLocaleString()}
                </span>

                <button 
                  onClick={(e) => handleShareItem(e, { kind: 'reel', data: selectedReel })}
                  className="p-2 rounded-full hover:bg-black/40 transition-transform active:scale-75"
                  title="Share Reel"
                >
                  <Send className="w-7 h-7 stroke-[2] drop-shadow-md" />
                </button>
                <span className="text-[11px] font-bold drop-shadow-md -mt-2">
                  Share
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveReel(selectedReel.id);
                  }}
                  className="p-2 rounded-full hover:bg-black/40 transition-transform active:scale-75"
                >
                  <Bookmark className={`w-6 h-6 drop-shadow-md ${selectedReel.isSaved ? 'fill-white stroke-white' : 'stroke-[2]'}`} />
                </button>
              </div>

              {/* Creator & Caption Overlay */}
              <div className="absolute left-3 right-16 bottom-4 z-20 space-y-1.5 text-white drop-shadow-lg pointer-events-auto">
                <div className="flex items-center gap-2">
                  <img 
                    src={selectedReel.user.avatar} 
                    alt={selectedReel.user.username} 
                    className="w-8 h-8 rounded-full object-cover border border-white/40"
                  />
                  <span className="font-bold text-xs">@{selectedReel.user.username}</span>
                  {selectedReel.id.startsWith('reel_ig') && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white">
                      Instagram Reel
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-100 line-clamp-2 leading-relaxed">
                  {selectedReel.caption}
                </p>

                {selectedReel.audioTitle && (
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-200 bg-black/50 px-2.5 py-0.5 rounded-full w-fit backdrop-blur-md border border-white/10">
                    <Music className="w-3 h-3 text-pink-400 animate-pulse" />
                    <span className="truncate max-w-[200px] font-medium">{selectedReel.audioTitle}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
