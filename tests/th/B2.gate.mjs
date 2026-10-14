import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileSvelte } from './_compile.mjs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
// the beat sentences live in the messages module; the figure says them by key
const { en } = await import(pathToFileURL(resolve('src/lib/i18n/en.ts')).href);
/** en.beats.<key> is exactly `text`, and the figure can say it: by the robot's protocol or by what the light has shown */
function says(source, key, text, label) {
	assert.equal(en.beats[key], text, `en.beats.${key} (${label})`);
	assert.match(
		source,
		new RegExp(`say(?:: '|\\(')${key}'`),
		`${label}: the figure says en.beats.${key}`
	);
}

const FILE = 'src/lib/components/diagrams/InstrumentSection.svelte';

// One process on physical time, exposed: a change spreads through a well as a solute does,
// each cell answers with its own kinetics or not at all, spontaneous light is never evidence,
// and what answered because of a change settles slowly into a map across the plate.
test('the process is physical and heterogeneous, not a CSS loop or a uniform wave', () => {
	const { source } = compileSvelte(FILE);
	assert.doesNotMatch(
		source,
		/@keyframes|animation:|cubic-bezier|ripple/i,
		'no CSS loop or ripple'
	);
	assert.match(
		source,
		/Math\.sqrt\(Math\.min\(1, since \/ FRONT_T\)\)/,
		'the change spreads like a solute'
	);
	assert.match(
		source,
		/0\.4 \* Math\.exp\(-s \/ 1\.2\) \+ 0\.6 \* Math\.exp\(-s \/ 14\)/,
		'asymmetric kinetics: fast and slow clearance'
	);
	assert.match(source, /quiet: rnd\(\) < 0\.18/, 'some cells never answer');
	assert.match(source, /gain: logn\(/, 'gain varies across the population');
	assert.match(
		source,
		/thr: Math\.pow\(rnd\(\), 0\.635\)/,
		'a threshold per cell: dose recruits, it does not brighten'
	);
	assert.match(source, /dose < c\.thr/, 'recruitment by threshold');
	assert.match(source, /caused: false/, 'spontaneous activity is part of the picture');
	assert.match(
		source,
		/e\.caused \? kernel\(t - e\.t\) : flash\(t - e\.t\)/,
		'a spontaneous flash is brief and leaves nothing'
	);
	assert.match(
		source,
		/c\.evidence \+= 0\.22 \* c\.pending/,
		'only caused answers enter the slow layer'
	);
	assert.match(source, /c\.evidence \*= 1 - dt \/ 240/, 'the slow layer nearly does not forget');
	assert.doesNotMatch(
		source,
		/COUPLE|neighbou?rs?\b.*coupl/i,
		'cells are individuals, not a coupled lattice'
	);
	assert.doesNotMatch(
		source,
		/const CYCLE|dissolv/i,
		'the plate is never reset: what the reader did stays for the rest of the page'
	);
	assert.match(source, /prefers-reduced-motion/, 'reduced motion: one exposure');
	assert.match(source, /IntersectionObserver/, 'paused off-screen');
	assert.match(
		source,
		/if \(visible\) \{\s*const dms = lastNow/,
		'the cells’ clock runs only in view'
	);
	assert.match(
		source,
		/if \(arrived && clock0 < 0\) \{\s*clock0 = t;/,
		'the robot’s clock starts when the reader has arrived'
	);
});

// The view: it rests over the plate where changes come from, high enough that every well is a
// thing to aim at and a change is seen to fall, low enough that the plate is a thing with the
// watcher underneath. It never moves: nothing is pinned, nothing follows the scroll, the clock or
// the pointer. The whole plate stays on the screen, so an answer is seen beside the wells not touched.
test('the view rests over the plate and never moves', () => {
	const { source } = compileSvelte(FILE);
	assert.match(
		source,
		/const HOME = \{ tx: 420, ty: 410, az: -6 \* D2R, el: 52 \* D2R, dist: 2600, f: 2600 \* 1\.15, k: 0 \}/,
		'over the plate: every well a thing to aim at, the watcher seen underneath'
	);
	assert.match(source, /const cam = \{ \.\.\.HOME \};/, 'and that is where it stays');
	assert.match(
		source,
		/function draw\(t\) \{\s*render\(t, cam, ctx0\);\s*\}/,
		'one view, no cross-fade, no dive'
	);
	assert.doesNotMatch(
		source,
		/position: sticky|DESCENT|clockP|scrollP|PROTOCOL|STEER_|TILT_|\bDWELL\b|goDown|\btween\b|-r\.top \/ run/,
		'no pin, no scroll camera, no clock, no tour, no dive, no tilt, nothing that follows the pointer'
	);
	assert.doesNotMatch(
		source,
		/preventDefault|scroll-snap|scrollTo\(|scrollIntoView|wheel/,
		'the page scrolls as a page: nothing is hijacked or snapped'
	);
	assert.match(source, /height: 100svh;/, 'one screen for the plate');
	assert.match(source, /<slot \/>/, 'the page’s stations are set over and after it');
	assert.match(
		source,
		/Object\.assign\(cam, HOME\);\s*draw\(t\);\s*caption = STILL;/,
		'reduced motion: one exposure from over the plate with the maps settled and one sentence'
	);
});

// The hand is the dispenser: rest the pointer over a well and a change forms above it; the longer
// it rests, the stronger; move on and it falls; a hand merely passing over leaves nothing; full,
// it falls by itself. No click anywhere; on a device without a hover, one tap is one full change.
test('the hand is the dispenser: hover puts a change in; no clicks unless the device demands it', () => {
	const { source } = compileSvelte(FILE);
	for (const ev of ['pointermove', 'pointerdown', 'pointerleave'])
		assert.match(source, new RegExp(`addEventListener\\('${ev}'`), ev);
	assert.doesNotMatch(source, /addEventListener\('pointerup'/, 'nothing waits for a release');
	assert.match(source, /function unproj\(px, py\)/, 'the hand reaches through the view');
	assert.match(source, /forming: true/, 'a change forms under the hand');
	assert.match(
		source,
		/if \(hover && w === hover\.w\) return;\s*leave\(\);\s*if \(w\) enter\(w\);/,
		'the hand comes to rest over a well, or moves on'
	);
	assert.match(
		source,
		/d\.dose = 0\.45 \+ 0\.55 \* smooth\(\(t - d\.t0 - 0\.1\) \/ HOLD_T\);/,
		'the longer the hand rests, the stronger the change'
	);
	assert.match(
		source,
		/if \(t - d\.t0 >= HOLD_T \+ 0\.25\) \{[\s\S]*?put\(hover\.w, 1, 0\);/,
		'full, it falls by itself'
	);
	assert.match(
		source,
		/if \(tNow - drop\.t0 >= PASS_T\) put\(w, drop\.dose, 0\);/,
		'move on and it falls; a hand merely passing over leaves nothing'
	);
	assert.match(
		source,
		/if \(still \|\| ev\.pointerType !== 'mouse'\) return;/,
		'a finger does not hover'
	);
	assert.match(
		source,
		/\/\/ no hover on this device: one tap is one full change\s*const w = wellUnder\(ev\);\s*if \(!w\) return;\s*if \(clock0 < 0\) clock0 = tNow;\s*put\(w, 1, 0\.15\);/,
		'on touch, one tap is one full change'
	);
	assert.match(
		source,
		/\/\/ no click is needed; a click only drops what the hand already holds/,
		'a mouse click is never needed'
	);
	assert.match(
		source,
		/const d = R \* 0\.78;/,
		'the same place in every well, whoever’s hand it is'
	);
	assert.match(
		source,
		/w\.entryA = ENTRY_A \+ \(rnd\(\) - 0\.5\) \* 0\.16/,
		'the entry varies by well, never by hand'
	);
	assert.match(source, /watcher\.goal = w;/, 'the watcher goes to the well about to change');
	assert.match(source, /if \(clock0 < 0\) clock0 = tNow;/, 'a touch is an arrival too');
	assert.match(source, /touch-action: pan-y;/, 'the page still scrolls under a finger');
	assert.match(
		source,
		/\.stage\.hand \{\s*cursor: crosshair;/,
		'the only affordance drawn is the cursor, aimed, and only over a well'
	);
	assert.match(source, /const DROP_H = 150/, 'a change forms at a fixed height');
	assert.match(source, /DROP_H \* \(1 - fk \* fk\)/, 'and falls under gravity');
	assert.match(
		source,
		/const rest = 0\.11 \+ 0\.016 \* Math\.sin/,
		'at rest the plate is a plate before anything happens'
	);
});

// The robot: the grammar a cause is earned in, as an answer to the reader's act. One change on
// arrival shows what is done here; after the reader's first change, the same change again in the
// rest of the row; after the second, a row at three strengths; a row is never touched. The
// sentences name what the light has shown, whoever caused it, and only in a view it can be seen in.
test('the robot answers the reader’s act with the grammar a cause is earned in', () => {
	const { source } = compileSvelte(FILE);
	assert.match(
		source,
		/schedule\(t \+ 0\.8, NAMED\.M0, 1\);/,
		'one change on arrival: this is where a change is put in, and what it does'
	);
	assert.match(
		source,
		/answer\(w, dose, tNow \+ hoverT \+ FALL \+ ROBOT_AFTER\);/,
		'the robot answers once the reader’s change has landed, not before'
	);
	assert.match(
		source,
		/if \(readerN === 1\) \{\s*let i = 0;\s*for \(const o of rowOf\(w\.r\)\)\s*if \(o !== w\) schedule\(at \+ STAGGER \* i\+\+, o, dose\);/,
		'first: the same change again, in the rest of the row'
	);
	assert.match(
		source,
		/const STRENGTHS = \[0\.3, 0\.55, 1\];/,
		'then three strengths, a geometric series'
	);
	assert.match(
		source,
		/rows\.find\(\(row\) => row\.every\(\(o\) => !o\.doses\.length\)\);\s*if \(row\)/,
		'in a row nobody has touched, and in no row otherwise: a control is never spent'
	);
	assert.doesNotMatch(
		source,
		/readerN === 3|readerN >= 3/,
		'and then nothing more: the rest is the reader’s'
	);
	assert.match(source, /const HOVER = 0\.3/, 'the robot’s change waits before it is released');
	says(
		source,
		'above',
		'Changes come from above.',
		'named once the first change has landed, in a view from above or the side'
	);
	assert.match(
		source,
		/if \(landed > 0\) say\('above', 'high'\)/,
		'above: after the light, not before'
	);
	says(source, 'again', 'The same change, again.', 'replication');
	says(source, 'strengths', 'Three strengths.', 'dose');
	says(source, 'untouched', 'These were never touched.', 'control, there all along, named late');
	assert.match(
		source,
		/if \(said\.strengths && \[0, 1, 2\]\.some\(\(r\) => rowOf\(r\)\.every\(\(w\) => !w\.doses\.length\)\)\)/,
		'untouched: once the strengths have been seen and a row still has nothing in it'
	);
	assert.match(
		source,
		/const wide = v\.f < v\.dist \* 1\.5/,
		'a sentence about the plate waits for a view of the plate'
	);
	assert.match(
		source,
		/const high = v\.el > 0/,
		'a sentence about above waits for a view from above or the side'
	);
	assert.match(source, /m\.beats\[s\.key\]/, 'the sentence is the message, by key');
	assert.doesNotMatch(
		source,
		/or it is not|is earned\.'/,
		'no sermon: sentences name what was shown'
	);
	for (const v of Object.values(en.beats))
		assert.doesNotMatch(`${v}'`, /or it is not|is earned\.'/, 'no sermon in en.beats');
	assert.match(
		source,
		/for \(let r = -1; r <= 3; r\+\+\)/,
		'a ring of wells runs off the frame: a patch of something larger'
	);
	assert.match(source, /const OBS_Z = -110/, 'the watcher under the plate');
	assert.match(source, /the mask hides it between wells/, 'the plate known by what it hides');
	assert.match(
		source,
		/scatters through the body of the plate between wells/,
		'and the walk never breaks'
	);
	assert.match(
		source,
		/the exposure fades at the edges of the frame/,
		'no straight cuts through wells'
	);
	assert.match(
		source,
		/ctx\.createRadialGradient\(0, 0, 0, 0, 0, 1\);/,
		'the fade is an ellipse about the plate: no edge of it is straight'
	);
});

test('the stage is full-bleed; words on the left, the world on the right; reduced motion keeps the square', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /CX = 0\.64;/, 'wide: the plate owns the right of the screen');
	assert.match(source, /CX = 0\.5;\s*CY = 0\.6;/, 'narrow: the plate below the words');
	assert.match(
		source,
		/\.still \.stage \{[\s\S]*aspect-ratio: 1;[\s\S]*max-width: 880px;[\s\S]*margin-inline: auto;/,
		'reduced motion: one square exposure up to 880px, centred'
	);
});
