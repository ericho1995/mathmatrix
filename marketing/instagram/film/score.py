"""The score for "Gold star", the wordless short film (src/app/dev/ad-film).

No narration: the music carries the story, scene by scene, on the film's own
timeline (FilmTimeline.tsx SCENES). Original, composed here, so it is owned
outright: felt piano, strings and a music box, with a few sounds from the
world of the film (a test being crumpled, a kitchen clock, the school bell).

  0-6    night outside       a lone music box, the theme
  6-19   the bedroom         A minor piano; the crumple; strings rise as the door opens
  19-29  the kitchen, late   low strings, the clock ticking; a sparkle as PrepNest appears
  29-38  weeks of practice   piano arpeggios, hopeful, building (F - G - Am - C)
  38-45  the classroom       the bell; suspense; a big C major on the A+
  45-52  home                full and joyful; warm on the hug
  52-56  end card            the theme again, resolved

Run with a Python that has numpy and scipy (Anaconda), from this folder.
Writes film-audio.wav (44.1 kHz stereo)."""
import wave

import numpy as np
from scipy.signal import fftconvolve, lfilter

SR = 44100
LENGTH = 56.0
n = int(SR * LENGTH)
rng = np.random.default_rng(31)
music = np.zeros(n)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, freq):
    k = np.exp(-2 * np.pi * freq / SR)
    return lfilter([1 - k], [1, -k], x)


def hp(x, freq):
    return x - lp(x, freq)


def place(sig, at, gain=1.0):
    a = int(round(at * SR))
    if a >= n or a < 0:
        return
    e = min(n, a + len(sig))
    music[a:e] += gain * sig[: e - a]


def piano(m, at, vel=0.5, dur=3.5):
    f0 = hz(m)
    k = np.arange(int(SR * dur)) / SR
    sig = np.zeros(len(k))
    for p in range(1, 9):
        f = p * f0 * np.sqrt(1 + 0.0004 * p * p)
        if f > 9000:
            break
        sig += (1 / p ** 1.4) * np.exp(-k * (0.8 + 0.5 * p + f0 / 900)) * np.sin(2 * np.pi * f * k + rng.uniform(0, 6.28))
    env = (1 - np.exp(-k * 180)) * np.minimum(1, (dur - k) / 0.3)
    place(0.3 * vel ** 1.5 * env * lp(sig, 1500 + 3500 * vel), at)


def strings(ms, at, dur, amp=0.05, attack=1.4, release=1.2):
    k = np.arange(int(SR * dur)) / SR
    env = np.minimum(1, k / attack) * np.minimum(1, (dur - k) / release)
    sig = np.zeros(len(k))
    for m in ms:
        for det in (-0.07, 0.0, 0.06):
            vib = 0.004 * np.sin(2 * np.pi * 5.0 * k + rng.uniform(0, 6.28)) * np.minimum(1, k / 1.5)
            ph = 2 * np.pi * hz(m + det) * np.cumsum(1 + vib) / SR
            sig += sum(np.sin(h * ph) / h ** 1.2 for h in range(1, 6))
    place(amp * env * lp(sig, 2200) / len(ms), at)


def box(m, at, vel=0.5, dur=2.4):
    f0 = hz(m)
    k = np.arange(int(SR * dur)) / SR
    sig = np.sin(2 * np.pi * f0 * k) * np.exp(-k * 2.2) + 0.35 * np.sin(2 * np.pi * f0 * 5.4 * k) * np.exp(-k * 14) + 0.15 * np.sin(2 * np.pi * f0 * 8.9 * k) * np.exp(-k * 25)
    place(0.15 * vel * (1 - np.exp(-k * 900)) * np.minimum(1, (dur - k) / 0.2) * sig, at)


def bell(at, vel=0.6, dur=3.0):
    """A school bell: two bright strikes."""
    for s in (0, 0.18, 0.36, 0.54):
        k = np.arange(int(SR * dur)) / SR
        f0 = 1240
        sig = sum(a * np.sin(2 * np.pi * f0 * r * k) * np.exp(-k * d) for a, r, d in [(1, 1, 3), (0.5, 2.76, 6), (0.3, 5.4, 10), (0.2, 0.5, 2)])
        place(0.05 * vel * sig, at + s)


def tick(at, vel=0.5):
    k = np.arange(int(SR * 0.03)) / SR
    place(0.05 * vel * hp(rng.standard_normal(len(k)), 2000) * np.exp(-k * 300), at)


def crumple(at, dur=0.9):
    """Paper crumpling: bursts of crackle."""
    L = int(SR * dur)
    sig = np.zeros(L)
    for _ in range(70):
        a = int(rng.uniform(0, L - 2000))
        w = int(rng.uniform(150, 900))
        sig[a:a + w] += rng.standard_normal(w) * np.exp(-np.arange(w) / (w / 4)) * rng.uniform(0.3, 1)
    place(0.06 * hp(lp(sig, 7000), 900), at)


def swell(at, dur=1.4, vel=0.6):
    L = int(SR * dur)
    k = np.arange(L) / SR
    place(hp(rng.standard_normal(L), 4500) * (k / dur) ** 2.4 * 0.04 * vel, at - dur)


def broken(chord, at, until, step, vel):
    """A broken-chord pattern over [at, until)."""
    k = 0
    t = at
    while t < until - 0.05:
        piano(chord[k % len(chord)], t, vel * (1.15 if k % 4 == 0 else 1))
        t += step
        k += 1


