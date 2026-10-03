import { User, Post, Story, Reel, Conversation, NotificationItem } from '../types';
import { localStore } from './localStore';

const SERVER_URL = ((import.meta as any).env?.VITE_API_URL as string) || '';
const API_BASE = SERVER_URL ? `${SERVER_URL.replace(/\/$/, '')}/api` : '/api';

export function getToken(): string | null {
  return localStorage.getItem('sphere_token');
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem('sphere_token', token);
  } else {
    localStorage.removeItem('sphere_token');
  }
}

// Check if running on GitHub Pages or static host without remote backend
const isStaticHost =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('github.io') ||
   window.location.hostname.includes('surge.sh') ||
   window.location.protocol === 'file:') &&
  !SERVER_URL;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new Error(err?.message || 'Network connection failed');
  }

  let data: any;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = { error: res.statusText || `Request failed (${res.status})` };
  }

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data as T;
}

// Executes remote request, or falls back to local storage if running on static host or remote returns 405/404/network failure
async function execute<T>(remoteFn: () => Promise<T>, fallbackFn: () => Promise<T>): Promise<T> {
  if (isStaticHost) {
    return fallbackFn();
  }
  try {
    return await remoteFn();
  } catch (err: any) {
    console.warn('[Sphere API] Remote call unreachable/failed, using local storage:', err.message);
    return fallbackFn();
  }
}

