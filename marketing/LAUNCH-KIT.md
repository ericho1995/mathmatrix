# PrepNest launch kit (October 2026)

Everything needed to put PrepNest in front of VCE students and parents, in the
order it matters. The copy follows the house rules in
`marketing/instagram/captions-bird.md`: no emoji, no em dashes in ad copy,
"practice" as the verb, "purchase" not "buy", calls to action say "try ...
now", and no testimonials or usage numbers.

## 0. The one blocker: Stripe has paused charges

Stripe's email of 27 September: *"Incoming charges are paused as of Sep 13,
2026 until the requested information is reviewed"*, and payouts are paused
too. The open task is an identity document for the account representative.
Until it is cleared, every purchase fails, so every dollar of advertising is
wasted on checkout. Fix it first:
https://dashboard.stripe.com/account/status

Then check the whole path once with a real card (runbook Part P6), and refund
it from the Stripe dashboard.

## 1. What now runs on its own

| | What it does |
|---|---|
| **Landing pages** | `/vce/mathematical-methods`, `/vce/specialist-mathematics`, `/vce/general-mathematics`, `/vce/physics`, `/vce/chemistry`, `/naplan/year-3`, `/naplan/year-5`, `/naplan/year-7`, `/naplan/year-9`: one page per search ("vce methods practice exam", "year 5 naplan practice test"), with exam-date countdowns, the paper format, every paper, and an FAQ. |
| **Structured data** | Organisation and website on every page; breadcrumbs and paper details on every paper (VCE papers carry their A$20 price); FAQ markup on the help centre and the landing pages. Search engines can show these as rich results. |
| **IndexNow** | `.github/workflows/indexnow.yml` sends every sitemap URL to Bing, Yandex, Seznam and Naver after each deploy of `main`. Bing's index also feeds several other search engines and AI search tools. Run it by hand from GitHub → Actions → IndexNow → Run workflow. |
| **llms.txt** | `/llms.txt` describes the site for AI assistants (ChatGPT, Claude, Perplexity), built from the catalogue so it never goes stale. |
| **Sitemap** | Lists every paper and landing page; `robots.txt` points to it. |

## 2. Ten minutes that unlock Google and Bing

Google does not take IndexNow. To get the landing pages into Google before the
VCE exams start on 27 October:

1. **Google Search Console** → Add property → *URL prefix* →
   `https://prepnest.com.au` → choose the **HTML tag** method. Copy only the
   `content="..."` value.
2. Vercel → Settings → Environment Variables → add
   `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` = that value (Production) → redeploy.
3. Back in Search Console → **Verify** → Sitemaps → submit `sitemap.xml`.
4. URL Inspection → request indexing for `/vce/mathematical-methods`,
   `/vce/specialist-mathematics`, `/vce/general-mathematics`, `/vce/physics`
   and `/vce`. (A handful a day is allowed; do the VCE ones first.)
5. **Bing Webmaster Tools** → *Import from Google Search Console* (one click
   once Google is verified). Or use its meta tag with
   `NEXT_PUBLIC_BING_SITE_VERIFICATION`.

## 3. Timing

| When | Who is searching | Push |
|---|---|---|
| **Now to 12 November** | Year 12 students, 2 to 4 weeks from their exams | VCE pages, by subject, in exam order: General (30 Oct, 2 Nov), Methods (5, 6 Nov), Specialist (9, 11 Nov), Physics (12 Nov) |
| **13 November to January** | Year 11 students starting Units 3 & 4, and their parents | VCE "get ahead" and the diagnostic |
| **Late January to March** | Parents of Years 3, 5, 7, 9 before NAPLAN (10 to 22 March 2027) | NAPLAN year pages and the free diagnostic |

## 4. A launch code

Checkout already accepts Stripe promotion codes. Create one in Stripe →
Products → Coupons (for example 25% off, code `VCE2026`, expires 18 November)
and use it in the posts below. A code gives communities a reason to allow the
post, and tells you which channel worked.

## 5. Ready-to-post copy

Every link carries UTM tags, so Vercel Analytics and the Stripe checkout
metadata show where each visitor came from.

### Reddit r/vce and ATAR Notes (Year 12 students)

Both restrict commercial posts. Read the rules first; where they ask, message
the moderators and ask to post, or post in the weekly resources thread. Be
plain about who you are.

> **Title:** Practice exams for Methods, Specialist, General and Physics in the VCAA format
>
> I run PrepNest, a small Melbourne site that writes practice exams. With the
> exams a few weeks out, here is what we have for Units 3 & 4: five Exam 1 and
> Exam 2 sets each for Methods, Specialist and General, and five Physics
> papers. Each one has reading time, the same sections as the VCAA paper and
> a full marking guide with worked solutions.
>
> The first half of every paper is free to flip through, so you can judge the
> questions before spending anything. Full papers are $20 each, yours to keep
> (code VCE2026 for 25% off until 18 November). Do the VCAA past papers
> first; these are for when you have run out.
>
> https://prepnest.com.au/vce?utm_source=reddit&utm_medium=social&utm_campaign=vce2026
>
> Happy to take feedback on any question, including telling me one is wrong.

For ATAR Notes, swap the link's `utm_source=reddit` for `utm_source=atarnotes`.

### Facebook parent groups (VCE parents, now)

