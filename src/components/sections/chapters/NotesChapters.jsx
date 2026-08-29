import { useRef } from 'react'
import { gsap, useGSAP } from '../../../lib/gsap'

/** Same cube language as the mobile hero. One set per chapter, filling the right void. */
const STAGES = [
  [
    { ink: '#ebe7dd', w: 38, h: 42, x: 6, y: 8 },
    { ink: '#cfc8bc', w: 30, h: 32, x: 52, y: 4 },
    { ink: '#6a6560', w: 24, h: 26, x: 72, y: 44 },
    { ink: '#ebe7dd', w: 22, h: 24, x: 14, y: 56 },
    { ink: '#16110e', w: 20, h: 22, x: 42, y: 62 },
    { ink: '#cfc8bc', w: 16, h: 18, x: 78, y: 72 },
  ],
  [
    { ink: '#cfc8bc', w: 34, h: 36, x: 8, y: 6 },
    { ink: '#ebe7dd', w: 28, h: 30, x: 56, y: 10 },
    { ink: '#16110e', w: 22, h: 24, x: 74, y: 40 },
    { ink: '#6a6560', w: 26, h: 28, x: 10, y: 52 },
    { ink: '#ebe7dd', w: 18, h: 20, x: 48, y: 64 },
    { ink: '#cfc8bc', w: 16, h: 18, x: 70, y: 74 },
  ],
  [
    { ink: '#ebe7dd', w: 36, h: 38, x: 10, y: 4 },
    { ink: '#6a6560', w: 26, h: 28, x: 58, y: 8 },
    { ink: '#cfc8bc', w: 22, h: 24, x: 76, y: 38 },
    { ink: '#ebe7dd', w: 24, h: 26, x: 6, y: 54 },
    { ink: '#16110e', w: 20, h: 22, x: 40, y: 60 },
    { ink: '#cfc8bc', w: 18, h: 20, x: 68, y: 70 },
  ],
]

/**
 * Mobile notes — pinned chapters. Cubes fill the void and fly sideways on scrub.
 */
export default function NotesChapters({
  note1 = '',
  chapters = [],
  anchor = 'notes',
}) {
  const root = useRef(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

      const pin = root.current?.querySelector('[data-notes-pin]')
      const layers = gsap.utils.toArray('[data-notes-layer]', root.current)
      const bar = root.current?.querySelector('[data-notes-bar]')
      if (!pin || layers.length < 2) return undefined

      gsap.set(layers, { autoAlpha: 0 })
      gsap.set(layers[0], { autoAlpha: 1 })
      if (bar) gsap.set(bar, { scaleX: 1 / layers.length, transformOrigin: 'left center' })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: `+=${layers.length * 95}%`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      layers.forEach((layer, i) => {
        const at = i
        const tools = layer.querySelectorAll('[data-notes-tool]')
        const boxes = layer.querySelectorAll('[data-notes-box]')
        const stage = layer.querySelector('[data-notes-stage]')
        const fly = () => Math.round((stage?.offsetWidth || pin.offsetWidth) * 0.92)

        if (i > 0) {
          tl.to(layers[i - 1], { autoAlpha: 0, duration: 0.28 }, at)
          tl.fromTo(layer, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28 }, at)
        }
        tl.fromTo(
          tools,
          { opacity: i === 0 ? 0.25 : 0, y: 8 },
          { opacity: 1, y: 0, stagger: 0.04, duration: 0.28 },
          at + (i === 0 ? 0.04 : 0.06),
        )
        if (boxes.length) {
          gsap.set(boxes, { x: 0, y: 0, rotation: 0 })
          boxes.forEach((box, bi) => {
            const side = bi % 2 === 0 ? -1 : 1
            tl.to(
              box,
              {
                x: () => side * fly(),
                y: () => (bi % 3 === 0 ? -22 : 28),
                rotation: side * (55 + bi * 12),
                duration: 0.62,
              },
              at + 0.28,
            )
          })
        }
        if (bar) tl.to(bar, { scaleX: (i + 1) / layers.length, duration: 0.45 }, at)
      })
    },
    { scope: root, dependencies: [note1, chapters.length] },
  )

  return (
    <section ref={root} id={anchor} className="relative bg-ratio-paper text-ratio-ink">
      {note1 ? (
        <p className="px-5 pt-14 pb-8 max-w-[28ch] font-brico text-[1.05rem] leading-[1.45] text-ratio-ink/80">
          {note1}
        </p>
      ) : null}

      <div
        data-notes-pin
        className="relative flex h-svh flex-col overflow-hidden border-t border-ratio-ink/20 px-5 pt-10 pb-8"
      >
        <div className="mb-5 h-px shrink-0 bg-ratio-ink/20" aria-hidden="true">
          <span data-notes-bar className="block h-px origin-left bg-[#ffb800]" />
        </div>

        <div className="relative min-h-0 flex-1">
          {chapters.map((ch, i) => (
            <article key={ch.title} data-notes-layer className="absolute inset-0">
              <div
                data-notes-stage
                className="pointer-events-none absolute inset-x-0 top-[42%] bottom-0 overflow-hidden"
              >
                {(STAGES[i] ?? STAGES[0]).map((box, bi) => (
                  <span
                    key={`${ch.title}-box-${bi}`}
                    data-notes-box
                    className={
                      bi === 0
                        ? 'ratio-cube-face absolute will-change-transform'
                        : 'ratio-slug-face absolute will-change-transform'
                    }
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.w}%`,
                      height: `${box.h}%`,
                      backgroundColor: box.ink,
                      boxShadow: 'inset 0 0 0 1px #ebe6dc',
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <div className="relative z-10 flex h-full flex-col">
                <h2
                  data-notes-title
                  className="font-syne text-[clamp(2rem,10vw,3.1rem)] font-semibold leading-[0.95] tracking-[-0.04em] uppercase"
                >
                  {ch.title}
                </h2>
                <p
                  data-notes-blurb
                  className="mt-3 max-w-[34ch] font-brico text-[14px] leading-[1.45] text-ratio-ink/75"
                >
                  {ch.blurb}
                </p>

                <ul className="mt-5 grid shrink-0 grid-cols-2 gap-x-6 border-t border-ratio-ink/20">
                  {(ch.tools ?? []).map((tool) => (
                    <li
                      key={tool}
                      data-notes-tool
                      className="border-b border-ratio-ink/15 py-3 font-syne text-[clamp(1.05rem,5.4vw,1.45rem)] font-semibold tracking-[-0.03em] uppercase"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
