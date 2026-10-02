import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  MapPin, 
  ChevronLeft, 
  Check, 
  Sliders,
  Music
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FILTER_OPTIONS, SAMPLE_POST_IMAGES } from '../../constants/media';
import { FilterType, SongTrack } from '../../types';
import { MusicPickerModal } from '../music/MusicPickerModal';

export const CreatePostModal: React.FC = () => {
  const { isCreatePostOpen, setIsCreatePostOpen, addNewPost, addNewStory, currentUser } = useApp();

  const [step, setStep] = useState<'select' | 'filter' | 'caption'>('select');
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_POST_IMAGES[0]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('normal');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [shareAsStory, setShareAsStory] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SongTrack | null>(null);
  const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isCreatePostOpen || !currentUser) return null;

  const handleClose = () => {
    setIsCreatePostOpen(false);
    setStep('select');
    setSelectedFilter('normal');
    setCaption('');
    setLocation('');
    setSelectedSong(null);
    setIsSuccess(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setStep('filter');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async () => {
    if (!selectedImage) return;

    const filterClass = FILTER_OPTIONS.find(f => f.id === selectedFilter)?.className || 'filter-normal';
    
    if (shareAsStory) {
      await addNewStory(
        selectedImage,
        caption,
        5,
        selectedSong?.title,
        selectedSong?.artist,
        selectedSong?.audioUrl
      );
    } else {
      await addNewPost(
        [selectedImage],
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
            {step === 'select' && 'Create New Post / Story'}
            {step === 'filter' && 'Choose Filter & Style'}
            {step === 'caption' && 'Write Caption & Details'}
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
              onClick={handleShare}
              className="bg-gradient-cosmic hover:opacity-95 text-white font-bold px-4 py-1.5 rounded-full shadow-lg shadow-pink-500/25 transition-all text-xs active:scale-95"
            >
              Share
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
            <p className="text-zinc-400 text-sm">Your new content is now orbiting Social Sphere.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Step 1: Select Media / Upload */}
            {step === 'select' && (
              <div className="p-8 flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-pink-400 shadow-xl">
                  <ImageIcon className="w-10 h-10" />
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-white">Select photos and videos</h3>
                  <p className="text-xs text-zinc-400">Upload your own media or choose a curated sample below</p>
                </div>

                <label className="cursor-pointer bg-gradient-cosmic hover:opacity-95 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2 active:scale-95">
                  <Upload className="w-4 h-4" />
                  Select from Computer
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>

                {/* Preset sample photos gallery */}
                <div className="w-full pt-4 border-t border-white/10">
                  <p className="text-xs text-zinc-400 mb-3 text-center">Or pick an aesthetic sample:</p>
                  <div className="grid grid-cols-6 gap-2">
                    {SAMPLE_POST_IMAGES.map((imgUrl, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedImage(imgUrl);
                          setStep('filter');
                        }}
                        className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 ${
                          selectedImage === imgUrl ? 'border-pink-500 shadow-lg shadow-pink-500/30' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt={`Sample ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Filters & Adjustments */}
            {step === 'filter' && (
              <div className="flex-1 flex flex-col md:flex-row h-full">
                {/* Image preview with active filter */}
                <div className="flex-1 bg-black flex items-center justify-center p-4 min-h-[300px]">
                  <div className="w-full max-w-[400px] aspect-square rounded-lg overflow-hidden shadow-2xl border border-zinc-800">
                    <img 
                      src={selectedImage} 
                      alt="Filter preview" 
                      className={`w-full h-full object-cover ${
                        FILTER_OPTIONS.find(f => f.id === selectedFilter)?.className || ''
                      }`}
                    />
                  </div>
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
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-700">
                          <img 
                            src={selectedImage} 
                            alt={f.label} 
                            className={`w-full h-full object-cover ${f.className}`}
                          />
                        </div>
                        <span className={`text-[11px] font-medium ${selectedFilter === f.id ? 'text-blue-400' : 'text-zinc-400'}`}>
                          {f.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Write Caption, Location & Story Toggle */}
            {step === 'caption' && (
              <div className="flex-1 flex flex-col md:flex-row">
                {/* Thumbnail Preview */}
                <div className="w-full md:w-56 bg-black flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-zinc-800">
                  <div className="w-36 h-36 rounded-xl overflow-hidden border border-zinc-700 shadow-lg">
                    <img 
                      src={selectedImage} 
                      alt="Thumbnail" 
                      className={`w-full h-full object-cover ${
                        FILTER_OPTIONS.find(f => f.id === selectedFilter)?.className || ''
                      }`}
                    />
                  </div>
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
                      rows={4}
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
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white">Share to 24h Story</p>
                      <p className="text-[10px] text-zinc-400">Add to your temporary daily story reel</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={shareAsStory} 
                        onChange={(e) => setShareAsStory(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
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
    </div>
  );
};
