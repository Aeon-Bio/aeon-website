/**
 * Recognizable examples behind each medication aggregate.
 *
 * The aggregates count every drug with the term as a known side effect; the
 * stored samples in concerns.json are alphabetical and front-loaded with IUPAC
 * strings no person can read. These are drawn from the same INDRA CoGEx
 * `has_side_effect` edges (read 2026-08-30), names verbatim, chosen for
 * recognisability. Counts stay the aggregate label's; these are examples.
 */
export const medicationExamples: Record<string, string[]> = {
	// tired
	'DRUGS:MESH:D005221': ['sertraline', 'venlafaxine', 'simvastatin', 'trazodone', 'Temazepam', 'valsartan'],
	'DRUGS:MESH:D012913': ['gabapentin', 'pregabalin', 'escitalopram', 'bupropion', 'zaleplon', 'testosterone'],
	'DRUGS:MESH:D008595': ['naproxen', 'sertraline', 'paroxetine', 'quetiapine', 'apixaban', 'doxycycline'],
	'DRUGS:MESH:D015430': ['quetiapine', 'risperidone', 'prednisone', 'sertraline', 'venlafaxine', 'prednisolone'],
	// heart
	'DRUGS:MESH:D009203': ['rofecoxib', 'sibutramine', 'pioglitazone', 'phentermine', 'prednisone', 'venlafaxine'],
	'DRUGS:MESH:D004417': ['venlafaxine', 'valsartan', 'terbutaline', 'simvastatin', 'Temazepam', 'trazodone'],
	// ninety
	'DRUGS:MESH:D008569': ['diazepam', 'clonazepam', 'triazolam', 'simvastatin', 'atorvastatin', 'metoprolol'],
	'DRUGS:MESH:D003704': ['zolpidem', 'risperidone', 'valproic acid', 'prednisone', 'venlafaxine', 'ciprofloxacin'],
	'DRUGS:MESH:D034381': ['furosemide', 'naproxen', 'erythromycin A', 'paclitaxel', 'celecoxib', 'tadalafil'],
	'DRUGS:MESH:D006973': ['rofecoxib', 'sibutramine', 'venlafaxine', 'quetiapine', 'triamcinolone', 'sertraline']
};
