export type Tab = 'overview' | 'recommendations' | 'science' | 'evidence';

export type MethylationMetrics = {
    value: number;
    siteMean: number;
    siteMedian: number;
    zScore: number;
    percentile: number;
};

export type AssociatedRegion = {
    methylationMetrics: MethylationMetrics;
    matchStrength: number;
    studyIds: string[];
    probe_name?: string;
    gene_name?: string;
    context?: string;
    description?: string;
};

export type StudyMetric = {
    populationContext?: string;
    studyPopulationSummary?: Array<{
        groupName: string;
        count?: number;
        description?: string;
    }>;
};

export type StudyContext = {
    primaryStudyId: string;
    studyMetrics: StudyMetric[];
};

export type Provenance = {
    associated_regions: AssociatedRegion[];
    studyContext?: StudyContext;
};

export type Recommendation = {
    recommendation: string;
    lucideIcon: string;
    strength: string;
    rationale: string;
    specificActions: string[];
    monitoringMetrics: Array<{
        metric: string;
        frequency: string;
        target: string;
    }>;
};

export type Evidence = {
    strength: string;
    mechanisticInsights: string[];
    functionalImpact: string[];
    healthRelevance: string;
};

export type KnowledgeContext = {
    establishedFunctions: string[];
    commonCellularRoles: string[];
    evolutionaryContext: string;
    tissueContext: string;
    regulatoryNetwork: {
        upstream: string[];
        downstream: string;
    };
    conservedPathways: string[];
};

export type Finding = {
    pattern: {
        gene_list: string[];
        summary: string;
        direction: 'hyper' | 'hypo';
    };
    description: string;
    recommendations: Recommendation[];
    evidence: Evidence;
    provenance: Provenance;
    knowledgeContext: KnowledgeContext;
};

// Add other type definitions as needed 