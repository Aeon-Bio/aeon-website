<script lang="ts">
    import { BarChart, Info } from 'lucide-svelte';
    import type { MethylationMetrics } from '../../../types/insights';
    import { fade } from 'svelte/transition';
    
    export let metrics: MethylationMetrics;
    export let direction: 'hyper' | 'hypo';

    // Only show key distribution markers
    $: distributionMarkers = [
        { pos: metrics.population_distribution.q25, label: '25th' },
        { pos: metrics.population_distribution.q75, label: '75th' }
    ];

    // Helper function for ordinal suffixes
    function getOrdinalSuffix(n: number): string {
        const lastDigit = n % 10;
        const lastTwoDigits = n % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
            return 'th';
        }
        
        switch (lastDigit) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    // Format percentile nicely
    $: formattedPercentile = metrics.percentile === 100 
        ? '100th'
        : metrics.percentile < 0.01 
            ? '< 0.01th'
            : `${metrics.percentile.toFixed(1)}${getOrdinalSuffix(metrics.percentile)}`;

    let gaussianGradient: string;
    let iqrBackground: string;

    // Calculate gradients
    $: {
        const { median, mad, q25, q75 } = metrics.population_distribution;
        
        // Gaussian gradient centered on median
        const positions = [
            { pos: Math.max(0, median - 2 * mad), opacity: 0.02 },
            { pos: Math.max(0, median - mad), opacity: 0.1 },
            { pos: median, opacity: 0.2 },
            { pos: Math.min(1, median + mad), opacity: 0.1 },
            { pos: Math.min(1, median + 2 * mad), opacity: 0.02 }
        ];

        gaussianGradient = `
            linear-gradient(to right,
                rgba(76,201,240,0) 0%,
                ${positions.map(p => 
                    `rgba(76,201,240,${p.opacity}) ${p.pos * 100}%`
                ).join(',')},
                rgba(76,201,240,0) 100%
            )
        `;

        // IQR background
        iqrBackground = `
            linear-gradient(to right,
                rgba(76,201,240,0) 0%,
                rgba(76,201,240,0) ${q25 * 100}%,
                rgba(76,201,240,0.1) ${q25 * 100}%,
                rgba(76,201,240,0.1) ${q75 * 100}%,
                rgba(76,201,240,0) ${q75 * 100}%,
                rgba(76,201,240,0) 100%
            )
        `;
    }

    // Calculate label positions with collision avoidance
    $: labelPositions = (() => {
        const minSpacing = 0.1; // Minimum 10% spacing between labels
        const labels = [
            { pos: metrics.population_distribution.q25, text: '25th', priority: 1 },
            { pos: metrics.population_distribution.median, text: 'Median', priority: 2 },
            { pos: metrics.population_distribution.q75, text: '75th', priority: 1 }
        ].sort((a, b) => a.pos - b.pos);

        // If labels are too close, hide lower priority ones
        for (let i = 1; i < labels.length; i++) {
            const prev = labels[i - 1];
            const curr = labels[i];
            if (curr.pos - prev.pos < minSpacing) {
                // Hide the lower priority label
                if (prev.priority < curr.priority) {
                    prev.hidden = true;
                } else if (curr.priority < prev.priority) {
                    curr.hidden = true;
                }
            }
        }

        return labels.filter(label => !label.hidden);
    })();

    let showStatsInfo = false;
    let tooltipTimeout: NodeJS.Timeout;
    
    function handleTooltipEnter() {
        clearTimeout(tooltipTimeout);
        showStatsInfo = true;
    }

    function handleTooltipLeave() {
        tooltipTimeout = setTimeout(() => {
            showStatsInfo = false;
        }, 100);
    }
</script>

