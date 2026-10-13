"""Builds the soundtrack for the "gold star" reel: six voice lines over an
original, upbeat score composed here (so it is owned outright), the music
easing under the voice. Writes ad-audio.wav (44.1 kHz stereo), music-only.wav
and timings.json (each line's start and end, and the length) for the animation.

The score: a strummed ukulele (Karplus-Strong plucked strings) and a
glockenspiel over C - G - Am - F at 104 bpm. It starts light while the red
marks come in, adds claps and bass as the practice papers stack up, lifts with
a cymbal swell and a glockenspiel run on "gold star", and ends on a bright
C major strum.

Run with a Python that has numpy and scipy (Anaconda), from this folder."""
import json
import wave

import numpy as np
from scipy.signal import fftconvolve, lfilter, resample_poly

SR = 44100
HERE = '.'
rng = np.random.default_rng(5)


def read_wav(path):
    with wave.open(path) as w:
        data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        if w.getnchannels() == 2:
            data = data.reshape(-1, 2).mean(axis=1)
        return data, w.getframerate()


def trim(x, sr, thresh=0.01):
    env = np.convolve(np.abs(x), np.ones(int(sr * 0.01)) / (sr * 0.01), mode='same')
    idx = np.where(env > thresh)[0]
    pad = int(sr * 0.04)
    return x[max(0, idx[0] - pad): min(len(x), idx[-1] + pad)]


def one_pole_lp(x, freq):
    k = np.exp(-2 * np.pi * freq / SR)
    return lfilter([1 - k], [1, -k], x)


def one_pole_hp(x, freq):
    return x - one_pole_lp(x, freq)


def reverb(x, seconds=1.6, wet=0.2):
    k = np.arange(int(SR * seconds)) / SR
    ir = rng.standard_normal(len(k)) * np.exp(-k * 6.9 / seconds)
    ir = one_pole_lp(ir, 5000)
    ir[: int(SR * 0.01)] = 0
    ir /= np.sqrt(np.sum(ir ** 2))
    return (1 - wet) * x + wet * fftconvolve(x, ir)[: len(x)]


# ── Voice ────────────────────────────────────────────────────────────────────
lines = []
for i in range(1, 7):
    x, sr = read_wav(f'{HERE}/vo-{i}.wav')
    x = resample_poly(trim(x, sr), SR, sr)
    lines.append(x / np.max(np.abs(x)) * 0.86)

# A beat between lines; a longer one before the gold star lands.
gaps = [0.55, 0.55, 0.8, 0.7, 0.6]
start = 0.9
timings = []
t = start
for i, l in enumerate(lines):
    timings.append({'line': i + 1, 'start': round(t, 3), 'end': round(t + len(l) / SR, 3)})
    t += len(l) / SR + (gaps[i] if i < len(gaps) else 0)
LENGTH = round(timings[-1]['end'] + 2.6, 1)
n = int(SR * LENGTH)

voice_dry = np.zeros(n)
for l, tm in zip(lines, timings):
    a = int(tm['start'] * SR)
    voice_dry[a: a + len(l)] += l
voice = reverb(voice_dry, seconds=0.7, wet=0.07)

# ── Instruments ──────────────────────────────────────────────────────────────
music = np.zeros(n)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def place(sig, at, gain=1.0):
    a = int(round(at * SR))
    if a >= n or a < 0:
        return
    end = min(n, a + len(sig))
    music[a:end] += gain * sig[: end - a]


_plucks = {}


def pluck(midi, dur=1.4):
    """A nylon-string pluck (Karplus-Strong), cached per pitch."""
    if midi not in _plucks:
        f = hz(midi)
        N = int(round(SR / f))
        L = int(SR * dur)
        x = np.zeros(L)
        x[:N] = one_pole_lp(rng.uniform(-1, 1, N), 3500)
        a = np.zeros(N + 2)
        a[0] = 1
        a[N] = -0.4985
        a[N + 1] = -0.4985
        y = lfilter([1.0], a, x)
        y *= np.minimum(1, (L - np.arange(L)) / (0.05 * SR))
        _plucks[midi] = y / (np.max(np.abs(y)) + 1e-9)
    return _plucks[midi]


def strum(chord, at, vel=0.5, up=False):
    notes = chord[::-1] if up else chord
    for k, m in enumerate(notes):
        place(pluck(m), at + k * 0.012, 0.11 * vel * (0.9 + 0.2 * rng.random()))


def glock(midi, at, vel=0.5, dur=1.6):
    f0 = hz(midi)
    k = np.arange(int(SR * dur)) / SR
    sig = np.sin(2 * np.pi * f0 * k) * np.exp(-k * 3.2)
    sig += 0.4 * np.sin(2 * np.pi * f0 * 2.76 * k) * np.exp(-k * 9)
    sig += 0.2 * np.sin(2 * np.pi * f0 * 5.4 * k) * np.exp(-k * 18)
    sig *= 1 - np.exp(-k * 800)
    place(sig, at, 0.12 * vel)


def bass(midi, at, vel=0.5, dur=0.5):
    f = hz(midi)
    k = np.arange(int(SR * dur)) / SR
    sig = (np.sin(2 * np.pi * f * k) + 0.25 * np.sin(4 * np.pi * f * k)) * np.exp(-k * 4) * (1 - np.exp(-k * 300))
    place(sig, at, 0.32 * vel)


