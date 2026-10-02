import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.js';

export const reelsRouter = Router();

// 1. Get Reels
reelsRouter.get('/', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const currentUserId = req.user?.id;
    const reelRows = db.prepare(`
      SELECT r.*, u.username, u.name, u.avatar
      FROM reels r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.rowid DESC
    `).all() as any[];

    const reels = reelRows.map(r => {
      const isFollowing = currentUserId
        ? Boolean(db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?').get(currentUserId, r.user_id))
        : false;

      const likesCount = (db.prepare('SELECT COUNT(*) as c FROM reel_likes WHERE reel_id = ?').get(r.id) as any).c;
      const isLiked = currentUserId
        ? Boolean(db.prepare('SELECT 1 FROM reel_likes WHERE reel_id = ? AND user_id = ?').get(r.id, currentUserId))
        : false;

      const isSaved = currentUserId
        ? Boolean(db.prepare('SELECT 1 FROM reel_saves WHERE reel_id = ? AND user_id = ?').get(r.id, currentUserId))
        : false;

      return {
        id: r.id,
        user: {
          id: r.user_id,
          username: r.username,
          name: r.name,
          avatar: r.avatar,
          isFollowing
        },
        videoUrl: r.video_url,
        thumbnailUrl: r.thumbnail_url,
        caption: r.caption,
        likesCount,
        commentsCount: 0,
        sharesCount: 0,
        isLiked,
        isSaved
      };
    });

    res.json({ reels });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reels' });
  }
});

// 2. Toggle Like Reel
reelsRouter.post('/:id/like', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const reelId = req.params.id;
    const userId = req.user!.id;

    const existing = db.prepare('SELECT 1 FROM reel_likes WHERE reel_id = ? AND user_id = ?').get(reelId, userId);
    let isLiked = false;

    if (existing) {
      db.prepare('DELETE FROM reel_likes WHERE reel_id = ? AND user_id = ?').run(reelId, userId);
      isLiked = false;
    } else {
      db.prepare('INSERT INTO reel_likes (id, reel_id, user_id, created_at) VALUES (?, ?, ?, ?)').run(
        `rl_${Date.now()}`,
        reelId,
        userId,
        new Date().toISOString()
      );
      isLiked = true;
    }

    const likesCount = (db.prepare('SELECT COUNT(*) as c FROM reel_likes WHERE reel_id = ?').get(reelId) as any).c;
    res.json({ isLiked, likesCount: likesCount + 42000 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle like on reel' });
  }
});

// 3. Toggle Save Reel
reelsRouter.post('/:id/save', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const reelId = req.params.id;
    const userId = req.user!.id;

    const existing = db.prepare('SELECT 1 FROM reel_saves WHERE reel_id = ? AND user_id = ?').get(reelId, userId);
    let isSaved = false;

    if (existing) {
      db.prepare('DELETE FROM reel_saves WHERE reel_id = ? AND user_id = ?').run(reelId, userId);
      isSaved = false;
    } else {
      db.prepare('INSERT INTO reel_saves (id, reel_id, user_id, created_at) VALUES (?, ?, ?, ?)').run(
        `rs_${Date.now()}`,
        reelId,
        userId,
        new Date().toISOString()
      );
      isSaved = true;
    }

    res.json({ isSaved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle save on reel' });
  }
});
