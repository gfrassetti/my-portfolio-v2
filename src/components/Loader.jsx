import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { getLenis } from '../hooks/useLenis'

const MIN_MS = 1700

/** Real progress: fonts + every <img> in the document, as a 0..1 ratio. */
function trackAssets(onProgress) {
  const imgs = [...document.images]
  const total = imgs.length + 1
  let done = 0
  const bump = () => {
    done += 1
    onProgress(Math.min(1, done / total))
  }
  imgs.forEach((img) => {
    if (img.complete) bump()
    else {
      img.addEventListener('load', bump, { once: true })
      img.addEventListener('error', bump, { once: true })
    }
  })
  const fonts = document.fonts?.ready ?? Promise.resolve()
  fonts.then(bump, bump)
}

/**
 * Loader — 000 → 100 counter on a hairline rule, then the panel shutters up.
 * The counter eases toward real asset progress but never finishes before
 * MIN_MS so the reveal always reads as a beat, not a flash.
 */
export default function Loader({ brand = 'GUIDO FRASSETTI', label = 'Loading', tag = 'Portfolio — 2026' }) {
  const root = useRef(null)
  const num = useRef(null)
  const bar = useRef(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    html.classList.add('is-loading')
    window.scrollTo(0, 0)

    let lenisWait = 0
    const holdLenis = () => {
      const lenis = getLenis()
      if (lenis) lenis.stop()
      else lenisWait = requestAnimationFrame(holdLenis)
    }
    holdLenis()

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()
    let target = 0
    let shown = 0
    let raf = 0
    let finished = false

    trackAssets((p) => {
      target = p
    })

    // Entrances that should play on reveal (hero type) wait for this.
    const reveal = () => {
      if (html.dataset.ready === 'true') return
      html.dataset.ready = 'true'
      window.dispatchEvent(new Event('ratio:ready'))
    }

    const release = () => {
      cancelAnimationFrame(lenisWait)
      html.classList.remove('is-loading')
      getLenis()?.start()
      reveal()
      setGone(true)
    }

    const exit = () => {
      // Refresh pins while still covered: a refresh re-parents pinned nodes,
      // which must not happen mid-entrance.
      ScrollTrigger.refresh()
      const el = root.current
      if (!el || reduced) {
        release()
        return
      }
      const tl = gsap.timeline({ onComplete: release })
      tl.to(el.querySelectorAll('[data-loader-fade]'), { yPercent: -60, autoAlpha: 0, duration: 0.5, ease: 'power3.in', stagger: 0.04 })
      tl.to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.95, ease: 'power4.inOut' }, '-=0.15')
      // Type starts landing as the shutter clears the floor.
      tl.call(reveal, null, '-=0.55')
    }

    const frame = (now) => {
      const time = Math.min(1, (now - start) / MIN_MS)
      // Never ahead of the clock or the assets — whichever is slower.
      const goal = Math.min(target, time)
      shown += (goal - shown) * (reduced ? 1 : 0.12)
      if (goal >= 1 && shown > 0.995) shown = 1
      const v = Math.round(shown * 100)
      if (num.current) num.current.textContent = String(v).padStart(3, '0')
      if (bar.current) bar.current.style.transform = `scaleX(${shown})`
      if (shown >= 1 && !finished) {
        finished = true
        setTimeout(exit, 220)
        return
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    // Safety: a stalled asset never traps the page.
    const bail = setTimeout(() => {
      target = 1
    }, 6000)

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(lenisWait)
      clearTimeout(bail)
      html.classList.remove('is-loading')
    }
  }, [])

  if (gone) return null

  return (
    <div
      ref={root}
      className="ratio-loader fixed inset-0 z-[300] flex flex-col bg-ratio-paper text-ratio-ink"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      role="progressbar"
      aria-label={label}
    >
      <div
        data-loader-fade
        className="flex h-11 items-center justify-between border-b border-ratio-ink px-3 text-[10px] tracking-[0.18em] uppercase md:h-12 md:px-5 md:text-[11px]"
      >
        <span className="font-medium">{brand}</span>
        <span className="opacity-55">{tag}</span>
      </div>

      <div className="grid flex-1 grid-cols-4 md:grid-cols-12" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            className={`border-r border-ratio-ink/12 last:border-r-0 ${i >= 4 ? 'max-md:hidden' : ''}`}
          />
        ))}
      </div>

      <div className="px-3 pb-5 md:px-5 md:pb-7">
        <div data-loader-fade className="flex items-end justify-between gap-6">
          <span
            ref={num}
            className="font-display text-[clamp(5.5rem,24vw,19rem)] leading-[0.78] font-medium tracking-[-0.06em] tabular-nums"
          >
            000
          </span>
          <span className="mb-2 flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase md:text-[11px]">
            <i className="ratio-loader-blink block size-2 bg-ratio-mark" />
            {label}
          </span>
        </div>
        <div data-loader-fade className="relative mt-5 h-px bg-ratio-ink/20">
          <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-ratio-ink" />
        </div>
      </div>
    </div>
  )
}