def kick(at, vel=0.5):
    k = np.arange(int(SR * 0.3)) / SR
    f = 50 + 90 * np.exp(-k * 30)
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-k * 12)
    place(sig, at, 0.5 * vel)


def clap(at, vel=0.5):
    L = int(SR * 0.22)
    k = np.arange(L) / SR
    noise = one_pole_hp(one_pole_lp(rng.standard_normal(L), 3000), 700)
    env = np.zeros(L)
    for d in (0, 0.011, 0.022):
        env += (k >= d) * np.exp(-(k - d).clip(0) * (90 if d < 0.02 else 22))
    place(noise * env, at, 0.09 * vel)


def swell(at, dur=1.4, vel=0.5):
    """A cymbal swell into the gold star."""
    L = int(SR * dur)
    k = np.arange(L) / SR
    noise = one_pole_hp(rng.standard_normal(L), 4000)
    place(noise * (k / dur) ** 2.2, at - dur, 0.05 * vel)
    tail = int(SR * 1.8)
    kk = np.arange(tail) / SR
    place(one_pole_hp(rng.standard_normal(tail), 3000) * np.exp(-kk * 2.5), at, 0.05 * vel)


# ── The arrangement ──────────────────────────────────────────────────────────
BPM = 104
BEAT = 60 / BPM
BAR = 4 * BEAT
CHORDS = [  # (bass, ukulele voicing)
    (36, [67, 60, 64, 72]),  # C
    (43, [67, 62, 67, 71]),  # G
    (45, [69, 60, 64, 69]),  # Am
    (41, [69, 60, 65, 69]),  # F
]
S = [tm['start'] - 0.3 for tm in timings]  # each line's scene starts just before it
STAR = timings[3]['start'] + 0.8 * (timings[3]['end'] - timings[3]['start'])  # "...a gold star!"

# A happy little strum pattern per bar: down, down-up, up-down-up.
PATTERN = [(0, False, 1.0), (1, False, 0.7), (1.5, True, 0.55), (2.5, True, 0.6), (3, False, 0.75), (3.5, True, 0.55)]
bars = int(np.ceil(LENGTH / BAR))
for b in range(bars):
    t0 = b * BAR
    if t0 >= LENGTH - 1.2:
        break
    root, chord = CHORDS[b % 4]
    level = 0.55 if t0 < S[2] else 0.8 if t0 < STAR - 0.2 else 1.0
    for beat, up, v in PATTERN:
        strum(chord, t0 + beat * BEAT, level * v, up)
    if t0 >= S[2] - 0.1:
        bass(root, t0, level)
        bass(root + 7, t0 + 2 * BEAT, level * 0.8)
        clap(t0 + BEAT, level)
        clap(t0 + 3 * BEAT, level)
    if t0 >= STAR - 0.2:
        kick(t0, 0.8)
        kick(t0 + 2 * BEAT, 0.7)
        kick(t0 + 2.5 * BEAT, 0.45)

# The glockenspiel: a cheeky little figure at the start, a motif as the practice
# papers stack up, a run up to the gold star, and the tune again at the end.
for m, dt in [(76, 0), (79, 0.29), (84, 0.58)]:
    glock(m, 0.3 + dt, 0.5)
for k, m in enumerate([72, 74, 76, 79]):
    glock(m, S[2] + 0.4 + k * BEAT, 0.45)
swell(STAR, 1.3, 0.9)
for k, m in enumerate([72, 76, 79, 84, 88, 91]):
    glock(m, STAR - 0.6 + k * 0.1, 0.55 + 0.05 * k)
glock(96, STAR, 0.8, dur=2.4)
end_at = timings[-1]['end'] + 0.25
for k, m in enumerate([84, 88, 91, 96]):
    glock(m, end_at + k * 0.14, 0.6)
strum([60, 64, 67, 72], end_at + 0.6, 1.1)
bass(36, end_at + 0.6, 0.9, dur=1.6)

music = reverb(music, seconds=1.6, wet=0.18)
fade = np.ones(n)
fade[: int(SR * 0.25)] = np.linspace(0, 1, int(SR * 0.25))
fade[-int(SR * 1.2):] = np.linspace(1, 0, int(SR * 1.2)) ** 1.4
music *= fade
music /= np.max(np.abs(music))

# ── Mix ──────────────────────────────────────────────────────────────────────
speaking = np.convolve((np.abs(voice_dry) > 0.02).astype(float), np.ones(int(SR * 0.3)) / (SR * 0.3), mode='same')
speaking = one_pole_lp(np.clip(speaking * 4, 0, 1), 3)
duck = 0.42 - 0.22 * speaking
mix = voice + music * duck
mix /= max(1.0, np.max(np.abs(mix)) / 0.95)


def write(path, mono):
    st = np.stack([mono, mono], axis=1)
    pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


write(f'{HERE}/ad-audio.wav', mix)
write(f'{HERE}/music-only.wav', music * 0.42)
json.dump({'length': LENGTH, 'star': round(STAR, 3), 'lines': timings}, open(f'{HERE}/timings.json', 'w'), indent=2)
print(LENGTH, round(STAR, 2), [(tm['start'], tm['end']) for tm in timings])
