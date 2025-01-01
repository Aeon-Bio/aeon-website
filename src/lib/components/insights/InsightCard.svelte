<script lang="ts">
    import { slide } from 'svelte/transition';
    import Card from '../ui/Card.svelte';
    import RecommendationItem from './RecommendationItem.svelte';
    import ScientificContext from './ScientificContext.svelte';
    import EvidenceAssessment from './EvidenceAssessment.svelte';
    import ResearchLinks from './ResearchLinks.svelte';
    import { BarChart, ChevronDown } from 'lucide-svelte';

    export let finding: any; // TODO: Add proper typing
    
    let isExpanded = false;
    
    $: studyIds = finding.provenance.associated_regions
        .flatMap(region => region.studyIds)
        .filter((value, index, self) => self.indexOf(value) === index);
</script>

<Card className="transition-all duration-200 {isExpanded ? 'ring-2 ring-aeon-primary' : 'hover:bg-aeon-surface-1'}">
    <div 
        class="p-4 cursor-pointer"
        on:click={() => isExpanded = !isExpanded}
    >
        <div class="flex items-start justify-between">
            <div class="space-y-2">
                <div class="flex items-center gap-2">
                    <BarChart class="h-5 w-5 text-aeon-primary" />
                    <span class="text-sm font-medium text-aeon-biolum">
                        {finding.pattern.personally_associated_genes.join(', ')} Pattern
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
                class="h-6 w-6 transition-transform text-aeon-primary {isExpanded ? 'rotate-180' : ''}"
            />
        </div>
    </div>

    {#if isExpanded}
        <div class="p-4 space-y-6" transition:slide>
            <p class="text-aeon-biolum leading-relaxed">
                {finding.description}
            </p>

            <div>
                <h4 class="font-medium text-lg mb-4">Personalized Recommendations</h4>
                <div class="grid gap-4">
                    {#each finding.recommendations as recommendation}
                        <RecommendationItem {recommendation} />
                    {/each}
                </div>
            </div>

            <ScientificContext 
                evidence={finding.evidence}
                studyIds={studyIds}
            />
            <EvidenceAssessment evidence={finding.evidence} />
        </div>
    {/if}
</Card> 