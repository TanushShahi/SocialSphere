import React, { useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, Music, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StoriesBar: React.FC = () => {
  const { stories, currentUser, openStoryViewer, setIsCreatePostOpen } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!currentUser) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const currentUserStory = stories.find(s => s.user.id === currentUser.id);
  const otherStories = stories.filter(s => s.user.id !== currentUser.id);

  return (
    <div className="relative py-4 select-none group/bar">
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-zinc-950/80 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10 text-white items-center justify-center opacity-0 group-hover/bar:opacity-100 hover:scale-110 hover:border-pink-500/40 transition-all"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Stories Scroll Track */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar px-1 sm:px-2 py-1 scroll-smooth"
      >
        {/* Current User Orbit Orb */}
        <div className="flex flex-col items-center gap-1.5 sm:gap-2 flex-shrink-0 cursor-pointer group">
          <div className="relative">
            {/* Outer Ring */}
            <div 
              onClick={() => {
                if (currentUserStory && currentUserStory.slides.length > 0) {
                  const idx = stories.findIndex(s => s.user.id === currentUser.id);
                  openStoryViewer(idx);
                } else {
                  setIsCreatePostOpen(true);
                }
              }}
              className={`relative w-14 h-14 sm:w-[68px] sm:h-[68px] rounded-full p-[2px] sm:p-[2.5px] transition-all duration-300 group-hover:scale-105 ${
                currentUserStory && currentUserStory.slides.length > 0
                  ? 'bg-gradient-cosmic shadow-[0_0_20px_rgba(236,72,153,0.35)]'
                  : 'border border-dashed border-white/20 group-hover:border-pink-500/50'
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2px]">
                <img 
                  src={currentUser.avatar} 
                  alt="Your Sphere" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            
            {/* Holographic Plus Badge */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCreatePostOpen(true);
              }}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-sphere rounded-full flex items-center justify-center text-white border-2 border-black shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform"
              title="Add to story"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            </button>
          </div>
          <span className="text-[10px] sm:text-[11px] text-zinc-300 group-hover:text-white truncate w-16 sm:w-18 text-center font-medium transition-colors">
            Your Orbit
          </span>
        </div>

        {/* Other Users Celestial Orbs */}
        {otherStories.map((story) => {
          const globalIdx = stories.findIndex(s => s.id === story.id);
          const hasSong = story.slides.some(s => s.songTitle && s.songTitle.trim().length > 0);

          return (
            <div 
              key={story.id}
              onClick={() => openStoryViewer(globalIdx)}
              className="flex flex-col items-center gap-1.5 sm:gap-2 flex-shrink-0 cursor-pointer group"
            >
              <div className="relative">
                {/* Radiating sound ring if story has music */}
                {hasSong && story.hasUnseen && (
                  <div className="absolute inset-0 rounded-full border border-pink-500/40 animate-sound-wave-ring pointer-events-none"></div>
                )}

                {/* Celestial Orbit Ring */}
                <div 
                  className={`relative w-14 h-14 sm:w-[68px] sm:h-[68px] rounded-full p-[2px] sm:p-[2.5px] transition-all duration-300 group-hover:scale-105 ${
                    story.hasUnseen 
                      ? 'bg-gradient-cosmic shadow-[0_0_22px_rgba(236,72,153,0.35)]' 
                      : 'p-[1.5px] border border-white/10 group-hover:border-white/30'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2px]">
                    <img 
                      src={story.user.avatar} 
                      alt={story.user.username} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* Floating Sound Note Badge */}
                {hasSong && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-zinc-950 border border-pink-500/50 flex items-center justify-center text-pink-400 shadow-md">
                    <Music className="w-2 h-2 sm:w-2.5 sm:h-2.5 animate-pulse" />
                  </div>
                )}
              </div>

              <span className="text-[10px] sm:text-[11px] text-zinc-400 group-hover:text-zinc-200 truncate w-16 sm:w-18 text-center font-medium transition-colors">
                {story.user.username}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-zinc-950/80 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10 text-white items-center justify-center opacity-0 group-hover/bar:opacity-100 hover:scale-110 hover:border-pink-500/40 transition-all"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};