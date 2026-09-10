import { useRef } from 'react'
import { gsap, useGSAP, SplitText } from '../../../lib/gsap'

/** White striker + ink/gray slugs. Desktop furniture, vertical hops. */
const PIECES = [
  { id: 'striker', striker: true, ink: '#ebe7dd', w: 24, h: 24, x: 38, y: 4 },
  { id: 'pale', ink: '#cfc8bc', w: 16, h: 16, x: 6, y: 8 },
  { id: 'ink-a', ink: '#16110e', w: 16, h: 16, x: 74, y: 10 },
  { id: 'slate', ink: '#6a6560', w: 18, h: 18, x: 8, y: 40 },
  { id: 'paper', ink: '#ebe7dd', w: 14, h: 14, x: 76, y: 44 },
  { id: 'ink-b', ink: '#16110e', w: 18, h: 18, x: 40, y: 52 },
]

/**
 * Mobile hero — cubes collide on scroll. One viewport, no pin-spacer.
 */
export default function HeroCube({
  line1 = 'GUIDO',
  line2 = 'FRASSETTI',
  role = 'Full stack',
  kicker = '',
  meta = '',
}) {
  const root = useRef(null)

  useGSAP(
    () => {
      const stage = root.current.querySelector('[data-cube-stage]')
      const striker = root.current.querySelector('[data-striker]')
      const slugs = gsap.utils.toArray('[data-slug]', root.current)
      const brand = gsap.utils.toArray('[data-cube-brand]', root.current)
      const roleEl = root.current.querySelector('[data-cube-role]')
      if (!stage || !striker) return

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (brand.length && !reduced) {
        brand.forEach((el, i) => {
          const split = new SplitText(el, { type: 'chars', mask: 'chars' })
          gsap.from(split.chars, {
            yPercent: 110,
            duration: 1.05,
            ease: 'power4.out',
            stagger: 0.028,
            delay: 0.1 + i * 0.12,
          })
        })
        if (roleEl) {
          gsap.from(roleEl, {
            yPercent: 36,
            autoAlpha: 0,
            duration: 0.7,
            ease: 'power3.out',
            delay: 0.55,
          })
        }
      }

      gsap.set([striker, ...slugs], { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' })
      if (reduced) return

      const hop = () => Math.round(stage.offsetHeight * 0.2)
      const fly = () => Math.round(stage.offsetWidth * 0.78)

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.45,
          invalidateOnRefresh: true,
        },
      })

      tl.to(striker, { y: () => hop(), rotation: 90, duration: 0.22 }, 0)
      tl.to(slugs[0], { x: () => -fly(), y: () => hop() * 0.25, rotation: -140, duration: 0.28 }, 0.1)
      tl.to(slugs[1], { x: () => fly(), y: () => hop() * 0.15, rotation: 160, duration: 0.28 }, 0.14)
      tl.to(striker, { y: () => hop() * 2, rotation: 180, duration: 0.22 }, 0.32)
      tl.to(slugs[2], { x: () => -fly() * 0.85, y: () => hop() * 0.4, rotation: -110, duration: 0.3 }, 0.4)
      tl.to(slugs[3], { x: () => fly() * 0.9, y: () => hop() * 0.2, rotation: 130, duration: 0.28 }, 0.44)
      tl.to(striker, { y: () => hop() * 2.85, rotation: 270, duration: 0.22 }, 0.58)
      tl.to(slugs[4], { x: () => fly() * 0.55, y: () => hop() * 0.85, rotation: 95, duration: 0.28 }, 0.66)
    },
    { scope: root, dependencies: [line1, line2, role] },
  )

  return (
    <section ref={root} className="relative h-svh max-h-svh overflow-hidden bg-ratio-paper text-ratio-ink">
      <div
        data-cube-stage
        className="pointer-events-none absolute inset-x-0 top-[max(7.5rem,calc(env(safe-area-inset-top)+5.5rem))] bottom-[32%] overflow-hidden"
      >
        {PIECES.map((piece) => (
          <span
            key={piece.id}
            data-striker={piece.striker ? '' : undefined}
            data-slug={piece.striker ? undefined : ''}
            className={
              piece.striker
                ? 'ratio-cube-face absolute will-change-transform'
                : 'ratio-slug-face absolute will-change-transform'
            }
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              width: `${piece.w}%`,
              height: `${piece.h}%`,
              backgroundColor: piece.ink,
              boxShadow: piece.striker
                ? 'inset 0 0 0 1px color-mix(in srgb, #ebe6dc 35%, transparent)'
                : 'inset 0 0 0 1px #ebe6dc',
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="relative z-10 flex h-full flex-col px-5 pt-[max(5.25rem,env(safe-area-inset-top))] pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))]">
        {kicker ? (
          <p className="relative z-20 max-w-[34ch] font-brico text-[10px] uppercase tracking-[0.18em] text-ratio-ink/55">
            {kicker}
          </p>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col justify-end pb-4">
          <p
            data-cube-brand
            className="select-none whitespace-nowrap font-brico text-[clamp(2.75rem,calc((100vw-2.5rem)/6),5.4rem)] leading-[0.86] font-semibold tracking-[-0.05em]"
          >
            {line1}
          </p>
          <p
            data-cube-brand
            className="select-none whitespace-nowrap font-brico text-[clamp(2.75rem,calc((100vw-2.5rem)/6),5.4rem)] leading-[0.86] font-semibold tracking-[-0.05em]"
          >
            {line2}
          </p>
          <p
            data-cube-role
            className="mt-4 font-brico text-[clamp(1rem,4.6vw,1.25rem)] font-medium tracking-[0.12em] uppercase text-[#ffb800]"
          >
            {role}
          </p>
        </div>

        {meta ? (
          <p className="border-t border-ratio-ink/20 pt-3 font-brico text-[10px] uppercase tracking-[0.18em] text-ratio-ink/55">
            {meta}
          </p>
        ) : null}
      </div>
    </section>
  )
}
