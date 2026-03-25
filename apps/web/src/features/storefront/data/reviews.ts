import type { Review } from '@/features/storefront/types'

export const reviewsByProductId: Record<string, Review[]> = {
  p_001: [
    {
      id: 'r_001',
      productId: 'p_001',
      rating: 5,
      content: '上身很显瘦，面料舒服不扎，搭配西装外套很好看。',
      createdAt: '2026-02-08T10:22:00.000Z',
    },
    {
      id: 'r_002',
      productId: 'p_001',
      rating: 4,
      content: '颜色和图片一致，尺码标准，建议按平时码买。',
      createdAt: '2026-02-19T03:11:00.000Z',
    },
  ],
  p_002: [
    {
      id: 'r_003',
      productId: 'p_002',
      rating: 5,
      content: '直筒版型很友好，显腿长，日常通勤很适合。',
      createdAt: '2026-01-27T12:05:00.000Z',
    },
  ],
  p_003: [
    {
      id: 'r_004',
      productId: 'p_003',
      rating: 5,
      content: '肩线很挺，整体很有质感，黑色很高级。',
      createdAt: '2026-03-02T08:30:00.000Z',
    },
  ],
  p_004: [
    {
      id: 'r_005',
      productId: 'p_004',
      rating: 4,
      content: '垂坠感不错，米色很温柔，适合约会或聚会。',
      createdAt: '2026-03-11T15:18:00.000Z',
    },
  ],
  p_005: [
    {
      id: 'r_006',
      productId: 'p_005',
      rating: 4,
      content: '弹力很好，穿着舒适，搭配上衣很干净。',
      createdAt: '2026-02-01T07:44:00.000Z',
    },
  ],
  p_006: [
    {
      id: 'r_007',
      productId: 'p_006',
      rating: 5,
      content: '深蓝色很耐看，保暖度在线，整体版型很好。',
      createdAt: '2026-01-10T09:12:00.000Z',
    },
  ],
}

export function getReviews(productId: string) {
  return reviewsByProductId[productId] ?? []
}

