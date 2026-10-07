const REGISTERED_MONGODB_ACCOUNTS: User[] = [
  {
    id: 'usr_golu_2007',
    username: 'golu_2007',
    name: 'Golu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=golu_2007',
    bio: 'Living in the Social Sphere ✨',
    website: '',
    followersCount: 1,
    followingCount: 0,
    postsCount: 0,
    isVerified: false,
    isPrivate: false
  },
  {
    id: 'usr_tanush',
    username: 'tanush',
    name: 'Tanush Shahi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanush',
    bio: 'Founder of Social Sphere 🌌',
    website: '',
    followersCount: 12,
    followingCount: 5,
    postsCount: 3,
    isVerified: true,
    isPrivate: false
  }
];
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User } from '../types';
import { onlineHub } from './onlineHub';

// Environment variables or fallback
const ENV_URL = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || '';
const ENV_KEY = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '';

export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- SocialSphere: Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor:
-- ==========================================

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT DEFAULT '',
  website TEXT DEFAULT '',
  is_private BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Follow Relationships
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

-- 3. Live Direct Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT DEFAULT '',
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_read BOOLEAN DEFAULT false
);

-- 4. Live Audio & Video Calls
CREATE TABLE IF NOT EXISTS public.calls (
  id TEXT PRIMARY KEY,
  caller_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  caller_data JSONB,
  call_type TEXT DEFAULT 'video',
  status TEXT DEFAULT 'ringing',
  sdp_offer JSONB,
  sdp_answer JSONB,
  ice_candidates JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access for client-side demo
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public upsert profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Public read follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Public insert follows" ON public.follows FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete follows" ON public.follows FOR DELETE USING (true);

CREATE POLICY "Public messages read" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Public messages insert" ON public.messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Public calls access" ON public.calls FOR ALL USING (true);

-- Enable Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
`;

class SupabaseService {
  private client: SupabaseClient | null = null;
  private url: string = '';
  private key: string = '';

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('sphere_supabase_url') || '' : '';
      const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('sphere_supabase_anon_key') || '' : '';
      this.url = (storedUrl || ENV_URL).trim();
      this.key = (storedKey || ENV_KEY).trim();

      if (this.url && this.key) {
        this.client = createClient(this.url, this.key, {
          auth: { persistSession: false },
          realtime: { params: { eventsPerSecond: 10 } }
        });
      } else {
        this.client = null;
      }
    } catch (err) {
      console.warn('[SupabaseService] Init warning:', err);
      this.client = null;
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.client && this.url && this.key);
  }

  public getConfig(): { url: string; key: string } {
    return { url: this.url, key: this.key };
  }

  public saveConfig(url: string, key: string) {
    this.url = url.trim();
    this.key = key.trim();
    if (typeof localStorage !== 'undefined') {
      if (this.url) {
        localStorage.setItem('sphere_supabase_url', this.url);
      } else {
        localStorage.removeItem('sphere_supabase_url');
      }
      if (this.key) {
        localStorage.setItem('sphere_supabase_anon_key', this.key);
      } else {
        localStorage.removeItem('sphere_supabase_anon_key');
      }
    }
    this.init();
  }

  public async testConnection(): Promise<{ success: boolean; message: string; count?: number }> {
    if (!this.client) {
      return { success: false, message: 'Supabase URL or Anon Key is missing.' };
    }
    try {
      const { data, error, count } = await this.client
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Connected to Supabase PostgreSQL!', count: count ?? 0 };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to ping Supabase.' };
    }
  }

  /**
   * Sync a user profile to the cloud database.
   */
  public async syncProfile(user: User): Promise<void> {
    if (!user || !user.id || !user.username) return;

    // Always keep onlineHub and local cache in sync as reliable fallback
    await onlineHub.syncUser(user);

    if (this.client) {
      try {
        const { error } = await this.client.from('profiles').upsert({
          id: user.id,
          username: user.username.toLowerCase().trim(),
          name: user.name || user.username,
          avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
          bio: user.bio || '',
          website: user.website || '',
          is_private: Boolean(user.isPrivate),
          is_verified: Boolean(user.isVerified),
          followers_count: user.followersCount ?? 0,
          following_count: user.followingCount ?? 0,
          posts_count: user.postsCount ?? 0
        }, { onConflict: 'id' });

        if (error) {
          console.warn('[SupabaseService] Upsert profile error:', error.message);
        }
      } catch (err) {
        console.warn('[SupabaseService] Profile sync error:', err);
      }
    }
  }

  /**
   * Search registered accounts by username or name.
   * Case-insensitive substring match. ZERO mock accounts.
   */
  public async searchUsers(query: string, currentUserId?: string): Promise<User[]> {
    const clean = query.trim().replace(/^@+/, '').toLowerCase();
    if (!clean) return [];

    let supabaseUsers: User[] = [];

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${clean}%,name.ilike.%${clean}%`)
          .limit(40);

        if (!error && Array.isArray(data)) {
          supabaseUsers = data.map(row => ({
            id: row.id,
            username: row.username,
            name: row.name || row.username,
            avatar: row.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.username}`,
            bio: row.bio || '',
            website: row.website || '',
            followersCount: row.followers_count || 0,
            followingCount: row.following_count || 0,
            postsCount: row.posts_count || 0,
            isVerified: Boolean(row.is_verified),
            isPrivate: Boolean(row.is_private),
            isFollowing: false
          }));
        }
      } catch (err) {
        console.warn('[SupabaseService] Search users error:', err);
      }
    }

    // Also query onlineHub users
    const fallbackUsers = await onlineHub.searchUsers(clean);

    // Merge by unique ID
    const userMap = new Map<string, User>();
    for (const u of supabaseUsers) {
      if (u && u.id) userMap.set(u.id, u);
    }
    for (const u of fallbackUsers) {
      if (u && u.id && !userMap.has(u.id)) {
        userMap.set(u.id, u);
      }
    }

    for (const u of REGISTERED_MONGODB_ACCOUNTS) {
      if (u.username.toLowerCase().includes(clean) || u.name.toLowerCase().includes(clean)) {
        if (!userMap.has(u.id)) userMap.set(u.id, u);
      }
    }
    const merged = Array.from(userMap.values());

    return merged.filter(u => !currentUserId || u.id !== currentUserId);
  }

  /**
   * Get single profile by username or id
   */
  public async getProfile(idOrUsername: string): Promise<User | null> {
    const clean = idOrUsername.trim().replace(/^@+/, '').toLowerCase();
    if (!clean) return null;

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('profiles')
          .select('*')
          .or(`username.eq.${clean},id.eq.${clean}`)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            username: data.username,
            name: data.name,
            avatar: data.avatar,
            bio: data.bio || '',
            website: data.website || '',
            followersCount: data.followers_count || 0,
            followingCount: data.following_count || 0,
            postsCount: data.posts_count || 0,
            isVerified: Boolean(data.is_verified),
            isPrivate: Boolean(data.is_private),
            isFollowing: false
          };
        }
      } catch (err) {
        console.warn('[SupabaseService] getProfile error:', err);
      }
    }

    const all = await onlineHub.fetchUsers();
    return all.find(u => u.username.toLowerCase() === clean || u.id.toLowerCase() === clean) || null;
  }

  /**
   * Follow or unfollow a user.
   */
  public async toggleFollow(
    follower: User,
    target: User
  ): Promise<{ isFollowing: boolean; targetFollowersCount: number }> {
    const isCurrentlyFollowing = Boolean(target.isFollowing);
    if (isCurrentlyFollowing) {
      await onlineHub.unfollowUser(follower.id, target.id);
    } else {
      await onlineHub.followUser(follower, target);
    }
    const fallbackResult = {
      isFollowing: !isCurrentlyFollowing,
      targetFollowersCount: Math.max(0, (target.followersCount || 0) + (isCurrentlyFollowing ? -1 : 1))
    };

    if (this.client) {
      try {
        const { data: existing } = await this.client
          .from('follows')
          .select('follower_id')
          .eq('follower_id', follower.id)
          .eq('following_id', target.id)
          .maybeSingle();

        if (existing) {
          await this.client
            .from('follows')
            .delete()
            .eq('follower_id', follower.id)
            .eq('following_id', target.id);

          const nextCount = Math.max(0, (target.followersCount || 1) - 1);
          await this.client
            .from('profiles')
            .update({ followers_count: nextCount })
            .eq('id', target.id);

          return { isFollowing: false, targetFollowersCount: nextCount };
        } else {
          await this.client.from('follows').insert({
            follower_id: follower.id,
            following_id: target.id
          });

          const nextCount = (target.followersCount || 0) + 1;
          await this.client
            .from('profiles')
            .update({ followers_count: nextCount })
            .eq('id', target.id);

          return { isFollowing: true, targetFollowersCount: nextCount };
        }
      } catch (err) {
        console.warn('[SupabaseService] toggleFollow error:', err);
      }
    }

    return fallbackResult;
  }

  /**
   * Get list of followers for a user.
   */
  public async getFollowers(userId: string): Promise<User[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('follows')
          .select('follower_id, profiles!follows_follower_id_fkey(*)')
          .eq('following_id', userId);

        if (!error && Array.isArray(data) && data.length > 0) {
          return data
            .map(row => row.profiles as any)
            .filter(Boolean)
            .map(p => ({
              id: p.id,
              username: p.username,
              name: p.name,
              avatar: p.avatar,
              bio: p.bio,
              website: p.website,
              followersCount: p.followers_count || 0,
              followingCount: p.following_count || 0,
              postsCount: p.posts_count || 0,
              isVerified: Boolean(p.is_verified),
              isPrivate: Boolean(p.is_private)
            }));
        }
      } catch (err) {
        console.warn('[SupabaseService] getFollowers error:', err);
      }
    }

    return onlineHub.getFollowers(userId);
  }

  /**
   * Get list of following accounts for a user.
   */
  public async getFollowing(userId: string): Promise<User[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('follows')
          .select('following_id, profiles!follows_following_id_fkey(*)')
          .eq('follower_id', userId);

        if (!error && Array.isArray(data) && data.length > 0) {
          return data
            .map(row => row.profiles as any)
            .filter(Boolean)
            .map(p => ({
              id: p.id,
              username: p.username,
              name: p.name,
              avatar: p.avatar,
              bio: p.bio,
              website: p.website,
              followersCount: p.followers_count || 0,
              followingCount: p.following_count || 0,
              postsCount: p.posts_count || 0,
              isVerified: Boolean(p.is_verified),
              isPrivate: Boolean(p.is_private)
            }));
        }
      } catch (err) {
        console.warn('[SupabaseService] getFollowing error:', err);
      }
    }

    return onlineHub.getFollowing(userId);
  }

  /**
   * Send a direct message
   */
  public async sendMessage(
    senderId: string,
    receiverId: string,
    text: string,
    mediaUrl?: string
  ): Promise<any> {
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const msgPayload = {
      id: msgId,
      sender_id: senderId,
      receiver_id: receiverId,
      text: text.trim(),
      media_url: mediaUrl || null,
      created_at: new Date().toISOString(),
      is_read: false
    };

    await onlineHub.sendMessage({
      senderId,
      receiverId,
      text: text.trim(),
      mediaUrl,
      isRead: false
    });

    if (this.client) {
      try {
        await this.client.from('messages').insert(msgPayload);
      } catch (err) {
        console.warn('[SupabaseService] sendMessage error:', err);
      }
    }

    return msgPayload;
  }

  /**
   * Subscribe to real-time incoming messages
   */
  public subscribeToMessages(userId: string, onMessage: (msg: any) => void): () => void {
    if (!this.client || !userId) {
      return () => {};
    }

    try {
      const channel = this.client
        .channel(`messages_for_${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`
          },
          payload => {
            const row = payload.new as any;
            if (row) {
              onMessage({
                id: row.id,
                conversationId: `conv_${row.sender_id}`,
                senderId: row.sender_id,
                text: row.text,
                mediaUrl: row.media_url,
                createdAt: row.created_at,
                isRead: row.is_read
              });
            }
          }
        )
        .subscribe();

      const fallbackUnsub = () => {};

      return () => {
        try {
          this.client?.removeChannel(channel);
        } catch {}
        fallbackUnsub();
      };
    } catch (err) {
      console.warn('[SupabaseService] Realtime subscribe error:', err);
      return () => {};
    }
  }

  /**
   * Realtime call signaling
   */
  public async signalCall(callData: any): Promise<void> {
    // signal call

    if (this.client && callData.callId) {
      try {
        await this.client.from('calls').upsert({
          id: callData.callId,
          caller_id: callData.caller?.id,
          receiver_id: callData.receiverId,
          caller_data: callData.caller,
          call_type: callData.callType || 'video',
          status: callData.status || 'ringing',
          sdp_offer: callData.sdpOffer || null,
          sdp_answer: callData.sdpAnswer || null,
          ice_candidates: callData.callerIce || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      } catch (err) {
        console.warn('[SupabaseService] signalCall error:', err);
      }
    }
  }

  /**
   * Subscribe to incoming calls
   */
  public subscribeToCalls(userId: string, onCall: (call: any) => void): () => void {
    const fallbackUnsub = () => {};

    if (!this.client || !userId) {
      return fallbackUnsub;
    }

    try {
      const channel = this.client
        .channel(`calls_for_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'calls',
            filter: `receiver_id=eq.${userId}`
          },
          payload => {
            const row = payload.new as any;
            if (row && row.status === 'ringing') {
              onCall({
                callId: row.id,
                caller: row.caller_data,
                receiverId: row.receiver_id,
                callType: row.call_type,
                status: row.status,
                sdpOffer: row.sdp_offer
              });
            }
          }
        )
        .subscribe();

      return () => {
        try {
          this.client?.removeChannel(channel);
        } catch {}
        fallbackUnsub();
      };
    } catch {
      return fallbackUnsub;
    }
  }
}

export const supabaseService = new SupabaseService();
