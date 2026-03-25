import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Filter, X } from 'lucide-react'
import { ProductCard } from '@/features/storefront/components/product-card'
import { fetchProducts } from '@/features/storefront/services/catalog'
import { useCartStore } from '@/features/storefront/stores/cart-store'
import type { Product } from '@/features/storefront/types'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

function pickDefaultSize(product: Product) {
  return product.sizes[1] ?? product.sizes[0] ?? 'M'
}

export function ProductsPage() {
  const navigate = useNavigate()
  const { data: products = [] } = useQuery({
    queryKey: ['storefront', 'products'],
    queryFn: fetchProducts,
  })

  const [q, setQ] = useState('')
  const [onlyNew, setOnlyNew] = useState(false)
  const [onlyHot, setOnlyHot] = useState(false)

  const list = useMemo(() => {
    const query = q.trim()
    return products
      .filter((p) => (onlyNew ? p.isNew : true))
      .filter((p) => (onlyHot ? p.isHot : true))
      .filter((p) =>
        query
          ? `${p.title} ${p.subtitle}`.toLowerCase().includes(query.toLowerCase())
          : true
      )
  }, [products, q, onlyNew, onlyHot])

  const addItem = useCartStore((s) => s.addItem)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">CATALOG</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">商品列表</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索商品（本地 mock）"
              className={cn(
                'h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none',
                'shadow-[0_1px_0_rgba(0,0,0,0.04)]',
                'focus:border-zinc-400'
              )}
              aria-label="搜索商品"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="清空搜索"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyNew((v) => !v)}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium transition',
                onlyNew ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-100',
                'border border-zinc-200 shadow-[0_1px_0_rgba(0,0,0,0.04)]'
              )}
              aria-label="筛选新品"
            >
              <Filter size={16} />
              新品
            </button>
            <button
              type="button"
              onClick={() => setOnlyHot((v) => !v)}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium transition',
                onlyHot ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-100',
                'border border-zinc-200 shadow-[0_1px_0_rgba(0,0,0,0.04)]'
              )}
              aria-label="筛选热销"
            >
              <Filter size={16} />
              热销
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((p) => (
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
    </div>
  )
}

