"""The soundtrack of "The right practice" reel, and the timings the visuals follow.

1. Reads the chosen voice lines (vo-1.wav ... vo-8.wav from voice.py) and
   finds when every word is spoken (faster-whisper word timestamps).
2. Places the lines so every scene cut lands on a beat at 120 BPM, with the
   drop ("They need the RIGHT practice") on the first beat of a bar.
3. Writes an original score for those cuts: a ticking-clock opening in
   B minor, a riser into a bright D major drop, a build under "watch the gaps
   close" and a big call to action with a glockenspiel hook and a sting.
4. Puts a sound on every on-screen action (the paper slaps, the red pen,
   whooshes on every wipe, taps, pops, the ding, the confetti), at the same
   times the visuals use (RightPractice.tsx works them out the same way).
5. Mixes it: the voice cleaned and levelled, the music ducked under it,
   mastered to about -14 LUFS with a true-peak ceiling of -1 dB.

Writes timings.json (read by src/app/dev/ad-right), ad-audio.wav (the full
mix), music.wav (score only) and voice-sfx.wav (voice and effects, for
posting with an in-app sound instead).

Needs Python 3.10+ with numpy, scipy, soundfile and faster-whisper.

    python audio.py
"""
import difflib
import json
import math
import os
import re

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, lfilter, resample_poly, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
LEAD = 0.12  # the voice starts this long after a cut

# What each line shows on screen (the visuals split these into words), and
# what was spoken, when the two differ.
DISPLAY = [
    'Hours of practice. Same mistakes?',
    "Maybe they don't need more practice.",
    'They need the right practice.',
    "Start with PrepNest's free test. It feels like a game.",
    'It shows which skills are strong, and exactly which need work.',
    'Then practice papers on just those skills. On screen, or printed.',
    'So you can watch the gaps close.',
    'Try the free test now, at prepnest.com.au.',
]
SPOKEN = {
    3: "Start with Prep Nest's free test. It feels like a game.",
    7: 'Try the free test now, at prep nest dot com dot eh you.',
}
# Display word -> spoken word, where they differ.
DISPLAY_TO_SPOKEN = {
    3: [0, 1, 2, 4, 5, 6, 7, 8, 9, 10],
    7: [0, 1, 2, 3, 4, 5, 6],
}
GAP_AFTER = [0.22, 0.18, 0.25, 0.25, 0.25, 0.25, 0.3, 0]

rng = np.random.default_rng(2026)


def norm(w: str) -> str:
    return re.sub(r'[^a-z0-9]', '', w.lower())


# ── Voice ─────────────────────────────────────────────────────────────────────

def tighten(x: np.ndarray, max_gap: float = 0.4) -> np.ndarray:
    """Shortens any pause inside a line to `max_gap`: a hook cannot wait."""
    hop = int(0.01 * SR)
    frames = len(x) // hop
    loud = np.array([np.sqrt(np.mean(x[k * hop:(k + 1) * hop] ** 2)) for k in range(frames)]) > 0.01
    out = []
    pos = 0
    k = 0
    while k < frames:
        if not loud[k]:
            j = k
            while j < frames and not loud[j]:
                j += 1
            if k > 0 and j < frames and (j - k) * hop > max_gap * SR:
                keep = int(max_gap * SR) // 2
                a = k * hop + keep
                b = j * hop - keep
                fade = int(0.015 * SR)
                head = x[pos:a].copy()
                tail = x[b:b + fade] * np.linspace(0, 1, fade)
                head[-fade:] = head[-fade:] * np.linspace(1, 0, fade) + tail
                out.append(head)
                pos = b + fade
            k = j
        else:
            k += 1
    out.append(x[pos:])
    return np.concatenate(out)


def load_vo(i: int) -> np.ndarray:
    x, sr = sf.read(os.path.join(HERE, f'vo-{i}.wav'), dtype='float64')
    if x.ndim > 1:
        x = x.mean(axis=1)
    return tighten(resample_poly(x, SR, sr))


