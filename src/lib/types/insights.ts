export type Tab = 'overview' | 'recommendations' | 'science' | 'evidence';

export type PopulationModes = {
	center: number;
	spread: number;
	density: number;
};

export type PersonalMethylationMetrics = {
	name: string;
	value: number;
	methylation_state: 'hypo' | 'hyper';
	confidence: number;
	distribution_type: 'unimodal' | 'multimodal';
	deviations: {
		mode_deviation: number;
		weighted_deviation: number;
		median_deviation: number;
	};
	percentile: number;
};

export type ModifyingFactor = {
	factor: string;
	effect: string;
	interventionPotential?: {
		method?: string;
		dosage?: string;
		timing?: string;
		duration?: string;
		contraindications?: string[];
	};
};

export type AssociatedRegion = {
	matched_probe: string | null;
	matched_gene: string;
	gene_name: string;
	description: string;
	chromosome: string | null;
	position: number | null;
	context: string | null;
	studyIds: string[];
	direction: 'hyper' | 'hypo';
	matchStrength: number;
	methylationMetrics: MethylationMetrics;
	modifyingFactors?: ModifyingFactor[];
};

export type StudyMetric = {
	studyId: string;
	totalSubjects: number | null;
	studyPopulationSummary: Array<{
		groupName: string;
		count: number | null;
		description: string;
	}>;
	populationContext: string;
	effectSizes: number[];
};

export type StudyContext = {
	studyMetrics: StudyMetric[];
};

export type Provenance = {
	associated_regions: AssociatedRegion[];
	studyContext: StudyContext;
};

export type Recommendation = {
	recommendation: string;
	lucideIcon: string;
	strength: string;
	source: string;
	rationale: string;
	specificActions: string[];
	monitoringMetrics: Array<{
		metric: string;
		frequency: string;
		target: string;
	}>;
	contraindications: string[];
	supportingEvidence: string[];
};

export type KnowledgeBase = {
	establishedMechanisms: string[];
	supportingStudies: string[];
	biologicalContext: string[];
};

export type Evidence = {
	strength: string;
	mechanisticInsights: string[];
	functionalImpact: string[];
	healthRelevance: string;
	knowledgeBase: KnowledgeBase;
};

export type RegulatoryNetwork = {
	upstream: string[];
	downstream: string[];
	feedback: string[];
};

export type KnowledgeContext = {
	establishedFunctions: string[];
	conservedPathways: string[];
	commonCellularRoles: string[];
	evolutionaryContext: string;
	tissueContext: string;
	regulatoryNetwork: RegulatoryNetwork;
};

export type Pattern = {
	gene_list: string[];
	personally_associated_genes: string[];
	summary: string;
	direction: 'hyper' | 'hypo';
};

export type Finding = {
	pattern: Pattern;
	description: string;
	knowledgeContext: KnowledgeContext;
	provenance: Provenance;
	recommendations: Recommendation[];
	evidence: Evidence;
};
// Add other type definitions as needed
