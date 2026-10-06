import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  UserPlus, 
  Check, 
  MessageCircle, 
  Users, 
  Sparkles, 
  Lock, 
  Globe 
} from 'lucide-react';
import { User } from '../../types';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';

interface FollowersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialType?: 'followers' | 'following';
  username: string;
}

export const FollowersListModal: React.FC<FollowersListModalProps> = ({
  isOpen,
  onClose,
  userId,
  initialType = 'followers',
  username
}) => {
  const { 
    currentUser, 
    toggleFollowUser, 
    startConversationWithUser, 
    setActiveTab, 
    openUserProfile 
  } = useApp();

  const [activeTab, setActiveTabType] = useState<'followers' | 'following'>(initialType);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setActiveTabType(initialType);
  }, [initialType]);

  useEffect(() => {
    if (!isOpen || !userId) return;

    let isMounted = true;
    setLoading(true);

    const loadUsers = async () => {
      try {
        const res = activeTab === 'followers'
          ? await api.users.getFollowers(userId)
          : await api.users.getFollowing(userId);

        if (isMounted) {
          setUsers(res.users || []);
        }
      } catch (err) {
        console.error('Failed to load followers/following:', err);
        if (isMounted) setUsers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId, activeTab]);

  if (!isOpen) return null;

  const filteredUsers = users.filter(u => {
    if (!u) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q))
    );
  });

  const handleFollowToggle = async (targetUser: User, e: React.MouseEvent) => {
    e.stopPropagation();
    if (actionLoadingId) return;
    setActionLoadingId(targetUser.id);
    try {
      const isNowFollowing = await toggleFollowUser(targetUser.id);
      setUsers(prev =>
        prev.map(u => (u.id === targetUser.id ? { ...u, isFollowing: isNowFollowing } : u))
      );
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartChat = async (targetUser: User, e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    try {
      await startConversationWithUser(targetUser);
      setActiveTab('messages');
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const handleOpenProfile = (targetUser: User) => {
    onClose();
    openUserProfile(targetUser);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-zinc-950/95 border border-white/15 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col max-h-[85vh] animate-scale-up text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTabType('followers')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'followers'
                  ? 'bg-gradient-cosmic text-white shadow-md shadow-pink-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Followers
            </button>
            <button
              onClick={() => setActiveTabType('following')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'following'
                  ? 'bg-gradient-cosmic text-white shadow-md shadow-pink-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Following
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-white/10 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by username or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>
        </div>

        {/* List of Users */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-zinc-400">
              <div className="w-7 h-7 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Connecting across the Sphere...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-14 text-center space-y-3 px-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">
                {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </p>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                {activeTab === 'followers' 
                  ? `When friends follow @${username}, they will appear right here online.`
                  : `Explore and follow creators to stay updated across the Sphere.`}
              </p>
            </div>
          ) : (
            filteredUsers.map(user => {
              const isMe = currentUser?.id === user.id;

              return (
                <div
                  key={user.id}
                  onClick={() => handleOpenProfile(user)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-cosmic shadow-md">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover border border-black"
                        />
                      </div>
                    </div>

                    {/* Names & Badges */}
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white group-hover:text-pink-400 transition-colors truncate">
                          @{user.username}
                        </span>
                        {user.isVerified && <span className="text-cyan-400 text-xs">✓</span>}
                        {user.isPrivate && (
                          <span className="text-[10px] text-amber-300 font-mono flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {user.name}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    {!isMe && (
                      <>
                        <button
                          onClick={(e) => handleStartChat(user, e)}
                          className="p-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 transition-all active:scale-95 shadow-sm"
                          title="Direct Message"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleFollowToggle(user, e)}
                          disabled={actionLoadingId === user.id}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-sm ${
                            user.isFollowing
                              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10'
                              : 'bg-gradient-cosmic text-white shadow-pink-500/20 hover:opacity-95'
                          }`}
                        >
                          {user.isFollowing ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
