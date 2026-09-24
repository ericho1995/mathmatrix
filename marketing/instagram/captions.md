# PrepNest Instagram: what to post and what to write

Images are in `export/`, rendered from `ads.html` by `render.mjs`. Every paper in
them is a real page from a free sample paper (`src/assets/samples`).

Copy rules for anything added here: "practice" for noun and verb (never
"practise"), "purchase" not "buy", no refund mentions, no testimonials or user
numbers, no promises about future papers.

## Profile

- Profile picture: `public/brand/prepnest-profile-1080.png`
- Logo: `public/brand/prepnest-logo-1080.png` (square, white) and
  `public/brand/prepnest-logo.png` (transparent, 2400×640)
- Bio link: https://prepnest.com.au

## Post 1: introduction (carousel)

Upload `intro-1.png` to `intro-5.png` in that order as one post. They are
1080×1350, Instagram's 4:5 portrait size, so nothing is cropped.

Caption:

```
Practice exams that feel like the real thing.

PrepNest papers are printable and set out like the real tests: NAPLAN-style Numeracy, Reading and Language Conventions, school-year papers from Grade 3 to Year 10, and VCE exams for Years 11 and 12.

Every paper comes with a separate answer key that explains each answer. Mark it in minutes, tap the questions that were wrong, and the topic report shows what to work on next.

Every subject at every year level has a free paper. No account needed to download or mark it.

Start tonight at prepnest.com.au (link in bio).

#NAPLAN #VCE #PracticeExams #NAPLANPractice #AustralianCurriculum
```

Alt text (Advanced settings, then Accessibility, one per image):

1. Practice exams that feel like the real thing. NAPLAN and VCE, Grade 3 to Year 12. Three printed pages fanned out: a Grade 5 Reading Magazine cover, a Numeracy page with a protractor question, and an answer key.
2. Laid out like the real test: timed sections, diagrams and graphs, pitched at each year level. A Grade 5 Numeracy page and a Language Conventions page.
3. Reading comes with a colour magazine: two booklets like the test, stories, reports and poems, sat on paper or on screen. The Grade 5 Reading Magazine cover and an inside page.
4. Mark it in minutes and see what to work on. A Grade 5 Maths answer key beside a results screen showing 23 out of 30, with topics ranked weakest first.
5. Start with a free paper tonight. Every subject at every year level has one, with its answer key, and no account is needed. prepnest.com.au

Story: `intro-story.png` (1080×1920). Add a Link sticker to
https://prepnest.com.au and place it on or just under the white button.

## Post 2: VCE countdown (carousel)

Upload `vce-1.png` to `vce-4.png` in that order. Post before 27 October 2026.

The countdown line reads "Under five weeks to go", worked out on 24 September
2026. It stays true until exams start, but for a sharper count on a later day
re-render first: `node marketing/instagram/render.mjs vce-1 vce-story`.

Caption:

```
VCE exams start 27 October. Under five weeks to go.

Slide 2 has every maths and physics exam date. Save this post so they're easy to find.

Our Year 12 practice exams are set out like the VCAA papers, with reading time and marks for every part. Each one comes with a marking guide that shows where every mark is earned.

Mathematical Methods: 10 exams
Specialist Mathematics: 10 exams
General Mathematics: 10 exams
Physics: 5 exams

The first practice exam in every subject is free. Sit it timed this weekend, then mark it.

prepnest.com.au/vce (link in bio)

#VCE #VCE2026 #MathsMethods #SpecialistMaths #VCEPhysics
```

Alt text:

1. VCE exams start 27 October. Under five weeks to go. A VCE Mathematical Methods Examination 1 practice page and its marking guide.
2. 2026 VCE exam dates, Melbourne time, reading time included. General Mathematics Exam 1, Friday 30 October, 2:00 to 3:45 pm. Exam 2, Monday 2 November, 2:00 to 3:45 pm. Mathematical Methods Exam 1, Thursday 5 November, 9:00 to 10:15 am. Exam 2, Friday 6 November, 11:45 am to 2:00 pm. Specialist Mathematics Exam 1, Monday 9 November, 9:00 to 10:15 am. Exam 2, Wednesday 11 November, 11:45 am to 2:00 pm. Physics, Thursday 12 November, 9:00 to 11:45 am.
3. Set out like the VCAA exams: reading time, marks for every part, and a marking guide with every exam. A Methods practice exam page beside its marking guide.
4. Start with a free exam. Mathematical Methods, Specialist Mathematics and General Mathematics have 10 exams each, and Physics has 5. prepnest.com.au/vce

Story: `vce-story.png`. Link sticker to https://prepnest.com.au/vce.

The dates come from `src/lib/examDates.ts` (VCAA 2026 timetable). Chemistry is
left off because there are no Year 12 Chemistry papers yet.
