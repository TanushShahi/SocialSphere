import { User, Post, Story, Reel, Conversation, NotificationItem, Comment } from '../types';

const USERS_KEY = 'sphere_local_users';
const POSTS_KEY = 'sphere_local_posts';
const STORIES_KEY = 'sphere_local_stories';
const CONVERSATIONS_KEY = 'sphere_local_conversations';
const CURRENT_USER_ID_KEY = 'sphere_current_user_id';

interface StoredUser extends User {
  password?: string;
  email?: string;
}

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Local storage quota exceeded or write failed:', err);
  }
}

function getCurrentUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_ID_KEY);
}

function setCurrentUserId(id: string | null): void {
  if (id) {
    localStorage.setItem(CURRENT_USER_ID_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  }
}

export const localStore = {
  auth: {
    async register(username: string, email: string, password: string, name: string): Promise<{ user: User; token: string }> {
      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const trimmedUser = username.trim().toLowerCase();
      const trimmedEmail = email.trim().toLowerCase();

      if (users.some(u => u.username.toLowerCase() === trimmedUser)) {
        throw new Error('Username is already taken');
      }

      const defaultAvatars = [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
      ];
      const avatar = defaultAvatars[users.length % defaultAvatars.length];

      const newUser: StoredUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        username: username.trim(),
        email: trimmedEmail,
        password,
        name: name.trim() || username.trim(),
        avatar,
        bio: 'Explorer of the Social Sphere ✨',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isVerified: true
      };

      users.push(newUser);
      setItem(USERS_KEY, users);
      setCurrentUserId(newUser.id);
      const token = `local_jwt_${newUser.id}_${Date.now()}`;

      const { password: _, email: __, ...userClean } = newUser;
      return { user: userClean as User, token };
    },

    async login(login: string, pass: string): Promise<{ user: User; token: string }> {
      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const target = login.trim().toLowerCase();

      const found = users.find(u => 
        u.username.toLowerCase() === target || (u.email && u.email.toLowerCase() === target)
      );

      if (!found) {
        throw new Error('User not found. Please register first.');
      }

      if (found.password && found.password !== pass) {
        throw new Error('Incorrect password');
      }

      setCurrentUserId(found.id);
      const token = `local_jwt_${found.id}_${Date.now()}`;
      const { password: _, email: __, ...userClean } = found;
      return { user: userClean as User, token };
    },

    async me(): Promise<{ user: User }> {
      const currentId = getCurrentUserId();
      if (!currentId) throw new Error('Not authenticated');

      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const found = users.find(u => u.id === currentId);
      if (!found) throw new Error('User not found');

      const { password: _, email: __, ...userClean } = found;
      return { user: userClean as User };
    }
  },

  posts: {
    async getFeed(): Promise<{ posts: Post[] }> {
      const posts = getItem<Post[]>(POSTS_KEY, []);
      return { posts };
    },

    async create(
      mediaUrls: string[],
      filter: string,
      caption: string,
      location?: string,
      songTitle?: string,
      songArtist?: string,
      songUrl?: string
    ): Promise<{ post: Post }> {
      const { user } = await localStore.auth.me();
      const posts = getItem<Post[]>(POSTS_KEY, []);

      const newPost: Post = {
        id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user,
        media: mediaUrls.map((url, i) => ({
          id: `med_${Date.now()}_${i}`,
          url,
          type: 'image',
          filter: filter || 'normal'
        })),
        caption: caption || '',
        location: location || '',
        songTitle: songTitle || '',
        songArtist: songArtist || '',
        songUrl: songUrl || '',
        likesCount: 0,
        isLiked: false,
        isSaved: false,
        comments: [],
        createdAt: 'Just now'
      };

      posts.unshift(newPost);
      setItem(POSTS_KEY, posts);

      // Increment user postsCount
      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].postsCount = (users[userIndex].postsCount || 0) + 1;
        setItem(USERS_KEY, users);
      }

      return { post: newPost };
    },

    async like(postId: string): Promise<{ isLiked: boolean; likesCount: number }> {
      const posts = getItem<Post[]>(POSTS_KEY, []);
      const post = posts.find(p => p.id === postId);
      if (!post) throw new Error('Post not found');

      post.isLiked = !post.isLiked;
      post.likesCount = post.isLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1);
      setItem(POSTS_KEY, posts);

      return { isLiked: post.isLiked, likesCount: post.likesCount };
    },

    async save(postId: string): Promise<{ isSaved: boolean }> {
      const posts = getItem<Post[]>(POSTS_KEY, []);
      const post = posts.find(p => p.id === postId);
      if (!post) throw new Error('Post not found');

      post.isSaved = !post.isSaved;
      setItem(POSTS_KEY, posts);

      return { isSaved: post.isSaved };
    },

    async addComment(postId: string, text: string): Promise<{ comment: any }> {
      const { user } = await localStore.auth.me();
      const posts = getItem<Post[]>(POSTS_KEY, []);
      const post = posts.find(p => p.id === postId);
      if (!post) throw new Error('Post not found');

      const comment: Comment = {
        id: `comm_${Date.now()}`,
        postId,
        user,
        text,
        createdAt: 'Just now',
        likesCount: 0,
        isLiked: false
      };

      post.comments.push(comment);
      setItem(POSTS_KEY, posts);

      return { comment };
    },

    async likeComment(commentId: string): Promise<{ isLiked: boolean; likesCount: number }> {
      const posts = getItem<Post[]>(POSTS_KEY, []);
      let target: Comment | undefined;

      for (const p of posts) {
        const c = p.comments.find(comm => comm.id === commentId);
        if (c) {
          target = c;
          break;
        }
      }

      if (!target) return { isLiked: false, likesCount: 0 };
      target.isLiked = !target.isLiked;
      target.likesCount = target.isLiked ? target.likesCount + 1 : Math.max(0, target.likesCount - 1);
      setItem(POSTS_KEY, posts);

      return { isLiked: target.isLiked, likesCount: target.likesCount };
    },

    async getDetail(postId: string): Promise<{ post: Post }> {
      const posts = getItem<Post[]>(POSTS_KEY, []);
      const post = posts.find(p => p.id === postId);
      if (!post) throw new Error('Post not found');
      return { post };
    },

    async update(postId: string, updates: any): Promise<{ post: Post }> {
      const posts = getItem<Post[]>(POSTS_KEY, []);
      const post = posts.find(p => p.id === postId);
      if (!post) throw new Error('Post not found');

      Object.assign(post, updates);
      setItem(POSTS_KEY, posts);
      return { post };
    },

    async delete(postId: string): Promise<{ success: boolean; postId: string }> {
      let posts = getItem<Post[]>(POSTS_KEY, []);
      posts = posts.filter(p => p.id !== postId);
      setItem(POSTS_KEY, posts);
      return { success: true, postId };
    }
  },

  stories: {
    async getAll(): Promise<{ stories: Story[] }> {
      const stories = getItem<Story[]>(STORIES_KEY, []);
      return { stories };
    },

    async create(
      mediaUrl: string,
      caption?: string,
      duration?: number,
      songTitle?: string,
      songArtist?: string,
      songUrl?: string
    ): Promise<{ slide: any }> {
      const { user } = await localStore.auth.me();
      const stories = getItem<Story[]>(STORIES_KEY, []);

      const newSlide = {
        id: `slide_${Date.now()}`,
        url: mediaUrl,
        type: 'image' as const,
        caption,
        duration: duration || 5,
        songTitle,
        songArtist,
        songUrl,
        createdAt: 'Just now'
      };

      const existingStory = stories.find(s => s.user.id === user.id);
      if (existingStory) {
        existingStory.slides.unshift(newSlide);
        existingStory.hasUnseen = true;
      } else {
        stories.unshift({
          id: `story_${Date.now()}`,
          user,
          hasUnseen: true,
          slides: [newSlide]
        });
      }

      setItem(STORIES_KEY, stories);
      return { slide: newSlide };
    },

    async view(storyId: string): Promise<{ success: boolean }> {
      const stories = getItem<Story[]>(STORIES_KEY, []);
      const story = stories.find(s => s.id === storyId);
      if (story) {
        story.hasUnseen = false;
        setItem(STORIES_KEY, stories);
      }
      return { success: true };
    },

    async delete(storyId: string): Promise<{ success: boolean; storyId: string }> {
      let stories = getItem<Story[]>(STORIES_KEY, []);
      stories = stories.filter(s => s.id !== storyId);
      setItem(STORIES_KEY, stories);
      return { success: true, storyId };
    }
  },

  reels: {
    async getAll(): Promise<{ reels: Reel[] }> {
      return { reels: [] };
    },
    async like(reelId: string): Promise<{ isLiked: boolean; likesCount: number }> {
      return { isLiked: true, likesCount: 1 };
    },
    async save(reelId: string): Promise<{ isSaved: boolean }> {
      return { isSaved: true };
    }
  },

  users: {
    async getProfile(username: string): Promise<{ profile: any }> {
      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const found = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (!found) throw new Error('User not found');

      const posts = getItem<Post[]>(POSTS_KEY, []).filter(p => p.user.id === found.id);
      const { password: _, email: __, ...cleanUser } = found;

      return {
        profile: {
          ...cleanUser,
          posts,
          postsCount: posts.length
        }
      };
    },

    async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
      const { user } = await localStore.auth.me();
      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        Object.assign(users[idx], updates);
        setItem(USERS_KEY, users);
      }

      const updated = { ...user, ...updates };
      return { user: updated };
    },

    async follow(userId: string): Promise<{ isFollowing: boolean }> {
      return { isFollowing: true };
    },

    async suggested(): Promise<{ users: User[] }> {
      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const currentId = getCurrentUserId();
      const clean = users
        .filter(u => u.id !== currentId)
        .map(({ password: _, email: __, ...u }) => u as User);
      return { users: clean };
    },

    async search(query: string): Promise<{ users: User[] }> {
      const q = query.trim().toLowerCase();
      if (!q) return { users: [] };
      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const clean = users
        .filter(u => u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
        .map(({ password: _, email: __, ...u }) => u as User);
      return { users: clean };
    }
  },

  messages: {
    async getConversations(): Promise<{ conversations: Conversation[] }> {
      const convs = getItem<Conversation[]>(CONVERSATIONS_KEY, []);
      return { conversations: convs };
    },

    async getOrCreateConversation(recipientId: string): Promise<{ conversation: Conversation }> {
      const { user: me } = await localStore.auth.me();
      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const recipient = users.find(u => u.id === recipientId);
      if (!recipient) throw new Error('Recipient not found');

      const convs = getItem<Conversation[]>(CONVERSATIONS_KEY, []);
      let conv = convs.find(c => c.participant.id === recipientId);

      if (!conv) {
        conv = {
          id: `conv_${Date.now()}`,
          participant: recipient as User,
          messages: [],
          unreadCount: 0
        };
        convs.unshift(conv);
        setItem(CONVERSATIONS_KEY, convs);
      }

      return { conversation: conv };
    },

    async sendMessage(convId: string, text: string, mediaUrl?: string): Promise<{ message: any }> {
      const { user: me } = await localStore.auth.me();
      const convs = getItem<Conversation[]>(CONVERSATIONS_KEY, []);
      const conv = convs.find(c => c.id === convId);
      if (!conv) throw new Error('Conversation not found');

      const msg = {
        id: `msg_${Date.now()}`,
        senderId: me.id,
        receiverId: conv.participant.id,
        text,
        mediaUrl,
        createdAt: 'Just now',
        isRead: true
      };

      conv.messages.push(msg);
      setItem(CONVERSATIONS_KEY, convs);

      return { message: msg };
    }
  },

  notifications: {
    async getAll(): Promise<{ notifications: NotificationItem[] }> {
      return { notifications: [] };
    },
    async markRead(notifId: string): Promise<{ success: boolean }> {
      return { success: true };
    },
    async markAllRead(): Promise<{ success: boolean }> {
      return { success: true };
    }
  }
};
