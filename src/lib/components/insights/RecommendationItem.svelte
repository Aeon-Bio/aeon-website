<script lang="ts">
    import StrengthBadge from './StrengthBadge.svelte';
    import { Target, Info } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    export let recommendation: any; // TODO: Add proper typing
    
    let Icon: any = Target;
    let showStrengthInfo = false;
    let tooltipTimeout: NodeJS.Timeout;
    
    const strengthDescriptions = {
        strong: "Backed by multiple high-quality studies with consistent results",
        moderate: "Supported by scientific evidence, but may need more research",
        preliminary: "Early research shows promise, but needs further validation"
    };
    
    function handleTooltipEnter() {
        clearTimeout(tooltipTimeout);
        showStrengthInfo = true;
    }

    function handleTooltipLeave() {
        console.log('handleTooltipLeave');
        tooltipTimeout = setTimeout(() => {
            showStrengthInfo = false;
        }, 100);
    }
    
    onMount(async () => {
        try {
            // Use @vite-ignore to allow dynamic imports from lucide-svelte
            // Convert kebab-case to PascalCase for the import
            const iconName = recommendation.lucideIcon
                .split('-')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
                
            // @ts-ignore
            // @vite-ignore
            const module = await import(`lucide-svelte`);
            Icon = module[iconName];
            
            if (!Icon) {
                console.warn(`Icon ${iconName} not found, using fallback`);
                Icon = Target;
            }
        } catch (error) {
            console.warn(`Error loading icon ${recommendation.lucideIcon}, using fallback`, error);
            Icon = Target;
        }
    });
</script>

<div class="recommendation-item">
    <div class="content space-y-4">
        <div class="flex items-start gap-4">
            <div class="flex items-start gap-2 w-full">
                <svelte:component this={Icon} class="h-5 w-5 text-aeon-primary flex-shrink-0" />
                <div class="w-full">
                    <div class="flex items-center justify-between gap-2 mb-3">
                        <p class="text-white font-medium">
                            {recommendation.recommendation}
                        </p>
                        <div class="relative flex items-center gap-2">
                            <button 
                                class="text-aeon-primary hover:text-aeon-biolum transition-colors"
                                on:mouseenter={handleTooltipEnter}
                                on:mouseleave={handleTooltipLeave}
                            >
                                <Info class="h-4 w-4" />
                            </button>
                            <!-- <StrengthBadge strength={recommendation.strength} /> -->
                            
                            {#if showStrengthInfo}
                                <div 
                                    class="strength-tooltip"
                                    transition:fade={{duration: 100}}
                                    on:mouseenter={handleTooltipEnter}
                                    on:mouseleave={handleTooltipLeave}
                                >
                                    {strengthDescriptions[recommendation.strength.toLowerCase()] || 
                                     "Recommendation strength based on available evidence"}
                                </div>
                            {/if}
                        </div>
                    </div>

                    {#if recommendation.specificActions?.length}
                        <div class="text-sm text-aeon-biolum space-y-2 mb-3">
                            {#each recommendation.specificActions as action}
                                <div class="flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-aeon-primary" />
                                    {action}
                                </div>
                            {/each}
                        </div>
                    {/if}
                    
                    <p class="text-sm text-gray-400">
                        {recommendation.rationale}
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .recommendation-item {
        position: relative;
        padding: 1rem;
        border-radius: 0.75rem;
        background: var(--aeon-surface-0);
        backdrop-filter: blur(20px);
    }

    .recommendation-item::before {
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

    .content {
        position: relative;
        z-index: 1;
    }

    .strength-tooltip {
        position: absolute;
        right: 0;
        top: 100%;
        margin-top: 0.5rem;
        background: var(--aeon-surface-0);
        border-radius: 0.5rem;
        padding: 0.75rem;
        width: max-content;
        max-width: 250px;
        font-size: 0.875rem;
        color: var(--aeon-biolum);
        box-shadow: 0 0 0 1px rgba(76, 201, 240, 0.1),
                   0 4px 20px rgba(0, 0, 0, 0.4);
        z-index: 10;
    }

    .strength-tooltip::before {
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
</style> 