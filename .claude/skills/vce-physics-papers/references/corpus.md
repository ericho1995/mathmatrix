# Past-paper corpus (only when the references lack something)

**Location.** `C:\Users\eric_\Desktop\Physics\` holds 519 files, arranged `YEAR/provider/…`.
- Providers: vcaa, neap, insight, tssm, kilbaha, qats, stav, access, itute, lisachem, tsfx, mhs and others.
- `other/` has topic sets (fields, electric power, projectiles), school tests and the vicphys question banks (DC motors, photoelectric).

**Caveats**
- **Study design.** Pre-2024 papers follow older study designs, with sound, detailed studies, astrophysics, simple harmonic motion and a different exam structure. Use them for question style and archetypes only.
- **2024–2027 references.** The 2024 trials (access, insight, kilbaha, neap, qats, stav, tssm) are the best guide to the current design. The official 2024/2025 VCAA exams are **not** in the folder; they are on vcaa.vic.edu.au, which needs the owner's permission to download.
- **Scanned PDFs.** Some 2024 papers (kilbaha, qats question books) have no text layer. View their pages as images.

## Cheap lookups

Text is extracted to `$TEMP/phys/txt/` (457 files, named `YEAR_provider_file.txt`). If it is missing, re-extract (about 2 minutes):

```bash
mkdir -p "$TEMP/phys/txt" && cd "C:/Users/eric_/Desktop/Physics" && find . -name "*.pdf" | while read f; do pdftotext -layout -enc UTF-8 "$f" "$TEMP/phys/txt/$(echo "${f#./}" | tr '/ ' '__' | sed 's/\.pdf$/.txt/')" 2>/dev/null; done
grep -il "lenz" "$TEMP"/phys/txt/2024_*.txt                     # which trials use a topic
grep -n -E "^ *Question [0-9]+ \(" "$TEMP/phys/txt/2024_neap_2024-neap-units-3-4.txt"   # the paper's structure
```

Most useful:
- `2024_{neap,insight,tssm,stav,access}_*units-3-4.txt` and their `-solutions`: current-format papers with marking.
- `20{17..21}_vcaa_*-vcaa.txt` and `*-report.txt`: VCAA wording, and examiner reports with % correct and common errors (good for distractors).
- `2020_vcaa_2020-vcaa-formulas.txt`: the old formula sheet. The current one is built into `formulaSheets.ts`.

**Viewing a page:** `node scripts/authoring/pdf-pages.mjs "<pdf>" <page> <count> out.png 520`, then read the PNG.
