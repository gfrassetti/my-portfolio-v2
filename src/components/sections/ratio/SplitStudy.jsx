import { useRef } from 'react'
import { gsap, useGSAP, ScrollTrigger } from '../../../lib/gsap'
import { getLenis } from '../../../hooks/useLenis'

function SiteLink({ href, label }) {
  if (!href) return null
  return (
    <a href={href} target="_blank" rel="noreferrer" className="ratio-more group/more">
      <span>{label}</span>
      <span className="ratio-more-arrow" aria-hidden="true">
        <span>→</span>
        <span>→</span>
      </span>
      <span className="ratio-more-line" aria-hidden="true" />
    </a>
  )
}

function goToCase(i) {
  const el = document.querySelector(`[data-study-step="${i}"]`)
  if (!el) return
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(el, { offset: -48, duration: 1.2 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

/** Kin-style index: every case listed, the live one marked, the rest dimmed. */
function CaseIndex({ names, active, label }) {
  return (
    <div className="flex gap-5 font-brico text-[13px] leading-[1.35] min-[640px]:text-[14px]">
      <span className="shrink-0 tabular-nums text-ratio-ink">
        [{String(names.length).padStart(2, '0')}] {label}:
      </span>
      <ol className="ratio-case-index">
        {names.map((name, i) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => goToCase(i)}
              data-active={i === active ? 'true' : undefined}
              className="ratio-case-item"
            >
              {name}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function StudyMeta({ kicker, meta, index, total, specs, url, linkLabel, label, names = [] }) {
  const n = Number(index) || 1
  return (
    <div className="flex h-full flex-col bg-ratio-paper px-5 py-7 text-ratio-ink min-[640px]:border-r min-[640px]:border-ratio-ink min-[640px]:px-8 min-[640px]:py-9 lg:px-10">
      <div className="flex items-center justify-between gap-4 font-brico text-[11px] tracking-[0.14em] uppercase text-ratio-ink/60">
        <span>
          {label} ({String(total).padStart(2, '0')})
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-end gap-[3px]" aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <i
                key={i}
                className={`block w-[3px] ${
                  i + 1 === n ? 'h-4 bg-ratio-mark' : i + 1 < n ? 'h-3 bg-ratio-ink' : 'h-3 bg-ratio-ink/25'
                }`}
              />
            ))}
          </span>
          <span className="tabular-nums text-ratio-ink">
            {index} / {String(total).padStart(2, '0')}
          </span>
        </span>
      </div>

      <div className="mt-8 border-t border-ratio-ink pt-6 min-[640px]:mt-10">
        <p className="font-brico text-[13px] tracking-[0.1em] uppercase text-ratio-ink/55">{meta}</p>
        <h3 className="mt-3 font-display text-[clamp(2.1rem,4.2vw,3.6rem)] leading-[0.95] font-medium tracking-[-0.035em]">
          <span className="mr-3 inline-block size-[0.18em] -translate-y-[0.32em] bg-ratio-mark" aria-hidden="true" />
          {kicker}
        </h3>
      </div>

      <dl className="mt-8 text-ratio-ink min-[640px]:mt-10">
        {specs.map(([label, value], i) => (
          <div
            key={`${label}-${i}`}
            className="ratio-spec flex items-baseline justify-between gap-6 border-t border-ratio-ink/80 py-3.5 font-brico text-[15px] tracking-[0.01em] last:border-b min-[640px]:text-[16px]"
          >
            <dt className="text-[12px] tracking-[0.12em] uppercase text-ratio-ink/50">{label}</dt>
            <dd className="text-right">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-8 gap-y-8 pt-10">
        <div className="w-full max-w-[15rem]">
          <SiteLink href={url} label={linkLabel} />
        </div>
        {names.length > 1 ? <CaseIndex names={names} active={n - 1} label={label} /> : null}
      </div>
    </div>
  )
}

const TINT =
  'grayscale transition-[filter,opacity] duration-700 ease-[var(--ease-out)] group-hover:grayscale-0 group-focus-within:grayscale-0'

function StudyCard({ quote, quoteBy, quoteRole, img, logo, logoFill, contain, focus }) {
  const fit = contain ? 'object-contain p-6 min-[480px]:p-8' : 'object-cover'
  return (
    <article className="flex min-h-[100svh] flex-col justify-center px-3 py-8 min-[480px]:px-4 min-[480px]:py-10 md:px-8 lg:px-10">
      <div className="group relative grid min-h-[min(72svh,40rem)] bg-ratio-paper text-ratio-ink min-[480px]:min-h-[72svh] md:grid-cols-2">
        <div className="flex flex-col justify-between gap-8 px-4 py-6 min-[480px]:gap-10 min-[480px]:px-5 min-[480px]:py-8 md:px-9 md:py-10">
          <p className="font-display max-w-[16ch] text-[clamp(1.2rem,5.2vw,2.2rem)] leading-[1.28] italic">
            {quote}
          </p>
          <p className="flex items-center gap-3 font-brico text-[11px] tracking-[0.08em] uppercase">
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#0b0908] ring-1 ring-ratio-ink/20"
            >
              {logo ? (
                <img
                  src={logo}
                  alt=""
                  className={`${logoFill ? 'size-full object-cover' : 'max-h-[58%] max-w-[70%] object-contain'} opacity-85 group-hover:opacity-100 ${TINT}`}
                />
              ) : null}
            </span>
            <span>
              <span className="block">{quoteBy}</span>
              <span className="mt-0.5 block opacity-45">{quoteRole}</span>
            </span>
          </p>
        </div>
        <figure className="min-h-[42vw] overflow-hidden min-[480px]:min-h-[38vh] md:min-h-0">
          {img ? (
            <img
              src={img}
              alt=""
              className={`h-full w-full ${fit} ${TINT}`}
              style={focus ? { objectPosition: focus } : undefined}
            />
          ) : null}
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
  logo,
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
            logo,
            contain,
          },
        ]

  useGSAP(
    () => {
      if (items.length < 2) return undefined
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

      const mm = gsap.matchMedia()
      mm.add('(min-width: 640px)', () => {
        const layers = gsap.utils.toArray('[data-study-meta]')
        const steps = gsap.utils.toArray('[data-study-step]')
        if (!layers.length || layers.length !== steps.length) return

        const activate = (index) => {
          layers.forEach((layer, i) => {
            const on = i === index
            gsap.to(layer, {
              opacity: on ? 1 : 0,
              duration: 0.55,
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
      <div className="flex flex-col min-[640px]:flex-row">
        <aside className="hidden min-[640px]:sticky min-[640px]:top-12 min-[640px]:flex min-[640px]:h-[calc(100svh-3rem)] min-[640px]:w-[38%] min-[640px]:shrink-0">
          <div className="relative h-full w-full">
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
                  total={items.length}
                  specs={specsOf(item)}
                  url={item.url}
                  linkLabel={item.linkLabel}
                  label={item.listLabel}
                  names={items.map((c) => c.kicker)}
                />
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1 bg-ratio-field text-ratio-paper">
          {items.map((item, i) => {
            return (
              <div key={`${item.index}-${item.kicker}-card`} data-study-step={i}>
                <div className="min-[640px]:hidden">
                  <StudyMeta
                    kicker={item.kicker}
                    meta={item.meta}
                    index={item.index}
                    total={items.length}
                    specs={specsOf(item)}
                    url={item.url}
                    linkLabel={item.linkLabel}
                    label={item.listLabel}
                    names={items.map((c) => c.kicker)}
                  />
                </div>
                <StudyCard
                  quote={item.quote}
                  quoteBy={item.quoteBy}
                  quoteRole={item.quoteRole}
                  img={item.img}
                  logo={item.logo}
                  logoFill={item.logoFill}
                  contain={item.contain}
                  focus={item.focus}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
