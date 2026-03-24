export interface User {
  id: string;
  username: string;
  avatar: string;
  learningLanguage: string; // 'en' | 'jp' | 'kr'
  level: string;
  experiencePoints: number;
  streakDays: number;
}

export interface Course {
  id: string;
  title: string;
  language: string;
  level: string;
  description: string;
  image: string;
  modules: number;
  progress: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  language: string;
  likes: number;
  comments: number;
  createdAt: string;
  tags: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}
