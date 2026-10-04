import { User, Post, Story, Reel, Conversation, NotificationItem, Comment, FollowRelation, BlockRelation } from '../types';
import { idbGet, idbSet } from './indexedDB';

const USERS_KEY = 'sphere_local_users';
const POSTS_KEY = 'sphere_local_posts';
const STORIES_KEY = 'sphere_local_stories';
const CONVERSATIONS_KEY = 'sphere_local_conversations';
const CURRENT_USER_ID_KEY = 'sphere_current_user_id';
const CURRENT_USER_KEY = 'sphere_current_user';
const FOLLOWS_KEY = 'sphere_local_follows';
const BLOCKS_KEY = 'sphere_local_blocks';

interface StoredUser extends User {
  password?: string;
  email?: string;
}

const memCache: Record<string, any> = {};

function getItem<T>(key: string, defaultValue: T): T {
  const cached = memCache[key];
  if (cached !== undefined && cached !== null) {
    if (Array.isArray(defaultValue)) {
      if (Array.isArray(cached)) return cached as T;
    } else {
      return cached as T;
    }
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'null' || raw === 'undefined') {
      memCache[key] = defaultValue;
      return defaultValue;
    }
    const val = JSON.parse(raw);
    if (val === null || val === undefined) {
      memCache[key] = defaultValue;
      return defaultValue;
    }
    if (Array.isArray(defaultValue) && !Array.isArray(val)) {
      memCache[key] = defaultValue;
      return defaultValue;
    }
    memCache[key] = val;
    return val as T;
  } catch {
    memCache[key] = defaultValue;
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  memCache[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage quota limit reached, saving to IndexedDB:', err);
  }
  idbSet(key, value).catch(() => {});
}

const DEFAULT_COMMUNITY_USERS: StoredUser[] = [
  {
    id: 'usr_tanush',
    username: 'tanush',
    name: 'Tanush Shahi',
    email: 'tanush@sphere.app',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Founder of Social Sphere 🌌 Building the future of connected social worlds.',
    followersCount: 1240,
    followingCount: 180,
    postsCount: 1,
    isVerified: true
  },
  {
    id: 'usr_alex',
    username: 'alex_creator',
    name: 'Alex Rivera',
    email: 'alex@sphere.app',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Visual artist & digital creator ✨ Exploring celestial aesthetics.',
    followersCount: 950,
    followingCount: 220,
    postsCount: 1,
    isVerified: true
  },
  {
    id: 'usr_sophia',
    username: 'sophia_celestial',
    name: 'Sophia Chen',
    email: 'sophia@sphere.app',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    bio: 'Cosmic beats & stellar visuals 🎧 Stargazer & UI designer.',
    followersCount: 1420,
    followingCount: 310,
    postsCount: 0,
    isVerified: true
  },
  {
    id: 'usr_liam',
    username: 'liam_sound',
    name: 'Liam Vance',
    email: 'liam@sphere.app',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    bio: 'Music producer & audio engineer 🎵 Ambient synth waves.',
    followersCount: 880,
    followingCount: 150,
    postsCount: 0,
    isVerified: true
  }
];

