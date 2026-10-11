# Staging deployment

- Root URL: https://aeon-website-staging.pages.dev/
- Per-deployment URL: https://e75efb79.aeon-website-staging.pages.dev
- Deployment id: e75efb79 (supersedes 1682b382)
- Pages project: aeon-website-staging (account 019d1184e655db74b7589794a2a2a533), branch `staging`
- Deployed at: 2026-10-11T07:56Z (hero line: "Open hardware for live-cell experiments."; F46)
- Source commit: 33cbf28 (worktree was dirty; uploaded with `--commit-dirty=true`)
- Deployed by: `bash scripts/deploy-staging.sh` (unmodified)

## Live check (2026-10-08T15:54:04Z)

Root URL returned HTTP 200 and the body contains the hero line verbatim:

> A cause is earned on living cells

Legacy strings checked and confirmed absent from the live HTML (root and per-deployment URL):

- `biomolecular causality` (case-insensitive)
- `CEO` (whole word)
- `one-row coupon` (case-insensitive)
- the operator-local deny-list (`tests/th/_deny.local.mjs`, git-ignored)

Custom domain staging.aeon.science is still pending its CNAME (operator-owned DNS; not touched here).
