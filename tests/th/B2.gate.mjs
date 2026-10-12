import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileSvelte } from './_compile.mjs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
// the beat captions live in the messages module; the figure says them by key (or, before i18n, literally)
const { en } = await import(pathToFileURL(resolve('src/lib/i18n/en.ts')).href);
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** en.beats.<key> is exactly `text`, and a beat says it: `say: '<text>'` or `say: m.beats.<key>` */
function says(source, key, text, tail, label) {
	assert.equal(en.beats[key], text, `en.beats.${key} (${label})`);
	assert.match(source, new RegExp(`say: (?:'${esc(text)}'|m\\.beats\\.${key})${tail}`), label);
}

const FILE = 'src/lib/components/diagrams/InstrumentSection.svelte';

// One process on physical time, exposed: a change spreads through a well as a solute does,
// each cell answers with its own kinetics or not at all, spontaneous light is never evidence,
// and what answered because of a change settles slowly into a map across the plate.
test('the process is physical and heterogeneous, not a CSS loop or a uniform wave', () => {
	const { source } = compileSvelte(FILE);
	assert.doesNotMatch(source, /@keyframes|animation:|cubic-bezier|ripple/i, 'no CSS loop or ripple');
	assert.match(source, /Math\.sqrt\(Math\.min\(1, since \/ FRONT_T\)\)/, 'the change spreads like a solute');
	assert.match(source, /0\.4 \* Math\.exp\(-s \/ 1\.2\) \+ 0\.6 \* Math\.exp\(-s \/ 14\)/, 'asymmetric kinetics: fast and slow clearance');
	assert.match(source, /quiet: rnd\(\) < 0\.18/, 'some cells never answer');
	assert.match(source, /gain: logn\(/, 'gain varies across the population');
	assert.match(source, /thr: Math\.pow\(rnd\(\), 0\.635\)/, 'a threshold per cell: dose recruits, it does not brighten');
	assert.match(source, /dose < c\.thr/, 'recruitment by threshold');
	assert.match(source, /caused: false/, 'spontaneous activity is part of the picture');
	assert.match(source, /e\.caused \? kernel\(t - e\.t\) : flash\(t - e\.t\)/, 'a spontaneous flash is brief and leaves nothing');
	assert.match(source, /c\.evidence \+= 0\.22 \* c\.pending/, 'only caused answers enter the slow layer');
	assert.doesNotMatch(source, /COUPLE|neighbou?rs?\b.*coupl/i, 'cells are individuals, not a coupled lattice');
	assert.match(source, /prefers-reduced-motion/, 'reduced motion: one exposure');
	assert.match(source, /IntersectionObserver/, 'paused off-screen');
	assert.match(source, /if \(visible\) \{\s*if \(lastNow\) t \+=/, 'the clock runs only in view');
});

// The grammar of an experiment, in the light and then in one sentence: the same change again,
// strengths in order, a row never touched, the same cells a day later. Close on one well first.
test('the experiment is the grammar a cause is earned in, named after it is shown', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /const SYSTEM = \{ tx: 420, ty: 430, az: -5 \* D2R, el: 22 \* D2R/, 'opens from the side, low over the plate');
	assert.match(source, /cam: SYSTEM_DRIFT, dur: 6\.0/, 'the side view drifts: parallax tells what is under the plate');
	assert.match(source, /const WALK = \[\[0, 'T2'\], \[1\.0, 'T1'\], \[2\.0, 'T0'\], \[3\.0, 'M0'\], \[7\.5, 'M0'\]/, 'the watcher walks neighbour to neighbour at a steady pace and stops under the well');
	assert.match(source, /const OBS_Z = -110/, 'the watcher under the plate');
	assert.match(source, /the mask hides it between wells/, 'the plate known by what it hides');
	assert.match(source, /scatters through the body of the plate between wells/, 'and the walk never breaks');
	assert.match(source, /const DROP_H = 150/, 'a change is released from a fixed height');
	assert.match(source, /const HOVER = 0\.3/, 'it waits there');
	assert.match(source, /DROP_H \* \(1 - fk \* fk\)/, 'and falls under gravity');
	says(source, 'above', 'Changes come from above.', ' \\}', 'named as it happens');
	assert.match(source, /fade: MACRO, dur: 0\.9/, 'a cross-fade on the well, never an edge-on swing');
	says(source, 'below', 'We watch from below.', ' \\}', 'named as it happens');
	assert.match(source, /const MACRO = \{ tx: 200, ty: 392, az: 0, el: -90 \* D2R, dist: 8000, f: 8000 \* 3\.3/, 'close on one well, from below');
	assert.match(source, /cam: PLATE, dur: 1\.6/, 'pulls back to the plate');
	assert.match(source, /fade: SYSTEM, dur: 1\.2/, 'fades back to the side');
	assert.match(source, /const NIGHT = \[28\.5, 34\.0\]/, 'a night before the day after');
	assert.match(source, /the exposure fades at the edges of the frame/, 'no straight cuts through wells');
	assert.match(source, /threshold: 0\.5/, 'the clock starts when the figure is half in view');
	says(source, 'again', 'The same change, again.', '', 'replication');
	says(source, 'strengths', 'Three strengths.', '', 'dose');
	assert.match(source, /change: \['T0', 0\.3\] \}[\s\S]*change: \['T1', 0\.55\] \}[\s\S]*change: \['T2', 1\] \}/, 'a geometric series, in order');
	says(source, 'untouched', 'These were never touched.', '', 'control, there all along, named late');
	says(source, 'later', 'A day later. The same cells.', '', 'time');
	assert.match(source, /const CYCLE = 50/, 'under a minute, front-loaded');
	assert.doesNotMatch(source, /or it is not|is earned\.'/, 'no sermon: sentences name what was shown');
	for (const v of Object.values(en.beats)) assert.doesNotMatch(`${v}'`, /or it is not|is earned\.'/, 'no sermon in en.beats');
	assert.match(source, /for \(let r = -1; r <= 3; r\+\+\)/, 'a ring of wells runs off the frame: a patch of something larger');
	assert.match(source, /w\.entryA = ENTRY_A \+ \(rnd\(\) - 0\.5\) \* 0\.16/, 'one hand: the same place in every well, every time');
});

test('wrapper edge to edge up to 880px, centred, square field', () => {
	const { source } = compileSvelte(FILE);
	assert.match(source, /max-width:\s*880px/, 'max-width 880px');
	assert.match(source, /margin-inline:\s*auto/, 'centred');
	assert.match(source, /aspect-ratio:\s*1;/, 'the field is square');
});
