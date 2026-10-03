import { User, Post, Story, Reel, Conversation, NotificationItem } from '../types';

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

export const api = {
  auth: {
    login: (login: string, password: string) =>
      request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, password }),
      }),
    register: (username: string, email: string, password: string, name: string) =>
      request<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, name }),
      }),
    me: () => request<{ user: User }>('/auth/me'),
  },

  posts: {
    getFeed: () => request<{ posts: Post[] }>('/posts/feed'),
    create: (
      mediaUrls: string[],
      filter: string,
      caption: string,
      location?: string,
      songTitle?: string,
      songArtist?: string,
      songUrl?: string
    ) =>
      request<{ post: Post }>('/posts', {
        method: 'POST',
        body: JSON.stringify({ mediaUrls, filter, caption, location, songTitle, songArtist, songUrl }),
      }),
    like: (postId: string) =>
      request<{ isLiked: boolean; likesCount: number }>(`/posts/${postId}/like`, {
        method: 'POST',
      }),
    save: (postId: string) =>
      request<{ isSaved: boolean }>(`/posts/${postId}/save`, {
        method: 'POST',
      }),
    addComment: (postId: string, text: string) =>
      request<{ comment: any }>(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      }),
    likeComment: (commentId: string) =>
      request<{ isLiked: boolean; likesCount: number }>(`/posts/comments/${commentId}/like`, {
        method: 'POST',
      }),
    getDetail: (postId: string) => request<{ post: Post }>(`/posts/${postId}`),
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
      request<{ post: Post }>(`/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (postId: string) =>
      request<{ success: boolean; postId: string }>(`/posts/${postId}`, {
        method: 'DELETE',
      }),
  },

  stories: {
    getAll: () => request<{ stories: Story[] }>('/stories'),
    create: (
      mediaUrl: string,
      caption?: string,
      duration?: number,
      songTitle?: string,
      songArtist?: string,
      songUrl?: string
    ) =>
      request<{ slide: any }>('/stories', {
        method: 'POST',
        body: JSON.stringify({ mediaUrl, caption, duration, songTitle, songArtist, songUrl }),
      }),
    view: (storyId: string) =>
      request<{ success: boolean }>(`/stories/${storyId}/view`, {
        method: 'POST',
      }),
    delete: (storyId: string) =>
      request<{ success: boolean; storyId: string }>(`/stories/${storyId}`, {
        method: 'DELETE',
      }),
  },

  reels: {
    getAll: () => request<{ reels: Reel[] }>('/reels'),
    like: (reelId: string) =>
      request<{ isLiked: boolean; likesCount: number }>(`/reels/${reelId}/like`, {
        method: 'POST',
      }),
    save: (reelId: string) =>
      request<{ isSaved: boolean }>(`/reels/${reelId}/save`, {
        method: 'POST',
      }),
  },

  users: {
    getProfile: (username: string) => request<{ profile: any }>(`/users/profile/${username}`),
    updateProfile: (updates: Partial<User>) =>
      request<{ user: User }>('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    follow: (userId: string) =>
      request<{ isFollowing: boolean }>(`/users/${userId}/follow`, {
        method: 'POST',
      }),
    suggested: () => request<{ users: User[] }>('/users/suggested'),
    search: (query: string) => request<{ users: User[] }>(`/users/search?q=${encodeURIComponent(query)}`),
  },

  messages: {
    getConversations: () => request<{ conversations: Conversation[] }>('/messages/conversations'),
    getOrCreateConversation: (recipientId: string) =>
      request<{ conversation: Conversation }>('/messages/conversations', {
        method: 'POST',
        body: JSON.stringify({ recipientId }),
      }),
    sendMessage: (convId: string, text: string, mediaUrl?: string) =>
      request<{ message: any }>(`/messages/conversations/${convId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text, mediaUrl }),
      }),
  },

  notifications: {
    getAll: () => request<{ notifications: NotificationItem[] }>('/notifications'),
    markRead: (notifId: string) =>
      request<{ success: boolean }>(`/notifications/${notifId}/read`, {
        method: 'PUT',
      }),
    markAllRead: () =>
      request<{ success: boolean }>('/notifications/read-all', {
        method: 'PUT',
      }),
  },
};
