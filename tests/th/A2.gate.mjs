import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { compileSvelte, read } from './_compile.mjs';

const LORENZ = 'src/lib/images/lorenz.js';
const GEN = 'scripts/gen-favicon.mjs';
const FAVICON = 'static/favicon.svg';

async function load(p) {
	return import(pathToFileURL(resolve(p)).href);
}

test('lorenz.js exports a balanced two-lobe trajectory', async () => {
	assert.ok(existsSync(LORENZ), `${LORENZ} missing`);
	const m = await load(LORENZ);
	assert.equal(typeof m.lorenzPoints, 'function', 'lorenzPoints export');
	assert.equal(typeof m.fitToBox, 'function', 'fitToBox export');
	const pts = m.lorenzPoints({ transient: 3000, keep: 5000 });
	assert.ok(Array.isArray(pts) && pts.length >= 2000, `points: ${pts && pts.length}`);
	let left = 0,
		right = 0,
		switches = 0,
		prev = Math.sign(pts[0][0]);
	for (const [x] of pts) {
		if (x < 0) left++;
		else right++;
		const s = Math.sign(x);
		if (s !== 0 && s !== prev) {
			switches++;
			prev = s;
		}
	}
	const n = pts.length;
	assert.ok(left / n >= 0.3, `left lobe ${((left / n) * 100).toFixed(1)}% < 30%`);
	assert.ok(right / n >= 0.3, `right lobe ${((right / n) * 100).toFixed(1)}% < 30%`);
	assert.ok(switches >= 20, `only ${switches} lobe switches`);
	const fitted = m.fitToBox(pts, 100, 80, 6);
	for (const [x, y] of fitted) {
		assert.ok(
			x >= 6 - 1e-6 && x <= 94 + 1e-6 && y >= 6 - 1e-6 && y <= 74 + 1e-6,
			`point outside margin: ${x},${y}`
		);
	}
});

test('favicon.svg is byte-identical to the committed generator', async () => {
	assert.ok(existsSync(GEN), `${GEN} missing`);
	const g = await load(GEN);
	assert.equal(typeof g.renderFavicon, 'function', 'renderFavicon export');
	const rendered = g.renderFavicon();
	assert.match(rendered, /viewBox="0 0 64 64"/, 'viewBox');
	assert.match(rendered, /#1a1b2f/i, 'ground');
	assert.equal(read(FAVICON), rendered, 'static/favicon.svg differs from renderFavicon()');
});
