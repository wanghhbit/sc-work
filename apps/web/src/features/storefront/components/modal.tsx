import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
}

export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="关闭弹窗"
      />
      <div className="absolute inset-x-4 top-24 mx-auto max-w-lg">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'rounded-2xl border border-zinc-200 bg-white',
            'shadow-[0_24px_70px_rgba(0,0,0,0.24)]'
          )}
        >
          <div className="p-6">
            <div className="text-[15px] font-semibold tracking-tight text-zinc-950">{title}</div>
            {description ? <div className="mt-2 text-sm text-zinc-600">{description}</div> : null}
            {children ? <div className="mt-5">{children}</div> : null}
          </div>
          {footer ? (
            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 p-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
