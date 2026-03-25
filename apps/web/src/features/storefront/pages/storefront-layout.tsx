import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, User2, Mail, Search, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/features/storefront/stores/auth-store'
import { useCartStore } from '@/features/storefront/stores/cart-store'
import type { ReactNode } from 'react'

function Brand() {
  return (
    <div className="flex items-baseline gap-2">
      <div className="text-lg font-semibold tracking-tight text-zinc-950">NOIR</div>
      <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">WOMENSWEAR</div>
    </div>
  )
}

function HeaderLink({
  to,
  children,
}: {
  to: string
  children: ReactNode
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'inline-flex h-10 items-center rounded-xl px-3 text-sm font-medium transition',
          isActive ? 'bg-ink-950 text-white' : 'text-zinc-700 hover:bg-zinc-100'
        )
      }
    >
      {children}
    </NavLink>
  )
}

export function StorefrontLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const cartCount = useCartStore((s) => s.items.reduce((sum, it) => sum + it.quantity, 0))

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-xl px-2 py-1 text-left hover:bg-zinc-100"
              aria-label="返回首页"
            >
              <Brand />
            </button>

            <div className="hidden items-center gap-2 sm:flex">
              <HeaderLink to="/">首页</HeaderLink>
              <HeaderLink to="/products">商品</HeaderLink>
              <HeaderLink to="/orders">订单</HeaderLink>
              <HeaderLink to="/contact">联系</HeaderLink>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(
                  'hidden h-10 w-10 items-center justify-center rounded-xl',
                  'text-zinc-700 hover:bg-zinc-100 sm:inline-flex'
                )}
                aria-label="搜索（敬请期待）"
                onClick={() => navigate('/coming-soon')}
              >
                <Search size={18} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/contact')}
                className={cn(
                  'hidden h-10 w-10 items-center justify-center rounded-xl',
                  'text-zinc-700 hover:bg-zinc-100 sm:inline-flex'
                )}
                aria-label="联系官方"
              >
                <Mail size={18} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/cart')}
                className={cn(
                  'relative inline-flex h-10 w-10 items-center justify-center rounded-xl',
                  'text-zinc-700 hover:bg-zinc-100'
                )}
                aria-label="购物车"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 ? (
                  <span
                    className={cn(
                      'absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full',
                      'bg-ink-950 px-1 text-[11px] font-semibold text-white'
                    )}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                ) : null}
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/orders')}
                    className={cn(
                      'hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium',
                      'text-zinc-700 hover:bg-zinc-100 sm:inline-flex'
                    )}
                    aria-label="账户"
                  >
                    <User2 size={18} />
                    {user.email}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      navigate('/')
                    }}
                    className={cn(
                      'inline-flex h-10 w-10 items-center justify-center rounded-xl',
                      'text-zinc-700 hover:bg-zinc-100'
                    )}
                    aria-label="退出登录"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className={cn(
                    'inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium',
                    'bg-ink-950 text-white transition hover:bg-ink-900 active:bg-ink-950'
                  )}
                  aria-label="注册或登录"
                >
                  <User2 size={18} />
                  登录
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Brand />
              <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-600">
                黑白灰基调，辅以克制点缀色。用大图与留白呈现更清晰的穿搭选择。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <NavLink className="text-zinc-700 hover:text-zinc-950" to="/products">
                商品列表
              </NavLink>
              <NavLink className="text-zinc-700 hover:text-zinc-950" to="/orders">
                历史订单
              </NavLink>
              <NavLink className="text-zinc-700 hover:text-zinc-950" to="/contact">
                联系官方
              </NavLink>
              <NavLink className="text-zinc-700 hover:text-zinc-950" to="/coming-soon">
                会员权益
              </NavLink>
              <NavLink className="text-zinc-700 hover:text-zinc-950" to="/coming-soon">
                门店信息
              </NavLink>
              <NavLink className="text-zinc-700 hover:text-zinc-950" to="/coming-soon">
                配送与售后
              </NavLink>
            </div>
          </div>
          <div className="mt-8 text-xs text-zinc-500">© {new Date().getFullYear()} NOIR</div>
        </div>
      </footer>
    </div>
  )
}
