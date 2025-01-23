<script lang="ts">
    import type { AssociatedRegion } from '$lib/types/insights';
    import BaseSelector from './BaseSelector.svelte';

    export let regions: AssociatedRegion[];
    export let selectedIndex: number = 0;

    $: uniqueRegions = (() => {
        const seen = new Set();
        return regions.filter(region => {
            const key = region.matched_probe ? `${region.matched_gene}-${region.matched_probe}` : region.matched_gene;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    })();

    function getDisplayText(region: AssociatedRegion): string {
        return region.matched_probe || region.matched_gene || '';
    }
</script>

<BaseSelector
    items={uniqueRegions}
    bind:selectedIndex
    getDisplayText={getDisplayText}
    label="Region"
/> 