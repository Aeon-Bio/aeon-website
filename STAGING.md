# Staging deployment

- Root URL: https://aeon-website-staging.pages.dev/
- Per-deployment URL: https://18d14881.aeon-website-staging.pages.dev
- Deployment id: 18d14881 (supersedes e75efb79)
- Pages project: aeon-website-staging (account 019d1184e655db74b7589794a2a2a533), branch `staging`
- Deployed at: 2026-10-12 (hero mark centred on phones in WebKit; Japanese page)
- Source commit: e7d1880 (clean worktree)
- Deployed by: `bash scripts/deploy-staging.sh` with CLOUDFLARE_API_TOKEN, from a cloud session
- Checked: hero mark centre = viewport centre at 390px in WebKit and Chromium; tests/th gates all pass

## Deployment a1058268 (2026-10-15)

- Pages project: aeon-website-staging, direct upload from the `staging` worktree reset to `wip/2026-10-15-ask-the-plate`
- Source commit: 3ce6fa3 (the bench) plus the Japanese phone heading size in `src/app.css` (uncommitted at deploy time)
- Deployed by: `bash scripts/deploy-staging.sh`
- Checked: `/` and `/ja` serve the bench copy ("Put something in.", 「ひとつ、入れてみる。」); no film strings remain; gates 33/33 with the build

## Deployment 0d389c88 (2026-10-16)

- Pages project: aeon-website-staging, direct upload from the `staging` worktree reset to `wip/2026-10-15-ask-the-plate`
- Source commit: 19273e0 (the bench asks nothing: tap only, instrument runs its row in the open, record = the wells themselves)
- Deployed by: `bash scripts/deploy-staging.sh`
- Checked: `/` and `/ja` serve the tap copy in the figure description; no press-and-hold or curve strings remain; gates 33/33 with the build

## Deployment 8d112d6c (2026-10-16)

- Pages project: aeon-website-staging, direct upload from the `staging` worktree reset to `wip/2026-10-15-ask-the-plate`
- Source commit: 88b381b (the plate is still at rest; a tap is answered inside half a second; a row of three in about seven seconds)
- Deployed by: `bash scripts/deploy-staging.sh`
- Checked: `/` and `/ja` serve the still-plate figure description; gates 33/33 with the build

## Live check (2026-10-08T15:54:04Z)

Root URL returned HTTP 200 and the body contains the hero line verbatim:

> A cause is earned on living cells

Legacy strings checked and confirmed absent from the live HTML (root and per-deployment URL):

- `biomolecular causality` (case-insensitive)
- `CEO` (whole word)
- `one-row coupon` (case-insensitive)
- the operator-local deny-list (`tests/th/_deny.local.mjs`, git-ignored)

Custom domain staging.aeon.science is still pending its CNAME (operator-owned DNS; not touched here).
