<script lang="ts">
    import type { Recommendation } from '$lib/types/insights';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { Target, Info, ChevronRight, AlertTriangle, FileText } from 'lucide-svelte';
    
    export let recommendation: Recommendation;
    export let abbreviated = false;
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
    <div class="space-y-6">
        <!-- Header Section -->
        <div class="flex items-start justify-between">
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 bg-aeon-surface-1 rounded-lg">
                        <svelte:component this={Icon} class="h-5 w-5 text-aeon-primary" />
                    </div>
                    <h4 class="font-medium text-lg text-white">
                        {recommendation.recommendation}
                    </h4>
                </div>
                <p class="text-aeon-biolum text-sm leading-relaxed">
                    {recommendation.rationale}
                </p>
            </div>
            
            <div class="flex items-center gap-2 ml-4 flex-shrink-0">
                <button 
                    class="p-1.5 hover:bg-aeon-surface-1 rounded-lg transition-colors"
                    on:mouseenter={handleTooltipEnter}
                    on:mouseleave={handleTooltipLeave}
                >
                    <Info class="h-4 w-4 text-aeon-primary" />
                </button>
                <span class={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    strengthClasses[recommendation.strength.toLowerCase() as keyof typeof strengthClasses]
                }`}>
                    {recommendation.strength}
                </span>
            </div>
        </div>

        {#if !abbreviated}
            <!-- Specific Actions -->
            {#if recommendation.specificActions?.length}
                <div class="space-y-3">
                    <h5 class="font-medium text-white text-sm">Specific Actions</h5>
                    <div class="grid gap-2">
                        {#each recommendation.specificActions as action}
                            <div class="flex items-start gap-3 bg-aeon-surface-1/50 rounded-lg hover:bg-aeon-surface-1 transition-colors">
                                <ChevronRight class="h-4 w-4 mt-0.5 text-aeon-primary flex-shrink-0" />
                                <span class="text-sm text-aeon-biolum">{action}</span>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Monitoring and Evidence Grid -->
            <div class="grid gap-6 grid-cols-1 md:grid-cols-2">
                <!-- Monitoring Plan -->
                {#if recommendation.monitoringMetrics?.length}
                    <div class="space-y-3">
                        <h5 class="font-medium text-white text-sm">Monitoring Plan</h5>
                        <div class="grid gap-2">
                            {#each recommendation.monitoringMetrics as metric}
                                <div class="bg-aeon-surface-1/50 rounded-lg hover:bg-aeon-surface-1 transition-colors">
                                    <div class="flex items-center gap-3 p-4 pb-2">
                                        <div class="p-1.5 bg-aeon-surface-1 rounded-md">
                                            <Target class="h-4 w-4 text-aeon-primary" />
                                        </div>
                                        <span class="font-medium text-white">{metric.metric}</span>
                                    </div>
                                    <div class="text-sm text-aeon-biolum px-4 pb-4 ml-10">
                                        Check {metric.frequency.toLowerCase()} • Target: {metric.target}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- Supporting Evidence -->
                {#if recommendation.supportingEvidence?.length}
                    <div class="space-y-3">
                        <h5 class="font-medium text-white text-sm">Supporting Evidence</h5>
                        <div class="space-y-2">
                            {#each recommendation.supportingEvidence as evidence}
                                <div class="bg-aeon-surface-1/50 rounded-lg hover:bg-aeon-surface-1 transition-colors">
                                    <div class="flex items-start gap-3 p-4">
                                        <div class="p-1.5 bg-aeon-surface-1 rounded-md flex-shrink-0">
                                            <FileText class="h-4 w-4 text-aeon-primary" />
                                        </div>
                                        <span class="text-sm text-aeon-biolum">{evidence}</span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Important Considerations -->
            {#if recommendation.contraindications?.length}
                <div class="space-y-3">
                    <div class="bg-aeon-surface-1 p-4 rounded-lg border-l-4 border-yellow-500">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="p-1.5 rounded-md">
                                <AlertTriangle class="h-4 w-4 text-yellow-500" />
                            </div>
                            <h5 class="font-medium text-white">Important Considerations</h5>
                        </div>
                        <div class="space-y-2 ml-10">
                            {#each recommendation.contraindications as contraindication}
                                <div class="flex items-start gap-2">
                                    <ChevronRight class="h-4 w-4 mt-1 text-yellow-500 flex-shrink-0" />
                                    <span class="text-sm text-aeon-biolum">{contraindication}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            {/if}
        {/if}

        {#if showStrengthInfo}
            <div 
                class="strength-tooltip"
                transition:fade={{duration: 150}}
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
        padding: 1.5rem;
        border-radius: 1rem;
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

    .strength-tooltip {
        position: absolute;
        right: 1.5rem;
        top: 2rem;
        background: var(--aeon-surface-0);
        border-radius: 0.75rem;
        padding: 0.75rem 1rem;
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