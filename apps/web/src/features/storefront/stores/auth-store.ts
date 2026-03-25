import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/features/storefront/types'

interface RegisteredUser {
  id: string
  email: string
  passwordHashMock: string
  createdAt: string
}

interface AuthState {
  user: AuthUser | null
  users: RegisteredUser[]
  register: (email: string, password: string) => { ok: true } | { ok: false; message: string }
  login: (email: string, password: string) => { ok: true } | { ok: false; message: string }
  logout: () => void
}

function toId(email: string) {
  return `u_${email.toLowerCase()}`
}

function hashMock(password: string) {
  return `mock_${password}`
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      register: (email, password) => {
        const normalized = email.trim().toLowerCase()
        const exists = get().users.some((u) => u.email === normalized)
        if (exists) {
          return { ok: false, message: '该邮箱已注册，请直接登录。' }
        }
        const now = new Date().toISOString()
        const nextUser: RegisteredUser = {
          id: toId(normalized),
          email: normalized,
          passwordHashMock: hashMock(password),
          createdAt: now,
        }
        set((s) => ({
          users: [nextUser, ...s.users],
          user: { id: nextUser.id, email: nextUser.email, createdAt: nextUser.createdAt },
        }))
        return { ok: true }
      },
      login: (email, password) => {
        const normalized = email.trim().toLowerCase()
        const found = get().users.find((u) => u.email === normalized)
        if (!found) {
          return { ok: false, message: '该邮箱未注册，请先注册。' }
        }
        if (found.passwordHashMock !== hashMock(password)) {
          return { ok: false, message: '邮箱或密码不正确。' }
        }
        set({ user: { id: found.id, email: found.email, createdAt: found.createdAt } })
        return { ok: true }
      },
      logout: () => set({ user: null }),
    }),
    {
      name: 'app_auth',
      partialize: (s) => ({ user: s.user, users: s.users }),
    }
  )
)

