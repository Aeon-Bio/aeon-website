<script lang="ts">
    import { BookOpen } from 'lucide-svelte';
    import ResearchLinks from './ResearchLinks.svelte';
    
    export let evidence: {
        mechanisticInsights: string[];
        knowledgeBase: {
            biologicalContext: string[];
        };
    };
    export let studyIds: string[] = [];
</script>

<div class="molecular-context">
    <div class="content space-y-6">
        <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium flex items-center gap-2 text-white">
                <BookOpen class="h-4 w-4 text-aeon-primary" />
                Scientific Context
            </h4>
            {#if studyIds.length > 0}
                <div class="research-links">
                    <ResearchLinks {studyIds} />
                </div>
            {/if}
        </div>
        <div class="space-y-6">
            <div>
                <h5 class="text-sm font-medium text-aeon-biolum mb-2">Key Mechanisms</h5>
                <ul class="space-y-2">
                    {#each evidence.mechanisticInsights as insight}
                        <li class="text-sm text-gray-300 flex items-start gap-2">
                            <div class="w-1 h-1 rounded-full bg-aeon-primary mt-2 flex-shrink-0" />
                            {insight}
                        </li>
                    {/each}
                </ul>
            </div>
            
            <div>
                <h5 class="text-sm font-medium text-aeon-biolum mb-2">Biological Systems Involved</h5>
                <div class="flex flex-wrap gap-2">
                    {#each evidence.knowledgeBase.biologicalContext as ctx}
                        <span class="biological-tag">
                            {ctx}
                        </span>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .molecular-context {
        position: relative;
        padding: 1rem;
        border-radius: 0.75rem;
        background: var(--aeon-surface-0);
        backdrop-filter: blur(20px);
    }

    .molecular-context::before {
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

    .research-links :global(.research-btn) {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
    }

    .research-links :global(.research-btn svg) {
        width: 0.875rem;
        height: 0.875rem;
    }

    .biological-tag {
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
        border-radius: 9999px;
        background: rgba(26, 27, 47, 0.95);
        color: var(--aeon-primary);
        border: 1px solid rgba(76, 201, 240, 0.2);
    }
</style> 