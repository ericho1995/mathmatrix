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

Try one now at prepnest.com.au (link in bio).

#NAPLAN #VCE #PracticeExams #NAPLANPractice #AustralianCurriculum
```

Alt text (Advanced settings, then Accessibility, one per image):

1. Practice exams that feel like the real thing. NAPLAN and VCE, Grade 3 to Year 12. Three printed pages fanned out: a Grade 5 Reading Magazine cover, a Numeracy page with a protractor question, and an answer key.
2. Laid out like the real test: timed sections, diagrams and graphs, pitched at each year level. A Grade 5 Numeracy page and a Language Conventions page.
3. Reading comes with a colour magazine: two booklets like the test, stories, reports and poems, sat on paper or on screen. The Grade 5 Reading Magazine cover and an inside page.
4. Mark it in minutes and see what to work on. A Grade 5 Maths answer key beside a results screen showing 23 out of 30, with topics ranked weakest first.
5. Try a free paper now. Every subject at every year level has one, with its answer key, and no account is needed. prepnest.com.au

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

The first practice exam in every subject is free. Try it now: sit it timed, then mark it.

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

## Second set: one graphic idea per post

Each post below uses a different look so the grid doesn't repeat. The paper
crops come from the free sample PDFs (downloaded from prepnest.com.au, rendered
into `assets/pages/`). The large type repeats what the paper and answer key say,
word for word where it quotes them, because a straight crop is too small to read
on a phone.

Space these out: one or two a week reads better than all at once. Post 4 and
Post 5 mention VCE dates, so post them before 27 October.

### Post 3: Year 9 question (carousel, exercise-book look)

Upload `q9-1.png` then `q9-2.png`.

```
Up 10%, then down 10%. Is it back to $600?

This is question 28 from our free Maths Year 9 paper, no calculator allowed. Have a go before you swipe.

Every question in the paper comes with an explanation like the one on slide 2, so marking it shows why an answer is right, not just whether it is.

Try the full paper free now at prepnest.com.au (link in bio).

#NAPLAN #Year9 #NAPLANPractice #Numeracy #MathsChallenge
```

Alt text:

1. Year 9 Numeracy, no calculator. Up 10%, down 10%, back to $600? A $600 television rises in price by 10%. The new price then falls by 10%. What is the final price? A $540, B $594, C $600, D $606. Below, the same question as it appears in the printed paper.
2. The answer: $594, not $600. Option B is circled in red pen and option C is crossed out as the trap. After the rise: $660. A 10% fall takes off $66, leaving $594. The two changes do not cancel because the second 10% is of a larger amount. Below, the same explanation in the answer key.

### Post 4: VCE Specialist marks (carousel, dark ink)

Upload `spec-1.png` then `spec-2.png`.

```
3 marks for a proof by induction. Where do they go?

Question 1 from our free Specialist Maths Exam 1 practice paper. Slide 2 is straight from the marking guide: one mark for the base case, one for using the assumption, one for a complete conclusion, and the error that costs marks.

Every Specialist practice exam comes with a marking guide like this. Specialist Exam 1 is on 9 November.

Try Exam 1 free now at prepnest.com.au/vce (link in bio).

#VCE #VCE2026 #SpecialistMaths #VCEMaths #Year12
```

Alt text:

1. VCE Specialist Mathematics Exam 1. 3 marks, where do they go? Question 1, 3 marks: prove by mathematical induction that 25 to the power n, minus 1, is divisible by 24 for all natural numbers n. Behind it, page 2 of the real practice paper.
2. From the marking guide, one mark for each step. Base case: 25 minus 1 is 24, so P(1) is true. Use the assumption: 25 to the k plus 1, minus 1, equals 24 times (25m plus 1). A complete conclusion: true for all n by induction. Common error: assuming what is to be proved.

### Post 5: VCE Physics diagrams (single image, blueprint)

Upload `phys-1.png`.

```
Projectile motion, circular motion, a mass spectrometer, a DC motor and the photoelectric effect.

These figures come from our free VCE Physics Practice Exam 1. It is set out like the VCAA paper, with Section A multiple choice and Section B short answer, and comes with a marking guide.

VCE Physics is on 12 November. Try Practice Exam 1 free now at prepnest.com.au/vce (link in bio).

#VCE #VCEPhysics #VCE2026 #Physics #Year12
```

Alt text: VCE Physics Unit 3 and 4, drawn like the real exam. Five figures from a practice exam drawn in white on a blueprint grid: a soccer ball kicked towards a wall, a roller-coaster loop, a mass spectrometer, a DC motor coil between magnets, and a photoelectric effect graph.

### Post 6: Year 9 Reading (carousel, cream and magazine colours)

Upload `read-1.png` then `read-2.png`.

```
"That decision is where the learning happens."

From "The case for handwriting", one of eight original texts in our Year 9 Reading Magazine. Swipe for the rest: a story, an explanation, a poem, a piece of history, satire, a book review and a report.

Like the real test, students read the texts in a colour magazine and answer in a separate question paper. Any Reading paper can also be sat on screen.

Try the Year 9 Reading paper free now at prepnest.com.au/naplan (link in bio).

#NAPLAN #NAPLANReading #Year9 #Reading #NAPLANPractice
```

Alt text:

1. A quote from page 4 of the Year 9 Reading Magazine, an opinion piece called The case for handwriting: "That decision is where the learning happens." Below, the magazine page with that sentence highlighted.
2. Eight texts, eight kinds of writing. The contents of the Year 9 Reading Magazine: The keeper's daughter, a story. Why forgetting is good for you, an explanation. The case for handwriting, opinion. Migration, a poem. The wire that shrank the world, history. Local family discovers "outside", satire. The Glass Orchard, a book review. Food waste in Westvale, a report.

### Post 7: NAPLAN 2027 dates (single image, calendar)

Upload `naplan-1.png`.

```
NAPLAN 2027: the test window runs 10 to 22 March.

It's for students in Grades 3, 5, 7 and 9, and each school sets its own test days inside the window. Save this so the dates are easy to find.

Every NAPLAN-style subject has a free paper with its answer key. Try one now at prepnest.com.au/naplan (link in bio).

#NAPLAN #NAPLAN2027 #NAPLANPractice #Grade3 #Year7
```

Alt text: NAPLAN 2027 for Grades 3, 5, 7 and 9. The test window opens 10 March. A March 2027 calendar with 10 to 22 March shaded as the test window. Each school sets its own test days inside the window.
