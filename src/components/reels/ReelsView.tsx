import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Music, 
  Play, 
  Pause,
  MoreVertical,
  Film,
  Sparkles,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DoubleTapHeart } from '../common/DoubleTapHeart';
import { TRENDING_INSTAGRAM_REELS } from './trendingReels';
import { CURATED_SONGS } from '../music/curatedTracks';
import { Reel } from '../../types';

// Helper to ensure every reel has a music audio stream
const getReelAudioUrl = (reel: Reel): string => {
  if (reel.audioUrl) return reel.audioUrl;
  const match = CURATED_SONGS.find(s => 
    reel.audioTitle.toLowerCase().includes(s.title.toLowerCase()) ||
    s.title.toLowerCase().includes(reel.audioTitle.toLowerCase()) ||
    reel.audioTitle.toLowerCase().includes(s.artist.toLowerCase())
  );
  return match?.audioUrl || CURATED_SONGS[0]?.audioUrl || '';
};

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenShare: (reel: Reel) => void;
  onDoubleTapLike: (reelId: string) => void;
}

const SingleReelCard: React.FC<ReelCardProps> = ({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  onOpenShare,
  onDoubleTapLike
}) => {
  const { toggleLikeReel, toggleSaveReel, toggleFollowUser, currentUser } = useApp();
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTapRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeart, setShowHeart] = useState(false);
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState<'play' | 'pause' | null>(null);
  const [soundBanner, setSoundBanner] = useState<string | null>(null);
  const [needsGestureForAudio, setNeedsGestureForAudio] = useState(false);

  const audioUrl = useMemo(() => getReelAudioUrl(reel), [reel]);

  // Handle active / inactive playback
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video) return;

    if (isActive && isPlaying) {
      // Start video
      video.play().catch(() => {});

      // Start audio
      if (audio) {
        audio.muted = isMuted;
        audio.currentTime = video.currentTime || 0;
        audio.play().then(() => {
          setNeedsGestureForAudio(false);
        }).catch(() => {
          // If browser policy blocks autoplay with sound before user click
          setNeedsGestureForAudio(true);
        });
      }
    } else {
      video.pause();
      if (audio) {
        audio.pause();
      }
    }
  }, [isActive, isPlaying, isMuted]);

  // Update mute state on video and audio elements
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      if (!isMuted && isActive && isPlaying) {
        audioRef.current.play().catch(() => setNeedsGestureForAudio(true));
      }
    }
  }, [isMuted, isActive, isPlaying]);

  // Single tap: play/pause, Double tap: heart like
  const handleContainerClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap -> Like
      onDoubleTapLike(reel.id);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 900);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= 280 && lastTapRef.current !== 0) {
          // Single tap -> Play / Pause
          if (needsGestureForAudio) {
            // First tap unblocks audio if browser was waiting for gesture
            if (audioRef.current) {
              audioRef.current.muted = isMuted;
              audioRef.current.play().catch(() => {});
            }
            setNeedsGestureForAudio(false);
            return;
          }

          setIsPlaying(prev => {
            const next = !prev;
            setShowPlayPauseIcon(next ? 'play' : 'pause');
            setTimeout(() => setShowPlayPauseIcon(null), 700);
            return next;
          });
        }
      }, 300);
    }
  };

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMute();
    setNeedsGestureForAudio(false);
    const msg = isMuted ? 'Sound On 🔊' : 'Sound Off 🔇';
    setSoundBanner(msg);
    setTimeout(() => setSoundBanner(null), 1200);
  };

  const isOwner = currentUser && reel.user.id === currentUser.id;
  const isInstagramReel = reel.id.startsWith('reel_ig') || reel.user.id.startsWith('ig_creator');

  return (
    <div className="relative h-[calc(100vh-70px)] md:h-[calc(100vh-24px)] w-full max-w-[420px] mx-auto snap-start bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-zinc-800/80 flex items-center justify-center group select-none">
      {/* Background Audio Player for this Reel */}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          loop 
          preload="auto" 
          muted={isMuted} 
        />
      )}

      {/* Video Player */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl}
        loop
        playsInline
        muted={isMuted}
        onClick={handleContainerClick}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Double Tap Heart */}
      <DoubleTapHeart show={showHeart} />

      {/* Single Tap Play/Pause Indicator Animation */}
      {showPlayPauseIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="w-18 h-18 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white animate-scaleUp">
            {showPlayPauseIcon === 'play' ? (
              <Play className="w-9 h-9 fill-white ml-1" />
            ) : (
              <Pause className="w-9 h-9 fill-white" />
            )}
          </div>
        </div>
      )}

      {/* Sound On / Sound Off Center Notification */}
      {soundBanner && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-4 py-2 bg-black/75 backdrop-blur-md text-white font-bold text-xs rounded-full border border-white/20 animate-fade-in pointer-events-none">
          {soundBanner}
        </div>
      )}

      {/* Floating "Tap for Sound" pill if browser blocked initial autoplay with audio */}
      {needsGestureForAudio && isActive && (
        <button
          onClick={handleToggleSound}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs rounded-full shadow-2xl flex items-center gap-1.5 animate-bounce"
        >
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span>Tap to Unmute Music</span>
        </button>
      )}

      {/* Top Right Sound Toggle */}
      <button
        onClick={handleToggleSound}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition-all hover:scale-105 active:scale-95 border border-white/10"
        aria-label="Toggle Sound"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-zinc-300" /> : <Volume2 className="w-5 h-5 text-pink-400" />}
      </button>

      {/* Right Floating Actions Column */}
      <div className="absolute right-3 bottom-14 z-20 flex flex-col items-center gap-5 text-white">
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
          <span className="text-[11px] font-semibold drop-shadow-md -mt-1">
            {reel.likesCount >= 1000 ? `${(reel.likesCount / 1000).toFixed(1)}k` : reel.likesCount}
          </span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center">
          <button className="p-2 rounded-full hover:bg-black/30 transition-transform active:scale-75">
            <MessageCircle className="w-7 h-7 stroke-[2] drop-shadow-md" />
          </button>
          <span className="text-[11px] font-semibold drop-shadow-md -mt-1">
            {reel.commentsCount}
          </span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center">
          <button 
            onClick={() => onOpenShare(reel)}
            className="p-2 rounded-full hover:bg-black/30 transition-transform active:scale-75"
            title="Share Reel"
          >
            <Send className="w-6 h-6 stroke-[2] drop-shadow-md" />
          </button>
          <span className="text-[11px] font-semibold drop-shadow-md -mt-1">
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

        {/* Spinning Vinyl Record with Album Cover */}
        <div 
          onClick={handleToggleSound}
          className={`w-10 h-10 rounded-full bg-zinc-950 border-2 border-white/60 p-[3px] flex items-center justify-center cursor-pointer transition-transform ${
            isActive && isPlaying && !isMuted ? 'animate-spin [animation-duration:3.5s] shadow-[0_0_15px_rgba(236,72,153,0.5)]' : ''
          }`}
          title={isMuted ? 'Click to play sound' : 'Sound active'}
        >
          <img 
            src={reel.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'} 
            alt="Audio avatar" 
            className="w-full h-full rounded-full object-cover" 
          />
        </div>
      </div>

      {/* Bottom Information Overlay */}
      <div className="absolute left-3 right-16 bottom-4 z-20 space-y-2 text-white text-xs drop-shadow-lg pointer-events-auto">
        {/* Creator Info */}
        <div className="flex items-center gap-2">
          <img 
            src={reel.user.avatar} 
            alt={reel.user.username} 
            className="w-9 h-9 rounded-full object-cover border border-white/40"
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-sm tracking-tight">@{reel.user.username}</span>
            {reel.id.startsWith('reel_ig') && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/90 via-pink-500/90 to-purple-600/90 text-white flex items-center gap-1 shadow-sm">
                <span>📸</span> Instagram Reel
              </span>
            )}
          </div>

          {!isOwner && !isInstagramReel && (
            <button
              onClick={() => toggleFollowUser(reel.user.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ml-1 ${
                reel.user.isFollowing
                  ? 'border-white/30 bg-black/40 text-white'
                  : 'border-white bg-white text-black hover:bg-white/90 shadow-md'
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

        {/* Music Marquee Tag */}
        <div 
          onClick={handleToggleSound}
          className="flex items-center gap-2 text-white/95 bg-black/40 px-2.5 py-1 rounded-full w-fit backdrop-blur-md text-[11px] cursor-pointer hover:bg-black/60 transition-colors border border-white/10"
        >
          <Music className={`w-3.5 h-3.5 flex-shrink-0 text-pink-400 ${isActive && isPlaying && !isMuted ? 'animate-bounce' : ''}`} />
          <span className="truncate max-w-[220px] font-medium">{reel.audioTitle}</span>
        </div>
      </div>
    </div>
  );
};

export const ReelsView: React.FC = () => {
  const { 
    reels, 
    toggleLikeReel, 
    setIsCreatePostOpen,
    openShareModal
  } = useApp();

  const combinedReels = useMemo(() => {
    const existingIds = new Set(reels.map(r => r.id));
    const trendingFiltered = TRENDING_INSTAGRAM_REELS.filter(tr => !existingIds.has(tr.id));
    return [...reels, ...trendingFiltered];
  }, [reels]);

  // Audio state: default unmuted so music plays immediately!
  const [isMuted, setIsMuted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // IntersectionObserver to auto-play only the visible reel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.65
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [combinedReels]);

  // Keyboard navigation: Arrow Up / Arrow Down / Space / M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(activeIndex + 1, combinedReels.length - 1);
        itemRefs.current[next]?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(activeIndex - 1, 0);
        itemRefs.current[prev]?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key.toLowerCase() === 'm') {
        setIsMuted(m => !m);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, combinedReels.length]);

  const handleShareReel = (reel: Reel) => {
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
  };

  const handleDoubleTapLike = (reelId: string) => {
    toggleLikeReel(reelId);
  };

  if (combinedReels.length === 0) {
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
    <div 
      ref={containerRef}
      className="max-w-md mx-auto h-[calc(100vh-60px)] md:h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar select-none py-2 animate-fade-in"
    >
      {combinedReels.map((reel, idx) => (
        <div 
          key={reel.id}
          data-index={idx}
          ref={(el) => {
            itemRefs.current[idx] = el;
          }}
          className="snap-start mb-4 flex items-center justify-center"
        >
          <SingleReelCard
            reel={reel}
            isActive={idx === activeIndex}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(prev => !prev)}
            onOpenShare={handleShareReel}
            onDoubleTapLike={handleDoubleTapLike}
          />
        </div>
      ))}
    </div>
  );
};
