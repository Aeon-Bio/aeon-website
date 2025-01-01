<script lang="ts">
    import { BarChart, Target, Beaker, FileSpreadsheet } from 'lucide-svelte';
    import { createEventDispatcher } from 'svelte';
    
    export let activeTab: 'overview' | 'recommendations' | 'science' | 'evidence';
    const dispatch = createEventDispatcher();
    
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart },
        { id: 'recommendations', label: 'Recommendations', icon: Target },
        { id: 'science', label: 'Science', icon: Beaker },
        { id: 'evidence', label: 'Evidence', icon: FileSpreadsheet }
    ] as const;

    function setTab(tab: typeof activeTab) {
        dispatch('tabChange', tab);
    }
</script>

<div class="flex gap-2 mb-6 overflow-x-auto pb-2">
    {#each tabs as tab}
        <button 
            on:click={() => setTab(tab.id as typeof activeTab)}
            class={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.id 
                    ? 'bg-aeon-surface-1 text-aeon-primary' 
                    : 'text-gray-400 hover:bg-aeon-surface-1 hover:text-aeon-biolum'}`}
        >
            <svelte:component this={tab.icon} class="h-4 w-4" />
            {tab.label}
        </button>
    {/each}
</div>

<style>
    button {
        white-space: nowrap;
    }
</style> 