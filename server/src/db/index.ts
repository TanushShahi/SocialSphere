import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = process.env.PERSISTENT_DATA_DIR
  ? path.resolve(process.env.PERSISTENT_DATA_DIR)
  : path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'sphere.db');
export const db = new Database(dbPath);

// Enable Foreign Keys & WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      bio TEXT DEFAULT '',
      website TEXT DEFAULT '',
      is_verified INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS followers (
      id TEXT PRIMARY KEY,
      follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      UNIQUE(follower_id, following_id)
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      caption TEXT DEFAULT '',
      location TEXT DEFAULT '',
      song_title TEXT DEFAULT '',
      song_artist TEXT DEFAULT '',
      song_url TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS post_media (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      type TEXT DEFAULT 'image',
      filter TEXT DEFAULT 'filter-normal',
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS post_likes (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      UNIQUE(post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS post_saves (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      UNIQUE(post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comment_likes (
      id TEXT PRIMARY KEY,
      comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      UNIQUE(comment_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      media_url TEXT NOT NULL,
      caption TEXT DEFAULT '',
      type TEXT DEFAULT 'image',
      duration INTEGER DEFAULT 5,
      song_title TEXT DEFAULT '',
      song_artist TEXT DEFAULT '',
      song_url TEXT DEFAULT '',
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS story_views (
      id TEXT PRIMARY KEY,
      story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      UNIQUE(story_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS reels (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      video_url TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      caption TEXT DEFAULT '',
      audio_title TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reel_likes (
      id TEXT PRIMARY KEY,
      reel_id TEXT NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      UNIQUE(reel_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS reel_saves (
      id TEXT PRIMARY KEY,
      reel_id TEXT NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      UNIQUE(reel_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user2_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      updated_at TEXT NOT NULL,
      UNIQUE(user1_id, user2_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      media_url TEXT DEFAULT '',
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      actor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      post_id TEXT DEFAULT '',
      comment_text TEXT DEFAULT '',
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  console.log('Database initialized successfully at', dbPath);
}

export function resetDatabase() {
  db.exec(`
    DELETE FROM notifications;
    DELETE FROM messages;
    DELETE FROM conversations;
    DELETE FROM reel_saves;
    DELETE FROM reel_likes;
    DELETE FROM reels;
    DELETE FROM story_views;
    DELETE FROM stories;
    DELETE FROM comment_likes;
    DELETE FROM comments;
    DELETE FROM post_saves;
    DELETE FROM post_likes;
    DELETE FROM post_media;
    DELETE FROM posts;
    DELETE FROM followers;
    DELETE FROM users;
  `);
  console.log('Database cleanly reset. Zero accounts, stories, chats, or posts exist.');
}

