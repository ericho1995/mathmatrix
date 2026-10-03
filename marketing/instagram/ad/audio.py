"""Builds the 15-second ad soundtrack: the four voice lines, trimmed and spaced,
over an original backing track composed here (so it is owned outright), with
the music ducked under the voice. Writes ad-audio.wav (44.1 kHz stereo),
music-only.wav, and timings.json (when each line starts and ends) for the
animation to follow."""
import json
import wave

import numpy as np
from scipy.signal import resample_poly

SR = 44100
LENGTH = 15.0
HERE = '.'


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


# ── Voice ────────────────────────────────────────────────────────────────────
lines = []
for i in range(1, 5):
    x, sr = read_wav(f'{HERE}/vo-{i}.wav')
    x = trim(x, sr)
    x = resample_poly(x, SR, sr)
    lines.append(x / np.max(np.abs(x)) * 0.89)

gap = 0.7
total_voice = sum(len(l) for l in lines) / SR + gap * 3
start = 0.4
# Leave a beat at the end for the logo and button; squeeze the gaps if needed.
if start + total_voice > LENGTH - 0.6:
    gap = max(0.12, (LENGTH - 0.6 - start - sum(len(l) for l in lines) / SR) / 3)

voice = np.zeros(int(SR * LENGTH))
timings = []
t = start
for i, l in enumerate(lines):
    a = int(t * SR)
    voice[a: a + len(l)] += l[: len(voice) - a]
    timings.append({'line': i + 1, 'start': round(t, 3), 'end': round(t + len(l) / SR, 3)})
    t += len(l) / SR + gap

# ── Music: an original, light marimba-and-bass loop in C major, 112 bpm ──────
BPM = 112
beat = 60 / BPM
n = int(SR * LENGTH)
music = np.zeros(n)
tt = np.arange(n) / SR


def note_freq(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def place(sig, at):
    a = int(at * SR)
    if a >= n:
        return
    end = min(n, a + len(sig))
    music[a:end] += sig[: end - a]


def marimba(midi, dur=0.45, amp=0.22):
    f = note_freq(midi)
    k = np.arange(int(SR * dur)) / SR
    env = np.exp(-k * 9) * (1 - np.exp(-k * 400))
    tone = np.sin(2 * np.pi * f * k) + 0.35 * np.sin(2 * np.pi * f * 3.9 * k) * np.exp(-k * 30)
    return amp * env * tone


def bass(midi, dur=beat * 0.9, amp=0.28):
    f = note_freq(midi)
    k = np.arange(int(SR * dur)) / SR
    env = np.exp(-k * 3.5) * (1 - np.exp(-k * 200))
    return amp * env * (np.sin(2 * np.pi * f * k) + 0.25 * np.sin(4 * np.pi * f * k))


def pad(midis, dur, amp=0.05):
    k = np.arange(int(SR * dur)) / SR
    env = np.minimum(1, k / 0.35) * np.minimum(1, (dur - k) / 0.35)
    sig = sum(np.sin(2 * np.pi * note_freq(m) * k) + 0.3 * np.sin(2 * np.pi * note_freq(m) * 2.003 * k) for m in midis)
    return amp * env * sig


def shaker(amp=0.025, dur=0.06):
    k = np.arange(int(SR * dur)) / SR
    noise = np.random.default_rng(7).standard_normal(len(k))
    noise = np.diff(np.concatenate([[0], noise]))  # brighter
    return amp * noise * np.exp(-k * 60)


# C, G, Am, F; one bar (4 beats) each.
progression = [
    (48, [60, 64, 67], [72, 76, 79, 76, 72, 76, 79, 84]),
    (43, [59, 62, 67], [71, 74, 79, 74, 71, 74, 79, 83]),
    (45, [60, 64, 69], [72, 76, 81, 76, 72, 76, 81, 84]),
    (41, [60, 65, 69], [72, 77, 81, 77, 72, 77, 81, 84]),
]
bar = beat * 4
bars = int(np.ceil(LENGTH / bar))
for b in range(bars):
    root, chord, arp = progression[b % 4]
    t0 = b * bar
    place(pad(chord, bar), t0)
    for q in range(4):
        place(bass(root if q % 2 == 0 else root + 7), t0 + q * beat)
    for e, m in enumerate(arp):
        place(marimba(m, amp=0.2 if e % 2 == 0 else 0.13), t0 + e * beat / 2)
    for e in range(8):
        place(shaker(amp=0.03 if e % 2 else 0.015), t0 + e * beat / 2 + beat / 4)

# A bright resolving chord for the logo.
end_hit = LENGTH - 2.2
place(pad([60, 64, 67, 72], 2.2, amp=0.09), end_hit)
for i, m in enumerate([72, 76, 79, 84]):
    place(marimba(m, dur=1.4, amp=0.22), end_hit + i * 0.06)

# Fade in and out.
fade = np.ones(n)
fade[: int(SR * 0.3)] = np.linspace(0, 1, int(SR * 0.3))
fade[-int(SR * 0.8):] = np.linspace(1, 0, int(SR * 0.8))
music *= fade
music /= np.max(np.abs(music))

# ── Mix: music ducks under the voice ─────────────────────────────────────────
speaking = np.convolve((np.abs(voice) > 0.02).astype(float), np.ones(int(SR * 0.25)) / (SR * 0.25), mode='same')
speaking = np.clip(speaking * 4, 0, 1)
duck = 0.32 - 0.2 * speaking  # 0.32 alone, 0.12 under the voice
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
write(f'{HERE}/music-only.wav', music * 0.32)
json.dump({'length': LENGTH, 'lines': timings}, open(f'{HERE}/timings.json', 'w'), indent=2)
print(json.dumps(timings, indent=2))
