import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileSvelte } from './_compile.mjs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const FILE = 'src/lib/components/diagrams/InstrumentSection.svelte';
const { en } = await import(pathToFileURL(resolve('src/lib/i18n/en.ts')).href);
const cellMod = await import(pathToFileURL(resolve('src/lib/components/diagrams/cell.js')).href);

// One cell, kept: one living cell, a drop arrives, the cell answers in light, the next drop comes to
// the same cell. No plate, no chart, no bead to decode. The instrument asks three times on arrival
// and keeps asking; a click asks from the side it came. Nothing else moves.
test('one cell: a breathing body, a drop, light from where it touched; no plate, no record, no chart', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /function shape\(th, t\)/, 'the body is a shape that breathes');
	assert.match(source, /const BREATH = /, 'the breath is bounded');
	assert.match(source, /ripples\.push/, 'the membrane takes the drop in with a ripple');
	assert.match(source, /answers\.push/, 'the cell answers from where the drop touched');
	assert.match(source, /trace = Math\.min/, 'the cell keeps a trace of every answer');
	assert.doesNotMatch(source, /WELLS|PITCH|wellAt|Record|bench\.js|hill\(/, 'no plate, no wells, no record');
	assert.doesNotMatch(source, /@keyframes|animation:/, 'no CSS loop');
	assert.doesNotMatch(source, /PATROL|caused: false/, 'nothing moves that is not the question or the answer');
	assert.ok(!existsSync('src/lib/components/diagrams/Record.svelte'), 'the record is gone');
	assert.ok(!existsSync('src/lib/components/diagrams/bench.js'), 'the bench store is gone');
});

test('the gesture is one tap; the drop comes from the side it came; the keyboard asks through a button', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /addEventListener\('click'/, 'a click is a tap, and never a scroll');
	assert.match(source, /Math\.atan2\(y, x\)/, 'the drop comes from the side the tap came');
	assert.match(source, /const TAP = /, 'one strength for every tap');
	assert.doesNotMatch(source, /pointerdown|pointermove|keydown|HOLD_T|crosshair/, 'no press-and-hold, no hover state, no keyboard grammar');
	assert.match(source, /askNext = \(\) =>/, 'the keyboard button asks');
	assert.match(source, /role="img"[\s\S]*?aria-label=\{m\.a11y\.figure\}/, 'the figure has its name');
});

test('the instrument asks three times on arrival, a little, too much, between, and keeps asking', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /const FIRST = \[0\.35, 1\.0, 0\.6\]/, 'the first three strengths');
	assert.match(source, /const AGAIN = /, 'the next question follows the answer');
	assert.match(source, /const REST = /, 'then it keeps asking, slower');
	assert.match(source, /nextAt = t \+ ARRIVAL/, 'the first question comes as the visitor arrives');
	assert.equal(typeof cellMod.stillMode.subscribe, 'function', 'reduced motion is a store');
});

test('the words name it once: one person, one cell, asked and kept; no count line in motion; the horizon sits beside the figure', () => {
	assert.equal(en.dish.h2a, 'One person’s cell.');
	assert.equal(en.dish.h2b, 'Asked, and asked again.');
	assert.match(en.dish.lede, /Nothing is destroyed to be read/, 'the lede says what the difference is, once');
	assert.match(en.dish.horizon, /hospital/, 'the horizon sits beside the figure');
	assert.deepEqual(Object.keys(en.record), ['still'], 'no count line: the figure shows the asking; one sentence only under reduced motion');
	assert.ok(!('beats' in en) && !('result' in en.readout), 'no beats, no row result');
	assert.match(en.a11y.figure, /Tap or click the cell/, 'the figure description says how to act');
	assert.match(en.a11y.put, /Ask/, 'the keyboard button is named');
});
