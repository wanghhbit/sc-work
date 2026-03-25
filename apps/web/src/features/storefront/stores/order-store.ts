import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Address, Order, OrderItem } from '@/features/storefront/types'

interface PendingOrder {
  userId: string
  address: Address
  items: OrderItem[]
  total: number
}

interface OrderState {
  orders: Order[]
  pending: PendingOrder | null
  setPending: (pending: PendingOrder) => void
  clearPending: () => void
  markPaid: () => Order | null
}

function orderId() {
  return `o_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      pending: null,
      setPending: (pending) => set({ pending }),
      clearPending: () => set({ pending: null }),
      markPaid: () => {
        const pending = get().pending
        if (!pending) return null
        const now = new Date().toISOString()
        const order: Order = {
          id: orderId(),
          userId: pending.userId,
          createdAt: now,
          status: 'paid',
          address: pending.address,
          items: pending.items,
          total: pending.total,
        }
        set((s) => ({ orders: [order, ...s.orders], pending: null }))
        return order
      },
    }),
    { name: 'app_orders', partialize: (s) => ({ orders: s.orders, pending: s.pending }) }
  )
)

