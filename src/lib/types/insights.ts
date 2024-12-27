export interface InsightPattern {
    gene: string;
    summary: string;
    metrics: {
        direction: 'hyper' | 'hypo';
        matchStrength: number;
        overlapDetails: string;
    };
}

export interface Recommendation {
    action: string;
    strength: 'Strong' | 'Moderate' | 'Preliminary';
    source: 'mechanism' | 'outcome' | 'general';
    context: string;
    rationale: string;
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