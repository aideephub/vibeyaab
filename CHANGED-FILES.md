# VibeYaab — Cross-lingual search (فارسی ↔ English)

This release adds Persian↔English cross-lingual search to VibeYaab. Two delivery options are
provided — you only need **one** of them:

| File | Use it when |
| --- | --- |
| `vibeyaab-crosslingual-search.zip` | You want the whole, ready-to-run project (recommended). Unzip, `npm install`, `npm run dev`. |
| `vibeyaab-crosslingual-changed-files-only.zip` | You already have the working project and only want to drop in the new/changed files. |

---

## Option B in detail — replacing files only

15 files were added or changed. The changed-files zip preserves the exact project-relative
paths; copy its folders over your project root, replacing when asked, then restart
`npm run dev` (or push — GitHub Pages rebuilds automatically).

### New files (4) — simply copy them in

| # | Location in the project | What it is |
| --- | --- | --- |
| 1 | `src/lib/language.ts` | Lightweight Persian-script detector (`isPredominantlyPersian`, `containsPersianScript`) and orthography normaliser (`normalizePersianText`: unifies ی/ک, ZWNJ→space, strips diacritics/tatweel, folds hamza variants, maps Persian digits). |
| 2 | `src/data/persianEnglishDictionary.ts` | The curated Persian → English dictionary (185 entries, 292 unique English terms) grouped by category, with a how-to-extend comment at the top. |
| 3 | `src/lib/queryExpansion.ts` | Local expansion engine: whole-word dictionary lookup over the normalised query, dedupe, skip terms the user already typed, capped at 6 terms. No API, no network, no keys. |
| 4 | `src/components/ExpansionChips.tsx` | Presentational, accessible chips for the expansion terms (label + removable chips + plain-language explanation + restore button). |

### Changed files (11) — replace your existing copies

| # | Location in the project | What changed |
| --- | --- | --- |
| 5 | `src/lib/ranking.ts` | `rankResults()` now takes the active expansion terms and scores each result with the best of (original-query score, expansion-term score × 0.85), so Persian original-query results keep their edge. |
| 6 | `src/lib/useSearch.ts` | Runs two rounds per source (original query + joined expansion terms) via the existing `runSearch`, keeps per-round state, merges both rounds into one deduped list, reports a failure only when *every* round of that source failed, and exposes `expansion` info for the UI. |
| 7 | `src/lib/router.ts` | New `xe=` URL parameter (comma-separated removed expansion terms); `Route` carries `xe`; `searchHref(q, scope, excludedExpansion)` writes it. The original query in `q=` is untouched. |
| 8 | `src/components/SearchBar.tsx` | Optional `expansionPreview` prop: while typing a predominantly Persian query, shows removable "Will also search:" chips *before* submitting and passes removals through the new `SearchOptions` on submit. |
| 9 | `src/pages/ResultsPage.tsx` | Receives `xe` from the route, passes it to `useSearch`, renders `ExpansionChips` ("Also searched:" / «همچنین جست‌وجو شد:») above the filters; removing a chip re-runs the search via `xe=`, restore clears it. |
| 10 | `src/pages/HomePage.tsx` | Home search passes preview removals into `searchHref`; SearchBar there runs with `expansionPreview`. |
| 11 | `src/App.tsx` | Forwards `route.xe` to `ResultsPage`. |
| 12 | `src/i18n/en.ts` | 7 new keys: `search.expansionPreview*`, `results.expansionRegion/Title/Help/Remove/Restore`. |
| 13 | `src/i18n/fa.ts` | The same 7 keys in Persian, including the required «همچنین جست‌وجو شد:». |
| 14 | `src/styles/global.css` | Chip styles (`.expansion*`) using logical properties — RTL-safe, token-based, light/dark aware. |
| 15 | `src/lib/config.ts` | `APP_VERSION` bumped to `1.1.0`. |

(`README.md` was also updated — feature list, developer file tree and dictionary guide. It is
included in both zips; replacing it is optional.)

---

## Behaviour summary

- Search «نقاشی» → the app searches «نقاشی» **and** `drawing painting sketch`, merges and
  deduplicates results by normalised URL, ranks them with the existing signals and shows
  “Also searched: drawing, painting, sketch” (EN UI) / «همچنین جست‌وجو شد: …» (FA UI).
- Each term chip can be removed **before** searching (home-page preview) and **after**
  (results page); removal re-runs the search without that term and is stored in the URL
  (`?q=نقاشی&xe=painting`), so the Persian query itself is always preserved.
- English queries («drawing») behave exactly as before — detector gates everything.
- No translation API, no keys, no calls on keystrokes — expansion is a local dictionary
  evaluated only on submit (the home-page preview is a synchronous local lookup).

## Verification performed

- `npx tsc --noEmit` — clean; `npm run build` — succeeds.
- 40/40 logic tests (detector, normaliser, expansion, boundaries, ranking merge, dedupe).
- Browser end-to-end: «نقاشی» returned 31 drawing/painting/art results (VibeKing live);
  chip removal/restore updated `xe=` and re-searched; «drawing» showed no expansion UI;
  RTL Persian rendering and empty/partial-failure states verified in both languages.
