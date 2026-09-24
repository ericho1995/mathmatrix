# Past-paper corpus (only when the references lack something)

Location: `C:\Users\eric_\Desktop\specialist exam\` — about 935 files, 615 MB, arranged `YEAR/provider/…` (vcaa, mav, neap, insight, kilbaha, tssm, heffernan, qats, itute, engage, twm), plus `other/` (school papers, Cambridge revision) and `2025 SM Exam 2 Suggested Solutions - EdAtlas.pdf` (handwritten, so text extraction fails; view pages as images).

Pre-2023 papers follow the old study design (dynamics, and no proof, surface area, pseudocode, statistics inference or planes). Use them for question style only. Commercial MC papers switch from 5 to 4 options in 2024.

## Cheap lookups

Extract text once (≈2 minutes), then grep instead of opening PDFs:

```bash
mkdir -p "$TEMP/spec/txt" && cd "C:/Users/eric_/Desktop/specialist exam" && find . -name "*.pdf" | while read f; do pdftotext -layout -enc UTF-8 "$f" "$TEMP/spec/txt/$(echo "${f#./}" | tr '/ ' '__' | sed 's/\.pdf$/.txt/')" 2>/dev/null; done
grep -il "surface area" "$TEMP"/spec/txt/202[34]_*exam-2.txt        # which papers use a topic
grep -v "^\s*$" "$TEMP/spec/txt/<file>.txt" | grep -v "^_\+$" | sed -n '1,200p'   # read one, skipping answer lines
```

The most useful files (current study design):

- `2023_vcaa_2023_VCAA_Exams_1&2_Solutions_-_Simon_Tyler.txt`: every 2023 VCAA question with solutions.
- `2023_vcaa_2023_VCAA_Sample_Exams_1&2_Solutions_-_Simon_Tyler.txt`: VCAA's sample questions for the new content.
- `2024_{mav,neap,insight,kilbaha,tssm,heffernan,qats}_*units-3-4-exam-{1,2}.txt` and their `-solutions`.
- `2024_kilbaha_2024-kilbaha-units-3-4-exam-1.txt` (end of file): the formula sheet text.
- VCAA examiner reports `YEAR_vcaa_YEAR-vcaa-exam-N-report.txt` (2016–2021): % correct and common errors, useful for distractors.

Viewing a page as an image: `node scripts/authoring/pdf-pages.mjs "<pdf>" <page> <count> out.png 520`, then read the PNG.
