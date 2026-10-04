// ─────────────────────────────────────────────────────────────────────────────
// Silhouette figures for the short film: a parent and a child, drawn from a
// jointed rig so that posture tells the story (a slump, a hand on a shoulder,
// arms thrown up). The shapes have volume: tapered limbs with round joints, a
// shaped torso in clothes (the parent's long cardigan, the child's t-shirt and
// shorts), hands, shoes and hair. `rim` adds a soft edge of light, so a figure
// reads against a dark room.
//
// Angles are in degrees. Limbs are measured from hanging straight down,
// positive swinging forward (the way the figure faces); elbows bend forward
// (positive), knees bend back (negative). Torso and head lean forward when
// positive.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pose {
  torso: number
  head: number
  armNearU: number
  armNearL: number
  armFarU: number
  armFarL: number
  legNearU: number
  legNearL: number
  legFarU: number
  legFarL: number
}

export type Build = 'adult' | 'child'

const BODY = {
  adult: { r: 44, neck: 26, torso: 250, shoulder: 132, waist: 104, hip: 116, hem: 80, hemFlare: 1.18, armU: 150, armL: 140, arm: 40, legU: 205, legL: 205, leg: 54, hand: 22, foot: 36 },
  child: { r: 46, neck: 16, torso: 160, shoulder: 96, waist: 86, hip: 90, hem: 34, hemFlare: 1.1, armU: 98, armL: 92, arm: 30, legU: 122, legL: 118, leg: 38, hand: 16, foot: 27 },
}

const legsSeated = { legNearU: 88, legNearL: -88, legFarU: 84, legFarL: -86 }
export const STAND: Pose = { torso: 0, head: 0, armNearU: 4, armNearL: 8, armFarU: -4, armFarL: 8, legNearU: 2, legNearL: 0, legFarU: -2, legFarL: 0 }
export const SIT: Pose = { torso: 4, head: 6, armNearU: 30, armNearL: 60, armFarU: 26, armFarL: 64, ...legsSeated }
export const SLUMP: Pose = { torso: 50, head: 34, armNearU: 82, armNearL: 30, armFarU: 76, armFarL: 34, ...legsSeated }
export const CHIN: Pose = { torso: 14, head: 12, armNearU: 38, armNearL: 140, armFarU: 30, armFarL: 70, ...legsSeated }
export const WRITE: Pose = { torso: 16, head: 22, armNearU: 46, armNearL: 58, armFarU: 40, armFarL: 72, ...legsSeated }
export const LEAN_IN: Pose = { torso: 22, head: 8, armNearU: 52, armNearL: 46, armFarU: 46, armFarL: 52, ...legsSeated }
export const WORRY: Pose = { torso: 6, head: 10, armNearU: 30, armNearL: 150, armFarU: 18, armFarL: 60, ...legsSeated }
export const COMFORT: Pose = { torso: 10, head: 18, armNearU: 62, armNearL: 18, armFarU: -4, armFarL: 10, legNearU: 2, legNearL: 0, legFarU: -2, legFarL: 0 }
export const HOLD_UP: Pose = { torso: 0, head: 6, armNearU: 70, armNearL: 50, armFarU: 64, armFarL: 56, legNearU: 2, legNearL: 0, legFarU: -2, legFarL: 0 }
export const CHEER: Pose = { torso: -6, head: -14, armNearU: 160, armNearL: 10, armFarU: 150, armFarL: 16, legNearU: 4, legNearL: 0, legFarU: -6, legFarL: 0 }
/** Kneeling on one knee, arms open. */
export const KNEEL_OPEN: Pose = { torso: 8, head: -4, armNearU: 76, armNearL: 28, armFarU: 66, armFarL: 34, legNearU: 86, legNearL: -86, legFarU: 4, legFarL: -96 }
/** Kneeling, wrapped in a hug. */
export const KNEEL_HUG: Pose = { torso: 18, head: 26, armNearU: 62, armNearL: 88, armFarU: 56, armFarL: 94, legNearU: 86, legNearL: -86, legFarU: 4, legFarL: -96 }
/** Standing, arms around someone's neck. */
export const HUGGED: Pose = { torso: 12, head: 22, armNearU: 66, armNearL: 84, armFarU: 62, armFarL: 90, legNearU: 2, legNearL: 0, legFarU: -2, legFarL: 0 }

