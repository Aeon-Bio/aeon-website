<script lang="ts">
    import StrengthBadge from './StrengthBadge.svelte';
    import { Target } from 'lucide-svelte';
    import { onMount } from 'svelte';

    export let recommendation: any; // TODO: Add proper typing
    
    let Icon: any = Target;
    
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
    <div class="content space-y-2">
        <div class="flex items-start gap-4">
            <div class="flex items-start gap-2">
                <svelte:component this={Icon} class="h-5 w-5 text-aeon-primary flex-shrink-0" />
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <p class="text-white font-medium">
                            {recommendation.recommendation}
                        </p>
                        <StrengthBadge strength={recommendation.strength} />
                    </div>
                    <p class="text-sm text-gray-300">
                        {recommendation.rationale}
                    </p>
                    
                    {#if recommendation.specificActions?.length}
                        <div class="text-xs text-gray-400 space-y-1 mt-3 ml-0">
                            {#each recommendation.specificActions as action}
                                <div class="flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-aeon-primary" />
                                    {action}
                                </div>
                            {/each}
                        </div>
                    {/if}
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
</style> 