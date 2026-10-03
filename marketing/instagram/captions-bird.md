# Instagram launch set (the bird), October 2026

Rendered by `render-social.mjs` from the dev page `/dev/social/<id>` into
`export-bird/`. Every picture is the real product (the question screen, the
report, the bird) with a real free paper or the shared sample child, Mia.

Copy rules: no emoji, no em dashes, "practice" as the verb, "purchase" not
"buy", calls to action say "try ... now", no testimonials or usage numbers.

## Profile

- **Photo:** `profile-sun.png` (recommended; the yellow reads at 110 px), or `profile-sky.png`.
- **Name:** PrepNest
- **Bio:** Find exactly where your child needs help. Free diagnostic test, Grade 3 to Year 12. NAPLAN and VCE practice papers, on screen or printed.
- **Link:** https://prepnest.com.au/diagnostic?utm_source=instagram&utm_medium=social&utm_campaign=bio
- **Highlights:** Free test · NAPLAN · VCE · For parents

## Posts

### 1. Can your Grade 5 solve this? (carousel: puzzle-1, puzzle-2)

Caption:
Can your Grade 5 solve this? It is question 5 from our free Grade 5 practice paper. Put your answer in the comments, then swipe for the explanation.

The whole paper is free to sit on screen or print, with every answer explained. Link in bio.

#NAPLAN #NAPLAN2027 #Grade5 #MathsAtHome #ParentingAustralia #PrimarySchool #AustralianCurriculum

Alt text:
1. A protractor with one arm on the base line and the other pointing between 60 and 70 on the inner scale. The question asks the size of the angle, with options 60, 65, 115 and 125 degrees.
2. The answer is B, 65 degrees: start from the 0 on the arm along the base line and read that scale. 115 degrees comes from reading the other scale.

### 2. One short test. A clear picture. (carousel: report-1 to report-4)

Caption:
One short test, a clear picture. PrepNest's free diagnostic shows what your child knows, the exact skills to work on, and how sure we are about each result.

One wrong answer is never called a weakness: every area says whether it is a clear result, likely, or an early sign. Each area comes with three ways to help at home.

Try the free test now. Link in bio.

#NAPLAN #ParentingAustralia #MathsAtHome #LearningAtHome #PrimarySchool #HighSchool

Alt text:
1. The PrepNest bird with a magnifying glass under the words One short test. A clear picture.
2. A sample report for a made-up Grade 5 student, Mia: 17 of 32 correct, every maths area with a coloured bar and a level, weakest first.
3. The Geometry and Measurement area opened up: each skill marked right or wrong, what the area covers, and three ways to help at home.
4. The three levels of confidence: clear result, likely, and early sign, which is never called a weakness.

### 3. Sit it on screen. Show your working. (single: screen-1)

Post after PR #22 is live.

Caption:
Every PrepNest practice paper can be sat on screen, with a pad beside each question to draw or type working out, and a timer if you want one. Hand it in and every answer is explained, with how each topic went.

Prefer paper? Print it to do in your own time.

#NAPLAN #PracticeTest #MathsAtHome #ParentingAustralia #Grade5

Alt text: A Grade 5 question about T-shapes made from tiles, shown on screen with a timer, beside a Working out panel with notes: Design 1, 4 tiles; Design 2, 7 tiles; Design 3, 10 tiles; plus 3 each time.

### 4. Help at home: number patterns (single: tip-1)

Caption:
A 5-minute game for number patterns. Play "what's my rule?": you say 3, 7, 11 and they find the rule and the next number. Then swap roles.

Every area of your child's free PrepNest report comes with three tips like this one. Save this post for later.

#ParentingTips #MathsAtHome #LearningThroughPlay #PrimarySchool #ParentingAustralia

Alt text: A card titled Help at home, A 5-minute game for number patterns, with the tip, beside the PrepNest bird reading a book.

### 5. "I'm not sure" is a great answer (single: skip-1)

Caption:
"I'm not sure" is a great answer. In the PrepNest diagnostic, an honest skip tells us more than a lucky guess, so the report shows what your child really knows.

Answers your child marks as a guess, or taps in a couple of seconds, are not counted as evidence.

#GrowthMindset #ParentingAustralia #NAPLAN #LearningAtHome

Alt text: The PrepNest bird thinking, with a speech bubble: Take your time. Nobody expects you to know everything.

## Reel / TikTok ad (15 s, 1080×1920)

Files: `export-bird/reel-ad.mp4` (voice and music), `export-bird/reel-ad-music-only.mp4`
(for your own voiceover or the app's text-to-speech).

Script (voice: Microsoft Catherine, Australian, built into Windows):
1. Not sure where your child needs help?
2. Our free test finds the exact skills to work on.
3. Then practice papers target just those.
4. Try the free test now at prepnest.com.au.

Caption:
Not sure where your child needs help? PrepNest's free diagnostic test finds the exact skills to work on, then practice papers target just those, on screen or printed. Grade 3 to Year 12, no account to start. Try the free test now, link in bio.

#NAPLAN #ParentingAustralia #MathsAtHome #LearningAtHome #PrimarySchool #HighSchool

Rebuild: in `ad/`, run `tts.ps1` for each line (or replace `vo-1..4.wav` with your own
recordings), then `python audio.py` (music is composed in the script, so it is owned
outright). Start the dev server and run
`FFMPEG=<path> BASE=http://localhost:3000 node marketing/instagram/render-ad.mjs --audio=marketing/instagram/ad/ad-audio.wav`.
If the voice timings change, copy them from `timings.json` into `LINES` in `src/app/dev/ad/AdTimeline.tsx`.
