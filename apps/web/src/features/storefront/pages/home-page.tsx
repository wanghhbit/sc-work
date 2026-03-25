import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Carousel, type CarouselSlide } from '@/features/storefront/components/carousel'
import { Modal } from '@/features/storefront/components/modal'
import { ProductCard } from '@/features/storefront/components/product-card'
import { useCartStore } from '@/features/storefront/stores/cart-store'
import { useUiStore } from '@/features/storefront/stores/ui-store'
import { fetchProducts } from '@/features/storefront/services/catalog'
import type { Product } from '@/features/storefront/types'
import { cn } from '@/lib/utils'

function pickDefaultSize(product: Product) {
  return product.sizes[1] ?? product.sizes[0] ?? 'M'
}

export function HomePage() {
  const navigate = useNavigate()
  const { data: products = [] } = useQuery({
    queryKey: ['storefront', 'products'],
    queryFn: fetchProducts,
  })

  const newArrivals = useMemo(() => products.filter((p) => p.isNew).slice(0, 4), [products])
  const bestSellers = useMemo(() => products.filter((p) => p.isHot).slice(0, 4), [products])

  const { homeNewUserDismissed, dismissHomeNewUser } = useUiStore()
  const addItem = useCartStore((s) => s.addItem)

  const slides: CarouselSlide[] = useMemo(
    () => [
      {
        id: 's1',
        imageUrl: products[3]?.imageUrls?.[0] ?? products[0]?.imageUrls?.[0] ?? '',
        title: '黑白灰主场',
        subtitle: '用留白与剪裁呈现更清晰的质感层次',
        href: '/products',
      },
      {
        id: 's2',
        imageUrl: products[1]?.imageUrls?.[0] ?? products[2]?.imageUrls?.[0] ?? '',
        title: '通勤衣橱更新',
        subtitle: '从针织到廓形西装，轻松完成一周搭配',
        href: '/products',
      },
      {
        id: 's3',
        imageUrl: products[5]?.imageUrls?.[0] ?? products[4]?.imageUrls?.[0] ?? '',
        title: '深蓝点缀',
        subtitle: '克制强调色，用于更坚定的选择',
        href: '/products',
      },
    ],
    [products]
  )

  return (
    <div className="space-y-10">
      <Carousel slides={slides} />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">NEW</div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">新品推荐</h2>
          </div>
          <Link
            to="/products"
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium',
              'text-zinc-700 hover:bg-zinc-100'
            )}
          >
            查看全部 <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {newArrivals.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onQuickAdd={(product) => {
                addItem({
                  productId: product.id,
                  size: pickDefaultSize(product),
                  unitPrice: product.price,
                  quantity: 1,
                })
                navigate('/cart')
              }}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">HOT</div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">热销商品</h2>
          </div>
          <Link
            to="/products"
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium',
              'text-zinc-700 hover:bg-zinc-100'
            )}
          >
            查看全部 <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {bestSellers.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onQuickAdd={(product) => {
                addItem({
                  productId: product.id,
                  size: pickDefaultSize(product),
                  unitPrice: product.price,
                  quantity: 1,
                })
                navigate('/cart')
              }}
            />
          ))}
        </div>
      </section>

      <Modal
        open={!homeNewUserDismissed}
        onClose={dismissHomeNewUser}
        title="欢迎来到 NOIR"
        description="新用户专享：首单下单立减已上线为 mock 展示。注册登录后可查看历史订单。"
        footer={
          <>
            <button
              type="button"
              onClick={dismissHomeNewUser}
              className={cn(
                'inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium',
                'text-zinc-700 hover:bg-zinc-100'
              )}
            >
              先逛逛
            </button>
            <button
              type="button"
              onClick={() => {
                dismissHomeNewUser()
                navigate('/auth')
              }}
              className={cn(
                'inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium',
                'bg-ink-950 text-white transition hover:bg-ink-900 active:bg-ink-950'
              )}
            >
              注册/登录
            </button>
          </>
        }
      />
    </div>
  )
}
