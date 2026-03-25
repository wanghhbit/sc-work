import { useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/features/storefront/components/empty-state'
import { QuantityStepper } from '@/features/storefront/components/quantity-stepper'
import { useCartStore } from '@/features/storefront/stores/cart-store'
import { fetchProducts } from '@/features/storefront/services/catalog'
import { calcCartTotal, calcLineTotal } from '@/features/storefront/services/pricing'

function formatCny(amount: number) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
}

export function CartPage() {
  const navigate = useNavigate()
  const { data: products = [] } = useQuery({
    queryKey: ['storefront', 'products'],
    queryFn: fetchProducts,
  })
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const total = useMemo(() => calcCartTotal(items), [items])

  if (!items.length) {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">CART</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">购物车</h1>
        </div>
        <EmptyState
          title="购物车为空"
          description="从新品或热销开始挑选，找到适合你的搭配。"
          action={
            <Link
              to="/products"
              className={cn(
                'inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium',
                'bg-ink-950 text-white hover:bg-ink-900 active:bg-ink-950'
              )}
            >
              去逛逛
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">CART</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">购物车</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          继续挑选
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-3">
          {items.map((it) => {
            const p = productById.get(it.productId)
            const title = p?.title ?? '未知商品'
            const imageUrl = p?.imageUrls?.[0] ?? ''
            const lineTotal = calcLineTotal(it.unitPrice, it.quantity)
            return (
              <div
                key={`${it.productId}_${it.size}`}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
              >
                <div className="flex gap-4">
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    {imageUrl ? (
                      <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold tracking-tight text-zinc-950">
                          {title}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">尺码：{it.size}</div>
                        <div className="mt-2 text-sm font-medium text-zinc-900">
                          {formatCny(it.unitPrice)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(it.productId, it.size)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                        aria-label="移除商品"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <QuantityStepper
                        value={it.quantity}
                        onChange={(next) => setQuantity(it.productId, it.size, next)}
                      />
                      <div className="text-sm font-semibold text-zinc-950">{formatCny(lineTotal)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div className="text-sm font-semibold text-zinc-950">订单摘要</div>
          <div className="mt-4 flex items-center justify-between text-sm text-zinc-700">
            <span>商品金额</span>
            <span className="font-medium text-zinc-950">{formatCny(total)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-zinc-700">
            <span>运费</span>
            <span className="font-medium text-zinc-950">{formatCny(0)}</span>
          </div>
          <div className="mt-4 h-px bg-zinc-200" />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-zinc-700">应付总额</span>
            <span className="text-xl font-semibold text-zinc-950">{formatCny(total)}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className={cn(
              'mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-medium',
              'bg-ink-950 text-white transition hover:bg-ink-900 active:bg-ink-950'
            )}
          >
            去结算
          </button>
          <div className="mt-3 text-xs leading-5 text-zinc-500">
            支付为 mock：点击支付即完成付款并生成订单。
          </div>
        </div>
      </div>
    </div>
  )
}
