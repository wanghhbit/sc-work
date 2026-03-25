import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/features/storefront/components/empty-state'
import { useOrderStore } from '@/features/storefront/stores/order-store'
import { useCartStore } from '@/features/storefront/stores/cart-store'

function formatCny(amount: number) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
}

export function PayPage() {
  const navigate = useNavigate()
  const pending = useOrderStore((s) => s.pending)
  const markPaid = useOrderStore((s) => s.markPaid)
  const clearCart = useCartStore((s) => s.clear)

  const [paidOrderId, setPaidOrderId] = useState<string | null>(null)

  const snapshot = useMemo(() => pending, [pending])

  if (!snapshot) {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">PAYMENT</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">支付</h1>
        </div>
        <EmptyState
          title="暂无待支付订单"
          description="请先从购物车进入结算并提交订单。"
          action={
            <Link
              to="/cart"
              className={cn(
                'inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium',
                'bg-ink-950 text-white hover:bg-ink-900 active:bg-ink-950'
              )}
            >
              返回购物车
            </Link>
          }
        />
      </div>
    )
  }

  if (paidOrderId) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-zinc-900" size={22} />
            <div>
              <div className="text-lg font-semibold tracking-tight text-zinc-950">支付成功</div>
              <div className="mt-1 text-sm text-zinc-600">订单号：{paidOrderId}</div>
            </div>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className={cn(
                'inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium',
                'bg-ink-950 text-white hover:bg-ink-900 active:bg-ink-950'
              )}
            >
              查看订单
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className={cn(
                'inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium',
                'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
              )}
            >
              继续逛逛
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="text-sm font-semibold text-zinc-950">支付方式</div>
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <div className="flex items-start gap-3">
            <CreditCard size={18} className="mt-0.5 text-zinc-900" />
            <div>
              <div className="text-sm font-medium text-zinc-900">Mock 支付</div>
              <div className="mt-1 text-sm leading-6 text-zinc-600">
                点击支付按钮后直接完成付款并写入历史订单。
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 text-sm text-zinc-600">
          收货地址：{snapshot.address.region} {snapshot.address.detail}（{snapshot.address.name}{' '}
          {snapshot.address.phone}）
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="text-sm font-semibold text-zinc-950">金额确认</div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-zinc-700">应付总额</span>
          <span className="text-xl font-semibold text-zinc-950">{formatCny(snapshot.total)}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            const order = markPaid()
            if (!order) return
            clearCart()
            setPaidOrderId(order.id)
          }}
          className={cn(
            'mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-medium',
            'bg-ink-950 text-white transition hover:bg-ink-900 active:bg-ink-950'
          )}
        >
          立即支付
        </button>
        <Link
          to="/checkout"
          className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          返回修改地址
        </Link>
      </div>
    </div>
  )
}
