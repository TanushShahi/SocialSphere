import React, { useState, useEffect } from 'react';
import { X, MapPin, Music, Sparkles, Check, Loader2 } from 'lucide-react';
import { Post, SongTrack } from '../../types';
import { useApp } from '../../context/AppContext';
import { MusicPickerModal } from '../music/MusicPickerModal';

interface EditPostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({ post, isOpen, onClose }) => {
  const { editPost } = useApp();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSong, setSelectedSong] = useState<SongTrack | null>(null);
  const [removeSong, setRemoveSong] = useState(false);
  const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setCaption(post.caption || '');
      setLocation(post.location || '');
      setRemoveSong(false);
      if (post.songTitle && post.songUrl) {
        setSelectedSong({
          id: 'current_song',
          title: post.songTitle,
          artist: post.songArtist || '',
          audioUrl: post.songUrl,
          duration: 30,
          coverUrl: post.media[0]?.url || '',
          genre: 'Track'
        });
      } else {
        setSelectedSong(null);
      }
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await editPost(post.id, {
        caption,
        location,
        songTitle: removeSong ? '' : (selectedSong?.title || ''),
        songArtist: removeSong ? '' : (selectedSong?.artist || ''),
        songUrl: removeSong ? '' : (selectedSong?.audioUrl || '')
      });
      onClose();
    } catch (err) {
      console.error('Failed to update post:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSong = () => {
    setSelectedSong(null);
    setRemoveSong(true);
  };

  const currentMedia = post.media[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fade-in text-white select-none">
      <div className="relative w-full max-w-xl bg-zinc-950/90 border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-sphere flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Edit Post</h3>
              <p className="text-[11px] text-zinc-400">Update caption, location & soundtrack</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* Post Preview Card */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-900/60 border border-white/5">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800 border border-white/10">
              {currentMedia && (
                <img
                  src={currentMedia.url}
                  alt="Post preview"
                  className={`w-full h-full object-cover ${currentMedia.filter || ''}`}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-zinc-300 block truncate">
                Posted {post.createdAt}
              </span>
              <span className="text-[11px] text-zinc-500 block truncate">
                {post.media.length} media item{post.media.length > 1 ? 's' : ''} • {post.likesCount} likes
              </span>
            </div>
          </div>

          {/* Caption Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Caption</span>
              <span className="text-[10px] text-zinc-500">{caption.length}/2200</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption, mention creators or add #hashtags..."
              rows={4}
              maxLength={2200}
              className="w-full bg-zinc-900/80 border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all resize-none"
            />
          </div>

          {/* Location Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Location</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location (e.g. Kyoto, Japan or Studio 9)"
                className="w-full bg-zinc-900/80 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
              />
            </div>
          </div>

          {/* Soundtrack / Song Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-pink-400" />
              <span>Soundtrack</span>
            </label>

            {selectedSong && !removeSong ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent border border-pink-500/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 border border-pink-500/30">
                    <Music className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{selectedSong.title}</p>
                    <p className="text-[11px] text-pink-300/80 truncate">{selectedSong.artist || 'Original Audio'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMusicPickerOpen(true)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 rounded-lg transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveSong}
                    className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove soundtrack"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setRemoveSong(false);
                  setIsMusicPickerOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-zinc-700 hover:border-pink-500/50 bg-zinc-900/40 hover:bg-pink-500/5 text-zinc-400 hover:text-pink-300 transition-all text-xs font-semibold"
              >
                <Music className="w-4 h-4" />
                <span>Attach Song or Soundtrack</span>
              </button>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-sphere hover:opacity-95 shadow-lg shadow-pink-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Music Picker Modal Integration */}
      <MusicPickerModal
        isOpen={isMusicPickerOpen}
        onClose={() => setIsMusicPickerOpen(false)}
        onSelectSong={(track) => {
          setSelectedSong(track);
          setRemoveSong(false);
        }}
        currentSelectedId={selectedSong?.id}
      />
    </div>
  );
};