// ─────────────────────────────────────────────────────────────────────────────
// The PrepNest bird: a small, happy blue bird that sits in its nest and learns.
//
// One set of shapes, four poses, so the bird is always recognisably the same
// bird: `nest` for the logo and the homepage, `cheer` for results, `think` for
// the test, `read` for help and empty states. Hand-built vector art (see
// docs/superpowers/specs/2026-10-02-premium-ui-design.md); no hooks, so it
// renders on the server or in a client component alike.
// ─────────────────────────────────────────────────────────────────────────────

export type BirdPose = 'nest' | 'cheer' | 'think' | 'read'

const C = {
  body: '#2F8FEA',
  shade: '#1E6FC4',
  belly: '#CDE8FF',
  ink: '#1B2A41',
  beak: '#FFB020',
  beakLine: '#E08A00',
  cheek: '#FF9DB8',
  feet: '#F59E0B',
  sun: '#FFC530',
  nest: '#C98A4B',
  nestLine: '#A86D33',
}

/** Body, belly, crest, cheeks and beak — everything every pose shares. `y` moves the whole bird. */
function Body({ y = 0, happy = false, look = [0, 0] }: { y?: number; happy?: boolean; look?: [number, number] }) {
  const [lx, ly] = look
  return (
    <g transform={`translate(0 ${y})`}>
      <path d="M146 112 q24 0 30 16 q-16 4 -30 -4z" fill={C.shade} />
      <circle cx="100" cy="100" r="56" fill={C.body} />
      <path d="M44 106 a56 56 0 0 0 112 0 a56 46 0 0 1 -112 0z" fill={C.shade} opacity=".55" />
      <ellipse cx="100" cy="124" rx="34" ry="26" fill={C.belly} />
      <path d="M95 46 q-4 -20 9 -24 q-2 11 5 16 q4 -9 13 -9 q-6 9 -2 18z" fill={C.body} />
      <circle cx="80" cy="88" r="18" fill="#fff" />
      <circle cx="120" cy="88" r="18" fill="#fff" />
      {happy ? (
        <>
          <path d="M70 91 q10 -12 20 0" stroke={C.ink} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M110 91 q10 -12 20 0" stroke={C.ink} strokeWidth="6" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={83 + lx} cy={90 + ly} r="9" fill={C.ink} />
          <circle cx={117 + lx} cy={90 + ly} r="9" fill={C.ink} />
          <circle cx={86 + lx} cy={86 + ly} r="3.2" fill="#fff" />
          <circle cx={120 + lx} cy={86 + ly} r="3.2" fill="#fff" />
        </>
      )}
      <circle cx="64" cy="108" r="6.5" fill={C.cheek} />
      <circle cx="136" cy="108" r="6.5" fill={C.cheek} />
      {happy ? (
        <>
          <path d="M89 101 q11 -5 22 0 q-3 15 -11 17 q-8 -2 -11 -17z" fill={C.beak} />
          <path d="M91 106 q9 6 18 0" stroke={C.beakLine} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M89 102 q11 -5 22 0 q-4 13 -11 15 q-7 -2 -11 -15z" fill={C.beak} />
          <path d="M91 103 q9 5 18 0" stroke={C.beakLine} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
    </g>
  )
}

const Feet = ({ y = 0 }: { y?: number }) => (
  <g transform={`translate(0 ${y})`} stroke={C.feet} strokeWidth="5" strokeLinecap="round" fill="none">
    <path d="M86 154 l-6 10 M86 154 l0 11 M86 154 l6 10" />
    <path d="M114 154 l-6 10 M114 154 l0 11 M114 154 l6 10" />
  </g>
)

const Nest = () => (
  <g>
    <path d="M34 140 q66 30 132 0 q-6 34 -66 38 q-60 -4 -66 -38z" fill={C.nest} />
    <path d="M34 140 q66 30 132 0" stroke={C.nestLine} strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M48 156 q30 12 52 6 M70 168 q30 6 60 -6 M58 148 q20 8 40 6 M110 154 q24 -2 44 -10" stroke={C.nestLine} strokeWidth="3.5" fill="none" strokeLinecap="round" />
  </g>
)

const Pencil = () => (
  <g transform="rotate(-35 150 118)">
    <rect x="132" y="112" width="44" height="11" rx="2" fill={C.sun} />
    <rect x="128" y="112" width="7" height="11" rx="2" fill={C.cheek} />
    <path d="M176 112 l12 5.5 l-12 5.5z" fill="#F5D6A0" />
    <path d="M184 115.5 l4 2 l-4 2z" fill={C.ink} />
  </g>
)

const Spark = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 -10 q2 8 10 10 q-8 2 -10 10 q-2 -8 -10 -10 q8 -2 10 -10z"
    fill={C.sun}
  />
)

function Pose({ pose }: { pose: BirdPose }) {
  switch (pose) {
    case 'nest':
      return (
        <>
          <Body />
          <Pencil />
          <ellipse cx="148" cy="122" rx="11" ry="15" transform="rotate(40 148 122)" fill={C.shade} />
          <Nest />
        </>
      )
    case 'cheer':
      return (
        <>
          <Feet y={8} />
          <Body y={8} happy />
          <ellipse cx="40" cy="78" rx="12" ry="22" transform="rotate(-35 40 78)" fill={C.shade} />
          <ellipse cx="160" cy="78" rx="12" ry="22" transform="rotate(35 160 78)" fill={C.shade} />
          <Spark x={28} y={34} />
          <Spark x={172} y={30} s={0.8} />
          <Spark x={168} y={168} s={0.6} />
        </>
      )
    case 'think':
      return (
        <>
          <Feet y={8} />
          <Body y={8} look={[4, -5]} />
          <ellipse cx="146" cy="136" rx="11" ry="16" transform="rotate(30 146 136)" fill={C.shade} />
          <ellipse cx="66" cy="132" rx="11" ry="17" transform="rotate(-55 66 132)" fill={C.shade} />
          <circle cx="158" cy="44" r="5" fill={C.belly} />
          <circle cx="170" cy="30" r="7" fill={C.belly} />
          <circle cx="184" cy="12" r="9" fill={C.belly} />
        </>
      )
    case 'read':
      return (
        <>
          <Feet y={10} />
          <Body y={4} look={[0, 5]} />
          <path d="M58 136 q21 -8 42 2 l0 30 q-21 -10 -42 -2z" fill="#fff" stroke={C.shade} strokeWidth="3" strokeLinejoin="round" />
          <path d="M142 136 q-21 -8 -42 2 l0 30 q21 -10 42 -2z" fill="#fff" stroke={C.shade} strokeWidth="3" strokeLinejoin="round" />
          <path d="M66 146 q12 -4 26 1 M66 154 q12 -4 26 1 M108 147 q12 -5 26 -1 M108 155 q12 -5 26 -1" stroke="#9CC9F5" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <ellipse cx="52" cy="144" rx="11" ry="15" transform="rotate(-30 52 144)" fill={C.shade} />
          <ellipse cx="148" cy="144" rx="11" ry="15" transform="rotate(30 148 144)" fill={C.shade} />
        </>
      )
  }
}

/**
 * The bird, in one of its poses. Sized by `className` (it fills its box).
 * Decorative unless given a `title`.
 */
export default function Bird({ pose = 'nest', className, title }: { pose?: BirdPose; className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <Pose pose={pose} />
    </svg>
  )
}

/**
 * The small mark: the bird's head over the rim of its nest. Reads at 16–40 px,
 * where the full bird's pencil and feathers would blur. Used by the logo, the
 * favicon and the app icon.
 */
export function BirdMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path d="M55 14 q-3 -13 6 -15 q-1 7 3 10 q3 -6 9 -6 q-4 6 -1 12z" fill={C.body} />
      <circle cx="60" cy="56" r="40" fill={C.body} />
      <circle cx="46" cy="50" r="13" fill="#fff" />
      <circle cx="74" cy="50" r="13" fill="#fff" />
      <circle cx="48.5" cy="52" r="6.5" fill={C.ink} />
      <circle cx="71.5" cy="52" r="6.5" fill={C.ink} />
      <circle cx="50.5" cy="49" r="2.3" fill="#fff" />
      <circle cx="73.5" cy="49" r="2.3" fill="#fff" />
      <path d="M52 60 q8 -4 16 0 q-3 10 -8 11 q-5 -1 -8 -11z" fill={C.beak} />
      <path d="M12 76 q48 26 96 0 q-4 30 -48 34 q-44 -4 -48 -34z" fill={C.nest} />
      <path d="M12 76 q48 26 96 0" stroke={C.nestLine} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M26 92 q20 9 34 4 M62 98 q20 2 34 -8" stroke={C.nestLine} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
