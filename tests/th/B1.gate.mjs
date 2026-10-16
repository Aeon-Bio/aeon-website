import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { compileSvelte } from './_compile.mjs';

const FILE = 'src/lib/components/diagrams/InstrumentSection.svelte';
const DENY = existsSync(new URL('./_deny.local.mjs', import.meta.url))
	? (await import('./_deny.local.mjs')).B1
	: [];

test('one cell, one gesture: a canvas exposure with no props, no labels, no equipment', () => {
	const { source, warnings } = compileSvelte(FILE);
	assert.equal(warnings.length, 0, `warnings: ${warnings.map((w) => w.code).join(', ')}`);
	assert.doesNotMatch(source, /export let/, 'no props');
	assert.match(source, /<canvas class="instrument"/, 'canvas');
	assert.match(source, /role="img"[\s\S]*?aria-label=\{m\.a11y\.figure\}/, 'accessible name on the wrapper');
	assert.match(source, /<button class="put"[\s\S]*?\{m\.a11y\.put\}/, 'the keyboard gets the one gesture as a button');
	assert.doesNotMatch(source, /role="application"|tabindex=/, 'no widget grammar for the plate itself');
	assert.doesNotMatch(source, /<svg|<li |class="label/, 'no SVG ink, no caption rows');
	assert.doesNotMatch(source, /lens|cone|gantry|pipette|nucleus|membrane diagram/i, 'no equipment drawn or named, no diagram of a cell');
	assert.doesNotMatch(source, /\.stroke\(\)|strokeStyle|lineWidth/, 'nothing outlined: every light is a field or a point');
});

test('no deny-listed term', () => {
	const { source } = compileSvelte(FILE);
	for (const re of DENY) assert.doesNotMatch(source, re, `forbidden: ${re}`);
});
