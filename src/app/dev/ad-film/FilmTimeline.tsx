'use client'

import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import Bird, { BirdMark } from '@/components/brand/Bird'
import QuestionView from '@/components/diagnostic/QuestionView'
import type { ScreenQuestion } from '@/lib/web/questionHtml'
import {
  CHEER,
  CHIN,
  COMFORT,
  Figure,
  HOLD_UP,
  HUGGED,
  KNEEL_HUG,
  KNEEL_OPEN,
  LEAN_IN,
  SIT,
  SLUMP,
  STAND,
  WORRY,
  WRITE,
  gait,
  mix,
  type Pose,
} from './Figure'

// ─────────────────────────────────────────────────────────────────────────────
// "Gold star": a wordless short film, 1080×1920, 56 seconds. A child
// struggling at school, a worried parent who finds PrepNest late one night,
// the weeks of practice together, and the day the test comes home with an A+.
// No narration and no captions: silhouettes, light and an original score
// (marketing/instagram/film/score.py) tell it. The only words are on the
// papers and the real PrepNest site on the laptop.
//
// Nothing animates by itself, so marketing/instagram/render-ad.mjs can step
// through it (window.__setAdTime); ?play runs it in real time.
// ─────────────────────────────────────────────────────────────────────────────

export const FILM_LENGTH = 56
const SCENES: [number, number][] = [
  [0, 6.6], // night, outside
  [6, 19.6], // the bedroom
  [19, 29.6], // the kitchen, late
  [29, 38.6], // weeks of practice
  [38, 45.6], // the classroom
  [45, 52.6], // home
  [52, 56], // the end card
]
const XF = 0.6

const clamp = (x: number) => Math.max(0, Math.min(1, x))
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3)
const lerp = (a: number, b: number, p: number) => a + (b - a) * p
const rnd = (n: number) => {
  const s = Math.sin(n * 12.9898) * 43758.5453
  return s - Math.floor(s)
}
const SIL = '#141826'
const SIL_FAR = '#232A3E'
const PARENT = '#262E45'
const PARENT_FAR = '#343D58'
const RED = '#D9483B'

/** Poses in sequence: [time, pose] keyframes, eased between. */
function track(u: number, keys: [number, Pose][]): Pose {
  if (u <= keys[0][0]) return keys[0][1]
  for (let k = 1; k < keys.length; k++) {
    if (u <= keys[k][0]) return mix(keys[k - 1][1], keys[k][1], ease(prog(u, keys[k - 1][0], keys[k][0])))
  }
  return keys[keys.length - 1][1]
}

export interface FilmData {
  hand: string
  home: string
  practicePage: string
  question: ScreenQuestion
}

