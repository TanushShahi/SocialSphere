import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.js';

export const postsRouter = Router();

// Helper to format full post object
function formatPost(postRow: any, currentUserId?: string) {
  const user = db.prepare('SELECT id, username, name, avatar, bio, is_verified FROM users WHERE id = ?').get(postRow.user_id) as any;
  const isFollowing = currentUserId
    ? Boolean(db.prepare('SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?').get(currentUserId, postRow.user_id))
    : false;

  const media = db.prepare('SELECT id, url, type, filter, order_index FROM post_media WHERE post_id = ? ORDER BY order_index ASC').all(postRow.id) as any[];

  const likesCount = (db.prepare('SELECT COUNT(*) as c FROM post_likes WHERE post_id = ?').get(postRow.id) as any).c;
  const isLiked = currentUserId
    ? Boolean(db.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(postRow.id, currentUserId))
    : false;

  const isSaved = currentUserId
    ? Boolean(db.prepare('SELECT 1 FROM post_saves WHERE post_id = ? AND user_id = ?').get(postRow.id, currentUserId))
    : false;

  const commentsRows = db.prepare(`
    SELECT c.id, c.text, c.created_at, c.user_id, u.username, u.avatar
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.rowid ASC
  `).all(postRow.id) as any[];

  const comments = commentsRows.map(c => {
    const commLikes = (db.prepare('SELECT COUNT(*) as c FROM comment_likes WHERE comment_id = ?').get(c.id) as any).c;
    const isCommLiked = currentUserId
      ? Boolean(db.prepare('SELECT 1 FROM comment_likes WHERE comment_id = ? AND user_id = ?').get(c.id, currentUserId))
      : false;

    return {
      id: c.id,
      postId: postRow.id,
      text: c.text,
      createdAt: c.created_at,
      likesCount: commLikes,
      isLiked: isCommLiked,
      user: {
        id: c.user_id,
        username: c.username,
        avatar: c.avatar
      }
    };
  });

  return {
    id: postRow.id,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      isVerified: Boolean(user.is_verified),
      isFollowing
    },
    media: media.map(m => ({
      id: m.id,
      url: m.url,
      type: m.type,
      filter: m.filter
    })),
    caption: postRow.caption,
    location: postRow.location || '',
    songTitle: postRow.song_title || '',
    songArtist: postRow.song_artist || '',
    songUrl: postRow.song_url || '',
    likesCount,
    isLiked,
    isSaved,
    createdAt: postRow.created_at,
    comments
  };
}

