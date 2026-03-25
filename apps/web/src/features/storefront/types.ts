export interface AuthUser {
  id: string
  email: string
  createdAt: string
}

export interface Product {
  id: string
  title: string
  subtitle: string
  price: number
  imageUrls: string[]
  sizes: string[]
  isNew: boolean
  isHot: boolean
}

export interface Review {
  id: string
  productId: string
  rating: number
  content: string
  createdAt: string
}

export interface CartItem {
  productId: string
  size: string
  unitPrice: number
  quantity: number
}

export interface Address {
  name: string
  phone: string
  region: string
  detail: string
  postalCode?: string
}

export interface OrderItem {
  productId: string
  title: string
  imageUrl: string
  size: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface Order {
  id: string
  userId: string
  createdAt: string
  status: 'paid'
  address: Address
  items: OrderItem[]
  total: number
}
