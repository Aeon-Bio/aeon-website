# aeon.science — product truth

Written 2026-10-15 for the site rebuild. Facts only; the visual world lives in DESIGN.md, the page strategy in `.impeccable/briefs/home.md`.

## What it is

aeon.science is building an open instrument that asks living cells a question and keeps asking: a condition changes in one well of a standard plate while the plate stays where it is, the answer is watched in place over time against wells that were not touched, and the next change follows from the answer. What comes back is a model of cause with the evidence attached, in the line of Karen Sachs's causal networks from single-cell perturbation data (Science, 2005).

The instrument is in design. It has not held cells. There is no product to demo, no customer, no company yet (not incorporated anywhere). Two founders: Eric Jing Mockler (engineer) and Karen Sachs, PhD (CSO/CTO). Eric is in Kobe (Mirai Tech City / Cellhaus residency, Kobe University MIC lab access) until November 2026, running customer discovery with the people who run cell assays. Demo Day is 26 October 2026; the ask there is conversations, not money.

Horizon, stated once and low on the page: an instrument a lab or a hospital could own, asking a person's own cells which conditions make them work. Japan already has the regulatory ground for hospital-made autologous therapy; that is why Kobe.

## Audiences, in order of arrival

1. Scientists who received a wave-one email (potency, organoid, automation, perturbation-dynamics groups worldwide). Appraising in 20 seconds; know plates, controls, dose, time-lapse; reject explainer graphics.
2. Japanese hosts and introducers (FBRI, Kobe University, MIC office). Read `/ja`; need one clean sentence to relay and an honest stage.
3. The Demo Day room and strategics (Shimadzu, Panasonic, Air Water, investors): a phone, 30 seconds.
4. A person with no vocabulary: the horizon reader.
5. Karen: nothing claimed that her name cannot stand behind.

## Positioning

Readers versus askers. Imagers, plate readers, potency assays and forecast models sell a reading taken once; liquid handlers move fluid without watching. aeon closes the loop between change and answer on the same cells. The site never draws any other comparison.

## Proof that exists

Karen's Science 2005 paper and Scholar; Eric's GitHub, Gladstone / Answer ALS work, the INDRA belief model; the engineering design, public under CERN-OHL-S-2.0 at github.com/Aeon-Bio; the site itself as a working model of the loop. Founder photographs exist (`static/founders`).

## Public scope and never-say

Never name the OT-2 or any vendor's robot; never mention Raman/SRS, the bridge row module, 40x optics, microfluidics, prices, "patent pending", "potency driver", "CDMO", "AI", "platform", "automated imaging incubator", "perturbation-and-response automation platform", "we are biology studying itself". The deny-list gate (`tests/th/_deny.local.mjs`, git-ignored) is authoritative.

## Surfaces

One page, `/` (en) and `/ja` (ja, native copy, never a translation; flag new Japanese for a native check before it goes live). Forms: write to us (three steps) and follow (email). Legacy routes are gone.

## Stack

SvelteKit 2 / Svelte 5, Tailwind present but the page is hand-written CSS, canvas 2D for the mark and the plate, Cloudflare Pages (production from `main`, staging by direct upload via `scripts/deploy-staging.sh`). Gates: `node --test --test-isolation=none tests/th/*.gate.mjs`. Screenshots: Playwright (`node_modules/playwright`).

## Platform

web
