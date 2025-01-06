<script lang="ts">
    import { ChevronLeft, ChevronRight } from 'lucide-svelte';
    import type { AssociatedRegion } from '$lib/types/insights';

    export let regions: AssociatedRegion[];
    export let selectedIndex: number = 0;

    function nextRegion() {
        selectedIndex = (selectedIndex + 1) % regions.length;
    }

    function previousRegion() {
        selectedIndex = selectedIndex === 0 ? regions.length - 1 : selectedIndex - 1;
    }

    $: hasMultipleRegions = regions.length > 1;
</script>

<div class="flex items-center gap-2 {hasMultipleRegions ? 'justify-between' : 'justify-center'}">
    {#if hasMultipleRegions}
        <button
            class="p-1 hover:bg-aeon-surface-0 rounded-full transition-colors"
            on:click={previousRegion}
        >
            <ChevronLeft class="h-4 w-4" />
        </button>
    {/if}
    
    <div class="text-sm text-aeon-biolum">
        {#if hasMultipleRegions}
            Region {selectedIndex + 1} of {regions.length}
        {/if}
        {#if regions[selectedIndex].matched_gene}
            <span class="text-aeon-primary {hasMultipleRegions ? 'ml-2' : ''}">
                {regions[selectedIndex].matched_gene}
            </span>
        {/if}
    </div>

    {#if hasMultipleRegions}
        <button
            class="p-1 hover:bg-aeon-surface-0 rounded-full transition-colors"
            on:click={nextRegion}
        >
            <ChevronRight class="h-4 w-4" />
        </button>
    {/if}
</div> 