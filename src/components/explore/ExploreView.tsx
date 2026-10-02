import React, { useState } from 'react';
import { Heart, MessageCircle, Search, Sparkles, Compass, Plus, Music, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Post } from '../../types';

export const EXPLORE_CATEGORIES = [
  'All Universe',
  'Architecture',
  'Photography',
  'Travel',
  'Aesthetic',
  'Cyber & Tech',
  'Soundtracks',
  'Nature'
];

export const ExploreView: React.FC = () => {
  const { openPostDetail, posts, setIsCreatePostOpen } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All Universe');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter real posts based on search query and category
  const filteredPosts = posts.filter(post => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const matchCaption = post.caption?.toLowerCase().includes(q);
      const matchUser = post.user.username.toLowerCase().includes(q) || post.user.name.toLowerCase().includes(q);
      const matchSong = post.songTitle?.toLowerCase().includes(q) || post.songArtist?.toLowerCase().includes(q);
      if (!matchCaption && !matchUser && !matchSong) return false;
    }

    if (selectedCategory !== 'All Universe') {
      const catTag = selectedCategory.toLowerCase().replace(/\s+/g, '');
      const matchTag = post.caption?.toLowerCase().includes(catTag) || post.caption?.toLowerCase().includes(selectedCategory.toLowerCase());
      if (!matchTag && selectedCategory === 'Soundtracks' && !post.songTitle) return false;
    }

    return true;
  });

  return (
    <div className="max-w-[1000px] mx-auto py-5 px-3 sm:px-6 space-y-6 animate-fade-in text-white select-none">
      {/* Top Cosmic Search Bar */}
      <div className="relative max-w-lg mx-auto">
        <div className="absolute inset-0 bg-gradient-cosmic rounded-2xl opacity-20 blur-md pointer-events-none"></div>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search celestial posts, creators, soundtracks..."
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
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {filteredPosts.map((post, idx) => {
            const isFeatured = idx === 0 && filteredPosts.length > 2;
            const primaryMedia = post.media[0]?.url || '';

            return (
              <div
                key={post.id}
                onClick={() => openPostDetail(post)}
                className={`relative rounded-3xl overflow-hidden cursor-pointer group select-none aerogel-card border border-white/10 ${
                  isFeatured ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
                }`}
              >
                <img
                  src={primaryMedia}
                  alt={`Post by ${post.user.username}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Floating Soundtrack Pill */}
                {post.songTitle && (
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xl px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] text-white border border-white/10 shadow-lg">
                    <Music className="w-3 h-3 text-pink-400 animate-pulse" />
                    <span className="truncate max-w-[120px] font-medium hidden sm:inline">{post.songTitle}</span>
                  </div>
                )}

                {/* Hover Aura Dark Overlay with Metrics */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 text-white backdrop-blur-[3px] p-4 text-center">
                  <p className="text-xs font-bold truncate max-w-[80%]">@{post.user.username}</p>
                  <div className="flex items-center gap-6 font-bold text-sm">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-5 h-5 fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                      <span>{post.likesCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-5 h-5 fill-white text-white" />
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
            <h3 className="text-base font-bold text-white">No Posts in this Sector</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {searchQuery
                ? `No transmissions matched "${searchQuery}". Try a different keyword or creator name.`
                : 'Be the first creator to share a photo with a soundtrack to appear on Explore!'}
            </p>
          </div>
          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-cosmic text-white text-xs font-bold rounded-2xl shadow-lg shadow-pink-500/30 hover:opacity-90 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create First Post</span>
          </button>
        </div>
      )}
    </div>
  );
};