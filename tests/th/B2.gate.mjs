import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileSvelte } from './_compile.mjs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const FILE = 'src/lib/components/diagrams/InstrumentSection.svelte';
const RECORD = 'src/lib/components/diagrams/Record.svelte';
const { en } = await import(pathToFileURL(resolve('src/lib/i18n/en.ts')).href);
const benchMod = await import(pathToFileURL(resolve('src/lib/components/diagrams/bench.js')).href);

// The bench: the instrument does the experiment in the open, and one tap puts one more change in.
// The cells answer on physical time; the instrument follows each answer with the next change,
// chosen from how many answered; the record draws the changed wells as themselves with the bead
// that went in under each. No clock the visitor waits for, no camera, no captions carrying the
// structure, no grammar to learn: a click is the gesture on every device.
test('the process is physical and heterogeneous, not a CSS loop or a uniform wave', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /const FRONT_T = /, 'a change takes time to cross a well');
	assert.match(source, /function kernel\(/, 'an answer has kinetics');
	assert.match(source, /quiet: rnd\(\) < /, 'some cells never answer');
	assert.match(source, /thr: Math\.pow\(rnd\(\)/, 'thresholds are drawn per cell, not per well');
	assert.doesNotMatch(source, /caused: false|PATROL|Math\.sin\(t/, 'at rest the plate is still: no spontaneous flashes, no patrol, no shimmer');
	assert.doesNotMatch(source, /@keyframes|animation:/, 'no CSS loop');
});

test('the gesture is one tap at one strength, the same on every device; nothing to hold, hover or learn', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /addEventListener\('click'/, 'a click is a tap, and never a scroll');
	assert.match(source, /const DOSE_HAND = /, 'one strength for every tap');
	assert.match(source, /release\(w, DOSE_HAND, tNow, 0, true\)/, 'the tap puts it in at that strength, at once');
	assert.match(source, /const FRONT_T = 1\.0/, 'the change crosses the well within a second');
	assert.doesNotMatch(source, /pointerdown|pointermove|keydown|HOLD_T|BASE\b|crosshair/, 'no press-and-hold, no hover state, no keyboard grammar');
	assert.doesNotMatch(source, /PASS_T|hover steer|scrollY|wheel/, 'no hover-dispense, no scroll camera');
	assert.doesNotMatch(source, /caption|m\.beats/, 'no captions over the plate');
	assert.match(source, /putNext = \(\) =>/, 'the keyboard button puts a change into the next well');
});

test('the view never moves and the instrument answers only an answer', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /camera\(HOME\)/, 'one view');
	assert.doesNotMatch(source, /const cam = |lerpCam|\btween\b|requestAnimationFrame\(.*cam/, 'no camera motion');
	assert.match(source, /function follow\(/, 'the instrument follows an answered well');
	assert.match(source, /nextDose\(w\.dose, w\.point\.f\)/, 'the next strength is chosen from the fraction that answered');
	assert.match(source, /const SETTLE = /, 'an answer is read after it has settled');
	assert.match(source, /schedule\(t \+ ARRIVAL, NAMED\.T1, DOSE_FIRST\)/, 'one weak change of its own on arrival');
	assert.match(source, /!o\.doses\.length/, 'a well is dosed once by the instrument; untouched wells stay untouched');
});

test('the record: the changed wells drawn as themselves, the bead that went in under each, no curve, no axes', () => {
	assert.equal(typeof benchMod.addPoint, 'function');
	assert.equal(typeof benchMod.changedWells, 'function');
	assert.equal(typeof benchMod.nextDose, 'function');
	assert.ok(!('refit' in benchMod) && !('hill' in benchMod), 'no fit, no curve');
	// the search looks for the half-answer: few answered → stronger, many → weaker
	assert.ok(benchMod.nextDose(0.3, 0.1) > 0.3, 'stronger after a weak answer');
	assert.ok(benchMod.nextDose(0.5, 0.9) < 0.5, 'weaker after a strong answer');
	assert.ok(benchMod.nextDose(1, 0) <= 1 && benchMod.nextDose(0.12, 1) >= 0.12, 'bounded');
	const { source: plate } = compileSvelte(FILE);
	assert.match(plate, /addPoint\(dose, mine, w, w\.impactT, w\.impactT \+ SETTLE\)/, 'a point, with its well, the moment the bead is on its way');
	assert.match(plate, /fractionOf\(w\)/, 'the point rises with the fraction answered');
	const { source: rec } = compileSvelte(RECORD);
	assert.match(rec, /well\.cells/, 'the record draws the well\'s own cells');
	assert.match(rec, /point\.dose/, 'the bead under each well is the size of its strength');
	assert.doesNotMatch(rec, /<text|fillText|axisLabel|drawTicks|hill\(|\.stroke\(\)|lineWidth/, 'no axes, no ticks, no labels, no curve, nothing outlined');
	assert.match(rec, /const HS = 0\.25/, 'the answering cells carry the mark\'s halo');
});

test('the words name the bench: two halves, one count line, no beats', () => {
	assert.equal(en.dish.h2a, 'One person’s cells.');
	assert.match(en.dish.h2b, /bead is a question/);
	assert.match(en.dish.lede, /next question follows from the answer/, 'the lede names cells, question, answer and the loop');
	assert.match(en.dish.horizon, /hospital/, 'the horizon sits beside the plate');
	assert.match(en.readout.result, /\{n\}.*\{k\}/, 'the readout says the row\'s answer in words');
	assert.equal(typeof benchMod.readRows, 'function');
	assert.ok(!('beats' in en), 'beats are gone');
	assert.match(en.record.many, /\{n\}.*\{k\}/, 'the count line carries both numbers');
	assert.match(en.a11y.figure, /Tap or click a well/, 'the figure description says how to act');
	assert.match(en.a11y.put, /next well/, 'the keyboard button is named');
});
