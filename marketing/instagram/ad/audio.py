"""Builds the 15-second ad soundtrack: the four voice lines, trimmed and spaced,
over an original score composed here (so it is owned outright), with the
music ducked under the voice. Writes ad-audio.wav (44.1 kHz stereo),
music-only.wav, and timings.json (when each line starts and ends) for the
animation to follow.

The score is slow and tender, for parents: soft felt piano and strings that
start in A minor (the worry), lift through F and C (the gap found and closed)
and resolve warmly in C major under the last line and the logo.

Run with a Python that has numpy and scipy (Anaconda), from this folder."""
import json
import wave

import numpy as np
from scipy.signal import fftconvolve, lfilter, resample_poly

SR = 44100
LENGTH = 15.0
HERE = '.'
rng = np.random.default_rng(11)


def read_wav(path):
    with wave.open(path) as w:
        data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        return data, w.getframerate()


def trim(x, sr, thresh=0.01):
    """Drops leading and trailing silence, keeping 40 ms either side."""
    env = np.convolve(np.abs(x), np.ones(int(sr * 0.01)) / (sr * 0.01), mode='same')
    idx = np.where(env > thresh)[0]
    pad = int(sr * 0.04)
    return x[max(0, idx[0] - pad): min(len(x), idx[-1] + pad)]


def low_shelf(x, freq, gain_db):
    """RBJ low-shelf biquad: a little chest in the voice."""
    g = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * freq / SR
    alpha = np.sin(w0) / 2 * np.sqrt(2)
    cw = np.cos(w0)
    sq = 2 * np.sqrt(g) * alpha
    b = [g * ((g + 1) - (g - 1) * cw + sq), 2 * g * ((g - 1) - (g + 1) * cw), g * ((g + 1) - (g - 1) * cw - sq)]
    a = [(g + 1) + (g - 1) * cw + sq, -2 * ((g - 1) + (g + 1) * cw), (g + 1) + (g - 1) * cw - sq]
    return lfilter(np.array(b) / a[0], np.array(a) / a[0], x)


def one_pole_lp(x, freq):
    k = np.exp(-2 * np.pi * freq / SR)
    return lfilter([1 - k], [1, -k], x)


def reverb(x, seconds=2.2, wet=0.25):
    """A soft hall: exponentially decaying, darkened noise."""
    k = np.arange(int(SR * seconds)) / SR
    ir = rng.standard_normal(len(k)) * np.exp(-k * 6.9 / seconds)
    ir = one_pole_lp(ir, 3500)
    ir[: int(SR * 0.012)] = 0  # pre-delay
    ir /= np.sqrt(np.sum(ir ** 2))
    tail = fftconvolve(x, ir)[: len(x)]
    return (1 - wet) * x + wet * tail


# ── Voice ────────────────────────────────────────────────────────────────────
lines = []
for i in range(1, 5):
    x, sr = read_wav(f'{HERE}/vo-{i}.wav')
    x = trim(x, sr)
    x = resample_poly(x, SR, sr)
    x = low_shelf(x, 180, 3.5)
    lines.append(x / np.max(np.abs(x)) * 0.89)

# A breath between lines, and a longer one before the last.
gaps = [0.45, 0.45, 0.6]
start = 0.4
voice_dry = np.zeros(int(SR * LENGTH))
timings = []
t = start
for i, l in enumerate(lines):
    a = int(t * SR)
    voice_dry[a: a + len(l)] += l[: len(voice_dry) - a]
    timings.append({'line': i + 1, 'start': round(t, 3), 'end': round(t + len(l) / SR, 3)})
    t += len(l) / SR + (gaps[i] if i < len(gaps) else 0)
assert timings[-1]['end'] < LENGTH - 1.2, 'voice runs into the ending'
voice = reverb(voice_dry, seconds=0.9, wet=0.09)

# ── Music ────────────────────────────────────────────────────────────────────
n = int(SR * LENGTH)
music = np.zeros(n)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def place(sig, at):
    a = int(at * SR)
    if a >= n:
        return
    end = min(n, a + len(sig))
    music[a:end] += sig[: end - a]


def piano(midi, dur=3.0, vel=0.5):
    """Felt piano: slightly stretched partials, the high ones dying first."""
    f0 = hz(midi)
    k = np.arange(int(SR * dur)) / SR
    sig = np.zeros(len(k))
    for p in range(1, 9):
        f = p * f0 * np.sqrt(1 + 0.0004 * p * p)
        if f > 9000:
            break
        decay = 0.9 + 0.55 * p + f0 / 900
        sig += (1 / p ** 1.4) * np.exp(-k * decay) * np.sin(2 * np.pi * f * k + rng.uniform(0, 6.28))
    attack = 1 - np.exp(-k * 180)
    release = np.minimum(1, (dur - k) / 0.25)
    soft = vel ** 1.6
    return 0.32 * soft * attack * release * one_pole_lp(sig, 1800 + 3000 * vel)  # softer is darker