/** Walking, or running: the pose at phase `p` (in strides). */
export function gait(p: number, run = false): Pose {
  const s = Math.sin(p * Math.PI * 2)
  const c = Math.cos(p * Math.PI * 2)
  const a = run ? 40 : 22
  return {
    torso: run ? 12 : 3,
    head: run ? -2 : 2,
    armNearU: -s * a,
    armNearL: run ? 80 : 16 + Math.max(0, s) * 16,
    armFarU: s * a,
    armFarL: run ? 80 : 16 + Math.max(0, -s) * 16,
    legNearU: s * a,
    legNearL: -Math.max(0, -c) * (run ? 90 : 44) - 4,
    legFarU: -s * a,
    legFarL: -Math.max(0, c) * (run ? 90 : 44) - 4,
  }
}

export function mix(a: Pose, b: Pose, p: number): Pose {
  const out = {} as Pose
  for (const k of Object.keys(a) as (keyof Pose)[]) out[k] = a[k] + (b[k] - a[k]) * p
  return out
}

type P = [number, number]
const rad = (d: number) => (d * Math.PI) / 180
/** The point `len` along a limb at absolute angle `deg` (0 = straight down, 180 = up). */
const along = ([x, y]: P, deg: number, len: number): P => [x + Math.sin(rad(deg)) * len, y + Math.cos(rad(deg)) * len]
const f = (n: number) => n.toFixed(1)

/** A tapered segment from a (width wa) to b (width wb), with round ends. */
function segment(a: P, b: P, wa: number, wb: number): string {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const p = (q: P, w: number, s: number) => `${f(q[0] + nx * w * 0.5 * s)} ${f(q[1] + ny * w * 0.5 * s)}`
  const disc = (q: P, w: number) => `M${f(q[0] - w / 2)} ${f(q[1])} a${f(w / 2)} ${f(w / 2)} 0 1 0 ${f(w)} 0 a${f(w / 2)} ${f(w / 2)} 0 1 0 ${f(-w)} 0 Z`
  return `M${p(a, wa, 1)} L${p(b, wb, 1)} L${p(b, wb, -1)} L${p(a, wa, -1)} Z ${disc(a, wa)} ${disc(b, wb)}`
}

/**
 * A silhouette at hip position (x, y), facing right (`facing` 1) or left (−1).
 * Far limbs are a shade lighter, for depth.
 */
