// Regenerate static/favicon.svg from the shared Lorenz integrator.
//
//   node scripts/gen-favicon.mjs
//
// `renderFavicon()` is pure (fixed start, RK4, one-decimal rounding) so the
// output is byte-identical on every run; the gate imports it and compares it
// against the committed file. Importing this module never writes to disk;
// only running it as the main module does.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { lorenzPoints, fitToBox } from '../src/lib/images/lorenz.js';

const SIZE = 64;
const MARGIN = 4;
// A 16 px tab icon cannot hold 5000 steps: the full trajectory rasterises to a
// solid wedge. A 600-step window (6 time units) after a 3800-step transient
// crosses between the lobes four times and splits ~50/50, so the butterfly is
// read from a few strands rather than a fill.
const TRANSIENT = 3800;
const KEEP = 600;

/** @returns {string} the favicon SVG text, with a trailing newline */
export function renderFavicon() {
	const pts = fitToBox(lorenzPoints({ transient: TRANSIENT, keep: KEEP }), SIZE, SIZE, MARGIN);
	const d = pts
		.map(([x, y], i) => (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1))
		.join('');
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">\n` +
		`<rect width="${SIZE}" height="${SIZE}" rx="12" fill="#1a1b2f"/>\n` +
		`<path fill="none" stroke="#4cc9f0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="${d}"/>\n` +
		`</svg>\n`
	);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
	writeFileSync(new URL('../static/favicon.svg', import.meta.url), renderFavicon());
}
