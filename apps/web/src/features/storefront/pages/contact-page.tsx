import { useMemo, useState } from 'react'
import { Mail, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

const officialEmail = 'support@noir.example'

export function ContactPage() {
  const [subject, setSubject] = useState('咨询与合作')
  const [message, setMessage] = useState('')

  const mailto = useMemo(() => {
    const params = new URLSearchParams()
    params.set('subject', subject)
    if (message.trim()) params.set('body', message)
    return `mailto:${officialEmail}?${params.toString()}`
  }, [message, subject])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="text-[11px] font-medium tracking-[0.18em] text-zinc-500">CONTACT</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">联系官方</h1>
        <div className="mt-2 text-sm text-zinc-600">我们会通过邮件与您沟通。</div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-950">官方邮箱</div>
            <div className="mt-1 text-sm text-zinc-600">{officialEmail}</div>
          </div>
          <a
            href={`mailto:${officialEmail}`}
            className={cn(
              'inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium',
              'bg-ink-950 text-white hover:bg-ink-900 active:bg-ink-950'
            )}
          >
            <Mail size={18} />
            发邮件
          </a>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <div className="text-xs font-medium text-zinc-700">主题</div>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={cn(
                'mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none',
                'focus:border-zinc-400'
              )}
              placeholder="请输入主题"
            />
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-700">内容</div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={cn(
                'mt-2 min-h-32 w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none',
                'focus:border-zinc-400'
              )}
              placeholder="请输入你的问题或需求，我们会尽快回复。"
            />
          </div>
          <a
            href={mailto}
            className={cn(
              'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium',
              'bg-ink-950 text-white hover:bg-ink-900 active:bg-ink-950'
            )}
          >
            <Send size={18} />
            使用邮件发送
          </a>
          <div className="text-xs leading-5 text-zinc-500">
            点击按钮将打开你的默认邮箱客户端并自动填充主题与内容。
          </div>
        </div>
      </div>
    </div>
  )
}
