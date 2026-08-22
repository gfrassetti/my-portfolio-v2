import { useRef } from 'react'
import { gsap, useGSAP, SplitText } from '../../../lib/gsap'

/**
 * Mobile storytelling type hero — pin + scrub, Awwwards-style kinetic copy.
 * No photography. Desktop keeps ratio/HeroTools.
 */
export default function HeroKinetic({
  word1 = 'HOLA',
  word2 = 'SOY',
  word3 = 'GUIDO',
  word4 = 'WEB',
  word5 = 'DEVELOPER',
  kicker = 'Landings, A/B y APIs — el stack que mueve producto.',
  meta = 'Buenos Aires — +5 años',
  hint = 'Deslizá',
}) {
  const root = useRef(null)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const pin = root.current.querySelector('[data-type-pin]')
      const brand = root.current.querySelector('[data-type-brand]')
      const lines = gsap.utils.toArray('[data-type-line]', root.current)
      const marks = gsap.utils.toArray('[data-type-mark]', root.current)
      const rail = root.current.querySelector('[data-type-rail]')
      const hintEl = root.current.querySelector('[data-type-hint]')

      if (reduced) {
        gsap.set([brand, ...lines, ...marks, rail, hintEl], { clearProps: 'all', autoAlpha: 1 })
        return
      }

      const splits = lines.map(
        (line) =>
          new SplitText(line, {
            type: 'chars',
            mask: 'chars',
          }),
      )

      gsap.set(brand, { autoAlpha: 1, scale: 1 })
      gsap.set(lines, { autoAlpha: 0 })
      splits.forEach((s) => gsap.set(s.chars, { yPercent: 110 }))
      gsap.set(marks, { scaleX: 0, transformOrigin: 'left center' })
      gsap.set(rail, { autoAlpha: 0.35 })
      gsap.set(hintEl, { autoAlpha: 1 })

      const brandSplit = new SplitText(brand, { type: 'chars', mask: 'chars' })
      gsap.from(brandSplit.chars, {
        yPercent: 120,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.028,
        delay: 0.15,
      })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=220%',
          pin: pin,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // 0 — hold brand
      tl.to({}, { duration: 0.35 }, 0)

      // 1 — HOLA rises, brand eases back
      tl.to(brand, { scale: 0.72, yPercent: -8, duration: 0.55 }, 0.35)
      tl.to(lines[0], { autoAlpha: 1, duration: 0.08 }, 0.4)
      tl.to(splits[0].chars, { yPercent: 0, duration: 0.55, stagger: 0.02 }, 0.4)
      tl.to(marks[0], { scaleX: 1, duration: 0.4 }, 0.55)

      // 2 — SOY
      tl.to(splits[0].chars, { yPercent: -110, duration: 0.4, stagger: 0.012 }, 1.05)
      tl.to(lines[0], { autoAlpha: 0, duration: 0.12 }, 1.35)
      tl.to(lines[1], { autoAlpha: 1, duration: 0.08 }, 1.2)
      tl.to(splits[1].chars, { yPercent: 0, duration: 0.5, stagger: 0.022 }, 1.2)
      tl.to(marks[1], { scaleX: 1, duration: 0.35 }, 1.35)

      // 3 — WEB + DEVELOPER stack under GUIDO
      tl.to(splits[1].chars, { yPercent: -110, duration: 0.35, stagger: 0.01 }, 1.85)
      tl.to(lines[1], { autoAlpha: 0, duration: 0.1 }, 2.1)
      tl.to(brand, { scale: 1, yPercent: -18, duration: 0.55 }, 1.9)
      tl.to(lines[2], { autoAlpha: 1, duration: 0.08 }, 2.0)
      tl.to(splits[2].chars, { yPercent: 0, duration: 0.55, stagger: 0.018 }, 2.0)
      tl.to(lines[3], { autoAlpha: 1, duration: 0.08 }, 2.25)
      tl.to(splits[3].chars, { yPercent: 0, duration: 0.55, stagger: 0.016 }, 2.25)
      tl.to(marks[2], { scaleX: 1, duration: 0.4 }, 2.35)
      tl.to(rail, { autoAlpha: 1, duration: 0.3 }, 2.4)
      tl.to(hintEl, { autoAlpha: 0, duration: 0.25 }, 2.5)

      // 4 — exit drift
      tl.to(pin, { opacity: 0.2, yPercent: -6, duration: 0.7 }, 3.0)
    },
    { scope: root, dependencies: [word1, word2, word3, word4, word5] },
  )

  return (
    <section ref={root} className="relative bg-ratio-paper text-ratio-ink">
      <div
        data-type-pin
        className="relative flex h-svh flex-col overflow-hidden px-5 pt-[max(5.25rem,env(safe-area-inset-top))] pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))]"
      >
        {/* Atmosphere — rules + field, not photos */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-y-0 left-[12%] w-px bg-ratio-ink/12" />
          <div className="absolute inset-y-0 left-[58%] w-px bg-ratio-ink/10" />
          <div className="absolute inset-y-0 right-[18%] w-px bg-ratio-ink/14" />
          <div className="absolute top-[38%] left-[8%] size-9 border border-ratio-ink/30" />
          <div className="absolute top-[42%] left-[14%] size-4 bg-[#ffb800]" />
          <div className="absolute right-[10%] bottom-[28%] h-16 w-11 border border-ratio-ink/25" />
          <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#16110e] via-[#16110e]/40 to-transparent" />
        </div>

        <div className="relative z-10 flex items-start justify-between gap-4">
          <p className="max-w-[28ch] font-brico text-[10px] uppercase tracking-[0.2em] text-ratio-ink/50">
            {kicker}
          </p>
          <p
            data-type-rail
            className="shrink-0 font-brico text-[10px] tracking-[0.22em] text-ratio-ink/45"
          >
            01 — INTRO
          </p>
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center">
          <p
            data-type-brand
            className="select-none font-brico text-[clamp(3.4rem,22vw,6rem)] leading-[0.78] font-semibold tracking-[-0.045em]"
          >
            {word3}
          </p>

          <div className="relative mt-3 min-h-[3.4rem]">
            <p
              data-type-line
              className="absolute inset-x-0 top-0 select-none font-display text-[clamp(2rem,12vw,3.2rem)] leading-none font-normal italic tracking-normal text-[#ffb800]"
            >
              {word1}
            </p>
            <p
              data-type-line
              className="absolute inset-x-0 top-0 select-none font-display text-[clamp(2rem,12vw,3.2rem)] leading-none font-normal italic tracking-normal text-[#ffb800]"
            >
              {word2}
            </p>
            <p
              data-type-line
              className="absolute inset-x-0 top-0 select-none font-brico text-[clamp(1.65rem,10vw,2.6rem)] leading-[0.9] font-medium tracking-[-0.03em]"
            >
              {word4}
            </p>
            <p
              data-type-line
              className="absolute inset-x-0 top-[2.1rem] select-none font-brico text-[clamp(1.65rem,10vw,2.6rem)] leading-[0.9] font-medium tracking-[-0.03em] text-ratio-ink/75"
            >
              {word5}
            </p>
          </div>

          <div className="mt-8 space-y-2" aria-hidden="true">
            <span data-type-mark className="block h-px w-24 bg-ratio-ink/40" />
            <span data-type-mark className="block h-px w-16 bg-[#ffb800]" />
            <span data-type-mark className="block h-px w-36 bg-ratio-ink/25" />
          </div>
        </div>

        <div className="relative z-10 flex items-end justify-between gap-4 border-t border-ratio-ink/20 pt-4">
          <p className="font-brico text-[10px] uppercase tracking-[0.18em] text-ratio-ink/55">{meta}</p>
          <p
            data-type-hint
            className="shrink-0 font-brico text-[10px] uppercase tracking-[0.18em] text-[#ffb800]"
          >
            {hint} <span aria-hidden="true">↓</span>
          </p>
        </div>
      </div>
    </section>
  )
}
