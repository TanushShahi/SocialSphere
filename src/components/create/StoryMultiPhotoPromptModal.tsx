import React from 'react';
import { Layers, LayoutGrid, X, Check } from 'lucide-react';

interface StoryMultiPhotoPromptModalProps {
  isOpen: boolean;
  photoCount: number;
  selectedMode: 'separate' | 'collage';
  onSelectMode: (mode: 'separate' | 'collage') => void;
  onConfirm: () => void;
  onClose: () => void;
}

export const StoryMultiPhotoPromptModal: React.FC<StoryMultiPhotoPromptModalProps> = ({
  isOpen,
  photoCount,
  selectedMode,
  onSelectMode,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in select-none text-white">
      {/* Sibling Dim Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md" 
      />

      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 aerogel-card border border-white/20 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] bg-zinc-950/95 p-6 space-y-5 backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
              Story Options ({photoCount} Photos)
            </h3>
            <p className="text-xs text-zinc-400">
              Choose how you want these photos to appear on your story:
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Option 1: Separate sequential slides */}
          <div 
            onClick={() => onSelectMode('separate')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
              selectedMode === 'separate'
                ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            <div className={`p-3 rounded-xl flex-shrink-0 ${
              selectedMode === 'separate' ? 'bg-pink-500 text-white' : 'bg-zinc-800 text-zinc-300'
            }`}>
              <Layers className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Upload as Separate Stories</h4>
                {selectedMode === 'separate' && (
                  <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Upload each photo individually as <strong className="text-zinc-200">{photoCount} sequential story slides</strong> that viewers can tap through one by one.
              </p>
            </div>
          </div>

          {/* Option 2: Single frame collage grid */}
          <div 
            onClick={() => onSelectMode('collage')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
              selectedMode === 'collage'
                ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            <div className={`p-3 rounded-xl flex-shrink-0 ${
              selectedMode === 'collage' ? 'bg-gradient-cosmic text-white' : 'bg-zinc-800 text-zinc-300'
            }`}>
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Single Frame Collage Grid</h4>
                {selectedMode === 'collage' && (
                  <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Combine all ${photoCount} photos into <strong className="text-zinc-200">one single 9:16 layout grid frame</strong> with automatic aesthetic framing.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-cosmic text-xs font-bold text-white hover:opacity-95 shadow-lg shadow-pink-500/25 active:scale-95 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
