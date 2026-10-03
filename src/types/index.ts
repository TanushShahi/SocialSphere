export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified?: boolean;
  isFollowing?: boolean;
  blockedUserIds?: string[];
}

export interface FollowRelation {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface BlockRelation {
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  user: User;
  text: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
}

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  filter?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

export interface Post {
  id: string;
  user: User;
  media: MediaItem[];
  caption: string;
  location?: string;
  songTitle?: string;
  songArtist?: string;
  songUrl?: string;
  likesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  comments: Comment[];
  createdAt: string;
  tags?: string[];
}

export interface StorySlide {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  duration: number;
  songTitle?: string;
  songArtist?: string;
  songUrl?: string;
  createdAt: string;
}

export interface Story {
  id: string;
  user: User;
  hasUnseen: boolean;
  slides: StorySlide[];
}

export interface SongTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;
  genre: string;
}

export type CallType = 'audio' | 'video';
export type CallStatus = 'idle' | 'outgoing' | 'incoming' | 'connected';

export interface CallSession {
  status: CallStatus;
  callType: CallType;
  partner: {
    id: string;
    username: string;
    name: string;
    avatar: string;
  };
  isMuted: boolean;
  isVideoOff: boolean;
  offer?: any;
}

export interface Reel {
  id: string;
  user: User;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  audioTitle: string;
  audioUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  user: User;
  postImage?: string;
  commentText?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  mediaUrl?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participant: User;
  unreadCount: number;
  messages: Message[];
}

export type TabType = 'feed' | 'explore' | 'reels' | 'messages' | 'profile' | 'saved';

export type FilterType = 
  | 'normal'
  | 'clarendon'
  | 'gingham'
  | 'juno'
  | 'lark'
  | 'moon'
  | 'valencia'
  | 'vintage'
  | 'noir'
  | 'warm'
  | 'cyber';

export interface ShareItem {
  id: string;
  type: 'post' | 'reel';
  title: string;
  caption?: string;
  mediaUrl: string;
  author: { id: string; username: string; name?: string; avatar: string };
}

