import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.js';

export const storiesRouter = Router();

// 1. Get Stories Grouped by User
storiesRouter.get('/', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const currentUserId = req.user?.id;
    const now = new Date().toISOString();

    // Query unexpired stories
    const storyRows = db.prepare(`
      SELECT s.*, u.username, u.name, u.avatar
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.expires_at > ?
      ORDER BY s.rowid DESC
    `).all(now) as any[];

    // Group by user
    const userStoryMap = new Map<string, any>();

    for (const row of storyRows) {
      if (!userStoryMap.has(row.user_id)) {
        userStoryMap.set(row.user_id, {
          id: `story_user_${row.user_id}`,
          user: {
            id: row.user_id,
            username: row.username,
            name: row.name,
            avatar: row.avatar
          },
          hasUnseen: false,
          slides: []
        });
      }

      const group = userStoryMap.get(row.user_id);
      const isViewed = currentUserId
        ? Boolean(db.prepare('SELECT 1 FROM story_views WHERE story_id = ? AND user_id = ?').get(row.id, currentUserId))
        : false;

      if (!isViewed && currentUserId && row.user_id !== currentUserId) {
        group.hasUnseen = true;
      }

      group.slides.push({
        id: row.id,
        url: row.media_url,
        caption: row.caption,
        type: row.type,
        duration: row.duration,
        songTitle: row.song_title || '',
        songArtist: row.song_artist || '',
        songUrl: row.song_url || '',
        createdAt: row.created_at
      });
    }

    const stories = Array.from(userStoryMap.values());
    res.json({ stories });
  } catch (err) {
    console.error('Stories error:', err);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// 2. Add New Story
storiesRouter.post('/', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { mediaUrl, caption, duration, songTitle, songArtist, songUrl } = req.body;

    if (!mediaUrl) {
      res.status(400).json({ error: 'Media URL is required' });
      return;
    }

    const storyId = `story_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const createdAt = 'Just now';

    db.prepare(`
      INSERT INTO stories (id, user_id, media_url, caption, type, duration, song_title, song_artist, song_url, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      storyId,
      userId,
      mediaUrl,
      caption || '',
      'image',
      duration || 5,
      songTitle || '',
      songArtist || '',
      songUrl || '',
      expiresAt,
      createdAt
    );

    res.status(201).json({
      slide: {
        id: storyId,
        url: mediaUrl,
        caption: caption || '',
        duration: duration || 5,
        songTitle: songTitle || '',
        songArtist: songArtist || '',
        songUrl: songUrl || '',
        createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add story' });
  }
});

// 3. Mark Story as Viewed
storiesRouter.post('/:id/view', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const storyId = req.params.id;
    const userId = req.user!.id;

    db.prepare('INSERT OR IGNORE INTO story_views (id, story_id, user_id, created_at) VALUES (?, ?, ?, ?)').run(
      `sv_${storyId}_${userId}`,
      storyId,
      userId,
      new Date().toISOString()
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark story as viewed' });
  }
});

// 4. Delete Story
storiesRouter.delete('/:id', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const storyId = req.params.id;
    const userId = req.user!.id;

    const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(storyId) as any;
    if (!story) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }
    if (story.user_id !== userId) {
      res.status(403).json({ error: 'You are not authorized to delete this story' });
      return;
    }

    db.prepare('DELETE FROM story_views WHERE story_id = ?').run(storyId);
    db.prepare('DELETE FROM stories WHERE id = ?').run(storyId);

    res.json({ success: true, storyId });
  } catch (err) {
    console.error('Delete story error:', err);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

