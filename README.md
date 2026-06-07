# paste.lucafchala.com

> A minimal, static pastebin for the `lucafchala.com` network — short text snippets and a published PGP key, each at its own clean URL, with no database and no backend.

**Live:** [paste.lucafchala.com](https://paste.lucafchala.com) · **Stack:** static HTML/CSS/JS on Cloudflare Pages · **Build step:** none

Part of the [lucafchala.com ecosystem](https://github.com/lucafchala/lucafchala.com#the-ecosystem). Shared design system and conventions live in the [hub README](https://github.com/lucafchala/lucafchala.com#readme).

---

## What it is

**One sentence:** `paste.lucafchala.com` is a static pastebin where every paste is described once in `pastes.json` and rendered client‑side, with the index page listing all pastes and each `/<slug>` page fetching the same JSON to display one of them.

**In a paragraph:** It's a deliberately tiny pastebin: there is no editor, no auth, and no server. A single `pastes.json` holds every paste's content and metadata. The homepage (`index.html`) fetches that file and renders a bilingual list; each paste lives at `paste.lucafchala.com/<slug>/`, served by a per‑slug `index.html` that is a copy of the same template and resolves *which* paste to show from `location.pathname`. Pastes are created and edited from the [`dash`](https://github.com/lucafchala/dash.lucafchala.com) control panel, which commits an updated `pastes.json` and — for new pastes — a new `{slug}/index.html` directly into this repo. One paste is special‑cased: `type: "pgp"` renders a fingerprint + a "copy key" button instead of plain text.

---

## Architecture

- **Host:** Cloudflare Pages, static files from the repo root. Push to `main` → auto‑deploy.
- **Routing:** folder‑based. `paste.lucafchala.com/camera-gear/` serves `camera-gear/index.html`. Cloudflare's directory handling covers routes natively; `_redirects` only patches edge cases (e.g. the accented alias `/a-máscara` → `/a-mascara`).
- **Data:** one `pastes.json` is the source of truth for every paste; every page fetches it at runtime.
- **Caching:** `_headers` serves `pastes.json` with `Access-Control-Allow-Origin: *` (so other sites, like `dash`, can read it cross‑origin) and `Cache-Control: public, max-age=60`. A service worker (`sw.js`, cache `paste-v2`) precaches the shell and uses stale‑while‑revalidate.
- **No backend, no env vars, no secrets.**

## How a paste is stored

`pastes.json` shape:

```json
{
  "pastes": [
    {
      "slug": "camera-gear",
      "subtitle": "PHOTOGRAPHY GEAR",
      "description": "Lista de equipamentos fotográficos",
      "description_en": "Photography gear list",
      "lang": "en",
      "content": "Essentials\n\nCameras:\n- Sony A6700 (kit)\n…"
    },
    {
      "slug": "pgp",
      "subtitle": "PUBLIC KEY",
      "type": "pgp",
      "fingerprint": "48E7 3F6F A287 1E7B 86EF  EA64 8EC4 329A 369B 7B33",
      "content": "-----BEGIN PGP PUBLIC KEY BLOCK-----\n…"
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `slug` | URL path and title (`/<slug>/`) |
| `subtitle` | Small label shown on the `.rule` divider |
| `description` / `description_en` | Used on the index list (EN falls back to PT) |
| `lang` | `pt` or `en`; sets `<html lang>` on the paste page |
| `type` | omitted/`text` → rendered as a `<pre>` with URLs auto‑linked; `pgp` → fingerprint + UID + copy‑key button |
| `fingerprint` | PGP key fingerprint (only for `type: "pgp"`) |
| `content` | The paste body (`\n` for line breaks) |

The render logic (`renderText` / `renderPgp`) lives inline in each paste page; `text` pastes escape HTML and turn `https://…` into links, `pgp` pastes show metadata and a clipboard button.

---

## Prerequisites

- A text editor and `git` for manual edits.
- (Optional) a static server for local preview — `python3 -m http.server`, `npx serve`, or Live Server. Serve from the repo root so `/pastes.json` resolves.
- To add/edit pastes the supported way: the [`dash`](https://github.com/lucafchala/dash.lucafchala.com) control panel with a GitHub PAT configured.

No accounts or environment variables are needed to run or deploy this repo.

## Install & deploy

```bash
git clone https://github.com/lucafchala/paste.lucafchala.com.git
cd paste.lucafchala.com
python3 -m http.server 8000      # http://localhost:8000
# edit pastes.json (and add a {slug}/ folder for new pastes), then:
git push origin main             # Cloudflare Pages deploys automatically
```

### Adding a paste by hand (if not using `dash`)

1. Append an entry to `pastes.json`.
2. Create `‹slug›/index.html` as a copy of [`_paste-template.html`](./_paste-template.html) (the same self‑contained page every paste uses — it reads the slug from the URL).
3. Commit and push.

> The supported path is to do this in `dash`, which writes `pastes.json` and the new `{slug}/index.html` for you.

---

## File structure

```
.
├── index.html               # Bilingual index — fetches pastes.json, lists all pastes
├── pastes.json              # Source of truth for every paste (content + metadata)
├── _paste-template.html     # The template each {slug}/index.html is cloned from
├── _redirects               # Cloudflare Pages edge-case routes (e.g. /a-máscara → /a-mascara)
├── _headers                 # CORS + cache headers for /pastes.json
├── sw.js                    # Service worker (cache "paste-v2", stale-while-revalidate)
├── icon.svg                 # Site icon
└── ‹slug›/index.html        # One folder per paste — a-mascara/, camera-gear/, e-mail-me/,
                             #   nirvana-e-a-cultura-do-ultrarromantismo/, vela_f5-2024/, pgp/,
                             #   cloudspot_deprecation/, teste/  (each is the cloned template)
```

`cloudspot_deprecation/` is a notice page that several deprecated event galleries in the PURL list redirect to.

---

## Design

Uses the shared ecosystem design system — dark `#0d0c0a` / amber `#c08030`, **Cormorant Garamond** (paste titles) + **JetBrains Mono** (paste bodies, in a `white-space: pre-wrap` block), the grain overlay, the `rise` animation, and the `.rule` divider. Paste pages are PT/EN aware via each paste's `lang`.

➡️ **Canonical tokens, fonts, and components:** [lucafchala.com → Design System](https://github.com/lucafchala/lucafchala.com#design-system). Linked, not duplicated, so the network stays consistent.

---

## Status

**In production.** Content is managed through `dash`; treat `pastes.json` and the per‑slug folders as generated unless you're deliberately editing by hand.
