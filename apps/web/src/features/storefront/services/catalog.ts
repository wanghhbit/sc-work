import { products, getProductById } from '@/features/storefront/data/catalog'
import { getReviews } from '@/features/storefront/data/reviews'

export async function fetchProducts() {
  return products
}

export async function fetchProduct(id: string) {
  return getProductById(id)
}

export async function fetchReviews(productId: string) {
  return getReviews(productId)
}

