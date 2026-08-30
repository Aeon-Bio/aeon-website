/**
 * One beam of attention across the conversation and the drawing.
 *
 * The dialogue's glosses, the graph's nodes, and the ledger's lines all point
 * at the same model; hovering any of them aims this beam, and every surface
 * that can answer, answers — a gloss lights its node, a ledger line lights the
 * branches it acts on. `from` records who is holding the beam so a surface
 * can ignore its own reflection.
 */
import { writable } from 'svelte/store';

/** a term of the model, held by id */
export interface TermAttention {
	kind: 'term';
	id: string;
	from: 'dialogue' | 'graph' | 'ledger';
}

/** a ledger line: what it acts on, and what it would observe */
export interface TieAttention {
	kind: 'tie';
	label: string;
	acts: { verb: string; id: string; label: string; type: 'Activation' | 'Inhibition'; belief: number }[];
	probes: { id: string; label: string; via: string }[];
}

export type Attention = TermAttention | TieAttention | null;

export const attention = writable<Attention>(null);

/** let go only if we still hold the beam — a newer hover keeps it */
export function release(held: (a: Exclude<Attention, null>) => boolean) {
	attention.update((a) => (a && held(a) ? null : a));
}
