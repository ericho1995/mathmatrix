"""Voices the "gold star" reel in a bright, warm Australian female voice:
Chatterbox (Resemble AI, MIT licence) speaks each line in the voice of
voice-ref-au.wav (MeloTTS's EN-AU speaker, MIT licence), with a little more
expression than the earlier reels, because this one is a happy story.
Writes vo-1.wav ... vo-6.wav (16-bit); audio.py spaces them over the music.

Needs Python 3.10+ with `chatterbox-tts` and `setuptools<70`:

    python chatterbox_voice.py [--exaggeration 0.62] [--cfg 0.45] [--only 2 5]

Captions show "prepnest.com.au"; the voice is given the spelling it says right."""
import argparse
import os

import numpy as np
import soundfile as sf
import torch
from chatterbox.tts import ChatterboxTTS

HERE = os.path.dirname(os.path.abspath(__file__))
LINES = [
    'Some days, the test comes home covered in red.',
    'So we find out why. Our free test shows exactly which skills need work.',
    'Then practice papers on just those skills, one step at a time.',
    'Until the day it comes home with a gold star!',
    'And that proud smile says it all.',
    'Start with the free test, at prep nest dot com dot eh you.',
]

ap = argparse.ArgumentParser()
ap.add_argument('--ref', default=os.path.join(HERE, 'voice-ref-au.wav'))
ap.add_argument('--exaggeration', type=float, default=0.62)
ap.add_argument('--cfg', type=float, default=0.45)
ap.add_argument('--seed', type=int, default=11)
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
