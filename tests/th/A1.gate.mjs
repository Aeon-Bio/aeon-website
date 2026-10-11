import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { compileSvelte, read } from './_compile.mjs';

const MARK = 'src/lib/images/AeonMarkLive.svelte';
const FAVICON = 'static/favicon.svg';
const APP = 'src/app.html';

test('AeonMarkLive.svelte exists and compiles', () => {
	assert.ok(existsSync(MARK), `${MARK} missing`);
	const { warnings } = compileSvelte(MARK);
	assert.equal(warnings.length, 0, `warnings: ${warnings.map((w) => w.code).join(', ')}`);
});

test('the live mark is the card exposure: same system, start, window and frame', () => {
	const { source } = compileSvelte(MARK);
	assert.match(
		source,
		/SKIP = 30000,\s*START = 3359,\s*WINDOW = 7000/,
		'card window (the printed exposure length)'
	);
	assert.match(source, /SX = 23,\s*SY = 15\.2,\s*OX = 500,\s*OY = 780/, 'card frame');
	assert.match(source, /\[0\.5, 0\.8, 1\.2\]/, 'card start');
	assert.match(source, /aeon-mark-1500\.webp/, 'static exposure underneath');
	assert.match(source, /prefers-reduced-motion/, 'reduced motion honoured');
	assert.match(source, /globalCompositeOperation = 'lighter'/, 'crossings add');
});

test('favicon.svg is standalone and on the deep-space ground', () => {
	assert.ok(existsSync(FAVICON), `${FAVICON} missing`);
	const svg = read(FAVICON);
	assert.match(svg, /<svg[^>]*viewBox="0 0 64 64"/, 'viewBox 0 0 64 64');
	assert.match(svg, /#1a1b2f/i, 'ground #1a1b2f');
	assert.match(svg, /<path/, 'a path');
	assert.doesNotMatch(svg, /<script|href="http|xlink:href="http/i, 'no scripts or external refs');
});

test('app.html points at favicon.svg and declares theme-color', () => {
	const html = read(APP);
	assert.match(html, /rel="icon"[^>]*favicon\.svg/, 'svg icon link');
	assert.match(html, /theme-color"[^>]*#1a1b2f/i, 'theme-color');
	assert.match(html, /%sveltekit\.head%/, 'head placeholder kept');
	assert.match(html, /%sveltekit\.body%/, 'body placeholder kept');
});
