
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
}

export interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
}

export interface Story {
  id: string;
  user: string;
  avatar: string;
  image: string;
}

export interface Message {
  id: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
  isMe: boolean;
}

export enum Tab {
  HOME = 'home',
  FRIENDS = 'friends',
  MESSAGES = 'messages',
  NOTIFICATIONS = 'notifications',
  VIDEO = 'video',
  MENU = 'menu'
}

export type AuthMode = 'login' | 'signup' | 'verify';
