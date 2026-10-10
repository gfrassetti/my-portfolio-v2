/**
 * Motion policy.
 *
 * The scroll choreography is the content of this site (hero, plates, works,
 * notes, footer), so it always runs — even when the OS asks for reduced
 * motion (e.g. Samsung "Remove animations"). Honouring it left phones with a
 * static hero, or no hero at all. It is driven by the visitor's own scroll.
 *
 * Purely decorative autoplay (cursor inertia, the rupture parade) still opts
 * out when the setting is on.
 */
export function reduceScrollMotion() {
  return false
}

export function reduceDecorativeMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
