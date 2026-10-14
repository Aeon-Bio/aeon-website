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

// The view: it rests over the plate where changes come from, goes down through the floor of a
// well when a change has landed there to watch the cells answer, and comes back up when it has
// been seen. Nothing moves the view but a change, a drag, or the end of watching.
test('the view goes to see what a change does, and comes back', () => {
	const { source } = compileSvelte(FILE);
	assert.match(
		source,
		/const HOME = \{ tx: 420, ty: 410, az: -6 \* D2R, el: 52 \* D2R, dist: 2600, f: 2600 \* 1\.15, k: 0 \}/,
		'rests over the plate: every well a thing to press, the watcher seen underneath'
	);
	assert.match(
		source,
		/const below = \(w\) => \(\{\s*tx: w\.x,\s*ty: w\.y,\s*az: 0,\s*el: -90 \* D2R,\s*dist: 8000,\s*f: 8000 \* 3\.3,\s*k: 1\s*\}\)/,
		'the watcher’s own view of the well the change went into'
	);
	assert.match(
		source,
		/if \(d\.down && !quiet\) goDown\(d\.w, t\);/,
		'when the change lands, the view goes down to see what it does'
	);
	assert.match(
		source,
		/goTo\(below\(w\), t, true\);/,
		'through the floor by a cross-fade on the well, never an edge-on swing'
	);
	assert.match(source, /backAt = t \+ DWELL;/, 'and stays while the cells answer');
	assert.match(
		source,
		/if \(backAt > 0 && t >= backAt && !held && !grab\) \{\s*backAt = -1;\s*goTo\(HOME, t, true\);/,
		'then comes back up, unless the hand is on the plate'
	);
	assert.match(
		source,
		/1 - Math\.abs\(v\.k\)/,
		'the from-below frame is the same plate the same way round'
	);
	assert.doesNotMatch(
		source,
		/position: sticky|DESCENT|clockP|scrollP|PROTOCOL|STEER_|-r\.top \/ run/,
		'no pin, no scroll camera, no clock, no tour, nothing that follows the pointer by itself'
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

// The hand on the view: grab the stage and drag, and the view turns about where it rests on its
// own axes (a tilt, never a spin), closely while held, settling back when let go.
test('a drag turns the view in the hand; nothing follows the pointer by itself', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /const TILT_X = 30 \* D2R;/, 'a turn in the hand');
	assert.match(
		source,
		/e = rot\(e, up, look\.x \* TILT_X\);\s*e = rot\(e, right, look\.y \* TILT_Y\);/,
		'about the view’s own axes: a tilt, never a spin'
	);
	assert.match(
		source,
		/takeHold\(ev\); \/\/ not on a well: the hand has the view/,
		'a press off a well grabs the view'
	);
	assert.match(
		source,
		/> 10\) abandon\(ev\);/,
		'a press on a well that moves on is a grab, not a change'
	);
	assert.match(
		source,
		/grab\.ox \+ \(ev\.clientX - grab\.x\) \/ \(GRAB_SPAN \* r\.width\)/,
		'the turn is the drag, relative, never the pointer’s place'
	);
	assert.match(source, /look\.tx = look\.ty = 0; \/\/ let go/, 'let go and it settles back');
	assert.match(
		source,
		/Math\.exp\(-dms \/ \(grab \? 60 : 420\)\)/,
		'closely while held, with the weight of a thing when let go'
	);
	assert.doesNotMatch(
		source,
		/\(ev\.clientX - r\.left\) \/ r\.width\) \* 2 - 1/,
		'no hover steering: the pointer’s place moves nothing'
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
	assert.match(
		source,
		/drops\[drops\.length - 1\]\.down = true; \/\/ and the view goes to see what it does/,
		'the reader’s change is watched'
	);
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

// The robot: the grammar a cause is earned in, as an answer to the reader's act. One change on
// arrival shows what is done here; after the reader's first change, the same change again in the
// rest of the row; after the second, a row at three strengths; a row is never touched. The
// sentences name what the light has shown, whoever caused it, and only in a view it can be seen in.
test('the robot answers the reader’s act with the grammar a cause is earned in', () => {
	const { source } = compileSvelte(FILE);
	assert.match(
		source,
		/schedule\(t \+ 0\.8, NAMED\.M0, 1\);\s*plan\[0\]\.down = true;/,
		'one change on arrival, watched: this is where a change is put in, and what it does'
	);
	assert.match(
		source,
		/answer\(w, drop\.dose\); \/\/ the robot answers once the view is back up/,
		'the robot answers once the view is back up, not before'
	);
	assert.match(
		source,
		/if \(readerN === 1\) \{\s*let i = 0;\s*for \(const o of rowOf\(w\.r\)\)\s*if \(o !== w\) later\(o, i\+\+, dose\);/,
		'first: the same change again, in the rest of the row'
	);
	assert.match(
		source,
		/const STRENGTHS = \[0\.3, 0\.55, 1\];/,
		'then three strengths, a geometric series'
	);
	assert.match(
		source,
		/row\.every\(\(o\) => !o\.doses\.length\)\) \|\| rows\[0\]/,
		'in a row nobody has touched'
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
	says(source, 'below', 'We watch from below.', 'the watcher’s own view');
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
