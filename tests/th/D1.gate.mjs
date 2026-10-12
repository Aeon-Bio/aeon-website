import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Dropped by the design brief: the perspective grid, random streaks, the glass chip
// face and the old logo; then (2026-10-12) the particle field, whose motes read as
// smears on the screen. The viewport gradient alone is the ground.
const GONE = [
	'src/lib/components/GridSystem.svelte',
	'src/lib/components/EnergyFlow.svelte',
	'src/lib/components/MolecularContainer.svelte',
	'src/lib/components/ScrollDrivenParticleField.svelte',
	'src/lib/stores/interaction.ts',
	'src/lib/images/AeonLogo.svelte',
	'src/lib/images/AeonMark.svelte'
];
const GROUND = ['src/lib/components/ViewportGradient.svelte'];
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

test('the ground is one gradient and nothing else', () => {
	for (const p of GROUND) assert.ok(existsSync(p), `${p} missing`);
	const page = readFileSync('src/routes/+page.svelte', 'utf8');
	assert.match(page, /<div class="background-layer" aria-hidden="true">/, 'background layer div');
	assert.match(page, /<ViewportGradient\b/, 'gradient mounted');
	assert.doesNotMatch(page, /particle|mote|interactionState/i, 'no particle field, no dust coupling');
});

test('layout has no dead rules', () => {
	const s = readFileSync('src/routes/+layout.svelte', 'utf8');
	assert.doesNotMatch(s, /\.background-layer/, '.background-layer rule removed');
	assert.doesNotMatch(s, /footer a\s*\{/, 'footer a rule removed');
});
