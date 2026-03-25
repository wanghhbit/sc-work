import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/features/storefront/types'

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  setQuantity: (productId: string, size: string, quantity: number) => void
  removeItem: (productId: string, size: string) => void
  clear: () => void
}

function clampQuantity(n: number) {
  if (!Number.isFinite(n)) return 1
  return Math.max(1, Math.min(99, Math.floor(n)))
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => {
        set((s) => {
          const quantity = clampQuantity(item.quantity)
          const idx = s.items.findIndex(
            (x) => x.productId === item.productId && x.size === item.size
          )
          if (idx === -1) {
            return { items: [{ ...item, quantity }, ...s.items] }
          }
          const next = [...s.items]
          const current = next[idx]
          next[idx] = { ...current, quantity: clampQuantity(current.quantity + quantity) }
          return { items: next }
        })
      },
      setQuantity: (productId, size, quantity) => {
        set((s) => ({
          items: s.items.map((x) =>
            x.productId === productId && x.size === size
              ? { ...x, quantity: clampQuantity(quantity) }
              : x
          ),
        }))
      },
      removeItem: (productId, size) => {
        set((s) => ({
          items: s.items.filter((x) => !(x.productId === productId && x.size === size)),
        }))
      },
      clear: () => set({ items: [] }),
    }),
    { name: 'app_cart', partialize: (s) => ({ items: s.items }) }
  )
)

