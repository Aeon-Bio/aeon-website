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
		/if \(arrived && clock0 < 0\) clock0 = t;/,
		'the robot’s clock starts when the reader has arrived'
	);
});

// The descent: the stage is pinned and the camera descends on the robot's clock, from above the
// plate where changes come from, down the side where the plate is a thing, through the floor to
// where we watch, and back to the whole plate from below. Nothing has to be scrolled to see it;
// the scroll can only hurry it. A mouse over the stage turns the view about the station.
test('the clock is the camera, the scroll can only hurry it, the mouse turns it in the hand', () => {
	const { source } = compileSvelte(FILE);
	assert.match(
		source,
		/const ABOVE = \{ tx: 400, ty: 400, az: 0, el: 90 \* D2R, dist: 8000, f: 8000 \* 0\.95, k: -1 \}/,
		'opens from above: the robot’s view'
	);
	assert.match(
		source,
		/const SYSTEM = \{ tx: 420, ty: 430, az: -5 \* D2R, el: 22 \* D2R/,
		'the side, low over the plate'
	);
	assert.match(
		source,
		/const MACRO = \{ tx: 200, ty: 392, az: 0, el: -90 \* D2R, dist: 8000, f: 8000 \* 3\.3/,
		'close on one well, from below'
	);
	assert.match(
		source,
		/const PLATE = \{ tx: 400, ty: 400, az: 0, el: -90 \* D2R, dist: 8000, f: 8000, k: 1 \}/,
		'the whole plate from below'
	);
	assert.match(
		source,
		/const DESCENT = \[[\s\S]*cam: ABOVE \}[\s\S]*cam: SYSTEM \}[\s\S]*cam: SYSTEM_DRIFT \}[\s\S]*cam: CLOSE \}[\s\S]*cam: MACRO, fade: true \}[\s\S]*cam: MACRO \}[\s\S]*cam: PLATE \}[\s\S]*\];/,
		'in order: above, side, drift, close, through the floor, the well, the plate'
	);
	assert.match(
		source,
		/cam: MACRO, fade: true/,
		'through the floor by a cross-fade on the well, never an edge-on swing'
	);
	assert.match(
		source,
		/1 - Math\.abs\(v\.k\)/,
		'the from-above frame is the same plate the same way round: the descent never mirrors it'
	);
	assert.match(
		source,
		/\{ at: 32, cam: MACRO, fade: true \}/,
		'through the floor during the night (NIGHT = [27, 32])'
	);
	assert.match(
		source,
		/const clockP = clock0 >= 0 \? Math\.min\(1, \(t - clock0\) \/ DESCENT_T\) : 0;/,
		'the camera’s place on the descent is the robot’s clock from the reader’s arrival'
	);
	assert.match(source, /-r\.top \/ run/, 'and the scroll’s place in the stage');
	assert.match(
		source,
		/pTarget = Math\.max\(clockP, scrollP\);/,
		'whichever is further down: nothing has to be scrolled, scrolling can only hurry'
	);
	assert.match(
		source,
		/Math\.exp\(-dms \/ 90\)/,
		'the camera follows with a little weight and no lag worth the name'
	);
	assert.match(source, /const STEER_AZ = 22 \* D2R;/, 'the mouse turns the view about the station');
	assert.match(
		source,
		/const az = v\.az \+ look\.x \* STEER_AZ;/,
		'in every view, the fade’s two halves included'
	);
	assert.match(
		source,
		/if \(ev\.pointerType !== 'mouse'\) return;/,
		'a finger does not steer: it scrolls or it is a hand on a well'
	);
	assert.match(
		source,
		/look\.tx = look\.ty = 0; \/\/ the hand has left/,
		'the view settles back when the hand leaves'
	);
	assert.match(
		source,
		/if \(!held\) \{\s*const kl = 1 - Math\.exp\(-dms \/ 160\);/,
		'with weight, and still while a change forms'
	);
	assert.doesNotMatch(
		source,
		/preventDefault|scroll-snap|scrollTo\(|scrollIntoView/,
		'the page scrolls as a page: nothing is hijacked or snapped'
	);
	assert.match(source, /position: sticky;/, 'the stage is pinned');
	assert.match(source, /height: 100svh;/, 'for one screen');
	assert.match(source, /<slot \/>/, 'the page’s stations scroll over it');
	assert.match(
		source,
		/Object\.assign\(cam, SYSTEM\);\s*draw\(t\);\s*caption = STILL;/,
		'reduced motion: one exposure from the side with the maps settled and one sentence'
	);
});

