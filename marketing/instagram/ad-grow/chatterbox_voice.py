"""Voices the "They grow up so quickly" reel in an Australian female voice:
Chatterbox (Resemble AI, MIT licence) speaks each line in the voice of a short
reference clip, here voice-ref-au.wav (MeloTTS's EN-AU speaker, MIT licence).
Writes vo-1.wav ... vo-11.wav (16-bit); audio.py then spaces them over the score.

Needs Python 3.10+ with `chatterbox-tts` and `setuptools<70`:

    python chatterbox_voice.py [--ref voice-ref-au.wav] [--exaggeration 0.45] [--cfg 0.4]

Any other reference works the same way, e.g. a recording of a real voice,
used with that person's permission. Chatterbox adds an inaudible watermark."""
import argparse
import os

import numpy as np
import soundfile as sf
import torch
from chatterbox.tts import ChatterboxTTS

HERE = os.path.dirname(os.path.abspath(__file__))
LINES = [
    'They grow up so quickly.',
    "One day, it's counting on their fingers. The next, it's algebra you haven't seen in years.",
    'Between school runs, work and dinner, the weeks just fly by.',
    "And it's so easy to miss the quiet moment they start to fall behind.",
    'A topic that never quite clicked. A question they were too shy to ask.',
    'You wonder. Are they keeping up? Am I doing enough?',
    "Prep Nest helps you see what's really going on.",
    'Our free test shows exactly where your child needs help.',
    'Then their practice is made just for those skills.',
    'So nothing slips through the cracks, and they grow up confident.',
    'Try the free test now, at prep nest dot com dot eh you.',
]

ap = argparse.ArgumentParser()
ap.add_argument('--ref', default=os.path.join(HERE, 'voice-ref-au.wav'))
ap.add_argument('--exaggeration', type=float, default=0.45)
ap.add_argument('--cfg', type=float, default=0.4)
ap.add_argument('--seed', type=int, default=7)
ap.add_argument('--only', type=int, nargs='*', help='line numbers to (re)make')
ap.add_argument('--out', default=HERE)
args = ap.parse_args()

model = ChatterboxTTS.from_pretrained(device='cuda' if torch.cuda.is_available() else 'cpu')
for i, text in enumerate(LINES, 1):
    if args.only and i not in args.only:
        continue
    torch.manual_seed(args.seed + i)
    wav = model.generate(text, audio_prompt_path=args.ref, exaggeration=args.exaggeration, cfg_weight=args.cfg)
    samples = wav.squeeze(0).cpu().numpy()
    sf.write(os.path.join(args.out, f'vo-{i}.wav'), np.clip(samples, -1, 1), model.sr, subtype='PCM_16')
    print(f'vo-{i}.wav {len(samples) / model.sr:.2f}s', flush=True)
