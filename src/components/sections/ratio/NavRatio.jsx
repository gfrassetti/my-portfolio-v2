import { useRef } from 'react'
import { parseNavLinks } from '../../../lib/navLinks'
import { gsap, useGSAP, ScrollTrigger } from '../../../lib/gsap'
import { attachScroll, magScale } from '../../../lib/beat'
import RuptureLayer from './RuptureLayer'
import { GF_MARK_PATH, GF_MARK_VIEWBOX } from '../../gf-mark'

const LINK_CLASS =
  'px-1.5 py-0.5 text-[10px] tracking-[0.2em] uppercase max-[479px]:px-1 max-[479px]:tracking-[0.14em] md:text-[11px]'

/**
 * NavRatio — hairline bar (brand + locale). Index sits as a bottom dock,
 * then each link rides a Beat rail into the header.
 */
export default function NavRatio({
  brand = 'RATIO',
  role = 'Developer',
  links = ['Plates | #intro', 'Notes | #notes', 'Press | #index'],
  linksText,
  credit = '',
  locale = 'es',
  onLocale,
  langLabel = 'Language',
  indexLabel = 'Index',
}) {
  const root = useRef(null)
  const items = parseNavLinks(links, linksText).slice(0, 3)

  useGSAP(
    () => {
      const wrap = root.current
      const shell = wrap.querySelector('[data-nav-shell]')
      const pieceEls = gsap.utils.toArray('[data-nav-item]', wrap)
      const phs = gsap.utils.toArray('[data-nav-ph]', wrap)
      const slashes = gsap.utils.toArray('[data-nav-slash]', wrap)
      if (!shell || pieceEls.length !== phs.length || !pieceEls.length) return undefined

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const isDock = () => window.matchMedia('(max-width: 767px)').matches
      const floorGap = () => (isDock() ? 14 : window.matchMedia('(min-width: 768px)').matches ? 24 : 20)

      const layout = () => {
        const dock = isDock()
        const gapX = dock ? 10 : 8
        const padX = dock ? 16 : 18
        const padY = dock ? 8 : 10
        const widths = pieceEls.map((el) => el.offsetWidth)
        const h = Math.max(...pieceEls.map((el) => el.offsetHeight), 16)
        const row = widths.reduce((n, w) => n + w, 0) + gapX * (pieceEls.length - 1)
        const vw = window.innerWidth
        const top = window.innerHeight - h - padY * 2 - floorGap()
        let x = Math.max(padX, (vw - row) / 2)
        const from = pieceEls.map((_, i) => {
          const pos = { top, left: x }
          x += widths[i] + gapX
          return pos
        })
        const to = phs.map((ph) => {
          const r = ph.getBoundingClientRect()
          return { top: r.top, left: r.left }
        })
        return {
          from,
          to,
          shell: {
            top: top - padY,
            left: from[0].left - padX,
            width: row + padX * 2,
            height: h + padY * 2,
          },
        }
      }

      let players = []
      let st

      const mountRails = () => {
        players = []
        const s = magScale(window.innerWidth)
        const { from, to, shell: box } = layout()
        gsap.set(shell, box)
        pieceEls.forEach((el, i) => {
          el.style.removeProperty('offset-path')
          el.style.removeProperty('offset-distance')
          el.style.removeProperty('offset-rotate')
          el.style.transform = ''
          gsap.set(el, {
            position: 'fixed',
            top: from[i].top,
            left: from[i].left,
            x: 0,
            y: 0,
            autoAlpha: 1,
          })
          players[i] = attachScroll(
            el,
            [
              {
                delay_px: i * 280,
                dx: (to[i].left - from[i].left) / s,
                dy: (to[i].top - from[i].top) / s,
                acc: 'ease-out',
                speed: 0.48,
              },
            ],
            s,
          )
        })
      }

      const seekAll = (progress) => {
        const max = Math.max(...players.map((p) => p.duration), 1)
        const px = progress * max
        players.forEach((p) => p.seek(px))
        const fade = reduced ? (progress > 0.2 ? 0 : 1) : 1 - Math.min(1, progress / 0.28)
        gsap.set(shell, { autoAlpha: fade })
        // Below lg the full brand can't sit next to three links + locale.
        wrap.toggleAttribute('data-nav-compact', window.innerWidth < 1024 && progress > 0.5)
        slashes.forEach((el) => {
          gsap.set(el, { opacity: progress > 0.62 ? 0.35 : 0 })
        })
      }

      const bind = () => {
        st?.kill()
        mountRails()
        const drawer = document.querySelector('[data-drawer]')
        if (!drawer) {
          seekAll(0)
          return
        }
        const trigger = drawer.closest('[data-plates-pin]') || drawer
        st = ScrollTrigger.create({
          trigger,
          start: 'top 92%',
          end: 'top -8%',
          scrub: reduced ? true : 0.6,
          invalidateOnRefresh: true,
          onRefresh(self) {
            mountRails()
            seekAll(self.progress)
          },
          onUpdate(self) {
            seekAll(self.progress)
          },
        })
        seekAll(st.progress)
      }

      const later = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bind()
          ScrollTrigger.refresh()
        })
      })
      const onResize = () => bind()
      window.addEventListener('resize', onResize)

      return () => {
        cancelAnimationFrame(later)
        window.removeEventListener('resize', onResize)
        st?.kill()
      }
    },
    { scope: root, dependencies: [links, linksText] },
  )

  return (
    <div ref={root}>
      <header
        data-ratio-nav
        className="fixed inset-x-0 top-0 z-50 border-b border-ratio-ink bg-ratio-paper text-ratio-ink"
      >
        <div className="flex h-11 items-center gap-2 overflow-hidden px-3 text-[10px] tracking-[0.18em] uppercase md:h-12 md:gap-3 md:px-5 md:text-[11px]">
          <a href="#top" aria-label={`${brand} — ${role}`} className="ratio-brand relative flex shrink-0 items-center">
            <svg
              data-brand-mark
              viewBox={GF_MARK_VIEWBOX}
              className="h-[18px] w-auto shrink-0 md:h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinejoin="miter"
              aria-hidden="true"
            >
              <path d={GF_MARK_PATH} vectorEffect="non-scaling-stroke" />
            </svg>
            <span
              data-brand-full
              aria-hidden="true"
              className="ml-2 block text-[11px] leading-[1.08] font-medium tracking-[-0.01em] normal-case md:ml-2.5 md:text-[12px]"
            >
              <span className="block">{brand}</span>
              <span className="block opacity-55">{role}</span>
            </span>
          </a>
          <div data-nav-slot className="flex min-h-0 min-w-0 flex-1 items-center justify-center px-2 md:px-4">
            {items.map((item, i) => (
              <span key={item.label} className="flex items-center">
                {i > 0 ? (
                  <span data-nav-slash className="px-1 opacity-0">
                    /
                  </span>
                ) : null}
                <span data-nav-ph className={`invisible ${LINK_CLASS}`}>
                  {item.label}
                </span>
              </span>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {credit ? <span className="hidden opacity-45 lg:inline">{credit}</span> : null}
            <fieldset className="flex items-center gap-1 border-0 p-0">
              <legend className="sr-only">{langLabel}</legend>
              <button
                type="button"
                aria-pressed={locale === 'es'}
                onClick={() => onLocale?.('es')}
                className={`ui-press rounded-full px-1.5 py-0.5 ${
                  locale === 'es' ? 'bg-ratio-ink text-ratio-paper' : 'ratio-link'
                }`}
              >
                ES
              </button>
              <span className="opacity-35" aria-hidden="true">
                —
              </span>
              <button
                type="button"
                aria-pressed={locale === 'en'}
                onClick={() => onLocale?.('en')}
                className={`ui-press rounded-full px-1.5 py-0.5 ${
                  locale === 'en' ? 'bg-ratio-ink text-ratio-paper' : 'ratio-link'
                }`}
              >
                EN
              </button>
            </fieldset>
          </div>
        </div>
      </header>

      <nav aria-label={indexLabel}>
        <div
          data-nav-shell
          aria-hidden="true"
          className="pointer-events-none fixed z-50 border border-ratio-ink bg-ratio-paper"
        />
        {items.map((item) => (
          <a
            key={item.label}
            data-nav-item
            href={item.href}
            className={`ratio-link pointer-events-auto fixed z-50 text-ratio-ink opacity-80 transition-opacity duration-200 ease-[var(--ease-out)] hover:opacity-100 active:opacity-50 ${LINK_CLASS}`}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <RuptureLayer />
    </div>
  )
}
