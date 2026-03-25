import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/features/storefront/stores/auth-store'

type Mode = 'login' | 'register'

const emailSchema = z.string().trim().email({ message: '请输入正确的邮箱地址。' })
const passwordSchema = z
  .string()
  .min(6, { message: '密码至少 6 位。' })
  .max(64, { message: '密码过长。' })

export function AuthPage() {
  const navigate = useNavigate()
  const { user, register, login } = useAuthStore()
  const [mode, setMode] = useState<Mode>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => email.trim().length > 0 && password.length > 0, [email, password])

  if (user) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div className="text-sm text-zinc-600">你已登录：</div>
          <div className="mt-2 text-lg font-semibold tracking-tight text-zinc-950">{user.email}</div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className={cn(
              'mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-medium',
              'bg-ink-950 text-white hover:bg-ink-900 active:bg-ink-950'
            )}
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    setError(null)
    const emailResult = emailSchema.safeParse(email)
    if (!emailResult.success) {
      setError(emailResult.error.issues[0]?.message ?? '邮箱格式不正确。')
      return
    }
    const passwordResult = passwordSchema.safeParse(password)
    if (!passwordResult.success) {
      setError(passwordResult.error.issues[0]?.message ?? '密码不合法。')
      return
    }

    const res =
      mode === 'register'
        ? register(emailResult.data, passwordResult.data)
        : login(emailResult.data, passwordResult.data)
    if (!res.ok) {
      setError(res.message)
      return
    }
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">ACCOUNT</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">注册 / 登录</h1>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={cn(
              'h-10 rounded-xl text-sm font-medium transition',
              mode === 'register' ? 'bg-white text-zinc-950' : 'text-zinc-600 hover:text-zinc-900'
            )}
          >
            注册
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={cn(
              'h-10 rounded-xl text-sm font-medium transition',
              mode === 'login' ? 'bg-white text-zinc-950' : 'text-zinc-600 hover:text-zinc-900'
            )}
          >
            登录
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="text-xs font-medium text-zinc-700">邮箱</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={cn(
                'mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none',
                'focus:border-zinc-400'
              )}
              autoComplete="email"
              inputMode="email"
            />
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-700">密码</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              className={cn(
                'mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none',
                'focus:border-zinc-400'
              )}
              type="password"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-medium transition',
              canSubmit
                ? 'bg-ink-950 text-white hover:bg-ink-900 active:bg-ink-950'
                : 'bg-zinc-200 text-zinc-500'
            )}
          >
            {mode === 'register' ? '创建账户' : '登录'}
          </button>

          <div className="text-xs leading-5 text-zinc-500">
            本页面为 mock 登录：账号数据保存在浏览器本地，仅用于演示购物流程与订单记录。
          </div>
        </div>
      </div>
    </div>
  )
}
