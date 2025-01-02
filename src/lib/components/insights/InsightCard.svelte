<script lang="ts">
  import type { Finding, Tab } from './types';
  import { BarChart, Target, Beaker, FileSpreadsheet } from 'lucide-svelte';
  import Card from './layout/Card.svelte';
  import Header from './layout/Header.svelte';
  import OverviewTab from './tabs/OverviewTab.svelte';
  import RecommendationsTab from './tabs/RecommendationsTab.svelte';
  import ScienceTab from './tabs/ScienceTab.svelte';
  import EvidenceTab from './tabs/EvidenceTab.svelte';

  export let finding: Finding;
  export let expanded = false;
  
  let activeTab: Tab = 'overview';
  let tabsContainer: HTMLDivElement;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'recommendations', label: 'Recommendations', icon: Target },
    { id: 'science', label: 'Science', icon: Beaker },
    { id: 'evidence', label: 'Evidence', icon: FileSpreadsheet }
  ] as const;

  function handleTabChange(event: CustomEvent<string>) {
    activeTab = event.detail;
    tabsContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggleExpanded() {
    expanded = !expanded;
  }
</script>

<Card>
  <Header {finding} {expanded} on:toggle={toggleExpanded} />

  {#if expanded}
    <div class="border-t border-aeon-surface-1 p-6 pt-3">
      <div bind:this={tabsContainer}>
        <div class="flex gap-2 mb-2 overflow-x-auto pb-2">
          {#each tabs as tab}
            <button 
              on:click={() => handleTabChange(new CustomEvent('tabChange', { detail: tab.id }))}
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
      </div>
      
      {#if activeTab === 'overview'}
        <OverviewTab {finding} on:tabChange={handleTabChange} />
      {:else if activeTab === 'recommendations'}
        <RecommendationsTab {finding} />
      {:else if activeTab === 'science'}
        <ScienceTab {finding} />
      {:else if activeTab === 'evidence'}
        <EvidenceTab {finding} />
      {/if}
    </div>
  {/if}
</Card>

<style>
  button {
    white-space: nowrap;
  }
</style> 