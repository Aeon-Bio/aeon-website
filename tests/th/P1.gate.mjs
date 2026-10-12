import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileSvelte } from './_compile.mjs';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
// copy lives in the messages module; the page renders it by key (or, before i18n, literally)
const { en } = await import(pathToFileURL(resolve('src/lib/i18n/en.ts')).href);
const at = (key) => key.split('.').reduce((o, k) => o?.[k], en);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** en.<key> is exactly `value`, and `src` renders it: the literal (raw or &amp;-escaped) or a reference to the key */
function renders(src, key, value, label) {
	assert.equal(at(key), value, `en.${key} (${label})`);
	const literal = src.includes(value) || src.includes(value.replace(/&/g, '&amp;'));
	const ref = new RegExp(`\\b${esc(key)}\\b`).test(src);
	assert.ok(literal || ref, `page does not render en.${key} (${label})`);
}
const DENY = existsSync(new URL('./_deny.local.mjs', import.meta.url))
	? (await import('./_deny.local.mjs')).P1
	: [];

const FILE = 'src/routes/[[lang=lang]]/+page.svelte';
// dropped by the design brief: tropes, chip faces, a second attractor, the old logo
const LEGACY = [
	'GridSystem',
	'EnergyFlow',
	'MolecularContainer',
	'ConcernCanvas',
	'AttractorPlane',
	'AeonLogo'
];
const FORBIDDEN = DENY;

test('+page.svelte compiles', () => {
	const { warnings } = compileSvelte(FILE);
	const unused = warnings.filter((w) => /css_unused_selector/.test(w.code || ''));
	assert.equal(
		unused.length,
		0,
		`unused CSS selectors: ${unused.map((w) => w.message).join('; ')}`
	);
});

test('mounts the live mark and none of the dropped layers', () => {
	const { source } = compileSvelte(FILE);
	assert.match(
		source,
		/import AeonMarkLive from '\$lib\/images\/AeonMarkLive\.svelte'/,
		'AeonMarkLive import'
	);
	assert.match(source, /<AeonMarkLive\b/, 'live mark rendered');
	for (const name of LEGACY) assert.ok(!source.includes(name), `legacy reference present: ${name}`);
	assert.match(source, /class="background-layer"/, 'the ground is mounted');
});

test('hero carries exactly the brief: wordmark, one line, four-word h1, one cue', () => {
	const { source } = compileSvelte(FILE);
	const hero = source.slice(
		source.indexOf('<section id="hero-section"'),
		source.indexOf('<!-- 01')
	);
	renders(hero, 'hero.h1', 'Change something. Watch.', 'h1');
	assert.match(
		hero,
		/<h1 id="hero-heading">(?:Change something\. Watch\.|[^<]*\{[^}]*hero\.h1[\s\S]*?)<\/h1>/,
		'h1'
	);
	renders(hero, 'hero.line', 'Open hardware for live-cell experiments.', 'italic line');
	assert.match(
		hero,
		/class="line">(?:Open hardware for live-cell experiments\.|\{[^}]*hero\.line\})</,
		'italic line'
	);
	assert.match(hero, /class="wordmark">aeon<span>\.science<\/span>/, 'wordmark');
	// the EN/JA switch (a quiet text link in the wordmark row) is the brief's one addition
	assert.equal((hero.match(/<a\b[^>]*class="lang-switch"/g) || []).length, 1, 'one language switch, in the hero');
	assert.equal((hero.match(/<a\b(?![^>]*class="lang-switch")/g) || []).length, 1, 'one link in the hero');
	assert.doesNotMatch(
		hero,
		/class="tagline"|cta-primary|cta-secondary|<button/,
		'no hero paragraph or button chrome'
	);
	assert.match(at('meta.description'), /keeps cells alive in standard plates/, 'the instrument sentence moved below the fold');
	renders(source, 'meta.description', at('meta.description'), 'the instrument sentence moved below the fold');
	renders(source, 'eric.role', 'Co-founder & Engineer', 'Eric role');
	renders(source, 'karen.role', 'Co-founder · CSO/CTO', 'Karen role');
	assert.match(source, /const SHOW_CONTACT = true/, 'contact shown');
	assert.match(source, /id="readout-section"/, 'readout section');
	assert.match(source, /https:\/\/github\.com\/Aeon-Bio"/, 'org link');
});

test('no forbidden strings', () => {
	const { source } = compileSvelte(FILE);
	for (const re of FORBIDDEN) assert.doesNotMatch(source, re, `forbidden: ${re}`);
});
