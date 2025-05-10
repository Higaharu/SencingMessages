export interface Emotion {
  id: string;
  name: string;
  description: string;
  color: string;
  secondaryColor?: string;
  intensity: number;
  animationType: AnimationType;
  vibrationPattern: VibrationPattern;
  emoji?: string;
}

export enum AnimationType {
  PULSE = 'pulse',
  WAVE = 'wave',
  BOUNCE = 'bounce',
  EXPAND = 'expand',
  FADE = 'fade',
  ROTATE = 'rotate',
  SHAKE = 'shake',
}

export enum VibrationPattern {
  QUICK = 'quick',
  LONG = 'long',
  GENTLE = 'gentle',
  INTENSE = 'intense',
  RHYTHMIC = 'rhythmic',
  NONE = 'none',
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  emotion: Emotion;
  textContent?: string;
  timestamp: number;
  isRead: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  emojiAvatar?: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
} 