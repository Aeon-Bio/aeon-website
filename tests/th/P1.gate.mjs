import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileSvelte } from './_compile.mjs';
import { existsSync } from 'node:fs';
const DENY = existsSync(new URL('./_deny.local.mjs', import.meta.url))
	? (await import('./_deny.local.mjs')).P1
	: [];

const FILE = 'src/routes/+page.svelte';
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
	assert.match(hero, /<h1 id="hero-heading">Change something\. Watch\.<\/h1>/, 'h1');
	assert.match(hero, /class="line">Open hardware for live-cell experiments\.</, 'italic line');
	assert.match(hero, /class="wordmark">aeon<span>\.science<\/span>/, 'wordmark');
	assert.equal((hero.match(/<a\b/g) || []).length, 1, 'one link in the hero');
	assert.doesNotMatch(
		hero,
		/class="tagline"|cta-primary|cta-secondary|<button/,
		'no hero paragraph or button chrome'
	);
	assert.match(
		source,
		/keeps cells alive in standard plates/,
		'the instrument sentence moved below the fold'
	);
	assert.match(source, /Co-founder &amp; Engineer|Co-founder & Engineer/, 'Eric role');
	assert.match(source, /Co-founder · CSO\/CTO/, 'Karen role');
	assert.match(source, /const SHOW_CONTACT = true/, 'contact shown');
	assert.match(source, /id="readout-section"/, 'readout section');
	assert.match(source, /https:\/\/github\.com\/Aeon-Bio"/, 'org link');
});

test('no forbidden strings', () => {
	const { source } = compileSvelte(FILE);
	for (const re of FORBIDDEN) assert.doesNotMatch(source, re, `forbidden: ${re}`);
});
