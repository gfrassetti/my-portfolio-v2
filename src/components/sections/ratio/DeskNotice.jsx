/**
 * Mobile gate — this scrollytelling is desktop only. No rotate hint.
 */
export default function DeskNotice({
  brand = 'RATIO',
  line1 = 'This portfolio is desktop only.',
  line2 = '',
  line3 = '',
  ariaLabel = 'Desktop only',
}) {
  const lines = [line1, line2, line3].filter(Boolean)
  return (
    <div
      data-desk-notice
      role="region"
      aria-label={ariaLabel}
      className="fixed inset-0 z-[80] flex flex-col bg-ratio-paper text-ratio-ink lg:hidden"
    >
      <div className="flex flex-1 flex-col px-5 pt-8 sm:px-6">
        <p className="flex items-center gap-3 font-brico text-[clamp(2.4rem,12vw,3.5rem)] font-medium leading-none tracking-[-0.045em] uppercase">
          <span aria-hidden="true" className="size-[0.78em] shrink-0 bg-ratio-mark" />
          {brand}
        </p>
        <p className="mt-8 max-w-[28ch] text-[15px] leading-[1.35] tracking-[-0.012em]">
          {lines.map((line, i) => (
            <span key={line}>
              {i > 0 ? <br /> : null}
              {line}
            </span>
          ))}
        </p>
        <div className="mt-10 h-[min(22vh,11rem)] w-full bg-ratio-field" />
      </div>
    </div>
  )
}
