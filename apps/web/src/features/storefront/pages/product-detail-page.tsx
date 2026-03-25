import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ShoppingBag, Star } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { fetchProduct, fetchReviews } from '@/features/storefront/services/catalog'
import { useCartStore } from '@/features/storefront/stores/cart-store'
import type { Product } from '@/features/storefront/types'

function formatCny(amount: number) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
}

function pickDefaultSize(product: Product) {
  return product.sizes[1] ?? product.sizes[0] ?? 'M'
}

export function ProductDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const productId = id ?? ''

  const { data: product } = useQuery({
    queryKey: ['storefront', 'product', productId],
    queryFn: () => fetchProduct(productId),
    enabled: Boolean(productId),
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['storefront', 'reviews', productId],
    queryFn: () => fetchReviews(productId),
    enabled: Boolean(productId),
  })

  const [activeImage, setActiveImage] = useState(0)
  const [size, setSize] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const addItem = useCartStore((s) => s.addItem)

  const avg = useMemo(() => {
    if (!reviews.length) return null
    const sum = reviews.reduce((a, r) => a + r.rating, 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }, [reviews])

  if (!product) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          <ChevronLeft size={16} />
          返回
        </button>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="text-sm text-zinc-600">未找到该商品。</div>
          <div className="mt-4">
            <Link
              to="/products"
              className="inline-flex h-10 items-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 active:bg-zinc-950"
            >
              返回商品列表
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const images = product.imageUrls
  const selected = size ?? pickDefaultSize(product)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          <ChevronLeft size={16} />
          返回
        </button>
        <Link
          to="/products"
          className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          继续浏览
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100">
            <div className="aspect-[4/5]">
              <img
                src={images[activeImage] ?? images[0]}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {images.slice(0, 5).map((src, idx) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImage(idx)}
                className={cn(
                  'overflow-hidden rounded-2xl border bg-zinc-100',
                  idx === activeImage ? 'border-zinc-900' : 'border-zinc-200 hover:border-zinc-400'
                )}
                aria-label={`查看第${idx + 1}张图片`}
              >
                <div className="aspect-[4/5]">
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">DETAIL</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
              {product.title}
            </h1>
            <div className="mt-2 text-sm text-zinc-600">{product.subtitle}</div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-xl font-semibold text-zinc-950">{formatCny(product.price)}</div>
              {avg ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700">
                  <Star size={16} className="text-zinc-900" />
                  {avg} / 5（{reviews.length}）
                </div>
              ) : (
                <div className="text-sm text-zinc-500">暂无评价</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-zinc-950">选择尺码</div>
              <div className="text-xs text-zinc-500">建议：按常规码选择</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s)
                    setError(null)
                  }}
                  className={cn(
                    'h-10 rounded-xl px-4 text-sm font-medium transition',
                    s === selected
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-50 text-zinc-800 hover:bg-zinc-100'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const finalSize = size ?? pickDefaultSize(product)
                  addItem({
                    productId: product.id,
                    size: finalSize,
                    unitPrice: product.price,
                    quantity: 1,
                  })
                  navigate('/cart')
                }}
                className={cn(
                  'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium',
                  'bg-ink-950 text-white transition hover:bg-ink-900 active:bg-ink-950'
                )}
              >
                <ShoppingBag size={18} />
                加入购物车
              </button>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className={cn(
                  'inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium',
                  'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                )}
              >
                继续挑选
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-zinc-950">用户评价</div>
            {reviews.length ? (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-1 text-zinc-900">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            size={14}
                            className={cn(
                              idx < r.rating ? 'text-zinc-900' : 'text-zinc-200'
                            )}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-zinc-500">{formatDate(r.createdAt)}</div>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-zinc-700">{r.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
                暂无评价，欢迎成为第一位评价用户。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
