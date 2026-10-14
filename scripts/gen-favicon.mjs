// Regenerate static/favicon.svg from the shared Lorenz integrator.
//
//   node scripts/gen-favicon.mjs
//
// The tab icon is the card's exposure at tab scale: the same system, the same
// start as the live mark, the same frame (the card's x:z stretch), and the same
// three layers of light. A long trail fades as it ages, a soft halo under the
// recent window makes the butterfly read at 16 px as a glow rather than a wire,
// a thin near-white window lies on top, and the head of light sits at the end.
// Chrome's older favicon was a flat stroke from before the card existed; this
// one is the mark.
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
// the live mark's start and settling time (AeonMarkLive.svelte: START = 3359 after SKIP = 30000
// is where its window begins; the icon's window starts at the same place)
const START = [0.5, 0.8, 1.2];
const TRANSIENT = 30000 + 3359;
// 6000 steps (60 time units) is some twenty passes round the lobes, enough that both lobes
// are exposed evenly; the trail is written every other step so the file stays a tab icon
const KEEP = 6000;
const STRIDE = 2;
// the recent window, drawn bright and haloed
const WINDOW = 520;
// the card's frame stretches x against z (SX 23, SY 15.2)
const STRETCH = 23 / 15.2;

const PRIMARY = [76, 201, 240];
const BIOLUM = [128, 255, 219];
const WHITE = [245, 245, 245];

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
const n1 = (v) => v.toFixed(1);

/** @param {[number, number][]} pts @param {number} i0 @param {number} i1 */
function pathD(pts, i0, i1, stride = 1) {
	let d = '';
	for (let i = i0; i <= i1; i += stride)
		d += (i === i0 ? 'M' : 'L') + n1(pts[i][0]) + ' ' + n1(pts[i][1]);
	return d;
}

/** @returns {string} the favicon SVG text, with a trailing newline */
export function renderFavicon() {
	const raw = lorenzPoints({ start: START, transient: TRANSIENT, keep: KEEP }).map(
		([x, z]) => /** @type {[number, number]} */ ([x * STRETCH, z])
	);
	const pts = fitToBox(raw, SIZE, SIZE, MARGIN);
	const n = pts.length;
	const w0 = n - WINDOW;

	// the trail, in chunks that brighten toward the present (the mark's ramp: 0.06 + 0.94·t²)
	const CHUNKS = 8;
	let trail = '';
	for (let c = 0; c < CHUNKS; c++) {
		const i0 = Math.floor((w0 * c) / CHUNKS);
		const i1 = Math.min(w0, Math.floor((w0 * (c + 1)) / CHUNKS));
		const t = (c + 0.5) / CHUNKS;
		const a = 0.06 + 0.94 * t * t;
		trail += `<path stroke="${hex(PRIMARY)}" stroke-width="0.8" stroke-opacity="${(0.07 + 0.25 * a).toFixed(3)}" d="${pathD(pts, i0, i1, STRIDE)}"/>\n`;
	}

	// the recent window: hue runs PRIMARY → BIOLUM, lifted toward white on the top layer
	const WC = 3;
	let halo = '';
	let bright = '';
	for (let c = 0; c < WC; c++) {
		const i0 = w0 + Math.floor((WINDOW * c) / WC);
		const i1 = Math.min(n - 1, w0 + Math.floor((WINDOW * (c + 1)) / WC));
		const t = (c + 0.5) / WC;
		const hue = mix(PRIMARY, BIOLUM, t);
		const d = pathD(pts, i0, i1);
		halo += `<path stroke="${hex(hue)}" stroke-width="4" stroke-opacity="${(0.2 + 0.18 * t).toFixed(2)}" d="${d}"/>\n`;
		bright += `<path stroke="${hex(mix(hue, WHITE, 0.45))}" stroke-width="1.1" stroke-opacity="${(0.6 + 0.3 * t).toFixed(2)}" d="${d}"/>\n`;
	}

	// the head of light: three radial falloffs, as on the mark
	const [hx, hy] = pts[n - 1];
	const head = [6.5, 2.6, 1.0]
		.map((r, i) => `<circle cx="${n1(hx)}" cy="${n1(hy)}" r="${r}" fill="url(#h${i})"/>`)
		.join('\n');
	const defs = [
		[0, 0.5, PRIMARY],
		[1, 1, BIOLUM],
		[2, 1, WHITE]
	]
		.map(
			([i, peak, col]) =>
				`<radialGradient id="h${i}"><stop offset="0" stop-color="${hex(col)}" stop-opacity="${peak}"/>` +
				`<stop offset="0.35" stop-color="${hex(col)}" stop-opacity="${peak * 0.3}"/>` +
				`<stop offset="1" stop-color="${hex(col)}" stop-opacity="0"/></radialGradient>`
		)
		.join('\n');

	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">\n` +
		`<defs>\n${defs}\n` +
		`<filter id="halo" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.1"/></filter>\n` +
		`</defs>\n` +
		`<rect width="${SIZE}" height="${SIZE}" rx="12" fill="#1a1b2f"/>\n` +
		`<g fill="none" stroke-linecap="round" stroke-linejoin="round">\n` +
		`<g filter="url(#halo)">\n${halo}</g>\n` +
		trail +
		bright +
		`</g>\n` +
		head +
		`\n</svg>\n`
	);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
	writeFileSync(new URL('../static/favicon.svg', import.meta.url), renderFavicon());
}
