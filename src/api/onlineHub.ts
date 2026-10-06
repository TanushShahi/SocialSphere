import { User } from '../types';

// Dedicated persistent online endpoints on api.restful-api.dev
const URLS = {
  USERS: 'https://api.restful-api.dev/objects/ff808181a09d98f701a105ffe8ca717d',
  FOLLOWS: 'https://api.restful-api.dev/objects/ff808181a09d98f701a112df4bcf0ceb',
  MESSAGES: 'https://api.restful-api.dev/objects/ff808181a09d98f701a112df4bab0ce9',
  CALLS: 'https://api.restful-api.dev/objects/ff808181a09d98f701a112df4bb80cea'
};

const MOCK_USERNAMES = new Set([
  'alex_creator', 'sophia_celestial', 'liam_sound',
  'usr_alex', 'usr_sophia', 'usr_liam',
  'tanush', 'usr_tanush'
]);

// Inter-tab synchronization for immediate response across browser tabs
const broadcastBus = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('sphere_online_bus') : null;

export interface OnlineFollowItem {
  followerId: string;
  followerUsername: string;
  followerName: string;
  followerAvatar: string;
  followingId: string;
  followingUsername: string;
  followingName?: string;
  followingAvatar?: string;
  createdAt: string;
}

export interface OnlineMessageItem {
  id: string;
  senderId: string;
  senderUsername?: string;
  receiverId: string;
  receiverUsername?: string;
  text: string;
  mediaUrl?: string;
  createdAt: string;
  isRead?: boolean;
}

export interface OnlineCallItem {
  callId: string;
  caller: {
    id: string;
    username: string;
    name: string;
    avatar: string;
  };
  receiverId: string;
  callType: 'audio' | 'video';
  status: 'ringing' | 'connected' | 'rejected' | 'ended';
  sdpOffer?: any;
  sdpAnswer?: any;
  callerIce?: any[];
  receiverIce?: any[];
  createdAt: number;
  updatedAt: number;
}

