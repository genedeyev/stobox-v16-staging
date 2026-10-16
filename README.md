# stobox-v16-staging

> **Superseded by V17.** This repository is a frozen preview of the V16 website. It is not the live site, it is not maintained, and the figures and claims in its pages are as of 2026-09-08 and are not current. The live site is [stobox.io](https://www.stobox.io/).

![visibility](https://img.shields.io/badge/visibility-public-brightgreen) ![version](https://img.shields.io/badge/version-0.1.0-blue) ![status](https://img.shields.io/badge/status-superseded-lightgrey) ![indexing](https://img.shields.io/badge/search%20indexing-noindex-lightgrey) ![owner](https://img.shields.io/badge/owner-Stobox-blue)

## Status

**Superseded.** All commits are from 2026-09-08 and 2026-09-09. V16 was replaced by the V17 site, which is built from a different repository. Checked against the repository on 2026-10-16. Nothing here is updated any more.

## What it is and why it exists

A static export of the Stobox V16 site, produced for review before launch. It holds 1,925 files and 511 pages: the blog (index plus 346 pages), case studies (56), learn pages (22), guides (21), compare pages (12), essays (7), industries, solutions, reports and the product, company and investor pages, plus assets, `sitemap*.xml`, `rss*.xml`, `llms.txt` and `search-index.json`.

Every page carries `<meta name="robots" content="noindex,nofollow">` and `robots.txt` disallows everything, so search engines are asked not to index it. Absolute paths in the pages were rewritten to the `/stobox-v16-staging/` subpath of a GitHub Pages project site, which is why a copy only works under that path.

## When it was active

From 2026-09-08 (first build pushed) to 2026-09-09 (last commit). No change since.

## Where it runs

GitHub Pages, served from the root of the `main` branch at `https://genedeyev.github.io/stobox-v16-staging/`. GitHub reports the Pages build as `built` on 2026-10-16. There is no workflow, no server and no cron. Owner: Stobox.

## Repository layout

| Path | What it holds |
|---|---|
| `index.html`, `404.html` | Home page and error page |
| `blog/` | The blog index and 346 pages under it, with their images |
| `case-studies/`, `guides/`, `learn/`, `compare/`, `essays/`, `industries/`, `solutions/`, `reports/` | Content sections, one folder per page |
| `about/`, `team/`, `press/`, `legal/`, `faq/`, `contact/`, `subscribe/` and similar | Company and utility pages |
| `intelligence/`, `raisable/`, `compass/`, `mcp/`, `pricing/`, `readiness/`, `stbx/`, `stbu/`, `invest/`, `valuation/`, `for-investors/` | Product and investor pages |
| `assets/` | Stylesheets, scripts, fonts, images, share cards |
| `sitemap*.xml`, `rss*.xml`, `llms*.txt`, `search-index.json`, `robots.txt` | Generated infrastructure files |
| `_headers`, `_redirects` | Host configuration from the original build; GitHub Pages does not read them, so they have no effect here |
| `.well-known/security.txt` | Security contact file of the original build |
| `docs/` | The previous README (`docs/ARCHIVE.md`) |

## Quick start

To look at it locally, serve the repository from its parent folder so that the `/stobox-v16-staging/` prefix resolves:

```bash
cd ..                       # the folder that contains stobox-v16-staging
python3 -m http.server 8000
# open http://localhost:8000/stobox-v16-staging/
```

Checked on 2026-10-16: the home page and `/stbu/` return HTTP 200 this way. There is no build step in this repository.

## Configuration

None. No environment variables, no secrets.

## Deploy and operate

A push to `main` republishes the site through GitHub's built-in Pages build. Nothing is generated here: the pages were produced by builders that live in a separate private repository (`stobox-v16`), which is also superseded. Do not edit the HTML by hand. To take the preview offline, disable GitHub Pages in the repository settings or change the repository visibility.

## Versioning and releases

Semantic versioning in `VERSION`; there were no tags, so the first version is `0.1.0`. History is in [CHANGELOG.md](CHANGELOG.md). Tags are set by the repository coordinator after the documentation pull request is merged.

## Related

- `stobox-v16` (private): source, builders and the shipping gate for this export; superseded as well.
- `stobox-v15` (private): the repository that builds the live V17 site.

## Open items

- `TODO(owner)`: decide whether this repository and its Pages site stay public, or the repository goes private or is archived.
- `TODO(owner)`: choose a licence for this public repository (see Licence).

## Contributing

No further changes are expected. If a change is ever needed, use a branch and a pull request with an English description; do not edit generated pages by hand.

## Security

No secrets are stored here. To report a vulnerability in the Stobox website, use the contact in `.well-known/security.txt` or the contact on the live site.

## Licence

No licence is granted; all rights reserved.
