import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  homeNewUserDismissed: boolean
  dismissHomeNewUser: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      homeNewUserDismissed: false,
      dismissHomeNewUser: () => set({ homeNewUserDismissed: true }),
    }),
    { name: 'app_ui', partialize: (s) => ({ homeNewUserDismissed: s.homeNewUserDismissed }) }
  )
)

