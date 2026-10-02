import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Send, Pause, Play, Music, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeleteConfirmModal } from '../post/DeleteConfirmModal';

export const StoryViewerModal: React.FC = () => {
  const { 
    activeStoryIndex, 
    stories, 
    closeStoryViewer, 
    openStoryViewer,
    sendMessage,
    conversations,
    currentUser,
    deleteStory
  } = useApp();

  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [heartReacted, setHeartReacted] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;
  const currentSlide = currentStory ? currentStory.slides[slideIndex] : null;

  // Audio playback for stories with songs
  useEffect(() => {
    if (!currentSlide?.songUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(currentSlide.songUrl);
    audio.volume = isMuted ? 0 : 0.6;
    audio.loop = true;
    audioRef.current = audio;

    if (!isPaused && !isDeleteModalOpen) {
      audio.play().catch(() => {});
    }

    return () => {
      audio.pause();
    };
  }, [currentSlide?.id, currentStory?.id]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPaused || isDeleteModalOpen) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  }, [isPaused, isDeleteModalOpen]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.6;
    }
  }, [isMuted]);

  // Reset slide index when active story changes
  useEffect(() => {
    setSlideIndex(0);
    setProgress(0);
  }, [activeStoryIndex]);

  // Progress timer logic
  useEffect(() => {
    if (!currentStory || !currentSlide || isPaused || isDeleteModalOpen) return;

    const interval = 50;
    const totalDuration = (currentSlide.duration || 5) * 1000;
    const step = (interval / totalDuration) * 100;

    timerRef.current = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNextSlide();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStoryIndex, slideIndex, isPaused, isDeleteModalOpen, currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDeleteModalOpen) return;
      if (e.key === 'Escape') closeStoryViewer();
      if (e.key === 'ArrowRight') handleNextSlide();
      if (e.key === 'ArrowLeft') handlePrevSlide();
      if (e.key === ' ') setIsPaused(p => !p);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStoryIndex, slideIndex, currentStory, isDeleteModalOpen]);

  if (activeStoryIndex === null || !currentStory || !currentSlide) return null;

  const handleNextSlide = () => {
    setProgress(0);
    if (slideIndex < currentStory.slides.length - 1) {
      setSlideIndex(prev => prev + 1);
    } else {
      if (activeStoryIndex < stories.length - 1) {
        openStoryViewer(activeStoryIndex + 1);
      } else {
        closeStoryViewer();
      }
    }
  };

  const handlePrevSlide = () => {
    setProgress(0);
    if (slideIndex > 0) {
      setSlideIndex(prev => prev - 1);
    } else {
      if (activeStoryIndex > 0) {
        openStoryViewer(activeStoryIndex - 1);
      }
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser) return;

    const conv = conversations.find(c => c.participant.id === currentStory.user.id);
    if (conv) {
      await sendMessage(conv.id, `Replied to story: "${replyText.trim()}"`);
    }
    setReplyText('');
    setIsPaused(false);
  };

  const handleDeleteSlide = async () => {
    if (!currentSlide) return;
    try {
      await deleteStory(currentSlide.id);
      if (currentStory.slides.length <= 1) {
        closeStoryViewer();
      } else {
        setSlideIndex(prev => Math.max(0, prev - 1));
        setProgress(0);
      }
    } catch (err) {
      console.error('Delete story slide error:', err);
    }
  };

  const isOwner = currentUser && currentStory.user.id === currentUser.id;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      {/* Close button */}
      <button 
        onClick={closeStoryViewer}
        className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full transition-all"
        aria-label="Close stories"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Story Container with Celestial Glass Frame */}
      <div className="relative w-full h-full sm:h-[86vh] sm:max-w-[420px] bg-zinc-950 sm:rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)] border border-white/10 flex flex-col justify-between">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10 pointer-events-none" />

        {/* Story Media (Image) */}
        <div 
          className="absolute inset-0 w-full h-full cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < rect.width * 0.35) {
              handlePrevSlide();
            } else {
              handleNextSlide();
            }
          }}
        >
          <img 
            src={currentSlide.url} 
            alt="Story content" 
            className="w-full h-full object-cover"
          />

          {/* Frosted Instagram Music Sticker */}
          {currentSlide.songTitle && (
            <div className="absolute bottom-20 left-4 right-4 z-20 flex justify-center pointer-events-none">
              <div className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-white shadow-2xl flex items-center gap-3 max-w-[90%]">
                <div className="w-8 h-8 rounded-xl bg-gradient-sphere flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-pink-500/30">
                  <Music className="w-4 h-4 animate-bounce" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    {currentSlide.songTitle}
                    <span className="flex items-center gap-0.5 ml-1">
                      <span className="w-0.5 h-2.5 bg-pink-400 rounded-full animate-pulse"></span>
                      <span className="w-0.5 h-3.5 bg-purple-400 rounded-full animate-pulse delay-75"></span>
                      <span className="w-0.5 h-2 bg-pink-400 rounded-full animate-pulse delay-150"></span>
                    </span>
                  </p>
                  <p className="text-[10px] text-zinc-300 truncate">
                    {currentSlide.songArtist || 'Original Audio'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Header Layer */}
        <div className="relative z-20 p-4 space-y-3">
          {/* Progress Bars */}
          <div className="flex items-center gap-1.5 w-full">
            {currentStory.slides.map((_, idx) => (
              <div 
                key={idx} 
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <div 
                  className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                  style={{
                    width: idx < slideIndex ? '100%' : idx === slideIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* User Info & Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-cosmic p-[1.5px] shadow-md shadow-pink-500/20">
                <img 
                  src={currentStory.user.avatar} 
                  alt={currentStory.user.username} 
                  className="w-full h-full rounded-full object-cover border border-black"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-white hover:underline cursor-pointer block drop-shadow-md">
                  {currentStory.user.username}
                </span>
                <span className="text-[10px] text-white/80 block drop-shadow-sm">
                  {currentSlide.createdAt}
                </span>
              </div>
            </div>

            {/* Action buttons (Sound toggle, Pause, Delete, Close) */}
            <div className="flex items-center gap-2">
              {currentSlide.songUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="p-1.5 text-white/90 hover:text-white bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(!isPaused);
                }}
                className="p-1.5 text-white/90 hover:text-white bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors"
                title={isPaused ? 'Play' : 'Pause'}
              >
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
              </button>

              {/* Delete Story Button for Creator */}
              {isOwner && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPaused(true);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-1.5 text-rose-300 hover:text-rose-100 bg-rose-500/20 hover:bg-rose-500/40 rounded-full backdrop-blur-md border border-rose-500/30 transition-colors"
                  title="Delete this story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Interactive Area */}
        <div className="relative z-20 p-4 space-y-2">
          {currentSlide.caption && (
            <div className="px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs inline-block max-w-full">
              {currentSlide.caption}
            </div>
          )}

          {/* Reply Form & Quick Reaction */}
          {!isOwner && (
            <div className="flex items-center gap-2 pt-1">
              <form 
                onSubmit={handleSendReply}
                className="flex-1 flex items-center bg-black/50 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2"
              >
                <input 
                  type="text"
                  value={replyText}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${currentStory.user.username}...`}
                  className="flex-1 bg-transparent text-xs text-white placeholder-white/60 focus:outline-none"
                />
                {replyText.trim() && (
                  <button type="submit" className="text-white hover:text-pink-400 pl-2">
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </form>

              <button
                onClick={() => setHeartReacted(!heartReacted)}
                className="p-2.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 text-white hover:scale-110 active:scale-95 transition-transform"
              >
                <Heart className={`w-5 h-5 ${heartReacted ? 'fill-rose-500 text-rose-500 animate-bounce' : 'text-white'}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Story?"
        description="Are you sure you want to delete this story slide? It will be permanently removed for all users."
        confirmLabel="Delete Story"
        onConfirm={handleDeleteSlide}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setIsPaused(false);
        }}
      />
    </div>
  );
};