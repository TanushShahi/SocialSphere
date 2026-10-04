import { User } from '../types';

const CLOUD_REGISTRY_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a105ffe8ca717d';

export interface CloudUserPayload {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  website?: string;
  isVerified?: boolean;
  isPrivate?: boolean;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  updatedAt?: number;
}

export const cloudRegistry = {
  // Sync a user account to the shared online registry across devices
  async syncUser(user: Partial<User> & { id: string; username: string }): Promise<void> {
    if (!user || !user.id || !user.username) return;
    try {
      const existing = await cloudRegistry.fetchUsers();
      const userPayload: CloudUserPayload = {
        id: user.id,
        username: user.username,
        name: user.name || user.username,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: user.bio,
        website: user.website,
        isVerified: Boolean(user.isVerified),
        isPrivate: Boolean(user.isPrivate),
        followersCount: user.followersCount ?? 0,
        followingCount: user.followingCount ?? 0,
        postsCount: user.postsCount ?? 0,
        updatedAt: Date.now()
      };

      const filtered = existing.filter(u => u && u.id !== user.id && (u.username || '').toLowerCase() !== user.username.toLowerCase());
      const updatedList = [userPayload, ...filtered].slice(0, 150);

      await fetch(CLOUD_REGISTRY_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'social_sphere_users',
          data: { users: updatedList }
        })
      });
      console.log('[CloudRegistry] Synced user to cloud registry:', user.username);
    } catch (err) {
      console.warn('[CloudRegistry] Failed to sync user to cloud registry:', err);
    }
  },

  // Fetch all registered users from the shared online registry
  async fetchUsers(): Promise<CloudUserPayload[]> {
    try {
      const url = `${CLOUD_REGISTRY_URL}?_cb=${Date.now()}`;
      const res = await fetch(url, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (!res.ok) return [];
      const json = await res.json();
      const users = json?.data?.users;
      if (!Array.isArray(users)) return [];
      const MOCK_NAMES = new Set(['alex_creator', 'sophia_celestial', 'liam_sound', 'usr_alex', 'usr_sophia', 'usr_liam', 'tanush', 'usr_tanush']);
      return users.filter(u => u && !MOCK_NAMES.has(u.username?.toLowerCase()) && !MOCK_NAMES.has(u.id?.toLowerCase()));
    } catch (err) {
      console.warn('[CloudRegistry] Failed to fetch users from cloud registry:', err);
      return [];
    }
  },

  // Real-time search against the shared online registry
  async searchCloud(query: string): Promise<CloudUserPayload[]> {
    const cleanQ = query.trim().replace(/^@+/, '').toLowerCase();
    if (!cleanQ) return [];
    const users = await cloudRegistry.fetchUsers();
    return users.filter(u => {
      if (!u) return false;
      const uid = (u.id || '').toLowerCase();
      const uname = (u.username || '').toLowerCase();
      const dname = (u.name || '').toLowerCase();
      return uid.includes(cleanQ) || uname.includes(cleanQ) || dname.includes(cleanQ);
    });
  }
};
