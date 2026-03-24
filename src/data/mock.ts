import { User, Course, Post, Achievement } from '../types';

export const mockUser: User = {
  id: 'u1',
  username: '语言学习者_001',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  learningLanguage: 'en',
  level: 'B1',
  experiencePoints: 1250,
  streakDays: 14,
};

export const mockCourses: Course[] = [
  {
    id: 'c1',
    title: '职场英语核心词汇',
    language: 'en',
    level: 'B1',
    description: '掌握外企日常沟通必备的500个高频词汇与句型。',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    modules: 12,
    progress: 45,
  },
  {
    id: 'c2',
    title: '零基础标准日语发音',
    language: 'jp',
    level: 'N5',
    description: '从五十音图开始，掌握最纯正的东京口音。',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&q=80&w=800',
    modules: 8,
    progress: 0,
  },
  {
    id: 'c3',
    title: '韩剧生活口语跟读',
    language: 'kr',
    level: 'A2',
    description: '精选热门韩剧片段，沉浸式体验韩国日常交流。',
    image: 'https://images.unsplash.com/photo-1538681105587-85640961bf8b?auto=format&fit=crop&q=80&w=800',
    modules: 15,
    progress: 100,
  },
  {
    id: 'c4',
    title: '雅思听力高分突破',
    language: 'en',
    level: 'B2',
    description: '针对雅思听力题型进行专项训练，提高抓取关键信息能力。',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    modules: 20,
    progress: 15,
  }
];

export const mockAchievements: Achievement[] = [
  {
    id: 'a1',
    title: '初出茅庐',
    description: '完成第一节课程',
    icon: 'Target',
    unlockedAt: '2023-09-01T10:00:00Z'
  },
  {
    id: 'a2',
    title: '坚持不懈',
    description: '连续学习7天',
    icon: 'Flame',
    unlockedAt: '2023-09-08T10:00:00Z'
  },
  {
    id: 'a3',
    title: '单词达人',
    description: '掌握1000个词汇',
    icon: 'BookOpen',
  },
  {
    id: 'a4',
    title: '口语新星',
    description: '口语评分达到90分以上10次',
    icon: 'Mic',
  }
];

export const mockPosts: Post[] = [
  {
    id: 'p1',
    authorId: 'u2',
    authorName: 'Sakura_fan',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    content: '今天终于把五十音图全背下来啦！分享一个小技巧：结合联想记忆法真的很快！#日语学习 #打卡',
    language: 'jp',
    likes: 42,
    comments: 12,
    createdAt: '2小时前',
    tags: ['日语学习', '打卡']
  },
  {
    id: 'p2',
    authorId: 'u3',
    authorName: 'EnglishMaster',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    content: 'Has anyone taken the IELTS mock test recently? The listening section is driving me crazy! Any tips for Section 3? 😭',
    language: 'en',
    likes: 18,
    comments: 24,
    createdAt: '5小时前',
    tags: ['IELTS', 'Help']
  },
  {
    id: 'p3',
    authorId: 'u1',
    authorName: '语言学习者_001',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    content: '第一次用这个平台的韩语口语打分功能，居然有95分，开心！继续努力~ 🇰🇷',
    language: 'kr',
    likes: 56,
    comments: 8,
    createdAt: '1天前',
    tags: ['口语练习', '韩语']
  }
];
