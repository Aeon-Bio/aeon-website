// The bench's record: every change put into the plate, by the visitor's hand or the
// instrument's, and the well it went into. The plate writes it; the record draws the wells
// themselves, in the order they were changed, each with the bead that went in under it.
// One plain object read on each frame by whoever is drawing; a store for the one line of
// words that counts it.
import { writable } from 'svelte/store';

/** a well, in plate units: 79 is the radius of a well on a standard plate at the pitch the plate uses */
export const WELL_R = 79;

/** @typedef {{ id: number, dose: number, f: number, mine: boolean, settled: boolean, born: number, settledAt: number, well: any }} Point */

export const bench = {
	/** @type {Point[]} every change, in order */
	points: [],
	clock: 0
};

/** how many changes, and how many of them the instrument's */
export const counts = writable({ n: 0, k: 0 });
/** reduced motion: the plate is one still exposure, and the count line says so in one sentence */
export const stillMode = writable(false);
/** the answer a row gave, once three of its questions have been answered: how many strengths were
 *  tried in that row, and which of them (1-based, in the order asked) came closest to half the cells
 *  answering. null until a row has three answers */
export const result = writable(/** @type {null | { n: number, k: number }} */ (null));

let nextId = 1;
/** @returns {Point} */
export function addPoint(dose, mine, well, born, settledAt) {
	const p = { id: nextId++, dose, f: 0, mine, settled: false, born, settledAt, well };
	bench.points.push(p);
	counts.set({ n: bench.points.length, k: bench.points.filter((q) => !q.mine).length });
	return p;
}

export function resetBench() {
	bench.points.length = 0;
	counts.set({ n: 0, k: 0 });
	result.set(null);
}

/** read every row: the latest row with three settled answers names the strength nearest the half-answer */
export function readRows() {
	const rows = new Map();
	for (const p of bench.points) {
		if (!p.settled) continue;
		const r = p.well.r;
		if (!rows.has(r)) rows.set(r, []);
		rows.get(r).push(p);
	}
	let best = null;
	for (const pts of rows.values()) {
		if (pts.length < 3) continue;
		const last = Math.max(...pts.map((p) => p.settledAt));
		if (best && last < best.last) continue;
		let k = 0;
		pts.forEach((p, i) => {
			if (Math.abs(p.f - 0.5) < Math.abs(pts[k].f - 0.5)) k = i;
		});
		best = { n: pts.length, k: k + 1, last };
	}
	result.set(best ? { n: best.n, k: best.k } : null);
}

/** the wells that have been changed, in the order they first were, each with its latest change */
export function changedWells() {
	const out = [];
	for (const p of bench.points) {
		const i = out.findIndex((o) => o.well === p.well);
		if (i < 0) out.push({ well: p.well, point: p, first: p });
		else out[i].point = p;
	}
	return out;
}

/** the strength the instrument tries next, from how many answered the last one: it looks for the half-answer,
 *  and steps hard enough that a row of three reads as a search: weak, too strong, between */
export function nextDose(dose, f) {
	return Math.max(0.12, Math.min(1, dose * Math.exp(3.0 * (0.5 - f))));
}
