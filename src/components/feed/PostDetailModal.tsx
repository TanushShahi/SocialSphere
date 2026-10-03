import React, { useState, useRef } from 'react';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  Smile, 
  ChevronLeft, 
  ChevronRight,
  Music,
  Edit3,
  Trash2,
  Share2,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EditPostModal } from '../post/EditPostModal';
import { DeleteConfirmModal } from '../post/DeleteConfirmModal';

export const PostDetailModal: React.FC = () => {
  const { 
    selectedPostForDetail: post, 
    closePostDetail, 
    toggleLikePost, 
    toggleSavePost, 
    addComment, 
    toggleLikeComment,
    toggleFollowUser,
    deletePost,
    currentUser,
    openShareModal
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!post) return null;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment(post.id, commentText);
    setCommentText('');
    setShowEmojiPicker(false);
  };

  const addEmoji = (emoji: string) => {
    setCommentText(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const toggleAudio = () => {
    if (!post.songUrl) return;
    if (isPlayingAudio) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      if (!audioRef.current) {
        const a = new Audio(post.songUrl);
        a.volume = 0.6;
        a.loop = true;
        audioRef.current = a;
      }
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
      setShowOptions(false);
    }, 1200);
  };

  const handleOpenShare = () => {
    openShareModal({
      id: post.id,
      type: 'post',
      title: `Post by @${post.user.username}`,
      caption: post.caption,
      mediaUrl: (post.media[currentMediaIdx] || post.media[0])?.url || '',
      author: {
        id: post.user.id,
        username: post.user.username,
        name: post.user.name,
        avatar: post.user.avatar
      }
    });
  };

  const isOwner = currentUser && post.user.id === currentUser.id;

  return (
    <div 
      onClick={closePostDetail}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 animate-fade-in text-white select-none"
    >
      {/* Close button */}
      <button 
        onClick={closePostDetail}
        className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Modal Dialog Card */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative bg-zinc-950/90 border border-white/10 w-full max-w-4xl h-[90vh] max-h-[750px] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        {/* Left Column: Media Presentation */}
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
          <img 
            src={post.media[currentMediaIdx]?.url || post.media[0]?.url} 
            alt="Post focus" 
            className={`w-full h-full object-contain ${post.media[currentMediaIdx]?.filter || ''}`}
          />

          {/* Carousel Arrows */}
          {post.media.length > 1 && (
            <>
              {currentMediaIdx > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMediaIdx(prev => prev - 1);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center shadow-lg backdrop-blur-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {currentMediaIdx < post.media.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMediaIdx(prev => prev + 1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center shadow-lg backdrop-blur-md"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Indicator dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-md">
                {post.media.map((_, i) => (
                  <div 
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === currentMediaIdx ? 'bg-pink-500 scale-125' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Details & Comments */}
        <div className="w-full md:w-[380px] flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/5 bg-zinc-950">
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-cosmic p-[1.5px] flex-shrink-0">
                <img 
                  src={post.user.avatar} 
                  alt={post.user.username} 
                  className="w-full h-full rounded-full object-cover border border-black"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">
                    {post.user.username}
                  </span>
                  {!isOwner && currentUser && (
                    <button
                      onClick={() => toggleFollowUser(post.user.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        post.user.isFollowing ? 'text-zinc-400' : 'text-cyan-400'
                      }`}
                    >
                      {post.user.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
                {post.location && (
                  <p className="text-[10px] text-zinc-400 truncate">{post.location}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {post.songTitle && (
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="p-1.5 rounded-full bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 transition-colors"
                  title="Toggle Soundtrack"
                >
                  <Music className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                </button>
              )}

              <button 
                onClick={() => setShowOptions(true)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/5"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Comments List (Scrollable) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 text-xs">
            {/* Post Author Caption */}
            <div className="flex items-start gap-3">
              <img 
                src={post.user.avatar} 
                alt={post.user.username} 
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 leading-relaxed">
                <p className="text-zinc-200">
                  <span className="font-bold text-white mr-2">
                    {post.user.username}
                  </span>
                  {post.caption}
                </p>
                <span className="text-[10px] text-zinc-500 mt-1 block">{post.createdAt}</span>
              </div>
            </div>

            {/* Other Comments */}
            {post.comments.map((comm) => (
              <div key={comm.id} className="flex items-start justify-between gap-2 group">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <img 
                    src={comm.user.avatar} 
                    alt={comm.user.username} 
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                  />
                  <div className="leading-relaxed min-w-0">
                    <p className="text-zinc-300">
                      <span className="font-bold text-white mr-1.5">
                        {comm.user.username}
                      </span>
                      {comm.text}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500 font-medium">
                      <span>{comm.createdAt}</span>
                      {comm.likesCount > 0 && <span>{comm.likesCount} likes</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleLikeComment(post.id, comm.id)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <Heart 
                    className={`w-3.5 h-3.5 ${
                      comm.isLiked ? 'text-rose-500 fill-rose-500' : ''
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Actions & Comment Input */}
          <div className="border-t border-white/5 p-4 space-y-2.5 bg-zinc-950">
            {/* Buttons Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleLikePost(post.id)} className="active:scale-75 transition-transform">
                  <Heart 
                    className={`w-6 h-6 ${
                      post.isLiked 
                        ? 'text-rose-500 fill-rose-500' 
                        : 'text-zinc-300 hover:text-white stroke-[1.8]'
                    }`} 
                  />
                </button>
                <button 
                  onClick={() => inputRef.current?.focus()}
                  className="text-zinc-300 hover:text-white"
                >
                  <MessageCircle className="w-6 h-6 stroke-[1.8]" />
                </button>
                <button 
                  onClick={handleOpenShare}
                  className="text-zinc-300 hover:text-white active:scale-75 transition-transform"
                  title="Share post"
                >
                  <Send className="w-6 h-6 stroke-[1.8]" />
                </button>
              </div>

              <button onClick={() => toggleSavePost(post.id)}>
                <Bookmark 
                  className={`w-6 h-6 ${
                    post.isSaved ? 'text-pink-400 fill-current' : 'text-zinc-300 stroke-[1.8]'
                  }`} 
                />
              </button>
            </div>

            {/* Likes count */}
            <p className="text-xs font-bold text-white">
              {post.likesCount.toLocaleString()} likes
            </p>

            {/* Input Form */}
            <form onSubmit={handleCommentSubmit} className="relative pt-2 border-t border-white/5 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
              />

              {commentText.trim().length > 0 && (
                <button
                  type="submit"
                  className="text-xs font-bold text-pink-400 hover:text-pink-300"
                >
                  Post
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Options Menu Modal */}
      {showOptions && (
        <div 
          onClick={() => setShowOptions(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950/95 border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl divide-y divide-white/5 text-xs text-center"
          >
            {isOwner && (
              <button
                onClick={() => {
                  setShowOptions(false);
                  setIsEditOpen(true);
                }}
                className="w-full py-3.5 px-4 font-semibold text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-pink-400" />
                <span>Edit Post & Soundtrack</span>
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => {
                  setShowOptions(false);
                  setIsDeleteOpen(true);
                }}
                className="w-full py-3.5 px-4 font-bold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Post</span>
              </button>
            )}

            <button
              onClick={() => {
                setShowOptions(false);
                handleOpenShare();
              }}
              className="w-full py-3.5 px-4 font-semibold text-pink-400 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Share to...</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full py-3.5 px-4 font-semibold text-blue-400 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              {copiedLink ? 'Link Copied!' : 'Copy Link'}
            </button>

            <button
              onClick={() => setShowOptions(false)}
              className="w-full py-3.5 px-4 text-zinc-400 hover:text-white hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      <EditPostModal
        post={post}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Post?"
        description="Are you sure you want to delete this post? This cannot be undone."
        confirmLabel="Delete Post"
        onConfirm={async () => {
          await deletePost(post.id);
        }}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};