// The bench's record: every change put into the plate, by the visitor's hand or the
// instrument's, with how many cells answered it. The plate writes it; the record draws it.
// One plain object read on each frame by whoever is drawing; a store for the one line of
// words that counts it.
import { writable } from 'svelte/store';

/** @typedef {{ id: number, dose: number, f: number, mine: boolean, settled: boolean, born: number, settledAt: number, row: number }} Point */

export const bench = {
	/** @type {Point[]} */
	points: [],
	/** the fitted curve, or null while there are too few points: f(d) = top·dⁿ/(kⁿ+dⁿ) */
	fit: /** @type {null | { top: number, k: number, n: number }} */ (null),
	/** seconds on the plate's clock when the fit last changed */
	fitAt: 0,
	clock: 0
};

/** how many changes, and how many of them the instrument's */
export const counts = writable({ n: 0, k: 0 });
/** reduced motion: the plate is one still exposure, and the count line says so in one sentence */
export const stillMode = writable(false);

let nextId = 1;
/** @returns {Point} */
export function addPoint(dose, mine, row, born, settledAt) {
	const p = { id: nextId++, dose, f: 0, mine, settled: false, born, settledAt, row };
	bench.points.push(p);
	counts.set({ n: bench.points.length, k: bench.points.filter((q) => !q.mine).length });
	return p;
}

export function resetBench() {
	bench.points.length = 0;
	bench.fit = null;
	bench.fitAt = 0;
	counts.set({ n: 0, k: 0 });
}

/** the dose the instrument tries next, from how many answered the last one: it looks for the half-answer */
export function nextDose(dose, f) {
	return Math.max(0.12, Math.min(1, dose * Math.exp(1.25 * (0.5 - f))));
}

const KS = Array.from({ length: 28 }, (_, i) => 0.08 + (i * 1.3) / 27);
const NS = [1, 1.5, 2, 3, 4.5];
export const hill = (d, { top, k, n }) => (top * Math.pow(d, n)) / (Math.pow(k, n) + Math.pow(d, n));

/** refit the curve to the points there are (live ones weigh by how far along they are); null below three */
export function refit(clock) {
	const pts = bench.points.filter((p) => p.settled || clock - p.born > 1.5);
	if (pts.length < 3) {
		if (bench.fit) {
			bench.fit = null;
			bench.fitAt = clock;
		}
		return;
	}
	let best = null,
		bestE = Infinity;
	const fmax = Math.max(0.15, ...pts.map((p) => p.f));
	for (const top of [fmax, Math.min(1, fmax * 1.15), Math.min(1, fmax * 1.35)])
		for (const n of NS)
			for (const k of KS) {
				let e = 0;
				for (const p of pts) {
					const w = p.settled ? 1 : Math.min(1, (clock - p.born) / 4.5);
					const r = p.f - hill(p.dose, { top, k, n });
					e += w * r * r;
				}
				if (e < bestE) {
					bestE = e;
					best = { top, k, n };
				}
			}
	const prev = bench.fit;
	if (!prev || Math.abs(prev.k - best.k) > 1e-6 || prev.n !== best.n || Math.abs(prev.top - best.top) > 1e-6) {
		bench.fit = best;
		bench.fitAt = clock;
	}
}
