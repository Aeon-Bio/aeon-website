/**
 * The stake: what the dialogue hands to the dish.
 *
 * attention.ts is the beam within the canvas; this is the beam crossing the
 * section boundary. Set when the reader reaches the dish line of the ledger,
 * read by the seam above the instrument and by the return. Any numbers on the
 * edge are INDRA's own, carried in journeys.json — nothing here invents one.
 */
import { writable } from 'svelte/store';
import type { StakedEdge } from '$lib/data/journeys';

export interface Stake {
	concern: string;
	/** the culmination question — the dish ledger's one line */
	question: string;
	/** the relation staked, once the generator has resolved it */
	edge?: StakedEdge;
}

export const stake = writable<Stake | null>(null);
