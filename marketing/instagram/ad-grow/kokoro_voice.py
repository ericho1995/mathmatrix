"""Voices the "They grow up so quickly" reel with Kokoro (an open-weights,
Apache-2.0 text-to-speech model), one WAV per line: vo-1.wav ... vo-11.wav.
audio.py then spaces them over the score and writes timings.json.

Needs Python 3.10+ with `kokoro-onnx soundfile`, and the model files
kokoro-v1.0.onnx and voices-v1.0.bin (GitHub thewh1teagle/kokoro-onnx,
release model-files-v1.0) in KOKORO_DIR:

    KOKORO_DIR=path/to/models python kokoro_voice.py [--voice af_heart] [--speed 0.92]

Spoken text differs from the captions only where the voice needs help:
the brand as two words, and the web address spelled out."""
import argparse
import os

import soundfile as sf
from kokoro_onnx import Kokoro

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
ap.add_argument('--voice', default='af_heart')
ap.add_argument('--speed', type=float, default=0.92)
ap.add_argument('--out', default=HERE)
ap.add_argument('--phonemes', action='store_true', help='print each line as phonemes, to check pronunciation')
args = ap.parse_args()

models = os.environ.get('KOKORO_DIR', HERE)
kokoro = Kokoro(os.path.join(models, 'kokoro-v1.0.onnx'), os.path.join(models, 'voices-v1.0.bin'))
lang = 'en-gb' if args.voice.startswith('b') else 'en-us'
for i, text in enumerate(LINES, 1):
    if args.phonemes:
        print(i, kokoro.tokenizer.phonemize(text, lang))
    samples, sr = kokoro.create(text, voice=args.voice, speed=args.speed, lang=lang)
    sf.write(os.path.join(args.out, f'vo-{i}.wav'), samples, sr, subtype='PCM_16')
    print(f'vo-{i}.wav {len(samples) / sr:.2f}s')
