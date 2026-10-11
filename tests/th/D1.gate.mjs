import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Dropped by the design brief: the perspective grid, random streaks, the glass chip
// face and the old logo. The particle field and viewport gradient stay as ground.
const GONE = [
	'src/lib/components/GridSystem.svelte',
	'src/lib/components/EnergyFlow.svelte',
	'src/lib/components/MolecularContainer.svelte',
	'src/lib/images/AeonLogo.svelte',
	'src/lib/images/AeonMark.svelte'
];
const GROUND = [
	'src/lib/components/ScrollDrivenParticleField.svelte',
	'src/lib/components/ViewportGradient.svelte'
];
const NAMES = GONE.map((p) => p.split('/').pop().replace('.svelte', ''));

function walk(dir, out = []) {
	for (const e of readdirSync(dir)) {
		const p = join(dir, e);
		if (statSync(p).isDirectory()) walk(p, out);
		else if (/\.(svelte|ts|js|mjs)$/.test(e)) out.push(p);
	}
	return out;
}

test('legacy layer files are gone', () => {
	for (const p of GONE) assert.ok(!existsSync(p), `${p} still exists`);
});

test('nothing under src imports a deleted module', () => {
	const files = walk('src');
	for (const f of files) {
		const s = readFileSync(f, 'utf8');
		for (const n of NAMES) assert.ok(!new RegExp(`\\b${n}\\b`).test(s), `${f} references ${n}`);
	}
});

test('the ground is mounted and tuned as dust, not a network', () => {
	for (const p of GROUND) assert.ok(existsSync(p), `${p} missing`);
	const page = readFileSync('src/routes/+page.svelte', 'utf8');
	assert.match(page, /<div class="background-layer" aria-hidden="true">/, 'background layer div');
	assert.match(page, /<ScrollDrivenParticleField \/>/, 'field mounted');
	assert.match(page, /<ViewportGradient\b/, 'gradient mounted');
	const field = readFileSync(GROUND[0], 'utf8');
	assert.match(field, /const DRAW_CONNECTIONS = false;/, 'connection pass off');
	assert.match(field, /const BASE_PARTICLE_COUNT = 120;/, '120 motes at 1920');
	assert.match(field, /const MIN_PARTICLE_COUNT = 60;/, '60 motes minimum');
	assert.match(field, /opacity: Math\.random\(\) \* 0\.16 \+ 0\.06,/, 'mote alpha 0.06–0.22');
	assert.match(field, /prefers-reduced-motion/, 'reduced motion honoured');
});

test('layout has no dead rules', () => {
	const s = readFileSync('src/routes/+layout.svelte', 'utf8');
	assert.doesNotMatch(s, /\.background-layer/, '.background-layer rule removed');
	assert.doesNotMatch(s, /footer a\s*\{/, 'footer a rule removed');
});