// The hand: press a well and a change forms above it, from the same side of the well as the
// robot’s; hold and it grows; let go and it falls. The watcher goes to the well about to change.
test('the hand: press a well, a change forms above it; hold and it grows; let go and it falls', () => {
	const { source } = compileSvelte(FILE);
	for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'])
		assert.match(source, new RegExp(`addEventListener\\('${ev}'`), ev);
	assert.match(
		source,
		/function unproj\(px, py\)/,
		'the hand reaches through whatever view it is in'
	);
	assert.match(source, /forming: true/, 'a change forms under the hand');
	assert.match(
		source,
		/0\.45 \+ 0\.55 \* smooth\(\(t - held\.drop\.t0 - 0\.1\) \/ HOLD_T\)/,
		'the longer the hold, the stronger the change'
	);
	assert.match(source, /> 10\) abandon\(\)/, 'a moved finger is a scroll, not a change');
	assert.match(source, /release\(w, drop\.dose, tNow, 0\)/, 'let go and it falls at once');
	assert.match(
		source,
		/const d = R \* 0\.78;/,
		'one hand: the same place in every well, every time, whoever’s hand it is'
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
		/\.stage\.hand \{\s*cursor: pointer;/,
		'the only affordance drawn is the cursor, and only over a well'
	);
	assert.match(source, /const DROP_H = 150/, 'a change forms at a fixed height');
	assert.match(source, /DROP_H \* \(1 - fk \* fk\)/, 'and falls under gravity');
	assert.match(
		source,
		/0\.1 \+ 0\.6 \* \(1 - wide \/ 77\)/,
		'out of focus it is a soft disc of light, never nothing'
	);
});

// The robot: the grammar a cause is earned in, on its own clock from the reader’s arrival.
// The sentences name what the light has shown, whoever caused it, and only in a view it can be seen in.
test('the robot runs the grammar a cause is earned in; a sentence names what the light has shown', () => {
	const { source } = compileSvelte(FILE);
	assert.match(
		source,
		/const PROTOCOL = \[\s*\{ at: 0\.8, change: \['M0', 1\] \}/,
		'the first change, soon after arrival'
	);
	assert.match(
		source,
		/change: \['M1', 1\] \},\s*\{ at: [\d.]+, change: \['M2', 1\] \}/,
		'the same change again in the next wells of the row'
	);
	assert.match(
		source,
		/change: \['T0', 0\.3\] \}[\s\S]*change: \['T1', 0\.55\] \}[\s\S]*change: \['T2', 1\] \}/,
		'a geometric series, in order'
	);
	assert.doesNotMatch(source, /change: \['B[012]'/, 'a row is never touched by the robot');
	assert.match(source, /const NIGHT = \[27\.0, 32\.0\]/, 'a night before the day after');
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
	says(source, 'below', 'We watch from below.', 'the watcher’s own view');
	says(source, 'again', 'The same change, again.', 'replication');
	says(source, 'strengths', 'Three strengths.', 'dose');
	says(source, 'untouched', 'These were never touched.', 'control, there all along, named late');
	says(source, 'later', 'A day later. The same cells.', 'time');
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
});

test('the stage is full-bleed and pinned; words on the left, the world on the right; reduced motion keeps the square', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /CX = 0\.64;/, 'wide: the plate owns the right of the screen');
	assert.match(source, /CX = 0\.5;\s*CY = 0\.6;/, 'narrow: the plate below the words');
	assert.match(
		source,
		/\.still \.stage \{[\s\S]*aspect-ratio: 1;[\s\S]*max-width: 880px;[\s\S]*margin-inline: auto;/,
		'reduced motion: one square exposure up to 880px, centred'
	);
});
