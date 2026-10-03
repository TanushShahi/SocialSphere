import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, UserCheck, UserPlus, Users } from 'lucide-react';
import { User } from '../../types';
import { useApp } from '../../context/AppContext';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'followers' | 'following';
  targetUser: User;
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'followers',
  targetUser
}) => {
  const { getFollowers, getFollowing, toggleFollowUser, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery('');
      loadData();
    }
  }, [isOpen, initialTab, targetUser.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fList, fgList] = await Promise.all([
        getFollowers(targetUser.id),
        getFollowing(targetUser.id)
      ]);
      setFollowers(fList);
      setFollowing(fgList);
    } catch (err) {
      console.error('Failed to load follow lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async (userId: string) => {
    const isNowFollowing = await toggleFollowUser(userId);
    setFollowers(prev =>
      prev.map(u => (u.id === userId ? { ...u, isFollowing: isNowFollowing } : u))
    );
    setFollowing(prev =>
      prev.map(u => (u.id === userId ? { ...u, isFollowing: isNowFollowing } : u))
    );
  };

  const currentList = activeTab === 'followers' ? followers : following;

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentList;
    return currentList.filter(
      u => u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
    );
  }, [currentList, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      <div 
        className="w-full max-w-md bg-zinc-950/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="w-8" />
          <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
            <span>@{targetUser.username}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons (Followers / Following) */}
        <div className="flex border-b border-white/10 bg-white/[0.02]">
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'followers'
                ? 'border-pink-500 text-white bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Followers</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
              {followers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'following'
                ? 'border-pink-500 text-white bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Following</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
              {following.length}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-white/5 bg-zinc-900/40">
          <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-2xl px-3.5 py-2 text-xs">
            <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              placeholder={`Search in ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-zinc-500 w-full focus:outline-none text-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* User List Feed */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 min-h-[260px] max-h-[420px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-xs space-y-2">
              <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading connections...</span>
            </div>
          ) : filteredList.length > 0 ? (
            filteredList.map((user) => {
              const isMe = currentUser && user.id === currentUser.id;

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-full bg-gradient-cosmic p-[1.5px] flex-shrink-0">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover border border-black"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-white text-xs truncate">
                          {user.username}
                        </span>
                        {user.isVerified && (
                          <span className="w-3.5 h-3.5 bg-cyan-500 rounded-full flex items-center justify-center text-[9px] text-white">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-[11px] truncate">
                        {user.name}
                      </p>
                    </div>
                  </div>

                  {/* Follow / Unfollow Button */}
                  {!isMe ? (
                    <button
                      onClick={() => handleToggleFollow(user.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        user.isFollowing
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10'
                          : 'bg-gradient-cosmic text-white shadow-md shadow-pink-500/25 hover:opacity-95 active:scale-95'
                      }`}
                    >
                      {user.isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-zinc-500 px-3 py-1 bg-white/5 rounded-xl border border-white/5">
                      You
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500 space-y-2">
              <Users className="w-10 h-10 stroke-[1.5] text-zinc-600" />
              <p className="text-xs font-semibold text-zinc-400">
                {searchQuery ? 'No matching accounts found' : activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </p>
              <p className="text-[11px] text-zinc-500 max-w-xs">
                {activeTab === 'followers'
                  ? 'When people follow this account, they will appear here.'
                  : 'Accounts followed by this user will appear here.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
