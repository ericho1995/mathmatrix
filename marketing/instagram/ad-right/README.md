# The right practice (30 s Reels / TikTok ad)

A parent's problem in the first second ("Hours of practice. Same mistakes?"),
the turn ("They need the RIGHT practice"), then the product doing exactly that:
the free test on a phone, the report with the focus area circled, practice
papers on just those skills (on screen or printed), the gap closing, and the
call to action. Every screen is the real product with the sample child (Mia,
Grade 5 Maths); nothing is mocked up or generated.

## Files

| File | What it is |
|---|---|
| `../export-bird/reel-right-practice.mp4` | The ad: 1080×1920, 30 fps, motion blur, AAC 256k, about -14 LUFS |
| `../export-bird/reel-right-practice-cover.png` | Cover frame for the Reel / TikTok |
| `music.wav` | The score alone |
| `voice-sfx.wav` | Voice and sound effects without the score, to post with an in-app sound instead |

## Posting copy

**Instagram / Facebook caption**

> Hours of practice, and the same mistakes keep coming back? More practice is not the answer. The right practice is.
>
> PrepNest's free test shows which skills are strong and exactly which need work. Then practice papers are built on just those skills, on screen or printed. Grade 3 to Year 12.
>
> Try the free test now at prepnest.com.au

**TikTok caption**

> More practice isn't the answer. The right practice is. Try the free test now at prepnest.com.au #NAPLAN #VCE #maths #parenting #studytips

**Ad fields (Meta)**

- Primary text: Hours of practice, same mistakes? PrepNest's free test finds exactly which skills need work, then builds practice papers on just those.
- Headline: Try the free test now
- Description: Grade 3 to Year 12. No account needed to start.
- Call to action button: Learn more, linked to https://prepnest.com.au/diagnostic

Keep the bottom third clear of stickers or text when posting: the key words
and screens sit between 250 and 1250 px from the top, inside the Reels safe area.

## How it's made

1. `voice.py`: Chatterbox speaks each line in an Australian female voice
   (`voice-ref-au.wav`, MIT). Three takes per line; faster-whisper checks
   every take says the script, and the steadiest correct take wins
   (`takes.json`).
2. `audio.py`: word timings, cuts on the beat (120 BPM), the original score,
   the sound effects and the mix. Writes `timings.json`.
3. `src/app/dev/ad-right`: the ad as a function of time, drawn with the real
   components. `/dev/ad-right?play` plays it; `?t=12.5` holds a moment.
4. `render.mjs`: headless Edge renders each frame (two samples per frame
   for motion blur), and ffmpeg encodes it with the soundtrack.

```
python voice.py            # Python 3.10+: chatterbox-tts, "setuptools<70", faster-whisper
python audio.py
BASE=http://localhost:3000 FFMPEG=<ffmpeg> node marketing/instagram/ad-right/render.mjs
```
