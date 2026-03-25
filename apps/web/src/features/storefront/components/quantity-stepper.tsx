import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  className?: string
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.min(max, Math.floor(n)))
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: QuantityStepperProps) {
  const canDec = value > min
  const canInc = value < max

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl border border-zinc-200 bg-white',
        'shadow-[0_1px_0_rgba(0,0,0,0.04)]',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1, min, max))}
        disabled={!canDec}
        className={cn(
          'h-10 w-10 grid place-items-center rounded-l-xl',
          'text-zinc-700 transition',
          canDec ? 'hover:bg-zinc-50 active:bg-zinc-100' : 'opacity-40'
        )}
        aria-label="减少数量"
      >
        <Minus size={16} />
      </button>
      <input
        inputMode="numeric"
        value={String(value)}
        onChange={(e) => onChange(clamp(Number(e.target.value), min, max))}
        className="h-10 w-12 bg-transparent text-center text-sm text-zinc-900 outline-none"
        aria-label="数量"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1, min, max))}
        disabled={!canInc}
        className={cn(
          'h-10 w-10 grid place-items-center rounded-r-xl',
          'text-zinc-700 transition',
          canInc ? 'hover:bg-zinc-50 active:bg-zinc-100' : 'opacity-40'
        )}
        aria-label="增加数量"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}