export async function initLocalStore(): Promise<void> {
  const listKeys = [USERS_KEY, POSTS_KEY, STORIES_KEY, CONVERSATIONS_KEY, FOLLOWS_KEY, BLOCKS_KEY];
  const otherKeys = [CURRENT_USER_KEY, CURRENT_USER_ID_KEY];

  for (const key of listKeys) {
    let val = await idbGet<any>(key);
    if (!val || !Array.isArray(val)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw && raw !== 'null' && raw !== 'undefined') {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) val = parsed;
        }
      } catch {}
    }
    const safeList = Array.isArray(val) ? val : [];
    memCache[key] = safeList;
    try {
      localStorage.setItem(key, JSON.stringify(safeList));
    } catch {}
    idbSet(key, safeList).catch(() => {});
  }

  // Ensure default community creators exist in USERS_KEY so friend search always finds creators
  const currentUsers = Array.isArray(memCache[USERS_KEY]) ? (memCache[USERS_KEY] as StoredUser[]) : [];
  let updatedUsers = false;
  for (const seed of DEFAULT_COMMUNITY_USERS) {
    if (!currentUsers.some(u => u && (u.id === seed.id || (u.username && u.username.toLowerCase() === seed.username.toLowerCase())))) {
      currentUsers.push(seed);
      updatedUsers = true;
    }
  }
  if (updatedUsers || currentUsers.length === 0) {
    memCache[USERS_KEY] = currentUsers;
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(currentUsers));
    } catch {}
    idbSet(USERS_KEY, currentUsers).catch(() => {});
  }

  // Ensure initial welcome posts exist if POSTS_KEY is empty
  const currentPosts = Array.isArray(memCache[POSTS_KEY]) ? (memCache[POSTS_KEY] as Post[]) : [];
  if (currentPosts.length === 0) {
    const welcomePost: Post = {
      id: 'post_welcome_sphere',
      user: {
        id: 'usr_tanush',
        username: 'tanush',
        name: 'Tanush Shahi',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        followersCount: 1240,
        followingCount: 180,
        postsCount: 1,
        isVerified: true
      },
      media: [
        {
          id: 'med_welcome_1',
          url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&auto=format&fit=crop&q=80',
          type: 'image',
          filter: 'normal'
        },
        {
          id: 'med_welcome_2',
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&auto=format&fit=crop&q=80',
          type: 'image',
          filter: 'celestial'
        }
      ],
      caption: 'Welcome to Social Sphere! 🌌 Connect with friends worldwide using your unique Sphere ID.',
      location: 'Cosmic Core Orbit',
      songTitle: 'Starfall Reverie',
      songArtist: 'Sphere Soundscapes',
      songUrl: 'https://cdn.freesound.org/previews/612/612089_5674468-lq.mp3',
      likesCount: 128,
      isLiked: false,
      isSaved: false,
      comments: [
        {
          id: 'comm_welcome_1',
          postId: 'post_welcome_sphere',
          user: {
            id: 'usr_alex',
            username: 'alex_creator',
            name: 'Alex Rivera',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            followersCount: 950,
            followingCount: 220,
            postsCount: 1,
            isVerified: true
          },
          text: 'The friend discovery radar and celestial vibes are next level! ✨',
          createdAt: 'Just now',
          likesCount: 12,
          isLiked: false
        }
      ],
      createdAt: new Date().toISOString()
    };
    currentPosts.push(welcomePost);
    memCache[POSTS_KEY] = currentPosts;
    try {
      localStorage.setItem(POSTS_KEY, JSON.stringify(currentPosts));
    } catch {}
    idbSet(POSTS_KEY, currentPosts).catch(() => {});
  }

  for (const key of otherKeys) {
    let val = await idbGet<any>(key);
    if (val === null || val === undefined) {
      try {
        const raw = localStorage.getItem(key);
        if (raw && raw !== 'null' && raw !== 'undefined') {
          val = key === CURRENT_USER_ID_KEY ? raw : JSON.parse(raw);
        }
      } catch {}
    }
    if (val !== null && val !== undefined) {
      memCache[key] = val;
    }
  }
}

function getCurrentUserId(): string | null {
  const memId = memCache[CURRENT_USER_ID_KEY];
  if (memId && typeof memId === 'string') return memId;
  const localId = localStorage.getItem(CURRENT_USER_ID_KEY);
  if (localId) return localId;
  
  // Try extracting from sphere_current_user
  try {
    const cachedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      if (parsed?.id) return parsed.id;
    }
  } catch {}

  // Try extracting from sphere_token (format: local_jwt_<userId>_<timestamp>)
  const token = localStorage.getItem('sphere_token');
  if (token && token.startsWith('local_jwt_')) {
    const parts = token.split('_');
    if (parts.length >= 3) {
      return parts.slice(2, parts.length - 1).join('_');
    }
  }

  return null;
}

