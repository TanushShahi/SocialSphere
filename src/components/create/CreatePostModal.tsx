import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  MapPin, 
  Check, 
  Music, 
  Plus, 
  Loader2, 
  Smile, 
  Globe, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Play, 
  Pause, 
  ArrowLeft, 
  Trash2, 
  Share2, 
  Copy, 
  CheckCheck,
  Crop,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FILTER_OPTIONS, SAMPLE_POST_IMAGES } from '../../constants/media';
import { FilterType, SongTrack } from '../../types';
import { MusicPickerModal } from '../music/MusicPickerModal';
import { generateStoryCollage } from '../../utils/collageGenerator';
import { compressImage } from '../../utils/imageCompressor';

const POPULAR_LOCATIONS = [
  'Mumbai, Maharashtra',
  'New Delhi, Delhi',
  'Bengaluru, Karnataka',
  'Goa, India',
  'Jaipur, Rajasthan',
  'New York, USA',
  'London, UK',
  'Tokyo, Japan',
  'Paris, France',
  'Dubai, UAE'
];

const EMOJI_LIST = ['😊', '🔥', '✨', '💖', '📸', '🌴', '☕', '🎉', '🚀', '🪐', '💫', '🙌'];

export const CreatePostModal: React.FC = () => {
  const { 
    isCreatePostOpen, 
    setIsCreatePostOpen, 
    addNewPost, 
    addNewStory, 
    currentUser, 
    setActiveTab 
  } = useApp();

  // Step state: 'upload' | 'filter' | 'details'
  const [step, setStep] = useState<'upload' | 'filter' | 'details'>('upload');

  // Media selection
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '16:9'>('1:1');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('normal');
  const [showThumbnailStrip, setShowThumbnailStrip] = useState(false);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);

  // Post Details
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [audience, setAudience] = useState<'public' | 'close'>('public');

  // Music Selection
  const [selectedSong, setSelectedSong] = useState<SongTrack | null>(null);
  const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Cross-posting to story
  const [shareAsStory, setShareAsStory] = useState(false);
  const [storyMode, setStoryMode] = useState<'separate' | 'collage'>('separate');

  // Sharing & Status
  const [isPosting, setIsPosting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop audio when closing or changing song
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  const handleClose = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    setIsCreatePostOpen(false);
    setTimeout(() => {
      setStep('upload');
      setSelectedImages([]);
      setCurrentMediaIdx(0);
      setSelectedFilter('normal');
      setCaption('');
      setLocation('');
      setLocationInput('');
      setSelectedSong(null);
      setShareAsStory(false);
      setStoryMode('separate');
      setIsSuccess(false);
      setIsPosting(false);
      setShowThumbnailStrip(false);
      setIsPlayingPreview(false);
    }, 200);
  };

  if (!isCreatePostOpen) return null;

  const displayName = currentUser?.name || currentUser?.username || 'Creator';
  const firstName = displayName.split(' ')[0] || 'there';

  // File Upload Handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
    try {
      const fileList = Array.from(files);
      const compressedList = await Promise.all(
        fileList.map((file: File) => compressImage(file, 1280, 1280, 0.8))
      );
      const validUrls = compressedList.filter((u: string) => Boolean(u && u.length > 20));
      if (validUrls.length > 0) {
        setSelectedImages(prev => {
          const next = [...prev, ...validUrls];
          return next;
        });
        setStep('filter');
      }
    } catch (err) {
      console.error('Failed to process photos:', err);
    } finally {
      setIsProcessingPhotos(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSelectPreset = (url: string) => {
    setSelectedImages(prev => {
      if (prev.includes(url)) {
        return prev.filter(u => u !== url);
      }
      return [...prev, url];
    });
  };

  const handleRemoveImage = (idxToRemove: number) => {
    setSelectedImages(prev => {
      const updated = prev.filter((_, i) => i !== idxToRemove);
      if (updated.length === 0) {
        setStep('upload');
        setCurrentMediaIdx(0);
      } else if (currentMediaIdx >= updated.length) {
        setCurrentMediaIdx(updated.length - 1);
      }
      return updated;
    });
  };

  // Music Audio Preview Toggle
  const toggleAudioPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSong?.audioUrl) return;

    if (isPlayingPreview) {
      audioPreviewRef.current?.pause();
      setIsPlayingPreview(false);
    } else {
      if (!audioPreviewRef.current) {
        const audio = new Audio(selectedSong.audioUrl);
        audio.volume = 0.6;
        audio.onended = () => setIsPlayingPreview(false);
        audioPreviewRef.current = audio;
      } else {
        audioPreviewRef.current.src = selectedSong.audioUrl;
      }
      audioPreviewRef.current.play().catch(() => {});
      setIsPlayingPreview(true);
    }
  };

  // Submit Post
  const handlePublish = async () => {
    if (isPosting || selectedImages.length === 0) return;
    setIsPosting(true);

    try {
      const filterClass = FILTER_OPTIONS.find(f => f.id === selectedFilter)?.className || 'filter-normal';
      const finalCaption = caption.trim();

      // 1. Add Post to Feed
      await addNewPost(
        selectedImages,
        finalCaption,
        filterClass,
        location,
        selectedSong?.title,
        selectedSong?.artist,
        selectedSong?.audioUrl
      );

      // 2. If Cross-post to story enabled
      if (shareAsStory) {
        if (selectedImages.length > 1 && storyMode === 'collage') {
          const collageUrl = await generateStoryCollage(selectedImages);
          await addNewStory(
            collageUrl,
            finalCaption,
            5,
            selectedSong?.title,
            selectedSong?.artist,
            selectedSong?.audioUrl
          );
        } else {
          await addNewStory(
            selectedImages,
            finalCaption,
            5,
            selectedSong?.title,
            selectedSong?.artist,
            selectedSong?.audioUrl
          );
        }
      }

      setIsSuccess(true);
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }

      setTimeout(() => {
        handleClose();
        setActiveTab('feed');
      }, 1400);
    } catch (err) {
      console.error('Failed to publish post:', err);
    } finally {
      setIsPosting(false);
    }
  };

  // External Share Handlers
  const getShareText = () => {
    const songNote = selectedSong ? ' 🎵 Music: ' + selectedSong.title + ' by ' + selectedSong.artist : '';
    const locNote = location ? ' 📍 at ' + location : '';
    return (caption || 'Check out my new post on Social Sphere!') + songNote + locNote + ' #SocialSphere';
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getShareText() + ' ' + window.location.href);
    window.open('https://api.whatsapp.com/send?text=' + text, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(window.location.href);
    window.open('https://twitter.com/intent/tweet?text=' + text + '&url=' + url, '_blank');
  };

  const handleCopyPostLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filterClass = FILTER_OPTIONS.find(f => f.id === selectedFilter)?.className || 'filter-normal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in overflow-y-auto">
      {/* Sibling Dim Backdrop */}
      <div 
        onClick={handleClose} 
        className="fixed inset-0 bg-black/85 backdrop-blur-md" 
      />

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*" 
        multiple
        onClick={(e) => e.stopPropagation()}
        onChange={handleFileSelect} 
        className="hidden" 
      />

      {/* Main Instagram Dialog Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={'relative z-10 w-full bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col text-white transition-all duration-300 ' + (step === 'details' ? 'max-w-4xl max-h-[92vh]' : 'max-w-2xl max-h-[90vh]')}
      >
        {/* Instagram Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md flex-shrink-0">
          {/* Left Action (Back or Cancel) */}
          {step === 'upload' ? (
            <button 
              onClick={handleClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => {
                if (step === 'details') setStep('filter');
                else if (step === 'filter') setStep('upload');
              }}
              className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {/* Center Title */}
          <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            {step === 'upload' && 'Create new post'}
            {step === 'filter' && 'Crop & Filters'}
            {step === 'details' && 'Create new post'}
          </h2>

          {/* Right Action (Next or Share) */}
          {step === 'upload' ? (
            selectedImages.length > 0 ? (
              <button 
                onClick={() => setStep('filter')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors px-2 py-1"
              >
                Next
              </button>
            ) : (
              <div className="w-6" />
            )
          ) : step === 'filter' ? (
            <button 
              onClick={() => setStep('details')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors px-2 py-1"
            >
              Next
            </button>
          ) : (
            <button 
              onClick={handlePublish}
              disabled={isPosting}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-all px-2 py-1"
            >
              {isPosting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sharing...</span>
                </>
              ) : (
                <span>Share</span>
              )}
            </button>
          )}
        </div>

        {/* Success Modal Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 z-30 bg-black/95 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-gradient-cosmic p-[2px] flex items-center justify-center shadow-2xl shadow-pink-500/50 animate-bounce">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-emerald-400 stroke-[3]" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight">Your post has been shared!</h3>
              <p className="text-xs text-zinc-400">Transmitted to your world & active across the feed.</p>
            </div>
          </div>
        )}

        {/* ---------------- STEP 1: UPLOAD MEDIA ---------------- */}
        {step === 'upload' && (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* Gallery Upload Center Icon */}
            <div className="w-24 h-24 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300 shadow-xl group">
              <ImageIcon className="w-12 h-12 stroke-[1.4] text-zinc-400 group-hover:text-pink-400 transition-colors" />
            </div>

            <div className="space-y-1 max-w-sm">
              <h3 className="text-lg font-semibold text-white">Drag photos and videos here</h3>
              <p className="text-xs text-zinc-400">
                Upload multiple photos to create an Instagram sliding carousel (JPG, PNG, WebP)
              </p>
            </div>

            {/* Select from Computer Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingPhotos}
              className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-2"
            >
              {isProcessingPhotos ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Optimizing photos...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Select from device</span>
                </>
              )}
            </button>

            {/* Quick Aesthetic Preset Grid */}
            <div className="w-full pt-4 border-t border-zinc-800/80 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Or choose from curated presets ({selectedImages.length} selected)</span>
                </span>
                {selectedImages.length > 0 && (
                  <button 
                    onClick={() => setStep('filter')}
                    className="text-xs font-bold text-blue-400 hover:underline"
                  >
                    Continue with {selectedImages.length} photo{selectedImages.length > 1 ? 's' : ''} →
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SAMPLE_POST_IMAGES.map((imgUrl, i) => {
                  const isSelected = selectedImages.includes(imgUrl);
                  return (
                    <div 
                      key={i}
                      onClick={() => handleSelectPreset(imgUrl)}
                      className={'relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ' + (isSelected ? 'border-pink-500 ring-2 ring-pink-500/50 scale-95 shadow-md' : 'border-zinc-800 hover:border-zinc-600 hover:scale-105')}
                    >
                      <img src={imgUrl} alt={'Preset ' + i} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- STEP 2: CAROUSEL & FILTERS STUDIO ---------------- */}
        {step === 'filter' && (
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Left Preview: Carousel Image Frame */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-[440px] select-none group/carousel overflow-hidden">
              <div className={'relative w-full overflow-hidden flex items-center justify-center ' + (aspectRatio === '1:1' ? 'aspect-square max-h-[460px]' : aspectRatio === '4:5' ? 'aspect-[4/5] max-h-[480px]' : 'aspect-[16/9] max-h-[380px]')}>
                {/* Images Sliding Track */}
                <div 
                  className="flex w-full h-full transition-transform duration-300 ease-out"
                  style={{ transform: 'translateX(-' + (currentMediaIdx * 100) + '%)' }}
                >
                  {selectedImages.map((imgUrl, idx) => (
                    <div key={idx} className="w-full h-full flex-shrink-0 relative">
                      <img 
                        src={imgUrl} 
                        alt={'Slide ' + idx} 
                        className={'w-full h-full object-cover ' + filterClass}
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>

                {/* 1/N Counter Badge */}
                {selectedImages.length > 1 && (
                  <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                    {currentMediaIdx + 1}/{selectedImages.length}
                  </div>
                )}

                {/* Navigation Chevrons */}
                {selectedImages.length > 1 && currentMediaIdx > 0 && (
                  <button
                    onClick={() => setCurrentMediaIdx(prev => prev - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-md"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {selectedImages.length > 1 && currentMediaIdx < selectedImages.length - 1 && (
                  <button
                    onClick={() => setCurrentMediaIdx(prev => prev + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-md"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {/* Pagination Dots */}
                {selectedImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md">
                    {selectedImages.map((_, i) => (
                      <div 
                        key={i}
                        className={'rounded-full transition-all ' + (i === currentMediaIdx ? 'w-2 h-2 bg-blue-500 scale-110' : 'w-1.5 h-1.5 bg-white/40')}
                      />
                    ))}
                  </div>
                )}

                {/* Aspect Ratio Selector Floating Icon */}
                <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-xl">
                  {(['1:1', '4:5', '16:9'] as const).map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={'px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors ' + (aspectRatio === ratio ? 'bg-white/20 text-white' : 'text-zinc-400 hover:text-white')}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>

                {/* Carousel Layers Manager Button (Bottom Right) */}
                <button
                  type="button"
                  onClick={() => setShowThumbnailStrip(!showThumbnailStrip)}
                  className={'absolute bottom-3 right-3 z-20 p-2 rounded-xl backdrop-blur-md transition-all flex items-center gap-1 text-[11px] font-bold ' + (showThumbnailStrip ? 'bg-blue-500 text-white' : 'bg-black/70 text-zinc-300 hover:text-white')}
                  title="Manage carousel photos"
                >
                  <Layers className="w-4 h-4" />
                  <span>{selectedImages.length}</span>
                </button>
              </div>

              {/* Expandable Carousel Thumbnail Strip */}
              {showThumbnailStrip && (
                <div className="absolute bottom-14 right-3 z-30 bg-zinc-900/95 border border-zinc-700/80 rounded-2xl p-2.5 shadow-2xl flex items-center gap-2 max-w-[90vw] overflow-x-auto backdrop-blur-xl animate-scale-up">
                  {selectedImages.map((img, i) => (
                    <div 
                      key={i}
                      onClick={() => setCurrentMediaIdx(i)}
                      className={'relative w-12 h-12 rounded-xl overflow-hidden cursor-pointer flex-shrink-0 border-2 ' + (currentMediaIdx === i ? 'border-blue-500' : 'border-transparent')}
                    >
                      <img src={img} alt={'Thumb ' + i} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(i);
                        }}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/80 hover:bg-rose-600 rounded-full flex items-center justify-center text-white"
                        title="Delete this photo"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add More Photos Card in Strip */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 rounded-xl border border-dashed border-zinc-600 hover:border-blue-500 flex flex-col items-center justify-center text-zinc-400 hover:text-blue-400 flex-shrink-0 transition-colors"
                    title="Add more photos"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Panel: Instagram Live Filters Grid */}
            <div className="w-full md:w-72 bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-800 p-4 overflow-y-auto max-h-64 md:max-h-none custom-scrollbar space-y-3">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Filters</span>
              </h4>

              <div className="grid grid-cols-3 gap-2.5">
                {FILTER_OPTIONS.map((f) => {
                  const isActive = selectedFilter === f.id;
                  const sampleImg = selectedImages[currentMediaIdx] || SAMPLE_POST_IMAGES[0];
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFilter(f.id)}
                      className={'flex flex-col items-center gap-1 group transition-all ' + (isActive ? 'scale-105' : 'hover:opacity-90')}
                    >
                      <div className={'w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ' + (isActive ? 'border-blue-500 shadow-md shadow-blue-500/30' : 'border-zinc-800 group-hover:border-zinc-700')}>
                        <img 
                          src={sampleImg} 
                          alt={f.label} 
                          className={'w-full h-full object-cover ' + f.className} 
                        />
                      </div>
                      <span className={'text-[10px] font-bold truncate max-w-[60px] ' + (isActive ? 'text-blue-400' : 'text-zinc-400')}>
                        {f.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- STEP 3: DETAILS, CAPTION, MUSIC, LOCATION, SHARE ---------------- */}
        {step === 'details' && (
          <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
            {/* Left Column: Carousel Thumbnail View */}
            <div className="w-full md:w-[380px] bg-black/60 border-b md:border-b-0 md:border-r border-zinc-800 flex items-center justify-center p-4 select-none relative group/detail flex-shrink-0">
              <div className="relative w-full aspect-square max-w-[320px] rounded-2xl overflow-hidden border border-zinc-800 shadow-xl">
                <div 
                  className="flex w-full h-full transition-transform duration-300 ease-out"
                  style={{ transform: 'translateX(-' + (currentMediaIdx * 100) + '%)' }}
                >
                  {selectedImages.map((img, i) => (
                    <div key={i} className="w-full h-full flex-shrink-0 relative">
                      <img src={img} alt={'Slide ' + i} className={'w-full h-full object-cover ' + filterClass} />
                    </div>
                  ))}
                </div>

                {selectedImages.length > 1 && (
                  <>
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[9px] font-bold">
                      {currentMediaIdx + 1}/{selectedImages.length}
                    </div>
                    {currentMediaIdx > 0 && (
                      <button 
                        onClick={() => setCurrentMediaIdx(p => p - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {currentMediaIdx < selectedImages.length - 1 && (
                      <button 
                        onClick={() => setCurrentMediaIdx(p => p + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Instagram Details Form */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {/* User Profile Prompt Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-cosmic p-[1.5px] shadow-md shadow-pink-500/20 flex-shrink-0">
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={currentUser?.username || 'creator'}
                      className="w-full h-full rounded-full object-cover border border-black"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1">
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
                        onClick={() => setAudience(a => a === 'public' ? 'close' : 'public')}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-[10px] font-bold text-pink-400 border border-white/10 transition-colors"
                      >
                        <Globe className="w-2.5 h-2.5" />
                        <span>{audience === 'public' ? 'Public 🌐' : 'Close Friends 🌟'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Caption Textarea */}
              <div className="space-y-1.5">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={'Write a caption, ' + firstName + '...'}
                  rows={3}
                  maxLength={2200}
                  className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none resize-none border-b border-zinc-800 pb-2 custom-scrollbar"
                />

                {/* Emoji Bar & Character Counter */}
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-[75%] custom-scrollbar">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setCaption(c => c + emoji)}
                        className="p-1 hover:scale-125 transition-transform text-sm"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {caption.length}/2,200
                  </span>
                </div>
              </div>

              {/* 🎵 Instagram Music / Song Selection Row */}
              <div className="p-3 rounded-2xl bg-zinc-800/40 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-pink-400" />
                    <span>Music & Soundtrack</span>
                  </span>
                  {!selectedSong ? (
                    <button
                      type="button"
                      onClick={() => setIsMusicPickerOpen(true)}
                      className="px-3 py-1 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-bold border border-pink-500/40 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Song</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsMusicPickerOpen(true)}
                      className="text-xs font-semibold text-blue-400 hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>

                {selectedSong ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-700/60">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                        <img 
                          src={selectedSong.coverUrl || SAMPLE_POST_IMAGES[0]} 
                          alt={selectedSong.title} 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={toggleAudioPreview}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                        >
                          {isPlayingPreview ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{selectedSong.title}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{selectedSong.artist}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (audioPreviewRef.current) audioPreviewRef.current.pause();
                        setIsPlayingPreview(false);
                        setSelectedSong(null);
                      }}
                      className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
                      title="Remove song"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Attach Bollywood, Punjabi, or global songs with audio playback on your post.
                  </p>
                )}
              </div>

              {/* 📍 Instagram Location Selection Row */}
              <div className="p-3 rounded-2xl bg-zinc-800/40 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>Add Location</span>
                  </span>
                  {location && (
                    <button
                      type="button"
                      onClick={() => setLocation('')}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {location ? (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 truncate">
                      <span>📍</span> {location}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setLocation('')}
                      className="p-0.5 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => {
                        setLocationInput(e.target.value);
                        setShowLocationDropdown(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && locationInput.trim()) {
                          setLocation(locationInput.trim());
                          setLocationInput('');
                          setShowLocationDropdown(false);
                        }
                      }}
                      placeholder="Search city, venue or landmark..."
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                    />

                    {/* Popular Location Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {POPULAR_LOCATIONS.slice(0, 5).map(loc => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocation(loc)}
                          className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-[10px] font-semibold text-zinc-300 border border-zinc-700/60 transition-colors"
                        >
                          {loc.split(',')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ⚡ Cross-Post to Story */}
              <div className="p-3 rounded-2xl bg-zinc-800/40 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Also share to your Story</h4>
                  <p className="text-[10px] text-zinc-400">Add these {selectedImages.length} photos to your 24h stories tray</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShareAsStory(!shareAsStory)}
                  className={'w-11 h-6 rounded-full transition-colors relative p-0.5 ' + (shareAsStory ? 'bg-pink-500' : 'bg-zinc-700')}
                >
                  <div className={'w-5 h-5 rounded-full bg-white transition-transform ' + (shareAsStory ? 'translate-x-5' : 'translate-x-0')} />
                </button>
              </div>

              {/* 🌐 External Quick Share Options */}
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Share externally
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95"
                    title="Share on WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-[10px]">WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareFacebook}
                    className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95"
                    title="Share on Facebook"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-[10px]">Facebook</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareTwitter}
                    className="p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95"
                    title="Share on Twitter / X"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-[10px]">X / Twitter</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPostLink}
                    className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95"
                    title="Copy Link"
                  >
                    {copiedLink ? (
                      <>
                        <CheckCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-[10px]">Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom Big Share Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPosting}
                  className="w-full py-3 rounded-2xl bg-gradient-cosmic text-white font-bold text-xs shadow-lg shadow-pink-500/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Post...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Share to Your World ✨</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Music Picker Sub-Modal */}
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
    </div>
  );
};
