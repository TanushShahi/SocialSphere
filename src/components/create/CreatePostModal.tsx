import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Check, 
  Sliders,
  Music,
  Layers,
  LayoutGrid,
  Plus,
  Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FILTER_OPTIONS, SAMPLE_POST_IMAGES } from '../../constants/media';
import { FilterType, SongTrack } from '../../types';
import { MusicPickerModal } from '../music/MusicPickerModal';
import { StoryMultiPhotoPromptModal } from './StoryMultiPhotoPromptModal';
import { generateStoryCollage } from '../../utils/collageGenerator';

export const CreatePostModal: React.FC = () => {
  const { isCreatePostOpen, setIsCreatePostOpen, addNewPost, addNewStory, currentUser } = useApp();

  const [step, setStep] = useState<'select' | 'filter' | 'caption'>('select');
  const [selectedImages, setSelectedImages] = useState<string[]>([SAMPLE_POST_IMAGES[0]]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('normal');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [shareAsStory, setShareAsStory] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SongTrack | null>(null);
  const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Multi-photo story choice state
  const [storyMode, setStoryMode] = useState<'separate' | 'collage'>('separate');
  const [isStoryPromptOpen, setIsStoryPromptOpen] = useState(false);
  const [isGeneratingCollage, setIsGeneratingCollage] = useState(false);

  if (!isCreatePostOpen || !currentUser) return null;

  const handleClose = () => {
    setIsCreatePostOpen(false);
    setStep('select');
    setSelectedImages([SAMPLE_POST_IMAGES[0]]);
    setPreviewIndex(0);
    setSelectedFilter('normal');
    setCaption('');
    setLocation('');
    setSelectedSong(null);
    setIsSuccess(false);
    setShareAsStory(false);
    setStoryMode('separate');
    setIsGeneratingCollage(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const readPromises = fileList.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(urls => {
      if (urls.length > 0) {
        setSelectedImages(urls);
        setPreviewIndex(0);
        setStep('filter');
        if (shareAsStory && urls.length > 1) {
          setIsStoryPromptOpen(true);
        }
      }
    });
  };

  const handleToggleSampleImage = (imgUrl: string) => {
    if (selectedImages.includes(imgUrl)) {
      if (selectedImages.length > 1) {
        const next = selectedImages.filter(u => u !== imgUrl);
        setSelectedImages(next);
        setPreviewIndex(0);
      }
    } else {
      setSelectedImages(prev => [...prev, imgUrl]);
    }
  };

  const executeShare = async (modeToUse: 'separate' | 'collage') => {
    if (selectedImages.length === 0) return;

    const filterClass = FILTER_OPTIONS.find(f => f.id === selectedFilter)?.className || 'filter-normal';
    
    if (shareAsStory) {
      if (selectedImages.length > 1 && modeToUse === 'collage') {
        setIsGeneratingCollage(true);
        try {
          const collageUrl = await generateStoryCollage(selectedImages);
          await addNewStory(
            collageUrl,
            caption,
            5,
            selectedSong?.title,
            selectedSong?.artist,
            selectedSong?.audioUrl
          );
        } finally {
          setIsGeneratingCollage(false);
        }
      } else {
        // Upload each photo as individual sequential story slides
        await addNewStory(
          selectedImages,
          caption,
          5,
          selectedSong?.title,
          selectedSong?.artist,
          selectedSong?.audioUrl
        );
      }
    } else {
      // Feed post with multi-photo sliding carousel support
      await addNewPost(
        selectedImages,
        caption,
        filterClass,
        location,
        selectedSong?.title,
        selectedSong?.artist,
        selectedSong?.audioUrl
      );
    }

    setIsSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  const handleShareClick = () => {
    if (shareAsStory && selectedImages.length > 1) {
      setIsStoryPromptOpen(true);
    } else {
      executeShare(storyMode);
    }
  };

  const activeImage = selectedImages[previewIndex] || selectedImages[0];

  return (
    <div 
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none animate-fade-in"
    >
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white rounded-full bg-zinc-900/60"
        aria-label="Close modal"
      >
        <X className="w-6 h-6" />
      </button>

      <div 
        onClick={(e) => e.stopPropagation()}
        className="aerogel-card border border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.85)] flex flex-col max-h-[90vh] backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between text-sm">
          {step !== 'select' ? (
            <button 
              onClick={() => setStep(step === 'caption' ? 'filter' : 'select')}
              className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div className="w-12"></div>
          )}

          <h2 className="font-bold text-white tracking-tight">
            {step === 'select' && 'Select Photos & Videos'}
            {step === 'filter' && `Choose Filter & Style (${selectedImages.length} photo${selectedImages.length > 1 ? 's' : ''})`}
            {step === 'caption' && (shareAsStory ? 'Share to Story' : 'Write Caption & Details')}
          </h2>

          {step === 'select' && (
            <button
              onClick={() => setStep('filter')}
              className="text-pink-400 hover:text-pink-300 font-semibold px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-all text-xs"
            >
              Next
            </button>
          )}

          {step === 'filter' && (
            <button
              onClick={() => setStep('caption')}
              className="text-pink-400 hover:text-pink-300 font-semibold px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-all text-xs"
            >
              Next
            </button>
          )}

          {step === 'caption' && (
            <button
              onClick={handleShareClick}
              disabled={isGeneratingCollage}
              className="bg-gradient-cosmic hover:opacity-95 text-white font-bold px-4 py-1.5 rounded-full shadow-lg shadow-pink-500/25 transition-all text-xs active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            >
              {isGeneratingCollage ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Share'
              )}
            </button>
          )}
        </div>

        {/* Success Splash */}
        {isSuccess ? (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gradient-cosmic flex items-center justify-center text-white shadow-xl shadow-pink-500/30 animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-bold text-white">Shared successfully!</h3>
            <p className="text-zinc-400 text-sm">
              {shareAsStory 
                ? (storyMode === 'collage' ? 'Your grid collage story is live.' : `${selectedImages.length} story slides are now live.`)
                : `Your ${selectedImages.length > 1 ? `multi-photo (${selectedImages.length})` : ''} post is now orbiting Social Sphere.`}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Step 1: Select Media / Upload */}
            {step === 'select' && (
              <div className="p-8 flex-1 flex flex-col items-center justify-center space-y-5">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-pink-400 shadow-xl relative">
                  <ImageIcon className="w-10 h-10" />
                  {selectedImages.length > 1 && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-pink-500 text-white text-[11px] font-bold shadow-lg">
                      {selectedImages.length}
                    </span>
                  )}
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-white">Select photos and videos</h3>
                  <p className="text-xs text-zinc-400">
                    Select multiple photos from your device (hold Ctrl/Cmd or Shift to multi-select)
                  </p>
                </div>

                <label className="cursor-pointer bg-gradient-cosmic hover:opacity-95 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2 active:scale-95">
                  <Upload className="w-4 h-4" />
                  Select from Computer / Phone
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>

                {/* Preset sample photos gallery */}
                <div className="w-full pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-zinc-400">Or pick aesthetic samples (click to combine):</p>
                    <span className="text-[11px] text-pink-400 font-semibold">{selectedImages.length} selected</span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {SAMPLE_POST_IMAGES.map((imgUrl, i) => {
                      const isSelected = selectedImages.includes(imgUrl);
                      const idxInSelection = selectedImages.indexOf(imgUrl);
                      return (
                        <div
                          key={i}
                          onClick={() => handleToggleSampleImage(imgUrl)}
                          className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 relative ${
                            isSelected 
                              ? 'border-pink-500 shadow-lg shadow-pink-500/30' 
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={imgUrl} alt={`Sample ${i}`} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                              {idxInSelection + 1}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Filters & Adjustments */}
            {step === 'filter' && (
              <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
                {/* Image preview with active filter & multi-photo carousel switcher */}
                <div className="flex-1 bg-black flex flex-col items-center justify-center p-4 min-h-[300px] relative">
                  <div className="w-full max-w-[380px] aspect-square rounded-xl overflow-hidden shadow-2xl border border-zinc-800 relative group/preview">
                    <img 
                      src={activeImage} 
                      alt="Filter preview" 
                      className={`w-full h-full object-cover ${
                        FILTER_OPTIONS.find(f => f.id === selectedFilter)?.className || ''
                      }`}
                    />

                    {/* Instagram badge */}
                    {selectedImages.length > 1 && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium shadow-md">
                        {previewIndex + 1}/{selectedImages.length}
                      </div>
                    )}

                    {/* Prev/Next arrows in preview */}
                    {selectedImages.length > 1 && (
                      <>
                        {previewIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => setPreviewIndex(p => p - 1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-md transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        )}
                        {previewIndex < selectedImages.length - 1 && (
                          <button
                            type="button"
                            onClick={() => setPreviewIndex(p => p + 1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-md transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Multi-photo thumbnail strip */}
                  {selectedImages.length > 1 && (
                    <div className="flex items-center gap-2 mt-3 max-w-[380px] overflow-x-auto py-1 px-1">
                      {selectedImages.map((url, idx) => (
                        <div
                          key={idx}
                          onClick={() => setPreviewIndex(idx)}
                          className={`w-10 h-10 rounded-lg overflow-hidden cursor-pointer border-2 transition-all flex-shrink-0 ${
                            previewIndex === idx ? 'border-pink-500 scale-105' : 'border-zinc-700 opacity-60'
                          }`}
                        >
                          <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filters sidebar */}
                <div className="w-full md:w-64 bg-zinc-950 p-4 border-t md:border-t-0 md:border-l border-zinc-800 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-zinc-400">
                    <Sliders className="w-4 h-4" />
                    <span>FILTERS</span>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-2 gap-3">
                    {FILTER_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFilter(f.id)}
                        className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl border transition-all ${
                          selectedFilter === f.id 
                            ? 'border-pink-500 bg-pink-500/10' 
                            : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-700">
                          <img 
                            src={activeImage} 
                            alt={f.label} 
                            className={`w-full h-full object-cover ${f.className}`}
                          />
                        </div>
                        <span className={`text-[11px] font-medium ${selectedFilter === f.id ? 'text-pink-400' : 'text-zinc-400'}`}>
                          {f.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Write Caption, Location & Story Options */}
            {step === 'caption' && (
              <div className="flex-1 flex flex-col md:flex-row overflow-y-auto">
                {/* Thumbnail Preview */}
                <div className="w-full md:w-56 bg-black flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-zinc-800">
                  <div className="w-36 h-36 rounded-xl overflow-hidden border border-zinc-700 shadow-lg relative">
                    <img 
                      src={activeImage} 
                      alt="Thumbnail" 
                      className={`w-full h-full object-cover ${
                        FILTER_OPTIONS.find(f => f.id === selectedFilter)?.className || ''
                      }`}
                    />
                    {selectedImages.length > 1 && (
                      <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold">
                        1/{selectedImages.length}
                      </span>
                    )}
                  </div>
                  {selectedImages.length > 1 && (
                    <span className="text-[11px] text-pink-400 mt-2 font-medium">
                      {selectedImages.length} photos selected
                    </span>
                  )}
                </div>

                {/* Caption inputs */}
                <div className="flex-1 p-5 space-y-4">
                  {/* Current User Info */}
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.username} 
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-white">{currentUser.username}</span>
                  </div>

                  {/* Caption textarea */}
                  <div>
                    <textarea
                      rows={3}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Write a caption... (e.g. Sunday vibes ✨ #photography #mood)"
                      className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none resize-none"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center text-[10px] text-zinc-500">
                      <span>Tip: use #hashtags to increase discovery</span>
                      <span>{caption.length}/500</span>
                    </div>
                  </div>

                  {/* Location Input */}
                  <div className="flex items-center gap-2 pt-3 border-t border-zinc-800 text-xs">
                    <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Add location (e.g. San Francisco, CA)"
                      className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  {/* Music Selection Row */}
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-pink-400" />
                      <div>
                        <p className="font-semibold text-white">Music</p>
                        {selectedSong ? (
                          <p className="text-[11px] text-pink-400 font-medium truncate max-w-[200px]">
                            🎵 {selectedSong.title} • {selectedSong.artist}
                          </p>
                        ) : (
                          <p className="text-[10px] text-zinc-400">Add a song to this post or story</p>
                        )}
                      </div>
                    </div>

                    {selectedSong ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsMusicPickerOpen(true)}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-[11px] rounded-lg text-zinc-200 transition-colors"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSong(null)}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded-full"
                          title="Remove music"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsMusicPickerOpen(true)}
                        className="px-3 py-1 bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 text-[11px] font-semibold rounded-lg transition-colors border border-pink-500/30"
                      >
                        Add Music
                      </button>
                    )}
                  </div>

                  {/* Story vs Feed Selector */}
                  <div className="pt-3 border-t border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-white">Share to 24h Story</p>
                        <p className="text-[10px] text-zinc-400">Add to your temporary daily story reel</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={shareAsStory} 
                          onChange={(e) => {
                            const val = e.target.checked;
                            setShareAsStory(val);
                            if (val && selectedImages.length > 1) {
                              setIsStoryPromptOpen(true);
                            }
                          }} 
                          className="sr-only peer" 
                        />
                        <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                      </label>
                    </div>

                    {/* If Story & Multiple Photos: Show Mode selector preview */}
                    {shareAsStory && selectedImages.length > 1 && (
                      <div className="mt-2 p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {storyMode === 'separate' ? (
                            <Layers className="w-4 h-4 text-pink-400" />
                          ) : (
                            <LayoutGrid className="w-4 h-4 text-pink-400" />
                          )}
                          <div>
                            <p className="font-semibold text-white text-[11px]">
                              {storyMode === 'separate' ? 'Separate Stories' : 'Single Frame Grid'}
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              {storyMode === 'separate' ? `${selectedImages.length} individual slides` : '1 collage slide'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsStoryPromptOpen(true)}
                          className="text-pink-400 hover:text-pink-300 font-semibold text-[11px] px-2 py-1 rounded-lg bg-pink-500/20 transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Music Picker Modal */}
      <MusicPickerModal
        isOpen={isMusicPickerOpen}
        onClose={() => setIsMusicPickerOpen(false)}
        onSelectSong={(song) => setSelectedSong(song)}
        currentSelectedId={selectedSong?.id}
      />

      {/* Instagram-Style Multi-Photo Story Choice Modal */}
      <StoryMultiPhotoPromptModal
        isOpen={isStoryPromptOpen}
        photoCount={selectedImages.length}
        selectedMode={storyMode}
        onSelectMode={(mode) => setStoryMode(mode)}
        onConfirm={() => {
          setIsStoryPromptOpen(false);
          if (step === 'caption') {
            executeShare(storyMode);
          }
        }}
        onClose={() => setIsStoryPromptOpen(false)}
      />
    </div>
  );
};
