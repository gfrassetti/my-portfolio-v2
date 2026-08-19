import { useRef } from 'react'
import { gsap, useGSAP, ScrollTrigger } from '../../../lib/gsap'

function StudyMeta({ kicker, meta, index, specs }) {
  return (
    <div className="flex h-full flex-col bg-ratio-paper px-5 py-8 lg:border-r lg:border-ratio-ink lg:px-8 lg:py-10">
      <header className="flex items-start justify-between gap-4 border-b border-ratio-ink pb-4">
        <div>
          <p className="font-brico text-[12px] tracking-[0.04em]">
            <span className="mr-2 text-ratio-mark">●</span>
            {kicker}
          </p>
          <p className="mt-2 font-brico text-[12px] tracking-[0.04em] opacity-50">{meta}</p>
        </div>
        <span className="font-brico text-[12px] tracking-[0.08em] opacity-50">({index})</span>
      </header>
      <dl className="mt-1">
        {specs.map(([label, value], i) => (
          <div
            key={`${label}-${i}`}
            className="flex items-baseline justify-between gap-4 border-b border-ratio-ink py-3 font-brico text-[13px] tracking-[0.03em]"
          >
            <dt className="opacity-45">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function StudyCard({ quote, quoteBy, quoteRole, img, avatar, contain, portrait }) {
  const fit = contain ? 'object-contain p-8' : 'object-cover'
  const avatarFit = portrait || contain ? 'object-contain p-1' : 'object-cover'
  return (
    <article className="flex min-h-[100svh] flex-col justify-center px-4 py-10 md:px-8 lg:px-10">
      <div className="grid min-h-[72svh] bg-ratio-paper text-ratio-ink md:grid-cols-2">
        <div className="flex flex-col justify-between gap-10 px-5 py-8 md:px-9 md:py-10">
          <p className="font-display max-w-[16ch] text-[clamp(1.4rem,2.5vw,2.2rem)] leading-[1.28] italic">
            {quote}
          </p>
          <p className="flex items-center gap-3 font-brico text-[11px] tracking-[0.08em] uppercase">
            <span
              aria-hidden="true"
              className="size-9 shrink-0 overflow-hidden rounded-full bg-ratio-field"
            >
              {avatar ? (
                <img src={avatar} alt="" className={`size-full grayscale opacity-80 ${avatarFit}`} />
              ) : null}
            </span>
            <span>
              <span className="block">{quoteBy}</span>
              <span className="mt-0.5 block opacity-45">{quoteRole}</span>
            </span>
          </p>
        </div>
        <figure className="min-h-[38vh] md:min-h-0">
          {img ? <img src={img} alt="" className={`h-full w-full grayscale ${fit}`} /> : null}
        </figure>
      </div>
    </article>
  )
}

function specsOf(item) {
  return [
    [item.specLabel, item.specValue],
    [item.spec2Label, item.spec2Value],
    [item.spec3Label, item.spec3Value],
    [item.spec4Label, item.spec4Value],
  ]
}

/**
 * SplitStudy — sticky spec ledger on the left, framed cases on the right.
 * CHAPTERS sticky-history: left stays pinned and crossfades (P3); right
 * steps scroll. Layout and case order stay as they were.
 */
export default function SplitStudy({
  kicker = 'Print system',
  meta = 'Studio — 2026',
  index = '01',
  specLabel = 'format',
  specValue = 'A4 / A5',
  spec2Label = 'grid',
  spec2Value = '12 col',
  spec3Label = 'stock',
  spec3Value = 'cotton 600',
  spec4Label = 'finish',
  spec4Value = 'blind stamp',
  quote = 'The cube keeps the fold. Type sits on the floor until the ratio locks.',
  quoteBy = 'Press room',
  quoteRole = 'Shop floor',
  img,
  portrait,
  contain = false,
  cases,
  anchor = 'study',
}) {
  const root = useRef(null)
  const items =
    cases?.length > 0
      ? cases
      : [
          {
            kicker,
            meta,
            index,
            specLabel,
            specValue,
            spec2Label,
            spec2Value,
            spec3Label,
            spec3Value,
            spec4Label,
            spec4Value,
            quote,
            quoteBy,
            quoteRole,
            img,
            portrait,
            contain,
          },
        ]

  useGSAP(
    () => {
      if (items.length < 2) return undefined
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        const layers = gsap.utils.toArray('[data-study-meta]')
        const steps = gsap.utils.toArray('[data-study-step]')
        if (!layers.length || layers.length !== steps.length) return

        const activate = (index) => {
          layers.forEach((layer, i) => {
            const on = i === index
            gsap.to(layer, {
              opacity: on ? 1 : 0,
              duration: 0.7,
              ease: 'power2.out',
              overwrite: true,
            })
            layer.toggleAttribute('inert', !on)
            layer.setAttribute('aria-hidden', on ? 'false' : 'true')
          })
        }

        steps.forEach((step, i) => {
          ScrollTrigger.create({
            trigger: step,
            start: 'top 55%',
            end: 'bottom 55%',
            onEnter: () => activate(i),
            onEnterBack: () => activate(i),
          })
        })
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [items.length] },
  )

  return (
    <section ref={root} id={anchor} className="relative bg-ratio-paper text-ratio-ink">
      <div className="flex flex-col lg:flex-row">
        <aside className="lg:sticky lg:top-12 lg:h-[calc(100svh-3rem)] lg:w-[38%] lg:shrink-0">
          <div className="relative h-full">
            {items.map((item, i) => (
              <div
                key={`${item.index}-${item.kicker}`}
                data-study-meta
                aria-hidden={i !== 0}
                inert={i !== 0}
                className="absolute inset-0"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <StudyMeta
                  kicker={item.kicker}
                  meta={item.meta}
                  index={item.index}
                  specs={specsOf(item)}
                />
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1 bg-ratio-field text-ratio-paper">
          {items.map((item) => {
            const avatar = item.portrait || item.img
            return (
              <div key={`${item.index}-${item.kicker}-card`} data-study-step>
                <StudyCard
                  quote={item.quote}
                  quoteBy={item.quoteBy}
                  quoteRole={item.quoteRole}
                  img={item.img}
                  avatar={avatar}
                  contain={item.contain}
                  portrait={item.portrait}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
