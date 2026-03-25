import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  className?: string
  action?: ReactNode
}

export function EmptyState({ title, description, className, action }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200 bg-white p-6 text-center',
        'shadow-[0_1px_0_rgba(0,0,0,0.04)]',
        className
      )}
    >
      <div className="mx-auto max-w-[28rem]">
        <h2 className="text-base font-semibold tracking-tight text-zinc-900">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
        ) : null}
        {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
      </div>
    </div>
  )
}
