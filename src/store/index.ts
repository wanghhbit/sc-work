import { create } from 'zustand';
import { User, Course } from '../types';
import { mockUser, mockCourses } from '../data/mock';

interface AppState {
  user: User | null;
  courses: Course[];
  currentLanguage: string;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setLanguage: (lang: string) => void;
  updateCourseProgress: (courseId: string, progress: number) => void;
  addExperience: (points: number) => void;
}

export const useStore = create<AppState>((set) => ({
  user: mockUser,
  courses: mockCourses,
  currentLanguage: 'en', // default
  isAuthenticated: true, // mock logged in state
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setLanguage: (lang) => set({ currentLanguage: lang }),
  updateCourseProgress: (courseId, progress) => set((state) => ({
    courses: state.courses.map(c => 
      c.id === courseId ? { ...c, progress: Math.min(100, Math.max(0, progress)) } : c
    )
  })),
  addExperience: (points) => set((state) => ({
    user: state.user ? { ...state.user, experiencePoints: state.user.experiencePoints + points } : null
  }))
}));
