"""Builds the soundtrack for the "They grow up so quickly" reel: eleven voice
lines, spaced with longer breaths at the tender moments, over an original
score composed here (so it is owned outright), the music easing under the
voice. Writes ad-audio.wav (44.1 kHz stereo), music-only.wav and
timings.json (each line's start and end, and the length) for the animation.

The score is a lullaby for parents: felt piano, a music box and soft strings
in F major. It is nostalgic while they grow up, darkens through the worries
(D minor, then an unresolved A) and lifts back to F when PrepNest comes in.

Run with a Python that has numpy and scipy (Anaconda), from this folder."""
import json
import wave

import numpy as np
from scipy.signal import fftconvolve, lfilter, resample_poly

SR = 44100
HERE = '.'
rng = np.random.default_rng(23)


def read_wav(path):
    with wave.open(path) as w:
        data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        if w.getnchannels() == 2:
            data = data.reshape(-1, 2).mean(axis=1)
        return data, w.getframerate()


def trim(x, sr, thresh=0.01):
    """Drops leading and trailing silence, keeping 40 ms either side."""
    env = np.convolve(np.abs(x), np.ones(int(sr * 0.01)) / (sr * 0.01), mode='same')
    idx = np.where(env > thresh)[0]
    pad = int(sr * 0.04)
    return x[max(0, idx[0] - pad): min(len(x), idx[-1] + pad)]


def shelf(x, freq, gain_db, high=False):
    """RBJ shelving biquad."""
    g = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * freq / SR
    alpha = np.sin(w0) / 2 * np.sqrt(2)
    cw = np.cos(w0)
    sq = 2 * np.sqrt(g) * alpha
    if not high:
        b = [g * ((g + 1) - (g - 1) * cw + sq), 2 * g * ((g - 1) - (g + 1) * cw), g * ((g + 1) - (g - 1) * cw - sq)]
        a = [(g + 1) + (g - 1) * cw + sq, -2 * ((g - 1) + (g + 1) * cw), (g + 1) + (g - 1) * cw - sq]
    else:
        b = [g * ((g + 1) + (g - 1) * cw + sq), -2 * g * ((g - 1) + (g + 1) * cw), g * ((g + 1) + (g - 1) * cw - sq)]
        a = [(g + 1) - (g - 1) * cw + sq, 2 * ((g - 1) - (g + 1) * cw), (g + 1) - (g - 1) * cw - sq]
    return lfilter(np.array(b) / a[0], np.array(a) / a[0], x)


def one_pole_lp(x, freq):
    k = np.exp(-2 * np.pi * freq / SR)
    return lfilter([1 - k], [1, -k], x)


def reverb(x, seconds=2.2, wet=0.25):
    """A soft room: exponentially decaying, darkened noise."""
    k = np.arange(int(SR * seconds)) / SR
    ir = rng.standard_normal(len(k)) * np.exp(-k * 6.9 / seconds)
    ir = one_pole_lp(ir, 3500)
    ir[: int(SR * 0.015)] = 0
    ir /= np.sqrt(np.sum(ir ** 2))
    return (1 - wet) * x + wet * fftconvolve(x, ir)[: len(x)]


# ── Voice: warm and close ────────────────────────────────────────────────────
lines = []
for i in range(1, 12):
    x, sr = read_wav(f'{HERE}/vo-{i}.wav')
    x = resample_poly(trim(x, sr), SR, sr)
    x = shelf(x, 200, 3.0)  # a little body
    x = shelf(x, 6500, -3.0, high=True)  # softer, less hiss
    lines.append(x / np.max(np.abs(x)) * 0.86)

# The breath after each line: longer after the first line, after the worries,
# and before PrepNest comes in.
gaps = [0.9, 0.6, 0.6, 0.6, 0.9, 1.2, 0.6, 0.6, 0.6, 0.8]
start = 0.6
timings = []
t = start
for i, l in enumerate(lines):
    timings.append({'line': i + 1, 'start': round(t, 3), 'end': round(t + len(l) / SR, 3)})
    t += len(l) / SR + (gaps[i] if i < len(gaps) else 0)
LENGTH = round(timings[-1]['end'] + 3.0, 1)
n = int(SR * LENGTH)

voice_dry = np.zeros(n)
for l, tm in zip(lines, timings):
    a = int(tm['start'] * SR)
    voice_dry[a: a + len(l)] += l
voice = reverb(voice_dry, seconds=0.8, wet=0.08)

# ── Music ────────────────────────────────────────────────────────────────────
music = np.zeros(n)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def place(sig, at, gain=1.0):
    a = int(at * SR)
    if a >= n or a < 0:
        return
    end = min(n, a + len(sig))
    music[a:end] += gain * sig[: end - a]


def piano(midi, dur=3.0, vel=0.5):
    """Felt piano: slightly stretched partials, the high ones dying first."""
    f0 = hz(midi)
    k = np.arange(int(SR * dur)) / SR
    sig = np.zeros(len(k))
    for p in range(1, 9):
        f = p * f0 * np.sqrt(1 + 0.0004 * p * p)
        if f > 9000:
            break
        sig += (1 / p ** 1.4) * np.exp(-k * (0.9 + 0.55 * p + f0 / 900)) * np.sin(2 * np.pi * f * k + rng.uniform(0, 6.28))
    env = (1 - np.exp(-k * 180)) * np.minimum(1, (dur - k) / 0.25)
    return 0.32 * vel ** 1.6 * env * one_pole_lp(sig, 1600 + 3000 * vel)


