/**
 * What the genes imply — the genome layer's voice at every step.
 *
 * Each row is one INDRA CoGEx `indra_rel` between a journey gene and a term
 * of that journey's model, read live on 2026-08-30 (execute_cypher over
 * BioEntity pairs; beliefs from the INDRA belief model, evidence counts as
 * stored). `dir: 'out'` is gene → condition (what the gene presses on);
 * `dir: 'in'` is condition → gene (what a measurement of the gene reads).
 */

export type StanceType =
	| 'Activation'
	| 'Inhibition'
	| 'Complex'
	| 'IncreaseAmount'
	| 'DecreaseAmount';

/** one sign the literature takes on this pair: how many papers, and where to read them.
 *  `hash` is the INDRA statement hash of the strongest statement of this sign
 *  (kept as a string — the values overflow JS numbers). */
export interface Stance {
	type: StanceType;
	evidence: number;
	hash: string;
	retracted?: boolean;
}

export interface Implication {
	gene: string;
	hgnc: string;
	/** the model term (MESH id as used in concerns.json) */
	id: string;
	label: string;
	type: StanceType;
	dir: 'out' | 'in';
	belief: number;
	evidence: number;
	/** every sign the papers take on this pair, strongest first — the argument, drawn whole */
	stances?: Stance[];
}

