/**
 * Terms the record raises that are true but useless to a person: health-services
 * metrics, care-process meta, abstract descriptors, bare affect. The model keeps
 * them — belief propagation still flows through them — but the drawing triages
 * them out. What remains in a row is ordered by posterior, which is the
 * relevance the person's own history gives it.
 *
 * This belongs upstream in scripts/pregenerate_concerns.py eventually.
 */
export const notPragmatic: Record<string, true> = {
	'MESH:D017281': true, // Cost of Illness — economics, not health
	'MESH:D010349': true, // Patient Compliance — care-process meta
	'MESH:D011788': true, // Quality of Life — outcome instrument, not a condition
	'MESH:D010539': true, // Permeability — abstract property
	'MESH:D009068': true, // Movement — abstract
	'MESH:D010335': true, // Pathologic Processes — maximally vague
	'MESH:D003187': true, // Compliance — reads as care-process meta
	'MESH:D058992': true, // Social Participation — meta
	'MESH:D012752': true, // Shame — bare affect
	'MESH:D005639': true, // Frustration — bare affect
	'MESH:D004644': true // Emotions — bare affect
};
