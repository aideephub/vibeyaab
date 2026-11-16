# VibeYaab — find before you build

## ▶️ [Open the live app](https://aideephub.github.io/vibeyaab)

**English** · [فارسی](./README.fa.md)

VibeYaab is a free, bilingual (English / فارسی) search tool for finding what
already exists — AI-built ("vibe-coded") apps, open-source alternatives,
GitHub repositories and curated directories — so you can check what's out
there *before* you spend a weekend building something someone has already
shipped.

One search box, one ranked list — live at
<https://aideephub.github.io/vibeyaab>. No account, no backend, no analytics:
everything you save stays in your browser.

## Features

- **One ranked list, many sources.** VibeKing, One's Vibe, GitHub and a set of
  curated directories are queried in parallel and merged. If a source is down
  or rate-limited, the rest still show up with a short notice instead of an
  empty page.
- **Search in Persian, find English projects.** A predominantly Persian query
  is also searched with English equivalents from a built-in dictionary —
  «نقاشی» also tries *drawing, painting, sketch*. Both sets are merged,
  de-duplicated by URL and ranked together. The extra terms appear as
  removable chips, and removing one re-runs the search without it. No
  translation API, no keys, no requests on every keystroke.
- **No duplicates.** http/https, `www.`, trailing slashes and tracking
  parameters are normalised before results are merged.
- **Filters that earn their place.** Source, category, AI tool and sort order
  (relevance, newest, most upvoted), plus quick scope chips for common
  searches.
- **Ranking you can inspect.** Every result carries a transparent score, and
  the *Why these results?* panel explains how that order was reached.
- **Labels are earned, not guessed.** A result is only marked *Live demo*,
  *Open source* or *Added … ago* when the source itself provides that
  information.
- **Bookmarks you own.** Saving is instant everywhere in the app; export to
  JSON and import with validation and a merge that only *adds* — it never
  deletes or overwrites.
- **Speaks both directions.** Instant English ↔ فارسی switching with correct
  LTR/RTL mirroring, plus light, dark and system themes.
- **Installable, offline-aware.** A PWA with an offline fallback that still
  shows your bookmarks and settings; live search needs a connection.

## Where the results come from

- **VibeKing** — public product API; the primary structured source.
- **One's Vibe** — public, CORS-friendly reference API.
- **GitHub** — repository search, off by default because of its low rate
  limit; switch it on in Settings.
- **Google Programmable Search** — optional; covers a curated set of domains
  and awesome lists when the deployer configures an engine ID.
- **Curated links** — GitHub topics, YourAIProject, Open SaaS Directory and
  five awesome lists, always browsable.

## Using it

1. Open the [live app](https://aideephub.github.io/vibeyaab).
2. Describe what you want to build — in English or in Persian.
3. Narrow the list with filters, then bookmark what's worth keeping.
4. Install it from your browser menu (*Install* / *Add to Home screen*) if you
   use it often.

Every search lives in the URL (`?q=…`), so back and forward work and any
search can be shared as a link.

## Privacy

There is no backend, no database, no account and no analytics. Bookmarks,
settings and recent searches live in your browser's `localStorage` and are
never uploaded. Queries go straight from your browser to the search sources
listed above.

## Development

React, TypeScript and Vite. The production build inlines the JS and CSS into a
single `index.html`, so the app works from any path — including a GitHub Pages
sub-path — with no `base` configuration.

```bash
npm install
npm run dev       # local development
npm run build     # production build into dist/
npm run preview   # preview the production build
npx tsc --noEmit  # type check
```

Pushes to `main` are built and published to GitHub Pages by the workflow in
`.github/workflows`.

- **Optional build variable:** `VITE_GOOGLE_CSE_ID` — a Google Programmable
  Search Engine ID. Leave it unset and Google results are skipped; everything
  else still works. The ID is public by design and is not a secret.
- **Adding a source:** implement the `SearchSource` interface in a new file
  under `src/sources/` and register it in `src/sources/index.ts`.
- **Extending the dictionary:** add one line per Persian term to
  `src/data/persianEnglishDictionary.ts`.

Contributions, bug reports and source suggestions are welcome.

## Roadmap

- A small serverless proxy to cache directory APIs and make GitHub search
  token-backed.
- More structured sources as stable public APIs appear.
- Server-side sorting and category filters where a source supports them.
- Notes and tags on bookmarks.

## Links

- Channel: **AIDEEP** — لایه‌های عمیق هوش مصنوعی — <https://eitaa.com/AIDEEP>

## License

MIT — free to use, change and share; see [LICENSE](./LICENSE).

VibeYaab is not affiliated with VibeKing, One's Vibe, GitHub or Google.
Results link to their respective sources.