export const api = {
  auth: {
    login: (login: string, password: string) =>
      execute(
        () =>
          request<{ user: User; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ login, password }),
          }),
        () => localStore.auth.login(login, password)
      ),

    register: (username: string, email: string, password: string, name: string) =>
      execute(
        () =>
          request<{ user: User; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, name }),
          }),
        () => localStore.auth.register(username, email, password, name)
      ),

    me: () =>
      execute(
        () => request<{ user: User }>('/auth/me'),
        () => localStore.auth.me()
      ),
  },

  posts: {
    getFeed: () =>
      execute(
        () => request<{ posts: Post[] }>('/posts/feed'),
        () => localStore.posts.getFeed()
      ),

    create: (
      mediaUrls: string[],
      filter: string,
      caption: string,
      location?: string,
      songTitle?: string,
      songArtist?: string,
      songUrl?: string
    ) =>
      execute(
        () =>
          request<{ post: Post }>('/posts', {
            method: 'POST',
            body: JSON.stringify({ mediaUrls, filter, caption, location, songTitle, songArtist, songUrl }),
          }),
        () => localStore.posts.create(mediaUrls, filter, caption, location, songTitle, songArtist, songUrl)
      ),

    like: (postId: string) =>
      execute(
        () =>
          request<{ isLiked: boolean; likesCount: number }>(`/posts/${postId}/like`, {
            method: 'POST',
          }),
        () => localStore.posts.like(postId)
      ),

    save: (postId: string) =>
      execute(
        () =>
          request<{ isSaved: boolean }>(`/posts/${postId}/save`, {
            method: 'POST',
          }),
        () => localStore.posts.save(postId)
      ),

    addComment: (postId: string, text: string) =>
      execute(
        () =>
          request<{ comment: any }>(`/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ text }),
          }),
        () => localStore.posts.addComment(postId, text)
      ),

    likeComment: (commentId: string) =>
      execute(
        () =>
          request<{ isLiked: boolean; likesCount: number }>(`/posts/comments/${commentId}/like`, {
            method: 'POST',
          }),
        () => localStore.posts.likeComment(commentId)
      ),

    getDetail: (postId: string) =>
      execute(
        () => request<{ post: Post }>(`/posts/${postId}`),
        () => localStore.posts.getDetail(postId)
      ),

    update: (
      postId: string,
      updates: {
        caption?: string;
        location?: string;
        songTitle?: string;
        songArtist?: string;
        songUrl?: string;
      }
    ) =>
      execute(
        () =>
          request<{ post: Post }>(`/posts/${postId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          }),
        () => localStore.posts.update(postId, updates)
      ),

    delete: (postId: string) =>
      execute(
        () =>
          request<{ success: boolean; postId: string }>(`/posts/${postId}`, {
            method: 'DELETE',
          }),
        () => localStore.posts.delete(postId)
      ),
  },

  stories: {
    getAll: () =>
      execute(
        () => request<{ stories: Story[] }>('/stories'),
        () => localStore.stories.getAll()
      ),

    create: (
      mediaUrl: string,
      caption?: string,
      duration?: number,
      songTitle?: string,
      songArtist?: string,
      songUrl?: string
    ) =>
      execute(
        () =>
          request<{ slide: any }>('/stories', {
            method: 'POST',
            body: JSON.stringify({ mediaUrl, caption, duration, songTitle, songArtist, songUrl }),
          }),
        () => localStore.stories.create(mediaUrl, caption, duration, songTitle, songArtist, songUrl)
      ),

    view: (storyId: string) =>
      execute(
        () =>
          request<{ success: boolean }>(`/stories/${storyId}/view`, {
            method: 'POST',
          }),
        () => localStore.stories.view(storyId)
      ),

    delete: (storyId: string) =>
      execute(
        () =>
          request<{ success: boolean; storyId: string }>(`/stories/${storyId}`, {
            method: 'DELETE',
          }),
        () => localStore.stories.delete(storyId)
      ),
  },

  reels: {
    getAll: () =>
      execute(
        () => request<{ reels: Reel[] }>('/reels'),
        () => localStore.reels.getAll()
      ),

    like: (reelId: string) =>
      execute(
        () =>
          request<{ isLiked: boolean; likesCount: number }>(`/reels/${reelId}/like`, {
            method: 'POST',
          }),
        () => localStore.reels.like(reelId)
      ),

    save: (reelId: string) =>
      execute(
        () =>
          request<{ isSaved: boolean }>(`/reels/${reelId}/save`, {
            method: 'POST',
          }),
        () => localStore.reels.save(reelId)
      ),
  },

  users: {
    getProfile: (username: string) =>
      execute(
        () => request<{ profile: any }>(`/users/profile/${username}`),
        () => localStore.users.getProfile(username)
      ),

    updateProfile: (updates: Partial<User>) =>
      execute(
        () =>
          request<{ user: User }>('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(updates),
          }),
        () => localStore.users.updateProfile(updates)
      ),

    follow: (userId: string) =>
      execute(
        () =>
          request<{ isFollowing: boolean }>(`/users/${userId}/follow`, {
            method: 'POST',
          }),
        () => localStore.users.follow(userId)
      ),

    getFollowers: (userId: string) =>
      execute(
        () => request<{ users: User[] }>(`/users/${userId}/followers`),
        () => localStore.users.getFollowers(userId)
      ),

    getFollowing: (userId: string) =>
      execute(
        () => request<{ users: User[] }>(`/users/${userId}/following`),
        () => localStore.users.getFollowing(userId)
      ),

    block: (userId: string) =>
      execute(
        () =>
          request<{ isBlocked: boolean }>(`/users/${userId}/block`, {
            method: 'POST',
          }),
        () => localStore.users.block(userId)
      ),

    getBlockedUsers: () =>
      execute(
        () => request<{ users: User[] }>('/users/blocked'),
        () => localStore.users.getBlockedUsers()
      ),

    suggested: () =>
      execute(
        () => request<{ users: User[] }>('/users/suggested'),
        () => localStore.users.suggested()
      ),

    search: (query: string) =>
      execute(
        () => request<{ users: User[] }>(`/users/search?q=${encodeURIComponent(query)}`),
        () => localStore.users.search(query)
      ),
  },

  messages: {
    getConversations: () =>
      execute(
        () => request<{ conversations: Conversation[] }>('/messages/conversations'),
        () => localStore.messages.getConversations()
      ),

    getOrCreateConversation: (recipientId: string) =>
      execute(
        () =>
          request<{ conversation: Conversation }>('/messages/conversations', {
            method: 'POST',
            body: JSON.stringify({ recipientId }),
          }),
        () => localStore.messages.getOrCreateConversation(recipientId)
      ),

    sendMessage: (convId: string, text: string, mediaUrl?: string) =>
      execute(
        () =>
          request<{ message: any }>(`/messages/conversations/${convId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ text, mediaUrl }),
          }),
        () => localStore.messages.sendMessage(convId, text, mediaUrl)
      ),
  },

  notifications: {
    getAll: () =>
      execute(
        () => request<{ notifications: NotificationItem[] }>('/notifications'),
        () => localStore.notifications.getAll()
      ),

    markRead: (notifId: string) =>
      execute(
        () =>
          request<{ success: boolean }>(`/notifications/${notifId}/read`, {
            method: 'PUT',
          }),
        () => localStore.notifications.markRead(notifId)
      ),

    markAllRead: () =>
      execute(
        () =>
          request<{ success: boolean }>('/notifications/read-all', {
            method: 'PUT',
          }),
        () => localStore.notifications.markAllRead()
      ),
  },
};