async function fetchOnline<T>(url: string, defaultValue: T): Promise<T> {
  try {
    const res = await fetch(`${url}?_cb=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    if (!res.ok) return defaultValue;
    const json = await res.json();
    return json?.data ?? defaultValue;
  } catch (err) {
    console.warn('[OnlineHub] fetch error for', url, err);
    return defaultValue;
  }
}

async function putOnline(url: string, name: string, data: any): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, data })
    });
    return res.ok;
  } catch (err) {
    console.warn('[OnlineHub] put error for', url, err);
    return false;
  }
}

// In-memory caching for snappy UI
let cachedUsers: User[] = [];
let cachedFollows: OnlineFollowItem[] = [];
let cachedMessages: OnlineMessageItem[] = [];
let cachedCalls: OnlineCallItem[] = [];
let lastUsersFetch = 0;
let lastFollowsFetch = 0;
let lastMessagesFetch = 0;

export const onlineHub = {
  broadcast(type: string, payload: any) {
    try {
      broadcastBus?.postMessage({ type, payload });
    } catch {}
  },

  onBroadcast(handler: (event: { type: string; payload: any }) => void) {
    if (!broadcastBus) return () => {};
    const listener = (e: MessageEvent) => {
      if (e.data) handler(e.data);
    };
    broadcastBus.addEventListener('message', listener);
    return () => broadcastBus.removeEventListener('message', listener);
  },

  // ================= USERS =================
  async fetchUsers(force = false): Promise<User[]> {
    const now = Date.now();
    if (!force && cachedUsers.length > 0 && now - lastUsersFetch < 4000) {
      return cachedUsers;
    }
    const data = await fetchOnline<{ users: User[] }>(URLS.USERS, { users: [] });
    const list = Array.isArray(data?.users) ? data.users : [];
    cachedUsers = list.filter(u => u && !MOCK_USERNAMES.has(u.username?.toLowerCase()) && !MOCK_USERNAMES.has(u.id?.toLowerCase()));
    lastUsersFetch = now;
    return cachedUsers;
  },

  async syncUser(user: Partial<User> & { id: string; username: string }): Promise<void> {
    if (!user || !user.id || !user.username) return;
    try {
      const existing = await onlineHub.fetchUsers(true);
      const cleanUser: User = {
        id: user.id,
        username: user.username,
        name: user.name || user.username,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: user.bio || 'Explorer of the Social Sphere ✨',
        website: user.website || '',
        isVerified: Boolean(user.isVerified),
        isPrivate: Boolean(user.isPrivate),
        followersCount: user.followersCount ?? 0,
        followingCount: user.followingCount ?? 0,
        postsCount: user.postsCount ?? 0
      };

      const filtered = existing.filter(u => u.id !== cleanUser.id && u.username.toLowerCase() !== cleanUser.username.toLowerCase());
      const updated = [cleanUser, ...filtered].slice(0, 150);
      cachedUsers = updated;
      await putOnline(URLS.USERS, 'social_sphere_users', { users: updated });
      onlineHub.broadcast('USER_SYNCED', cleanUser);
    } catch (err) {
      console.warn('[OnlineHub] Failed to sync user:', err);
    }
  },

  async searchUsers(query: string): Promise<User[]> {
    const cleanQ = (query || '').trim().replace(/^@+/, '').toLowerCase();
    if (!cleanQ) return [];
    const users = await onlineHub.fetchUsers();
    return users.filter(u => {
      const uid = (u.id || '').toLowerCase();
      const uname = (u.username || '').toLowerCase();
      const dname = (u.name || '').toLowerCase();
      return uid.includes(cleanQ) || uname.includes(cleanQ) || dname.includes(cleanQ);
    });
  },

  // ================= FOLLOWS =================
  async fetchFollows(force = false): Promise<OnlineFollowItem[]> {
    const now = Date.now();
    if (!force && cachedFollows.length > 0 && now - lastFollowsFetch < 3000) {
      return cachedFollows;
    }
    const data = await fetchOnline<{ follows: OnlineFollowItem[] }>(URLS.FOLLOWS, { follows: [] });
    const list = Array.isArray(data?.follows) ? data.follows : [];
    cachedFollows = list.filter(f => f && f.followerId && f.followingId);
    lastFollowsFetch = now;
    return cachedFollows;
  },

  async followUser(follower: User, target: User): Promise<boolean> {
    if (!follower?.id || !target?.id || follower.id === target.id) return false;
    try {
      const current = await onlineHub.fetchFollows(true);
      const exists = current.some(f => f.followerId === follower.id && f.followingId === target.id);
      if (exists) return true;

      const newRecord: OnlineFollowItem = {
        followerId: follower.id,
        followerUsername: follower.username,
        followerName: follower.name,
        followerAvatar: follower.avatar,
        followingId: target.id,
        followingUsername: target.username,
        followingName: target.name,
        followingAvatar: target.avatar,
        createdAt: new Date().toISOString()
      };

      const updated = [newRecord, ...current].slice(0, 300);
      cachedFollows = updated;
      await putOnline(URLS.FOLLOWS, 'social_sphere_follows', { follows: updated });
      onlineHub.broadcast('FOLLOW_UPDATED', { action: 'follow', record: newRecord });
      return true;
    } catch (err) {
      console.warn('[OnlineHub] followUser error:', err);
      return false;
    }
  },

  async unfollowUser(followerId: string, targetId: string): Promise<boolean> {
    try {
      const current = await onlineHub.fetchFollows(true);
      const filtered = current.filter(f => !(f.followerId === followerId && f.followingId === targetId));
      cachedFollows = filtered;
      await putOnline(URLS.FOLLOWS, 'social_sphere_follows', { follows: filtered });
      onlineHub.broadcast('FOLLOW_UPDATED', { action: 'unfollow', followerId, targetId });
      return true;
    } catch (err) {
      console.warn('[OnlineHub] unfollowUser error:', err);
      return false;
    }
  },

  async getFollowers(userId: string): Promise<User[]> {
    const follows = await onlineHub.fetchFollows();
    const users = await onlineHub.fetchUsers();
    const followerItems = follows.filter(f => f.followingId === userId);

    return followerItems.map(f => {
      const existingUser = users.find(u => u.id === f.followerId);
      if (existingUser) return existingUser;
      return {
        id: f.followerId,
        username: f.followerUsername || 'user',
        name: f.followerName || f.followerUsername || 'User',
        avatar: f.followerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        followersCount: follows.filter(x => x.followingId === f.followerId).length,
        followingCount: follows.filter(x => x.followerId === f.followerId).length,
        postsCount: 0,
        isVerified: false
      } as User;
    });
  },

  async getFollowing(userId: string): Promise<User[]> {
    const follows = await onlineHub.fetchFollows();
    const users = await onlineHub.fetchUsers();
    const followingItems = follows.filter(f => f.followerId === userId);

    return followingItems.map(f => {
      const existingUser = users.find(u => u.id === f.followingId);
      if (existingUser) return existingUser;
      return {
        id: f.followingId,
        username: f.followingUsername || 'user',
        name: f.followingName || f.followingUsername || 'User',
        avatar: f.followingAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        followersCount: follows.filter(x => x.followingId === f.followingId).length,
        followingCount: follows.filter(x => x.followerId === f.followingId).length,
        postsCount: 0,
        isVerified: false
      } as User;
    });
  },

  // ================= MESSAGES =================
  async fetchMessages(force = false): Promise<OnlineMessageItem[]> {
    const now = Date.now();
    if (!force && cachedMessages.length > 0 && now - lastMessagesFetch < 1500) {
      return cachedMessages;
    }
    const data = await fetchOnline<{ messages: OnlineMessageItem[] }>(URLS.MESSAGES, { messages: [] });
    const list = Array.isArray(data?.messages) ? data.messages : [];
    cachedMessages = list;
    lastMessagesFetch = now;
    return cachedMessages;
  },

  async getConversationMessages(userId1: string, userId2: string): Promise<OnlineMessageItem[]> {
    const all = await onlineHub.fetchMessages();
    return all.filter(m => 
      (m.senderId === userId1 && m.receiverId === userId2) ||
      (m.senderId === userId2 && m.receiverId === userId1)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async sendMessage(msg: Omit<OnlineMessageItem, 'id' | 'createdAt'>): Promise<OnlineMessageItem> {
    const newMsg: OnlineMessageItem = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    try {
      const current = await onlineHub.fetchMessages(true);
      const updated = [...current, newMsg].slice(-300); // keep latest 300 messages across network
      cachedMessages = updated;
      await putOnline(URLS.MESSAGES, 'social_sphere_messages', { messages: updated });
      onlineHub.broadcast('NEW_MESSAGE', newMsg);
    } catch (err) {
      console.warn('[OnlineHub] sendMessage error:', err);
    }
    return newMsg;
  },

  // ================= CALLS & SIGNALING =================
  async fetchCalls(): Promise<OnlineCallItem[]> {
    const data = await fetchOnline<{ calls: OnlineCallItem[] }>(URLS.CALLS, { calls: [] });
    const list = Array.isArray(data?.calls) ? data.calls : [];
    cachedCalls = list;
    return cachedCalls;
  },

  async initiateCall(
    caller: { id: string; username: string; name: string; avatar: string },
    receiverId: string,
    callType: 'audio' | 'video'
  ): Promise<OnlineCallItem> {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCall: OnlineCallItem = {
      callId,
      caller,
      receiverId,
      callType,
      status: 'ringing',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const current = await onlineHub.fetchCalls();
      // Remove stale calls older than 5 minutes
      const active = current.filter(c => Date.now() - c.updatedAt < 300000 && c.status !== 'ended' && c.status !== 'rejected');
      const updated = [newCall, ...active].slice(0, 50);
      cachedCalls = updated;
      await putOnline(URLS.CALLS, 'social_sphere_calls', { calls: updated });
      onlineHub.broadcast('CALL_INITIATED', newCall);
    } catch (err) {
      console.warn('[OnlineHub] initiateCall error:', err);
    }

    return newCall;
  },

  async checkIncomingCall(myUserId: string): Promise<OnlineCallItem | null> {
    if (!myUserId) return null;
    const calls = await onlineHub.fetchCalls();
    // Return newest ringing call targeted to me created within last 45 seconds
    const matching = calls.find(c => 
      c.receiverId === myUserId &&
      c.status === 'ringing' &&
      Date.now() - c.createdAt < 45000
    );
    return matching || null;
  },

  async checkCallStatus(callId: string): Promise<OnlineCallItem | null> {
    const calls = await onlineHub.fetchCalls();
    return calls.find(c => c.callId === callId) || null;
  },

  async acceptCall(callId: string): Promise<void> {
    try {
      const calls = await onlineHub.fetchCalls();
      const target = calls.find(c => c.callId === callId);
      if (target) {
        target.status = 'connected';
        target.updatedAt = Date.now();
        await putOnline(URLS.CALLS, 'social_sphere_calls', { calls });
        onlineHub.broadcast('CALL_STATUS_CHANGE', { callId, status: 'connected' });
      }
    } catch (err) {
      console.warn('[OnlineHub] acceptCall error:', err);
    }
  },

  async rejectCall(callId: string): Promise<void> {
    try {
      const calls = await onlineHub.fetchCalls();
      const target = calls.find(c => c.callId === callId);
      if (target) {
        target.status = 'rejected';
        target.updatedAt = Date.now();
        await putOnline(URLS.CALLS, 'social_sphere_calls', { calls });
        onlineHub.broadcast('CALL_STATUS_CHANGE', { callId, status: 'rejected' });
      }
    } catch (err) {
      console.warn('[OnlineHub] rejectCall error:', err);
    }
  },

  async endCall(callId: string): Promise<void> {
    try {
      const calls = await onlineHub.fetchCalls();
      const target = calls.find(c => c.callId === callId);
      if (target) {
        target.status = 'ended';
        target.updatedAt = Date.now();
        await putOnline(URLS.CALLS, 'social_sphere_calls', { calls });
        onlineHub.broadcast('CALL_STATUS_CHANGE', { callId, status: 'ended' });
      }
    } catch (err) {
      console.warn('[OnlineHub] endCall error:', err);
    }
  }
};