function setCurrentUserId(id: string | null): void {
  memCache[CURRENT_USER_ID_KEY] = id;
  if (id) {
    try {
      localStorage.setItem(CURRENT_USER_ID_KEY, id);
    } catch {}
    idbSet(CURRENT_USER_ID_KEY, id).catch(() => {});
  } else {
    try {
      localStorage.removeItem(CURRENT_USER_ID_KEY);
    } catch {}
    idbSet(CURRENT_USER_ID_KEY, null).catch(() => {});
  }
}

function getFollows(): FollowRelation[] {
  return getItem<FollowRelation[]>(FOLLOWS_KEY, []);
}

function setFollows(follows: FollowRelation[]): void {
  setItem(FOLLOWS_KEY, follows);
}

function getBlocks(): BlockRelation[] {
  return getItem<BlockRelation[]>(BLOCKS_KEY, []);
}

function setBlocks(blocks: BlockRelation[]): void {
  setItem(BLOCKS_KEY, blocks);
}

function getBlockedIdsForUser(userId: string): Set<string> {
  const blocks = getBlocks();
  const blockedIds = new Set<string>();
  for (const b of blocks) {
    if (b.blockerId === userId) {
      blockedIds.add(b.blockedId);
    } else if (b.blockedId === userId) {
      blockedIds.add(b.blockerId);
    }
  }
  return blockedIds;
}