def word_times(x48: np.ndarray, spoken: str, asr) -> list[tuple[float, float]]:
    """Start and end of each spoken word, aligned to the script."""
    segs, _ = asr.transcribe(resample_poly(x48, 16000, SR).astype(np.float32), language='en', word_timestamps=True, beam_size=5)
    heard = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
    script = spoken.split()
    a = [norm(w) for w in script]
    b = [norm(w) for w, _, _ in heard]
    out: list[tuple[float, float] | None] = [None] * len(script)
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes():
        if tag in ('equal', 'replace'):
            for k in range(i2 - i1):
                j = j1 + min(k * max(1, j2 - j1) // max(1, i2 - i1), j2 - j1 - 1) if j2 > j1 else None
                if j is not None:
                    out[i1 + k] = (heard[j][1], heard[j][2])
    # Fill gaps by sharing the time between known neighbours.
    dur = len(x48) / SR
    known = [(i, v) for i, v in enumerate(out) if v]
    if not known:
        return [(dur * i / len(script), dur * (i + 0.9) / len(script)) for i in range(len(script))]
    for i in range(len(script)):
        if out[i] is None:
            prev = max([k for k in known if k[0] < i], default=(None, (0.0, 0.0)), key=lambda k: k[0])
            nxt = min([k for k in known if k[0] > i], default=(None, (dur, dur)), key=lambda k: k[0])
            p0 = prev[1][1]
            n0 = nxt[1][0]
            pi = prev[0] if prev[0] is not None else -1
            ni = nxt[0] if nxt[0] is not None else len(script)
            f = (i - pi) / (ni - pi)
            s = p0 + (n0 - p0) * f
            out[i] = (s, min(n0, s + (n0 - p0) / (ni - pi)))
    return [(float(s), float(e)) for s, e in out]  # type: ignore[misc]


def biquad_highshelf(f0: float, gain_db: float, q: float = 0.7):
    a = 10 ** (gain_db / 40)
    w = 2 * math.pi * f0 / SR
    alpha = math.sin(w) / (2 * q)
    cw = math.cos(w)
    b0 = a * ((a + 1) + (a - 1) * cw + 2 * math.sqrt(a) * alpha)
    b1 = -2 * a * ((a - 1) + (a + 1) * cw)
    b2 = a * ((a + 1) + (a - 1) * cw - 2 * math.sqrt(a) * alpha)
    a0 = (a + 1) - (a - 1) * cw + 2 * math.sqrt(a) * alpha
    a1 = 2 * ((a - 1) - (a + 1) * cw)
    a2 = (a + 1) - (a - 1) * cw - 2 * math.sqrt(a) * alpha
    return np.array([b0, b1, b2]) / a0, np.array([1, a1 / a0, a2 / a0])


def biquad_peak(f0: float, gain_db: float, q: float = 1.0):
    a = 10 ** (gain_db / 40)
    w = 2 * math.pi * f0 / SR
    alpha = math.sin(w) / (2 * q)
    cw = math.cos(w)
    b = np.array([1 + alpha * a, -2 * cw, 1 - alpha * a])
    aa = np.array([1 + alpha / a, -2 * cw, 1 - alpha / a])
    return b / aa[0], aa / aa[0]


def envelope(x: np.ndarray, attack: float, release: float) -> np.ndarray:
    """Peak follower, vectorised in blocks of 1 ms."""
    blk = SR // 1000
    n = len(x) // blk + 1
    pad = np.zeros(n * blk)
    pad[: len(x)] = np.abs(x)
    peaks = pad.reshape(n, blk).max(axis=1)
    out = np.zeros(n)
    ga = math.exp(-1 / (attack * 1000))
    gr = math.exp(-1 / (release * 1000))
    v = 0.0
    for i, p in enumerate(peaks):
        v = ga * v + (1 - ga) * p if p > v else gr * v + (1 - gr) * p
        out[i] = v
    return np.repeat(out, blk)[: len(x)]


def compress(x: np.ndarray, thresh_db: float, ratio: float, attack=0.005, release=0.12, makeup_db=0.0) -> np.ndarray:
    env = envelope(x, attack, release) + 1e-9
    lvl = 20 * np.log10(env)
    over = np.maximum(0, lvl - thresh_db)
    gain_db = -over * (1 - 1 / ratio) + makeup_db
    return x * 10 ** (gain_db / 20)


def process_vo(x: np.ndarray) -> np.ndarray:
    x = sosfilt(butter(2, 85, 'highpass', fs=SR, output='sos'), x)
    b, a = biquad_peak(250, -2.0, 1.0)
    x = lfilter(b, a, x)
    b, a = biquad_peak(3800, 2.5, 0.9)
    x = lfilter(b, a, x)
    b, a = biquad_highshelf(10000, 2.0)
    x = lfilter(b, a, x)
    x = compress(x, -20, 3.0, 0.004, 0.10)
    rms = math.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2) + 1e-12)
    return x * (0.16 / rms)


# ── Synthesis ─────────────────────────────────────────────────────────────────

def midi(n: int) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}


def n(name: str) -> int:
    m = re.match(r'([A-G]#?)(-?\d)', name)
    return NOTE[m.group(1)] + 12 * (int(m.group(2)) + 1)


def adsr(length: int, a: float, d: float, s: float, r: float, hold: float) -> np.ndarray:
    t = np.arange(length) / SR
    env = np.where(t < a, t / max(a, 1e-6), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-6), s))
    rel = np.clip((t - hold) / max(r, 1e-6), 0, 1)
    return env * np.where(t > hold, 1 - rel, 1)


def saw(f: float, length: int, phase: float = 0.0) -> np.ndarray:
    t = np.arange(length) / SR
    return 2 * ((f * t + phase) % 1.0) - 1


