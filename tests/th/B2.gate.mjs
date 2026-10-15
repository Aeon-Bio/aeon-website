import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileSvelte } from './_compile.mjs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const FILE = 'src/lib/components/diagrams/InstrumentSection.svelte';
const RECORD = 'src/lib/components/diagrams/Record.svelte';
const { en } = await import(pathToFileURL(resolve('src/lib/i18n/en.ts')).href);
const benchMod = await import(pathToFileURL(resolve('src/lib/components/diagrams/bench.js')).href);

// The bench: press a well and a change goes in; the cells answer on physical time; the instrument
// follows each answer with the next change, chosen from how many answered; every change is a
// point in the record and three points make a curve. No clock the visitor waits for, no camera,
// no captions carrying the structure, and the same press on every device.
test('the process is physical and heterogeneous, not a CSS loop or a uniform wave', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /const FRONT_T = /, 'a change takes time to cross a well');
	assert.match(source, /function kernel\(/, 'an answer has kinetics');
	assert.match(source, /quiet: rnd\(\) < /, 'some cells never answer');
	assert.match(source, /thr: Math\.pow\(rnd\(\)/, 'thresholds are drawn per cell, not per well');
	assert.match(source, /caused: false/, 'spontaneous flashes exist and are not evidence');
	assert.doesNotMatch(source, /@keyframes|animation:/, 'no CSS loop');
});

test('the press is the gesture: hold for strength, release to drop, the same on mouse, touch and keyboard', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /addEventListener\('pointerdown'/, 'press');
	assert.match(source, /addEventListener\('pointerup'/, 'release');
	assert.match(source, /addEventListener\('pointercancel'/, 'a scroll is not a press');
	assert.match(source, /addEventListener\('keydown'/, 'keyboard press');
	assert.match(source, /addEventListener\('keyup'/, 'keyboard release');
	assert.match(source, /const HOLD_T = /, 'the hold sets the strength');
	assert.match(source, /const BASE = /, 'the briefest press still puts something in');
	assert.match(source, /touch-action: pan-y/, 'the page still scrolls under a finger');
	assert.doesNotMatch(source, /PASS_T|hover steer|scrollY|wheel/, 'no hover-dispense, no scroll camera');
	assert.doesNotMatch(source, /caption|m\.beats/, 'no captions over the plate');
});

test('the view never moves and the instrument answers only an answer', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /camera\(HOME\)/, 'one view');
	assert.doesNotMatch(source, /const cam = |lerpCam|\btween\b|requestAnimationFrame\(.*cam/, 'no camera motion');
	assert.match(source, /function follow\(/, 'the instrument follows an answered well');
	assert.match(source, /nextDose\(w\.dose, w\.point\.f\)/, 'the next strength is chosen from the fraction that answered');
	assert.match(source, /const SETTLE = /, 'an answer is read after it has settled');
	assert.match(source, /schedule\(t \+ ARRIVAL, NAMED\.T1, 0\.5\)/, 'one change of its own on arrival');
	assert.match(source, /!o\.doses\.length/, 'a well is dosed once by the instrument; untouched wells stay untouched');
});

test('the record: one point per change, rising as the cells answer, one curve from three', () => {
	assert.equal(typeof benchMod.addPoint, 'function');
	assert.equal(typeof benchMod.refit, 'function');
	assert.equal(typeof benchMod.nextDose, 'function');
	// the search looks for the half-answer: few answered → stronger, many → weaker
	assert.ok(benchMod.nextDose(0.5, 0.1) > 0.5, 'stronger after a weak answer');
	assert.ok(benchMod.nextDose(0.5, 0.9) < 0.5, 'weaker after a strong answer');
	assert.ok(benchMod.nextDose(1, 0) <= 1 && benchMod.nextDose(0.12, 1) >= 0.12, 'bounded');
	const { source: plate } = compileSvelte(FILE);
	assert.match(plate, /addPoint\(dose, mine, w\.r, w\.impactT, w\.impactT \+ SETTLE\)/, 'a point the moment the bead is on its way');
	assert.match(plate, /fractionOf\(w\)/, 'the point rises with the fraction answered');
	const { source: rec } = compileSvelte(RECORD);
	assert.match(rec, /hill\(d, shown\)/, 'the curve is the fitted one');
	assert.doesNotMatch(rec, /<text|fillText|axisLabel|drawTicks/, 'no axes, no ticks, no labels');
	assert.match(rec, /const HS = 0\.25/, 'the curve carries the mark\'s halo');
});

test('the words name the bench: two halves, one count line, no beats', () => {
	assert.equal(en.dish.h2a, 'Put something in.');
	assert.match(en.dish.h2b, /next change follows from the answer/);
	assert.ok(!('beats' in en), 'beats are gone');
	assert.match(en.record.many, /\{n\}.*\{k\}/, 'the count line carries both numbers');
	assert.match(en.a11y.figure, /Press a well/, 'the figure description says how to act');
});
