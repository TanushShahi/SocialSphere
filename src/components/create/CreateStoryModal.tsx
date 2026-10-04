import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Music, 
  Upload, 
  Sparkles, 
  Check, 
  Type, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Image as ImageIcon,
  Play,
  Pause,
  Layers,
  Star
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MusicPickerModal } from '../music/MusicPickerModal';
import { SongTrack } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import { generateStoryCollage } from '../../utils/collageGenerator';

const CURATED_STORY_PRESETS = [
  {
    name: 'Golden Hour',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Neon Tokyo',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Aesthetic Cafe',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Cosmic Night',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80'
  }
];

export const CreateStoryModal: React.FC = () => {
  const { 
    isCreateStoryOpen, 
    setIsCreateStoryOpen, 
    addNewStory, 
    currentUser,
    setActivePlayingPostId 
  } = useApp();

  // Media state
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Multi-photo choice modal
  const [showMultiPrompt, setShowMultiPrompt] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);

  // Story customizations
  const [caption, setCaption] = useState('');
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [textColor, setTextColor] = useState('#ffffff');
  const [hasTextBg, setHasTextBg] = useState(true);

  // Music state
  const [selectedSong, setSelectedSong] = useState<SongTrack | null>(null);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isPlayingSongPreview, setIsPlayingSongPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Publishing state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Immediately silence any feed songs as soon as this modal opens
  useEffect(() => {
    if (isCreateStoryOpen) {
      setActivePlayingPostId(null);
    }
  }, [isCreateStoryOpen, setActivePlayingPostId]);

  // Clean up audio preview when closing
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
    };
  }, []);

  if (!isCreateStoryOpen) return null;

  const handleClose = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    setSelectedImages([]);
    setPendingFiles([]);
    setShowMultiPrompt(false);
    setSelectedSong(null);
    setCaption('');
    setIsTextEditing(false);
    setIsPublishing(false);
    setPublishSuccess(false);
    setIsCreateStoryOpen(false);
  };

  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Silence audio instantly
    setActivePlayingPostId(null);
    if (!e.target.files || e.target.files.length === 0) return;

    setIsProcessing(true);
    const files = Array.from(e.target.files);
    const loadedUrls: string[] = [];

    for (const file of files) {
      const reader = new FileReader();
      const p = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const dataUrl = await p;
      try {
        const compressed = await compressImage(dataUrl, 1080, 1920, 0.85);
        loadedUrls.push(compressed);
      } catch {
        loadedUrls.push(dataUrl);
      }
    }

    setIsProcessing(false);

    if (loadedUrls.length > 1) {
      setPendingFiles(loadedUrls);
      setShowMultiPrompt(true);
    } else if (loadedUrls.length === 1) {
      setSelectedImages(loadedUrls);
      setCurrentSlideIdx(0);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChoosePreset = async (url: string) => {
    setActivePlayingPostId(null);
    setIsProcessing(true);
    try {
      const compressed = await compressImage(url, 1080, 1920, 0.85);
      setSelectedImages([compressed]);
      setCurrentSlideIdx(0);
    } catch {
      setSelectedImages([url]);
      setCurrentSlideIdx(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMultiChoice = async (mode: 'separate' | 'collage') => {
    if (mode === 'collage') {
      setIsProcessing(true);
      try {
        const collage = await generateStoryCollage(pendingFiles);
        setSelectedImages([collage]);
        setCurrentSlideIdx(0);
      } catch (err) {
        console.error('Collage creation failed:', err);
        setSelectedImages(pendingFiles);
        setCurrentSlideIdx(0);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setSelectedImages(pendingFiles);
      setCurrentSlideIdx(0);
    }
    setShowMultiPrompt(false);
  };

  const toggleMusicPreview = () => {
    if (!selectedSong?.audioUrl) return;

    if (isPlayingSongPreview) {
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
      setIsPlayingSongPreview(false);
    } else {
      if (!audioPreviewRef.current) {
        const a = new Audio(selectedSong.audioUrl);
        a.volume = 0.65;
        a.loop = true;
        a.onended = () => setIsPlayingSongPreview(false);
        audioPreviewRef.current = a;
      } else {
        audioPreviewRef.current.src = selectedSong.audioUrl;
      }
      audioPreviewRef.current.play().then(() => {
        setIsPlayingSongPreview(true);
      }).catch(() => {
        setIsPlayingSongPreview(false);
      });
    }
  };

  // Publish Story to stories collection ONLY (NEVER TO POSTS/FEED)
  const handlePublishStory = async () => {
    if (isPublishing || selectedImages.length === 0) return;
    setIsPublishing(true);

    try {
      // Calls addNewStory exclusively
      await addNewStory(
        selectedImages,
        caption.trim() || undefined,
        5,
        selectedSong?.title,
        selectedSong?.artist,
        selectedSong?.audioUrl
      );

      setPublishSuccess(true);
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      console.error('Publish story error:', err);
      setIsPublishing(false);
    }
  };

  const currentMediaUrl = selectedImages[currentSlideIdx] || selectedImages[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 select-none animate-fade-in bg-black/90 backdrop-blur-md">
      
      {/* Main 9:16 Instagram Story Studio Frame */}
      <div className="relative w-full h-full sm:h-[90vh] sm:max-w-[420px] bg-zinc-950 sm:rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] sm:border sm:border-white/10 flex flex-col justify-between">
        
        {/* Hidden File Picker */}
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelectFiles}
          className="hidden"
        />

        {selectedImages.length === 0 ? (
          /* ================= STEP 1: STORY PICKER / CAMERA SCREEN ================= */
          <div className="relative w-full h-full flex flex-col justify-between p-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between z-10">
              <button
                type="button"
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="font-semibold text-sm tracking-wide text-white">Add to story</span>
              <div className="w-10 h-10"></div>
            </div>

            {/* Central Upload Trigger Area */}
            <div className="my-auto flex flex-col items-center justify-center text-center space-y-4">
              <div 
                onClick={() => {
                  setActivePlayingPostId(null);
                  fileInputRef.current?.click();
                }}
                className="w-24 h-24 rounded-full bg-gradient-cosmic p-[2px] cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-[0_0_30px_rgba(236,72,153,0.35)] group"
              >
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-white group-hover:bg-zinc-800 transition-colors">
                  <Upload className="w-9 h-9 text-pink-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Select from your device</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-[260px]">
                  Choose photos or multiple images for your story reel or collage frame.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActivePlayingPostId(null);
                  fileInputRef.current?.click();
                }}
                className="py-2.5 px-6 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 active:scale-95 transition-all shadow-lg"
              >
                Choose Photos
              </button>
            </div>

            {/* Bottom Quick Presets */}
            <div className="space-y-2 z-10">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span>Or test with curated aesthetics:</span>
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {CURATED_STORY_PRESETS.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => handleChoosePreset(p.url)}
                    className="relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group border border-white/10 hover:border-pink-500/50 hover:scale-105 transition-all"
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                    <span className="absolute bottom-1.5 left-1 right-1 text-[9px] font-semibold text-white truncate text-center drop-shadow-md">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ================= STEP 2: STORY EDITOR CANVAS ================= */
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
            
            {/* Story Background Image */}
            <div className="absolute inset-0 w-full h-full bg-black">
              <img 
                src={currentMediaUrl} 
                alt="Story preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
            </div>

            {/* Top Toolbar */}
            <div className="relative z-20 p-4 flex items-center justify-between">
              {/* Discard button */}
              <button
                type="button"
                onClick={() => setSelectedImages([])}
                className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 active:scale-95 flex items-center justify-center text-white backdrop-blur-md transition-all"
                title="Discard"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Action Buttons (Music, Text, Change Photo) */}
              <div className="flex items-center gap-2">
                {/* Music Picker */}
                <button
                  type="button"
                  onClick={() => {
                    setActivePlayingPostId(null);
                    setIsMusicModalOpen(true);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 ${
                    selectedSong 
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/40' 
                      : 'bg-black/50 hover:bg-black/80 text-white'
                  }`}
                  title="Add soundtrack"
                >
                  <Music className="w-4 h-4" />
                </button>

                {/* Text Tool */}
                <button
                  type="button"
                  onClick={() => setIsTextEditing(true)}
                  className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 active:scale-95 flex items-center justify-center text-white backdrop-blur-md transition-all font-bold text-sm"
                  title="Add text"
                >
                  <Type className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Navigation Chevrons if multi-slide */}
            {selectedImages.length > 1 && (
              <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-3 pointer-events-none">
                <button
                  type="button"
                  onClick={() => setCurrentSlideIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentSlideIdx === 0}
                  className="pointer-events-auto w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-20 hover:scale-110 transition-all backdrop-blur-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlideIdx(prev => Math.min(selectedImages.length - 1, prev + 1))}
                  disabled={currentSlideIdx === selectedImages.length - 1}
                  className="pointer-events-auto w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-20 hover:scale-110 transition-all backdrop-blur-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Center Area: Instagram Interactive Overlays */}
            <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-6 space-y-4">
              {/* Instagram Frosted Music Sticker */}
              {selectedSong && (
                <div 
                  onClick={toggleMusicPreview}
                  className="px-4 py-2.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-white shadow-2xl flex items-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-sphere flex items-center justify-center text-white shadow-md">
                    {isPlayingSongPreview ? (
                      <Pause className="w-4 h-4 fill-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    )}
                  </div>
                  <div className="text-left min-w-0 pr-2">
                    <p className="text-xs font-bold truncate flex items-center gap-1.5">
                      {selectedSong.title}
                      <span className="flex items-center gap-0.5">
                        <span className="w-0.5 h-2 bg-pink-400 rounded-full animate-pulse"></span>
                        <span className="w-0.5 h-3 bg-purple-400 rounded-full animate-pulse delay-75"></span>
                      </span>
                    </p>
                    <p className="text-[10px] text-zinc-300 truncate">{selectedSong.artist}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (audioPreviewRef.current) audioPreviewRef.current.pause();
                      setSelectedSong(null);
                      setIsPlayingSongPreview(false);
                    }}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Text Sticker Overlay */}
              {caption && !isTextEditing && (
                <div 
                  onClick={() => setIsTextEditing(true)}
                  style={{ color: textColor }}
                  className={`max-w-[85%] text-center text-base sm:text-lg font-bold cursor-pointer transition-transform hover:scale-105 ${
                    hasTextBg ? 'bg-black/75 px-3 py-1.5 rounded-xl backdrop-blur-sm' : 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
                  }`}
                >
                  {caption}
                </div>
              )}

              {/* In-Canvas Text Editor */}
              {isTextEditing && (
                <div className="w-full flex flex-col items-center space-y-3 animate-scale-up">
                  <input
                    type="text"
                    autoFocus
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Type a story caption..."
                    style={{ color: textColor }}
                    className={`w-full text-center text-lg font-bold bg-transparent outline-none ${
                      hasTextBg ? 'bg-black/80 px-4 py-2 rounded-xl backdrop-blur-md' : 'drop-shadow-lg'
                    }`}
                  />
                  {/* Text Color / Bg Options */}
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <button
                      type="button"
                      onClick={() => setHasTextBg(!hasTextBg)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${hasTextBg ? 'bg-white text-black' : 'text-white border border-white/30'}`}
                    >
                      A
                    </button>
                    {['#ffffff', '#f43f5e', '#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTextColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full border-2 transition-transform ${textColor === c ? 'scale-125 border-white' : 'border-transparent'}`}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsTextEditing(false)}
                      className="ml-2 px-2.5 py-0.5 bg-pink-500 rounded-full text-[10px] text-white font-bold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Slide Count Indicator Dots if multi-photo */}
            {selectedImages.length > 1 && (
              <div className="relative z-20 flex justify-center gap-1.5 pb-2">
                {selectedImages.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-1 rounded-full transition-all ${
                      i === currentSlideIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Bottom Sharing Bar: Instagram "Your Story" & "Close Friends" */}
            <div className="relative z-20 p-4 pt-2 border-t border-white/10 bg-black/70 backdrop-blur-xl flex items-center justify-between gap-3">
              {/* Primary "Your Story" Button */}
              <button
                type="button"
                onClick={handlePublishStory}
                disabled={isPublishing}
                className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-full bg-white hover:bg-zinc-100 active:scale-95 text-black font-bold text-xs transition-all shadow-xl disabled:opacity-50"
              >
                {publishSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    <span>Added to your story!</span>
                  </>
                ) : isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    <span>Sharing to Story...</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-gradient-cosmic p-[1.5px] flex-shrink-0">
                      <img 
                        src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                        alt="Your avatar" 
                        className="w-full h-full rounded-full object-cover border border-white"
                      />
                    </div>
                    <span>Your Story</span>
                  </>
                )}
              </button>

              {/* Close Friends Button */}
              <button
                type="button"
                onClick={handlePublishStory}
                disabled={isPublishing}
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs active:scale-95 transition-all shadow-lg"
                title="Share with Close Friends"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                  <Star className="w-3 h-3 fill-black" />
                </div>
                <span className="hidden sm:inline">Close Friends</span>
              </button>
            </div>
          </div>
        )}

        {/* Multi-Photo Prompt Modal */}
        {showMultiPrompt && (
          <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-scale-up">
            <div className="w-full max-w-[320px] bg-zinc-900 border border-white/15 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-gradient-cosmic p-[1px] mx-auto flex items-center justify-center text-white">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">
                  {`${pendingFiles.length} Photos Selected`}
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  How would you like to share these photos to your story?
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleMultiChoice('separate')}
                  className="w-full py-3 px-4 rounded-2xl bg-white text-black font-bold text-xs hover:bg-zinc-200 active:scale-95 transition-all shadow-lg"
                >
                  Share as separate stories
                </button>

                <button
                  type="button"
                  onClick={() => handleMultiChoice('collage')}
                  className="w-full py-3 px-4 rounded-2xl bg-zinc-800 text-white font-bold text-xs hover:bg-zinc-700 active:scale-95 transition-all border border-white/10"
                >
                  Single 9:16 collage frame
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMultiPrompt(false);
                    setPendingFiles([]);
                  }}
                  className="w-full py-2 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Music Picker Modal */}
        <MusicPickerModal
          isOpen={isMusicModalOpen}
          onClose={() => setIsMusicModalOpen(false)}
          onSelectSong={(song: SongTrack) => {
            setSelectedSong(song);
            setIsMusicModalOpen(false);
            // Auto preview
            if (!audioPreviewRef.current) {
              const a = new Audio(song.audioUrl);
              a.volume = 0.65;
              a.loop = true;
              audioPreviewRef.current = a;
            } else {
              audioPreviewRef.current.src = song.audioUrl;
            }
            audioPreviewRef.current.play().then(() => setIsPlayingSongPreview(true)).catch(() => {});
          }}
          selectedSongId={selectedSong?.id}
        />

      </div>
    </div>
  );
};