export const localStore = {
  auth: {
    async register(username: string, email: string, password: string, name: string): Promise<{ user: User; token: string }> {
      const rawUsers = getItem<StoredUser[]>(USERS_KEY, []);
      const users: StoredUser[] = Array.isArray(rawUsers) ? rawUsers : [];
      const trimmedUser = username.trim().toLowerCase();
      const trimmedEmail = email.trim().toLowerCase();

      if (Array.isArray(users) && users.some(u => u && u.username && u.username.toLowerCase() === trimmedUser)) {
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
      const rawUsers = getItem<StoredUser[]>(USERS_KEY, []);
      const users: StoredUser[] = Array.isArray(rawUsers) ? rawUsers : [];
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
      const rawUsers = getItem<StoredUser[]>(USERS_KEY, []);
      const users: StoredUser[] = Array.isArray(rawUsers) ? rawUsers : [];
      
      let found: StoredUser | undefined;
      if (currentId) {
        found = users.find(u => u.id === currentId);
      }

      // If not found by ID, try finding from cached user
      if (!found) {
        try {
          const cachedRaw = localStorage.getItem(CURRENT_USER_KEY);
          if (cachedRaw) {
            const parsed = JSON.parse(cachedRaw);
            if (parsed?.id) {
              found = parsed;
              if (Array.isArray(users) && !users.some(u => u && u.id === parsed.id)) {
                users.push(parsed);
                setItem(USERS_KEY, users);
              }
            }
          }
        } catch {}
      }

      // If still not found, but we have users in storage, fallback to first user
      if (!found && users.length > 0) {
        found = users[0];
        setCurrentUserId(found.id);
      }

      if (!found) {
        throw new Error('Not authenticated');
      }

      const follows = getFollows();
      const followersCount = follows.filter(f => f.followingId === found!.id).length;
      const followingCount = follows.filter(f => f.followerId === found!.id).length;

      const { password: _, email: __, ...userClean } = found;
      const finalUser = { 
        ...userClean, 
        followersCount: followersCount || found.followersCount || 0, 
        followingCount: followingCount || found.followingCount || 0 
      } as User;

      // Update cached user
      try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(finalUser));
        localStorage.setItem(CURRENT_USER_ID_KEY, finalUser.id);
      } catch {}

      return { user: finalUser };
    }
  },

  posts: {
    async getFeed(): Promise<{ posts: Post[] }> {
      const posts = getItem<Post[]>(POSTS_KEY, []);
      const currentId = getCurrentUserId();
      if (!currentId) return { posts };
      const blocked = getBlockedIdsForUser(currentId);
      const follows = getFollows();
      const followingSet = new Set(
        follows.filter(f => f.followerId === currentId).map(f => f.followingId)
      );

      const filtered = posts
        .filter(p => !blocked.has(p.user.id))
        .map(p => ({
          ...p,
          user: {
            ...p.user,
            isFollowing: followingSet.has(p.user.id)
          }
        }));

      return { posts: filtered };
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
      let user: User;
      try {
        const authRes = await localStore.auth.me();
        user = authRes.user;
      } catch {
        try {
          const cachedRaw = localStorage.getItem(CURRENT_USER_KEY);
          if (cachedRaw) {
            user = JSON.parse(cachedRaw);
          } else {
            const users = getItem<StoredUser[]>(USERS_KEY, []);
            if (users.length > 0) {
              const { password: _, email: __, ...cleanUser } = users[0];
              user = cleanUser as User;
            } else {
              user = {
                id: getCurrentUserId() || `usr_${Date.now()}`,
                username: 'creator',
                name: 'Social Sphere Creator',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                bio: 'Creator on Social Sphere ✨',
                followersCount: 0,
                followingCount: 0,
                postsCount: 1,
                isVerified: true
              };
            }
          }
        } catch {
          user = {
            id: getCurrentUserId() || `usr_${Date.now()}`,
            username: 'creator',
            name: 'Social Sphere Creator',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            bio: 'Creator on Social Sphere ✨',
            followersCount: 0,
            followingCount: 0,
            postsCount: 1,
            isVerified: true
          };
        }
      }
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
        createdAt: new Date().toISOString()
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
        createdAt: new Date().toISOString(),
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
      const currentId = getCurrentUserId();
      if (!currentId) return { stories };
      const blocked = getBlockedIdsForUser(currentId);
      return { stories: stories.filter(s => !blocked.has(s.user.id)) };
    },

    async create(
      mediaUrl: string,
      caption?: string,
      duration?: number,
      songTitle?: string,
      songArtist?: string,
      songUrl?: string
    ): Promise<{ slide: any }> {
      let user: User;
      try {
        const authRes = await localStore.auth.me();
        user = authRes.user;
      } catch {
        try {
          const cachedRaw = localStorage.getItem(CURRENT_USER_KEY);
          if (cachedRaw) {
            user = JSON.parse(cachedRaw);
          } else {
            const users = getItem<StoredUser[]>(USERS_KEY, []);
            if (users.length > 0) {
              const { password: _, email: __, ...cleanUser } = users[0];
              user = cleanUser as User;
            } else {
              user = {
                id: getCurrentUserId() || `usr_${Date.now()}`,
                username: 'creator',
                name: 'Social Sphere Creator',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                bio: 'Creator on Social Sphere ✨',
                followersCount: 0,
                followingCount: 0,
                postsCount: 1,
                isVerified: true
              };
            }
          }
        } catch {
          user = {
            id: getCurrentUserId() || `usr_${Date.now()}`,
            username: 'creator',
            name: 'Social Sphere Creator',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            bio: 'Creator on Social Sphere ✨',
            followersCount: 0,
            followingCount: 0,
            postsCount: 1,
            isVerified: true
          };
        }
      }
      const stories = getItem<Story[]>(STORIES_KEY, []);

      const newSlide = {
        id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        url: mediaUrl,
        type: 'image' as const,
        caption,
        duration: duration || 5,
        songTitle,
        songArtist,
        songUrl,
        createdAt: new Date().toISOString()
      };

      const existingStory = stories.find(s => s.user.id === user.id);
      if (existingStory) {
        existingStory.slides.push(newSlide);
        existingStory.hasUnseen = true;
      } else {
        stories.unshift({
          id: `story_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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

    async delete(targetId: string): Promise<{ success: boolean; storyId: string }> {
      let stories = getItem<Story[]>(STORIES_KEY, []);
      
      // 1. Remove matching slide from any story
      for (const s of stories) {
        s.slides = s.slides.filter(slide => slide.id !== targetId);
      }
      
      // 2. Remove any story matching targetId directly OR stories with 0 slides remaining
      stories = stories.filter(s => s.id !== targetId && s.slides.length > 0);
      
      setItem(STORIES_KEY, stories);
      return { success: true, storyId: targetId };
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

      const currentId = getCurrentUserId();
      const follows = getFollows();
      const isFollowing = currentId 
        ? follows.some(f => f.followerId === currentId && f.followingId === found.id)
        : false;

      const followersCount = follows.filter(f => f.followingId === found.id).length;
      const followingCount = follows.filter(f => f.followerId === found.id).length;

      const posts = getItem<Post[]>(POSTS_KEY, []).filter(p => p.user.id === found.id);
      const { password: _, email: __, ...cleanUser } = found;

      return {
        profile: {
          ...cleanUser,
          posts,
          postsCount: posts.length,
          followersCount,
          followingCount,
          isFollowing
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
      const currentId = getCurrentUserId();
      if (!currentId) throw new Error('Not authenticated');
      if (currentId === userId) throw new Error('Cannot follow yourself');

      const follows = getFollows();
      const existingIdx = follows.findIndex(f => f.followerId === currentId && f.followingId === userId);
      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const currentUserObj = users.find(u => u.id === currentId);
      const targetUserObj = users.find(u => u.id === userId);

      let isFollowing = false;

      if (existingIdx !== -1) {
        // Unfollow
        follows.splice(existingIdx, 1);
        isFollowing = false;
        if (currentUserObj) {
          currentUserObj.followingCount = Math.max(0, (currentUserObj.followingCount || 1) - 1);
        }
        if (targetUserObj) {
          targetUserObj.followersCount = Math.max(0, (targetUserObj.followersCount || 1) - 1);
        }
      } else {
        // Follow
        follows.push({
          followerId: currentId,
          followingId: userId,
          createdAt: new Date().toISOString()
        });
        isFollowing = true;
        if (currentUserObj) {
          currentUserObj.followingCount = (currentUserObj.followingCount || 0) + 1;
        }
        if (targetUserObj) {
          targetUserObj.followersCount = (targetUserObj.followersCount || 0) + 1;
        }
      }

      setFollows(follows);
      setItem(USERS_KEY, users);

      return { isFollowing };
    },

    async getFollowers(userId: string): Promise<{ users: User[] }> {
      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const follows = getFollows();
      const currentId = getCurrentUserId();
      const blocked = currentId ? getBlockedIdsForUser(currentId) : new Set<string>();

      const followerIds = new Set(
        follows.filter(f => f.followingId === userId).map(f => f.followerId)
      );

      const myFollowingSet = currentId 
        ? new Set(follows.filter(f => f.followerId === currentId).map(f => f.followingId))
        : new Set<string>();

      const result = users
        .filter(u => followerIds.has(u.id) && !blocked.has(u.id))
        .map(({ password: _, email: __, ...u }) => ({
          ...u,
          followersCount: follows.filter(f => f.followingId === u.id).length,
          followingCount: follows.filter(f => f.followerId === u.id).length,
          isFollowing: myFollowingSet.has(u.id)
        } as User));

      return { users: result };
    },

    async getFollowing(userId: string): Promise<{ users: User[] }> {
      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const follows = getFollows();
      const currentId = getCurrentUserId();
      const blocked = currentId ? getBlockedIdsForUser(currentId) : new Set<string>();

      const followingIds = new Set(
        follows.filter(f => f.followerId === userId).map(f => f.followingId)
      );

      const myFollowingSet = currentId 
        ? new Set(follows.filter(f => f.followerId === currentId).map(f => f.followingId))
        : new Set<string>();

      const result = users
        .filter(u => followingIds.has(u.id) && !blocked.has(u.id))
        .map(({ password: _, email: __, ...u }) => ({
          ...u,
          followersCount: follows.filter(f => f.followingId === u.id).length,
          followingCount: follows.filter(f => f.followerId === u.id).length,
          isFollowing: myFollowingSet.has(u.id)
        } as User));

      return { users: result };
    },

    async block(userId: string): Promise<{ isBlocked: boolean }> {
      const currentId = getCurrentUserId();
      if (!currentId) throw new Error('Not authenticated');
      if (currentId === userId) throw new Error('Cannot block yourself');

      const blocks = getBlocks();
      const existingIdx = blocks.findIndex(b => b.blockerId === currentId && b.blockedId === userId);
      let isBlocked = false;

      if (existingIdx !== -1) {
        // Unblock
        blocks.splice(existingIdx, 1);
        isBlocked = false;
      } else {
        // Block
        blocks.push({
          blockerId: currentId,
          blockedId: userId,
          createdAt: new Date().toISOString()
        });
        isBlocked = true;

        // Mutual unfollow when blocked
        let follows = getFollows();
        const initialCount = follows.length;
        follows = follows.filter(
          f => !(
            (f.followerId === currentId && f.followingId === userId) ||
            (f.followerId === userId && f.followingId === currentId)
          )
        );
        if (follows.length !== initialCount) {
          setFollows(follows);
          const users = getItem<StoredUser[]>(USERS_KEY, []);
          for (const u of users) {
            u.followersCount = follows.filter(f => f.followingId === u.id).length;
            u.followingCount = follows.filter(f => f.followerId === u.id).length;
          }
          setItem(USERS_KEY, users);
        }
      }

      setBlocks(blocks);
      return { isBlocked };
    },

    async getBlockedUsers(): Promise<{ users: User[] }> {
      const currentId = getCurrentUserId();
      if (!currentId) return { users: [] };
      const blocks = getBlocks().filter(b => b.blockerId === currentId);
      const blockedIds = new Set(blocks.map(b => b.blockedId));
      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const result = users
        .filter(u => blockedIds.has(u.id))
        .map(({ password: _, email: __, ...u }) => u as User);
      return { users: result };
    },

    async suggested(): Promise<{ users: User[] }> {
      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const currentId = getCurrentUserId();
      const blocked = currentId ? getBlockedIdsForUser(currentId) : new Set<string>();
      const follows = getFollows();
      const myFollowingSet = currentId
        ? new Set(follows.filter(f => f.followerId === currentId).map(f => f.followingId))
        : new Set<string>();

      const clean = users
        .filter(u => u.id !== currentId && !blocked.has(u.id))
        .map(({ password: _, email: __, ...u }) => ({
          ...u,
          followersCount: follows.filter(f => f.followingId === u.id).length,
          followingCount: follows.filter(f => f.followerId === u.id).length,
          isFollowing: myFollowingSet.has(u.id)
        } as User));

      return { users: clean };
    },

    async search(query: string): Promise<{ users: User[] }> {
      const rawQ = (query || '').trim();
      if (!rawQ) return { users: [] };
      const cleanQ = rawQ.replace(/^@+/, '').toLowerCase();

      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const currentId = getCurrentUserId();
      const blocked = currentId ? getBlockedIdsForUser(currentId) : new Set<string>();
      const follows = getFollows();
      const myFollowingSet = currentId
        ? new Set(follows.filter(f => f.followerId === currentId).map(f => f.followingId))
        : new Set<string>();

      const matched = users
        .filter(u => {
          if (!u || blocked.has(u.id)) return false;
          const uid = (u.id || '').toLowerCase();
          const uname = (u.username || '').toLowerCase();
          const dname = (u.name || '').toLowerCase();
          const uemail = (u.email || '').toLowerCase();

          return (
            uid.includes(cleanQ) ||
            uname.includes(cleanQ) ||
            dname.includes(cleanQ) ||
            uemail.includes(cleanQ)
          );
        })
        .map(({ password: _, email: __, ...u }) => ({
          ...u,
          followersCount: follows.filter(f => f.followingId === u.id).length,
          followingCount: follows.filter(f => f.followerId === u.id).length,
          isFollowing: myFollowingSet.has(u.id)
        } as User));

      // Rank exact ID or exact username match at the top
      matched.sort((a, b) => {
        const aExact = (a.id.toLowerCase() === cleanQ || a.username.toLowerCase() === cleanQ) ? 1 : 0;
        const bExact = (b.id.toLowerCase() === cleanQ || b.username.toLowerCase() === cleanQ) ? 1 : 0;
        return bExact - aExact;
      });

      return { users: matched };
    },

    async connectFriend(
      idOrHandle: string,
      options?: { name?: string; avatar?: string }
    ): Promise<{ user: User }> {
      const cleanTarget = (idOrHandle || '').trim().replace(/^@+/, '');
      if (!cleanTarget) throw new Error('Invalid user ID or handle');

      const users = getItem<StoredUser[]>(USERS_KEY, []);
      const currentId = getCurrentUserId();

      // Check if already exists by ID or username
      let friend = users.find(u => 
        (u.id && u.id.toLowerCase() === cleanTarget.toLowerCase()) ||
        (u.username && u.username.toLowerCase() === cleanTarget.toLowerCase())
      );

      const follows = getFollows();

      if (!friend) {
        const isId = cleanTarget.startsWith('usr_');
        const id = isId ? cleanTarget : `usr_${cleanTarget.toLowerCase()}`;
        const username = isId ? cleanTarget.replace(/^usr_/, '') : cleanTarget;
        const defaultAvatars = [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
        ];
        const avatar = options?.avatar || defaultAvatars[Math.abs(cleanTarget.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % defaultAvatars.length];
        const name = options?.name || (username.charAt(0).toUpperCase() + username.slice(1));

        friend = {
          id,
          username,
          name,
          avatar,
          bio: 'Connected Friend on Social Sphere ✨',
          followersCount: 1,
          followingCount: 1,
          postsCount: 0,
          isVerified: false
        };

        users.push(friend);
        setItem(USERS_KEY, users);
      }

      // Automatically follow friend
      if (currentId && currentId !== friend.id) {
        const alreadyFollows = follows.some(f => f.followerId === currentId && f.followingId === friend!.id);
        if (!alreadyFollows) {
          follows.push({
            followerId: currentId,
            followingId: friend.id,
            createdAt: new Date().toISOString()
          });
          setFollows(follows);
        }
      }

      const cleanUser: User = {
        id: friend.id,
        username: friend.username,
        name: friend.name,
        avatar: friend.avatar,
        bio: friend.bio,
        website: friend.website,
        followersCount: follows.filter(f => f.followingId === friend!.id).length,
        followingCount: follows.filter(f => f.followerId === friend!.id).length,
        postsCount: friend.postsCount || 0,
        isVerified: friend.isVerified,
        isFollowing: true
      };

      return { user: cleanUser };
    }
  },

  messages: {
    async getConversations(): Promise<{ conversations: Conversation[] }> {
      const convs = getItem<Conversation[]>(CONVERSATIONS_KEY, []);
      const currentId = getCurrentUserId();
      if (!currentId) return { conversations: convs };
      const blocked = getBlockedIdsForUser(currentId);
      return { conversations: convs.filter(c => !blocked.has(c.participant.id)) };
    },

    async getOrCreateConversation(recipientId: string): Promise<{ conversation: Conversation }> {
      const { user: me } = await localStore.auth.me();
      const users = getItem<StoredUser[]>(USERS_KEY, []);
      let recipient = users.find(u => u.id === recipientId || (u.username && u.username.toLowerCase() === recipientId.toLowerCase()));

      // Auto-connect if recipient is not yet in users
      if (!recipient) {
        const connected = await localStore.users.connectFriend(recipientId);
        recipient = connected.user as StoredUser;
      }

      const convs = getItem<Conversation[]>(CONVERSATIONS_KEY, []);
      let conv = convs.find(c => c.participant.id === recipient!.id);

      if (!conv) {
        conv = {
          id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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
