import type { CartItem, OrderItem } from '@/features/storefront/types'

export function calcLineTotal(unitPrice: number, quantity: number) {
  const q = Number.isFinite(quantity) ? quantity : 0
  const p = Number.isFinite(unitPrice) ? unitPrice : 0
  return Math.max(0, p) * Math.max(0, q)
}

export function calcCartTotal(items: CartItem[]) {
  return items.reduce((sum, it) => sum + calcLineTotal(it.unitPrice, it.quantity), 0)
}

export function calcOrderTotal(items: OrderItem[]) {
  return items.reduce((sum, it) => sum + calcLineTotal(it.unitPrice, it.quantity), 0)
}

