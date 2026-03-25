import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'

export interface CarouselSlide {
  id: string
  imageUrl: string
  title: string
  subtitle: string
  href: string
}

interface CarouselProps {
  slides: CarouselSlide[]
  className?: string
}

export function Carousel({ slides, className }: CarouselProps) {
  const safeSlides = useMemo(() => slides.filter((s) => Boolean(s.imageUrl)), [slides])
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (safeSlides.length <= 1) return
    const t = window.setInterval(() => {
      setActive((i) => (i + 1) % safeSlides.length)
    }, 5200)
    return () => window.clearInterval(t)
  }, [safeSlides.length])

  const current = safeSlides[active]
  if (!current) return null

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100',
        'shadow-[0_1px_0_rgba(0,0,0,0.04)]',
        className
      )}
    >
      <div className="relative aspect-[16/9] sm:aspect-[21/9]">
        <img src={current.imageUrl} alt={current.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-x-4 bottom-4 sm:inset-x-8 sm:bottom-7">
          <div className="max-w-xl">
            <div className="text-[11px] font-medium tracking-[0.18em] text-white/80">
              EDITION
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {current.title}
            </div>
            <div className="mt-2 text-sm leading-6 text-white/80">{current.subtitle}</div>
            <div className="mt-4">
              <Link
                to={current.href}
                className={cn(
                  'inline-flex h-11 items-center rounded-xl px-4 text-sm font-medium',
                  'bg-white text-zinc-950 transition',
                  'hover:bg-white/95 active:bg-white'
                )}
              >
                立即选购
              </Link>
            </div>
          </div>
        </div>
      </div>

      {safeSlides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => setActive((i) => (i - 1 + safeSlides.length) % safeSlides.length)}
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 rounded-full',
              'bg-white/80 text-zinc-950 shadow-sm backdrop-blur',
              'h-10 w-10 grid place-items-center transition',
              'hover:bg-white active:bg-white'
            )}
            aria-label="上一张"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setActive((i) => (i + 1) % safeSlides.length)}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 rounded-full',
              'bg-white/80 text-zinc-950 shadow-sm backdrop-blur',
              'h-10 w-10 grid place-items-center transition',
              'hover:bg-white active:bg-white'
            )}
            aria-label="下一张"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur">
              {safeSlides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(idx)}
                  className={cn(
                    'h-1.5 w-6 rounded-full transition',
                    idx === active ? 'bg-white' : 'bg-white/45 hover:bg-white/70'
                  )}
                  aria-label={`切换到第${idx + 1}张`}
                />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

