/**
 * The journeys over the pregenerated INDRA graphs, told as dialogue.
 * Data lives in journeys.json (generated); this file holds the types.
 *
 * Rules, in the user's words: the person's messages are all the agent has.
 * What is said grounds (Gilda, with its score). What the prior-knowledge
 * network raises from those groundings *lands* later — asynchronously, often
 * a message or two after the question that raised it — with the evidence
 * count and belief the INDRA relation actually carries. The agent asks what
 * it suspects; it does not name what the record has not yet delivered.
 *
 * Every number below was read from INDRA CoGEx on 2026-08-28
 * (indra_rel evidence_count / belief; Gilda grounding scores).
 */

export type Holding = 'words' | 'wearable' | 'blood' | 'methylation' | 'genome';
export type Depth = 'words' | 'system' | 'blood' | 'genome' | 'dish';

export interface Grounded {
	id: string;
	label: string;
	/** Gilda score; low scores are said aloud */
	score: number;
	/** the phrase that grounded */
	said: string;
}

export interface Landed {
	/** the grounding this resolved from */
	from: string;
	/** the entity the record raised */
	id: string;
	label: string;
	/** direction of the relation relative to `from` */
	dir: 'in' | 'out';
	type: 'Activation' | 'Inhibition';
	belief: number;
}

export interface Message {
	who: 'agent' | 'you';
	text: string;
	/** what this message grounds, instantly */
	grounds?: Grounded[];
	/** phrases that ground to nothing usable */
	ungrounded?: string[];
	/** relations resolving from earlier groundings, arriving now */
	lands?: Landed[];
	/** what the agent holds but does not say */
	thinks?: string;
	/** data the person brings with this message */
	brings?: Holding[];
}

/** the relation a dish line stakes: labels as drawn, belief/evidence from INDRA */
export interface StakedEdge {
	source: string;
	target: string;
	type: 'Activation' | 'Inhibition';
	belief: number;
	evidence: number;
}

export interface Step {
	/** the intervention now */
	do: string;
	/** what this replaced at the shallower depth, if it sharpened */
	was?: string;
	/** dish ledger only: the edge this question presses, with its borrowed belief */
	edge?: StakedEdge;
}

export interface Ledger {
	depth: Depth;
	items: Step[];
}

export interface Journey {
	dialogue: Message[];
	deeper: Message[];
	ledgers: Ledger[];
}

export const DEPTHS: Depth[] = ['words', 'system', 'blood', 'genome', 'dish'];

import generated from './journeys.json';

/** Resolved by scripts/resolve_journeys.py from INDRA CoGEx; authored parts in scripts/journey_scripts.py. */
export const journeys = generated.journeys as unknown as Record<string, Journey>;
export const generatedOn: string = generated.generated;

/** What the reader holds once the deeper exchanges up to `i` have played. */
export function heldAfter(deeper: Message[], i: number): Holding[] {
	const held: Holding[] = ['words'];
	for (let k = 0; k <= i && k < deeper.length; k++) {
		for (const b of deeper[k].brings ?? []) if (!held.includes(b)) held.push(b);
	}
	return held;
}
