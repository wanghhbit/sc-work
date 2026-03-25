import type { Product } from '@/features/storefront/types'

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1400&q=80`

export const products: Product[] = [
  {
    id: 'p_001',
    title: '修身针织上衣',
    subtitle: '轻薄贴肤 · 通勤必备',
    price: 159,
    imageUrls: [
      img('photo-1520975682031-a1c5d78d98d4'),
      img('photo-1520974735194-6b8edc5461a3'),
      img('photo-1520975916090-3105957b105f'),
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    isNew: true,
    isHot: true,
  },
  {
    id: 'p_002',
    title: '高腰直筒牛仔裤',
    subtitle: '利落线条 · 显腿长',
    price: 249,
    imageUrls: [
      img('photo-1520975957379-6f7a1b018d7b'),
      img('photo-1520975692180-5d4da2d3f5b8'),
      img('photo-1520975715960-f82d3adab1b8'),
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: true,
    isHot: false,
  },
  {
    id: 'p_003',
    title: '廓形西装外套',
    subtitle: '挺括有型 · 质感黑',
    price: 399,
    imageUrls: [
      img('photo-1520975959273-2cd3b3f3b8e4'),
      img('photo-1520975911260-6f9b91cce0ed'),
      img('photo-1520975917235-2bfa0f7f1c4b'),
    ],
    sizes: ['S', 'M', 'L'],
    isNew: false,
    isHot: true,
  },
  {
    id: 'p_004',
    title: '缎面吊带连衣裙',
    subtitle: '柔光垂坠 · 米色点缀',
    price: 329,
    imageUrls: [
      img('photo-1520975869993-81f5f36a1a63'),
      img('photo-1520975899386-6c20a4c4b9e7'),
      img('photo-1520975886946-243d8a7c16f0'),
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    isNew: true,
    isHot: true,
  },
  {
    id: 'p_005',
    title: '针织半身裙',
    subtitle: '舒适弹力 · 细节克制',
    price: 189,
    imageUrls: [
      img('photo-1520975912304-4c21b84f0f0e'),
      img('photo-1520975892205-34f8b5b0a9aa'),
      img('photo-1520975895780-30b2bb18ce19'),
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    isNew: false,
    isHot: false,
  },
  {
    id: 'p_006',
    title: '羊毛混纺大衣',
    subtitle: '深蓝强调 · 冬季主角',
    price: 699,
    imageUrls: [
      img('photo-1520975971438-bd8cc9a3a0e9'),
      img('photo-1520975962373-f0b23d38fa90'),
      img('photo-1520975969043-08c65b1a4f38'),
    ],
    sizes: ['S', 'M', 'L'],
    isNew: false,
    isHot: true,
  },
]

export function getProductById(id: string) {
  return products.find((p) => p.id === id) ?? null
}

