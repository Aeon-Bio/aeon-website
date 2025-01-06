export interface InsightPattern {
    gene: string;
    summary: string;
    metrics: {
        direction: 'hyper' | 'hypo';
        matchStrength: number;
        overlapDetails: string;
    };
}

export interface MethylationMetrics {
    value: number;
    siteMean: number;
    siteMedian: number;
    zScore: number;
    MAD: number;
    percentile: number;
}

export interface ModifyingFactor {
    factor: string;
    effect: string;
    interventionPotential: string;
}

export interface Region {
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
    modifyingFactors: ModifyingFactor[];
}

export interface MonitoringMetric {
    metric: string;
    frequency: string;
    target: string;
}

export interface Recommendation {
    recommendation: string;
    lucideIcon: string;
    strength: 'Strong' | 'Moderate' | 'Preliminary';
    source: string;
    rationale: string;
    specificActions: string[];
    monitoringMetrics: MonitoringMetric[];
    contraindications: string[];
    supportingEvidence: string[];
}

export interface Evidence {
    strength: {
        level: string;
        score: number;
        basis: string;
    };
    mechanisticInsights: string[];
    biologicalContext: string[];
}

export interface InsightData {
    pattern: InsightPattern;
    recommendations: Recommendation[];
    evidence: Evidence;
} 