def lowpass_sweep(x: np.ndarray, cutoffs: np.ndarray, q_order: int = 2) -> np.ndarray:
    """A low-pass filter whose cut-off follows `cutoffs` (one value per 256-sample block)."""
    out = np.zeros_like(x)
    blk = 256
    zi = None
    for k in range(0, len(x), blk):
        fc = float(np.clip(cutoffs[min(k // blk, len(cutoffs) - 1)], 40, SR * 0.45))
        b, a = butter(q_order, fc, 'lowpass', fs=SR)
        if zi is None:
            zi = np.zeros(max(len(a), len(b)) - 1)
        out[k: k + blk], zi = lfilter(b, a, x[k: k + blk], zi=zi)
    return out


def place(bus: np.ndarray, x: np.ndarray, at: float, gain: float = 1.0, pan: float = 0.0):
    """Adds mono or stereo `x` into stereo `bus` at time `at`, panned -1..1."""
    i = int(round(at * SR))
    if i >= bus.shape[0]:
        return
    if i < 0:
        x = x[-i:]
        i = 0
    x = x[: bus.shape[0] - i]
    if x.ndim == 1:
        lg = math.cos((pan + 1) * math.pi / 4) * math.sqrt(2)
        rg = math.sin((pan + 1) * math.pi / 4) * math.sqrt(2)
        bus[i: i + len(x), 0] += x * gain * lg
        bus[i: i + len(x), 1] += x * gain * rg
    else:
        bus[i: i + len(x)] += x * gain


def kick() -> np.ndarray:
    L = int(0.45 * SR)
    t = np.arange(L) / SR
    f = 48 + 110 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = sosfilt(butter(2, 3000, 'highpass', fs=SR, output='sos'), rng.standard_normal(L)) * np.exp(-t * 300) * 0.25
    return np.tanh((body + click) * 1.6) * 0.9


def clap() -> np.ndarray:
    L = int(0.35 * SR)
    t = np.arange(L) / SR
    noise = sosfilt(butter(2, [900, 4200], 'bandpass', fs=SR, output='sos'), rng.standard_normal(L))
    env = np.zeros(L)
    for k, off in enumerate([0, 0.011, 0.022, 0.031]):
        tt = t - off
        env += np.where(tt >= 0, np.exp(-np.maximum(tt, 0) * (180 if k < 3 else 22)), 0) * (0.8 if k < 3 else 1)
    return noise * env * 0.55


def hat(open_: bool = False) -> np.ndarray:
    L = int((0.25 if open_ else 0.06) * SR)
    t = np.arange(L) / SR
    x = sosfilt(butter(4, 7500, 'highpass', fs=SR, output='sos'), rng.standard_normal(L))
    return x * np.exp(-t * (14 if open_ else 70)) * 0.22


def tick(pitch: float = 1800, decay: float = 60) -> np.ndarray:
    L = int(0.12 * SR)
    t = np.arange(L) / SR
    return (np.sin(2 * np.pi * pitch * t) * 0.6 + np.sin(2 * np.pi * pitch * 2.71 * t) * 0.25) * np.exp(-t * decay)


def bass_note(f: float, dur: float) -> np.ndarray:
    L = int((dur + 0.05) * SR)
    x = 0.7 * np.sin(2 * np.pi * f * np.arange(L) / SR) + 0.35 * saw(f, L)
    x = lowpass_sweep(x, 260 + 900 * np.exp(-np.arange(L // 256 + 1) * 256 / SR * 9))
    return np.tanh(x * 1.4) * adsr(L, 0.004, 0.12, 0.75, 0.04, dur) * 0.5


def supersaw(freqs: list[float], dur: float, cutoff=(700, 5200, 1500), decay=0.25, voices=5, detune=0.012) -> np.ndarray:
    L = int((dur + 0.35) * SR)
    st = np.zeros((L, 2))
    for f in freqs:
        for v in range(voices):
            d = (v - (voices - 1) / 2) / ((voices - 1) / 2 or 1) * detune
            st[:, 0] += saw(f * (1 + d), L, rng.random())
            st[:, 1] += saw(f * (1 - d * 0.9), L, rng.random())
    st /= voices * len(freqs) ** 0.6
    blocks = np.arange(L // 256 + 1) * 256 / SR
    lo, peak, rest = cutoff
    cut = rest + (peak - rest) * np.exp(-blocks / decay)
    cut = np.where(blocks < 0.004, lo, cut)
    env = adsr(L, 0.004, decay, 0.35, 0.25, dur)
    return np.stack([lowpass_sweep(st[:, c], cut) * env for c in range(2)], axis=1) * 0.5


def pad(freqs: list[float], dur: float, bright=1400.0) -> np.ndarray:
    L = int((dur + 0.8) * SR)
    st = np.zeros((L, 2))
    for f in freqs:
        for v in range(7):
            d = (v - 3) / 3 * 0.009
            st[:, 0] += saw(f * (1 + d), L, rng.random())
            st[:, 1] += saw(f * (1 - d), L, rng.random())
    st /= 7 * len(freqs) ** 0.6
    sos = butter(2, bright, 'lowpass', fs=SR, output='sos')
    env = adsr(L, 0.6, 0.4, 0.85, 0.8, dur)
    return np.stack([sosfilt(sos, st[:, c]) * env for c in range(2)], axis=1) * 0.32


def pluck(f: float, dur: float = 1.2, bright: float = 0.6) -> np.ndarray:
    """Karplus-Strong: a plucked string."""
    N = int(SR / f)
    L = int(dur * SR)
    burst = np.zeros(L)
    exc = rng.standard_normal(N)
    exc = lfilter([bright, 1 - bright], [1], exc)
    burst[:N] = exc
    a = np.zeros(N + 2)
    a[0] = 1
    a[N] = -0.4985
    a[N + 1] = -0.4985
    y = lfilter([1], a, burst)
    y = sosfilt(butter(2, min(6000, f * 9), 'lowpass', fs=SR, output='sos'), y)
    return y / (np.abs(y).max() + 1e-9) * 0.45 * np.exp(-np.arange(L) / SR * 2.2)


def bell(f: float, dur: float = 1.6) -> np.ndarray:
    """A glockenspiel: bright inharmonic partials that ring and fade."""
    L = int(dur * SR)
    t = np.arange(L) / SR
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2)
         + 0.45 * np.sin(2 * np.pi * f * 2.756 * t) * np.exp(-t * 7)
         + 0.22 * np.sin(2 * np.pi * f * 5.404 * t) * np.exp(-t * 12)
         + 0.12 * np.sin(2 * np.pi * f * 8.933 * t) * np.exp(-t * 20))
    x *= np.minimum(1, t / 0.002)
    return x * 0.32


def noise_sweep(dur: float, f0: float, f1: float, shape: str = 'whoosh') -> np.ndarray:
    L = int(dur * SR)
    t = np.arange(L) / SR
    x = rng.standard_normal(L)
    p = t / dur
    fc = f0 * (f1 / f0) ** p
    blk = 256
    out = np.zeros(L)
    zi = np.zeros(4)
    for k in range(0, L, blk):
        c = float(np.clip(fc[k], 60, SR * 0.4))
        sos = butter(2, [c / 1.6, min(c * 1.6, SR * 0.45)], 'bandpass', fs=SR)
        b, a = sos
        y, zi = lfilter(b, a, x[k: k + blk], zi=zi)
        out[k: k + blk] = y
    if shape == 'whoosh':
        env = np.sin(np.pi * np.clip(p, 0, 1) ** 0.75) ** 2
    else:  # riser: grows to the end
        env = p ** 2.2
    return out * env


def whoosh(dur=0.5, up=True) -> np.ndarray:
    x = noise_sweep(dur, 300 if up else 3500, 3500 if up else 300)
    L = len(x)
    st = np.zeros((L, 2))
    pan = np.linspace(-0.8, 0.8, L)
    st[:, 0] = x * np.cos((pan + 1) * np.pi / 4)
    st[:, 1] = x * np.sin((pan + 1) * np.pi / 4)
    return st * 0.55


def riser(dur: float) -> np.ndarray:
    L = int(dur * SR)
    t = np.arange(L) / SR
    nz = noise_sweep(dur, 400, 7000, 'riser') * 0.5
    f = 180 * (6 ** (t / dur))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / dur) ** 2 * 0.18
    return nz + tone


def impact() -> np.ndarray:
    L = int(1.6 * SR)
    t = np.arange(L) / SR
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 18)) / SR) * np.exp(-t * 3.2)
    crash = sosfilt(butter(2, 4500, 'highpass', fs=SR, output='sos'), rng.standard_normal(L)) * np.exp(-t * 2.4) * 0.22
    return np.tanh((boom * 0.9 + crash) * 1.3) * 0.8


def pop(pitch=650.0, decay=40.0) -> np.ndarray:
    L = int(0.16 * SR)
    t = np.arange(L) / SR
    f = pitch * (1 + 0.9 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * decay) * 0.5


def click() -> np.ndarray:
    L = int(0.05 * SR)
    t = np.arange(L) / SR
    nz = sosfilt(butter(2, 2500, 'highpass', fs=SR, output='sos'), rng.standard_normal(L)) * np.exp(-t * 600)
    return (nz * 0.5 + np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 250) * 0.3) * 0.8


def thud() -> np.ndarray:
    L = int(0.25 * SR)
    t = np.arange(L) / SR
    low = np.sin(2 * np.pi * np.cumsum(70 + 90 * np.exp(-t * 40)) / SR) * np.exp(-t * 22)
    paper = sosfilt(butter(2, [700, 5000], 'bandpass', fs=SR, output='sos'), rng.standard_normal(L)) * np.exp(-t * 55) * 0.6
    return (low * 0.7 + paper) * 0.7


def scribble(dur=0.22) -> np.ndarray:
    L = int(dur * SR)
    t = np.arange(L) / SR
    nz = sosfilt(butter(2, [1800, 6500], 'bandpass', fs=SR, output='sos'), rng.standard_normal(L))
    jitter = 0.55 + 0.45 * np.sin(2 * np.pi * (22 + 8 * np.sin(t * 13)) * t) ** 2
    env = np.sin(np.pi * t / dur) ** 0.6
    return nz * jitter * env * 0.35


def sparkle(dur=0.5, base=n('D6')) -> np.ndarray:
    L = int((dur + 0.6) * SR)
    out = np.zeros(L)
    scale = [0, 2, 4, 7, 9, 12, 14, 16]
    for k in range(7):
        at = int(k / 7 * dur * SR)
        b = bell(midi(base + scale[int(rng.integers(0, len(scale)))]), 0.5) * 0.35
        out[at: at + len(b)] += b[: L - at]
    return out


def ding() -> np.ndarray:
    a = bell(midi(n('A5')), 1.6)
    b = bell(midi(n('D6')), 1.6)
    out = np.zeros(len(a) + int(0.09 * SR))
    out[: len(a)] += a
    out[int(0.09 * SR):] += b
    return out * 0.9


def boing() -> np.ndarray:
    L = int(0.32 * SR)
    t = np.arange(L) / SR
    f = 320 + 380 * (1 - np.exp(-t * 14)) + 25 * np.sin(2 * np.pi * 18 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.35


def popper() -> np.ndarray:
    L = int(1.2 * SR)
    out = np.zeros(L)
    out[: int(0.16 * SR)] += pop(380, 30)[: int(0.16 * SR)] * 1.2
    nz = sosfilt(butter(2, 3000, 'highpass', fs=SR, output='sos'), rng.standard_normal(L))
    crackle = np.zeros(L)
    for _ in range(60):
        at = int(rng.uniform(0.02, 0.9) * SR)
        ln = int(0.006 * SR)
        crackle[at: at + ln] += rng.uniform(0.3, 1.0)
    return out + nz * crackle * 0.18 + sparkle(0.6, n('A6'))[:L] * 0.5


def reverb_ir(seconds=1.6, predelay=0.02, damp=6000) -> np.ndarray:
    L = int(seconds * SR)
    t = np.arange(L) / SR
    ir = rng.standard_normal((L, 2)) * np.exp(-t * 6.9 / seconds)[:, None]
    for c in range(2):
        ir[:, c] = sosfilt(butter(1, damp, 'lowpass', fs=SR, output='sos'), ir[:, c])
    ir = np.concatenate([np.zeros((int(predelay * SR), 2)), ir])
    return ir / np.sqrt((ir ** 2).sum(axis=0)).max()


def reverb(x: np.ndarray, ir: np.ndarray) -> np.ndarray:
    return np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)


# ── Loudness ──────────────────────────────────────────────────────────────────

def lufs(x: np.ndarray) -> float:
    """Integrated loudness (ITU-R BS.1770, with the -70 and relative gates)."""
    b, a = biquad_highshelf(1681.97, 4.0, 0.707)
    sos_shelf = np.r_[b, a][None, :]
    sos_hp = butter(2, 38.13, 'highpass', fs=SR, output='sos')
    y = np.stack([sosfilt(sos_hp, sosfilt(sos_shelf, x[:, c])) for c in range(2)], axis=1)
    blk = int(0.4 * SR)
    hop = int(0.1 * SR)
    zs = np.array([np.mean(y[i: i + blk] ** 2, axis=0).sum() for i in range(0, len(y) - blk, hop)])
    lk = -0.691 + 10 * np.log10(zs + 1e-12)
    g = zs[lk > -70]
    rel = -0.691 + 10 * math.log10(g.mean() + 1e-12) - 10
    g2 = zs[(lk > -70) & (lk > rel)]
    return -0.691 + 10 * math.log10(g2.mean() + 1e-12)


def limit(x: np.ndarray, ceiling_db=-1.0, release=0.08) -> np.ndarray:
    ceil = 10 ** (ceiling_db / 20)
    up = resample_poly(x, 4, 1, axis=0)  # true-peak estimate
    peak = np.abs(up).max(axis=1).reshape(-1, 4).max(axis=1)[: len(x)]
    need = np.minimum(1, ceil / (peak + 1e-12))
    look = int(0.005 * SR)
    # Smooth: instant attack via a running minimum over the look-ahead window, then release.
    win = np.lib.stride_tricks.sliding_window_view(np.r_[need, np.ones(look)], look + 1).min(axis=1)[: len(x)]
    g = np.empty_like(win)
    v = 1.0
    r = math.exp(-1 / (release * SR))
    blk = 64
    for k in range(0, len(win), blk):
        m = win[k: k + blk].min()
        v = m if m < v else r ** blk * v + (1 - r ** blk) * m
        g[k: k + blk] = v
    return x * g[:, None]


# ── Score ─────────────────────────────────────────────────────────────────────

def score(length: float, drop: float, cuts: list[float], end_hit: float) -> np.ndarray:
    """The music, on a grid whose bars start at `drop`."""
    L = int((length + 2) * SR)
    drums = np.zeros((L, 2))
    bass = np.zeros((L, 2))
    keys = np.zeros((L, 2))
    padbus = np.zeros((L, 2))
    lead = np.zeros((L, 2))
    fx = np.zeros((L, 2))
    first_bar = drop - math.ceil(drop / BAR) * BAR  # <= 0
    bars = [first_bar + k * BAR for k in range(int((length - first_bar) / BAR) + 2)]
    # I V vi IV in D: D A Bm G.
    prog_ = [
        ([n('D3')], [n('F#4'), n('A4'), n('D5')]),
        ([n('A2')], [n('E4'), n('A4'), n('C#5')]),
        ([n('B2')], [n('F#4'), n('B4'), n('D5')]),
        ([n('G2')], [n('G4'), n('B4'), n('D5')]),
    ]
    intro_prog = [
        ([n('B2')], [n('D4'), n('F#4'), n('B4')]),
        ([n('G2')], [n('D4'), n('G4'), n('B4')]),
    ]
    build_at, cta_at = cuts[6], cuts[7]
    kicks = []

    # The opening: a clock ticking, a low pulse and plucked strings in B minor.
    beat = first_bar
    while beat < drop - 1e-6:
        if beat >= 0:
            k = int(round((beat - first_bar) / BEAT))
            place(fx, tick(2400 if k % 2 == 0 else 1900, 70), beat, 0.32, -0.3 if k % 2 else 0.3)
        beat += BEAT
    for bi, b0 in enumerate([b for b in bars if b < drop]):
        root, chord = intro_prog[bi % 2]
        if b0 + BAR > 0:
            place(padbus, pad([midi(x) for x in chord], BAR), max(0, b0), 0.55 if b0 >= cuts[1] - 0.01 else 0.3)
            place(bass, np.sin(2 * np.pi * midi(root[0] - 12) * np.arange(int(BAR * SR)) / SR) * adsr(int(BAR * SR), 0.05, 0.3, 0.6, 0.3, BAR - 0.3) * 0.35, max(0, b0))
        arp = [chord[0], chord[1], chord[2], chord[1] + 12, chord[2], chord[1], chord[0] + 12, chord[1]]
        for s, note in enumerate(arp):
            at = b0 + s * BEAT / 2
            if 0 <= at < drop - 0.01:
                place(keys, pluck(midi(note), 1.0, 0.55), at, 0.55 if at > cuts[1] else 0.42, -0.4 + 0.8 * (s % 2))
    # A riser and a reversed swell into the drop.
    rdur = min(2.0, drop - cuts[1] + 0.2)
    place(fx, riser(rdur), drop - rdur, 0.55)

    # The drop and the groove, until the call to action's last hit.
    for bi, b0 in enumerate([b for b in bars if drop - 1e-6 <= b < end_hit]):
        root, chord = prog_[bi % 4]
        in_build = build_at <= b0 < cta_at
        for q in range(4):
            at = b0 + q * BEAT
            if at >= end_hit:
                break
            if not (in_build and q % 2):
                place(drums, kick(), at, 0.95)
                kicks.append(at)
            if q in (1, 3):
                place(drums, clap(), at, 0.6)
            place(drums, hat(False), at + BEAT / 2, 0.55, 0.25)
            if b0 >= cuts[4] and not in_build:
                place(drums, hat(False), at + BEAT / 4, 0.25, -0.25)
                place(drums, hat(False), at + 3 * BEAT / 4, 0.25, -0.25)
        if not in_build:
            place(drums, hat(True), b0 + 3.5 * BEAT, 0.4, 0.3)
        # Bass: root on the off-beats, pumping.
        for e in range(8):
            at = b0 + e * BEAT / 2
            if at >= end_hit:
                break
            note = root[0] + (12 if e in (3, 7) else 0)
            place(bass, bass_note(midi(note), BEAT / 2 * 0.9), at, 0.62 if e % 2 else 0.45)
        # Chord stabs, syncopated.
        for s in (0, 1.5, 3, 4.5, 6):
            at = b0 + s * BEAT / 2
            if at < end_hit:
                place(keys, supersaw([midi(x) for x in chord], BEAT * 0.55), at, 0.42)
        place(padbus, pad([midi(x - 12) for x in chord], BAR, 900), b0, 0.4)

    # The build: a snare roll speeding up, and a riser into the call to action.
    roll = build_at
    step = BEAT / 2
    while roll < cta_at - 0.02:
        place(drums, clap(), roll, 0.25 + 0.4 * (roll - build_at) / max(0.1, cta_at - build_at), 0.0)
        step = max(BEAT / 8, step * 0.82)
        roll += step
    place(fx, riser(min(2.2, cta_at - build_at + 0.1)), cta_at - min(2.2, cta_at - build_at + 0.1), 0.5)
    place(fx, impact(), cta_at, 0.55)
    place(fx, impact(), drop, 0.75)

    # The hook, on glockenspiel, under the call to action (and once in the drop).
    hook = [
        [(0, 'A5'), (1, 'F#5'), (1.5, 'A5'), (2, 'B5'), (3, 'A5')],
        [(0, 'C#6'), (1, 'B5'), (1.5, 'A5'), (2, 'E5')],
        [(0, 'D6'), (1, 'C#6'), (1.5, 'B5'), (2, 'F#5'), (3, 'A5')],
        [(0, 'B5'), (1, 'A5'), (1.5, 'G5'), (2, 'F#5'), (3, 'E5')],
    ]
    for bi, b0 in enumerate([b for b in bars if drop - 1e-6 <= b < end_hit]):
        if b0 >= cta_at - 1e-6 or (cuts[3] <= b0 < cuts[4]):
            for beat_, name in hook[bi % 4]:
                at = b0 + beat_ * BEAT
                if at < end_hit:
                    place(lead, bell(midi(n(name)), 1.4), at, 0.5 if b0 >= cta_at - 1e-6 else 0.3, 0.15)

    # The ending: one big D major hit, a glockenspiel run up, then it rings out.
    place(drums, kick(), end_hit, 1.0)
    place(fx, impact(), end_hit, 0.5)
    place(keys, supersaw([midi(x) for x in [n('D4'), n('F#4'), n('A4'), n('D5'), n('F#5')]], 1.6, decay=0.6), end_hit, 0.55)
    place(padbus, pad([midi(x) for x in [n('D3'), n('A3'), n('F#4')]], 1.8, 1800), end_hit, 0.6)
    for k, name in enumerate(['D6', 'F#6', 'A6', 'D7']):
        place(lead, bell(midi(n(name)), 2.0), end_hit + 0.06 * k, 0.5, -0.2 + 0.13 * k)

    # Sidechain: everything but the drums dips with each kick.
    sc = np.ones(L)
    t = np.arange(int(0.35 * SR)) / SR
    shape = 1 - 0.55 * np.exp(-t * 11)
    for k in kicks:
        i = int(k * SR)
        j = min(L, i + len(shape))
        sc[i:j] = np.minimum(sc[i:j], shape[: j - i])
    for bus in (bass, keys, padbus):
        bus *= sc[:, None]

    ir = reverb_ir(1.8)
    wet = reverb(keys * 0.35 + padbus * 0.3 + lead * 0.45 + drums * 0.08 + fx * 0.2, ir)
    mix = drums * 0.9 + bass * 0.85 + keys * 0.6 + padbus * 0.65 + lead * 0.7 + fx * 0.8 + wet * 0.55
    mix = sosfilt(butter(2, 30, 'highpass', fs=SR, output='sos'), mix, axis=0)
    return mix[: int(length * SR)]


# ── Effects on the visuals' moments ───────────────────────────────────────────

def sfx(length: float, lines: list[dict], cuts: list[float]) -> np.ndarray:
    L = int(length * SR)
    bus = np.zeros((L, 2))
    W = [ln['words'] for ln in lines]

    def ws(i, w):
        if isinstance(w, int):
            return W[i][min(w, len(W[i]) - 1)]['s']
        for x in W[i]:
            if norm(x['w']).startswith(w):
                return x['s']
        return W[i][0]['s']

    C = cuts
    # 1. Papers slap down, the red pen, "again?!", the clock.
    for k in range(3):
        place(bus, thud(), 0.05 + k * 0.11 + 0.12, 0.9 - k * 0.15, -0.2 + 0.2 * k)
    pen_at = max(ws(0, 'hours') + 0.12, 0.7)
    for at in (pen_at, pen_at + 0.3, pen_at + 0.6):
        place(bus, scribble(0.12), at, 0.9, 0.2)
        place(bus, scribble(0.12), at + 0.1, 0.8, 0.3)
    place(bus, scribble(0.45), ws(0, 'same'), 0.85, 0.35)
    place(bus, pop(520, 26), ws(0, 'same') + 0.32, 0.55, 0.4)
    place(bus, pop(900, 35), ws(0, 'hours') - 0.08, 0.35, 0.6)
    # 2. Wipe to yellow, the bird, "more" struck out.
    place(bus, whoosh(0.55), C[1] - 0.3, 0.7)
    place(bus, boing(), C[1] + 0.15, 0.6, 0.4)
    place(bus, scribble(0.3), ws(1, 'practice') + 0.28, 1.0, -0.1)
    # 3. The drop: circle wipe, RIGHT pops, sparkles fly.
    place(bus, whoosh(0.4), C[2] - 0.3, 0.6)
    place(bus, pop(420, 22), ws(2, 'right') - 0.02, 0.8)
    place(bus, sparkle(0.6), ws(2, 'right') + 0.05, 0.6)
    # 4. Swipe up to the test; the phone; FREE; taps; chips; the bird.
    place(bus, whoosh(0.5, up=False), C[3] - 0.3, 0.6)
    place(bus, whoosh(0.7), C[3] - 0.05, 0.35)
    place(bus, pop(700, 30), ws(3, 'free') + 0.05, 0.7, 0.5)
    span = max(2.6, C[4] - C[3])
    tap1 = C[3] + span * 0.36
    next1 = tap1 + 0.42
    tap2 = next1 + 0.62
    next2 = tap2 + 0.36
    for at in (tap1, next1, tap2, next2):
        place(bus, click(), at, 0.9)
    place(bus, whoosh(0.3), next1 + 0.02, 0.3)
    place(bus, pop(560, 30), ws(3, 'game') - 0.05, 0.6, -0.5)
    place(bus, boing(), ws(3, 'game') + 0.05, 0.5, 0.5)
    # 5. Zoom into the report; bars fill; chips; the pen circle; the focus pill.
    place(bus, whoosh(0.5), C[4] - 0.3, 0.6)
    for i in range(4):
        place(bus, tick(1300 + i * 220, 45), C[4] + 0.3 + i * 0.16, 0.5)
        place(bus, pop(820 + i * 90, 40), C[4] + 0.85 + i * 0.16, 0.4)
    place(bus, scribble(0.45), ws(4, 7), 0.85, -0.2)
    place(bus, pop(480, 25), ws(4, 7) + 0.28, 0.7, 0.3)
    # 6. Push to the papers; the button; papers; phone; printed pages.
    place(bus, whoosh(0.5), C[5] - 0.3, 0.6)
    tap_at = C[5] + 0.45
    place(bus, click(), tap_at, 1.0)
    place(bus, sparkle(0.45, n('A5')), tap_at + 0.08, 0.5)
    for k in range(1, 4):
        place(bus, pop(600 + 120 * k, 35), tap_at + 0.2 + k * 0.1, 0.45)
    place(bus, whoosh(0.5), ws(5, 'screen') - 0.5, 0.5, -0.4)
    place(bus, pop(640, 30), ws(5, 'screen') + 0.03, 0.55, -0.4)
    place(bus, whoosh(0.45), ws(5, 'printed') - 0.48, 0.45, 0.4)
    place(bus, thud(), ws(5, 'printed') - 0.12, 0.5, 0.4)
    place(bus, pop(760, 30), ws(5, 'printed') + 0.03, 0.55, 0.4)
    # 7. Green wipe; papers ticked; the bar fills; flip; confetti; trophy.
    place(bus, whoosh(0.5), C[6] - 0.3, 0.6)
    close_at = ws(6, 'gaps')
    for k in range(1, 4):
        at = C[6] + 0.25 + k * ((close_at + 0.3 - C[6] - 0.25) / 3.2)
        place(bus, pop(700 + 140 * k, 35), at + 0.05, 0.5)
    place(bus, ding(), close_at + 0.45, 0.7)
    place(bus, popper(), close_at + 0.48, 0.75)
    place(bus, boing(), close_at + 0.4, 0.45, -0.3)
    # 8. Blue wipe; the bird; the logo; the button; the tap.
    place(bus, whoosh(0.55), C[7] - 0.35, 0.65)
    place(bus, boing(), C[7] + 0.1, 0.5)
    place(bus, pop(600, 30), C[7] + 0.32, 0.55)
    place(bus, pop(500, 26), ws(7, 'try') - 0.02, 0.7)
    place(bus, click(), ws(7, 'now') + 0.05, 1.0)
    place(bus, sparkle(0.5, n('D6')), ws(7, 'now') + 0.1, 0.5)
    ir = reverb_ir(0.9, 0.01, 7000)
    return bus + reverb(bus, ir) * 0.25


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    from faster_whisper import WhisperModel

    asr = WhisperModel('small.en', device='cpu', compute_type='int8')
    vo = [load_vo(i) for i in range(1, 9)]
    words = [word_times(vo[i], SPOKEN.get(i, DISPLAY[i]), asr) for i in range(8)]

    # Place the lines: every cut on a beat, the voice LEAD after it.
    starts = [0.3]
    cuts = [0.0]
    for i in range(1, 8):
        earliest = starts[i - 1] + len(vo[i - 1]) / SR + GAP_AFTER[i - 1] - LEAD
        cut = math.ceil(earliest / BEAT - 1e-6) * BEAT
        if i == 2:  # the drop: start a bar here (bars are anchored to it)
            pass
        cuts.append(cut)
        starts.append(cut + LEAD)
    drop = cuts[2]
    last_end = starts[7] + len(vo[7]) / SR
    end_hit = math.ceil((last_end + 0.25) / BEAT) * BEAT
    length = round(end_hit + 2.6, 3)

    lines = []
    for i in range(8):
        disp = DISPLAY[i].split()
        spoken_times = words[i]
        idx = DISPLAY_TO_SPOKEN.get(i, list(range(len(disp))))
        ws_ = [{'w': disp[k], 's': round(starts[i] + spoken_times[min(idx[k], len(spoken_times) - 1)][0], 3), 'e': round(starts[i] + spoken_times[min(idx[k], len(spoken_times) - 1)][1], 3)} for k in range(len(disp))]
        lines.append({'start': round(starts[i], 3), 'end': round(starts[i] + len(vo[i]) / SR, 3), 'text': DISPLAY[i], 'words': ws_})
    timings = {'length': length, 'bpm': BPM, 'cuts': [round(c, 3) for c in cuts], 'endHit': end_hit, 'lines': lines}
    json.dump(timings, open(os.path.join(HERE, 'timings.json'), 'w'), indent=1)
    print('cuts', [round(c, 2) for c in cuts], 'drop', drop, 'end hit', end_hit, 'length', length)

    L = int(length * SR)
    voice = np.zeros((L, 2))
    for i in range(8):
        place(voice, process_vo(vo[i]), starts[i], 1.0)
    voice = voice + reverb(voice, reverb_ir(0.5, 0.008, 5000)) * 0.06

    music = score(length, drop, cuts, end_hit)
    effects = sfx(length, lines, cuts)

    # Duck the music under the voice.
    env = envelope(voice[:, 0], 0.03, 0.35)
    duck = 10 ** (-10.5 * np.clip(env / 0.06, 0, 1) / 20)
    bed = music * 0.55 * duck[:, None]
    mix = voice + bed + effects * 0.55
    rms = lambda x: 20 * math.log10(math.sqrt(np.mean(x ** 2)) + 1e-12)  # noqa: E731
    for i in range(8):
        a, b = int(starts[i] * SR), int((starts[i] + len(vo[i]) / SR) * SR)
        print(f'line {i + 1}: voice {rms(voice[a:b]):.1f} dB, music under it {rms(bed[a:b]):.1f} dB, effects {rms(effects[a:b] * 0.55):.1f} dB')

    def master(x, target=-14.0):
        x = np.tanh(x * 1.05) / 1.05
        x = x * 10 ** ((target - lufs(x)) / 20)
        x = limit(x, -1.0)
        x = x * 10 ** ((target - lufs(x)) / 20)
        return limit(x, -1.0)

    out = master(mix)
    fade = int(0.6 * SR)
    out[-fade:] *= np.linspace(1, 0, fade)[:, None]
    sf.write(os.path.join(HERE, 'ad-audio.wav'), out.astype(np.float32), SR, subtype='PCM_24')
    sf.write(os.path.join(HERE, 'music.wav'), master(music * 0.55).astype(np.float32), SR, subtype='PCM_24')
    sf.write(os.path.join(HERE, 'voice-sfx.wav'), master(voice + effects * 0.55).astype(np.float32), SR, subtype='PCM_24')
    print(f'mix {lufs(out):.1f} LUFS, peak {20 * math.log10(np.abs(out).max()):.1f} dBFS, {length:.2f}s')


if __name__ == '__main__':
    main()
