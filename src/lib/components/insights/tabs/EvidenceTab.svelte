<script lang="ts">
    import { FileText, Network, Dna, ChevronRight, ExternalLink } from 'lucide-svelte';
    import type { Finding } from '../types';
    
    export let finding: Finding;

    // Helper to get all unique study IDs across all regions
    $: studyIds = [...new Set(
        finding.provenance.associated_regions
            .flatMap(region => region.studyIds || [])
    )];
</script>

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
                    {#if finding.provenance.associated_regions[0].matched_probe}
                        <div>
                            <div class="text-gray-400">Probe ID</div>
                            <div class="font-medium text-white">
                                {finding.provenance.associated_regions[0].matched_probe}
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