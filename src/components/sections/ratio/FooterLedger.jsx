import { useRef } from 'react'
import { gsap, useGSAP, ScrollTrigger } from '../../../lib/gsap'
import { reduceScrollMotion } from '../../../lib/motion'

/**
 * GF as data: every piece is the same 2×4 bar (h = horizontal, v = vertical),
 * placed on a 22×10 unit grid. Overlaps are fine — same ink.
 * `mark` paints the bar in the brand red (same accent as the favicon).
 */
const BAR_W = 4
const BAR_T = 2
const GRID = { w: 22, h: 10 }
const BARS = [
  // G
  { o: 'v', x: 0, y: 0 },
  { o: 'v', x: 0, y: 4 },
  { o: 'h', x: 0, y: 8 },
  { o: 'h', x: 4, y: 8 },
  { o: 'v', x: 8, y: 6 },
  { o: 'h', x: 2, y: 0 },
  { o: 'h', x: 6, y: 0 },
  { o: 'h', x: 6, y: 4, mark: true },
  // F
  { o: 'v', x: 12, y: 0 },
  { o: 'v', x: 12, y: 4 },
  { o: 'v', x: 12, y: 6 },
  { o: 'h', x: 14, y: 0 },
  { o: 'h', x: 18, y: 0 },
  { o: 'h', x: 14, y: 4 },
]

/** Deterministic scatter so scrubbing back and forth always replays the same fall. */
const rand = (i, k) => {
  const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453
  return v - Math.floor(v)
}

/**
 * FooterLedger — the page signs off with a GF built from equal bars (Kin-
 * style: React + GSAP + CSS, no Lottie). Bars drop in spinning and lock into
 * the monogram as you scroll; scrolling up throws them back out. Contact
 * ledger sits to the side.
 */