export function Figure({
  x,
  y,
  pose,
  build,
  facing = 1,
  scale = 1,
  colour = '#161B2A',
  far = '#262D42',
  sway = 0,
  rim,
}: {
  x: number
  y: number
  pose: Pose
  build: Build
  facing?: 1 | -1
  scale?: number
  colour?: string
  far?: string
  /** Ponytail swing, in degrees. */
  sway?: number
  /** Colour of a soft rim of light around the figure. */
  rim?: string
}) {
  const b = BODY[build]
  const up = (deg: number) => 180 - deg
  const hip: P = [0, 0]
  const shoulder = along(hip, up(pose.torso), b.torso)
  const armRoot = along(hip, up(pose.torso), b.torso - b.arm * 0.45)
  const neckTop = along(shoulder, up(pose.torso + pose.head * 0.5), b.neck)
  const headC = along(neckTop, up(pose.torso + pose.head), b.r * 0.85)

  const arm = (uDeg: number, lRel: number, fill: string) => {
    const elbow = along(armRoot, uDeg, b.armU)
    const wrist = along(elbow, uDeg + lRel, b.armL)
    const handC = along(wrist, uDeg + lRel, b.hand * 0.6)
    return (
      <g fill={fill}>
        <path d={segment(armRoot, elbow, b.arm * 1.08, b.arm * 0.86)} />
        <path d={segment(elbow, wrist, b.arm * 0.84, b.arm * 0.6)} />
        <ellipse cx={handC[0]} cy={handC[1]} rx={b.hand * 0.8} ry={b.hand} transform={`rotate(${-(uDeg + lRel)} ${handC[0]} ${handC[1]})`} />
      </g>
    )
  }
  const leg = (uDeg: number, lRel: number, fill: string) => {
    const knee = along(hip, uDeg, b.legU)
    const ankle = along(knee, uDeg + lRel, b.legL)
    return (
      <g fill={fill}>
        <path d={segment(hip, knee, b.leg * 1.12, b.leg * 0.86)} />
        <path d={segment(knee, ankle, b.leg * 0.84, b.leg * 0.56)} />
        {/* A shoe, pointing the way the figure faces. */}
        <path d={`M${f(ankle[0] - b.foot * 0.45)} ${f(ankle[1] - b.foot * 0.2)} Q${f(ankle[0] + b.foot * 0.3)} ${f(ankle[1] - b.foot * 0.55)} ${f(ankle[0] + b.foot * 1.25)} ${f(ankle[1] + b.foot * 0.12)} L${f(ankle[0] + b.foot * 1.2)} ${f(ankle[1] + b.foot * 0.42)} L${f(ankle[0] - b.foot * 0.5)} ${f(ankle[1] + b.foot * 0.42)} Z`} />
      </g>
    )
  }

  // The torso along its lean: shoulders, chest, waist, hips, and the hem below.
  const lean = rad(pose.torso)
  const ux = Math.sin(lean)
  const uy = -Math.cos(lean)
  const nx = Math.cos(lean)
  const ny = Math.sin(lean)
  const at = (h: number, w: number, side: number): string => `${f(ux * h + nx * w * 0.5 * side)} ${f(uy * h + ny * w * 0.5 * side)}`
  const T = b.torso
  const torso = `M${at(T, b.shoulder * 0.62, -1)}
    Q${at(T + 10, 0, 1)} ${at(T, b.shoulder * 0.62, 1)}
    Q${at(T - 8, b.shoulder, 1)} ${at(T * 0.78, b.shoulder * 0.96, 1)}
    Q${at(T * 0.55, b.waist, 1)} ${at(T * 0.42, b.waist, 1)}
    Q${at(T * 0.1, b.hip, 1)} ${at(0, b.hip, 1)}
    L${at(-b.hem, b.hip * b.hemFlare, 1)}
    Q${at(-b.hem - 8, 0, 1)} ${at(-b.hem, b.hip * b.hemFlare, -1)}
    L${at(0, b.hip, -1)}
    Q${at(T * 0.1, b.hip, -1)} ${at(T * 0.42, b.waist, -1)}
    Q${at(T * 0.55, b.waist, -1)} ${at(T * 0.78, b.shoulder * 0.96, -1)}
    Q${at(T - 8, b.shoulder, -1)} ${at(T, b.shoulder * 0.62, -1)} Z`

  // The head and hair, turned with the head's tilt.
  const r = b.r
  const tilt = rad(pose.torso + pose.head)
  const onHead = (dx: number, dy: number): P => [headC[0] + (dx * Math.cos(tilt) - dy * Math.sin(tilt)) * r, headC[1] + (dx * Math.sin(tilt) + dy * Math.cos(tilt)) * r]
  const pt = (q: P) => `${f(q[0])} ${f(q[1])}`
  const nose = onHead(0.98, 0.1)
  const chin = onHead(0.62, 0.78)
  const tieAt = onHead(-0.9, -0.3)
  const hair =
    build === 'child' ? (
      <g>
        {/* A ponytail with a hair tie, swinging. */}
        <path
          d={`M${pt(onHead(-0.8, -0.5))} Q${pt(onHead(-1.9, -0.4))} ${pt(onHead(-1.6 - sway / 40, 0.9))} Q${pt(onHead(-1.25, 0.5))} ${pt(onHead(-0.95, 0.1))} Z`}
          transform={`rotate(${sway} ${f(tieAt[0])} ${f(tieAt[1])})`}
        />
        <circle cx={onHead(-0.98, -0.35)[0]} cy={onHead(-0.98, -0.35)[1]} r={r * 0.2} />
        <path d={`M${pt(onHead(-1.04, 0.2))} Q${pt(onHead(-1.1, -1.1))} ${pt(onHead(0.2, -1.12))} Q${pt(onHead(0.9, -0.95))} ${pt(onHead(0.82, -0.35))} L${pt(onHead(0, -0.4))} Z`} />
      </g>
    ) : (
      <g>
        <circle cx={onHead(-0.86, -0.62)[0]} cy={onHead(-0.86, -0.62)[1]} r={r * 0.5} />
        <path d={`M${pt(onHead(-1.06, 0.45))} Q${pt(onHead(-1.2, -1.12))} ${pt(onHead(0.15, -1.14))} Q${pt(onHead(0.98, -1.0))} ${pt(onHead(0.9, -0.2))} L${pt(onHead(0, -0.3))} Z`} />
      </g>
    )

  return (
    <g transform={`translate(${x} ${y}) scale(${facing * scale} ${scale})`} style={rim ? { filter: `drop-shadow(0 0 3px ${rim}) drop-shadow(0 0 10px ${rim})` } : undefined}>
      {leg(pose.legFarU, pose.legFarL, far)}
      {arm(pose.armFarU, pose.armFarL, far)}
      <g fill={colour}>
        {leg(pose.legNearU, pose.legNearL, colour)}
        <path d={torso} />
        <path d={segment(shoulder, neckTop, b.arm * 0.9, b.arm * 0.8)} />
        <circle cx={headC[0]} cy={headC[1]} r={r} />
        <circle cx={nose[0]} cy={nose[1]} r={r * 0.18} />
        <circle cx={chin[0]} cy={chin[1]} r={r * 0.32} />
        {hair}
      </g>
      {arm(pose.armNearU, pose.armNearL, colour)}
    </g>
  )
}
