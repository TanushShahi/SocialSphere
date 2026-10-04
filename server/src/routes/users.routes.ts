import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.js';

export const usersRouter = Router();

// 1. Get Profile by Username
usersRouter.get('/profile/:username', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const currentUserId = req.user?.id;
    const username = req.params.username;

    const userRecord = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (!userRecord) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const followers = (db.prepare('SELECT COUNT(*) as c FROM followers WHERE following_id = ?').get(userRecord.id) as any).c;
    const following = (db.prepare('SELECT COUNT(*) as c FROM followers WHERE follower_id = ?').get(userRecord.id) as any).c;
    const postsCount = (db.prepare('SELECT COUNT(*) as c FROM posts WHERE user_id = ?').get(userRecord.id) as any).c;

    const isFollowing = currentUserId
      ? Boolean(db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?').get(currentUserId, userRecord.id))
      : false;

    // User's posts
    const userPosts = db.prepare(`
      SELECT p.*, pm.url as media_url, pm.filter as media_filter
      FROM posts p
      LEFT JOIN post_media pm ON p.id = pm.post_id AND pm.order_index = 0
      WHERE p.user_id = ?
      ORDER BY p.rowid DESC
    `).all(userRecord.id) as any[];

    const formattedPosts = userPosts.map(p => {
      const likesCount = (db.prepare('SELECT COUNT(*) as c FROM post_likes WHERE post_id = ?').get(p.id) as any).c;
      const commentsCount = (db.prepare('SELECT COUNT(*) as c FROM comments WHERE post_id = ?').get(p.id) as any).c;
      return {
        id: p.id,
        caption: p.caption,
        location: p.location,
        createdAt: p.created_at,
        likesCount,
        commentsCount,
        mediaUrl: p.media_url,
        filter: p.media_filter
      };
    });

    res.json({
      profile: {
        id: userRecord.id,
        username: userRecord.username,
        name: userRecord.name,
        avatar: userRecord.avatar,
        bio: userRecord.bio,
        website: userRecord.website,
        followersCount: followers,
        followingCount: following,
        postsCount,
        isVerified: Boolean(userRecord.is_verified),
        isFollowing,
        posts: formattedPosts
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// 2. Update Profile
usersRouter.put('/profile', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { name, bio, website, avatar } = req.body;

    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          bio = COALESCE(?, bio),
          website = COALESCE(?, website),
          avatar = COALESCE(?, avatar)
      WHERE id = ?
    `).run(name, bio, website, avatar, userId);

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    res.json({
      user: {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        name: updated.name,
        avatar: updated.avatar,
        bio: updated.bio,
        website: updated.website,
        isVerified: Boolean(updated.is_verified)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 3. Toggle Follow User
usersRouter.post('/:id/follow', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const followerId = req.user!.id;
    const followingId = req.params.id;

    if (followerId === followingId) {
      res.status(400).json({ error: 'Cannot follow yourself' });
      return;
    }

    const targetUser = db.prepare('SELECT id FROM users WHERE id = ?').get(followingId);
    if (!targetUser) {
      res.status(404).json({ error: 'User account not found' });
      return;
    }

    const existing = db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?').get(followerId, followingId);
    let isFollowing = false;

    if (existing) {
      db.prepare('DELETE FROM followers WHERE follower_id = ? AND following_id = ?').run(followerId, followingId);
      isFollowing = false;
    } else {
      db.prepare('INSERT INTO followers (id, follower_id, following_id, created_at) VALUES (?, ?, ?, ?)').run(
        `f_${Date.now()}`,
        followerId,
        followingId,
        new Date().toISOString()
      );
      isFollowing = true;

      // Notification
      db.prepare('INSERT INTO notifications (id, user_id, actor_id, type, created_at) VALUES (?, ?, ?, ?, ?)').run(
        `notif_${Date.now()}`,
        followingId,
        followerId,
        'follow',
        'Just now'
      );
    }

    res.json({ isFollowing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

// 4. Get Suggested Creators
usersRouter.get('/suggested', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const currentUserId = req.user?.id || '';
    const users = db.prepare('SELECT id, username, name, avatar, bio, is_verified FROM users WHERE id != ? LIMIT 5').all(currentUserId) as any[];

    const result = users.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      avatar: u.avatar,
      bio: u.bio,
      isVerified: Boolean(u.is_verified),
      isFollowing: currentUserId
        ? Boolean(db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?').get(currentUserId, u.id))
        : false
    }));

    res.json({ users: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suggested users' });
  }
});

// 5. Search registered users only
usersRouter.get('/search', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const q = String(req.query.q || '').trim().replace(/^@+/, '').toLowerCase();
    if (!q) { res.json({ users: [] }); return; }
    const currentUserId = req.user?.id || '';
    const contains = '%' + q + '%';
    const startsWith = q + '%';
    const users = db.prepare(
      `SELECT id, username, name, avatar, bio, is_verified
       FROM users
       WHERE id != ? AND (LOWER(username) LIKE ? OR LOWER(name) LIKE ?)
       ORDER BY CASE WHEN LOWER(username) = ? THEN 0 WHEN LOWER(username) LIKE ? THEN 1 ELSE 2 END, LOWER(username) ASC
       LIMIT 20`
    ).all(currentUserId, contains, contains, q, startsWith) as any[];
    const result = users.map(u => ({
      id: u.id, username: u.username, name: u.name, avatar: u.avatar, bio: u.bio,
      isVerified: Boolean(u.is_verified),
      isFollowing: currentUserId ? Boolean(db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?').get(currentUserId, u.id)) : false
    }));
    res.json({ users: result });
  } catch (err) {
    console.error('Search users error:', err);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// 6. Resolve an existing account by username or id. Never creates an account.
usersRouter.post('/connect', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const rawTarget = String(req.body?.idOrUsername || '').trim().replace(/^@+/, '').toLowerCase();
    if (!rawTarget) { res.status(400).json({ error: 'Username or user ID is required' }); return; }
    const currentUserId = req.user!.id;
    const user = db.prepare(`SELECT id, username, name, avatar, bio, website, is_verified FROM users WHERE LOWER(id) = ? OR LOWER(username) = ? LIMIT 1`).get(rawTarget, rawTarget) as any;
    if (!user) { res.status(404).json({ error: 'No registered SocialSphere account found for this username' }); return; }
    if (user.id === currentUserId) { res.status(400).json({ error: 'You cannot connect to your own account' }); return; }
    const followers = (db.prepare('SELECT COUNT(*) as c FROM followers WHERE following_id = ?').get(user.id) as any).c;
    const following = (db.prepare('SELECT COUNT(*) as c FROM followers WHERE follower_id = ?').get(user.id) as any).c;
    const postsCount = (db.prepare('SELECT COUNT(*) as c FROM posts WHERE user_id = ?').get(user.id) as any).c;
    const isFollowing = Boolean(db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?').get(currentUserId, user.id));
    res.json({ user: { id: user.id, username: user.username, name: user.name, avatar: user.avatar, bio: user.bio, website: user.website, followersCount: followers, followingCount: following, postsCount, isVerified: Boolean(user.is_verified), isFollowing } });
  } catch (err) {
    console.error('Connect user error:', err);
    res.status(500).json({ error: 'Failed to find registered account' });
  }
});