import { useRef } from 'react'
import { gsap, useGSAP } from '../../../lib/gsap'
import { reduceScrollMotion } from '../../../lib/motion'

/**
 * Mobile work — one pinned frame; cases crossfade on scrub.
 * Title stays in a top band so it never hides inside the shot.
 */
export default function WorkChapters({ cases = [], anchor = 'study' }) {
  const root = useRef(null)

  useGSAP(
    () => {
      if (reduceScrollMotion()) return undefined

      const pin = root.current?.querySelector('[data-work-pin]')
      const layers = gsap.utils.toArray('[data-work-layer]', root.current)
      const bar = root.current?.querySelector('[data-work-bar]')
      if (!pin || layers.length < 2) return undefined

      gsap.set(layers, { autoAlpha: 0 })
      gsap.set(layers[0], { autoAlpha: 1 })
      layers.forEach((layer, i) => {
        const media = layer.querySelector('[data-work-media]')
        if (media) gsap.set(media, { scale: i === 0 ? 1 : 1.08 })
      })
      if (bar) gsap.set(bar, { scaleX: 1 / layers.length, transformOrigin: 'left center' })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: `+=${layers.length * 50}%`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      layers.forEach((layer, i) => {
        const at = i
        const media = layer.querySelector('[data-work-media]')
        if (i === 0) {
          if (media) tl.fromTo(media, { scale: 1.08 }, { scale: 1, duration: 0.7 }, 0)
          tl.to({}, { duration: 0.45 }, 0)
        } else {
          // Out first, then in — overlapping layers stack two titles.
          const title = layer.querySelector('[data-work-title]')
          tl.to(layers[i - 1], { autoAlpha: 0, duration: 0.16 }, at)
          tl.fromTo(layer, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18 }, at + 0.1)
          if (title) tl.fromTo(title, { yPercent: 18 }, { yPercent: 0, duration: 0.3, ease: 'power2.out' }, at + 0.1)
          if (media) tl.fromTo(media, { scale: 1.1 }, { scale: 1, duration: 0.7 }, at + 0.1)
        }
        if (bar) tl.to(bar, { scaleX: (i + 1) / layers.length, duration: 0.5 }, at)
      })
    },
    { scope: root, dependencies: [cases.length] },
  )

  return (
    <section ref={root} id={anchor} className="relative bg-ratio-paper text-ratio-ink">
      <div data-work-pin className="relative h-svh overflow-hidden">
        {cases.map((item) => (
          <article key={`${item.index}-${item.kicker}`} data-work-layer className="absolute inset-0">
            <img
              data-work-media
              src={item.img}
              alt=""
              className={`absolute inset-0 h-full w-full grayscale ${
                item.contain ? 'object-contain bg-ratio-paper p-10' : 'object-cover'
              }`}
              style={item.focus ? { objectPosition: item.focus } : undefined}
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-ratio-paper via-ratio-paper/50 to-ratio-paper"
              aria-hidden="true"
            />

            <div className="relative flex h-full flex-col px-5 pt-14 pb-8">
              <p className="flex items-center justify-between gap-4 font-brico text-[11px] tracking-[0.16em] uppercase text-ratio-ink/70">
                <span>{item.meta}</span>
                <span className="tabular-nums text-ratio-ink">
                  {item.index} / {String(cases.length).padStart(2, '0')}
                </span>
              </p>
              <h2
                data-work-title
                className="mt-3 font-syne text-[clamp(2rem,11vw,3.4rem)] font-semibold leading-[0.95] tracking-[-0.04em] uppercase text-ratio-ink"
              >
                {item.kicker}
              </h2>

              <p
                data-work-quote
                className="mt-auto max-w-[30ch] font-brico text-[16px] leading-[1.45] text-ratio-ink"
              >
                {item.quote}
              </p>
              <p
                data-work-specs
                className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-ratio-ink/40 pt-3.5 font-brico text-[12px] tracking-[0.12em] uppercase text-ratio-ink/75"
              >
                <span>{item.specValue}</span>
                <span>{item.spec2Value}</span>
                <span>{item.spec3Value}</span>
              </p>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noreferrer" className="ratio-more mt-4">
                  <span>{item.linkLabel}</span>
                  <span className="ratio-more-arrow" aria-hidden="true">
                    <span>→</span>
                    <span>→</span>
                  </span>
                  <span className="ratio-more-line" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </article>
        ))}

        <div className="pointer-events-none absolute inset-x-5 top-11 z-10 h-px bg-ratio-ink/25" aria-hidden="true">
          <span data-work-bar className="block h-px origin-left bg-[#ffb800]" />
        </div>
      </div>
    </section>
  )
}
