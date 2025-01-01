<script lang="ts">
    import type { Recommendation } from '$lib/types/insights';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { Target, Info, ChevronRight } from 'lucide-svelte';
    
    export let recommendation: Recommendation;
    let Icon: any = Target;
    let showStrengthInfo = false;
    let tooltipTimeout: NodeJS.Timeout;
    
    const strengthClasses = {
        strong: 'bg-green-100 text-green-800',
        moderate: 'bg-blue-100 text-blue-800',
        preliminary: 'bg-gray-100 text-gray-800'
    };
    
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
        tooltipTimeout = setTimeout(() => {
            showStrengthInfo = false;
        }, 100);
    }
    
    onMount(async () => {
        try {
            const iconName = recommendation.lucideIcon
                .split('-')
                .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
                
            const module = await import('lucide-svelte');
            Icon = module[iconName as keyof typeof module];
            
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
    <div class="space-y-4 p-4">
        <div class="flex items-start justify-between">
            <h4 class="font-medium text-lg flex items-center gap-2 text-white">
                <svelte:component this={Icon} class="h-5 w-5 text-aeon-primary" />
                {recommendation.recommendation}
            </h4>
            
            <div class="flex items-center gap-2">
                <button 
                    class="text-aeon-primary hover:text-aeon-biolum transition-colors"
                    on:mouseenter={handleTooltipEnter}
                    on:mouseleave={handleTooltipLeave}
                >
                    <Info class="h-4 w-4" />
                </button>
                <span class={`px-2 py-1 rounded-full text-xs font-medium ${
                    strengthClasses[recommendation.strength.toLowerCase() as keyof typeof strengthClasses]
                }`}>
                    {recommendation.strength}
                </span>
            </div>
        </div>
        
        <p class="text-gray-400">{recommendation.rationale}</p>
        
        {#if recommendation.specificActions?.length}
            <div>
                <h5 class="font-medium text-white mb-2">Specific Actions</h5>
                <div class="space-y-2">
                    {#each recommendation.specificActions as action}
                        <div class="flex items-start gap-2">
                            <ChevronRight class="h-4 w-4 mt-1 text-aeon-primary flex-shrink-0" />
                            <span class="text-sm text-aeon-biolum">{action}</span>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        {#if recommendation.monitoringMetrics?.length}
            <div>
                <h5 class="font-medium text-white mb-2">Monitoring Plan</h5>
                <div class="grid gap-4">
                    {#each recommendation.monitoringMetrics as metric}
                        <div class="bg-aeon-surface-1 p-3 rounded-lg">
                            <div class="flex items-center gap-2 mb-1">
                                <Target class="h-4 w-4 text-aeon-primary" />
                                <span class="font-medium text-white">{metric.metric}</span>
                            </div>
                            <div class="text-sm text-aeon-biolum">
                                Check {metric.frequency.toLowerCase()} • Target: {metric.target}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        {#if showStrengthInfo}
            <div 
                class="strength-tooltip"
                transition:fade={{duration: 100}}
                on:mouseenter={handleTooltipEnter}
                on:mouseleave={handleTooltipLeave}
            >
                {strengthDescriptions[recommendation.strength.toLowerCase() as keyof typeof strengthDescriptions]}
            </div>
        {/if}
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