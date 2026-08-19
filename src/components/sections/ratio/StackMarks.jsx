import reactLogo from './assets/stack/react.svg'
import nextLogo from './assets/stack/next.svg'
import wordpressLogo from './assets/stack/wordpress.svg'
import nodeLogo from './assets/stack/node.svg'

const BW_WHITE = 'grayscale(1) brightness(0) invert(1)'
const BW_BLACK = 'grayscale(1) brightness(0)'

/**
 * Official brand marks, forced to ink via CSS filter.
 * `invert` = white glyph on a dark plate.
 */
export function StackLogo({ src, invert = false }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="h-full w-full object-contain"
      style={{ filter: invert ? BW_WHITE : BW_BLACK }}
    />
  )
}

export const STACK_LOGOS = [reactLogo, nextLogo, wordpressLogo, nodeLogo]
