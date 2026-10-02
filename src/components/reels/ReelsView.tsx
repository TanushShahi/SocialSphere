import React, { useState, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Music, 
  Play, 
  MoreVertical,
  Film,
  Sparkles,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DoubleTapHeart } from '../common/DoubleTapHeart';

export const ReelsView: React.FC = () => {
  const { reels, toggleLikeReel, toggleSaveReel, toggleFollowUser, currentUser, setIsCreatePostOpen } = useApp();
  const [isMuted, setIsMuted] = useState(true);
  const [playingMap, setPlayingMap] = useState<Record<string, boolean>>({
    [reels[0]?.id]: true
  });
  const [showHeartMap, setShowHeartMap] = useState<Record<string, boolean>>({});
  const lastTapRef = useRef<number>(0);

  const togglePlay = (id: string, videoEl: HTMLVideoElement | null) => {
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play();
      setPlayingMap(prev => ({ ...prev, [id]: true }));
    } else {
      videoEl.pause();
      setPlayingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleVideoTap = (id: string, videoEl: HTMLVideoElement | null) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      toggleLikeReel(id);
      setShowHeartMap(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setShowHeartMap(prev => ({ ...prev, [id]: false }));
      }, 900);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      togglePlay(id, videoEl);
    }
  };

  if (reels.length === 0) {
    return (
      <div className="max-w-md mx-auto min-h-[calc(100vh-120px)] flex items-center justify-center p-4">
        <div className="w-full aerogel-card rounded-3xl p-8 text-center space-y-4 shadow-2xl border border-white/10 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mx-auto text-pink-400 shadow-xl shadow-pink-500/10">
            <Film className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">No Reels in Orbit Yet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Be the first creator to share a cinematic transmission or video with soundtrack.
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
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-60px)] md:h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar select-none py-2 animate-fade-in">
      {reels.map((reel) => {
        const isPlaying = playingMap[reel.id] ?? false;
        const showHeart = showHeartMap[reel.id] ?? false;

        return (
          <div 
            key={reel.id} 
            className="relative h-[calc(100vh-80px)] md:h-[calc(100vh-40px)] w-full max-w-[420px] mx-auto snap-start bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl mb-4 border border-zinc-800 flex items-center justify-center group"
          >
            {/* Video Player */}
            <video
              src={reel.videoUrl}
              poster={reel.thumbnailUrl}
              loop
              muted={isMuted}
              playsInline
              autoPlay
              onClick={(e) => handleVideoTap(reel.id, e.currentTarget)}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Double Tap Heart */}
            <DoubleTapHeart show={showHeart} />

            {/* Play/Pause Overlay Indicator when paused */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30">
                <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
              </div>
            )}

            {/* Top Controls: Sound Toggle */}
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition-all hover:scale-105"
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Right Side Floating Actions Stack */}
            <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-5 text-white">
              {/* Like */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => toggleLikeReel(reel.id)}
                  className="p-2 rounded-full hover:bg-black/30 transition-transform active:scale-75"
                >
                  <Heart 
                    className={`w-7 h-7 drop-shadow-md ${
                      reel.isLiked 
                        ? 'text-rose-500 fill-rose-500 stroke-rose-500' 
                        : 'stroke-[2]'
                    }`} 
                  />
                </button>
                <span className="text-[11px] font-semibold drop-shadow-md">
                  {reel.likesCount >= 1000 ? `${(reel.likesCount / 1000).toFixed(1)}k` : reel.likesCount}
                </span>
              </div>

              {/* Comments */}
              <div className="flex flex-col items-center">
                <button className="p-2 rounded-full hover:bg-black/30 transition-transform active:scale-75">
                  <MessageCircle className="w-7 h-7 stroke-[2] drop-shadow-md" />
                </button>
                <span className="text-[11px] font-semibold drop-shadow-md">
                  {reel.commentsCount}
                </span>
              </div>

              {/* Share */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="p-2 rounded-full hover:bg-black/30 transition-transform active:scale-75"
                  title="Share"
                >
                  <Send className="w-6 h-6 stroke-[2] drop-shadow-md" />
                </button>
                <span className="text-[11px] font-semibold drop-shadow-md">
                  {reel.sharesCount >= 1000 ? `${(reel.sharesCount / 1000).toFixed(1)}k` : reel.sharesCount}
                </span>
              </div>

              {/* Save */}
              <button
                onClick={() => toggleSaveReel(reel.id)}
                className="p-2 rounded-full hover:bg-black/30 transition-transform active:scale-75"
              >
                <Bookmark 
                  className={`w-6 h-6 drop-shadow-md ${
                    reel.isSaved ? 'fill-white stroke-white' : 'stroke-[2]'
                  }`} 
                />
              </button>

              <button className="p-2 rounded-full hover:bg-black/30 text-white/90">
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Spinning Vinyl Record Music Icon */}
              <div className="w-9 h-9 rounded-full bg-zinc-900 border-2 border-white/60 p-[3px] flex items-center justify-center animate-spin [animation-duration:4s]">
                <img 
                  src={reel.user.avatar} 
                  alt="Audio avatar" 
                  className="w-full h-full rounded-full object-cover" 
                />
              </div>
            </div>

            {/* Bottom-Left Information Overlay */}
            <div className="absolute left-3 right-16 bottom-4 z-20 space-y-2 text-white text-xs drop-shadow-lg">
              {/* Creator Info */}
              <div className="flex items-center gap-2.5">
                <img 
                  src={reel.user.avatar} 
                  alt={reel.user.username} 
                  className="w-9 h-9 rounded-full object-cover border border-white/40"
                />
                <span className="font-semibold text-sm">{reel.user.username}</span>

                {currentUser && reel.user.id !== currentUser.id && (
                  <button
                    onClick={() => toggleFollowUser(reel.user.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      reel.user.isFollowing
                        ? 'border-white/40 bg-black/40 text-white'
                        : 'border-white bg-white text-black hover:bg-white/90'
                    }`}
                  >
                    {reel.user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>

              {/* Caption */}
              <p className="line-clamp-2 text-zinc-100 text-xs font-normal leading-snug">
                {reel.caption}
              </p>

              {/* Music Marquee */}
              <div className="flex items-center gap-2 text-white/90 bg-black/30 px-2.5 py-1 rounded-full w-fit backdrop-blur-md text-[11px]">
                <Music className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
                <span className="truncate max-w-[220px]">{reel.audioTitle}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