def strings(midis, dur, amp=0.05, attack=1.2):
    """A slow string pad: detuned voices with a gentle vibrato."""
    k = np.arange(int(SR * dur)) / SR
    env = np.minimum(1, k / attack) * np.minimum(1, (dur - k) / 0.9)
    sig = np.zeros(len(k))
    for m in midis:
        for detune in (-0.07, 0.0, 0.06):
            f = hz(m + detune)
            vib = 0.004 * np.sin(2 * np.pi * 5.2 * k + rng.uniform(0, 6.28)) * np.minimum(1, k / 1.5)
            ph = 2 * np.pi * f * np.cumsum(1 + vib) / SR
            sig += sum(np.sin(h * ph) / h ** 1.2 for h in range(1, 6))
    return amp * env * one_pole_lp(sig, 2200) / len(midis)


# Sections follow the voice: a new chord just before each line begins.
s = [0.0] + [l['start'] - 0.15 for l in timings[1:]] + [LENGTH]
sections = [
    # (bass, string chord, piano broken chord, top note)
    (45, [57, 60, 64], [57, 64, 69, 71, 72, 71, 69, 64], 76),  # Am(add9): the worry
    (41, [57, 60, 65], [53, 60, 65, 67, 69, 67, 65, 60], 77),  # F: the gap
    (36, [55, 60, 64], [48, 55, 60, 64, 67, 64, 60, 55], 79),  # C, turning to G: found
    (36, [52, 55, 60, 64], [48, 55, 64, 67, 72, 67, 64, 60], 84),  # C, warmer and higher: believe
]
G_BROKEN = [43, 50, 55, 59, 62, 59, 55, 50]
for i, (root, chord, broken, top) in enumerate(sections):
    a, b = s[i], s[i + 1]
    seg = b - a
    last = i == len(sections) - 1
    if i == 2:
        mid = a + seg / 2
        place(strings(chord, mid - a + 0.4, amp=0.05), a)
        place(strings([55, 59, 62], b - mid + 0.6, amp=0.055, attack=0.6), mid)
        place(piano(31, 4, 0.45), mid)
    else:
        place(strings(chord, seg + 0.6, amp=0.045 if i < 2 else 0.06, attack=1.4 if i == 0 else 1.0), a)
    place(piano(root - 12 if i > 0 else root, 5, 0.42), a)  # a low bass note on each change
    place(piano(top, 4, 0.33), a + 0.02)
    step = (seg if not last else 2.6) / 8
    for e in range(8):
        notes = G_BROKEN if i == 2 and e >= 4 else broken
        place(piano(notes[e], 2.8, 0.30 if e % 4 else 0.38), a + e * step)
    if last:
        # After the voice: a small rising motif over the logo, then the held chord.
        m0 = timings[-1]['end'] + 0.15
        for m, dt in [(67, 0), (69, 0.38), (72, 0.76), (76, 1.3)]:
            place(piano(m, 3, 0.4), m0 + dt)
        place(strings([48, 60, 64, 67, 72], LENGTH - m0, amp=0.07, attack=0.8), m0)

# A soft swell of air into the last section.
k = np.arange(int(SR * 1.2)) / SR
place(one_pole_lp(rng.standard_normal(len(k)), 900) * (k / 1.2) ** 2 * 0.02, s[3] - 1.2)

music = reverb(music, seconds=2.6, wet=0.32)

# Fade in and out.
fade = np.ones(n)
fade[: int(SR * 0.6)] = np.linspace(0, 1, int(SR * 0.6))
fade[-int(SR * 1.0):] = np.linspace(1, 0, int(SR * 1.0)) ** 1.5
music *= fade
music /= np.max(np.abs(music))

# ── Mix: music ducks gently under the voice ──────────────────────────────────
speaking = np.convolve((np.abs(voice_dry) > 0.02).astype(float), np.ones(int(SR * 0.3)) / (SR * 0.3), mode='same')
speaking = one_pole_lp(np.clip(speaking * 4, 0, 1), 3)  # slow, so it never pumps
duck = 0.42 - 0.24 * speaking  # 0.42 alone, 0.18 under the voice
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
json.dump({'length': LENGTH, 'lines': timings}, open(f'{HERE}/timings.json', 'w'), indent=2)
print(json.dumps(timings, indent=2))