export default function FooterLedger({
  title = 'YOUR TITLE',
  hint = 'Scroll down ¬',
  brand = 'Brand',
  studio = '',
  contactLabel = 'Contact',
  row1Label = 'Made by',
  row1Value = 'Studio',
  row2Label = 'Say hi',
  row2Value = 'hello@studio.test',
  row3Label = '',
  row3Value = '',
  row4Label = '',
  row4Value = '',
  row5Label = '',
  row5Value = '',
  anchor = 'index',
}) {
  const root = useRef(null)

  const rows = [
    [row1Label, row1Value],
    [row2Label, row2Value],
    [row3Label, row3Value],
    [row4Label, row4Value],
    [row5Label, row5Value],
  ].filter(([k, v]) => k && v)

  useGSAP(
    () => {
      const pin = root.current?.querySelector('[data-ledger-pin]')
      const stage = root.current?.querySelector('[data-gf-stage]')
      const bars = gsap.utils.toArray('[data-gf-bar]', root.current)
      const side = root.current?.querySelectorAll('[data-ledger-side]')
      if (!pin || !stage || !bars.length) return undefined

      // Letters → pixels: fit the 22×10 grid into the stage, bottom-left anchored.
      const layout = () => {
        const W = stage.clientWidth
        const H = stage.clientHeight
        const u = Math.min(W / GRID.w, H / GRID.h)
        const offY = H - GRID.h * u
        bars.forEach((el, i) => {
          const b = BARS[i]
          const w = (b.o === 'h' ? BAR_W : BAR_T) * u
          const h = (b.o === 'h' ? BAR_T : BAR_W) * u
          Object.assign(el.style, {
            left: `${b.x * u}px`,
            top: `${offY + b.y * u}px`,
            width: `${Math.ceil(w)}px`,
            height: `${Math.ceil(h)}px`,
          })
        })
      }
      layout()

      if (reduceScrollMotion()) return undefined

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      const n = bars.length
      bars.forEach((el, i) => {
        // Fall from above the frame, spinning, slightly off-lane.
        const at = (i / n) * 0.55 + rand(i, 1) * 0.08
        tl.fromTo(
          el,
          {
            x: () => (rand(i, 2) - 0.5) * stage.clientWidth * 0.5,
            y: () => -(stage.getBoundingClientRect().top + stage.clientHeight + 120 + rand(i, 3) * 400),
            rotation: (rand(i, 4) < 0.5 ? -1 : 1) * (120 + rand(i, 5) * 300),
            autoAlpha: 1,
          },
          { x: 0, y: 0, rotation: 0, duration: 0.32, ease: 'power2.in' },
          at,
        )
        // Landing kick: a short overshoot tilt, like a bar slapping the floor.
        tl.to(el, { rotation: (rand(i, 6) - 0.5) * 10, duration: 0.05, ease: 'power1.out' }, at + 0.32)
        tl.to(el, { rotation: 0, duration: 0.08, ease: 'back.out(3)' }, at + 0.37)
      })
      if (side?.length) {
        tl.fromTo(side, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.05 }, 0.62)
      }
      tl.to({}, { duration: 0.15 })

      ScrollTrigger.addEventListener('refreshInit', layout)
      return () => ScrollTrigger.removeEventListener('refreshInit', layout)
    },
    { scope: root },
  )

  return (
    <footer ref={root} id={anchor} className="relative z-0 bg-ratio-paper text-ratio-ink">
      <div data-ledger-pin className="relative h-svh overflow-hidden">
        <div className="absolute inset-0 grid grid-rows-[auto_1fr_auto] gap-6 px-4 pt-[calc(2.75rem+1.25rem)] pb-5 min-[480px]:px-5 md:grid-cols-[1fr_minmax(18rem,24rem)] md:grid-rows-[auto_1fr] md:gap-x-10 md:px-8 md:pt-[calc(3rem+1.75rem)] md:pb-8">
          <header className="flex items-start justify-between gap-6 border-b border-ratio-ink pb-4 md:col-span-2">
            <div>
              <h2 className="font-display text-[clamp(1.4rem,3.2vw,2.8rem)] leading-[0.95] font-medium uppercase">
                {title}
              </h2>
              <p className="mt-3 flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase">
                <span aria-hidden="true" className="size-2 bg-ratio-mark" />
                {brand}
                {studio ? <span className="opacity-50">— {studio}</span> : null}
              </p>
            </div>
            <p className="shrink-0 pt-1 text-[11px] tracking-[0.16em] uppercase">{hint}</p>
          </header>

          <div data-gf-stage className="relative min-h-0" role="img" aria-label="GF">
            {BARS.map((b, i) => (
              <span
                key={i}
                data-gf-bar
                className={`absolute block ${b.mark ? 'bg-ratio-mark' : 'bg-ratio-ink'}`}
                style={{ willChange: 'transform' }}
              />
            ))}
          </div>

          <aside className="flex flex-col justify-end md:pb-1">
            <p data-ledger-side className="flex items-center justify-between border-b border-ratio-ink pb-3 text-[11px] tracking-[0.16em] uppercase">
              <span>({contactLabel})</span>
              <span className="tabular-nums opacity-50">{String(rows.length).padStart(2, '0')}</span>
            </p>
            <dl>
              {rows.map(([k, v]) => {
                const href = /@/.test(v) ? `mailto:${v}` : /^\+?[\d\s]{8,}$/.test(v) ? `tel:${v.replace(/\s/g, '')}` : null
                return (
                  <div
                    key={k}
                    data-ledger-side
                    className="flex items-baseline justify-between gap-4 border-b border-ratio-ink/30 py-3 text-[12px] tracking-[0.12em] uppercase md:text-[13px]"
                  >
                    <dt className="shrink-0 opacity-50">{k}</dt>
                    <dd className="min-w-0 text-right [overflow-wrap:anywhere]">
                      {href ? (
                        <a href={href} className="ratio-link ratio-text-link">
                          {v}
                        </a>
                      ) : (
                        v
                      )}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </aside>
        </div>
      </div>
    </footer>
  )
}
