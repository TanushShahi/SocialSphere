import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest, JWT_SECRET } from '../middleware/auth.js';

export const authRouter = Router();

// Register
authRouter.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password || !name) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Check existing
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) {
      res.status(400).json({ error: 'Username or email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}`;
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, name, avatar, bio, website, is_verified, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, username.toLowerCase(), email.toLowerCase(), passwordHash, name, defaultAvatar, '', '', 0, createdAt);

    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });

    const user = {
      id: userId,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      name,
      avatar: defaultAvatar,
      bio: '',
      website: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isVerified: false
    };

    res.status(201).json({ user, token });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Login
authRouter.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      res.status(400).json({ error: 'Login and password are required' });
      return;
    }

    const userRecord = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(login.toLowerCase(), login.toLowerCase()) as any;
    if (!userRecord) {
      res.status(401).json({ error: 'Invalid username/email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, userRecord.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid username/email or password' });
      return;
    }

    const token = jwt.sign({ id: userRecord.id }, JWT_SECRET, { expiresIn: '30d' });

    // Stats
    const followers = db.prepare('SELECT COUNT(*) as c FROM followers WHERE following_id = ?').get(userRecord.id) as { c: number };
    const following = db.prepare('SELECT COUNT(*) as c FROM followers WHERE follower_id = ?').get(userRecord.id) as { c: number };
    const posts = db.prepare('SELECT COUNT(*) as c FROM posts WHERE user_id = ?').get(userRecord.id) as { c: number };

    const user = {
      id: userRecord.id,
      username: userRecord.username,
      email: userRecord.email,
      name: userRecord.name,
      avatar: userRecord.avatar,
      bio: userRecord.bio,
      website: userRecord.website,
      followersCount: followers.c,
      followingCount: following.c,
      postsCount: posts.c,
      isVerified: Boolean(userRecord.is_verified)
    };

    res.json({ user, token });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Current User (/me)
authRouter.get('/me', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const userRecord = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

    if (!userRecord) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const followers = db.prepare('SELECT COUNT(*) as c FROM followers WHERE following_id = ?').get(userId) as { c: number };
    const following = db.prepare('SELECT COUNT(*) as c FROM followers WHERE follower_id = ?').get(userId) as { c: number };
    const posts = db.prepare('SELECT COUNT(*) as c FROM posts WHERE user_id = ?').get(userId) as { c: number };

    res.json({
      user: {
        id: userRecord.id,
        username: userRecord.username,
        email: userRecord.email,
        name: userRecord.name,
        avatar: userRecord.avatar,
        bio: userRecord.bio,
        website: userRecord.website,
        followersCount: followers.c,
        followingCount: following.c,
        postsCount: posts.c,
        isVerified: Boolean(userRecord.is_verified)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});
