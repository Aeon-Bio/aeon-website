<script lang="ts">
    import { Shield } from 'lucide-svelte';
    import StrengthBadge from './StrengthBadge.svelte';
    
    export let evidence: {
        strength: string;
        healthRelevance: string;
    };
</script>

<div class="molecular-evidence">
    <div class="content">
        <h4 class="font-medium flex items-center gap-2 mb-3 text-white">
            <Shield class="h-4 w-4 text-aeon-primary" />
            Evidence Assessment
        </h4>
        <div class="space-y-2">
            <div class="flex items-center gap-2">
                <StrengthBadge strength={evidence.strength} />
            </div>
            <p class="text-sm text-gray-300">
                {evidence.healthRelevance}
            </p>
        </div>
    </div>
</div>

<style>
    .molecular-evidence {
        position: relative;
        padding: 1rem;
        border-radius: 0.75rem;
        background: var(--aeon-surface-0);
        backdrop-filter: blur(20px);
    }

    .molecular-evidence::before {
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