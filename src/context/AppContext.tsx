import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Post, 
  Story, 
  Reel, 
  NotificationItem, 
  Conversation, 
  TabType,
  CallSession,
  CallType
} from '../types';
import { api, getToken, setToken } from '../api/client';
import { getSocket, registerSocketUser } from '../services/socket';

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (login: string, pass: string) => Promise<void>;
  register: (user: string, email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => Promise<void>;
  posts: Post[];
  stories: Story[];
  reels: Reel[];
  conversations: Conversation[];
  notifications: NotificationItem[];
  activeStoryIndex: number | null;
  openStoryViewer: (index: number) => void;
  closeStoryViewer: () => void;
  selectedPostForDetail: Post | null;
  openPostDetail: (post: Post) => void;
  closePostDetail: () => void;
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleSavePost: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  toggleLikeComment: (postId: string, commentId: string) => Promise<void>;
  addNewPost: (
    mediaUrls: string[],
    caption: string,
    filter: string,
    location?: string,
    songTitle?: string,
    songArtist?: string,
    songUrl?: string
  ) => Promise<void>;
  addNewStory: (
    mediaUrl: string,
    caption?: string,
    duration?: number,
    songTitle?: string,
    songArtist?: string,
    songUrl?: string
  ) => Promise<void>;
  editPost: (
    postId: string,
    updates: {
      caption?: string;
      location?: string;
      songTitle?: string;
      songArtist?: string;
      songUrl?: string;
    }
  ) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  toggleLikeReel: (reelId: string) => Promise<void>;
  toggleSaveReel: (reelId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  startConversationWithUser: (recipient: User) => Promise<string>;
  callSession: CallSession | null;
  initiateCall: (partner: { id: string; username: string; name: string; avatar: string }, callType: CallType) => void;
  acceptIncomingCall: () => void;
  endCall: () => void;
  onlineUserIds: string[];
  markNotificationAsRead: (notifId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  toggleFollowUser: (userId: string) => Promise<void>;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('sphere_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('sphere_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-black text-white antialiased selection:bg-pink-500 selection:text-white overflow-x-hidden';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-[#FAFAFA] text-zinc-900 antialiased selection:bg-pink-500 selection:text-white overflow-x-hidden';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [activeTab, setActiveTab] = useState<TabType>('feed');

  // Auth & User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(getToken()));

  // Entity lists
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals and Drawers
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Calling & Real-Time Presence
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  // Socket.IO real-time event subscriptions
  useEffect(() => {
    if (!currentUser) return;
    registerSocketUser(currentUser.id);
    const s = getSocket();

    const handleReceiveMessage = (msg: any) => {
      setConversations(prev => {
        const convExists = prev.some(c => c.id === msg.conversationId);
        if (!convExists) {
          api.messages.getConversations().then(res => setConversations(res.conversations));
          return prev;
        }
        return prev.map(c => {
          if (c.id === msg.conversationId) {
            const alreadyHas = c.messages.some(m => m.id === msg.id);
            if (alreadyHas) return c;
            return {
              ...c,
              unreadCount: c.unreadCount + 1,
              messages: [...c.messages, msg]
            };
          }
          return c;
        });
      });
    };

    const handleMessageSent = (msg: any) => {
      setConversations(prev =>
        prev.map(c => {
          if (c.id === msg.conversationId) {
            const alreadyHas = c.messages.some(m => m.id === msg.id);
            if (alreadyHas) return c;
            return {
              ...c,
              messages: [...c.messages, msg]
            };
          }
          return c;
        })
      );
    };

    const handleOnlineUsers = (users: string[]) => {
      setOnlineUserIds(users);
    };

    const handleIncomingCall = (data: any) => {
      setCallSession({
        status: 'incoming',
        callType: data.callType,
        partner: data.caller,
        isMuted: false,
        isVideoOff: false,
        offer: data.offer
      });
    };

    const handleCallAccepted = () => {
      setCallSession(prev => (prev ? { ...prev, status: 'connected' } : null));
    };

    const handleCallRejected = () => {
      setCallSession(null);
    };

    const handleCallEnded = () => {
      setCallSession(null);
    };

    s.on('receive-message', handleReceiveMessage);
    s.on('message-sent', handleMessageSent);
    s.on('online-users', handleOnlineUsers);
    s.on('incoming-call', handleIncomingCall);
    s.on('call-accepted', handleCallAccepted);
    s.on('call-rejected', handleCallRejected);
    s.on('call-ended', handleCallEnded);

    return () => {
      s.off('receive-message', handleReceiveMessage);
      s.off('message-sent', handleMessageSent);
      s.off('online-users', handleOnlineUsers);
      s.off('incoming-call', handleIncomingCall);
      s.off('call-accepted', handleCallAccepted);
      s.off('call-rejected', handleCallRejected);
      s.off('call-ended', handleCallEnded);
    };
  }, [currentUser]);

  const refreshData = async () => {
    try {
      const [pRes, sRes, rRes] = await Promise.all([
        api.posts.getFeed(),
        api.stories.getAll(),
        api.reels.getAll()
      ]);
      setPosts(pRes.posts);
      setStories(sRes.stories);
      setReels(rRes.reels);

      if (getToken()) {
        const [cRes, nRes] = await Promise.all([
          api.messages.getConversations().catch(() => ({ conversations: [] })),
          api.notifications.getAll().catch(() => ({ notifications: [] }))
        ]);
        setConversations(cRes.conversations);
        setNotifications(nRes.notifications);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  // Check auth session on startup
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const res = await api.auth.me();
          setCurrentUser(res.user);
          setIsAuthenticated(true);
        } catch {
          setToken(null);
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      }
      await refreshData();
    };

    initAuth();
  }, []);

  const login = async (loginInput: string, passwordInput: string) => {
    const res = await api.auth.login(loginInput, passwordInput);
    setToken(res.token);
    setCurrentUser(res.user);
    setIsAuthenticated(true);
    await refreshData();
  };

  const register = async (usernameInput: string, emailInput: string, passwordInput: string, nameInput: string) => {
    const res = await api.auth.register(usernameInput, emailInput, passwordInput, nameInput);
    setToken(res.token);
    setCurrentUser(res.user);
    setIsAuthenticated(true);
    await refreshData();
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveTab('feed');
    setCallSession(null);
  };

  const updateCurrentUser = async (updates: Partial<User>) => {
    const res = await api.users.updateProfile(updates);
    setCurrentUser(res.user);
  };

  const openStoryViewer = (index: number) => {
    setActiveStoryIndex(index);
    const story = stories[index];
    if (story && story.slides[0]) {
      api.stories.view(story.slides[0].id).catch(console.error);
    }
  };

  const closeStoryViewer = () => {
    setActiveStoryIndex(null);
  };

  const openPostDetail = (post: Post) => {
    setSelectedPostForDetail(post);
  };

  const closePostDetail = () => {
    setSelectedPostForDetail(null);
  };

  // Like Post
  const toggleLikePost = async (postId: string) => {
    try {
      const res = await api.posts.like(postId);
      setPosts(prev =>
        prev.map(p => {
          if (p.id === postId) {
            const updated = { ...p, isLiked: res.isLiked, likesCount: res.likesCount };
            if (selectedPostForDetail?.id === postId) setSelectedPostForDetail(updated);
            return updated;
          }
          return p;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Save Post
  const toggleSavePost = async (postId: string) => {
    try {
      const res = await api.posts.save(postId);
      setPosts(prev =>
        prev.map(p => {
          if (p.id === postId) {
            const updated = { ...p, isSaved: res.isSaved };
            if (selectedPostForDetail?.id === postId) setSelectedPostForDetail(updated);
            return updated;
          }
          return p;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Add Comment
  const addComment = async (postId: string, text: string) => {
    try {
      const res = await api.posts.addComment(postId, text);
      setPosts(prev =>
        prev.map(p => {
          if (p.id === postId) {
            const updatedComments = [...p.comments, res.comment];
            const updated = { ...p, comments: updatedComments };
            if (selectedPostForDetail?.id === postId) setSelectedPostForDetail(updated);
            return updated;
          }
          return p;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Like Comment
  const toggleLikeComment = async (postId: string, commentId: string) => {
    try {
      const res = await api.posts.likeComment(commentId);
      setPosts(prev =>
        prev.map(p => {
          if (p.id === postId) {
            const updatedComments = p.comments.map(c =>
              c.id === commentId ? { ...c, isLiked: res.isLiked, likesCount: res.likesCount } : c
            );
            const updated = { ...p, comments: updatedComments };
            if (selectedPostForDetail?.id === postId) setSelectedPostForDetail(updated);
            return updated;
          }
          return p;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Add New Post with Song Support
  const addNewPost = async (
    mediaUrls: string[],
    caption: string,
    filter: string,
    location?: string,
    songTitle?: string,
    songArtist?: string,
    songUrl?: string
  ) => {
    try {
      const res = await api.posts.create(mediaUrls, filter, caption, location, songTitle, songArtist, songUrl);
      setPosts(prev => [res.post, ...prev]);
      if (currentUser) {
        setCurrentUser({ ...currentUser, postsCount: currentUser.postsCount + 1 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add New Story with Song Support
  const addNewStory = async (
    mediaUrl: string,
    caption?: string,
    duration?: number,
    songTitle?: string,
    songArtist?: string,
    songUrl?: string
  ) => {
    try {
      await api.stories.create(mediaUrl, caption, duration, songTitle, songArtist, songUrl);
      const sRes = await api.stories.getAll();
      setStories(sRes.stories);
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Existing Post
  const editPost = async (
    postId: string,
    updates: {
      caption?: string;
      location?: string;
      songTitle?: string;
      songArtist?: string;
      songUrl?: string;
    }
  ) => {
    try {
      const res = await api.posts.update(postId, updates);
      setPosts(prev => prev.map(p => (p.id === postId ? res.post : p)));
      if (selectedPostForDetail?.id === postId) {
        setSelectedPostForDetail(res.post);
      }
    } catch (err) {
      console.error('Failed to edit post:', err);
      throw err;
    }
  };

  // Delete Existing Post
  const deletePost = async (postId: string) => {
    try {
      await api.posts.delete(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      if (selectedPostForDetail?.id === postId) {
        closePostDetail();
      }
      if (currentUser && currentUser.postsCount > 0) {
        setCurrentUser({ ...currentUser, postsCount: currentUser.postsCount - 1 });
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      throw err;
    }
  };

  // Delete Existing Story
  const deleteStory = async (storyId: string) => {
    try {
      await api.stories.delete(storyId);
      const sRes = await api.stories.getAll();
      setStories(sRes.stories);
      if (activeStoryIndex !== null) {
        const remaining = sRes.stories[activeStoryIndex]?.slides.length || 0;
        if (remaining === 0) {
          closeStoryViewer();
        }
      }
    } catch (err) {
      console.error('Failed to delete story:', err);
      throw err;
    }
  };

  // Reels
  const toggleLikeReel = async (reelId: string) => {
    try {
      const res = await api.reels.like(reelId);
      setReels(prev =>
        prev.map(r => (r.id === reelId ? { ...r, isLiked: res.isLiked, likesCount: res.likesCount } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSaveReel = async (reelId: string) => {
    try {
      const res = await api.reels.save(reelId);
      setReels(prev =>
        prev.map(r => (r.id === reelId ? { ...r, isSaved: res.isSaved } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Live Messages via Socket.IO
  const sendMessage = async (conversationId: string, text: string) => {
    try {
      if (!currentUser || !text.trim()) return;
      const conv = conversations.find(c => c.id === conversationId);
      if (!conv) return;

      const s = getSocket();
      s.emit('send-message', {
        conversationId,
        senderId: currentUser.id,
        receiverId: conv.participant.id,
        text: text.trim()
      });
    } catch (err) {
      console.error('sendMessage error:', err);
    }
  };

  // Start Conversation with any registered user
  const startConversationWithUser = async (recipient: User): Promise<string> => {
    try {
      const res = await api.messages.getOrCreateConversation(recipient.id);
      setConversations(prev => {
        const exists = prev.some(c => c.id === res.conversation.id);
        if (exists) return prev;
        return [res.conversation, ...prev];
      });
      return res.conversation.id;
    } catch (e) {
      console.error('Failed to start conversation:', e);
      return '';
    }
  };

  // WebRTC Audio/Video Calling
  const initiateCall = (
    partner: { id: string; username: string; name: string; avatar: string },
    callType: CallType
  ) => {
    if (!currentUser) return;
    setCallSession({
      status: 'outgoing',
      callType,
      partner,
      isMuted: false,
      isVideoOff: false
    });

    const s = getSocket();
    s.emit('call-user', {
      toUserId: partner.id,
      fromUserId: currentUser.id,
      offer: { type: 'offer' },
      callType,
      caller: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar
      }
    });
  };

  const acceptIncomingCall = () => {
    if (!callSession || !currentUser) return;
    setCallSession(prev => (prev ? { ...prev, status: 'connected' } : null));
    const s = getSocket();
    s.emit('call-accepted', {
      toUserId: callSession.partner.id,
      answer: { type: 'answer' }
    });
  };

  const endCall = () => {
    if (callSession) {
      const s = getSocket();
      s.emit('end-call', { toUserId: callSession.partner.id });
    }
    setCallSession(null);
  };

  // Notifications
  const markNotificationAsRead = async (notifId: string) => {
    try {
      await api.notifications.markRead(notifId);
      setNotifications(prev =>
        prev.map(n => (n.id === notifId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Follow user
  const toggleFollowUser = async (userId: string) => {
    try {
      const res = await api.users.follow(userId);
      setPosts(prev =>
        prev.map(p =>
          p.user.id === userId ? { ...p, user: { ...p.user, isFollowing: res.isFollowing } } : p
        )
      );
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          followingCount: res.isFollowing ? currentUser.followingCount + 1 : currentUser.followingCount - 1
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
        updateCurrentUser,
        posts,
        stories,
        reels,
        conversations,
        notifications,
        activeStoryIndex,
        openStoryViewer,
        closeStoryViewer,
        selectedPostForDetail,
        openPostDetail,
        closePostDetail,
        isCreatePostOpen,
        setIsCreatePostOpen,
        isSearchOpen,
        setIsSearchOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        toggleLikePost,
        toggleSavePost,
        addComment,
        toggleLikeComment,
        addNewPost,
        addNewStory,
        editPost,
        deletePost,
        deleteStory,
        toggleLikeReel,
        toggleSaveReel,
        sendMessage,
        startConversationWithUser,
        callSession,
        initiateCall,
        acceptIncomingCall,
        endCall,
        onlineUserIds,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toggleFollowUser,
        unreadNotificationsCount,
        unreadMessagesCount,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
