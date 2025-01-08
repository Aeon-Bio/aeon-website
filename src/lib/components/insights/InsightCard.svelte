<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Finding, Tab } from '../../types/insights';
  import { BarChart, Target, Beaker, FileSpreadsheet } from 'lucide-svelte';
  import Header from './layout/Header.svelte';
  import OverviewTab from './tabs/OverviewTab.svelte';
  import RecommendationsTab from './tabs/RecommendationsTab.svelte';
  import ScienceTab from './tabs/ScienceTab.svelte';
  import EvidenceTab from './tabs/EvidenceTab.svelte';

  const dispatch = createEventDispatcher();

  export let finding: Finding;
  export let expanded = false;
  
  let activeTab: Tab = 'overview';
  let cardElement: HTMLDivElement;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'recommendations', label: 'Recommendations', icon: Target },
    { id: 'science', label: 'Science', icon: Beaker },
    { id: 'evidence', label: 'Evidence', icon: FileSpreadsheet }
  ] as const;

  function handleTabChange(event: CustomEvent<string>) {
    activeTab = event.detail;
  }

  function toggleExpanded() {
    expanded = !expanded;
    if (expanded) {
        dispatch('expand');
        setTimeout(() => {  // Wait for the next tick so the page height is updated
            cardElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    } else {
        dispatch('collapse');
    }
  }
</script>

<div bind:this={cardElement} class="insight-card">
  <Header {finding} {expanded} on:toggle={toggleExpanded} />

  {#if expanded}
    <div class="border-t border-aeon-surface-1 p-6 pt-3">
      <div>
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
      0 0 0 1px rgba(76, 201, 240, 0.05),
      0 8px 24px -4px rgba(0, 0, 0, 0.3);
    margin-bottom: 1rem;
    background: rgba(17, 24, 39, 0.95);
    --card-padding: 1.5rem;
    --section-spacing: 2rem;
    --text-primary: #4CC9F0;
    --text-secondary: #94A3B8;
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

  .insight-card::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(17, 24, 39, 0.2)
    );
    pointer-events: none;
  }

  button {
    white-space: nowrap;
  }
</style> 