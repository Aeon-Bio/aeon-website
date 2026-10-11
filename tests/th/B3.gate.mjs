import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileSvelte } from './_compile.mjs';

const FILE = 'src/lib/components/diagrams/InstrumentSection.svelte';

test('one material: light with halo, the palette only, the living thing in biolum', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /const PRIMARY = \[76, 201, 240\]/, 'primary');
	assert.match(source, /const BIOLUM = \[128, 255, 219\]/, 'biolum');
	assert.doesNotMatch(source, /rgba\(245,\s*245,\s*245/, 'no grey ink');
	assert.match(source, /globalCompositeOperation = 'lighter'/, 'light adds');
	assert.match(source, /const HS = 0\.25/, 'quarter-res halo plate like the mark');
	assert.match(source, /mix\(BIOLUM, WHITE/, 'cells and record in biolum');
});