def music_box(midi, dur=2.2, vel=0.5):
    """A music-box tine: a pure tone with bright, quickly fading overtones."""
    f0 = hz(midi)
    k = np.arange(int(SR * dur)) / SR
    sig = np.sin(2 * np.pi * f0 * k) * np.exp(-k * 2.2)
    sig += 0.35 * np.sin(2 * np.pi * f0 * 5.4 * k) * np.exp(-k * 14)
    sig += 0.15 * np.sin(2 * np.pi * f0 * 8.9 * k) * np.exp(-k * 25)
    env = (1 - np.exp(-k * 900)) * np.minimum(1, (dur - k) / 0.2)
    return 0.16 * vel * env * sig


def strings(midis, dur, amp=0.05, attack=1.2):
    """A slow string pad: detuned voices with a gentle vibrato."""
    k = np.arange(int(SR * dur)) / SR
    env = np.minimum(1, k / attack) * np.minimum(1, (dur - k) / 1.0)
    sig = np.zeros(len(k))
    for m in midis:
        for detune in (-0.07, 0.0, 0.06):
            vib = 0.004 * np.sin(2 * np.pi * 5.0 * k + rng.uniform(0, 6.28)) * np.minimum(1, k / 1.5)
            ph = 2 * np.pi * hz(m + detune) * np.cumsum(1 + vib) / SR
            sig += sum(np.sin(h * ph) / h ** 1.2 for h in range(1, 6))
    return amp * env * one_pole_lp(sig, 2000) / len(midis)


CHORDS = {
    'F': (41, [53, 57, 60]), 'C/E': (40, [52, 55, 60]), 'Dm': (38, [50, 53, 57]), 'Bb': (34, [50, 53, 58]),
    'Gm': (43, [55, 58, 62]), 'Asus': (45, [57, 62, 64]), 'A': (45, [57, 61, 64]), 'C': (36, [52, 55, 60]),
    'Fmaj7': (41, [53, 57, 60, 64]),
}
# One or two chords per line: (chord, share of the line's section it starts at).
PLAN = [
    [('F', 0)],  # They grow up so quickly.
    [('C/E', 0), ('Dm', 0.5)],  # counting ... algebra
    [('Bb', 0), ('F', 0.55)],  # the weeks fly by
    [('Dm', 0)],  # fall behind
    [('Bb', 0), ('Gm', 0.5)],  # never quite clicked
    [('Asus', 0), ('A', 0.6)],  # Am I doing enough?
    [('F', 0)],  # PrepNest helps you see
    [('C', 0)],  # free test
    [('Dm', 0), ('Bb', 0.5)],  # practice made for them
    [('C', 0), ('F', 0.6)],  # grow up confident
    [('Fmaj7', 0)],  # Try the free test now
]
DARK = {3, 4, 5}  # quieter piano, lower strings
PULSE = 0.62  # a slow, steady broken-chord pulse

bounds = [0.0] + [tm['start'] - 0.2 for tm in timings[1:]] + [LENGTH]
for i, plan in enumerate(PLAN):
    a, b = bounds[i], bounds[i + 1]
    for j, (name, share) in enumerate(plan):
        ca = a + share * (b - a)
        cb = a + plan[j + 1][1] * (b - a) if j + 1 < len(plan) else b
        root, chord = CHORDS[name]
        dark = i in DARK
        place(strings(chord if not dark else [m - 12 for m in chord], cb - ca + 0.8, amp=0.04 if dark else 0.05, attack=1.4), ca)
        place(piano(root, 5, 0.4 if dark else 0.45), ca)
        pattern = [root + 12, chord[0], chord[1], chord[2] + 12 if len(chord) == 3 else chord[3], chord[1] + 12, chord[2]]
        k = 0
        tp = ca
        while tp < cb - 0.1:
            vel = (0.26 if dark else 0.32) + (0.06 if k % 6 == 0 else 0)
            place(piano(pattern[k % len(pattern)], 2.6, vel), tp)
            tp += PULSE
            k += 1

# The music box: a small "growing up" motif at the start, a few lone notes
# while the weeks fly by, and the motif again, complete, over the logo.
MOTIF = [(72, 0), (77, 0.62), (76, 1.24), (72, 1.86), (69, 2.48), (72, 3.1)]
for m, dt in MOTIF:
    place(music_box(m, vel=0.55), 0.15 + dt)
for dt, m in [(0.3, 84), (1.5, 81), (2.7, 79)]:
    place(music_box(m, vel=0.35), bounds[2] + dt)
end_motif = timings[-1]['end'] + 0.2
for m, dt in MOTIF[:-1] + [(77, 3.1)]:
    place(music_box(m, vel=0.6), end_motif - 3.4 + dt)
place(strings([41, 53, 57, 60, 65], LENGTH - (bounds[10] + 1), amp=0.06, attack=1.5), bounds[10] + 1)

music = reverb(music, seconds=2.8, wet=0.34)
fade = np.ones(n)
fade[: int(SR * 0.8)] = np.linspace(0, 1, int(SR * 0.8))
fade[-int(SR * 1.6):] = np.linspace(1, 0, int(SR * 1.6)) ** 1.5
music *= fade
music /= np.max(np.abs(music))

# ── Mix: the music eases under the voice, never pumping ──────────────────────
speaking = np.convolve((np.abs(voice_dry) > 0.02).astype(float), np.ones(int(SR * 0.3)) / (SR * 0.3), mode='same')
speaking = one_pole_lp(np.clip(speaking * 4, 0, 1), 2.5)
duck = 0.40 - 0.22 * speaking
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
write(f'{HERE}/music-only.wav', music * 0.40)
json.dump({'length': LENGTH, 'lines': timings}, open(f'{HERE}/timings.json', 'w'), indent=2)
print(LENGTH, [(tm['start'], tm['end']) for tm in timings])
