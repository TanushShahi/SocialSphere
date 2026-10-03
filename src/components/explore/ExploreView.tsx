import React, { useState, useMemo, useRef } from 'react';
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
  Send, 
  Volume2, 
  VolumeX, 
  X,
  Bookmark
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Post, Reel } from '../../types';
import { TRENDING_INSTAGRAM_REELS } from '../reels/trendingReels';

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

type ExploreItem = 
  | { kind: 'post'; data: Post }
  | { kind: 'reel'; data: Reel };

export const ExploreView: React.FC = () => {
  const { 
    openPostDetail, 
    posts, 
    reels, 
    setIsCreatePostOpen, 
    openShareModal, 
    toggleLikeReel, 
    toggleSaveReel, 
    currentUser 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('All Universe');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [isReelMuted, setIsReelMuted] = useState(false);

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
    <div className="max-w-[1050px] mx-auto py-5 px-3 sm:px-6 space-y-6 animate-fade-in text-white select-none">
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
          {filteredItems.map((item, idx) => {
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
                  <img
                    src={reel.thumbnailUrl}
                    alt={reel.caption}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
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
                      <Music className="w-2.5 h-2.5 text-pink-400 shrink-0" />
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
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white backdrop-blur-[2px] p-4 text-center">
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
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 text-white backdrop-blur-[3px] p-4 text-center">
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
                      <span>{post.comments.length.toLocaleString()}</span>
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
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 animate-fadeIn"
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
            {/* Video Player */}
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
              <video
                src={selectedReel.videoUrl}
                poster={selectedReel.thumbnailUrl}
                loop
                autoPlay
                playsInline
                muted={isReelMuted}
                className="w-full h-full object-cover"
              />

              {/* Sound Toggle */}
              <button
                onClick={() => setIsReelMuted(prev => !prev)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-transform active:scale-95"
              >
                {isReelMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Overlay Actions Stack on right */}
              <div className="absolute right-3 bottom-14 z-20 flex flex-col items-center gap-4 text-white">
                <button
                  onClick={() => toggleLikeReel(selectedReel.id)}
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
                  onClick={() => toggleSaveReel(selectedReel.id)}
                  className="p-2 rounded-full hover:bg-black/40 transition-transform active:scale-75"
                >
                  <Bookmark className={`w-6 h-6 drop-shadow-md ${selectedReel.isSaved ? 'fill-white stroke-white' : 'stroke-[2]'}`} />
                </button>
              </div>

              {/* Creator & Caption Overlay */}
              <div className="absolute left-3 right-16 bottom-4 z-20 space-y-1.5 text-white drop-shadow-lg">
                <div className="flex items-center gap-2">
                  <img 
                    src={selectedReel.user.avatar} 
                    alt={selectedReel.user.username} 
                    className="w-8 h-8 rounded-full object-cover border border-white/40"
                  />
                  <span className="font-bold text-xs">@{selectedReel.user.username}</span>
                  {selectedReel.id.startsWith('reel_ig') && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white">
                      Instagram
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-100 line-clamp-2 leading-relaxed">
                  {selectedReel.caption}
                </p>

                {selectedReel.audioTitle && (
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 bg-black/40 px-2 py-0.5 rounded-full w-fit backdrop-blur-md">
                    <Music className="w-3 h-3 text-pink-400 animate-pulse" />
                    <span className="truncate max-w-[200px]">{selectedReel.audioTitle}</span>
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