export const implications: Record<string, Implication[]> = {
	tired: [
		{
			gene: 'LPA',
			hgnc: 'HGNC:6667',
			id: 'MESH:D050197',
			label: 'Atherosclerosis',
			type: 'Activation',
			dir: 'out',
			belief: 0.6614,
			evidence: 117,
			stances: [
				{ type: 'Activation', evidence: 117, hash: '-9529957431059543' },
				{ type: 'Inhibition', evidence: 2, hash: '-29076795746705301' }
			]
		},
		{
			gene: 'LPA',
			hgnc: 'HGNC:6667',
			id: 'MESH:D006333',
			label: 'Heart Failure',
			type: 'Complex',
			dir: 'out',
			belief: 0.7343,
			evidence: 20,
			stances: [
				{ type: 'Complex', evidence: 20, hash: '18062869475098559' },
				{ type: 'Activation', evidence: 8, hash: '-24828493435466484' },
				{ type: 'Inhibition', evidence: 1, hash: '16941335881404532' }
			]
		},
		{
			gene: 'IGSF1',
			hgnc: 'HGNC:5948',
			id: 'MESH:D007037',
			label: 'Hypothyroidism',
			type: 'Inhibition',
			dir: 'out',
			belief: 0.4934,
			evidence: 6,
			stances: [
				{ type: 'Inhibition', evidence: 7, hash: '334878370295362' },
				{ type: 'Activation', evidence: 3, hash: '-28018701223286294' }
			]
		},
		{
			gene: 'TSHB',
			hgnc: 'HGNC:12372',
			id: 'MESH:D007037',
			label: 'Hypothyroidism',
			type: 'IncreaseAmount',
			dir: 'in',
			belief: 0.4715,
			evidence: 2,
			stances: [{ type: 'IncreaseAmount', evidence: 2, hash: '-20659744973587085' }]
		},
		{
			gene: 'TSHB',
			hgnc: 'HGNC:12372',
			id: 'MESH:D007037',
			label: 'Hypothyroidism',
			type: 'Activation',
			dir: 'out',
			belief: 0.3749,
			evidence: 3,
			stances: [{ type: 'Activation', evidence: 3, hash: '-14158477765454676' }]
		},
		// the iron caveat: a TMPRSS6 variant leaves hepcidin unsuppressed — oral iron would not absorb
		{
			gene: 'TMPRSS6',
			hgnc: 'HGNC:16517',
			id: 'MESH:D018798',
			label: 'Anemia, Iron-Deficiency',
			type: 'Inhibition',
			dir: 'out',
			belief: 0.4772,
			evidence: 6,
			stances: [{ type: 'Inhibition', evidence: 9, hash: '10889972739921918' }]
		},
		{
			gene: 'HAMP',
			hgnc: 'HGNC:15598',
			id: 'MESH:D000740',
			label: 'Anemia',
			type: 'Activation',
			dir: 'out',
			belief: 0.7314,
			evidence: 107,
			stances: [
				{ type: 'Activation', evidence: 107, hash: '20190792791614827' },
				{ type: 'Inhibition', evidence: 23, hash: '256995759726900' }
			]
		}
	],
	heart: [
		{
			gene: 'CRP',
			hgnc: 'HGNC:2367',
			id: 'MESH:D009203',
			label: 'Myocardial Infarction',
			type: 'Activation',
			dir: 'out',
			belief: 0.7031,
			evidence: 23,
			stances: [
				{ type: 'Activation', evidence: 23, hash: '-35705468739221393' },
				{ type: 'Inhibition', evidence: 5, hash: '-20060143531441964' }
			]
		},
		{
			gene: 'CRP',
			hgnc: 'HGNC:2367',
			id: 'MESH:D013927',
			label: 'Thrombosis',
			type: 'Activation',
			dir: 'out',
			belief: 0.6928,
			evidence: 41,
			stances: [
				{ type: 'Activation', evidence: 41, hash: '4861955046728822' },
				{ type: 'Inhibition', evidence: 1, hash: '12945129286024206' }
			]
		},
		{
			gene: 'CRP',
			hgnc: 'HGNC:2367',
			id: 'MESH:D009765',
			label: 'Obesity',
			type: 'IncreaseAmount',
			dir: 'in',
			belief: 0.7556,
			evidence: 34,
			stances: [
				{ type: 'IncreaseAmount', evidence: 34, hash: '23520680000371796' },
				{ type: 'Activation', evidence: 22, hash: '31855567480812469' },
				{ type: 'Inhibition', evidence: 5, hash: '-32742759140404835' }
			]
		},
		{
			gene: 'LEP',
			hgnc: 'HGNC:6553',
			id: 'MESH:D006973',
			label: 'Hypertension',
			type: 'Activation',
			dir: 'out',
			belief: 0.7319,
			evidence: 138,
			stances: [
				{ type: 'Activation', evidence: 138, hash: '-23679156906070690' },
				{ type: 'Inhibition', evidence: 13, hash: '-33501404165890910' }
			]
		},
		{
			gene: 'LEP',
			hgnc: 'HGNC:6553',
			id: 'MESH:D009765',
			label: 'Obesity',
			type: 'Activation',
			dir: 'out',
			belief: 0.7126,
			evidence: 488,
			stances: [
				{ type: 'Activation', evidence: 494, hash: '-33497799040856206' },
				{ type: 'Inhibition', evidence: 212, hash: '30079264771071526' }
			]
		},
		{
			gene: 'LDLR',
			hgnc: 'HGNC:6547',
			id: 'MESH:D006937',
			label: 'Hypercholesterolemia',
			type: 'Inhibition',
			dir: 'out',
			belief: 0.6592,
			evidence: 23,
			stances: [
				{ type: 'Inhibition', evidence: 23, hash: '-10046870092446549' },
				{ type: 'Activation', evidence: 26, hash: '2498605461419446' }
			]
		},
		{
			gene: 'LDLR',
			hgnc: 'HGNC:6547',
			id: 'MESH:D006938',
			label: 'Hyperlipoproteinemia Type II',
			type: 'Inhibition',
			dir: 'out',
			belief: 0.4906,
			evidence: 6,
			stances: [
				{ type: 'Activation', evidence: 79, hash: '14256674472588233' },
				{ type: 'Inhibition', evidence: 6, hash: '6839592559708214' }
			]
		}
	],
	ninety: [
		{
			gene: 'F2',
			hgnc: 'HGNC:3535',
			id: 'MESH:D006984',
			label: 'Hypertrophy',
			type: 'Activation',
			dir: 'out',
			belief: 0.6479,
			evidence: 6,
			stances: [
				{ type: 'Activation', evidence: 6, hash: '-13405308214940241' },
				{ type: 'Inhibition', evidence: 1, hash: '25487406350951492' }
			]
		},
		{
			gene: 'F2',
			hgnc: 'HGNC:3535',
			id: 'MESH:D001929',
			label: 'Brain Edema',
			type: 'Activation',
			dir: 'out',
			belief: 0.662,
			evidence: 25,
			stances: [
				{ type: 'Activation', evidence: 25, hash: '-13989093009407170' },
				{ type: 'Inhibition', evidence: 2, hash: '-3155629210756323' }
			]
		},
		{
			gene: 'F2',
			hgnc: 'HGNC:3535',
			id: 'MESH:D000544',
			label: 'Alzheimer Disease',
			type: 'Activation',
			dir: 'out',
			belief: 0.4175,
			evidence: 13,
			stances: [
				{ type: 'Activation', evidence: 13, hash: '5108063829670238' },
				{ type: 'Complex', evidence: 3, hash: '-18642556808291076' },
				{ type: 'Inhibition', evidence: 1, hash: '-23554111031392972' }
			]
		},
		{
			gene: 'F2',
			hgnc: 'HGNC:3535',
			id: 'MESH:D000740',
			label: 'Anemia',
			type: 'Inhibition',
			dir: 'out',
			belief: 0.4934,
			evidence: 5,
			stances: [
				{ type: 'Inhibition', evidence: 5, hash: '11942930153207997' },
				{ type: 'Activation', evidence: 1, hash: '52025708786891' }
			]
		},
		{
			gene: 'F2',
			hgnc: 'HGNC:3535',
			id: 'MESH:D006973',
			label: 'Hypertension',
			type: 'Activation',
			dir: 'out',
			belief: 0.3905,
			evidence: 2,
			stances: [{ type: 'Activation', evidence: 2, hash: '23952185461451222' }]
		},
		// the iron caveat: an HFE variant drives overload — iron in a pill would feed it
		{
			gene: 'HFE',
			hgnc: 'HGNC:4886',
			id: 'MESH:D019190',
			label: 'Iron Overload',
			type: 'Activation',
			dir: 'out',
			belief: 0.66,
			evidence: 33,
			stances: [
				{ type: 'Activation', evidence: 42, hash: '11731560415511120' },
				{ type: 'Inhibition', evidence: 12, hash: '15117729241129193' }
			]
		},
		{
			gene: 'HAMP',
			hgnc: 'HGNC:15598',
			id: 'MESH:D019190',
			label: 'Iron Overload',
			type: 'Inhibition',
			dir: 'out',
			belief: 0.6987,
			evidence: 106,
			stances: [
				{ type: 'Inhibition', evidence: 106, hash: '24970945460268996' },
				{ type: 'Activation', evidence: 71, hash: '1441946784686593' }
			]
		}
	]
};

export const glyphOf: Record<Implication['type'], string> = {
	Activation: '→',
	Inhibition: '⊣',
	Complex: '∘',
	IncreaseAmount: '⇑',
	DecreaseAmount: '⇓'
};
