<script lang="ts">
    import { Book, ChevronDown } from 'lucide-svelte';
    
    export let studyIds: string[];
    
    let isOpen = false;
    
    function getDOIUrl(doi: string) {
        return `https://doi.org/${doi}`;
    }
    
    function handleClick(doi: string) {
        window.open(getDOIUrl(doi), '_blank');
        isOpen = false;
    }
</script>

<div class="relative">
    {#if studyIds.length === 1}
        <button
            class="research-btn"
            on:click={() => handleClick(studyIds[0])}
        >
            <Book class="h-4 w-4" />
            <span>View Research</span>
        </button>
    {:else}
        <button
            class="research-btn"
            on:click={() => isOpen = !isOpen}
        >
            <Book class="h-4 w-4" />
            <span>View Research</span>
            <ChevronDown class="h-4 w-4 transition-transform {isOpen ? 'rotate-180' : ''}" />
        </button>
        
        {#if isOpen}
            <div 
                class="research-menu"
                transition:slide={{ duration: 200 }}
            >
                {#each studyIds as doi, i}
                    <button
                        class="menu-item"
                        on:click={() => handleClick(doi)}
                    >
                        View study {i + 1}
                    </button>
                {/each}
            </div>
        {/if}
    {/if}
</div>

<style>
    .research-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: rgba(26, 27, 47, 0.95);
        color: var(--aeon-primary);
        border-radius: 0.5rem;
        font-size: 0.875rem;
        transition: all 0.2s;
        border: 1px solid rgba(76, 201, 240, 0.2);
    }
    
    .research-btn:hover {
        background: rgba(26, 27, 47, 0.8);
        color: var(--aeon-biolum);
        border-color: var(--aeon-biolum);
    }
    
    .research-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 0.5rem;
        background: var(--aeon-surface-0);
        border-radius: 0.5rem;
        overflow: hidden;
        min-width: 150px;
        box-shadow: 0 0 0 1px rgba(76, 201, 240, 0.1),
                   0 4px 20px rgba(0, 0, 0, 0.4);
    }
    
    .research-menu::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(
            45deg,
            rgba(76, 201, 240, 0.1),
            rgba(128, 255, 219, 0.1)
        );
        mask: linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
    }
    
    .menu-item {
        display: block;
        width: 100%;
        padding: 0.75rem 1rem;
        text-align: left;
        color: var(--aeon-primary);
        transition: all 0.2s;
    }
    
    .menu-item:hover {
        background: var(--aeon-surface-2);
        color: var(--aeon-biolum);
    }
</style> 