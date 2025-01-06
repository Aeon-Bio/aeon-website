<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { ChevronDown } from 'lucide-svelte';
    import type { Finding } from '../types';
    
    export let finding: Finding;
    export let expanded: boolean;

    const dispatch = createEventDispatcher();
    
    function handleClick() {
        dispatch('toggle');
    }

    $: geneList = [...new Set(finding.provenance.associated_regions.map(region => region.matched_gene || region.gene_name))]
</script>

<div 
    class="p-6 pb-3 cursor-pointer"
    on:click={handleClick}
>
    <div class="flex items-start justify-between">
        <div class="space-y-2">
            <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-aeon-biolum">
                    {geneList.join(", ")} Pattern
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