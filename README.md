# VibeYaab — Find before you build

**English** | [فارسی](./README.fa.md)

### ▶️ [Open the live app: aideephub.github.io/vibeyaab](https://aideephub.github.io/vibeyaab)

> **English:** *Find before you build.*  **فارسی:** «قبل از ساختن، پیدا کن.»

VibeYaab is a free, static, bilingual (English / فارسی) search tool for discovering existing AI-built
("vibe-coded") projects, open-source alternatives, GitHub repositories and directories **before** you
build something similar.

It is a pure front-end app: no backend, no database, no accounts, no analytics, no ads. Everything the
user creates (bookmarks, settings, recent searches) stays in the browser's `localStorage`.

Promoted channel: **AIDEEP** · **لایه‌های عمیق هوش مصنوعی** — <https://eitaa.com/AIDEEP>

---

## Contents

1. [Features](#1-features)
2. [Run it on your own computer (Windows)](#2-run-it-on-your-own-computer-windows)
3. [Publish it on GitHub Pages (step by step)](#3-publish-it-on-github-pages-step-by-step)
4. [Optional: turn on Google results](#4-optional-turn-on-google-results)
5. [Updating the site later](#5-updating-the-site-later)
6. [Install as an app (PWA)](#6-install-as-an-app-pwa)
7. [Export / import explained](#7-export--import-explained)
8. [Troubleshooting](#8-troubleshooting)
9. [Environment variables](#9-environment-variables)
10. [How it works (for developers)](#10-how-it-works-for-developers)
11. [Roadmap](#11-roadmap)

---

## 1. Features

- **One unified results list** from several sources, searched in parallel with `Promise.allSettled`
  (if one source fails, the others still show, with a warning banner):
  - **VibeKing** public API (`https://vibeking.fun/api/products`) — primary structured source
  - **One's Vibe** public reference API (`https://onesvibe.app/api/reference`) — structured, CORS-enabled
  - **Google Programmable Search Element** over curated domains and awesome lists (optional, needs an ID)
  - **GitHub repository search** — optional, **off by default** (turn it on in Settings; low rate limit)
  - Curated browse links: GitHub topics, YourAIProject, Open SaaS Directory, five awesome lists
- Ranking is a simple, explainable score (see the "Why these results?" panel in the app).
- **Cross-lingual search (فارسی ↔ English):** a predominantly Persian query is also searched
  with English equivalents from a local, curated dictionary (e.g. «نقاشی» also searches
  *drawing, painting, sketch*). Results from both queries are merged, deduplicated by URL and
  ranked together — the original Persian query is always searched too, never replaced.
  The used terms are shown as removable chips (before and after the search), and removing
  one re-runs the search without it via the `xe=` URL parameter. No translation API, no keys,
  no network calls on keystrokes.
- Duplicate links (http/https, `www.`, trailing slash, tracking parameters) are merged.
- Filters: quick scope chips, source, category, AI tool, sort (relevance / newest / most upvoted).
- Bookmarks with instant updates everywhere, JSON export, validated JSON import with **merge**.
- Fully bilingual with instant switching, correct **LTR/RTL** mirroring, light / dark / system theme.
- URL support: `?q=expense+tracker`, with browser back/forward.
- Installable PWA with offline fallback (offline shows bookmarks and settings; live search needs internet).
- Honesty rule: a result is only labelled "Live demo", "Open source" or "Added … ago" when the source
  itself provides that information.

---

## 2. Run it on your own computer (Windows)

You only need to do the installation part once.

### 2.1 Install Node.js

1. Go to <https://nodejs.org> and download the **LTS** version (the big green button).
2. Run the installer and keep clicking **Next** (default options are fine).
3. Restart your computer if the installer suggests it.

Check that it worked: press the **Windows key**, type `PowerShell`, press **Enter**, then type:

```powershell
node -v
npm -v
```

You should see two version numbers (for example `v20.x.x` and `10.x.x`).

### 2.2 Open the project folder in PowerShell

1. Put the project folder somewhere simple, for example `C:\vibeyaab`.
2. In PowerShell, go into it:

```powershell
cd C:\vibeyaab
```

(Tip: in File Explorer, open the folder, click the address bar, type `powershell` and press Enter — this
opens PowerShell already inside the folder.)

### 2.3 Install the project's building blocks (once)

```powershell
npm install
```

This takes a minute and creates a `node_modules` folder. Warnings are normal; red **errors** are not.

### 2.4 Start the app locally

```powershell
npm run dev
```

PowerShell prints a link such as `http://localhost:5173/`. Hold **Ctrl** and click it (or copy it into
your browser). Stop the app any time with **Ctrl + C** in PowerShell.

### 2.5 (Optional) Create the production build

```powershell
npm run build
```

This creates the `dist` folder — that is the finished website. To preview exactly what will be
published:

```powershell
npm run preview
```

---

## 3. Publish it on GitHub Pages (step by step)

GitHub Pages hosts the site for free at `https://YOUR-USERNAME.github.io/vibeyaab/`.

### 3.1 Create a GitHub account and a repository

1. Sign up at <https://github.com> (free).
2. Click the **+** (top right) → **New repository**.
3. Repository name: **`vibeyaab`** (lowercase; this becomes part of your site address).
4. Choose **Public**. Do **not** tick "Add a README" (the project already has one).
5. Click **Create repository**. Leave the page open — it shows the repository address, like
   `https://github.com/YOUR-USERNAME/vibeyaab.git`.

### 3.2 Upload the project from your computer

**Option A — with Git (recommended).**

1. Install Git for Windows from <https://git-scm.com/download/win> (default options are fine), then
   open a **new** PowerShell window.
2. One-time identity setup (use your own name and e-mail):

   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "you@example.com"
   ```

3. In the project folder (`cd C:\vibeyaab`), run these lines one by one (replace `YOUR-USERNAME`):

   ```powershell
   git init
   git add .
   git commit -m "First version of VibeYaab"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/vibeyaab.git
   git push -u origin main
   ```

4. A browser window may ask you to sign in to GitHub — do so and approve.

**Option B — with GitHub Desktop (no commands).**

1. Install <https://desktop.github.com> and sign in.
2. **File → Add local repository…** → choose your project folder → click **create a repository** when
   asked → **Create repository**.
3. Click **Publish repository**, name it `vibeyaab`, untick "Keep this code private", **Publish**.

> Do **not** upload the `node_modules` or `dist` folders. The included `.gitignore` already prevents
> this with Git and GitHub Desktop. Also make sure the hidden `.github` folder is uploaded — it
> contains the automatic publishing recipe.

### 3.3 Switch on GitHub Pages

1. In your repository on github.com open **Settings** → **Pages** (left menu).
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

### 3.4 Wait for the automatic build

1. Open the **Actions** tab. A run named **Deploy VibeYaab to GitHub Pages** starts by itself after
   each upload (push). Wait until it shows a green check mark (about 1–2 minutes).
2. Open **Settings → Pages**: your site address appears at the top, e.g.
   `https://YOUR-USERNAME.github.io/vibeyaab/`. Open it — you're live.

If the run shows a red ✗, click it, then the failed step, and read the message (see
[Troubleshooting](#8-troubleshooting)).

### 3.5 Using a different repository name

The app uses relative links, so it works under **any** repository name (and at a custom domain root)
without changing configuration. Just use that name in your address.

---

## 4. Optional: turn on Google results

Without this step VibeYaab still works (VibeKing + One's Vibe + links). Google adds extra coverage over
GitHub, YourAIProject, Open SaaS Directory and the awesome lists.

### 4.1 Create the search engine

1. Open <https://programmablesearchengine.google.com/> and sign in with a Google account.
2. Click **Add** (create a new search engine).
3. Name it e.g. `VibeYaab`.
4. Choose **Search specific sites or pages** and add each of these (one per line / one at a time):

   ```text
   vibeking.fun/*
   youraiproject.com/*
   github.com/*
   opensaas.directory/*
   github.com/JefferyLee/awesome-vibe-coded-apps/*
   github.com/0xWelt/Awesome-Vibe-Coding/*
   github.com/awesome-vibe-coding/awesome-vibe-coding/*
   github.com/Anil-matcha/awesome-vibecoded-saas/*
   github.com/archestack/best-of-vibe-coding/*
   ```

5. Tick "I'm not a robot" and click **Create**.
6. Open the new engine → **Overview** → copy the **Search engine ID**
   (a value like `a1b2c3d4e5f6g7h8i`).

VibeYaab shows Google's results in its own design and never displays Google's ads. Google may apply its own
usage limits to the free Element.

### 4.2 Give the ID to the app

- **On GitHub Pages:** repository → **Settings → Secrets and variables → Actions → Variables** tab →
  **New repository variable** → Name `VITE_GOOGLE_CSE_ID`, Value = your ID → **Add variable**. Then
  open the **Actions** tab, choose the latest run and click **Re-run all jobs** (or make any small
  change and push).
- **Locally:** copy `.env.example` to `.env` (in PowerShell: `copy .env.example .env`), open `.env` in
  Notepad and replace `your_programmable_search_engine_id` with your ID. Restart `npm run dev`.

The ID is public by design (it ends up in the website's code); it is **not** a password. Google's
script is only loaded after someone runs a search and only when an ID is configured.

---

## 5. Updating the site later

After changing any file:

```powershell
git add .
git commit -m "Describe your change"
git push
```

GitHub rebuilds and republishes automatically (watch the **Actions** tab). With GitHub Desktop: write a
summary → **Commit to main** → **Push origin**.

Users of the installed PWA receive the new version the next time they open the app while online
(you may need to close and reopen it once).

---

## 6. Install as an app (PWA)

- **Chrome / Edge on Windows:** open the site → click the *install* icon at the right end of the address
  bar → **Install**.
- **Android Chrome:** menu (⋮) → **Install app** / **Add to Home screen**.
- **iPhone Safari:** Share button → **Add to Home Screen**.

Offline, the app opens and shows bookmarks and settings; searching needs an internet connection.

---

## 7. Export / import explained

**Settings → Export data** downloads `vibeyaab-export-YYYY-MM-DD.json`:

```json
{
  "app": "VibeYaab",
  "version": 1,
  "exportedAt": "2026-01-01T12:00:00.000Z",
  "settings": { "lang": "en", "theme": "system", "githubApi": false },
  "bookmarks": [
    {
      "id": "bm_…",
      "title": "Example",
      "url": "https://example.com/",
      "source": "vibeking",
      "savedAt": "2026-01-01T12:00:00.000Z"
    }
  ]
}
```

**Settings → Import data** validates the file, then shows a summary (how many bookmarks are new and how
many are duplicates). Nothing changes until you press **Merge into my data**. Merging only *adds*
bookmarks that aren't already saved (matched by normalized URL); it never deletes or overwrites. Settings
from the file are applied only if you tick the box.

**Clear all local data** (with confirmation) removes bookmarks, recent searches and settings from this
browser.

---

## 8. Troubleshooting

| Problem | What to do |
| --- | --- |
| `node` or `npm` "is not recognized" | Install Node.js (step 2.1), then close and reopen PowerShell. |
| `npm run dev` shows nothing in the browser | Copy the exact `http://localhost:…` link PowerShell prints. |
| Actions run is red at **Install dependencies** | Make sure `package-lock.json` was uploaded. |
| Site shows a 404 right after setup | Wait 1–2 minutes; confirm **Settings → Pages → Source** is **GitHub Actions** and the run is green. |
| Blank page on GitHub Pages | Hard-refresh with **Ctrl + F5**; make sure the whole `dist` was built by the workflow (do not upload `dist` yourself). |
| No Google results | You haven't set `VITE_GOOGLE_CSE_ID` yet (section 4), or the engine ID is wrong. VibeKing/One's Vibe still work. |
| "Some sources couldn't be reached" | A source was down, blocked or rate-limited. Press **Try again**. |
| Old version after an update | Close the app/tab completely and reopen while online; or hard-refresh (Ctrl + F5). |
| `git push` asks for a password | Sign in through the browser window Git opens, or use GitHub Desktop. |

---

## 9. Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `VITE_GOOGLE_CSE_ID` | No | Google Programmable Search Engine ID. If missing (or left as the placeholder), Google results are skipped silently. |

---

## 10. How it works (for developers)

```text
src/
├── App.tsx                 shell: header, routing, <html lang/dir/theme> sync, offline banner
├── i18n/                   en.ts (source of truth), fa.ts (type-checked against en), useI18n()
├── data/
│   └── persianEnglishDictionary.ts   curated Persian → English search terms (see below)
├── lib/
│   ├── storage.ts          localStorage stores (settings, recent searches) via useSyncExternalStore
│   ├── bookmarks.ts        bookmark store, validation, merge, export/import
│   ├── router.ts           tiny router: ?q=…&f=…&xe=… for searches, #/bookmarks etc. for pages
│   ├── language.ts         Persian-script detection + orthography normalisation
│   ├── queryExpansion.ts   local dictionary lookup: Persian query → English search terms
│   ├── search.ts           parallel runner (Promise.allSettled), filters, facets
│   ├── ranking.ts          transparent weighted scoring (expansion matches count slightly less)
│   ├── dedupe.ts           merge results by normalized URL
│   └── useSearch.ts        hook: per-source state, partial failures, "load more", dual-round search
├── sources/                SearchSource adapters: vibeking, onesvibe, googleCse, github (+ curated links)
├── components/  pages/     UI
└── styles/                 tokens.css (themes) + global.css (CSS logical properties only)
public/                     manifest, icons, offline.html, sw.js (service worker)
```

- **Add a source:** create `src/sources/mysource.ts` exporting a `SearchSource`
  (`id`, `label`, `search()`, `isEnabled()`), then add it to `ALL_SOURCES` in `src/sources/index.ts`.
- **Extend the cross-lingual dictionary:** append one line per Persian term to
  `src/data/persianEnglishDictionary.ts` (see the how-to comment at the top of that file).
  Lookup normalises ی/ک, ZWNJ, diacritics and hamza forms automatically, so spell one key
  per term. English terms are sent as one joined extra query to every source and shown to
  the user as removable chips; nothing else needs to change.
- **Google integration:** the Programmable Search Element runs in `searchresults-only` mode inside a
  hidden container. Its "results ready" callback hands the raw results to VibeYaab (and stops Google from
  drawing its own markup) so they join the unified, ranked, bookmarkable list.
- **GitHub Pages path:** all asset URLs in `index.html`, the manifest and the service worker are
  relative, and the app inlines its JS/CSS into a single `index.html`, so no `base` setting is needed.
- **Service worker:** caches the app shell; navigation is network-first; cross-origin requests (all search
  APIs) are never intercepted or cached.
- **RTL:** the CSS uses logical properties (`margin-inline`, `inset-inline-start`, …); directional icons use
  the `.icon-mirror` class.
- Commands: `npm run dev`, `npm run build`, `npm run preview`, and `npx tsc --noEmit` for a type check.

---

## 11. Roadmap

- A small **serverless proxy** (e.g. Cloudflare Workers, free tier) to cache directory APIs and make
  optional GitHub search token-backed and less rate-limited.
- More structured sources as stable public APIs appear (YourAIProject, Open SaaS Directory, awesome-list
  snapshots).
- Server-side sort for VibeKing ("newest") and category/AI-tool filters.
- A "suggest a source" form (issue template or serverless endpoint).
- Optional tag editing / notes on bookmarks.

---

© VibeYaab. Free and open. Not affiliated with VibeKing, One's Vibe, GitHub or Google; results link to
their respective sources.