// 1. Get Feed
postsRouter.get('/feed', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const currentUserId = req.user?.id;
    const postRows = db.prepare('SELECT * FROM posts ORDER BY rowid DESC LIMIT 50').all() as any[];
    const posts = postRows.map(row => formatPost(row, currentUserId));
    res.json({ posts });
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// 2. Create Post
postsRouter.post('/', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { mediaUrls, filter, caption, location, songTitle, songArtist, songUrl } = req.body;

    if (!mediaUrls || !Array.isArray(mediaUrls) || mediaUrls.length === 0) {
      res.status(400).json({ error: 'At least one media item is required' });
      return;
    }

    const postId = `post_${Date.now()}`;
    const createdAt = 'Just now';

    db.prepare('INSERT INTO posts (id, user_id, caption, location, song_title, song_artist, song_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      postId,
      userId,
      caption || '',
      location || '',
      songTitle || '',
      songArtist || '',
      songUrl || '',
      createdAt
    );

    const insertMedia = db.prepare('INSERT INTO post_media (id, post_id, url, type, filter, order_index) VALUES (?, ?, ?, ?, ?, ?)');
    mediaUrls.forEach((url: string, i: number) => {
      insertMedia.run(`m_${postId}_${i}`, postId, url, 'image', filter || 'filter-normal', i);
    });

    const postRow = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    res.status(201).json({ post: formatPost(postRow, userId) });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// 3. Toggle Like Post
postsRouter.post('/:id/like', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;

    const existing = db.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(postId, userId);
    let isLiked = false;

    if (existing) {
      db.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(postId, userId);
      isLiked = false;
    } else {
      db.prepare('INSERT INTO post_likes (id, post_id, user_id, created_at) VALUES (?, ?, ?, ?)').run(
        `pl_${Date.now()}`,
        postId,
        userId,
        new Date().toISOString()
      );
      isLiked = true;

      // Add Notification to post author if not self
      const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(postId) as any;
      if (post && post.user_id !== userId) {
        db.prepare('INSERT INTO notifications (id, user_id, actor_id, type, post_id, comment_text, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
          `notif_${Date.now()}`,
          post.user_id,
          userId,
          'like',
          postId,
          '',
          0,
          'Just now'
        );
      }
    }

    const likesCount = (db.prepare('SELECT COUNT(*) as c FROM post_likes WHERE post_id = ?').get(postId) as any).c;
    res.json({ isLiked, likesCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// 4. Toggle Save Post
postsRouter.post('/:id/save', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;

    const existing = db.prepare('SELECT 1 FROM post_saves WHERE post_id = ? AND user_id = ?').get(postId, userId);
    let isSaved = false;

    if (existing) {
      db.prepare('DELETE FROM post_saves WHERE post_id = ? AND user_id = ?').run(postId, userId);
      isSaved = false;
    } else {
      db.prepare('INSERT INTO post_saves (id, post_id, user_id, created_at) VALUES (?, ?, ?, ?)').run(
        `ps_${Date.now()}`,
        postId,
        userId,
        new Date().toISOString()
      );
      isSaved = true;
    }

    res.json({ isSaved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle save' });
  }
});

// 5. Add Comment
postsRouter.post('/:id/comments', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;
    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Comment text is required' });
      return;
    }

    const commentId = `comm_${Date.now()}`;
    const createdAt = 'Just now';

    db.prepare('INSERT INTO comments (id, post_id, user_id, text, created_at) VALUES (?, ?, ?, ?, ?)').run(
      commentId,
      postId,
      userId,
      text.trim(),
      createdAt
    );

    // Notification
    const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(postId) as any;
    if (post && post.user_id !== userId) {
      db.prepare('INSERT INTO notifications (id, user_id, actor_id, type, post_id, comment_text, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        `notif_${Date.now()}`,
        post.user_id,
        userId,
        'comment',
        postId,
        text.trim(),
        0,
        createdAt
      );
    }

    const newComment = {
      id: commentId,
      postId,
      text: text.trim(),
      createdAt,
      likesCount: 0,
      isLiked: false,
      user: {
        id: req.user!.id,
        username: req.user!.username,
        avatar: req.user!.avatar
      }
    };

    res.status(201).json({ comment: newComment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// 6. Toggle Like Comment
postsRouter.post('/comments/:id/like', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const commentId = req.params.id;
    const userId = req.user!.id;

    const existing = db.prepare('SELECT 1 FROM comment_likes WHERE comment_id = ? AND user_id = ?').get(commentId, userId);
    let isLiked = false;

    if (existing) {
      db.prepare('DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?').run(commentId, userId);
      isLiked = false;
    } else {
      db.prepare('INSERT INTO comment_likes (id, comment_id, user_id, created_at) VALUES (?, ?, ?, ?)').run(
        `cl_${Date.now()}`,
        commentId,
        userId,
        new Date().toISOString()
      );
      isLiked = true;
    }

    const likesCount = (db.prepare('SELECT COUNT(*) as c FROM comment_likes WHERE comment_id = ?').get(commentId) as any).c;
    res.json({ isLiked, likesCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle comment like' });
  }
});

// 7. Get Post Detail
postsRouter.get('/:id', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const postRow = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
    if (!postRow) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json({ post: formatPost(postRow, req.user?.id) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// 8. Edit Post
postsRouter.put('/:id', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;
    const { caption, location, songTitle, songArtist, songUrl } = req.body;

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId) as any;
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    if (post.user_id !== userId) {
      res.status(403).json({ error: 'You are not authorized to edit this post' });
      return;
    }

    db.prepare(`
      UPDATE posts
      SET caption = ?,
          location = ?,
          song_title = ?,
          song_artist = ?,
          song_url = ?
      WHERE id = ?
    `).run(
      caption !== undefined ? caption : post.caption,
      location !== undefined ? location : post.location,
      songTitle !== undefined ? songTitle : post.song_title,
      songArtist !== undefined ? songArtist : post.song_artist,
      songUrl !== undefined ? songUrl : post.song_url,
      postId
    );

    const updatedRow = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    res.json({ post: formatPost(updatedRow, userId) });
  } catch (err) {
    console.error('Edit post error:', err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// 9. Delete Post
postsRouter.delete('/:id', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId) as any;
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    if (post.user_id !== userId) {
      res.status(403).json({ error: 'You are not authorized to delete this post' });
      return;
    }

    db.prepare('DELETE FROM post_media WHERE post_id = ?').run(postId);
    db.prepare('DELETE FROM post_likes WHERE post_id = ?').run(postId);
    db.prepare('DELETE FROM post_saves WHERE post_id = ?').run(postId);
    db.prepare('DELETE FROM comments WHERE post_id = ?').run(postId);
    db.prepare('DELETE FROM notifications WHERE post_id = ?').run(postId);
    db.prepare('DELETE FROM posts WHERE id = ?').run(postId);

    res.json({ success: true, postId });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

