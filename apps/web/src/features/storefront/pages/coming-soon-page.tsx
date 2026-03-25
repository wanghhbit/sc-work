import { Link } from 'react-router-dom'
import { EmptyState } from '@/features/storefront/components/empty-state'
import { cn } from '@/lib/utils'

export function ComingSoonPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">COMING SOON</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">敬请期待</h1>
      </div>
      <EmptyState
        title="该页面尚未上线"
        description="我们正在完善更多内容与功能，欢迎先浏览商品与完成下单流程。"
        action={
          <Link
            to="/products"
            className={cn(
              'inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium',
              'bg-ink-950 text-white hover:bg-ink-900 active:bg-ink-950'
            )}
          >
            去商品列表
          </Link>
        }
      />
    </div>
  )
}
