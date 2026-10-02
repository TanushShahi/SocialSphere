import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const notificationsRouter = Router();

// 1. Get Notifications
notificationsRouter.get('/', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const notifs = db.prepare(`
      SELECT n.*, u.username, u.avatar
      FROM notifications n
      JOIN users u ON n.actor_id = u.id
      WHERE n.user_id = ?
      ORDER BY n.rowid DESC
      LIMIT 50
    `).all(userId) as any[];

    const result = notifs.map(n => {
      let postImage = '';
      if (n.post_id) {
        const media = db.prepare('SELECT url FROM post_media WHERE post_id = ? AND order_index = 0').get(n.post_id) as any;
        if (media) postImage = media.url;
      }

      return {
        id: n.id,
        type: n.type,
        user: {
          id: n.actor_id,
          username: n.username,
          avatar: n.avatar
        },
        postImage,
        commentText: n.comment_text,
        createdAt: n.created_at,
        isRead: Boolean(n.is_read)
      };
    });

    res.json({ notifications: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// 2. Mark Single Read
notificationsRouter.put('/:id/read', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// 3. Mark All Read
notificationsRouter.put('/read-all', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});
