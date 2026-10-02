import React, { useState } from 'react';
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
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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

  if (!currentUser) return null;

  // Edit form state
  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editWebsite, setEditWebsite] = useState(currentUser.website || '');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);

  // Filter posts
  const userPosts = posts.filter(p => p.user.id === currentUser.id);
  const savedPosts = posts.filter(p => p.isSaved);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCurrentUser({
      name: editName,
      bio: editBio,
      website: editWebsite,
      avatar: editAvatar
    });
    setIsEditModalOpen(false);
  };

  const userStoryIdx = stories.findIndex(s => s.user.id === currentUser.id);
  const hasActiveStory = userStoryIdx >= 0 && stories[userStoryIdx].slides.length > 0;

  return (
    <div className="max-w-4xl mx-auto py-6 px-3 sm:px-6 space-y-8 animate-fade-in text-white select-none">
      {/* 1. Celestial Profile Header Card */}
      <div className="aerogel-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <header className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-12 relative z-10">
          {/* Avatar with Celestial Story Ring */}
          <div 
            onClick={() => {
              if (hasActiveStory) openStoryViewer(userStoryIdx);
            }}
            className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-[3px] transition-transform duration-300 flex-shrink-0 shadow-2xl ${
              hasActiveStory 
                ? 'bg-gradient-cosmic cursor-pointer hover:scale-105 shadow-[0_0_25px_rgba(236,72,153,0.4)]' 
                : 'border border-white/20'
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
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
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
                {currentUser.bio || 'Orbit creator on Social Sphere ✨'}
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
          <span>Reels ({reels.length})</span>
        </button>
      </div>

      {/* 3. Grid Display */}
      <div>
        {activeSubTab === 'posts' && (
          <div>
            {userPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {userPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => openPostDetail(post)}
                    className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group aerogel-card border border-white/10"
                  >
                    <img
                      src={post.media[0]?.url}
                      alt="User post"
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${post.media[0]?.filter || ''}`}
                    />

                    {/* Soundtrack badge */}
                    {post.songTitle && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] text-white">
                        <Music className="w-2.5 h-2.5 text-pink-400 animate-pulse" />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white font-bold text-xs backdrop-blur-[2px]">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                        <span>{post.likesCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 fill-white text-white" />
                        <span>{post.comments.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 aerogel-card rounded-3xl p-8 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                  <Grid className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No Orbits Published</h3>
                  <p className="text-xs text-zinc-400">When you share photos or reels with soundtracks, they appear on your profile.</p>
                </div>
                <button
                  onClick={() => setIsCreatePostOpen(true)}
                  className="px-5 py-2.5 bg-gradient-cosmic text-white text-xs font-bold rounded-2xl shadow-lg shadow-pink-500/20 hover:opacity-95"
                >
                  Create First Post
                </button>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'saved' && (
          <div>
            {savedPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {savedPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => openPostDetail(post)}
                    className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group aerogel-card border border-white/10"
                  >
                    <img
                      src={post.media[0]?.url}
                      alt="Saved post"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-zinc-500 aerogel-card rounded-3xl p-8 max-w-md mx-auto">
                <Bookmark className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                <p className="font-semibold text-zinc-300">No Saved Posts</p>
                <p className="text-zinc-500 mt-1">Save photos and videos to view them again later.</p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'reels' && (
          <div className="py-20 text-center text-xs text-zinc-500 aerogel-card rounded-3xl p-8 max-w-md mx-auto">
            <Film className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
            <p className="font-semibold text-zinc-300">Reels Sector</p>
            <p className="text-zinc-500 mt-1">Short-form video reels will be displayed here.</p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
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

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Avatar Image URL</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
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