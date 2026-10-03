import React, { useState, useEffect, useMemo } from 'react';
import { StoriesBar } from './StoriesBar';
import { PostCard } from './PostCard';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { User } from '../../types';
import { CheckCircle2, Sparkles, Compass, Music, UserPlus, Radio, Globe, MapPin } from 'lucide-react';
import { POPULAR_TRACKS } from '../music/MusicPickerModal';

export const FeedView: React.FC = () => {
  const { posts, currentUser, toggleFollowUser, setIsCreatePostOpen, setActiveTab, startConversationWithUser } = useApp();
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [feedFilter, setFeedFilter] = useState<'for_you' | 'following' | 'worlds' | 'nearby'>('for_you');

  useEffect(() => {
    api.users.suggested()
      .then(res => setSuggestedUsers(res.users))
      .catch(console.error);
  }, []);

  const filteredPosts = useMemo(() => {
    if (feedFilter === 'following') {
      const followingIds = new Set(currentUser?.following || []);
      return posts.filter(p => followingIds.has(p.user.id) || p.user.id === currentUser?.id);
    }
    if (feedFilter === 'worlds') {
      return posts.filter(p => p.caption.includes('#') || Boolean(p.location));
    }
    if (feedFilter === 'nearby') {
      return posts.filter(p => Boolean(p.location && p.location.trim().length > 0));
    }
    return posts;
  }, [posts, feedFilter, currentUser]);

  if (!currentUser) return null;

  return (
    <div className="max-w-[1020px] mx-auto flex justify-center gap-10 py-2 sm:py-6 px-2 sm:px-4">
      {/* Center Feed Column */}
      <main className="w-full max-w-[500px] min-w-0">
        {/* Orbital Stories Bar */}
        <StoriesBar />

        {/* Mockup Filter Chips Row: [ For You ] [ Following ] [ Worlds ] [ Nearby ] */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 my-1 px-1 select-none">
          {[
            { id: 'for_you', label: 'For You', icon: Sparkles },
            { id: 'following', label: 'Following', icon: UserPlus },
            { id: 'worlds', label: 'Worlds', icon: Globe },
            { id: 'nearby', label: 'Nearby', icon: MapPin },
          ].map(chip => {
            const Icon = chip.icon;
            const isActive = feedFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setFeedFilter(chip.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-gradient-cosmic text-white shadow-md shadow-pink-500/25 scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Posts Stream or Empty State */}
        {filteredPosts.length > 0 ? (
          <>
            <div className="pt-2 space-y-4">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* "Caught Up in Orbit" Cosmic Badge */}
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 aerogel-card rounded-3xl p-8 mt-6">
              <div className="w-14 h-14 rounded-full bg-gradient-cosmic p-[2px] flex items-center justify-center shadow-lg shadow-purple-500/20">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-white">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 stroke-[2.5]" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">You&apos;re caught up in orbit</h3>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                You&apos;ve seen all fresh transmissions and soundtracks from the creators you follow.
              </p>
            </div>
          </>
        ) : (
          /* Welcoming Cosmic Card when 0 posts exist */
          <div className="pt-10 pb-14 px-8 flex flex-col items-center justify-center text-center space-y-5 aerogel-card rounded-3xl my-6 animate-fade-in relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-18 h-18 rounded-3xl bg-gradient-cosmic p-[2px] flex items-center justify-center shadow-2xl shadow-pink-500/25">
              <div className="w-full h-full bg-black rounded-[22px] flex items-center justify-center text-white">
                <Sparkles className="w-9 h-9 text-pink-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-lg font-black text-white tracking-tight">Welcome to the Sphere</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your universe is ready. Share your moments, attach songs to your posts & stories, and connect with people across the world.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsCreatePostOpen(true)}
                className="px-6 py-2.5 bg-gradient-cosmic text-white rounded-2xl text-xs font-bold shadow-lg shadow-pink-500/30 hover:opacity-95 transition-all active:scale-95"
              >
                Create First Post
              </button>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-2xl text-xs font-semibold border border-white/10 transition-colors"
              >
                Explore World
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Right Desktop Suggestions Sidebar (>= 1024px) */}
      <aside className="hidden lg:block w-[320px] flex-shrink-0 pt-3 space-y-5 text-xs select-none">
        {/* Current User Orbital Card */}
        <div className="p-4 aerogel-card rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full bg-gradient-cosmic p-[2px] flex-shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full rounded-full object-cover border border-black"
              />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-xs truncate">{currentUser.username}</p>
              <p className="text-zinc-400 text-[11px] truncate">{currentUser.name}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className="text-[11px] font-bold text-pink-400 hover:text-pink-300 transition-colors"
          >
            Profile
          </button>
        </div>

        {/* Global Creators Spotlight */}
        <div className="p-4 aerogel-card rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>World Explorers</span>
            </span>
            <button
              onClick={() => setActiveTab('explore')}
              className="text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              See all
            </button>
          </div>

          {/* Suggested List */}
          <div className="space-y-2.5">
            {suggestedUsers.length > 0 ? (
              suggestedUsers.slice(0, 4).map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-2 p-1.5 rounded-2xl hover:bg-white/5 transition-colors group">
                  <div 
                    onClick={() => {
                      startConversationWithUser(user);
                      setActiveTab('messages');
                    }}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                  >
                    <div className="relative w-9 h-9 rounded-full bg-gradient-cosmic p-[1px] flex-shrink-0">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover border border-black"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-[11px] truncate">{user.username}</p>
                      <p className="text-zinc-500 text-[10px] truncate">{user.name}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFollowUser(user.id)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
                      user.isFollowing
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-gradient-cosmic text-white shadow-md shadow-pink-500/20 hover:opacity-90'
                    }`}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-zinc-500 py-2 text-center">
                Invite friends or search creators to connect!
              </p>
            )}
          </div>
        </div>

        {/* Featured Soundtracks Widget */}
        <div className="p-4 aerogel-card rounded-3xl space-y-3">
          <div className="flex items-center gap-1.5 font-extrabold text-white text-xs">
            <Music className="w-3.5 h-3.5 text-pink-400" />
            <span>Featured Soundtracks</span>
          </div>

          <div className="space-y-2">
            {POPULAR_TRACKS.slice(0, 3).map((track: any) => (
              <div key={track.id} className="flex items-center justify-between p-2 rounded-2xl bg-white/5 border border-white/5 text-[11px]">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={track.coverUrl} alt={track.title} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{track.title}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
                  </div>
                </div>
                <span className="text-[10px] text-pink-400 font-semibold px-2 py-0.5 rounded-full bg-pink-500/10">
                  {track.genre}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};