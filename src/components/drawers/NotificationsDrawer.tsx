import React, { useState } from 'react';
import { X, Heart, MessageCircle, UserPlus, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsDrawer: React.FC = () => {
  const { 
    isNotificationsOpen, 
    setIsNotificationsOpen, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    toggleFollowUser 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'like' | 'comment' | 'follow'>('all');

  if (!isNotificationsOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  return (
    <div 
      className="fixed inset-y-0 left-0 md:left-[76px] z-30 w-full md:w-[380px] bg-black dark:bg-black light:bg-white border-r border-zinc-800 dark:border-zinc-800 light:border-zinc-200 shadow-2xl flex flex-col animate-fade-in text-white select-none"
    >
      {/* Header */}
      <div className="p-6 border-b border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Notifications</h2>
          <button 
            onClick={() => setIsNotificationsOpen(false)}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {(['all', 'like', 'comment', 'follow'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${
                  activeFilter === filter
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All' : `${filter}s`}
              </button>
            ))}
          </div>

          <button
            onClick={markAllNotificationsAsRead}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold whitespace-nowrap"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 divide-y divide-zinc-900">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                notif.isRead ? 'hover:bg-zinc-900/40' : 'bg-zinc-900/60 hover:bg-zinc-900'
              }`}
            >
              {/* User Avatar with Icon Badge */}
              <div className="relative flex-shrink-0">
                <img
                  src={notif.user.avatar}
                  alt={notif.user.username}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] border-2 border-black ${
                  notif.type === 'like' ? 'bg-rose-500' : notif.type === 'comment' ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                  {notif.type === 'like' && <Heart className="w-2.5 h-2.5 fill-white" />}
                  {notif.type === 'comment' && <MessageCircle className="w-2.5 h-2.5 fill-white" />}
                  {notif.type === 'follow' && <UserPlus className="w-2.5 h-2.5" />}
                </div>
              </div>

              {/* Notification Description */}
              <div className="flex-1 min-w-0 text-xs leading-snug">
                <p className="text-zinc-200">
                  <span className="font-bold text-white mr-1">{notif.user.username}</span>
                  {notif.type === 'like' && 'liked your photo.'}
                  {notif.type === 'comment' && `commented: "${notif.commentText}"`}
                  {notif.type === 'follow' && 'started following you.'}
                </p>
                <span className="text-[10px] text-zinc-500 mt-0.5 block">{notif.createdAt}</span>
              </div>

              {/* Trailing Element (Post Thumbnail or Follow button) */}
              {notif.type === 'follow' ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollowUser(notif.user.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-colors ${
                    notif.user.isFollowing
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {notif.user.isFollowing ? 'Following' : 'Follow'}
                </button>
              ) : notif.postImage ? (
                <img
                  src={notif.postImage}
                  alt="Notification post"
                  className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-zinc-800"
                />
              ) : null}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-zinc-500 text-xs">
            No notifications in this category
          </div>
        )}
      </div>
    </div>
  );
};
