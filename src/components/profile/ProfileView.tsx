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
  Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
    setIsCreatePostOpen 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'saved' | 'reels'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarSheetOpen, setIsAvatarSheetOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!currentUser) return null;

  // Edit form state
  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editWebsite, setEditWebsite] = useState(currentUser.website || '');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
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
      avatar: editAvatar
    });
    setIsEditModalOpen(false);
    showToast('Profile updated! ✨');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setEditAvatar(base64);
      await updateCurrentUser({ avatar: base64 });
      setIsAvatarSheetOpen(false);
      showToast('Profile picture updated! 📸');
    };
    reader.readAsDataURL(file);
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
    <div className="max-w-4xl mx-auto py-6 px-3 sm:px-6 space-y-8 animate-fade-in text-white select-none">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-2xl animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Hidden File Picker */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* 1. Celestial Profile Header Card */}
      <div className="aerogel-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <header className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-12 relative z-10">
          {/* Avatar with Celestial Story Ring & Camera Upload Badge */}
          <div className="relative group/avatar">
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
                  : 'bg-gradient-to-tr from-pink-500/40 via-purple-500/40 to-cyan-500/40'
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2px]">
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
              className="absolute bottom-1 right-1 z-20 w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg border-2 border-zinc-950 hover:scale-110 active:scale-95 transition-all"
              title="Change profile photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Details & Stats */}
          <div className="flex-1 space-y-4 text-center sm:text-left">
            {/* Top Row: Username & Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-xl font-black flex items-center justify-center sm:justify-start gap-2">
                {currentUser.username}
                {currentUser.isVerified && (
                  <span className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center text-[10px] text-white">
                    ✓
                  </span>
                )}
              </h2>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
                >
                  Edit profile
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    showToast('Profile link copied! 📋');
                  }}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
                >
                  Share profile
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 transition-colors flex items-center gap-1"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>

            {/* Middle Row: Glass Metrics Counters */}
            <div className="flex items-center justify-center sm:justify-start gap-6 text-sm">
              <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-center">
                <span className="font-extrabold text-white mr-1.5">{userPosts.length}</span>
                <span className="text-zinc-400 text-xs font-medium">posts</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-center">
                <span className="font-extrabold text-white mr-1.5">{currentUser.followersCount.toLocaleString()}</span>
                <span className="text-zinc-400 text-xs font-medium">followers</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-center">
                <span className="font-extrabold text-white mr-1.5">{currentUser.followingCount.toLocaleString()}</span>
                <span className="text-zinc-400 text-xs font-medium">following</span>
              </div>
            </div>

            {/* Bottom Row: Name, Bio & Link */}
            <div className="space-y-1 text-xs">
              <p className="font-bold text-white text-sm">{currentUser.name}</p>
              <p className="text-zinc-300 whitespace-pre-line leading-relaxed max-w-md">
                {currentUser.bio || 'Creator on Social Sphere ✨'}
              </p>
              {currentUser.website && (
                <a
                  href={currentUser.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold pt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {currentUser.website.replace('https://', '')}
                </a>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* 2. Sub-Tabs Header */}
      <div className="flex items-center justify-center gap-8 border-b border-white/10 text-xs font-bold uppercase tracking-wider">
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
      </div>

      {/* 3. Grid Display */}
      {activeSubTab === 'posts' && (
        userPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {userPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => openPostDetail(post)}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-zinc-950 border border-white/5"
              >
                <img
                  src={post.media[0]?.url || ''}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {post.songTitle && (
                  <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full backdrop-blur-md">
                    <Music className="w-3 h-3 text-pink-400 animate-pulse" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs backdrop-blur-[2px]">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{post.likesCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-3">
            <p className="text-zinc-400 text-xs">No posts uploaded yet</p>
            <button
              onClick={() => setIsCreatePostOpen(true)}
              className="px-5 py-2 bg-gradient-cosmic text-white text-xs font-bold rounded-2xl shadow-lg hover:opacity-90"
            >
              Create First Post
            </button>
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
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-zinc-950 border border-white/5"
              >
                <img
                  src={post.media[0]?.url || ''}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs backdrop-blur-[2px]">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{post.likesCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-2">
            <Bookmark className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-zinc-400 text-xs">Saved posts will appear here</p>
          </div>
        )
      )}

      {activeSubTab === 'reels' && (
        userReels.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {userReels.map((reel) => (
              <div
                key={reel.id}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group bg-zinc-950 border border-white/5"
              >
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs backdrop-blur-[2px]">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{reel.likesCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-2">
            <Film className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-zinc-400 text-xs">Your reels will appear here</p>
          </div>
        )
      )}

      {/* Instagram-Style Avatar Action Sheet Modal */}
      {isAvatarSheetOpen && (
        <div 
          onClick={() => setIsAvatarSheetOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-sm bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-3 shadow-2xl text-center animate-slideUp"
          >
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto sm:hidden mb-2" />
            
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto border-2 border-pink-500 p-0.5">
              <img src={currentUser.avatar} alt="Current Avatar" className="w-full h-full rounded-full object-cover" />
            </div>

            <h3 className="font-bold text-sm text-white">Change Profile Photo</h3>
            <p className="text-xs text-zinc-400">Choose a new photo from your device or pick a cosmic avatar</p>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-transform"
              >
                <Upload className="w-4 h-4" />
                <span>Upload from Device / Camera</span>
              </button>

              <button
                onClick={() => {
                  setIsAvatarSheetOpen(false);
                  setIsPresetModalOpen(true);
                }}
                className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-750 text-white font-semibold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors border border-zinc-700/60"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Choose Cosmic Preset</span>
              </button>

              <button
                onClick={handleRemovePhoto}
                className="w-full py-3 px-4 text-rose-400 hover:bg-rose-500/10 font-semibold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Current Photo</span>
              </button>

              <button
                onClick={() => setIsAvatarSheetOpen(false)}
                className="w-full py-2.5 px-4 text-zinc-400 hover:text-white font-medium text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cosmic Preset Avatars Picker Modal */}
      {isPresetModalOpen && (
        <div 
          onClick={() => setIsPresetModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-scaleUp"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Choose Cosmic Avatar</span>
              </h3>
              <button onClick={() => setIsPresetModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 py-2">
              {COSMIC_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(av)}
                  className={`relative aspect-square rounded-2xl overflow-hidden p-0.5 border-2 transition-transform hover:scale-105 active:scale-95 ${
                    currentUser.avatar === av ? 'border-pink-500 shadow-md shadow-pink-500/30' : 'border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  <img src={av} alt={`Avatar ${idx}`} className="w-full h-full rounded-xl object-cover" />
                  {currentUser.avatar === av && (
                    <div className="absolute inset-0 bg-pink-500/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsPresetModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Details Modal */}
      {isEditModalOpen && (
        <div 
          onClick={() => setIsEditModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-pink-400" />
                <span>Edit Profile</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar Row inside Edit Modal */}
            <div className="flex items-center gap-4 p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.username} 
                className="w-14 h-14 rounded-full object-cover border border-zinc-700" 
              />
              <div>
                <p className="text-xs font-bold text-white">@{currentUser.username}</p>
                <button
                  type="button"
                  onClick={() => setIsAvatarSheetOpen(true)}
                  className="text-xs font-bold text-pink-400 hover:text-pink-300 mt-0.5 flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change photo</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-pink-500/50 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Website</label>
                <input
                  type="text"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500/50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white font-bold bg-gradient-cosmic shadow-lg shadow-pink-500/20 hover:opacity-95"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
