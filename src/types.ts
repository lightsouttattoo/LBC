export interface FollowRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'follow_request' | 'follow_accepted' | 'prayer' | 'post' | 'system';
  fromUserId?: string;
  fromUserName?: string;
  fromUserAvatar?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  coverImage?: string;
  bio?: string;
  favoriteVerse?: string;
  joinedDate: string;
  role?: string;
  followersCount?: number;
  followingCount?: number;
  followingIds?: string[];
  followerIds?: string[];
  followRequests?: FollowRequest[];
  notifications?: NotificationItem[];
  pushNotificationsEnabled?: boolean;
  isConfirmed?: boolean;
  confirmationCode?: string;
}

export type Category = 
  | 'Prayer Request' 
  | 'Praise Report' 
  | 'Testimony' 
  | 'Bible Study' 
  | 'General Thought' 
  | 'Urgent Prayer'
  | 'Sermon';

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  category: Category;
  content: string;
  imageUrl?: string;
  videoUrl?: string; // YouTube or direct video
  youtubeId?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isPrayerSaved?: boolean;
  comments?: Comment[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  avatarImage: string;
  creatorId: string;
  creatorName: string;
  category: string;
  membersCount: number;
  isMember?: boolean;
  isPending?: boolean;
  createdAt: string;
  rules?: string[];
  wallPosts?: Post[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "7:00 PM"
  location: string;
  category: 'Prayer Meeting' | 'Worship Night' | 'Bible Study' | 'Outreach' | 'Fellowship';
  coverImage: string;
  videoUrl?: string;
  youtubeId?: string;
  creatorName: string;
  attendeesCount: number;
  isAttending?: 'Going' | 'Interested' | 'Not Going';
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  duration: string;
  category: string;
  thumbnailUrl: string;
  videoUrl?: string;
  youtubeId?: string;
  audioUrl?: string;
  description: string;
  scriptureRef?: string;
}

export interface PastorShift {
  id: string;
  name: string;
  role: string;
  church: string;
  shiftName: string; // e.g. "Morning Shift"
  shiftHours: string; // e.g. "6:00 AM - 2:00 PM"
  avatar: string;
  bio: string;
  specialty: string;
  favoriteVerse: string;
  greetingMessage: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  participantStatus: 'online' | 'offline' | 'praying';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: DirectMessage[];
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface DailyVerse {
  date: string;
  verse: BibleVerse;
  devotional: string;
}
