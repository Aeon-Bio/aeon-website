/**
 * Why each line of the system ledger exists: the causal ties behind it.
 *
 * Hand-carried from the `thinks` field of the final agent turn in
 * journeys.json (pipeline run of 2026-08-30) — every belief below is the
 * INDRA-derived number the resolver emitted. An `act` is an intervention
 * pressing on a branch of the model; a `probe` is a measurement that would
 * observe one, via the gene (or device) it reads.
 */

export interface Act {
	verb: string;
	id: string;
	label: string;
	type: 'Activation' | 'Inhibition';
	belief: number;
}

export interface Probe {
	id: string;
	label: string;
	via: string;
}

export interface LedgerTie {
	acts?: Act[];
	probes?: Probe[];
}

export const culmination: Record<string, Record<string, LedgerTie>> = {
	tired: {
		'walk, daily': {
			acts: [
				{ verb: 'exercise', id: 'MESH:D015430', label: 'Weight Gain', type: 'Inhibition', belief: 0.9 },
				{ verb: 'exercise', id: 'MESH:D005221', label: 'Fatigue', type: 'Inhibition', belief: 0.49 }
			]
		},
		'less alcohol, if you drink': {
			acts: [{ verb: 'alcohol', id: 'MESH:D005221', label: 'Fatigue', type: 'Activation', belief: 0.76 }]
		},
		TSH: { probes: [{ id: 'MESH:D007035', label: 'Hypothermia', via: 'TSHB' }] }
	},
	heart: {
		'walk, daily': {
			acts: [
				{ verb: 'exercise', id: 'MESH:D006973', label: 'Hypertension', type: 'Inhibition', belief: 0.95 },
				{ verb: 'exercise', id: 'MESH:D009765', label: 'Obesity', type: 'Inhibition', belief: 0.93 },
				{ verb: 'exercise', id: 'MESH:D009203', label: 'Myocardial Infarction', type: 'Inhibition', belief: 0.82 },
				{ verb: 'exercise', id: 'MESH:D013927', label: 'Thrombosis', type: 'Inhibition', belief: 0.67 },
				{ verb: 'exercise', id: 'MESH:D006333', label: 'Heart Failure', type: 'Inhibition', belief: 0.41 }
			]
		},
		'no smoking, if you do': {
			acts: [
				{ verb: 'smoking', id: 'MESH:D013927', label: 'Thrombosis', type: 'Activation', belief: 0.82 },
				{ verb: 'smoking', id: 'MESH:D009765', label: 'Obesity', type: 'Activation', belief: 0.66 },
				{ verb: 'smoking', id: 'MESH:D009203', label: 'Myocardial Infarction', type: 'Activation', belief: 0.47 },
				{ verb: 'smoking', id: 'MESH:D006973', label: 'Hypertension', type: 'Activation', belief: 0.29 }
			]
		},
		'less alcohol, if you drink': {
			acts: [
				{ verb: 'alcohol', id: 'MESH:D006973', label: 'Hypertension', type: 'Activation', belief: 0.76 },
				{ verb: 'alcohol', id: 'MESH:D009765', label: 'Obesity', type: 'Activation', belief: 0.73 },
				{ verb: 'alcohol', id: 'MESH:D006333', label: 'Heart Failure', type: 'Activation', belief: 0.66 },
				{ verb: 'alcohol', id: 'MESH:D012892', label: 'Sleep Deprivation', type: 'Activation', belief: 0.16 }
			]
		},
		'iron on the plate, not in a pill': {
			acts: [{ verb: 'meat', id: 'MESH:D006973', label: 'Hypertension', type: 'Activation', belief: 0.16 }]
		},
		CRP: { probes: [{ id: 'MESH:D006333', label: 'Heart Failure', via: 'CRP' }] },
		'a cuff at home': { probes: [{ id: 'MESH:D006973', label: 'Hypertension', via: 'device' }] },
		ferritin: { probes: [{ id: 'MESH:D009765', label: 'Obesity', via: 'FTL' }] },
		prothrombin: { probes: [{ id: 'MESH:D006984', label: 'Hypertrophy', via: 'F2' }] }
	},
	ninety: {
		'walk, daily': {
			acts: [
				{ verb: 'exercise', id: 'MESH:D006973', label: 'Hypertension', type: 'Inhibition', belief: 0.95 },
				{ verb: 'exercise', id: 'MESH:D003704', label: 'Dementia', type: 'Inhibition', belief: 0.86 },
				{ verb: 'exercise', id: 'MESH:D013927', label: 'Thrombosis', type: 'Inhibition', belief: 0.67 }
			]
		},
		'no smoking, if you do': {
			acts: [
				{ verb: 'smoking', id: 'MESH:D013927', label: 'Thrombosis', type: 'Activation', belief: 0.82 },
				{ verb: 'smoking', id: 'MESH:D006973', label: 'Hypertension', type: 'Activation', belief: 0.29 }
			]
		},
		'less alcohol, if you drink': {
			acts: [
				{ verb: 'alcohol', id: 'MESH:D006973', label: 'Hypertension', type: 'Activation', belief: 0.76 },
				{ verb: 'alcohol', id: 'MESH:D012892', label: 'Sleep Deprivation', type: 'Activation', belief: 0.16 }
			]
		},
		'iron on the plate, not in a pill': {
			acts: [{ verb: 'meat', id: 'MESH:D006973', label: 'Hypertension', type: 'Activation', belief: 0.16 }]
		},
		prothrombin: { probes: [{ id: 'MESH:D006984', label: 'Hypertrophy', via: 'F2' }] },
		CRP: { probes: [{ id: 'MESH:D013927', label: 'Thrombosis', via: 'CRP' }] },
		'a night’s recording': { probes: [{ id: 'MESH:D012892', label: 'Sleep Deprivation', via: 'device' }] }
	}
};
