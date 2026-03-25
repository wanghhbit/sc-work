import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { EmptyState } from '@/features/storefront/components/empty-state'
import { useAuthStore } from '@/features/storefront/stores/auth-store'
import { useOrderStore } from '@/features/storefront/stores/order-store'

function formatCny(amount: number) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
}

export function OrdersPage() {
  const user = useAuthStore((s) => s.user)
  const orders = useOrderStore((s) => s.orders)
  const list = useMemo(() => (user ? orders.filter((o) => o.userId === user.id) : []), [orders, user])
  const [openId, setOpenId] = useState<string | null>(null)

  if (!user) {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">ORDERS</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">历史订单</h1>
        </div>
        <EmptyState
          title="请先登录"
          description="登录后可查看历史订单记录。"
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

  if (!list.length) {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">ORDERS</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">历史订单</h1>
        </div>
        <EmptyState
          title="暂无订单"
          description="从热销或新品开始，完成一次 mock 支付即可生成订单记录。"
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

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">ORDERS</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">历史订单</h1>
        <div className="mt-2 text-sm text-zinc-600">登录邮箱：{user.email}</div>
      </div>

      <div className="space-y-3">
        {list.map((o) => {
          const isOpen = openId === o.id
          return (
            <div
              key={o.id}
              className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            >
              <button
                type="button"
                onClick={() => setOpenId((cur) => (cur === o.id ? null : o.id))}
                className="flex w-full items-center justify-between gap-3 p-5 text-left"
              >
                <div>
                  <div className="text-sm font-semibold text-zinc-950">订单号：{o.id}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {formatDate(o.createdAt)} · 已支付
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-zinc-950">{formatCny(o.total)}</div>
                  <ChevronDown size={18} className={cn('transition', isOpen ? 'rotate-180' : '')} />
                </div>
              </button>

              {isOpen ? (
                <div className="border-t border-zinc-200 p-5">
                  <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-zinc-700">收货地址</div>
                      <div className="text-sm text-zinc-900">
                        {o.address.name} {o.address.phone}
                      </div>
                      <div className="text-sm text-zinc-600">
                        {o.address.region} {o.address.detail}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs font-medium text-zinc-700">商品明细</div>
                      <div className="space-y-2">
                        {o.items.map((it) => (
                          <div key={`${it.productId}_${it.size}`} className="flex items-start gap-3">
                            <div className="h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                              {it.imageUrl ? (
                                <img src={it.imageUrl} alt={it.title} className="h-full w-full object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
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
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
