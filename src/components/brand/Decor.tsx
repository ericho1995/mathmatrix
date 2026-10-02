// ─────────────────────────────────────────────────────────────────────────────
// Decorations: the stickers, stars and clouds that make a page feel like
// PrepNest rather than a form. Flat shapes with a thick outline, after
// Duolingo's illustrations; hand-built SVG, decorative only (aria-hidden).
// ─────────────────────────────────────────────────────────────────────────────

type Deco = { className?: string }

const INK = '#1B2A41'

/** A rounded five-point star. */
export function Star({ className, fill = '#FFC530' }: Deco & { fill?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        d="M24 4 l5.6 11.4 12.6 1.8 -9.1 8.9 2.1 12.5 L24 32.7 12.8 38.6 l2.1 -12.5 -9.1 -8.9 12.6 -1.8z"
        fill={fill}
        stroke="#E0A400"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** A four-point twinkle. */
export function Sparkle({ className, fill = '#FFC530' }: Deco & { fill?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M20 2 q3 15 18 18 q-15 3 -18 18 q-3 -15 -18 -18 q15 -3 18 -18z" fill={fill} />
    </svg>
  )
}

/** A soft white cloud. */
export function Cloud({ className, fill = '#FFFFFF' }: Deco & { fill?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} aria-hidden>
      <path d="M22 54 a18 18 0 0 1 2 -36 a24 24 0 0 1 44 -6 a20 20 0 0 1 32 14 a16 16 0 0 1 -2 28z" fill={fill} />
    </svg>
  )
}

/** A yellow pencil, tilted. */
export function PencilSticker({ className }: Deco) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <g transform="rotate(-40 40 40)">
        <rect x="10" y="31" width="46" height="18" rx="3" fill="#FFC530" stroke={INK} strokeWidth="3" />
        <path d="M24 31 v18 M40 31 v18" stroke="#E0A400" strokeWidth="2.5" />
        <rect x="4" y="31" width="10" height="18" rx="3" fill="#FF9DB8" stroke={INK} strokeWidth="3" />
        <path d="M56 31 l18 9 -18 9z" fill="#F5D6A0" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M68 37 l6 3 -6 3z" fill={INK} />
      </g>
    </svg>
  )
}

/** A wooden ABC block. */
export function BlockSticker({ className, letter = 'A', fill = '#FF9600' }: Deco & { letter?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect x="6" y="6" width="52" height="52" rx="10" fill={fill} stroke={INK} strokeWidth="3" />
      <rect x="13" y="13" width="38" height="38" rx="6" fill="#fff" opacity=".9" />
      <text x="32" y="44" textAnchor="middle" fontSize="30" fontWeight="900" fontFamily="Nunito, sans-serif" fill={fill}>
        {letter}
      </text>
    </svg>
  )
}

/** An open book. */
export function BookSticker({ className }: Deco) {
  return (
    <svg viewBox="0 0 80 60" className={className} aria-hidden>
      <path d="M6 10 q17 -8 34 2 v42 q-17 -10 -34 -2z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M74 10 q-17 -8 -34 2 v42 q17 -10 34 -2z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M12 20 q12 -4 22 1 M12 28 q12 -4 22 1 M46 21 q12 -5 22 -1 M46 29 q12 -5 22 -1" stroke="#2F8FEA" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  )
}

/** A gold medal. */
export function MedalSticker({ className }: Deco) {
  return (
    <svg viewBox="0 0 64 80" className={className} aria-hidden>
      <path d="M18 4 h12 l6 26 h-12z" fill="#2F8FEA" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M46 4 h-12 l-6 26 h12z" fill="#CE82FF" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="32" cy="52" r="22" fill="#FFC530" stroke={INK} strokeWidth="3" />
      <circle cx="32" cy="52" r="14" fill="none" stroke="#E0A400" strokeWidth="3" />
      <path d="M32 43 l3 6 6.5 1 -4.7 4.6 1.1 6.4 -5.9 -3.1 -5.9 3.1 1.1 -6.4 -4.7 -4.6 6.5 -1z" fill="#fff" />
    </svg>
  )
}

/** A check-mark badge, as on a marked answer. */
export function CheckSticker({ className }: Deco) {
  return (
    <svg viewBox="0 0 56 56" className={className} aria-hidden>
      <circle cx="28" cy="28" r="24" fill="#58CC02" stroke={INK} strokeWidth="3" />
      <path d="M17 29 l7 7 15 -16" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

/**
 * A wavy edge between two bands of colour. Sits at the bottom of a section;
 * `fill` is the colour of the section below it.
 */
export function Wave({ fill = '#FFFFFF', className }: Deco & { fill?: string }) {
  return (
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className={`block w-full h-10 sm:h-16 ${className ?? ''}`} aria-hidden>
      <path d="M0 48 C 240 8 480 8 720 40 S 1200 80 1440 32 V80 H0z" fill={fill} />
    </svg>
  )
}
