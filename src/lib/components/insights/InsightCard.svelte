<script lang="ts">
    import { Dna, ChevronDown, BarChart, Target, ChevronRight, FileText, AlertTriangle, Network, GitBranch, ExternalLink } from 'lucide-svelte';
    import RecommendationItem from './RecommendationItem.svelte';
    import ScientificContext from './ScientificContext.svelte';
    import InsightTabs from './InsightTabs.svelte';
    import MetricBar from './MetricBar.svelte';
    
    // Match the mockFindings.ts structure
    export let finding: {
        pattern: {
            gene_list: string[];
            summary: string;
            direction: 'hyper' | 'hypo';
        };
        description: string;
        recommendations: Array<{
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
        }>;
        evidence: {
            strength: string;
            mechanisticInsights: string[];
            functionalImpact: string[];
            healthRelevance: string;
        };
        provenance: {
            associated_regions: Array<{
                methylationMetrics: {
                    value: number;
                    siteMean: number;
                    siteMedian: number;
                    zScore: number;
                    percentile: number;
                };
                matchStrength: number;
                studyIds: string[];
            }>;
        };
        knowledgeContext: {
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
    };
    
    export let expanded = false;
    let activeTab: 'overview' | 'recommendations' | 'science' | 'evidence' = 'overview';
    let tabsContainer: HTMLDivElement;
    
    // Function to handle tab changes
    function handleTabChange(newTab: typeof activeTab) {
        activeTab = newTab;
        // Scroll the tabs into view smoothly
        tabsContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Update click handlers for tab links
    function handleContextLink() {
        handleTabChange('science');
    }
    
    function toggleExpanded() {
        expanded = !expanded;
    }

    // Helper to get match strength from first region
    $: matchStrength = finding.provenance.associated_regions[0]?.matchStrength || 0;

    // Helper to get all unique study IDs across all regions
    $: studyIds = [...new Set(
        finding.provenance.associated_regions
            .flatMap(region => region.studyIds || [])
    )];
</script>

<div class="insight-card">
    <div 
        class="p-6 cursor-pointer"
        on:click={toggleExpanded}
    >
        <div class="flex items-start justify-between">
            <div class="space-y-2">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-aeon-biolum">
                        {(finding.pattern.personally_associated_genes?.length ? finding.pattern.personally_associated_genes : finding.pattern.gene_list).join(", ")} Pattern
                    </span>
                    <span class="px-2 py-1 rounded-full text-xs {
                        finding.pattern.direction === 'hypo' 
                            ? 'bg-aeon-surface-2 text-aeon-primary' 
                            : 'bg-aeon-interactive text-aeon-biolum'
                    }">
                        {finding.pattern.direction === 'hypo' ? 'Increased' : 'Decreased'} Activity
                    </span>
                </div>
                <h3 class="font-medium text-lg text-white">
                    {finding.pattern.summary}
                </h3>
            </div>
            <ChevronDown 
                class={`h-6 w-6 text-aeon-primary transition-transform ${
                    expanded ? 'rotate-180' : ''
                }`} 
            />
        </div>
    </div>

    {#if expanded}
        <div class="border-t border-aeon-surface-1 p-6">
            <div bind:this={tabsContainer}>
                <InsightTabs 
                    {activeTab} 
                    on:tabChange={e => handleTabChange(e.detail)} 
                />
            </div>
            
            {#if activeTab === 'overview'}
                <div class="space-y-8">
                    <!-- Key Recommendation First -->
                    {#if finding.recommendations.length}
                        <div class="bg-aeon-surface-1 p-4 rounded-lg">
                            <h4 class="font-medium text-white flex items-center gap-2 mb-4">
                                <Target class="h-4 w-4 text-aeon-primary" />
                                Key Recommendation
                            </h4>
                            <RecommendationItem recommendation={finding.recommendations[0]} />
                        </div>
                    {/if}

                    <!-- Description - Full width, more prominent -->
                    <div class="bg-aeon-surface-1 p-6 rounded-lg">
                        <h4 class="font-medium text-white flex items-center gap-2 mb-3">
                            <FileText class="h-4 w-4 text-aeon-primary" />
                            What This Means
                        </h4>
                        <p class="text-lg leading-relaxed text-[#4CC9F0]">
                {finding.description}
            </p>
                    </div>

                    <!-- Technical Details Grid -->
                    <div class="grid gap-6 grid-cols-1 md:grid-cols-2">
                        <!-- Methylation Status - More prominent visualization -->
                        <div class="bg-aeon-surface-1 p-6 rounded-lg">
                            <h4 class="font-medium text-white flex items-center gap-2 mb-6">
                                <BarChart class="h-4 w-4 text-aeon-primary" />
                                Methylation Status
                            </h4>
                            <div class="space-y-8">
                                <!-- Methylation visualization -->
                                <div class="relative h-40 flex items-center">
                                    <!-- Your Value Label -->
                                    <div 
                                        class="absolute text-[#4CC9F0] text-sm"
                                        style:left={`${finding.provenance.associated_regions[0]?.methylationMetrics.value * 100}%`}
                                        style:top="12px"
                                    >
                                        You
                                    </div>

                                    <!-- Population Median Label -->
                                    <div 
                                        class="absolute text-gray-400 text-sm"
                                        style:left={`${finding.provenance.associated_regions[0]?.methylationMetrics.siteMedian * 100}%`}
                                        style:bottom="12px"
                                    >
                                        Median
                                    </div>

                                    <!-- Visualization Bar -->
                                    <div class="relative h-24 w-full rounded-lg overflow-hidden border border-gray-700 bg-gradient-to-r from-aeon-surface-0 to-aeon-surface-1">
                                        <!-- Background Grid Lines -->
                                        <div class="absolute inset-0 grid grid-cols-4">
                                            {#each Array(4) as _, i}
                                                <div class="border-r border-gray-700/50 h-full" />
                        {/each}
                                        </div>

                                        <!-- Population Median marker -->
                                        <div 
                                            class="absolute top-0 h-full"
                                            style:left={`${finding.provenance.associated_regions[0]?.methylationMetrics.siteMedian * 100}%`}
                                        >
                                            <div class="absolute h-full w-0.5 bg-gradient-to-b from-gray-600 to-gray-500">
                                                <!-- Add subtle glow effect -->
                                                <div class="absolute inset-0 w-0.5 bg-gray-500/50 blur-[1px]"></div>
                                            </div>
                                        </div>
                                        
                                        <!-- Your Value marker -->
                                        <div 
                                            class="absolute top-0 h-full"
                                            style:left={`${finding.provenance.associated_regions[0]?.methylationMetrics.value * 100}%`}
                                        >
                                            <div class="absolute h-full w-0.5 bg-[#4CC9F0] shadow-[0_0_8px_rgba(76,201,240,0.3)]" />
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Metrics grid -->
                                <div class="grid grid-cols-2 gap-x-12 gap-y-8">
                                    <div>
                                        <div class="text-gray-500 text-sm mb-1">Your Methylation Level</div>
                                        <div class="text-[#4CC9F0] text-2xl font-medium">
                                            {(finding.provenance.associated_regions[0]?.methylationMetrics.value * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div class="text-gray-500 text-sm mb-1">Population Median</div>
                                        <div class="text-white text-2xl font-medium">
                                            {(finding.provenance.associated_regions[0]?.methylationMetrics.siteMedian * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div class="text-gray-500 text-sm mb-1">Statistical Significance</div>
                                        <div class="text-white text-2xl font-medium">
                                            {Math.abs(finding.provenance.associated_regions[0]?.methylationMetrics.zScore.toFixed(1))} σ {finding.pattern.direction === 'hyper' ? 'higher' : 'lower'}
                                        </div>
                                    </div>
                                    <div>
                                        <div class="text-gray-500 text-sm mb-1">Population Percentile</div>
                                        <div class="text-white text-2xl font-medium">
                                            {finding.provenance.associated_regions[0]?.methylationMetrics.percentile}th
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Biological Impact - Better text hierarchy -->
                        <div class="bg-aeon-surface-1 p-6 rounded-lg">
                            <h4 class="font-medium text-white flex items-center gap-2 mb-6">
                                <Target class="h-4 w-4 text-aeon-primary" />
                                Biological Impact
                            </h4>
                            <div class="space-y-6">
                                <!-- Key Function -->
                                <div>
                                    <div class="text-sm text-gray-400 mb-2">Primary Function</div>
                                    <div class="text-[#4CC9F0] text-lg">
                                        {finding.knowledgeContext.establishedFunctions[0]}
                                    </div>
                                </div>

                                <!-- Tissue Context - Simplified -->
                                <div>
                                    <div class="text-sm text-gray-400 mb-1">Where It Matters</div>
                                    <div class="text-white">
                                        {finding.knowledgeContext.tissueContext.split('.')[0]}
                                    </div>
                                </div>

                                <!-- Health Impact - From evidence -->
                                <div>
                                    <div class="text-sm text-gray-400 mb-1">Health Relevance</div>
                                    <div class="text-white">
                                        {finding.evidence.healthRelevance}
                                    </div>
                                </div>

                                <!-- Link to more -->
                                <button 
                                    class="text-sm text-aeon-primary hover:text-aeon-biolum transition-colors flex items-center gap-1"
                                    on:click={handleContextLink}
                                >
                                    View full biological context
                                    <ChevronRight class="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            {:else if activeTab === 'recommendations'}
                <div class="space-y-6">
                    <!-- Primary Recommendation -->
                    {#if finding.recommendations[0]}
                        <div class="bg-aeon-surface-1 p-4 rounded-lg border-l-4 border-aeon-primary">
                            <h4 class="font-medium text-white flex items-center gap-2 mb-2">
                                <Target class="h-4 w-4 text-aeon-primary" />
                                Primary Recommendation
                            </h4>
                            <RecommendationItem recommendation={finding.recommendations[0]} />
                        </div>
                    {/if}

                    <!-- Supporting Recommendations -->
                    {#if finding.recommendations.slice(1).length}
                        <div class="space-y-4">
                            <h4 class="font-medium text-white text-sm px-4">Additional Recommendations</h4>
                            {#each finding.recommendations.slice(1) as recommendation}
                                <div class="bg-aeon-surface-1 p-4 rounded-lg">
                                    <RecommendationItem {recommendation} />
                                </div>
                            {/each}
                        </div>
                    {/if}

                    <!-- Important Considerations -->
                    {#if finding.recommendations[0]?.contraindications?.length}
                        <div class="bg-aeon-surface-1 p-4 rounded-lg border-l-4 border-yellow-500">
                            <h4 class="font-medium text-white flex items-center gap-2 mb-4">
                                <AlertTriangle class="h-4 w-4 text-yellow-500" />
                                Important Considerations
                            </h4>
                            <div class="space-y-2">
                                {#each finding.recommendations[0].contraindications as contraindication}
                                    <div class="flex items-start gap-2">
                                        <ChevronRight class="h-4 w-4 mt-1 text-yellow-500 flex-shrink-0" />
                                        <span class="text-sm text-aeon-biolum">{contraindication}</span>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Supporting Evidence -->
                    {#if finding.recommendations[0]?.supportingEvidence?.length}
                        <div class="bg-aeon-surface-1 p-4 rounded-lg">
                            <h4 class="font-medium text-white flex items-center gap-2 mb-4">
                                <FileText class="h-4 w-4 text-aeon-primary" />
                                Supporting Evidence
                            </h4>
                            <div class="space-y-2">
                                {#each finding.recommendations[0].supportingEvidence as evidence}
                                    <div class="flex items-start gap-2">
                                        <ChevronRight class="h-4 w-4 mt-1 text-aeon-primary flex-shrink-0" />
                                        <span class="text-sm text-aeon-biolum">{evidence}</span>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
            
            {:else if activeTab === 'science'}
                <div class="space-y-6">
                    <!-- Cellular Functions -->
                    <div class="bg-aeon-surface-1 p-4 rounded-lg">
                        <h4 class="font-medium text-white flex items-center gap-2 mb-4">
                            <Network class="h-4 w-4 text-aeon-primary" />
                            Cellular Functions
                        </h4>
                        <div class="space-y-4">
                            <!-- Established Functions -->
                            <div>
                                <div class="text-sm text-gray-400 mb-2">Established Functions</div>
                                <div class="space-y-2">
                                    {#each finding.knowledgeContext.establishedFunctions as func}
                                        <div class="flex items-start gap-2">
                                            <ChevronRight class="h-4 w-4 mt-1 text-aeon-primary flex-shrink-0" />
                                            <span class="text-sm text-aeon-biolum">{func}</span>
                                        </div>
                                    {/each}
                                </div>
                            </div>

                            <!-- Common Cellular Roles -->
                            <div>
                                <div class="text-sm text-gray-400 mb-2">Common Cellular Roles</div>
                                <div class="space-y-2">
                                    {#each finding.knowledgeContext.commonCellularRoles as role}
                                        <div class="flex items-start gap-2">
                                            <ChevronRight class="h-4 w-4 mt-1 text-aeon-primary flex-shrink-0" />
                                            <span class="text-sm text-aeon-biolum">{role}</span>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Biological Context -->
                    <div class="bg-aeon-surface-1 p-4 rounded-lg">
                        <h4 class="font-medium text-white flex items-center gap-2 mb-4">
                            <Dna class="h-4 w-4 text-aeon-primary" />
                            Biological Context
                        </h4>
                        <div class="space-y-4">
                            <!-- Tissue Context -->
                            <div>
                                <div class="text-sm text-gray-400 mb-2">Tissue Expression</div>
                                <p class="text-aeon-biolum">{finding.knowledgeContext.tissueContext}</p>
                            </div>

                            <!-- Evolutionary Context -->
                            <div>
                                <div class="text-sm text-gray-400 mb-2">Evolutionary Significance</div>
                                <p class="text-aeon-biolum">{finding.knowledgeContext.evolutionaryContext}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Regulatory Network -->
                    {#if finding.knowledgeContext.regulatoryNetwork}
                        <div class="bg-aeon-surface-1 p-4 rounded-lg">
                            <h4 class="font-medium text-white flex items-center gap-2 mb-4">
                                <Network class="h-4 w-4 text-aeon-primary" />
                                Regulatory Network
                            </h4>
                            <div class="space-y-4">
                                <!-- Upstream Factors -->
                                {#if finding.knowledgeContext.regulatoryNetwork.upstream?.length}
                                    <div>
                                        <div class="text-sm text-gray-400 mb-2">Upstream Factors</div>
                                        <div class="space-y-2">
                                            {#each finding.knowledgeContext.regulatoryNetwork.upstream as factor}
                                                <div class="flex items-start gap-2">
                                                    <ChevronDown class="h-4 w-4 mt-1 text-aeon-primary flex-shrink-0" />
                                                    <span class="text-sm text-aeon-biolum">{factor}</span>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                {/if}

                                <!-- Downstream Effects -->
                                {#if finding.knowledgeContext.regulatoryNetwork.downstream?.length}
                                    <div>
                                        <div class="text-sm text-gray-400 mb-2">Downstream Effects</div>
                                        <div class="space-y-2">
                                            {#each finding.knowledgeContext.regulatoryNetwork.downstream as effect}
                                                <div class="flex items-start gap-2">
                                                    <ChevronRight class="h-4 w-4 mt-1 text-aeon-primary flex-shrink-0" />
                                                    <span class="text-sm text-aeon-biolum">{effect}</span>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/if}

                    <!-- Conserved Pathways -->
                    {#if finding.knowledgeContext.conservedPathways?.length}
                        <div class="bg-aeon-surface-1 p-4 rounded-lg">
                            <h4 class="font-medium text-white flex items-center gap-2 mb-4">
                                <GitBranch class="h-4 w-4 text-aeon-primary" />
                                Conserved Pathways
                            </h4>
                            <div class="space-y-2">
                                {#each finding.knowledgeContext.conservedPathways as pathway}
                                    <div class="flex items-start gap-2">
                                        <ChevronRight class="h-4 w-4 mt-1 text-aeon-primary flex-shrink-0" />
                                        <span class="text-sm text-aeon-biolum">{pathway}</span>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
                
            {:else if activeTab === 'evidence'}
                <div class="space-y-6">
                    <!-- Research Links -->
                    {#if studyIds.length}
                        <div class="bg-aeon-surface-1 p-4 rounded-lg">
                            <h4 class="font-medium text-white flex items-center gap-2 mb-4">
                                <FileText class="h-4 w-4 text-aeon-primary" />
                                Primary Research
                            </h4>
                            <div class="space-y-2">
                                {#each studyIds as studyId}
                                    <a 
                                        href={`https://doi.org/${studyId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="flex items-center gap-2 text-sm text-aeon-primary hover:text-aeon-biolum transition-colors"
                                    >
                                        <ChevronRight class="h-4 w-4 flex-shrink-0" />
                                        <span>DOI: {studyId}</span>
                                        <ExternalLink class="h-3 w-3" />
                                    </a>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Study Context -->
                    {#if finding.provenance.studyContext?.primaryStudyId}
                        <div class="bg-aeon-surface-1 p-4 rounded-lg">
                            <h4 class="font-medium text-white flex items-center gap-2 mb-4">
                                <FileText class="h-4 w-4 text-aeon-primary" />
                                Research Context
                            </h4>
                            <div class="space-y-4">
                                <!-- Study Population -->
                                {#if finding.provenance.studyContext.studyMetrics[0]?.populationContext}
                                    <div>
                                        <div class="text-sm text-gray-400 mb-2">Study Population</div>
                                        <p class="text-aeon-biolum">
                                            {finding.provenance.studyContext.studyMetrics[0].populationContext}
                                        </p>
                                    </div>
                                {/if}

                                <!-- Study Groups -->
                                {#if finding.provenance.studyContext.studyMetrics[0]?.studyPopulationSummary?.length}
                                    <div>
                                        <div class="text-sm text-gray-400 mb-2">Study Groups</div>
                                        <div class="grid gap-3">
                                            {#each finding.provenance.studyContext.studyMetrics[0].studyPopulationSummary as group}
                                                <div class="bg-aeon-surface-0 p-3 rounded-lg">
                                                    <div class="flex justify-between items-start">
                                                        <span class="text-sm text-white font-medium">{group.groupName}</span>
                                                        {#if group.count}
                                                            <span class="text-sm text-aeon-primary">n = {group.count}</span>
                                                        {/if}
                                                    </div>
                                                    {#if group.description}
                                                        <p class="text-sm text-aeon-biolum mt-1">{group.description}</p>
                                                    {/if}
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/if}

                    <!-- Mechanistic Evidence -->
                    <div class="bg-aeon-surface-1 p-4 rounded-lg">
                        <h4 class="font-medium text-white flex items-center gap-2 mb-4">
                            <Network class="h-4 w-4 text-aeon-primary" />
                            Mechanistic Evidence
                        </h4>
                        <div class="space-y-4">
                            <!-- Mechanistic Insights -->
                            <div>
                                <div class="text-sm text-gray-400 mb-2">Key Insights</div>
                                <div class="space-y-2">
                                    {#each finding.evidence.mechanisticInsights as insight}
                                        <div class="flex items-start gap-2">
                                            <ChevronRight class="h-4 w-4 mt-1 text-aeon-primary flex-shrink-0" />
                                            <span class="text-sm text-aeon-biolum">{insight}</span>
                                        </div>
                                    {/each}
                                </div>
                            </div>

                            <!-- Functional Impact -->
                            {#if finding.evidence.functionalImpact?.length}
                                <div>
                                    <div class="text-sm text-gray-400 mb-2">Functional Impact</div>
                                    <div class="space-y-2">
                                        {#each finding.evidence.functionalImpact as impact}
                                            <div class="flex items-start gap-2">
                                                <ChevronRight class="h-4 w-4 mt-1 text-aeon-primary flex-shrink-0" />
                                                <span class="text-sm text-aeon-biolum">{impact}</span>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Region Details -->
                    {#if finding.provenance.associated_regions[0]}
                        <div class="bg-aeon-surface-1 p-4 rounded-lg">
                            <h4 class="font-medium text-white flex items-center gap-2 mb-4">
                                <Dna class="h-4 w-4 text-aeon-primary" />
                                Genomic Context
                            </h4>
                            <div class="space-y-4">
                                <!-- Location Info -->
                                <div class="grid grid-cols-2 gap-4 text-sm">
                                    {#if finding.provenance.associated_regions[0].probe_name}
                                        <div>
                                            <div class="text-gray-400">Probe ID</div>
                                            <div class="font-medium text-white">
                                                {finding.provenance.associated_regions[0].probe_name}
                                            </div>
                                        </div>
                                    {/if}
                                    {#if finding.provenance.associated_regions[0].context}
                                        <div>
                                            <div class="text-gray-400">Genomic Context</div>
                                            <div class="font-medium text-white">
                                                {finding.provenance.associated_regions[0].context}
                                            </div>
                                        </div>
                                    {/if}
                                </div>

                                <!-- Region Description -->
                                {#if finding.provenance.associated_regions[0].description}
                                    <div>
                                        <div class="text-sm text-gray-400 mb-2">Detailed Description</div>
                                        <p class="text-sm text-aeon-biolum">
                                            {finding.provenance.associated_regions[0].description}
                                        </p>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .insight-card {
        position: relative;
        border-radius: 0.75rem;
        background: var(--aeon-surface-0);
        backdrop-filter: blur(20px);
        overflow: hidden;
        box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.2),
            0 2px 4px -2px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(76, 201, 240, 0.05);
        margin-bottom: 1rem;
    }

    .insight-card::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(
            45deg,
            rgba(76, 201, 240, 0.15),
            rgba(128, 255, 219, 0.15)
        );
        mask: linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
    }

    :global(body) {
        background: rgb(17, 24, 39);
    }

    .insight-card {
        --card-padding: 1.5rem;
        --section-spacing: 2rem;
        --text-primary: #4CC9F0;
        --text-secondary: #94A3B8;
        background: rgba(17, 24, 39, 0.95);
    }

    .content-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .content-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        color: rgb(156 163 175);
        font-size: 0.875rem;
        line-height: 1.4;
    }

    .content-item :global(svg) {
        width: 16px;
        height: 16px;
        margin-top: 0.25rem;
        flex-shrink: 0;
        color: var(--aeon-primary);
    }

    :global(.text-aeon-primary) {
        color: #4CC9F0;
    }
</style> 