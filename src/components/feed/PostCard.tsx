import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Smile,
  Check,
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Edit3,
  Trash2,
  Share2,
  Disc,
  ShieldAlert
} from 'lucide-react';
import { Post } from '../../types';
import { useApp } from '../../context/AppContext';
import { DoubleTapHeart } from '../common/DoubleTapHeart';
import { EditPostModal } from '../post/EditPostModal';
import { DeleteConfirmModal } from '../post/DeleteConfirmModal';
import { formatTimeAgo } from '../../utils/timeAgo';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { 
    toggleLikePost, 
    toggleSavePost, 
    addComment, 
    openPostDetail, 
    toggleFollowUser,
    toggleBlockUser,
    deletePost,
    currentUser,
    openShareModal,
    activePlayingPostId,
    setActivePlayingPostId,
    activeStoryIndex,
    activeTab,
    selectedPostForDetail
  } = useApp();

  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isExpandedCaption, setIsExpandedCaption] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const cardRef = useRef<HTMLElement | null>(null);
  const lastTapRef = useRef<number>(0);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const isThisPostPlaying = activePlayingPostId === post.id;

  // Manage audio playback: play when active & in view, pause if stories open or tab changed
  useEffect(() => {
    if (!post.songUrl) return;

    const shouldPlay = isThisPostPlaying && 
                       activeStoryIndex === null && 
                       activeTab === 'feed' && 
                       selectedPostForDetail === null;

    if (shouldPlay) {
      if (!audioPlayerRef.current) {
        const a = new Audio(post.songUrl);
        a.volume = 0.55;
        a.loop = true;
        a.onended = () => {
          setIsPlayingAudio(false);
          setActivePlayingPostId(null);
        };
        audioPlayerRef.current = a;
      }
      audioPlayerRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(() => {
        setIsPlayingAudio(false);
      });
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsPlayingAudio(false);
    }
  }, [isThisPostPlaying, post.songUrl, activeStoryIndex, activeTab, selectedPostForDetail]);

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  // IntersectionObserver: automatically start song when post enters full view, stop when out of view
  useEffect(() => {
    if (!post.songUrl) return;
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When card is substantially in view (> 55% in viewport)
          if (entry.intersectionRatio >= 0.55) {
            if (activeStoryIndex === null && activeTab === 'feed' && selectedPostForDetail === null) {
              setActivePlayingPostId(post.id);
            }
          } else if (entry.intersectionRatio < 0.35) {
            // When scrolled out of view, stop audio if this was the playing post
            if (activePlayingPostId === post.id) {
              setActivePlayingPostId(null);
            }
          }
        });
      },
      {
        threshold: [0.3, 0.55, 0.8]
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [post.id, post.songUrl, activeStoryIndex, activeTab, selectedPostForDetail, activePlayingPostId]);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post.songUrl) return;

    if (isThisPostPlaying) {
      setActivePlayingPostId(null);
    } else {
      setActivePlayingPostId(post.id);
    }
  };

  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchDeltaX.current > 40 && currentMediaIdx > 0) {
      setCurrentMediaIdx(prev => prev - 1);
    } else if (touchDeltaX.current < -40 && currentMediaIdx < post.media.length - 1) {
      setCurrentMediaIdx(prev => prev + 1);
    }
    touchDeltaX.current = 0;
  };

  const handleMediaClick = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!post.isLiked) {
        toggleLikePost(post.id);
      }
      setShowDoubleTapHeart(true);
      setTimeout(() => setShowDoubleTapHeart(false), 900);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMediaIdx < post.media.length - 1) {
      setCurrentMediaIdx(prev => prev + 1);
    }
  };

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMediaIdx > 0) {
      setCurrentMediaIdx(prev => prev - 1);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    await addComment(post.id, commentInput);
    setCommentInput('');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
      setShowOptionsMenu(false);
    }, 1200);
  };

  const handleDeletePostConfirm = async () => {
    await deletePost(post.id);
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
  const currentMedia = post.media[currentMediaIdx] || post.media[0];

  return (
    <article ref={cardRef} className="relative max-w-[480px] mx-auto w-full mb-6 sm:mb-8 group/card select-none">
      {/* Dynamic Ambient Audio Glow behind Card */}
      {isPlayingAudio && <div className="ambient-audio-glow"></div>}

      {/* 3D Aerogel Glass Card Body */}
      <div className={`relative rounded-2xl sm:rounded-3xl p-3 sm:p-4 transition-all duration-300 ${
        isPlayingAudio ? 'aerogel-card-glow' : 'aerogel-card'
      }`}>
        {/* 1. Celestial Header */}
        {/* 1. Clean Instagram Header */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 px-1">
          <div className="flex items-center gap-3 min-w-0">
            {/* Luminous Avatar Orb */}
            <div className="relative w-10 h-10 rounded-full bg-gradient-cosmic p-[1.5px] shadow-lg shadow-pink-500/20 cursor-pointer hover:scale-105 transition-transform flex-shrink-0">
              <img 
                src={post.user.avatar} 
                alt={post.user.username} 
                className="w-full h-full rounded-full object-cover border-2 border-black"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-bold hover:underline cursor-pointer text-white truncate max-w-[130px] sm:max-w-[200px] flex items-center gap-1">
                  {post.user.username}
                  {post.user.isVerified && (
                    <span className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white font-black flex-shrink-0" title="Verified">
                      ✓
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-zinc-500 flex-shrink-0">• {formatTimeAgo(post.createdAt)}</span>

                {!isOwner && currentUser && (
                  <>
                    <span className="text-zinc-600 text-xs flex-shrink-0">•</span>
                    <button
                      onClick={() => toggleFollowUser(post.user.id)}
                      className={`text-[11px] font-semibold transition-colors flex-shrink-0 ${
                        post.user.isFollowing
                          ? 'text-zinc-400 hover:text-white'
                          : 'text-blue-400 hover:text-blue-300 font-bold'
                      }`}
                    >
                      {post.user.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </>
                )}
              </div>

              {(post.location || post.songTitle) && (
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400 min-w-0">
                  {post.location && (
                    <span className="truncate max-w-[140px] flex items-center gap-0.5">
                      <span>📍</span> {post.location}
                    </span>
                  )}
                  {post.songTitle && (
                    <button
                      type="button"
                      onClick={toggleAudio}
                      className="flex items-center gap-1 text-pink-400/90 hover:text-pink-300 transition-colors truncate max-w-[160px]"
                      title="Play / Pause song"
                    >
                      <Music className={`w-2.5 h-2.5 flex-shrink-0 ${isPlayingAudio ? 'animate-bounce text-pink-400' : 'text-zinc-400'}`} />
                      <span className="truncate">{post.songArtist ? `${post.songArtist} • ` : ''}{post.songTitle}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Options Trigger (...) */}
          <button
            onClick={() => setShowOptionsMenu(true)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors flex-shrink-0"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Media Canvas with Sliding Carousel, Holographic Vinyl Disc & Double Tap */}
        <div 
          onClick={handleMediaClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full aspect-square rounded-2xl overflow-hidden select-none cursor-pointer group/media border border-white/5 bg-zinc-950"
        >
          {/* Sliding Track for Multi-Photo Posts */}
          <div 
            className="flex w-full h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentMediaIdx * 100}%)` }}
          >
            {post.media.map((med, idx) => (
              <div key={med.id || idx} className="w-full h-full flex-shrink-0 relative">
                <img 
                  src={med.url} 
                  alt={`Post content ${idx + 1}`} 
                  className={`w-full h-full object-cover ${med.filter || ''}`}
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Instagram 1/N Badge */}
          {post.media.length > 1 && (
            <div className="absolute top-3 right-3 z-20 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider shadow-md pointer-events-none">
              {currentMediaIdx + 1}/{post.media.length}
            </div>
          )}

          {/* Floating Spinning Holographic Vinyl Disc if post has song */}
          {post.songTitle && (
            <div 
              onClick={toggleAudio}
              className="absolute bottom-3 right-3 z-20 flex items-center gap-2 group/disc"
            >
              <div 
                className={`relative w-11 h-11 rounded-full bg-zinc-950 border border-white/20 shadow-2xl p-1 flex items-center justify-center transition-all ${
                  isPlayingAudio ? 'animate-spin-slow shadow-pink-500/30' : 'hover:scale-105'
                }`}
                title={isPlayingAudio ? 'Pause soundtrack' : 'Play soundtrack'}
              >
                {/* Center Vinyl Hole */}
                <div className="w-full h-full rounded-full overflow-hidden border border-white/10 relative">
                  <img src={currentMedia?.url || ''} alt="disc" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white border border-black"></div>
                  </div>
                </div>

                {/* Floating status icon */}
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-600 border border-black flex items-center justify-center text-white shadow-md">
                  {isPlayingAudio ? (
                    <Pause className="w-2 h-2" />
                  ) : (
                    <Play className="w-2 h-2 fill-current ml-0.5" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Double Tap Floating Cosmic Heart */}
          <DoubleTapHeart show={showDoubleTapHeart} />

          {/* Carousel Arrows */}
          {post.media.length > 1 && (
            <>
              {currentMediaIdx > 0 && (
                <button
                  type="button"
                  onClick={handlePrevMedia}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity backdrop-blur-md"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {currentMediaIdx < post.media.length - 1 && (
                <button
                  type="button"
                  onClick={handleNextMedia}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity backdrop-blur-md"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Indicator dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-full backdrop-blur-md pointer-events-none">
                {post.media.map((_, i) => (
                  <div 
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentMediaIdx 
                        ? 'w-2 h-2 bg-pink-500 scale-110 shadow-sm shadow-pink-500/50' 
                        : 'w-1.5 h-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 3. Luminous Action Buttons Bar */}
        <div className="flex items-center justify-between pt-3 pb-1 px-1">
          <div className="flex items-center gap-4">
            {/* Like button */}
            <button
              onClick={() => toggleLikePost(post.id)}
              className="p-1 group active:scale-75 transition-transform"
              aria-label="Like post"
            >
              <Heart 
                className={`w-6 h-6 transition-all duration-200 ${
                  post.isLiked 
                    ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                    : 'text-zinc-300 hover:text-white stroke-[1.8]'
                }`} 
              />
            </button>

            {/* Comment button */}
            <button
              onClick={() => {
                if (commentInputRef.current) {
                  commentInputRef.current.focus();
                }
              }}
              className="p-1 text-zinc-300 hover:text-white active:scale-75 transition-transform"
              aria-label="Comment"
            >
              <MessageCircle className="w-6 h-6 stroke-[1.8]" />
            </button>

            {/* Share / Multi-channel Share */}
            <button
              onClick={handleOpenShare}
              className="p-1 text-zinc-300 hover:text-white active:scale-75 transition-transform"
              aria-label="Share"
              title="Share post"
            >
              <Send className="w-6 h-6 stroke-[1.8]" />
            </button>
          </div>

          {/* Bookmark */}
          <button
            onClick={() => toggleSavePost(post.id)}
            className="p-1 text-zinc-300 hover:text-white active:scale-75 transition-transform"
            aria-label="Save post"
          >
            <Bookmark 
              className={`w-6 h-6 transition-colors ${
                post.isSaved 
                  ? 'text-pink-400 fill-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]' 
                  : 'stroke-[1.8]'
              }`} 
            />
          </button>
        </div>

        {/* 4. Bold Likes Count Row */}
        <div className="px-1 pt-1 pb-0.5 text-xs font-bold text-white">
          {post.likesCount > 0 ? (
            <span>{post.likesCount.toLocaleString()} like{post.likesCount > 1 ? 's' : ''}</span>
          ) : (
            <span className="text-zinc-400 font-normal">Be the first to like this</span>
          )}
        </div>

        {/* 5. Caption */}
        {post.caption && (
          <div className="px-1 pt-0.5 text-xs text-zinc-200 leading-relaxed">
            <span className="font-bold text-white mr-1.5">{post.user.username}</span>
            <span>
              {isExpandedCaption || post.caption.length <= 100
                ? post.caption
                : `${post.caption.slice(0, 100)}...`}
            </span>
            {post.caption.length > 100 && (
              <button
                onClick={() => setIsExpandedCaption(!isExpandedCaption)}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 ml-1.5 font-semibold"
              >
                {isExpandedCaption ? 'less' : 'more'}
              </button>
            )}
          </div>
        )}

        {/* 6. Comments Summary */}
        {post.comments.length > 0 && (
          <button
            onClick={() => openPostDetail(post)}
            className="px-1 pt-1.5 text-[11px] text-zinc-400 hover:text-zinc-300 block font-medium"
          >
            View all {post.comments.length} comment{post.comments.length > 1 ? 's' : ''}
          </button>
        )}

        {/* 7. Inline Fast Comment Input */}
        <form 
          onSubmit={handleCommentSubmit}
          className="flex items-center gap-2 pt-2.5 mt-2 border-t border-white/5 px-1"
        >
          <input
            ref={commentInputRef}
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
          />

          {commentInput.trim().length > 0 && (
            <button
              type="submit"
              className="text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors"
            >
              Post
            </button>
          )}
        </form>
      </div>

      {/* Options Dropdown Menu Modal */}
      {showOptionsMenu && (
        <div 
          onClick={() => setShowOptionsMenu(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950/95 border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl divide-y divide-white/5 text-xs text-center"
          >
            {/* If Owner: Edit Post */}
            {isOwner && (
              <button
                onClick={() => {
                  setShowOptionsMenu(false);
                  setIsEditModalOpen(true);
                }}
                className="w-full py-3.5 px-4 font-semibold text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-pink-400" />
                <span>Edit Post & Soundtrack</span>
              </button>
            )}

            {/* If Owner: Delete Post */}
            {isOwner && (
              <button
                onClick={() => {
                  setShowOptionsMenu(false);
                  setIsDeleteModalOpen(true);
                }}
                className="w-full py-3.5 px-4 font-bold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Post</span>
              </button>
            )}

            {/* If Not Owner: Block User */}
            {!isOwner && currentUser && (
              <button
                onClick={async () => {
                  setShowOptionsMenu(false);
                  await toggleBlockUser(post.user.id);
                }}
                className="w-full py-3.5 px-4 font-bold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Block @{post.user.username}</span>
              </button>
            )}

            {/* Share to... */}
            <button
              onClick={() => {
                setShowOptionsMenu(false);
                handleOpenShare();
              }}
              className="w-full py-3.5 px-4 font-semibold text-pink-400 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Share to...</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full py-3.5 px-4 font-semibold text-blue-400 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              {copiedLink ? 'Link Copied!' : 'Copy Link'}
            </button>

            {/* Bookmark */}
            <button
              onClick={() => {
                toggleSavePost(post.id);
                setShowOptionsMenu(false);
              }}
              className="w-full py-3.5 px-4 text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              {post.isSaved ? 'Remove from Saved' : 'Save to Collection'}
            </button>

            {/* View Details */}
            <button
              onClick={() => {
                openPostDetail(post);
                setShowOptionsMenu(false);
              }}
              className="w-full py-3.5 px-4 text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              View Full Post & Comments
            </button>

            {/* Cancel */}
            <button
              onClick={() => setShowOptionsMenu(false)}
              className="w-full py-3.5 px-4 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      <EditPostModal
        post={post}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Post?"
        description="Are you sure you want to delete this post? This cannot be undone and will permanently remove all likes, comments, and media."
        confirmLabel="Delete Post"
        onConfirm={handleDeletePostConfirm}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </article>
  );
};