<div class="bg-aeon-surface-1 rounded-lg">
    <div class="flex items-center justify-between p-6 pb-0">
        <h4 class="font-medium text-white flex items-center gap-2">
            <BarChart class="h-4 w-4 text-aeon-primary" />
            Methylation Status
        </h4>
        <div class="relative">
            <button 
                class="p-1.5 hover:bg-aeon-surface-1 rounded-lg transition-colors"
                on:mouseenter={handleTooltipEnter}
                on:mouseleave={handleTooltipLeave}
            >
                <Info class="h-4 w-4 text-aeon-primary" />
            </button>

            {#if showStatsInfo}
                <div 
                    class="stats-tooltip"
                    transition:fade={{duration: 150}}
                    on:mouseenter={handleTooltipEnter}
                    on:mouseleave={handleTooltipLeave}
                >
                    <ul class="space-y-2">
                        <li class="grid grid-cols-[auto_1fr] gap-2">
                            <strong>Your Level:</strong>
                            <span>How often this DNA site is methylated in your cells</span>
                        </li>
                        <li class="grid grid-cols-[auto_1fr] gap-2">
                            <strong>Population:</strong>
                            <span>The most common methylation pattern seen at this site</span>
                        </li>
                        <li class="grid grid-cols-[auto_1fr] gap-2">
                            <strong>MAD Score:</strong>
                            <span>A robust measure of how unusual your methylation level is</span>
                        </li>
                        <li class="grid grid-cols-[auto_1fr] gap-2">
                            <strong>Percentile:</strong>
                            <span>How your methylation compares to others in the population</span>
                        </li>
                    </ul>
                </div>
            {/if}
        </div>
    </div>
    <div class="p-6 space-y-8">
        <!-- Visualization -->
        <div class="relative">
            <!-- Labels -->
            {#each labelPositions as label}
                <div 
                    class="absolute text-gray-400 text-sm whitespace-nowrap transition-all"
                    style:left={`${label.pos * 100}%`}
                    style:transform="translateX(-50%)"
                    style:bottom="-20px"
                >
                    {label.text}
                </div>
            {/each}

            <!-- Bar -->
            <div class="relative h-24 w-full rounded-lg overflow-hidden border border-gray-700">
                <!-- IQR Background -->
                <div 
                    class="absolute inset-0"
                    style:background={iqrBackground}
                />
                
                <!-- Gaussian Background -->
                <div 
                    class="absolute inset-0"
                    style:background={gaussianGradient}
                />

                <!-- Quartile Lines -->
                {#each distributionMarkers as marker}
                    <div
                        class="absolute top-0 h-full"
                        style:left={`${marker.pos * 100}%`}
                    >
                        <div class="absolute h-full w-px bg-gray-600/50" />
                    </div>
                {/each}

                <!-- Mean Line -->
                <div 
                    class="absolute top-0 h-full"
                    style:left={`${metrics.population_distribution.median * 100}%`}
                >
                    <div class="absolute h-full w-0.5 bg-gradient-to-b from-gray-600 to-gray-500">
                        <div class="absolute inset-0 w-0.5 bg-gray-500/50 blur-[1px]" />
                    </div>
                </div>

                <!-- Your Value Marker -->
                <div 
                    class="absolute top-0 h-full"
                    style:left={`${metrics.value * 100}%`}
                >
                    <div class="absolute h-full w-0.5 bg-[#4CC9F0] shadow-[0_0_8px_rgba(76,201,240,0.3)]" />
                </div>
            </div>

            <!-- Axis Labels -->
            <div class="absolute top-[-18px] left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
            </div>
        </div>
        
        <!-- Metrics -->
        <div class="grid grid-cols-2 gap-x-12 gap-y-4">
            <div>
                <div class="text-gray-500 text-sm mb-1">Your Level</div>
                <div class="text-[#4CC9F0] text-2xl font-medium">
                    {(metrics.value * 100).toFixed(1)}%
                </div>
            </div>
            <div>
                <div class="text-gray-500 text-sm mb-1">Population</div>
                <div class="flex items-baseline gap-2">
                    <span class="text-white text-2xl font-medium">
                        {(metrics.population_distribution.median * 100).toFixed(1)}%
                    </span>
                    <span class="text-gray-400">
                        ± {(metrics.population_distribution.mad * 100).toFixed(1)}%
                    </span>
                </div>
            </div>
            <div>
                <div class="text-gray-500 text-sm mb-1">Median Absolute Deviation</div>
                <div class="text-white text-2xl font-medium flex items-baseline gap-2">
                    <span>{Math.abs(metrics.z_score).toFixed(1)}</span>
                    <span class="text-gray-400 text-base">
                        {direction === 'hyper' ? 'higher' : 'lower'}
                    </span>
                </div>
                <div class="text-gray-400 text-sm">
                    1 MAD = {(metrics.population_distribution.mad * 100).toFixed(1)}%
                </div>
            </div>
            <div>
                <div class="text-gray-500 text-sm mb-1">Percentile</div>
                <div class="text-white text-2xl font-medium">
                    {formattedPercentile}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .stats-tooltip {
        position: absolute;
        right: 0;
        top: 100%;
        margin-top: 0.5rem;
        background: var(--aeon-surface-0);
        border-radius: 0.75rem;
        padding: 0.75rem 1rem;
        width: max-content;
        max-width: 300px;
        font-size: 0.875rem;
        line-height: 1.4;
        color: var(--aeon-biolum);
        box-shadow: 0 0 0 1px rgba(76, 201, 240, 0.1),
                   0 4px 20px rgba(0, 0, 0, 0.4);
        z-index: 10;
    }

    .stats-tooltip::before {
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

    .stats-tooltip strong {
        color: white;
    }
</style> 