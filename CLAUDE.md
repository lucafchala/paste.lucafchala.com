# CLAUDE.md — paste.lucafchala.com

Static pastebin, no build step, Cloudflare Pages (push to `main` deploys). Read `README.md` for the full picture.

## Ownership — who writes which file

| File | Owner | Rule |
|---|---|---|
| `pastes.json` | **dash** (`genPastesJson`) | Source of truth. Hand edits are fine but keep the shape; dash reformats on its next save |
| `<slug>/index.html` with the `dash:paste-shell` marker | **dash** (`genPasteShell`) | Don't hand-edit. Change the generator in the dash repo, then "regenerar páginas" |
| `sitemap.xml` | **dash** (`genPasteSitemap`) | Regenerated on every paste save |
| `nirvana-…/`, `vela_f5-2024/`, `cloudspot_deprecation/` | hand-built | Custom layouts; the dash never touches pages without the marker. Listed in `HAND_BUILT` / `NOT_PASTES` in CI |
| `index.html`, `list.js`, `paste.js`, `paste.css`, `theme.js`, `sw.js`, `_headers`, `_redirects`, `robots.txt` | this repo | Edit here |

Rendering behaviour belongs in `paste.js` / `paste.css`, not in the shells. That way a change applies to every paste without regenerating pages.

## Rules

- **CSP is `script-src 'self'`.** No inline `<script>` (except JSON-LD data), no `on*=` attributes. Wire events with `addEventListener`. CI enforces this.
- **Every `<script>` tag has `data-cfasync="false"`** so Cloudflare Rocket Loader doesn't defer `theme.js`.
- **Theme/lang:** `theme.js` exposes `window.lfPrefs` (`wire(T)`, `t(key)`, `setLang`, `toggleTheme`, `onLang`). Page scripts register their strings with `lfPrefs.wire({pt:{…}, en:{…}})`. Elements use `data-i18n`, `data-i18n-html`, `data-i18n-attr="attr:key"`, and `data-lang-btn="pt|en"` / `#btn-theme` for the controls. Preferences live in the `lf_theme` / `lf_lang` cookies on `.lucafchala.com`, so every sibling site shares them.
- **Linkify on raw text, not escaped HTML** (`linkify()` in `paste.js`), so `&` in query strings and trailing punctuation are handled.
- **The PGP paste must stay complete.** CI verifies the CRC24 and recomputes the fingerprint. The same key lives in keys.lucafchala.com (`pgp.asc`) and proof.lucafchala.com (`pgp.asc`); update all three together.
- **Service worker:** bump `CACHE` in `sw.js` when the precache list changes. Never cache redirected/opaque/non-2xx responses.
- **Status monitor:** status.lucafchala.com checks that `/` contains `Paste`, and that `pastes.json` is valid with a non-empty `pastes` array.

## Checks

Run the steps of `.github/workflows/checks.yml` locally before pushing (they're plain bash/python/node).
