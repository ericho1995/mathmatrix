# Premium UI: the blue bird and a Duolingo-style look

Requested by the owner on 2026-10-02: a small happy blue bird learning as the
PrepNest logo, a more premium look using the Duolingo.com web pages (Figma
community file 1349313332454280331) as the template, an interface that is easy
to use, and a message parents understand: *their child does the test, we find
the weak points, we keep fine-tuning, and dashboards and more features help them
improve.*

## Decisions

| Question | Decision |
|---|---|
| Which bird? | **The bird in its nest** (option C of three drawn), chosen by default when the owner skipped the choice. A round blue bird, white eyes, orange beak, pink cheeks, a yellow pencil, sitting in a brown nest. Hand-built vector art, not generated imagery. |
| Small sizes | The bird's head peeking over the nest rim, so it reads at 16–32 px (favicon, header). |
| Typeface | Nunito (Google Fonts), the closest free match to Duolingo's rounded type. 800–900 for headings and buttons, 600–700 for body. |
| Colour | Primary blue `#2F8FEA` (the bird), lip `#1E6FC4`. Accents: sun `#FFC530`, green `#58CC02` (correct / strength), orange `#FF9600` (focus), purple `#CE82FF` (fine-tuning). Ink `#3C3C3C`, muted `#777777`, hairline `#E5E5E5`. Report colours: strength green, developing blue, focus orange. |
| Buttons | Rounded 16 px, bold, sentence case, with a solid darker bottom "lip" (4 px) that collapses on press. Primary blue; secondary white with a grey outline and lip. |
| Cards | White, 2 px `#E5E5E5` outline, 4 px bottom lip, 20 px radius. |
| Wordmark | Unchanged in meaning: "Prep" ink, "Nest" blue, now in Nunito 900. |

## The mascot

`src/components/brand/Bird.tsx` draws the bird in four poses from one set of
shapes, so they always match: `nest` (logo, hero), `cheer` (results, wings up,
happy eyes), `think` (the test intro and loading), `read` (empty states and the
report's "help at home"). `BirdMark` is the small head-over-nest mark used by
`Logo`, the favicon (`src/app/icon.svg`) and the Apple icon.

## Pages

Restyled by hand:

- **Navigation and footer** — new logo; chunky "Free diagnostic test" button.
- **Homepage** — hero (bird in the nest; *The free, simple way to find exactly
  where your child needs help*; primary *Start the free test*, secondary *I
  already have an account*); four steps (*Your child takes a test → We find the
  weak spots → We keep fine-tuning → You watch them improve*); then one
  alternating illustrated section per step, in the template's layout; the
  sample report; the papers library; pricing; FAQ; closing banner.
- **Diagnostic** — the setup page, the child's test screen (thick progress bar,
  big chunky answer tiles, the thinking bird on the intro), the results page
  (cheering bird), and the report.
- **Parent dashboard** — the same cards and colours.

Every other page (catalogue, pricing, practice, account, help, auth) inherits
the new type, buttons, cards and colours through the shared `btn-*`, `card`
and `input` classes and the Tailwind theme, without layout changes.

## Not in this round

New dashboard features. They need their own design once the look is settled.

## Testing

Type-check, lint, unit tests and build. In the browser: every restyled page at
1280 px and 390 px, the diagnostic run end to end, and a pass over the pages
that only inherit the styles to catch anything the new classes break.