THEME = [(76, 0), (79, 0.6), (77, 1.2), (76, 1.8), (72, 2.4), (74, 3.0), (76, 3.9)]

# 0-6: night. The theme on the music box, alone, then a low string.
for m, dt in THEME:
    box(m, 0.8 + dt, 0.55)
strings([45, 57], 2.5, 4.2, 0.035, attack=2.0)

# 6-19: the bedroom. A minor, sparse and tender.
for at, (root, ch) in zip([6.0, 9.2, 12.4, 15.6], [(45, [57, 60, 64, 69]), (41, [57, 60, 65, 69]), (48, [55, 60, 64, 67]), (43, [55, 59, 62, 67])]):
    piano(root - 12 if root > 44 else root, at, 0.4, 5)
    broken(ch, at, at + 3.2, 0.8, 0.28)
    strings(ch[:3], at, 3.6, 0.03)
crumple(10.6)
strings([57, 64, 69, 72], 13.0, 6.4, 0.06, attack=2.2)  # the door opens; the parent comes in
box(81, 16.9, 0.35)  # the hand on the shoulder

# 19-29: the kitchen, late. Low strings and the clock; then hope.
strings([38, 50, 57], 19.0, 5.6, 0.05, attack=1.5)
for s in np.arange(19.4, 28.8, 1.0):
    tick(s, 0.6 if s < 24 else 0.35)
piano(50, 19.4, 0.35, 5)
piano(53, 21.8, 0.3, 4)
swell(24.0, 1.2, 0.5)
for k, m in enumerate([72, 76, 79, 84, 88]):  # PrepNest on the screen
    box(m, 24.0 + k * 0.09, 0.5)
strings([53, 60, 65, 69], 24.0, 5.4, 0.06, attack=1.2)
broken([65, 69, 72, 77], 24.4, 29.0, 0.55, 0.26)

# 29-38: weeks of practice. Hopeful, building: F - G - Am - C.
prog_ = [(41, [65, 69, 72, 77]), (43, [67, 71, 74, 79]), (45, [69, 72, 76, 81]), (36, [67, 72, 76, 79])]
for k, (root, ch) in enumerate(prog_):
    at = 29.0 + k * 2.25
    piano(root, at, 0.45, 3)
    broken(ch, at, at + 2.25, 0.28, 0.28 + 0.04 * k)
    strings([c - 12 for c in ch[:3]], at, 2.6, 0.04 + 0.01 * k)
for m, dt in THEME[:5]:
    box(m + 12, 30.0 + dt * 1.2, 0.3)

# 38-45: the classroom. The bell; suspense on G; the A+ in C major.
bell(38.2)
strings([55, 62, 67], 38.6, 3.8, 0.05, attack=2.5)
for s in np.arange(39.0, 42.4, 0.35):
    piano(43 if int(s * 10) % 2 else 50, s, 0.24, 1.2)
swell(42.5, 1.6, 0.9)
piano(36, 42.5, 0.7, 5)
piano(48, 42.5, 0.6, 5)
strings([48, 60, 64, 67, 72], 42.5, 4.0, 0.09, attack=0.3)
for k, m in enumerate([72, 76, 79, 84, 88, 91]):
    box(m, 42.5 + k * 0.08, 0.6)
box(96, 43.0, 0.7, 3)  # the gold star
broken([72, 76, 79, 84], 43.2, 45.4, 0.22, 0.34)

# 45-52: home. Full and joyful, warm on the hug.
for k, (root, ch) in enumerate([(36, [72, 76, 79, 84]), (43, [71, 74, 79, 83]), (41, [72, 77, 81, 84])]):
    at = 45.0 + k * 1.3
    piano(root, at, 0.5, 2.5)
    broken(ch, at, at + 1.3, 0.2, 0.34)
strings([53, 60, 65, 69], 45.0, 3.9, 0.06, attack=0.8)
strings([48, 55, 60, 64, 67], 48.9, 4.6, 0.09, attack=1.0)  # the hug
piano(36, 48.9, 0.55, 5)
for m, dt in THEME:
    box(m + 12, 50.2 + dt * 0.5, 0.45)  # the bird across the sky

# 52-56: the end card. The theme, resolved.
strings([48, 60, 64, 67, 72], 52.0, 4.0, 0.07, attack=0.6, release=2.0)
for m, dt in [(76, 0), (79, 0.5), (84, 1.0), (88, 1.7)]:
    box(m, 52.3 + dt, 0.55)
piano(48, 52.2, 0.45, 4)
piano(64, 52.2, 0.35, 4)


def reverb(x, seconds=2.6, wet=0.32):
    k = np.arange(int(SR * seconds)) / SR
    ir = lp(rng.standard_normal(len(k)) * np.exp(-k * 6.9 / seconds), 3600)
    ir[: int(SR * 0.015)] = 0
    ir /= np.sqrt(np.sum(ir ** 2))
    return (1 - wet) * x + wet * fftconvolve(x, ir)[: len(x)]


mix = reverb(music)
fade = np.ones(n)
fade[: int(SR * 0.6)] = np.linspace(0, 1, int(SR * 0.6))
fade[-int(SR * 1.6):] = np.linspace(1, 0, int(SR * 1.6)) ** 1.5
mix *= fade
mix /= np.max(np.abs(mix)) / 0.9
st = np.stack([mix, mix], axis=1)
with wave.open('film-audio.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
print('wrote film-audio.wav', LENGTH, 's; rms by 4 s:', [round(float(np.sqrt(np.mean(mix[i:i + SR * 4] ** 2))), 3) for i in range(0, n, SR * 4)])
