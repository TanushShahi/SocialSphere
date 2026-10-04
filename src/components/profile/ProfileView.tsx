import React, { useState, useRef } from 'react';
import { 
  Grid, 
  Bookmark, 
  Film, 
  Settings, 
  Heart, 
  MessageCircle, 
  Plus, 
  X, 
  ExternalLink, 
  LogOut, 
  Music, 
  Sparkles, 
  Edit3,
  Camera,
  Upload,
  Trash2,
  Check,
  Share2,
  ShieldAlert,
  Globe,
  Users,
  Copy,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FollowListModal } from './FollowListModal';
import { BlockedAccountsModal } from './BlockedAccountsModal';
import { compressImage } from '../../utils/imageCompressor';

const COSMIC_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
];

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80';

export const ProfileView: React.FC = () => {
  const { 
    currentUser, 
    updateCurrentUser, 
    posts, 
    reels, 
    openPostDetail, 
    openStoryViewer, 
    stories, 
    logout, 
    setIsCreatePostOpen,
    setActiveTab
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'reels' | 'saved' | 'worlds'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarSheetOpen, setIsAvatarSheetOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalInitialTab, setFollowModalInitialTab] = useState<'followers' | 'following'>('followers');
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Cover Banner state
  const [coverBanner, setCoverBanner] = useState<string>(() => {
    return localStorage.getItem('sphere_cover_banner') || DEFAULT_BANNER;
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  if (!currentUser) return null;

  // Edit form state
  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editWebsite, setEditWebsite] = useState(currentUser.website || '');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [editIsPrivate, setEditIsPrivate] = useState<boolean>(currentUser.isPrivate ?? false);

  const handleTogglePrivacyQuick = async () => {
    const nextPrivacy = !currentUser.isPrivate;
    setEditIsPrivate(nextPrivacy);
    await updateCurrentUser({ isPrivate: nextPrivacy });
    showToast(nextPrivacy ? 'Account switched to Private 🔒' : 'Account switched to Public 🌐');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    if (!currentUser?.id) return;
    try {
      navigator.clipboard?.writeText(currentUser.id);
      setCopiedId(true);
      showToast(`Copied Sphere ID: ${currentUser.id} 📋`);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      showToast('Failed to copy ID');
    }
  };

  const handleShareProfile = async () => {
    if (!currentUser) return;
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const connectUrl = `${origin}${pathname}?connect=true&id=${currentUser.id}&u=${encodeURIComponent(currentUser.username)}&n=${encodeURIComponent(currentUser.name)}&a=${encodeURIComponent(currentUser.avatar)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentUser.name} on Social Sphere`,
          text: `Connect with me on Social Sphere! My Sphere ID is ${currentUser.id}`,
          url: connectUrl
        });
        showToast('Profile shared! 🚀');
        return;
      } catch {
        // User cancelled or share dismissed
      }
    }

    try {
      await navigator.clipboard.writeText(connectUrl);
      showToast('Profile connect link copied! 📋 Send it to your friend');
    } catch {
      showToast('Could not copy link');
    }
  };

  // Filter posts
  const userPosts = posts.filter(p => p.user.id === currentUser.id);
  const savedPosts = posts.filter(p => p.isSaved);
  const userReels = reels.filter(r => r.user.id === currentUser.id);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCurrentUser({
      name: editName,
      bio: editBio,
      website: editWebsite,
      avatar: editAvatar,
      isPrivate: editIsPrivate
    });
    setIsEditModalOpen(false);
    showToast('Profile updated! ✨');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }

    try {
      const compressed = await compressImage(file, 400, 400, 0.85);
      setEditAvatar(compressed);
      await updateCurrentUser({ avatar: compressed });
      setIsAvatarSheetOpen(false);
      showToast('Profile picture updated! 📸');
    } catch {
      showToast('Failed to upload image');
    }
    e.target.value = '';
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 1280, 600, 0.8);
      setCoverBanner(compressed);
      localStorage.setItem('sphere_cover_banner', compressed);
      showToast('Cover banner updated! 🏔️');
    } catch {
      showToast('Failed to update banner');
    }
    e.target.value = '';
  };

  const handleSelectPreset = async (avatarUrl: string) => {
    setEditAvatar(avatarUrl);
    await updateCurrentUser({ avatar: avatarUrl });
    setIsPresetModalOpen(false);
    setIsAvatarSheetOpen(false);
    showToast('Cosmic avatar applied! 🌌');
  };

  const handleRemovePhoto = async () => {
    const defaultAvatar = COSMIC_AVATARS[7];
    setEditAvatar(defaultAvatar);
    await updateCurrentUser({ avatar: defaultAvatar });
    setIsAvatarSheetOpen(false);
    showToast('Photo removed');
  };

  const userStoryIdx = stories.findIndex(s => s.user.id === currentUser.id);
  const hasActiveStory = userStoryIdx >= 0 && stories[userStoryIdx].slides.length > 0;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 sm:space-y-8 animate-fade-in text-white select-none">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-2xl animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Hidden File Pickers */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleFileUpload} 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={bannerInputRef} 
        accept="image/*" 
        onChange={handleBannerUpload} 
        className="hidden" 
      />

      {/* 1. Celestial Profile Card with Scenic Mountain Banner */}
      <div className="aerogel-card rounded-3xl overflow-hidden relative shadow-2xl">
        {/* Scenic Panoramic Mountain Cover Banner (Mockup style) */}
        <div className="relative w-full h-44 sm:h-56 overflow-hidden bg-zinc-900 group/banner">
          <img
            src={coverBanner}
            alt="Scenic Mountain Banner"
            className="w-full h-full object-cover transition-transform duration-700 group-hover/banner:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Banner edit button */}
          <button
            onClick={() => bannerInputRef.current?.click()}
            className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
            title="Change cover photo"
          >
            <Camera className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Change Cover</span>
          </button>
        </div>

        {/* Content Area overlapping banner */}
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 relative">
          <header className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 -mt-16 sm:-mt-20 relative z-10">
            {/* Avatar with Celestial Story Ring & Camera Upload Badge */}
            <div className="relative group/avatar flex-shrink-0">
              <div 
                onClick={() => {
                  if (hasActiveStory) {
                    openStoryViewer(userStoryIdx);
                  } else {
                    setIsAvatarSheetOpen(true);
                  }
                }}
                className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-[3px] transition-transform duration-300 flex-shrink-0 shadow-2xl cursor-pointer hover:scale-105 ${
                  hasActiveStory 
                    ? 'bg-gradient-cosmic shadow-[0_0_25px_rgba(236,72,153,0.4)]' 
                    : 'bg-gradient-to-tr from-pink-500/80 via-purple-500/80 to-cyan-500/80 shadow-[0_0_20px_rgba(236,72,153,0.25)]'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2.5px]">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                {hasActiveStory && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>
                )}
              </div>

              {/* Instagram Camera Icon Overlay Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAvatarSheetOpen(true);
                }}
                className="absolute bottom-1 right-1 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg border-2 border-zinc-950 hover:scale-110 active:scale-95 transition-all"
                title="Change profile photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Details & Stats */}
            <div className="flex-1 space-y-3.5 text-center sm:text-left pt-2 sm:pt-4 w-full">
              {/* Top Row: User Names & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black flex items-center justify-center sm:justify-start gap-2">
                    {currentUser.name}
                    {currentUser.isVerified && (
                      <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold" title="Verified">
                        ✓
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 flex-wrap">
                    <p className="text-xs text-zinc-400 font-medium">@{currentUser.username}</p>
                    <span className="text-zinc-600">•</span>
                    {/* Unique Sphere ID with 1-tap Copy */}
                    <button
                      onClick={handleCopyId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] text-cyan-300 font-mono transition-all group/id active:scale-95 shadow-sm"
                      title="Click to copy your unique Sphere ID to share with friends"
                    >
                      <span className="text-[10px] text-zinc-400 font-sans font-semibold">Sphere ID:</span>
                      <span className="truncate max-w-[130px] sm:max-w-[200px]">{currentUser.id}</span>
                      {copiedId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 animate-scale-in" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover/id:text-white flex-shrink-0" />
                      )}
                    </button>

                    <span className="text-zinc-600">•</span>
                    {/* 1-tap Account Privacy Badge & Quick Toggle */}
                    <button
                      onClick={handleTogglePrivacyQuick}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all active:scale-95 shadow-sm ${
                        currentUser.isPrivate
                          ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300'
                          : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300'
                      }`}
                      title="Click to toggle between Public & Private account"
                    >
                      {currentUser.isPrivate ? (
                        <>
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Private Account</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3 text-emerald-400" />
                          <span>Public Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2 bg-gradient-cosmic hover:opacity-95 text-xs font-bold rounded-xl text-white shadow-md shadow-pink-500/20 transition-all active:scale-95"
                  >
                    Edit Profile
                  </button>
                  <button 
                    onClick={handleShareProfile}
                    className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl border border-white/10 transition-colors flex items-center gap-1.5"
                    title="Share profile connect link"
                  >
                    <Share2 className="w-3.5 h-3.5 text-pink-400" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => setIsBlockedModalOpen(true)}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl border border-white/10 transition-colors flex items-center gap-1.5 text-zinc-300 hover:text-white"
                    title="Blocked Accounts"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                  <button
                    onClick={logout}
                    className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 transition-colors flex items-center gap-1"
                    title="Log Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Stats Row (Mockup Style: 128 Posts | 12.4K Followers | 420 Following) */}
              <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs select-none">
                <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-center min-w-[75px]">
                  <span className="font-extrabold text-white text-sm block">{userPosts.length}</span>
                  <span className="text-zinc-400 text-[11px] font-medium">Posts</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFollowModalInitialTab('followers');
                    setIsFollowModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 hover:border-white/15 text-center transition-all cursor-pointer min-w-[85px] group"
                  title="View followers"
                >
                  <span className="font-extrabold text-white text-sm block group-hover:text-pink-400 transition-colors">
                    {currentUser.followersCount.toLocaleString()}
                  </span>
                  <span className="text-zinc-400 text-[11px] font-medium">Followers</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFollowModalInitialTab('following');
                    setIsFollowModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 hover:border-white/15 text-center transition-all cursor-pointer min-w-[85px] group"
                  title="View following"
                >
                  <span className="font-extrabold text-white text-sm block group-hover:text-pink-400 transition-colors">
                    {currentUser.followingCount.toLocaleString()}
                  </span>
                  <span className="text-zinc-400 text-[11px] font-medium">Following</span>
                </button>
              </div>

              {/* User Bio & Link */}
              <div className="space-y-1.5 text-xs text-left max-w-xl">
                <p className="text-zinc-200 whitespace-pre-line leading-relaxed">
                  {currentUser.bio || '✨ Visual Storyteller & World Explorer 📸 Creating moments that inspire'}
                </p>
                {currentUser.website && (
                  <a
                    href={currentUser.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{currentUser.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* 2. Content Tabs (Posts | Reels | Saved | Worlds) */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 border-b border-white/10 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveSubTab('posts')}
          className={`flex items-center gap-2 py-3 border-b-2 transition-all ${
            activeSubTab === 'posts'
              ? 'border-pink-500 text-white shadow-[0_4px_12px_rgba(236,72,153,0.3)]'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts ({userPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reels')}
          className={`flex items-center gap-2 py-3 border-b-2 transition-all ${
            activeSubTab === 'reels'
              ? 'border-pink-500 text-white shadow-[0_4px_12px_rgba(236,72,153,0.3)]'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Reels ({userReels.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('saved')}
          className={`flex items-center gap-2 py-3 border-b-2 transition-all ${
            activeSubTab === 'saved'
              ? 'border-pink-500 text-white shadow-[0_4px_12px_rgba(236,72,153,0.3)]'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved ({savedPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('worlds')}
          className={`flex items-center gap-2 py-3 border-b-2 transition-all ${
            activeSubTab === 'worlds'
              ? 'border-pink-500 text-white shadow-[0_4px_12px_rgba(236,72,153,0.3)]'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Worlds</span>
        </button>
      </div>

      {/* 3. Grid Display based on Active Sub-Tab */}
      {activeSubTab === 'posts' && (
        userPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {userPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => openPostDetail(post)}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-zinc-950 border border-white/5 shadow-md"
              >
                <img
                  src={post.media[0]?.url || ''}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {post.media.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                    <span>1/{post.media.length}</span>
                  </div>
                )}
                {post.songTitle && (
                  <div className="absolute top-2 left-2 bg-black/60 p-1.5 rounded-full backdrop-blur-md">
                    <Music className="w-3 h-3 text-pink-400 animate-pulse" />
                  </div>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs backdrop-blur-[2px]">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-white" />
                    {post.likesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    {post.comments.length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 aerogel-card rounded-3xl space-y-3">
            <Grid className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Posts Yet</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Share your moments, photos, and musical transmissions with your world.
            </p>
            <button
              onClick={() => setIsCreatePostOpen(true)}
              className="mt-2 px-5 py-2 rounded-xl bg-gradient-cosmic text-white text-xs font-bold shadow-lg shadow-pink-500/20 active:scale-95"
            >
              Create Post
            </button>
          </div>
        )
      )}

      {activeSubTab === 'reels' && (
        userReels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
            {userReels.map((reel) => (
              <div
                key={reel.id}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group bg-zinc-950 border border-white/5 shadow-md"
              >
                <video
                  src={reel.videoUrl}
                  poster={reel.thumbnailUrl}
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-white text-xs font-bold drop-shadow-md">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>{reel.likesCount}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 aerogel-card rounded-3xl space-y-3">
            <Film className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Reels Yet</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Record short celestial clips and soundtrack moments to appear here.
            </p>
          </div>
        )
      )}

      {activeSubTab === 'saved' && (
        savedPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {savedPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => openPostDetail(post)}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-zinc-950 border border-white/5 shadow-md"
              >
                <img
                  src={post.media[0]?.url || ''}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 aerogel-card rounded-3xl space-y-3">
            <Bookmark className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Saved Posts</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Save posts that inspire you to easily find them again.
            </p>
          </div>
        )
      )}

      {activeSubTab === 'worlds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Your Worlds & Communities</span>
            </h3>
            <button
              onClick={() => setActiveTab('worlds')}
              className="text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors"
            >
              Explore All Worlds →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                id: 'travel-lovers',
                name: 'Travel Lovers',
                members: '124.5k',
                image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
                desc: 'Backpackers, island hoppers, and culture discoverers worldwide.'
              },
              {
                id: 'tech-hub',
                name: 'Tech & Future Hub',
                members: '98.2k',
                image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
                desc: 'AI, web innovations, gadgets, and next-gen tech discussions.'
              }
            ].map(w => (
              <div key={w.id} className="aerogel-card rounded-2xl overflow-hidden p-4 flex gap-4 items-center">
                <img src={w.image} alt={w.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white text-xs truncate">{w.name}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">{w.desc}</p>
                  <p className="text-[10px] text-cyan-400 font-semibold mt-1">{w.members} members • Joined</p>
                </div>
                <button
                  onClick={() => setActiveTab('worlds')}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div 
          onClick={() => setIsEditModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="aerogel-card rounded-3xl max-w-md w-full p-6 space-y-5 border border-white/15 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Edit Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Website URL</label>
                <input
                  type="url"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Instagram-style Private Account Toggle */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      editIsPrivate ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {editIsPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">Private Account</h4>
                      <p className="text-[10px] text-zinc-400">
                        {editIsPrivate ? 'Only approved followers can see photos' : 'Anyone can view photos and reels'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setEditIsPrivate(!editIsPrivate)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      editIsPrivate ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-zinc-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      editIsPrivate ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed pt-0.5">
                  {editIsPrivate 
                    ? '🔒 When your account is private, non-followers see "This Account is Private" and cannot view your posts, stories, or reels until you approve them.'
                    : '🌐 When your account is public, your profile, photos, and reels can be seen by anyone on SocialSphere.'}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-cosmic text-white font-bold shadow-lg shadow-pink-500/20 active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avatar Action Sheet */}
      {isAvatarSheetOpen && (
        <div 
          onClick={() => setIsAvatarSheetOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="aerogel-card rounded-3xl max-w-sm w-full p-5 space-y-3 text-center border border-white/15 shadow-2xl"
          >
            <h3 className="font-bold text-white text-base pb-2 border-b border-white/10">Change Profile Photo</h3>

            <button
              onClick={() => {
                setIsAvatarSheetOpen(false);
                fileInputRef.current?.click();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-cosmic text-white font-bold text-xs shadow-md shadow-pink-500/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Photo</span>
            </button>

            <button
              onClick={() => {
                setIsAvatarSheetOpen(false);
                setIsPresetModalOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 font-semibold text-xs border border-white/10 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Choose Cosmic Avatar</span>
            </button>

            <button
              onClick={handleRemovePhoto}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs border border-rose-500/20 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Current Photo</span>
            </button>

            <button
              onClick={() => setIsAvatarSheetOpen(false)}
              className="w-full py-2 text-zinc-400 hover:text-white text-xs font-semibold pt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Preset Cosmic Avatars Picker */}
      {isPresetModalOpen && (
        <div 
          onClick={() => setIsPresetModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="aerogel-card rounded-3xl max-w-md w-full p-6 space-y-4 border border-white/15 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-white text-base">Select Celestial Avatar</h3>
              <button onClick={() => setIsPresetModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 py-2">
              {COSMIC_AVATARS.map((url, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectPreset(url)}
                  className="aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 border-white/10 hover:border-pink-500 transition-all hover:scale-105"
                >
                  <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Follow List Modal */}
      {isFollowModalOpen && (
        <FollowListModal
          isOpen={isFollowModalOpen}
          targetUser={currentUser}
          initialTab={followModalInitialTab}
          onClose={() => setIsFollowModalOpen(false)}
        />
      )}

      {/* Blocked Accounts Modal */}
      {isBlockedModalOpen && (
        <BlockedAccountsModal
          isOpen={isBlockedModalOpen}
          onClose={() => setIsBlockedModalOpen(false)}
        />
      )}
    </div>
  );
};
