import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Globe, 
  MessageCircle, 
  Phone, 
  Video, 
  UserPlus, 
  Check, 
  Copy, 
  ExternalLink, 
  Grid, 
  Heart, 
  Music,
  Share2
} from 'lucide-react';
import { User } from '../../types';
import { useApp } from '../../context/AppContext';

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose
}) => {
  const { 
    currentUser, 
    toggleFollowUser, 
    startConversationWithUser, 
    setActiveTab, 
    initiateCall, 
    posts, 
    openPostDetail,
    onlineUserIds 
  } = useApp();

  const [isFollowing, setIsFollowing] = useState(user?.isFollowing ?? false);
  const [followersCount, setFollowersCount] = useState(user?.followersCount ?? 0);
  const [copiedId, setCopiedId] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setIsFollowing(user.isFollowing ?? false);
      setFollowersCount(user.followersCount ?? 0);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isMe = currentUser?.id === user.id;
  const isOnline = onlineUserIds.includes(user.id);
  const isLocked = Boolean(user.isPrivate) && !isFollowing && !isMe;
  const userPosts = posts.filter(p => p.user.id === user.id);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  const handleToggleFollow = async () => {
    const nextState = await toggleFollowUser(user.id);
    setIsFollowing(nextState);
    setFollowersCount(prev => nextState ? prev + 1 : Math.max(0, prev - 1));
    showToast(nextState ? `Following @${user.username} ✨` : `Unfollowed @${user.username}`);
  };

  const handleStartChat = async () => {
    onClose();
    try {
      await startConversationWithUser(user);
      setActiveTab('messages');
    } catch (err) {
      console.error('Failed to open chat:', err);
      setActiveTab('feed');
    }
  };

  const handleCopyId = () => {
    try {
      navigator.clipboard?.writeText(user.id);
      setCopiedId(true);
      showToast(`Copied ID: ${user.id} 📋`);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      showToast('Failed to copy ID');
    }
  };

  const handleShare = async () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const link = `${origin}${pathname}?connect=true&id=${user.id}&u=${encodeURIComponent(user.username)}&n=${encodeURIComponent(user.name)}&a=${encodeURIComponent(user.avatar)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.name} (@${user.username}) on SocialSphere`,
          text: `Check out @${user.username} on SocialSphere!`,
          url: link
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(link);
      showToast('Profile link copied! 📋');
    } catch {
      showToast('Could not copy link');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none"
      onClick={onClose}
    >
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-2xl animate-bounce">
          {toastMsg}
        </div>
      )}

      <div 
        className="w-full max-w-lg bg-zinc-950/95 border border-white/15 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] animate-scale-up text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scenic Panoramic Banner */}
        <div className="relative w-full h-32 sm:h-40 overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-zinc-950 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />
          
          {/* Header Bar */}
          <div className="absolute top-3 inset-x-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold">
              <span>@{user.username}</span>
              {user.isVerified && <span className="text-cyan-400 font-bold">✓</span>}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShare}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-zinc-300 hover:text-white transition-colors border border-white/10"
                title="Share Profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-zinc-300 hover:text-white transition-colors border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Profile Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-6 pb-6 space-y-5 -mt-12 relative z-10">
          {/* Profile Header Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            {/* Avatar with Ring & Status Indicator */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-cosmic p-[2px] shadow-2xl">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover border-2 border-zinc-950"
                />
              </div>
              {isOnline && (
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>
              )}
            </div>

            {/* Quick Actions (Follow & Message & Calls) */}
            {!isMe && (
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                <button
                  onClick={handleToggleFollow}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
                    isFollowing
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10'
                      : 'bg-gradient-cosmic text-white shadow-pink-500/25 hover:opacity-95'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleStartChat}
                  className="px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>

                <button
                  onClick={() => initiateCall(user, 'audio')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                  title="Audio Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => initiateCall(user, 'video')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                  title="Video Call"
                >
                  <Video className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Names, Privacy Badge & Sphere ID */}
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                <span>{user.name}</span>
                {user.isVerified && <span className="text-cyan-400 text-sm">✓</span>}
              </h3>

              {/* Instagram-style Privacy Badge */}
              {user.isPrivate ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Private Account</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  <Globe className="w-2.5 h-2.5" />
                  <span>Public Account</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-zinc-400 flex-wrap">
              <span>@{user.username}</span>
              <span className="text-zinc-600">•</span>
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-mono text-cyan-300 transition-colors"
                title="Copy Sphere ID"
              >
                <span>ID: {user.id}</span>
                {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            {/* Bio & Link */}
            {user.bio && (
              <p className="text-xs text-zinc-300 pt-1 leading-relaxed whitespace-pre-line">
                {user.bio}
              </p>
            )}

            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline inline-flex items-center gap-1 text-xs font-semibold pt-0.5"
              >
                <ExternalLink className="w-3 h-3" />
                <span>{user.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-center text-xs">
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <span className="font-extrabold text-white text-sm block">
                {userPosts.length || user.postsCount || 0}
              </span>
              <span className="text-[11px] text-zinc-400">Posts</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <span className="font-extrabold text-white text-sm block">
                {followersCount.toLocaleString()}
              </span>
              <span className="text-[11px] text-zinc-400">Followers</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <span className="font-extrabold text-white text-sm block">
                {(user.followingCount || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-zinc-400">Following</span>
            </div>
          </div>

          {/* CONTENT SECTION: Locked Private Account Screen OR Posts Grid */}
          {isLocked ? (
            /* Classic Instagram Locked Screen */
            <div className="py-10 px-4 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center space-y-3.5 my-2">
              <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center text-zinc-300 bg-white/5 shadow-inner">
                <Lock className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white tracking-tight">This Account is Private</h4>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  Follow this account to see their photos, reels, and stories.
                </p>
              </div>
              <button
                onClick={handleToggleFollow}
                className="mt-1 px-6 py-2.5 rounded-xl bg-gradient-cosmic text-white text-xs font-bold shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Follow to Unlock</span>
              </button>
            </div>
          ) : (
            /* Unlocked Posts Grid */
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <Grid className="w-3.5 h-3.5 text-pink-400" />
                <span>Posts ({userPosts.length})</span>
              </div>

              {userPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {userPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => {
                        onClose();
                        openPostDetail(post);
                      }}
                      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-zinc-900 border border-white/5"
                    >
                      <img
                        src={post.media[0]?.url || ''}
                        alt={post.caption}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {post.media.length > 1 && (
                        <span className="absolute top-1.5 right-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                          1/{post.media.length}
                        </span>
                      )}
                      {post.songTitle && (
                        <span className="absolute top-1.5 left-1.5 bg-black/60 p-1 rounded-full text-pink-400">
                          <Music className="w-2.5 h-2.5" />
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-white" />
                          {post.likesCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 space-y-2">
                  <Grid className="w-10 h-10 stroke-[1.5] text-zinc-600 mx-auto" />
                  <p className="text-xs font-bold text-zinc-300">No Posts Yet</p>
                  <p className="text-[11px] text-zinc-500">
                    When @{user.username} shares moments or transmissions, they will appear here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
