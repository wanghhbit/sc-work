import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/features/storefront/components/empty-state'
import { useAuthStore } from '@/features/storefront/stores/auth-store'
import { useCartStore } from '@/features/storefront/stores/cart-store'
import { useOrderStore } from '@/features/storefront/stores/order-store'
import { fetchProducts } from '@/features/storefront/services/catalog'
import { calcCartTotal, calcLineTotal } from '@/features/storefront/services/pricing'
import type { Address, OrderItem } from '@/features/storefront/types'

function formatCny(amount: number) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
}

const addressSchema = z.object({
  name: z.string().trim().min(1, { message: '请输入收货人姓名。' }).max(30),
  phone: z
    .string()
    .trim()
    .regex(/^1\d{10}$/, { message: '请输入正确的手机号。' }),
  region: z.string().trim().min(2, { message: '请输入省市区。' }).max(50),
  detail: z.string().trim().min(4, { message: '请输入详细地址。' }).max(80),
  postalCode: z.string().trim().optional(),
})

export function CheckoutPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const items = useCartStore((s) => s.items)
  const total = useMemo(() => calcCartTotal(items), [items])
  const { data: products = [] } = useQuery({
    queryKey: ['storefront', 'products'],
    queryFn: fetchProducts,
  })
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const setPending = useOrderStore((s) => s.setPending)

  const [form, setForm] = useState<Address>({
    name: '',
    phone: '',
    region: '',
    detail: '',
    postalCode: '',
  })
  const [error, setError] = useState<string | null>(null)

  if (!user) {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">CHECKOUT</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">结算</h1>
        </div>
        <EmptyState
          title="请先登录"
          description="登录后可填写收货地址并查看历史订单。"
          action={
            <Link
              to="/auth"
              className={cn(
                'inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium',
                'bg-ink-950 text-white hover:bg-ink-900 active:bg-ink-950'
              )}
            >
              去登录
            </Link>
          }
        />
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">CHECKOUT</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">结算</h1>
        </div>
        <EmptyState
          title="购物车为空"
          description="请先选择商品加入购物车后再结算。"
          action={
            <Link
              to="/products"
              className={cn(
                'inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium',
                'bg-ink-950 text-white hover:bg-ink-900 active:bg-ink-950'
              )}
            >
              去选购
            </Link>
          }
        />
      </div>
    )
  }

  const orderItems: OrderItem[] = items.map((it) => {
    const p = productById.get(it.productId)
    const title = p?.title ?? '未知商品'
    const imageUrl = p?.imageUrls?.[0] ?? ''
    return {
      productId: it.productId,
      title,
      imageUrl,
      size: it.size,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      lineTotal: calcLineTotal(it.unitPrice, it.quantity),
    }
  })

  const submit = () => {
    setError(null)
    const parsed = addressSchema.safeParse(form)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? '请检查收货地址信息。')
      return
    }
    setPending({
      userId: user.id,
      address: parsed.data,
      items: orderItems,
      total,
    })
    navigate('/pay')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">CHECKOUT</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">结算</h1>
        </div>
        <Link
          to="/cart"
          className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          返回购物车
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div className="text-sm font-semibold text-zinc-950">收货地址</div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <div className="text-xs font-medium text-zinc-700">收货人</div>
              <input
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                className={cn(
                  'mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none',
                  'focus:border-zinc-400'
                )}
                placeholder="姓名"
              />
            </div>
            <div className="sm:col-span-1">
              <div className="text-xs font-medium text-zinc-700">手机号</div>
              <input
                value={form.phone}
                onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                className={cn(
                  'mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none',
                  'focus:border-zinc-400'
                )}
                placeholder="11 位手机号"
                inputMode="numeric"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs font-medium text-zinc-700">省市区</div>
              <input
                value={form.region}
                onChange={(e) => setForm((s) => ({ ...s, region: e.target.value }))}
                className={cn(
                  'mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none',
                  'focus:border-zinc-400'
                )}
                placeholder="例如：上海市 徐汇区"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs font-medium text-zinc-700">详细地址</div>
              <input
                value={form.detail}
                onChange={(e) => setForm((s) => ({ ...s, detail: e.target.value }))}
                className={cn(
                  'mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none',
                  'focus:border-zinc-400'
                )}
                placeholder="街道门牌号等"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs font-medium text-zinc-700">邮编（可选）</div>
              <input
                value={form.postalCode ?? ''}
                onChange={(e) => setForm((s) => ({ ...s, postalCode: e.target.value }))}
                className={cn(
                  'mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none',
                  'focus:border-zinc-400'
                )}
                placeholder="邮编"
                inputMode="numeric"
              />
            </div>
          </div>
          {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div className="text-sm font-semibold text-zinc-950">订单摘要</div>
          <div className="mt-4 space-y-3">
            {orderItems.map((it) => (
              <div key={`${it.productId}_${it.size}`} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-zinc-900">{it.title}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {it.size} · {it.quantity} 件
                  </div>
                </div>
                <div className="shrink-0 text-sm font-semibold text-zinc-950">
                  {formatCny(it.lineTotal)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 h-px bg-zinc-200" />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-zinc-700">应付总额</span>
            <span className="text-xl font-semibold text-zinc-950">{formatCny(total)}</span>
          </div>
          <button
            type="button"
            onClick={submit}
            className={cn(
              'mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-medium',
              'bg-ink-950 text-white transition hover:bg-ink-900 active:bg-ink-950'
            )}
          >
            去支付
          </button>
          <div className="mt-3 text-xs leading-5 text-zinc-500">
            支付为 mock：点击后直接完成付款并写入历史订单。
          </div>
        </div>
      </div>
    </div>
  )
}
