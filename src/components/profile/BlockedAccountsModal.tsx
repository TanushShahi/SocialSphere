import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, ShieldCheck, UserX } from 'lucide-react';
import { User } from '../../types';
import { useApp } from '../../context/AppContext';

interface BlockedAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlockedAccountsModal: React.FC<BlockedAccountsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { getBlockedUsers, toggleBlockUser } = useApp();
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBlocked();
    }
  }, [isOpen]);

  const loadBlocked = async () => {
    setLoading(true);
    try {
      const list = await getBlockedUsers();
      setBlockedUsers(list);
    } catch (err) {
      console.error('Failed to load blocked accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    await toggleBlockUser(userId);
    setBlockedUsers(prev => prev.filter(u => u.id !== userId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      <div 
        className="w-full max-w-md bg-zinc-950/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-extrabold text-sm sm:text-base">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Blocked Accounts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 min-h-[220px] max-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-xs space-y-2">
              <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading blocked list...</span>
            </div>
          ) : blockedUsers.length > 0 ? (
            blockedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-white text-xs truncate">@{user.username}</p>
                    <p className="text-zinc-400 text-[11px] truncate">{user.name}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleUnblock(user.id)}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 hover:border-white/20 flex items-center gap-1.5 flex-shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unblock</span>
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center text-zinc-500 space-y-2">
              <UserX className="w-10 h-10 stroke-[1.5] text-zinc-600" />
              <p className="text-xs font-bold text-zinc-300">No Blocked Accounts</p>
              <p className="text-[11px] text-zinc-500 max-w-xs">
                You haven&apos;t blocked anyone. Blocked accounts won&apos;t be able to see your posts, stories, or message you.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
