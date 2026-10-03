import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  MapPin, 
  Check, 
  Music,
  Plus,
  Loader2,
  Video,
  Radio,
  MessageSquare,
  Users,
  Smile,
  Globe,
  Lock,
  Sparkles,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FILTER_OPTIONS, SAMPLE_POST_IMAGES } from '../../constants/media';
import { FilterType, SongTrack } from '../../types';
import { MusicPickerModal } from '../music/MusicPickerModal';
import { StoryMultiPhotoPromptModal } from './StoryMultiPhotoPromptModal';
import { generateStoryCollage } from '../../utils/collageGenerator';
import { compressImage } from '../../utils/imageCompressor';

export const CreatePostModal: React.FC = () => {
  const { isCreatePostOpen, setIsCreatePostOpen, addNewPost, addNewStory, currentUser } = useApp();

  const displayName = currentUser?.name || currentUser?.username || 'Creator';
  const firstName = displayName.split(' ')[0] || 'there';

  const [mediaType, setMediaType] = useState<'photo' | 'video' | 'thought' | 'live'>('photo');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('normal');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [audience, setAudience] = useState<'public' | 'sphere' | 'close'>('public');
  const [feeling, setFeeling] = useState<string | null>(null);
  const [taggedPeople, setTaggedPeople] = useState<string[]>([]);
  const [shareAsStory, setShareAsStory] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SongTrack | null>(null);
  const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Sub-modals for options
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Multi-photo story choice state
  const [storyMode, setStoryMode] = useState<'separate' | 'collage'>('separate');
  const [isStoryPromptOpen, setIsStoryPromptOpen] = useState(false);
  const [isGeneratingCollage, setIsGeneratingCollage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isCreatePostOpen || !currentUser) return null;

  const handleClose = () => {
    setIsCreatePostOpen(false);
    setSelectedImages([]);
    setSelectedFilter('normal');
    setCaption('');
    setLocation('');
    setAudience('public');
    setFeeling(null);
    setTaggedPeople([]);
    setSelectedSong(null);
    setIsSuccess(false);
    setIsPosting(false);
    setShareAsStory(false);
    setStoryMode('separate');
    setIsGeneratingCollage(false);
    setShowLocationInput(false);
    setShowFeelingPicker(false);
    setShowTagPicker(false);
  };

  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
    try {
      const fileList = Array.from(files);
      const compressedList = await Promise.all(
        fileList.map((file: File) => compressImage(file, 1080, 1080, 0.75))
      );
      const validUrls = compressedList.filter((u: string) => Boolean(u && u.length > 20));
      if (validUrls.length > 0) {
        setSelectedImages(prev => [...prev, ...validUrls]);
        if (shareAsStory && (selectedImages.length + validUrls.length) > 1) {
          setIsStoryPromptOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to process photos:', err);
    } finally {
      setIsProcessingPhotos(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleToggleSampleImage = (imgUrl: string) => {
    if (selectedImages.includes(imgUrl)) {
      setSelectedImages(prev => prev.filter(u => u !== imgUrl));
    } else {
      setSelectedImages(prev => [...prev, imgUrl]);
    }
  };

  const executePost = async (modeToUse: 'separate' | 'collage') => {
    if (isPosting) return;
    setIsPosting(true);

    try {
      const filterClass = FILTER_OPTIONS.find(f => f.id === selectedFilter)?.className || 'filter-normal';
      let finalCaption = caption.trim();
      if (feeling) finalCaption += ` — feeling ${feeling}`;
      if (taggedPeople.length > 0) finalCaption += ` (with ${taggedPeople.join(', ')})`;

      const imagesToPost = selectedImages.length > 0 ? selectedImages : [SAMPLE_POST_IMAGES[0]];

      if (shareAsStory) {
        if (imagesToPost.length > 1 && modeToUse === 'collage') {
          setIsGeneratingCollage(true);
          try {
            const collageUrl = await generateStoryCollage(imagesToPost);
            await addNewStory(
              collageUrl,
              finalCaption,
              5,
              selectedSong?.title,
              selectedSong?.artist,
              selectedSong?.audioUrl
            );
          } finally {
            setIsGeneratingCollage(false);
          }
        } else {
          await addNewStory(
            imagesToPost,
            finalCaption,
            5,
            selectedSong?.title,
            selectedSong?.artist,
            selectedSong?.audioUrl
          );
        }
      } else {
        await addNewPost(
          imagesToPost,
          finalCaption,
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
    } catch (err) {
      console.error('Post creation failed:', err);
    } finally {
      setIsPosting(false);
    }
  };

  const handlePostClick = () => {
    if (selectedImages.length === 0 && !caption.trim()) {
      fileInputRef.current?.click();
      return;
    }
    if (shareAsStory && selectedImages.length > 1) {
      setIsStoryPromptOpen(true);
    } else {
      executePost(storyMode);
    }
  };

  const FEELING_OPTIONS = [
    { label: 'Happy 😊', id: 'happy' },
    { label: 'Inspired ✨', id: 'inspired' },
    { label: 'Exploring 🌍', id: 'exploring' },
    { label: 'Vibing 🎧', id: 'vibing' },
    { label: 'Blessed 🙏', id: 'blessed' },
    { label: 'Creative 🎨', id: 'creative' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in overflow-y-auto">
      {/* Dim Backdrop Overlay - clicking strictly closes the modal */}
      <div 
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md" 
      />

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*" 
        multiple
        onClick={(e) => e.stopPropagation()}
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* Modal Dialog Card */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 aerogel-card border border-white/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col my-auto max-h-[92vh]"
      >
        {/* Top Media Type Switcher Tabs (Mockup) */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              { id: 'photo', label: 'Photo', icon: ImageIcon },
              { id: 'video', label: 'Video', icon: Video },
              { id: 'thought', label: 'Thought', icon: MessageSquare },
              { id: 'live', label: 'Live', icon: Radio },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = mediaType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMediaType(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-cosmic text-white shadow-md shadow-pink-500/25 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar flex-1">
          {/* Creator Profile Prompt Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-cosmic p-[2px] shadow-md shadow-pink-500/20 flex-shrink-0">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={currentUser?.username || 'creator'}
                  className="w-full h-full rounded-full object-cover border border-black"
                />
              </div>
              <div>
                <p className="text-xs font-black text-white flex items-center gap-1">
                  <span>{displayName}</span>
                  {currentUser?.isVerified && (
                    <span className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">✓</span>
                  )}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-zinc-400">@{currentUser?.username || 'creator'}</span>
                  <span className="text-[10px] text-zinc-500">•</span>
                  <button
                    type="button"
                    onClick={() => setAudience(a => a === 'public' ? 'sphere' : a === 'sphere' ? 'close' : 'public')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-[10px] font-bold text-pink-400 border border-white/10 transition-colors"
                  >
                    <Globe className="w-2.5 h-2.5" />
                    <span>{audience === 'public' ? 'Public 🌐' : audience === 'sphere' ? 'Sphere Only 🪐' : 'Close Friends 🌟'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Soundtrack Trigger Pill */}
            <button
              type="button"
              onClick={() => setIsMusicPickerOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-bold border transition-all ${
                selectedSong
                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span className="truncate max-w-[120px]">
                {selectedSong ? selectedSong.title : 'Soundtrack'}
              </span>
            </button>
          </div>

          {/* Main Thought / Caption Textarea */}
          <div className="relative">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={`What's on your mind, ${firstName}? Share a moment or spark an idea...`}
              rows={3}
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none resize-none border-b border-white/10 pb-3"
            />
          </div>

          {/* Media Previews Row: Thumbnails + Adjacent Add Card */}
          {mediaType !== 'thought' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                  <span>Photos & Album ({selectedImages.length})</span>
                </span>
                <span className="text-[11px] text-zinc-400">Slide carousel supported</span>
              </div>

              {isProcessingPhotos && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-pink-400 flex-shrink-0" />
                  <span>Optimizing and loading photos...</span>
                </div>
              )}

              {selectedImages.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 hover:border-pink-500/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/[0.02] hover:bg-white/[0.06] transition-all text-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-cosmic p-[1.5px] shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                    <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center text-pink-400">
                      <Upload className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Click or tap to upload photos</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Supports multi-photo slide carousel & collages</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 overflow-x-auto py-2 px-1 no-scrollbar">
                  {/* Selected Image Thumbnails */}
                  {selectedImages.map((imgUrl, idx) => (
                    <div 
                      key={idx} 
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-white/15 flex-shrink-0 group shadow-md"
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Media ${idx + 1}`} 
                        className={`w-full h-full object-cover ${FILTER_OPTIONS.find(f => f.id === selectedFilter)?.className || ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-md"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {selectedImages.length > 1 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-bold">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Adjacent Dashed + Add Photo Card */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-white/20 hover:border-pink-500/60 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white transition-all bg-white/[0.02] hover:bg-white/[0.06] flex-shrink-0 cursor-pointer active:scale-95"
                    title="Upload more photos"
                  >
                    <Plus className="w-5 h-5 text-pink-400" />
                    <span className="text-[10px] font-bold">Add Photo</span>
                  </button>
                </div>
              )}

              {/* Quick Sample Selector if user wants instant aesthetic photos */}
              <div className="pt-1">
                <p className="text-[10px] text-zinc-400 mb-1.5">Or tap to add aesthetic presets:</p>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {SAMPLE_POST_IMAGES.slice(0, 5).map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleToggleSampleImage(url)}
                      className={`w-9 h-9 rounded-xl overflow-hidden border transition-all flex-shrink-0 ${
                        selectedImages.includes(url) ? 'border-pink-500 scale-105 ring-1 ring-pink-500' : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filter Pills Slider */}
          {mediaType !== 'thought' && (
            <div className="pt-1">
              <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1 mb-2">
                <Sliders className="w-3 h-3 text-cyan-400" />
                <span>Photo Filter</span>
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                      selectedFilter === f.id
                        ? 'bg-gradient-cosmic text-white shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Options List (Mockup Item Rows) */}
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            {/* Tag People */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer" onClick={() => setShowTagPicker(!showTagPicker)}>
              <div className="flex items-center gap-2.5 text-xs text-zinc-200">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold">Tag People</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">
                {taggedPeople.length > 0 ? taggedPeople.join(', ') : 'None'}
              </span>
            </div>

            {showTagPicker && (
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-2 animate-fade-in">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Enter @username and press add"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (tagInput.trim()) {
                      setTaggedPeople(prev => [...prev, tagInput.trim().replace(/^@/, '@')]);
                      setTagInput('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-cosmic text-white text-xs font-bold shadow-md"
                >
                  Add
                </button>
              </div>
            )}

            {/* Add Location */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer" onClick={() => setShowLocationInput(!showLocationInput)}>
              <div className="flex items-center gap-2.5 text-xs text-zinc-200">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span className="font-semibold">Add Location</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[150px]">
                {location || 'Optional'}
              </span>
            </div>

            {showLocationInput && (
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-2 animate-fade-in">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Goa, India or Tokyo, Japan"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
            )}

            {/* Feeling / Mood */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer" onClick={() => setShowFeelingPicker(!showFeelingPicker)}>
              <div className="flex items-center gap-2.5 text-xs text-zinc-200">
                <Smile className="w-4 h-4 text-amber-400" />
                <span className="font-semibold">Feeling / Mood</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">
                {feeling || 'None'}
              </span>
            </div>

            {showFeelingPicker && (
              <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-2 flex-wrap animate-fade-in">
                {FEELING_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setFeeling(prev => prev === f.id ? null : f.id);
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                      feeling === f.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Share to Story Toggle */}
            <div 
              onClick={() => setShareAsStory(!shareAsStory)}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-xs text-zinc-200">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span className="font-semibold">Share to Your Story ⚡</span>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                shareAsStory ? 'bg-gradient-cosmic justify-end' : 'bg-zinc-800 justify-start'
              }`}>
                <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with "Post to Your World ✨" Cosmic Button */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handlePostClick}
            disabled={isPosting || isGeneratingCollage}
            className="flex-1 max-w-xs py-3 px-6 rounded-2xl bg-gradient-cosmic text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-pink-500/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isPosting || isGeneratingCollage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Broadcasting to Orbit...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Transmitted! ✨</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Post to Your World ✨</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Music Picker Modal */}
      {isMusicPickerOpen && (
        <MusicPickerModal
          isOpen={isMusicPickerOpen}
          onClose={() => setIsMusicPickerOpen(false)}
          onSelectSong={(song: SongTrack) => {
            setSelectedSong(song);
            setIsMusicPickerOpen(false);
          }}
          selectedSongId={selectedSong?.id}
        />
      )}

      {/* Multi-Photo Story Prompt Modal (Collage vs Separate Slides) */}
      <StoryMultiPhotoPromptModal
        isOpen={isStoryPromptOpen}
        photoCount={selectedImages.length}
        selectedMode={storyMode}
        onSelectMode={(mode: 'separate' | 'collage') => setStoryMode(mode)}
        onConfirm={() => {
          setIsStoryPromptOpen(false);
          executePost(storyMode);
        }}
        onClose={() => setIsStoryPromptOpen(false)}
      />
    </div>
  );
};
