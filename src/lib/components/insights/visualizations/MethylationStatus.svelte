<script lang="ts">
    import { BarChart } from 'lucide-svelte';
    import type { MethylationMetrics } from '../types';
    
    export let metrics: MethylationMetrics;
    export let direction: 'hyper' | 'hypo';
</script>

<div class="bg-aeon-surface-1 p-6 rounded-lg">
    <h4 class="font-medium text-white flex items-center gap-2 mb-6">
        <BarChart class="h-4 w-4 text-aeon-primary" />
        Methylation Status
    </h4>
    <div class="space-y-8">
        <!-- Visualization -->
        <div class="relative h-40 flex items-center">
            <!-- Labels and markers -->
            <div 
                class="absolute text-[#4CC9F0] text-sm"
                style:left={`${metrics.value * 100}%`}
                style:top="12px"
            >
                You
            </div>
            <div 
                class="absolute text-gray-400 text-sm"
                style:left={`${metrics.siteMedian * 100}%`}
                style:bottom="12px"
            >
                Median
            </div>

            <!-- Bar -->
            <div class="relative h-24 w-full rounded-lg overflow-hidden border border-gray-700 bg-gradient-to-r from-aeon-surface-0 to-aeon-surface-1">
                <!-- Grid -->
                <div class="absolute inset-0 grid grid-cols-4">
                    {#each Array(4) as _}
                        <div class="border-r border-gray-700/50 h-full" />
                    {/each}
                </div>

                <!-- Markers -->
                <div 
                    class="absolute top-0 h-full"
                    style:left={`${metrics.siteMedian * 100}%`}
                >
                    <div class="absolute h-full w-0.5 bg-gradient-to-b from-gray-600 to-gray-500">
                        <div class="absolute inset-0 w-0.5 bg-gray-500/50 blur-[1px]"></div>
                    </div>
                </div>
                
                <div 
                    class="absolute top-0 h-full"
                    style:left={`${metrics.value * 100}%`}
                >
                    <div class="absolute h-full w-0.5 bg-[#4CC9F0] shadow-[0_0_8px_rgba(76,201,240,0.3)]" />
                </div>
            </div>
        </div>
        
        <!-- Metrics -->
        <div class="grid grid-cols-2 gap-x-12 gap-y-8">
            <div>
                <div class="text-gray-500 text-sm mb-1">Your Methylation Level</div>
                <div class="text-[#4CC9F0] text-2xl font-medium">
                    {(metrics.value * 100).toFixed(1)}%
                </div>
            </div>
            <div>
                <div class="text-gray-500 text-sm mb-1">Population Median</div>
                <div class="text-white text-2xl font-medium">
                    {(metrics.siteMedian * 100).toFixed(1)}%
                </div>
            </div>
            <div>
                <div class="text-gray-500 text-sm mb-1">Statistical Significance</div>
                <div class="text-white text-2xl font-medium">
                    {Math.abs(metrics.zScore.toFixed(1))} σ {direction === 'hyper' ? 'higher' : 'lower'}
                </div>
            </div>
            <div>
                <div class="text-gray-500 text-sm mb-1">Population Percentile</div>
                <div class="text-white text-2xl font-medium">
                    {metrics.percentile}th
                </div>
            </div>
        </div>
    </div>
</div> 