export default function FilmTimeline(d: FilmData) {
  const [t, setT] = useState(0)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    ;(window as unknown as { __setAdTime: (x: number) => void }).__setAdTime = (x: number) => flushSync(() => setT(x))
    if (new URLSearchParams(location.search).has('play')) {
      const t0 = performance.now()
      let raf = 0
      const tick = () => {
        setT(((performance.now() - t0) / 1000) % FILM_LENGTH)
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }
  }, [])
  if (!mounted) return null

  const render = [night, bedroom, kitchen, together, classroom, home, endCard]
  return (
    <div className="fixed left-0 top-0 z-[100] overflow-hidden bg-black" style={{ width: 1080, height: 1920 }}>
      {SCENES.map(([a, b], s) =>
        t >= a && t < b ? (
          <div key={s} className="absolute inset-0" style={{ opacity: s === 0 ? 1 : ease(prog(t, a, a + XF)) }}>
            {render[s](t - a)}
          </div>
        ) : null
      )}
      {/* Film grain and a soft vignette over everything. */}
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40" style={{ backgroundImage: GRAIN }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 48%, transparent 55%, rgba(0,0,0,0.38) 100%)' }} />
      <div className="absolute inset-0 pointer-events-none bg-black" style={{ opacity: Math.max(1 - prog(t, 0, 1.2), prog(t, FILM_LENGTH - 0.9, FILM_LENGTH)) }} />
    </div>
  )

  // ── 1. Night. One lit window. ───────────────────────────────────────────
  function night(u: number) {
    const push = ease(prog(u, 0, 6.6))
    return (
      <Camera scale={lerp(1, 2.3, push)} ox={470} oy={1300}>
        <svg viewBox="0 0 1080 1920" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="n-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0B1229" />
              <stop offset="1" stopColor="#2E3D6E" />
            </linearGradient>
            <radialGradient id="n-moon">
              <stop offset="0" stopColor="#FFF4D6" stopOpacity="0.55" />
              <stop offset="1" stopColor="#FFF4D6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="n-win">
              <stop offset="0" stopColor="#FFC66B" stopOpacity="0.6" />
              <stop offset="1" stopColor="#FFC66B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1080" height="1920" fill="url(#n-sky)" />
          <Stars n={70} t={t} h={1100} />
          <circle cx={820} cy={380} r={230} fill="url(#n-moon)" />
          <circle cx={820} cy={380} r={78} fill="#F6EBCB" />
          <path d="M0 1240 Q260 1120 520 1200 T1080 1160 V1920 H0 Z" fill="#1A2343" />
          <path d="M0 1520 Q300 1440 560 1500 T1080 1460 V1920 H0 Z" fill="#111733" />
          {/* The house, with the child's window lit. */}
          <g>
            <path d="M260 1260 L540 1060 L820 1260 Z" fill="#0E1326" />
            <rect x={700} y={1080} width={50} height={110} fill="#0E1326" />
            <rect x={290} y={1250} width={500} height={330} fill="#0E1326" />
            <circle cx={470} cy={1305} r={200} fill="url(#n-win)" />
            <rect x={405} y={1265} width={130} height={90} rx={6} fill="#FFC66B" />
            <path d="M470 1265 V1355 M405 1310 H535" stroke="#0E1326" strokeWidth={8} />
            <rect x={600} y={1300} width={110} height={80} rx={6} fill="#1C2440" />
            <rect x={420} y={1440} width={90} height={140} rx={4} fill="#1C2440" />
          </g>
          <Tree x={150} y={1500} s={1.2} />
          <Tree x={930} y={1470} s={1} />
        </svg>
      </Camera>
    )
  }

  // ── 2. The bedroom: the test, the slump, a parent at the door. ─────────────
  function bedroom(u: number) {
    // Child at the desk.
    const child = track(u, [
      [0, CHIN],
      [2.6, CHIN],
      [3.4, { ...SIT, torso: 8, head: 16, armNearU: 64, armNearL: 70, armFarU: 58, armFarL: 74 }],
      [4.6, { ...SIT, torso: 8, head: 16, armNearU: 64, armNearL: 70, armFarU: 58, armFarL: 74 }],
      [5.2, { ...SIT, torso: 6, head: 10, armNearU: 52, armNearL: 40, armFarU: 46, armFarL: 46 }],
      [6.0, SLUMP],
    ])
    const paperUp = prog(u, 2.8, 3.4) * (1 - prog(u, 4.7, 5.2))
    const crumple = prog(u, 4.6, 5.3)
    const doorOpen = ease(prog(u, 7, 8.2))
    const walk = prog(u, 8.6, 11)
    const parentX = lerp(205, 420, ease(walk))
    const parent = u < 8.6 ? STAND : u < 11 ? gait((u - 8.6) * 0.9) : track(u, [[11, STAND], [11.6, COMFORT], [12.4, COMFORT], [13.0, { ...COMFORT, torso: 34, head: 26, armNearU: 30, armNearL: 10, armFarU: 20 }], [13.6, HOLD_UP]])
    const ballX = lerp(820, 760, crumple)
    const ballY = lerp(1196, 1210, crumple)
    const pickup = prog(u, 12.6, 13.4)
    return (
      <Camera scale={lerp(1.08, 1.16, prog(u, 0, 13.6))} ox={560} oy={1150}>
        <svg viewBox="0 0 1080 1920" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="b-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1C2445" />
              <stop offset="1" stopColor="#2A355E" />
            </linearGradient>
            <radialGradient id="b-lamp" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#FFD28A" stopOpacity="0.75" />
              <stop offset="0.6" stopColor="#FFB85C" stopOpacity="0.18" />
              <stop offset="1" stopColor="#FFB85C" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="b-door" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#FFE4AE" stopOpacity="0.95" />
              <stop offset="1" stopColor="#FFD08A" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="1080" height="1920" fill="url(#b-wall)" />
          {/* Window: the night outside. */}
          <rect x={690} y={470} width={300} height={360} rx={10} fill="#101731" />
          <Stars n={14} t={t} x0={700} y0={480} w={280} h={340} />
          <circle cx={905} cy={560} r={34} fill="#F6EBCB" />
          <path d="M840 470 V830 M690 650 H990" stroke="#0B1022" strokeWidth={12} />
          <rect x={690} y={470} width={300} height={360} rx={10} fill="none" stroke="#0B1022" strokeWidth={14} />
          {/* The door, opening on a lit hallway. */}
          <rect x={90} y={760} width={230} height={760} fill="#0B1022" />
          <rect x={100} y={770} width={210} height={750} fill="#FFE4AE" opacity={doorOpen} />
          <path d={`M100 1520 L310 1520 L${310 + 420 * doorOpen} 1920 L${100 - 40 * doorOpen} 1920 Z`} fill="url(#b-door)" opacity={doorOpen * 0.8} />
          <rect x={100} y={770} width={210 * (1 - doorOpen * 0.82)} height={750} fill="#141B33" />
          {/* Floor. */}
          <rect x={0} y={1520} width={1080} height={400} fill="#151B33" />
          {/* The lamp's warm pool. */}
          <circle cx={820} cy={1160} r={420} fill="url(#b-lamp)" />
          {/* Desk and chair. */}
          <rect x={640} y={1220} width={420} height={22} rx={6} fill="#0E1326" />
          <rect x={660} y={1240} width={20} height={280} fill="#0E1326" />
          <rect x={1010} y={1240} width={20} height={280} fill="#0E1326" />
          <path d="M880 1220 L900 1040 L960 1000" fill="none" stroke="#0E1326" strokeWidth={10} strokeLinecap="round" />
          <path d="M930 980 L1010 1010 L990 1050 Z" fill="#0E1326" />
          <rect x={470} y={1320} width={140} height={16} rx={6} fill="#0E1326" />
          <rect x={470} y={1170} width={16} height={160} rx={6} fill="#0E1326" />
          <rect x={480} y={1330} width={14} height={190} fill="#0E1326" />
          <rect x={590} y={1330} width={14} height={190} fill="#0E1326" />
          {/* The test: on the desk, then held up, then crumpled. */}
          {crumple < 0.3 && paperUp <= 0 && <Sheet x={760} y={1196} w={120} skew grade="D" hand={d.hand} />}
          {crumple >= 0.3 && pickup <= 0 && <circle cx={ballX} cy={ballY} r={22} fill="#EDE6D6" stroke="#B9AE97" strokeWidth={3} />}
          <Figure x={540} y={1318} pose={child} build="child" sway={Math.sin(t * 1.6) * 4} colour={SIL} far={SIL_FAR} rim="rgba(255,184,102,0.55)" />
          {paperUp > 0 && <Sheet x={lerp(760, 716, paperUp)} y={lerp(1196, 1178, paperUp)} w={lerp(120, 170, paperUp)} grade="D" hand={d.hand} tilt={-8} />}
          {u > 7.4 && (
            <g opacity={prog(u, 7.4, 8)}>
              <Figure x={parentX} y={1095} pose={parent} build="adult" colour={PARENT} far={PARENT_FAR} rim="rgba(255,217,160,0.5)" />
            </g>
          )}
          {pickup > 0 && <Sheet x={lerp(470, 520, pickup)} y={lerp(1180, 860, pickup)} w={lerp(60, 190, pickup)} grade="D" hand={d.hand} tilt={6} creased />}
        </svg>
      </Camera>
    )
  }

  // ── 3. The kitchen, late: a parent searching, then finding PrepNest. ──────
  function kitchen(u: number) {
    const found = prog(u, 5, 5.6)
    const zoom = ease(prog(u, 5.4, 8.4)) * (1 - ease(prog(u, 8.6, 10)))
    const parent = track(u, [
      [0, WORRY],
      [2.4, WORRY],
      [3.2, LEAN_IN],
      [8.8, LEAN_IN],
      [9.8, { ...SIT, torso: -2, head: -6, armNearU: 40, armNearL: 110, armFarU: 20, armFarL: 60 }],
    ])
    const scroll = (u - 3) * 140
    return (
      <Camera scale={lerp(1.04, 2.6, zoom)} ox={780} oy={1040}>
        <svg viewBox="0 0 1080 1920" className="absolute inset-0 w-full h-full">
          <defs>
            <radialGradient id="k-screen" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={found ? '#7FC0FF' : '#C9D6F5'} stopOpacity={0.55} />
              <stop offset="1" stopColor="#7FC0FF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1080" height="1920" fill="#141A2C" />
          <rect x={120} y={560} width={220} height={300} rx={8} fill="#0D1224" stroke="#0A0E1C" strokeWidth={12} />
          <Stars n={6} t={t} x0={130} y0={570} w={200} h={280} />
          <Clock x={720} y={560} r={70} />
          <circle cx={780} cy={1040} r={520} fill="url(#k-screen)" />
          <rect x={60} y={1250} width={1000} height={26} rx={8} fill="#0B0F1E" />
          <rect x={100} y={1270} width={20} height={300} fill="#0B0F1E" />
          <rect x={1000} y={1270} width={20} height={300} fill="#0B0F1E" />
          <rect x={150} y={1330} width={150} height={16} rx={6} fill="#0B0F1E" />
          <rect x={150} y={1170} width={16} height={170} rx={6} fill="#0B0F1E" />
          {/* The mug, steaming. */}
          <rect x={470} y={1190} width={60} height={62} rx={10} fill="#0B0F1E" />
          {[0, 1].map(k => (
            <path key={k} d={`M${490 + k * 18} 1180 c ${10 * Math.sin(t * 2 + k)} -20 ${-10 * Math.sin(t * 2 + k)} -40 0 -60`} stroke="rgba(220,230,255,0.35)" strokeWidth={5} fill="none" strokeLinecap="round" />
          ))}
          <Figure x={300} y={1328} pose={parent} build="adult" colour={PARENT} far={PARENT_FAR} rim={found ? 'rgba(127,192,255,0.75)' : 'rgba(190,205,240,0.45)'} />
          {/* The laptop: its base, and the lid facing us. */}
          <path d="M590 1250 L980 1250 L1000 1262 L570 1262 Z" fill="#0B0F1E" />
        </svg>
        <div className="absolute overflow-hidden rounded-[10px]" style={{ left: 600, top: 930, width: 360, height: 225, border: '10px solid #0B0F1E', background: '#fff', boxShadow: `0 0 ${60 + 60 * found}px rgba(127,192,255,${0.35 + 0.3 * found})` }}>
          {found < 1 && (
            <div className="absolute inset-0 bg-white" style={{ opacity: 1 - found, transform: `translateY(${-scroll}px)` }}>
              {Array.from({ length: 40 }, (_, k) => (
                <div key={k} className="mx-3 mt-3 rounded" style={{ height: k % 4 === 0 ? 10 : 6, width: `${40 + rnd(k) * 50}%`, background: k % 4 === 0 ? '#9DB4E8' : '#D5D9E2' }} />
              ))}
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={d.home} alt="" className="absolute inset-0 w-full h-full object-cover object-left-top" style={{ opacity: found }} />
        </div>
      </Camera>
    )
  }

  // ── 4. The weeks after: the free test, practice, the child sitting taller. ─
  function together(u: number) {
    const onPaper = prog(u, 3, 3.6)
    const days = prog(u, 3.4, 7.4)
    const sunA = (days * 2.2) % 1
    const daylight = 0.5 + 0.5 * Math.cos(sunA * Math.PI * 2 - Math.PI)
    const upright = ease(prog(u, 3.5, 7.2))
    const pencil = Math.sin(t * 14) * 6 * (u > 3.6 && u < 7.4 ? 1 : 0)
    const child = track(u, [
      [0, { ...LEAN_IN, torso: 18 }],
      [3.0, { ...LEAN_IN, torso: 18 }],
      [3.6, { ...WRITE, torso: lerp(24, 8, upright), armNearL: WRITE.armNearL + pencil }],
      [7.4, { ...WRITE, torso: 8, armNearL: WRITE.armNearL + pencil }],
      [8.0, { ...SIT, torso: -2, head: -4, armNearU: 120, armNearL: 30, armFarU: 108, armFarL: 34 }],
    ])
    const parent = track(u, [
      [0, { ...LEAN_IN, armNearU: 72, armNearL: 8 }],
      [3.2, { ...LEAN_IN, armNearU: 72, armNearL: 8 }],
      [4.0, { ...SIT, torso: 10, head: 12 }],
      [7.6, { ...SIT, torso: 10, head: 12 }],
      [8.2, { ...SIT, torso: 4, head: 6 + Math.sin(t * 6) * 6 }],
    ])
    const showB = prog(u, 7.6, 8.2)
    return (
      <Camera scale={lerp(1.02, 1.1, prog(u, 0, 9.6))} ox={540} oy={1150}>
        <svg viewBox="0 0 1080 1920" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="t-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={mixColour('#1B2550', '#7CC6F2', daylight)} />
              <stop offset="1" stopColor={mixColour('#3A4A80', '#DDF1FB', daylight)} />
            </linearGradient>
          </defs>
          <rect width="1080" height="1920" fill={mixColour('#3A3550', '#F2E2C4', 0.35 + 0.65 * daylight)} />
          {/* The window: days and nights passing. */}
          <g>
            <rect x={300} y={430} width={480} height={430} rx={12} fill="url(#t-sky)" />
            <circle cx={300 + 480 * sunA} cy={860 - Math.sin(sunA * Math.PI) * 330} r={40} fill={daylight > 0.45 ? '#FFD34E' : '#F6EBCB'} />
            <path d="M540 430 V860 M300 645 H780" stroke="#5C4B3A" strokeWidth={12} />
            <rect x={300} y={430} width={480} height={430} rx={12} fill="none" stroke="#5C4B3A" strokeWidth={16} />
          </g>
          {/* A wall calendar, its pages turning. */}
          <g transform="translate(860 520)">
            <rect width={150} height={180} rx={8} fill="#FFFDF7" stroke="#5C4B3A" strokeWidth={6} />
            <rect width={150} height={40} rx={6} fill={RED} />
            {Array.from({ length: 12 }, (_, k) => (
              <rect key={k} x={14 + (k % 4) * 32} y={56 + Math.floor(k / 4) * 36} width={22} height={22} rx={4} fill={k < Math.floor(days * 12) ? '#58CC02' : '#E7E0D2'} />
            ))}
          </g>
          <rect x={60} y={1250} width={1000} height={26} rx={8} fill="#6B4E36" />
          <rect x={100} y={1270} width={20} height={300} fill="#5A402C" />
          <rect x={1000} y={1270} width={20} height={300} fill="#5A402C" />
          <rect x={0} y={1570} width={1080} height={350} fill={mixColour('#2A2840', '#CFAE84', 0.35 + 0.65 * daylight)} />
          <rect x={170} y={1332} width={170} height={16} rx={6} fill="#5A402C" />
          <rect x={240} y={1346} width={16} height={224} fill="#5A402C" />
          <rect x={480} y={1362} width={140} height={16} rx={6} fill="#5A402C" />
          <rect x={540} y={1376} width={16} height={194} fill="#5A402C" />
          <Figure x={250} y={1330} pose={parent} build="adult" colour={PARENT} far={PARENT_FAR} />
          <Figure x={560} y={1360} pose={child} build="child" sway={Math.sin(t * 1.8) * 4} colour={SIL} far={SIL_FAR} />
          {onPaper < 1 && <path d="M700 1250 L1000 1250 L1020 1262 L680 1262 Z" fill="#20263A" opacity={1 - onPaper} />}
          {showB > 0 && <Sheet x={690} y={lerp(1240, 1095, showB)} w={lerp(120, 180, showB)} grade="B" hand={d.hand} tilt={-6} />}
        </svg>
        {onPaper < 1 && (
          <div className="absolute overflow-hidden rounded-[10px] bg-white" style={{ left: 700, top: 1035, width: 300, height: 200, border: '9px solid #20263A', opacity: 1 - onPaper }}>
            <div style={{ zoom: 0.42, padding: 24 }}>
              <QuestionView question={d.question} answer={u > 1.6 ? 1 : null} onAnswer={() => {}} />
            </div>
          </div>
        )}
        {onPaper > 0 && showB <= 0 && (
          <div className="absolute rounded-[4px] bg-white p-1" style={{ left: 700, top: 1180, width: 250, transform: 'rotate(-4deg) skewX(-10deg) scaleY(0.42)', transformOrigin: 'bottom left', opacity: onPaper, boxShadow: '0 4px 10px rgba(0,0,0,0.25)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.practicePage} alt="" className="block w-full" />
          </div>
        )}
      </Camera>
    )
  }

  // ── 5. The classroom: the test comes back. ────────────────────────────────
  function classroom(u: number) {
    const closeUp = prog(u, 3.6, 4.2) * (1 - prog(u, 6.0, 6.5))
    const teacherX = u < 2 ? lerp(-160, 380, ease(prog(u, 0, 2))) : u < 2.8 ? 380 : lerp(380, -260, ease(prog(u, 2.8, 4.4)))
    const teacher = u < 2 ? gait(u * 0.9) : u < 2.8 ? track(u, [[2, STAND], [2.35, { ...COMFORT, armNearU: 50, armNearL: 10, torso: 30, head: 24 }], [2.8, STAND]]) : gait((u - 2.8) * 0.9)
    const jump = u > 6.2 ? Math.abs(Math.sin((u - 6.2) * 7)) * 60 * (1 - prog(u, 7.2, 7.6)) : 0
    const child = u < 6.2 ? track(u, [[0, SIT], [3.0, SIT], [3.5, { ...SIT, torso: 4, head: 14, armNearU: 64, armNearL: 64, armFarU: 58, armFarL: 70 }]]) : CHEER
    return (
      <>
        <Camera scale={1.04} ox={540} oy={1200}>
          <svg viewBox="0 0 1080 1920" className="absolute inset-0 w-full h-full">
            <rect width="1080" height="1920" fill="#EAF1F6" />
            {[60, 420, 780].map(x => (
              <g key={x}>
                <rect x={x} y={360} width={240} height={420} rx={10} fill="#BFE3F7" stroke="#8C7A66" strokeWidth={12} />
                <path d={`M${x + 120} 360 V780 M${x} 570 H${x + 240}`} stroke="#8C7A66" strokeWidth={8} />
              </g>
            ))}
            <rect x={180} y={860} width={720} height={260} rx={10} fill="#FBFBF8" stroke="#8C7A66" strokeWidth={10} />
            <path d="M240 940 q60 -30 120 0 t120 0 M240 1010 h260 M560 940 l40 60 l40 -60 M700 1000 h120" stroke="#A9B8C8" strokeWidth={8} fill="none" strokeLinecap="round" />
            <rect x={0} y={1560} width={1080} height={360} fill="#C9B79A" />
            {/* Classmates at the back. */}
            {[150, 380, 860].map((x, k) => (
              <g key={x}>
                <Figure x={x} y={1330} pose={{ ...SIT, head: u > 6.4 ? -10 : 8 }} build="child" scale={0.78} facing={k === 2 ? -1 : 1} colour="#5B6478" far="#6E7790" />
                <rect x={x + 30} y={1250} width={170} height={14} rx={4} fill="#8C7A66" transform={k === 2 ? `translate(${-260} 0)` : undefined} />
              </g>
            ))}
            {/* Our child's desk, front and centre, and chair. */}
            <rect x={600} y={1350} width={320} height={20} rx={6} fill="#6B4E36" />
            <rect x={620} y={1370} width={16} height={190} fill="#5A402C" />
            <rect x={884} y={1370} width={16} height={190} fill="#5A402C" />
            <rect x={440} y={1442} width={150} height={14} rx={5} fill="#5A402C" />
            <rect x={448} y={1300} width={14} height={150} rx={5} fill="#5A402C" />
            <rect x={455} y={1452} width={12} height={108} fill="#5A402C" />
            <rect x={566} y={1452} width={12} height={108} fill="#5A402C" />
            {u > 2.4 && u < 3.4 && <Sheet x={740} y={1336} w={110} skew grade="" hand={d.hand} />}
            <Figure x={u < 6.2 ? 520 : 540} y={(u < 6.2 ? 1440 : 1310) - jump} pose={child} build="child" sway={Math.sin(t * 3) * 8} colour={SIL} far={SIL_FAR} />
            {u > 3.0 && u < 6.2 && <Sheet x={650} y={1240} w={110} grade="" hand={d.hand} tilt={-10} />}
            {u > 6.2 && <Sheet x={590} y={985 - jump} w={150} grade="A+" hand={d.hand} tilt={8} />}
            <Figure x={teacherX} y={1135} pose={teacher} build="adult" colour={PARENT} far={PARENT_FAR} />
          </svg>
        </Camera>
        {/* The close-up: A+ and a gold star. */}
        {closeUp > 0 && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: closeUp, background: 'rgba(30,25,20,0.55)' }}>
            <div className="relative w-[820px] h-[1080px] rounded-[10px] bg-[#FFFDF7] px-14 pb-14 pt-48" style={{ transform: `scale(${lerp(0.9, 1, easeOut(closeUp))}) rotate(-2deg)`, boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
              {Array.from({ length: 10 }, (_, k) => (
                <div key={k} className="mt-9 flex items-center gap-6">
                  <div className="h-3 rounded bg-[#D5D9E2]" style={{ width: `${55 + rnd(k + 4) * 30}%` }} />
                  <svg width="56" height="48" viewBox="0 0 80 70" style={{ opacity: prog(u, 4.2 + k * 0.05, 4.4 + k * 0.05) }}>
                    <path d="M8 38 L30 60 L74 10" fill="none" stroke={RED} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ))}
              <div className="absolute right-12 top-10" style={{ transform: `scale(${easeOut(prog(u, 4.5, 4.9))}) rotate(-8deg)` }}>
                <svg width="300" height="210" viewBox="0 0 300 210">
                  <ellipse cx="150" cy="105" rx="135" ry="88" fill="none" stroke={RED} strokeWidth="9" />
                </svg>
                <p className={`${d.hand} absolute inset-0 flex items-center justify-center font-bold`} style={{ color: RED, fontSize: 150 }}>
                  A+
                </p>
              </div>
              <svg className="absolute" style={{ right: 70, top: 300, transform: `scale(${easeOut(prog(u, 5.0, 5.4))}) rotate(${12 - 12 * prog(u, 5, 5.6)}deg)` }} width="230" height="230" viewBox="0 0 100 100">
                <path d="M50 5 L61 37 L95 38 L68 58 L78 92 L50 72 L22 92 L32 58 L5 38 L39 37 Z" fill="#FFC530" stroke="#C78A00" strokeWidth="3" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}
      </>
    )
  }

  // ── 6. Home: running in with the paper, the hug, the sky. ─────────────────
  function home(u: number) {
    const run = prog(u, 0, 3.2)
    const childX = lerp(-160, 545, easeOut(run))
    const running = u < 3.2
    const childPose = running ? { ...gait(u * 1.6, true), armNearU: 168, armNearL: 6 } : track(u, [[3.2, STAND], [3.7, HUGGED]])
    const door = ease(prog(u, 2.2, 2.9))
    const parentOut = prog(u, 2.6, 3.4)
    const parentPose = track(u, [[2.6, STAND], [3.3, KNEEL_OPEN], [3.9, KNEEL_HUG]])
    const tilt = ease(prog(u, 5.0, 7.6))
    return (
      <Camera scale={1} ox={540} oy={960} y={tilt * 700}>
        <svg viewBox="0 -800 1080 2720" className="absolute w-full" style={{ top: -800, height: 2720 }}>
          <defs>
            <linearGradient id="h-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#58B4F0" />
              <stop offset="1" stopColor="#E3F4FD" />
            </linearGradient>
            <radialGradient id="h-sun">
              <stop offset="0" stopColor="#FFF3B0" stopOpacity="0.9" />
              <stop offset="1" stopColor="#FFF3B0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x={0} y={-800} width={1080} height={2720} fill="url(#h-sky)" />
          <circle cx={860} cy={300} r={300} fill="url(#h-sun)" />
          <circle cx={860} cy={300} r={90} fill="#FFE27A" />
          {[[140, 120, 1], [560, -180, 1.3], [300, -520, 1.1]].map(([x, y, s], k) => (
            <g key={k} transform={`translate(${x + (t * 12) % 60} ${y}) scale(${s})`}>
              <ellipse cx={0} cy={0} rx={110} ry={46} fill="#FFFFFF" opacity={0.9} />
              <ellipse cx={60} cy={-24} rx={70} ry={44} fill="#FFFFFF" opacity={0.9} />
            </g>
          ))}
          <path d="M0 1500 Q300 1440 600 1480 T1080 1460 V1920 H0 Z" fill="#7CC36B" />
          {/* The house: a warm front door. */}
          <rect x={560} y={960} width={520} height={560} fill="#F0D2A8" />
          <path d="M520 980 L820 760 L1120 980 Z" fill="#C8644A" />
          <rect x={690} y={1180} width={180} height={340} fill="#FFE6B0" />
          <rect x={690} y={1180} width={180 * (1 - door * 0.85)} height={340} fill="#3E7CB8" />
          <rect x={940} y={1080} width={110} height={120} rx={6} fill="#BFE3F7" stroke="#8C5A3C" strokeWidth={8} />
          <path d="M560 1520 L1080 1520" stroke="#8C5A3C" strokeWidth={10} />
          <path d="M700 1520 L620 1920 L940 1920 L860 1520 Z" fill="#E7D3B0" />
          {[90, 200, 330].map((x, k) => (
            <g key={x}>
              <rect x={x} y={1470} width={6} height={50} fill="#4B8B3B" />
              <circle cx={x + 3} cy={1466} r={16} fill={['#FF8FA8', '#FFC530', '#CE82FF'][k]} />
            </g>
          ))}
          {parentOut > 0 && (
            <g opacity={parentOut}>
              <Figure x={lerp(790, 700, parentOut)} y={lerp(1095, 1315, prog(u, 2.8, 3.3))} pose={parentPose} build="adult" facing={-1} colour={PARENT} far={PARENT_FAR} />
            </g>
          )}
          <Figure x={childX} y={1270 - (running ? Math.abs(Math.sin(u * 10)) * 26 : 0)} pose={childPose} build="child" sway={running ? Math.sin(u * 20) * 18 : Math.sin(t * 2) * 5} colour={SIL} far={SIL_FAR} />
          {running && <Sheet x={childX + 30} y={945 - Math.abs(Math.sin(u * 10)) * 26} w={110} grade="A+" hand={d.hand} tilt={Math.sin(u * 12) * 10} />}
        </svg>
        {/* Our bird flies across the sky as we look up. */}
        {u > 5.2 && (
          <div className="absolute" style={{ left: lerp(-260, 1100, prog(u, 5.2, 7.6)), top: 300 - 700 * tilt + 700 + Math.sin(u * 5) * 30, width: 240, height: 240 }}>
            <Bird pose="cheer" className="w-full h-full" />
          </div>
        )}
      </Camera>
    )
  }

  // ── 7. The end card. ──────────────────────────────────────────────────────
  function endCard(u: number) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(#E3F4FD, #F7F0E2)' }}>
        <div style={{ width: 420, height: 420, transform: `scale(${lerp(0.9, 1, easeOut(prog(u, 0, 1.2)))})`, opacity: prog(u, 0, 0.8) }}>
          <Bird pose="nest" className="w-full h-full" />
        </div>
        <div className="mt-6 inline-flex items-center gap-4" style={{ opacity: prog(u, 0.6, 1.4) }}>
          <BirdMark className="w-20 h-20" />
          <span className="text-8xl font-bold tracking-tight text-ink">
            Prep<span className="text-brand-500">Nest</span>
          </span>
        </div>
        <p className={`${d.hand} mt-6 text-[72px] font-bold text-brand-600`} style={{ opacity: prog(u, 1.2, 2.0) }}>
          prepnest.com.au
        </p>
      </div>
    )
  }
}

/** A slow camera: scale about (ox, oy), and an optional pan down by `y`. */
function Camera({ scale, ox, oy, y = 0, children }: { scale: number; ox: number; oy: number; y?: number; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0" style={{ transform: `translateY(${y}px) scale(${scale})`, transformOrigin: `${ox}px ${oy}px` }}>
      {children}
    </div>
  )
}

/** A sheet of paper with a red grade circled at the top; `skew` lays it flat on a desk. */
function Sheet({ x, y, w, grade, hand, tilt = 0, skew, creased }: { x: number; y: number; w: number; grade: string; hand: string; tilt?: number; skew?: boolean; creased?: boolean }) {
  const h = w * 1.3
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) ${skew ? 'skewX(-30) scale(1 0.35)' : ''}`}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={4} fill="#FFFDF7" stroke="#C9BFA9" strokeWidth={2} />
      {Array.from({ length: 6 }, (_, k) => (
        <rect key={k} x={-w * 0.4} y={-h + h * (0.32 + k * 0.1)} width={w * (0.5 + rnd(k + 2) * 0.2)} height={Math.max(2, w * 0.025)} fill="#D5D9E2" />
      ))}
      {creased && <path d={`M${-w / 2} ${-h * 0.6} L${w / 2} ${-h * 0.45} M${-w * 0.1} ${-h} L${w * 0.05} 0`} stroke="#D8CFBB" strokeWidth={2} />}
      {grade && (
        <>
          <ellipse cx={w * 0.22} cy={-h * 0.82} rx={w * 0.2} ry={w * 0.15} fill="none" stroke={RED} strokeWidth={Math.max(2, w * 0.03)} />
          <text x={w * 0.22} y={-h * 0.82 + w * 0.08} textAnchor="middle" fontSize={w * 0.24} fontWeight={700} fill={RED} className={hand}>
            {grade}
          </text>
        </>
      )}
    </g>
  )
}

function Stars({ n, t, x0 = 0, y0 = 0, w = 1080, h }: { n: number; t: number; x0?: number; y0?: number; w?: number; h: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, k) => (
        <circle key={k} cx={x0 + rnd(k + 1) * w} cy={y0 + rnd(k + 50) * h} r={1.5 + rnd(k + 9) * 2.5} fill="#FFF8E0" opacity={0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * (1 + rnd(k) * 2) + k))} />
      ))}
    </>
  )
}

function Tree({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#0B1022">
      <rect x={-12} y={-120} width={24} height={130} />
      <circle cx={0} cy={-180} r={90} />
      <circle cx={-60} cy={-130} r={60} />
      <circle cx={60} cy={-130} r={60} />
    </g>
  )
}

function Clock({ x, y, r }: { x: number; y: number; r: number }) {
  // Twenty to midnight.
  const hand = (deg: number, len: number, w: number) => <line x1={x} y1={y} x2={x + Math.sin((deg * Math.PI) / 180) * len} y2={y - Math.cos((deg * Math.PI) / 180) * len} stroke="#C9D6F5" strokeWidth={w} strokeLinecap="round" />
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#1E2640" stroke="#0B0F1E" strokeWidth={10} />
      {hand(350, r * 0.5, 7)}
      {hand(240, r * 0.75, 5)}
    </g>
  )
}

function mixColour(a: string, b: string, p: number): string {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16))
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp(p))).join(',')})`
}

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.5'/></svg>`
)}")`