> If your child sits VCE Maths or Physics in the next few weeks: PrepNest has
> practice exams written in the VCAA format, each with a marking guide and
> worked solutions. The first half of every paper is free to look through.
> Papers are $20 each, purchased once, so you only pay for the subjects they
> sit. Try a paper now:
> https://prepnest.com.au/vce?utm_source=facebook&utm_medium=social&utm_campaign=vce2026

### Facebook parent groups (NAPLAN parents, from late January)

> NAPLAN is 10 to 22 March. If you want to know where your child actually
> needs help before then, PrepNest has a free 30-minute diagnostic test for
> Years 3 to 9. You get a report of every area, the exact skills to work on
> and three ways to help at home, then practice papers on just those areas.
> Try the free test now:
> https://prepnest.com.au/diagnostic?utm_source=facebook&utm_medium=social&utm_campaign=naplan2027

### Instagram and TikTok

Assets: `marketing/instagram/export-bird/` (posts and the 15-second reel) and
the 56-second film on the `marketing/short-film` branch (PR #35).

VCE countdown post, one per subject, posted 10 days before each exam:

> 10 days to VCE Methods Exam 1. One full practice paper a day, under exam
> conditions, then mark it against the guide. Five Exam 1 and Exam 2 sets in
> the VCAA format, each with worked solutions. Try a paper now. Link in bio.
>
> #VCE #VCE2026 #VCEMethods #Year12 #Melbourne #StudyTips

Change the bio link to
`https://prepnest.com.au/vce?utm_source=instagram&utm_medium=social&utm_campaign=vce2026`
until 12 November, then back to the diagnostic.

### Business description (for directories and profiles)

Google Business Profile does not accept online-only businesses, so skip it
unless PrepNest has a premises where it meets customers. Use this description
for the directories in section 7 and for social profiles.

> PrepNest writes practice exams for Australian students from Grade 3 to Year
> 12: NAPLAN-format papers in Numeracy, Reading and Language Conventions, and
> VCE practice exams in Mathematical Methods, Specialist Mathematics, General
> Mathematics, Physics and Chemistry. Every paper comes with an answer key or
> marking guide and can be printed or sat on screen. Start with the free
> diagnostic test, which shows exactly which skills to work on.

### Email to school newsletters and parent associations

> Subject: A free diagnostic test for your families before NAPLAN
>
> Hello,
>
> I run PrepNest, a Melbourne site that writes practice papers in the NAPLAN
> and VCE formats. Our free diagnostic test, for Years 3 to 12, shows parents
> exactly which skills their child needs to work on, with three ways to help
> at home for each.
>
> If it would be useful for your newsletter, here is a short item you are
> welcome to use as is:
>
> *"PrepNest's free diagnostic test shows which maths, reading or grammar
> skills your child needs to work on, in about 30 minutes, with a report and
> ideas for helping at home: prepnest.com.au/diagnostic"*
>
> PrepNest is independent and not affiliated with ACARA or the VCAA. Thank
> you for considering it.

## 6. Paid search (if you choose to spend)

Google Ads, one Search campaign, location *Victoria*, A$15 to A$25 a day until
12 November. Google Ads conversion tracking is not wired into the site yet
(the Meta and TikTok pixels are), so bid on *maximise clicks* with a cost per
click cap, and judge the campaign from `utm_source` in each Stripe checkout's
metadata.

**Ad groups and keywords** (phrase match)

- Methods: "vce methods practice exam", "methods exam 1 practice", "methods exam 2 practice", "vce maths methods trial exam" → `/vce/mathematical-methods`
- Specialist: "vce specialist maths practice exam", "specialist exam 1 practice", "specialist trial exam" → `/vce/specialist-mathematics`
- General: "vce general maths practice exam", "general maths exam 1 practice", "further maths practice exam" → `/vce/general-mathematics`
- Physics: "vce physics practice exam", "vce physics trial exam" → `/vce/physics`

Negative keywords: `free download`, `past paper`, `2025`, `answers pdf`, `jobs`.

**Headlines** (30 characters or fewer)

```
VCE Methods Practice Exams
VCE Specialist Practice Exams
VCE General Maths Practice
VCE Physics Practice Exams
Written in the VCAA Format
Marking Guide With Every Paper
Flip Through Half Free
$20 a Paper, Yours to Keep
Sit It On Screen or Print It
Worked Solutions Included
VCE Exams Start 27 October
```

**Descriptions** (90 characters or fewer)

```
Unit 3 & 4 practice exams with reading time, sections and a full marking guide.
Flip through the first half of any paper free, then purchase only the subjects you sit.
Exam 1 and Exam 2 practice sets in the VCAA format. Worked solutions for every part.
Independent practice material. Not affiliated with the VCAA.
```

NAPLAN campaign (from late January, national): keywords "naplan practice
test", "year 3 naplan practice", "year 5 naplan practice", "year 7 naplan
practice", "year 9 naplan practice" → the matching `/naplan/year-N` page.
Headlines: `NAPLAN Practice Tests`, `Year 5 NAPLAN Practice`, `Free Diagnostic Test`,
`Numeracy, Reading, Conventions`, `Answer Key With Every Paper`,
`One Plan, Every Year Level`.

## 7. Free listings (backlinks and discovery)

Product Hunt, Hotfrog, Yellow Pages (free listing) and TrueLocal. Each has
its own rules on business addresses; follow them. Use the business
description above, the logo `marketing/instagram/export-bird/profile-sun.png`,
and `https://prepnest.com.au` as the website.
