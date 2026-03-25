import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/features/storefront/types'

interface ProductCardProps {
  product: Product
  onQuickAdd?: (product: Product) => void
  className?: string
}

function formatCny(amount: number) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
}

export function ProductCard({ product, onQuickAdd, className }: ProductCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white',
        'shadow-[0_1px_0_rgba(0,0,0,0.04)] transition',
        'hover:shadow-[0_18px_60px_rgba(0,0,0,0.10)]',
        className
      )}
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
          <img
            src={product.imageUrls[0]}
            alt={product.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            {product.isNew ? (
              <span className="rounded-full bg-white/85 px-2 py-1 text-[11px] font-medium text-zinc-900 backdrop-blur">
                新品
              </span>
            ) : null}
            {product.isHot ? (
              <span className="rounded-full bg-ink-950/85 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
                热销
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight text-zinc-950">
              {product.title}
            </div>
            <div className="mt-1 truncate text-xs text-zinc-600">{product.subtitle}</div>
          </div>
          <div className="shrink-0 text-sm font-semibold text-zinc-950">{formatCny(product.price)}</div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-zinc-500">{product.sizes.join(' · ')}</div>
          <button
            type="button"
            onClick={() => onQuickAdd?.(product)}
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium',
              'bg-ink-950 text-white transition',
              'hover:bg-ink-900 active:bg-ink-950'
            )}
            aria-label="加入购物车"
          >
            <ShoppingBag size={16} />
            加购
          </button>
        </div>
      </div>
    </div>
  )
}
