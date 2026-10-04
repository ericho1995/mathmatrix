"""Voices "The right practice" reel in a warm, confident Australian female
voice: Chatterbox (Resemble AI, MIT licence) speaks each line in the voice of
voice-ref-au.wav (MeloTTS's EN-AU speaker, MIT licence).

Every line is spoken in several takes (different seeds). Each take is
transcribed with faster-whisper and scored: the words must match the script,
and among the takes that do, the one closest to the median length wins (no
rushed or dragged reads). Writes takes/vo-<line>-<take>.wav, the chosen
vo-<line>.wav files and takes.json with every score.

Needs Python 3.10+ with chatterbox-tts, "setuptools<70", soundfile and
faster-whisper:

    python voice.py [--takes 3] [--only 1 4] [--exaggeration 0.58] [--cfg 0.42]

Captions show "PrepNest" and "prepnest.com.au"; the voice is given the
spelling it says right.
"""
import argparse
import json
import os
import re

import numpy as np
import soundfile as sf
import torch
from chatterbox.tts import ChatterboxTTS
from scipy.signal import resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))

# (spoken text, the words a listener should hear)
LINES = [
    ('Hours of practice. Same mistakes?', 'hours of practice same mistakes'),
    ("Maybe they don't need more practice.", 'maybe they dont need more practice'),
    ('They need the right practice.', 'they need the right practice'),
    ("Start with Prep Nest's free test. It feels like a game.", 'start with prep nests free test it feels like a game'),
    ('It shows which skills are strong, and exactly which need work.', 'it shows which skills are strong and exactly which need work'),
    ('Then practice papers on just those skills. On screen, or printed.', 'then practice papers on just those skills on screen or printed'),
    ('So you can watch the gaps close.', 'so you can watch the gaps close'),
    ('Try the free test now, at prep nest dot com dot eh you.', 'try the free test now at prep nest dot com dot au'),
]


def words(s: str) -> list[str]:
    s = s.lower().replace('prepnest', 'prep nest').replace('.com.au', ' dot com dot au').replace("'", '')
    s = re.sub(r'\beh you\b|\ba u\b|\bay you\b', 'au', s)
    return re.findall(r'[a-z]+', s)


def word_error(ref: list[str], hyp: list[str]) -> float:
    d = list(range(len(hyp) + 1))
    for i, r in enumerate(ref, 1):
        prev, d[0] = d[0], i
        for j, h in enumerate(hyp, 1):
            prev, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, prev + (r != h))
    return d[len(hyp)] / max(1, len(ref))


def trim(x: np.ndarray, sr: int) -> np.ndarray:
    """Cut leading/trailing silence, keeping 40 ms of air either side."""
    env = np.convolve(np.abs(x), np.ones(int(sr * 0.01)) / int(sr * 0.01), mode='same')
    on = np.where(env > 0.012)[0]
    if not len(on):
        return x
    pad = int(sr * 0.04)
    return x[max(0, on[0] - pad): min(len(x), on[-1] + pad)]


ap = argparse.ArgumentParser()
ap.add_argument('--ref', default=os.path.join(HERE, 'voice-ref-au.wav'))
ap.add_argument('--exaggeration', type=float, default=0.58)
ap.add_argument('--cfg', type=float, default=0.42)
ap.add_argument('--takes', type=int, default=3)
ap.add_argument('--seed', type=int, default=7)
ap.add_argument('--only', type=int, nargs='*', help='line numbers to (re)make')
args = ap.parse_args()

os.makedirs(os.path.join(HERE, 'takes'), exist_ok=True)
model = ChatterboxTTS.from_pretrained(device='cpu')
from faster_whisper import WhisperModel  # noqa: E402  (after torch, to keep its DLLs happy)

asr = WhisperModel('small.en', device='cpu', compute_type='int8')
report_path = os.path.join(HERE, 'takes.json')
report = json.load(open(report_path)) if os.path.exists(report_path) else {}

for i, (text, heard) in enumerate(LINES, 1):
    if args.only and i not in args.only:
        continue
    takes = []
    for k in range(1, args.takes + 1):
        torch.manual_seed(args.seed * 100 + i * 10 + k)
        wav = model.generate(text, audio_prompt_path=args.ref, exaggeration=args.exaggeration, cfg_weight=args.cfg)
        x = trim(np.clip(wav.squeeze(0).cpu().numpy(), -1, 1), model.sr)
        path = os.path.join(HERE, 'takes', f'vo-{i}-{k}.wav')
        sf.write(path, x, model.sr, subtype='PCM_16')
        # Given as 16 kHz samples: this PyAV build cannot open files for faster-whisper.
        segs, _ = asr.transcribe(resample_poly(x, 16000, model.sr).astype(np.float32), beam_size=5, language='en')
        said = ' '.join(s.text for s in segs).strip()
        wer = word_error(words(heard), words(said))
        takes.append({'take': k, 'seconds': round(len(x) / model.sr, 2), 'heard': said, 'wer': round(wer, 3)})
        print(f'line {i} take {k}: {len(x) / model.sr:.2f}s wer {wer:.2f} "{said}"', flush=True)
    good = [t for t in takes if t['wer'] <= 0.1] or sorted(takes, key=lambda t: t['wer'])[:1]
    med = float(np.median([t['seconds'] for t in good]))
    best = min(good, key=lambda t: abs(t['seconds'] - med))
    x, sr = sf.read(os.path.join(HERE, 'takes', f'vo-{i}-{best["take"]}.wav'))
    sf.write(os.path.join(HERE, f'vo-{i}.wav'), x, sr, subtype='PCM_16')
    report[str(i)] = {'text': text, 'chosen': best['take'], 'takes': takes}
    json.dump(report, open(report_path, 'w'), indent=2)
    print(f'line {i}: chose take {best["take"]} ({best["seconds"]}s)', flush=True)
