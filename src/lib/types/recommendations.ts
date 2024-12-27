export interface HealthRecommendation {
    pattern: {
        gene_list: string[];
        summary: string;
        direction: 'hyper' | 'hypo';
    };
    knowledgeContext: {
        establishedFunctions: string[];
        conservedPathways: string[];
        commonCellularRoles: string[];
        evolutionaryContext: string;
        tissueContext: string;
        regulatoryNetwork: {
            upstream: string[];
            downstream: string[];
            feedback: string[];
        };
    };
    provenance: {
        regions: Array<{
            site_name: string;
            associated_genes: string[];
            chromosome: string;
            position: number | null;
            direction: 'hyper' | 'hypo';
            methylationMetrics: {
                value: number;
                siteMean: number;
                siteMedian: number;
                zScore: number;
                MAD: number;
                percentile: number;
            };
        }>;
    };
    recommendations: Array<{
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
    }>;
    evidence: {
        strength: string;
        mechanisticInsights: string[];
        functionalImpact: string[];
        healthRelevance: string;
        knowledgeBase: {
            establishedMechanisms: string[];
            supportingStudies: string[];
            biologicalContext: string[];
        };
    };
} 